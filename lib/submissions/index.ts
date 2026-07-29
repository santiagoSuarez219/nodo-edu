import { createServerSupabaseClient } from "@/lib/auth/server";
import { fetchStudentProfilesPublic } from "@/lib/enrollments";
import type {
  Answer,
  AnswerForReview,
  QuestionDetail,
  Submission,
  SubmissionForReview,
  SubmissionWithAnswers,
} from "./types";

// Cualquier tipo distinto de multiple_choice es "abierto" para efectos de
// calificación manual — mismo criterio que submitSubmission ya usa para
// auto_score (ausencia en get_variant_answer_key, que solo cubre
// multiple_choice). code_snippet no estaba en la lista original de
// spec-020 (ajuste de scope aprobado tras encontrar el caso real en G2,
// fixture de test-019).
const OPEN_QUESTION_TYPES = new Set(["open_text", "code_snippet", "code_write", "coding_challenge"]);

type ReviewContextRow = {
  assignment_question_id: string;
  type: string;
  stem: string;
  code_snippet: string | null;
  code_language: string | null;
  points: number;
  choices: { id: string; body: string; is_correct: boolean }[];
  rubric: {
    criteria: { label: string; points: number; description: string }[];
    max_score: number;
  } | null;
};

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function createSubmission(
  assignmentId: string,
  variantGroupId: string,
  enrollmentId: string
): Promise<{ ok: true; data: Submission } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: group } = await supabase
    .from("assignment_variant_groups")
    .select("max_attempts, opens_at, closes_at, is_published")
    .eq("id", variantGroupId)
    .single();

  if (!group || !group.is_published) {
    return { ok: false, error: "La evaluación no está disponible." };
  }

  const now = new Date().toISOString();
  if (group.opens_at && group.opens_at > now) {
    return { ok: false, error: "La evaluación aún no está abierta." };
  }
  if (group.closes_at && group.closes_at < now) {
    return { ok: false, error: "La evaluación ya está cerrada." };
  }

  // Recuperar un intento en progreso SIEMPRE tiene prioridad sobre el conteo de
  // max_attempts: reabrir la misma evaluación no es un intento nuevo. Revertir
  // este orden (contar y bloquear antes de buscar el in_progress) rechaza con
  // "sin intentos disponibles" al propio intento que se está recuperando en
  // cuanto max_attempts=1, que es exactamente el caso normal de reabrir.
  const { data: existing } = await supabase
    .from("submissions")
    .select("*")
    .eq("variant_group_id", variantGroupId)
    .eq("enrollment_id", enrollmentId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) return { ok: true, data: existing };

  const { count: attemptCount } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("variant_group_id", variantGroupId)
    .eq("enrollment_id", enrollmentId);

  const usedAttempts = attemptCount ?? 0;
  if (usedAttempts >= group.max_attempts) {
    return {
      ok: false,
      error: "Has alcanzado el número máximo de intentos para esta evaluación.",
    };
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      assignment_id: assignmentId,
      variant_group_id: variantGroupId,
      enrollment_id: enrollmentId,
      attempt_number: usedAttempts + 1,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data };
}

