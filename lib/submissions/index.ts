import { createServerSupabaseClient } from "@/lib/auth/server";
import { fetchStudentProfilesPublic } from "@/lib/enrollments";
import type { Answer, QuestionDetail, Submission, SubmissionWithAnswers } from "./types";

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

// ─── helpers ─────────────────────────────────────────────────────────────────

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