export async function saveAnswer(
  submissionId: string,
  questionId: string,
  assignmentQuestionId: string,
  response: { selected_choice_ids?: string[]; text_response?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("answers").upsert(
    {
      submission_id: submissionId,
      question_id: questionId,
      assignment_question_id: assignmentQuestionId,
      selected_choice_ids: response.selected_choice_ids ?? [],
      text_response: response.text_response ?? null,
    },
    { onConflict: "submission_id,question_id" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Contenido de las preguntas de la variante para renderizar (jugador y
// resultados). `choices[].is_correct` viene ya gateado por show_feedback_on
// desde la RPC (ver 20260724000002_variant_question_content_rpcs.sql) — nunca
// se calcula aquí ni se le pasa un flag de "revelar" a la función.
export async function getVariantQuestionDetails(
  assignmentId: string,
  enrollmentId: string
): Promise<QuestionDetail[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_variant_question_details", {
    p_assignment_id: assignmentId,
    p_enrollment_id: enrollmentId,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as QuestionDetail[];
}

export async function submitSubmission(
  submissionId: string
): Promise<{ ok: true; auto_score: number } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, assignment_id, variant_group_id, enrollment_id, status")
    .eq("id", submissionId)
    .single();

  if (!submission || submission.status !== "in_progress") {
    return { ok: false, error: "El intento no está en progreso." };
  }

  const { data: answers } = await supabase
    .from("answers")
    .select("id, question_id, selected_choice_ids, assignment_question:assignment_questions(points)")
    .eq("submission_id", submissionId);

  const { data: variantQuestions } = await supabase
    .from("assignment_questions")
    .select("question_id")
    .eq("assignment_id", submission.assignment_id);

  // get_variant_answer_key solo devuelve preguntas multiple_choice (ver
  // migración de la RPC); su ausencia en el mapa marca una pregunta como
  // abierta (open_text/code_write/coding_challenge), sin necesidad de leer
  // `questions.type` con el cliente de sesión (bloqueado por RLS si la
  // pregunta es un borrador del docente — ver Fase 1).
  const { data: answerKeyRows } = await supabase.rpc("get_variant_answer_key", {
    p_assignment_id: submission.assignment_id,
    p_enrollment_id: submission.enrollment_id,
  });
  const answerKey = new Map<string, Set<string>>(
    (answerKeyRows ?? []).map((row: { question_id: string; correct_choice_ids: string[] }) => [
      row.question_id,
      new Set(row.correct_choice_ids ?? []),
    ])
  );

  let autoScore = 0;
  const answerUpdates: { id: string; is_correct: boolean; auto_score: number }[] = [];

  for (const answer of answers ?? []) {
    const aq = answer.assignment_question as unknown as { points: number } | null;
    const correctIds = answerKey.get(answer.question_id);
    if (!correctIds) continue;

    const selectedIds = new Set(answer.selected_choice_ids as string[]);
    const isCorrect =
      correctIds.size === selectedIds.size &&
      [...correctIds].every((id) => selectedIds.has(id));

    const score = isCorrect ? (aq?.points ?? 0) : 0;
    autoScore += score;
    answerUpdates.push({ id: answer.id, is_correct: isCorrect, auto_score: score });
  }

  if (answerUpdates.length > 0) {
    await Promise.all(
      answerUpdates.map(({ id, is_correct, auto_score }) =>
        supabase.from("answers").update({ is_correct, auto_score }).eq("id", id)
      )
    );
  }

  const roundedScore = Math.round(autoScore * 100) / 100;

  await supabase
    .from("submissions")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      auto_score: roundedScore,
    })
    .eq("id", submissionId);

  const hasOpenQuestions = (variantQuestions ?? []).some(
    (vq) => !answerKey.has(vq.question_id)
  );

  if (!hasOpenQuestions) {
    await propagateToGradeItem(supabase, submissionId);
    await supabase
      .from("submissions")
      .update({ status: "graded", final_score: roundedScore, graded_at: new Date().toISOString() })
      .eq("id", submissionId);
  }

  return { ok: true, auto_score: roundedScore };
}

// Respuestas guardadas de un intento por su propio id — para releer el estado
// de un intento del que ya se tiene la fila `Submission` (p. ej. el valor de
// retorno de `createSubmission`), sin depender de un segundo lookup por
// `variant_group_id + enrollment_id` justo después de un insert/upsert.
export async function getAnswersBySubmission(submissionId: string): Promise<Answer[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("answers")
    .select("*")
    .eq("submission_id", submissionId);

  return (data as Answer[]) ?? [];
}

export async function getSubmissionByStudent(
  variantGroupId: string,
  enrollmentId: string
): Promise<SubmissionWithAnswers | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("submissions")
    .select("*, answers(*)")
    .eq("variant_group_id", variantGroupId)
    .eq("enrollment_id", enrollmentId)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return { ...data, answers: (data.answers as Answer[]) ?? [] };
}

// Todos los envíos de una evaluación, a través de sus 3 variantes (spec-020
// indexa la revisión por grupo, no por variante — ver spec-020 "Alineación
// con spec-019").
export async function getSubmissionsByGroup(
  variantGroupId: string
): Promise<SubmissionWithAnswers[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("submissions")
    .select("*, answers(*), enrollment:enrollments(student_id)")
    .eq("variant_group_id", variantGroupId)
    .order("started_at", { ascending: false });

  const rows = data ?? [];
  const studentIds = rows
    .map((row) => (row.enrollment as unknown as { student_id: string } | null)?.student_id)
    .filter((id): id is string => Boolean(id));
  const profiles = await fetchStudentProfilesPublic(supabase, studentIds);

  return rows.map((row) => {
    const enrollment = row.enrollment as unknown as { student_id: string } | null;
    return {
      ...(row as unknown as Submission),
      answers: (row.answers as Answer[]) ?? [],
      student_name: enrollment ? profiles.get(enrollment.student_id)?.full_name : undefined,
    };
  });
}

// Carga el contenido de cada pregunta de la asignación del envío (incluida la
// rúbrica) vía RPC security-definer: la política RLS de `questions` ("select
// own or published") bloquearía preguntas en borrador de otro docente, y
// nada impide usar una pregunta en borrador dentro de una asignación (ver
// spec-020 "Ajuste de scope"). La RPC autoriza al docente dueño del curso.
async function getReviewContextByAssignmentQuestionId(
  supabase: SupabaseClient,
  submissionId: string
): Promise<Map<string, ReviewContextRow>> {
  const { data } = await supabase.rpc("get_submission_review_context", {
    p_submission_id: submissionId,
  });

  return new Map(
    ((data ?? []) as ReviewContextRow[]).map((row) => [row.assignment_question_id, row])
  );
}

export async function getSubmissionForReview(
  submissionId: string
): Promise<SubmissionForReview | null> {
  const supabase = await createServerSupabaseClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*, answers(*), enrollment:enrollments(student_id)")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) return null;

  const enrollment = submission.enrollment as unknown as { student_id: string } | null;
  const profiles = enrollment
    ? await fetchStudentProfilesPublic(supabase, [enrollment.student_id])
    : new Map<string, { id: string; full_name: string }>();
  const studentName = enrollment ? (profiles.get(enrollment.student_id)?.full_name ?? "") : "";

  const contextByAssignmentQuestionId = await getReviewContextByAssignmentQuestionId(
    supabase,
    submissionId
  );

  const answers: AnswerForReview[] = ((submission.answers as Answer[]) ?? []).map((answer) => {
    const ctx = contextByAssignmentQuestionId.get(answer.assignment_question_id);
    return {
      ...answer,
      question_type: ctx?.type ?? "",
      question_stem: ctx?.stem ?? "",
      question_code_snippet: ctx?.code_snippet ?? null,
      question_code_language: ctx?.code_language ?? null,
      question_choices: ctx?.choices ?? [],
      question_rubric: ctx?.rubric ?? null,
      max_points: ctx?.points ?? 5,
    };
  });

  return {
    ...(submission as unknown as Submission),
    student_name: studentName,
    answers,
  };
}

export async function gradeAnswer(
  answerId: string,
  score: number,
  notes: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: answer } = await supabase
    .from("answers")
    .select("assignment_question:assignment_questions(points)")
    .eq("id", answerId)
    .maybeSingle();

  // Sin esta respuesta (o sin acceso vía RLS a "owner_sees_own_answers"), no
  // hay nada que calificar — se rechaza aquí en vez de caer en un fallback de
  // puntos que validaría contra un máximo arbitrario.
  if (!answer) {
    return { ok: false, error: "No se encontró la respuesta o no tienes acceso a ella." };
  }

  const points = (answer.assignment_question as unknown as { points: number } | null)?.points ?? 5;

  if (score < 0 || score > points) {
    return { ok: false, error: `El puntaje debe estar entre 0 y ${points}.` };
  }

  // RLS puede aceptar el UPDATE sin `error` pero afectar 0 filas (docente sin
  // acceso al curso de esta respuesta) — .select().maybeSingle() distingue
  // ese caso de un guardado real, evitando un falso "ok: true".
  const { data: updated, error } = await supabase
    .from("answers")
    .update({
      manual_score: score,
      reviewer_notes: notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", answerId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!updated) return { ok: false, error: "No tienes acceso a esta respuesta." };
  return { ok: true };
}

export async function finalizeGrading(
  submissionId: string
): Promise<{ ok: true; final_score: number } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, assignment_id, enrollment_id, variant_group_id, status, answers(*)")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) {
    return { ok: false, error: "No se encontró el envío o no tienes acceso a él." };
  }
  if (submission.status !== "submitted") {
    return { ok: false, error: "El envío no está pendiente de revisión." };
  }

  const contextByAssignmentQuestionId = await getReviewContextByAssignmentQuestionId(
    supabase,
    submissionId
  );

  const answers = (submission.answers as Answer[]) ?? [];
  let finalScore = 0;
  for (const answer of answers) {
    const type = contextByAssignmentQuestionId.get(answer.assignment_question_id)?.type ?? "";
    finalScore += OPEN_QUESTION_TYPES.has(type)
      ? (answer.manual_score ?? 0)
      : (answer.auto_score ?? 0);
  }
  const roundedScore = Math.round(finalScore * 100) / 100;

  const { data: updated, error } = await supabase
    .from("submissions")
    .update({ status: "graded", final_score: roundedScore, graded_at: new Date().toISOString() })
    .eq("id", submissionId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!updated) return { ok: false, error: "No tienes acceso a este envío." };

  const propagation = await propagateFinalScoreToGradeItem(
    supabase,
    submission.assignment_id,
    submission.variant_group_id,
    submission.enrollment_id,
    roundedScore
  );
  if (!propagation.ok) {
    return {
      ok: false,
      error: `La calificación se guardó, pero no se pudo actualizar la libreta de calificaciones: ${propagation.error}`,
    };
  }

  return { ok: true, final_score: roundedScore };
}

// ─── helpers ─────────────────────────────────────────────────────────────────

// `assignment_questions.points` solo limita el puntaje POR pregunta (máx. 5,
// ver migración de assignment_variant_groups) — la suma de una variante con
// varias preguntas puede superar 5 con facilidad, mientras que
// `student_grades.score` exige la escala 0-5 que usa el resto de la libreta
// (notas manuales incluidas, ver lib/grades/index.ts). Sin esta normalización
// el upsert de abajo viola ese CHECK y fallaba en silencio (bug real
// encontrado en TC-011 de test-020: G2 suma 6 puntos).
async function getMaxPossiblePoints(supabase: SupabaseClient, assignmentId: string): Promise<number> {
  const { data } = await supabase
    .from("assignment_questions")
    .select("points")
    .eq("assignment_id", assignmentId);

  return (data ?? []).reduce((sum, row) => sum + Number(row.points), 0);
}

// A diferencia de `propagateToGradeItem` (usada por el cierre automático del
// estudiante, que corre bajo su sesión y necesita el RPC `security definer`
// porque RLS le bloquea el insert/update directo), `finalizeGrading` corre
// bajo la sesión del DOCENTE: la política "student_grades: insert/update
// teacher or admin" ya lo autoriza a hacer el upsert directo.
async function propagateFinalScoreToGradeItem(
  supabase: SupabaseClient,
  assignmentId: string,
  variantGroupId: string,
  enrollmentId: string,
  finalScore: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: group } = await supabase
    .from("assignment_variant_groups")
    .select("grade_item_id")
    .eq("id", variantGroupId)
    .maybeSingle();

  if (!group?.grade_item_id) return { ok: true };

  const maxPoints = await getMaxPossiblePoints(supabase, assignmentId);
  const normalizedScore = maxPoints > 0 ? Math.round((finalScore / maxPoints) * 5 * 100) / 100 : 0;

  const { error } = await supabase.from("student_grades").upsert(
    { enrollment_id: enrollmentId, grade_item_id: group.grade_item_id, score: normalizedScore },
    { onConflict: "enrollment_id,grade_item_id" }
  );

  if (error) {
    console.error("propagateFinalScoreToGradeItem failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// RLS de student_grades solo permite insert/update al docente dueño del curso
// ("student_grades: insert/update teacher or admin"). Este cierre a graded lo
// dispara el propio estudiante (submitSubmission corre bajo su cliente de
// sesión), así que un upsert directo aquí queda bloqueado por RLS. La RPC lee
// el puntaje de submissions.auto_score (ya persistido antes de esta llamada)
// en vez de aceptarlo como parámetro, para que no sea posible propagar un
// puntaje arbitrario llamando la función directo vía la API REST.
async function propagateToGradeItem(
  supabase: SupabaseClient,
  submissionId: string
): Promise<void> {
  const { error } = await supabase.rpc("propagate_submission_grade", {
    p_submission_id: submissionId,
  });

  if (error) {
    console.error("propagate_submission_grade failed:", error.message);
  }
}
