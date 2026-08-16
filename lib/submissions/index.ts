import { createServerSupabaseClient } from "@/lib/auth/server";
import { seededShuffle } from "@/lib/shuffle";
import { fetchStudentProfilesPublic } from "@/lib/enrollments";
import type {
  Answer,
  AnswerForReview,
  QuestionDetail,
  Submission,
  SubmissionFailure,
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
): Promise<{ ok: true; data: Submission } | SubmissionFailure> {
  const supabase = await createServerSupabaseClient();

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("max_attempts, opens_at, closes_at, is_published")
    .eq("id", variantGroupId)
    .single();

  // .single() devuelve error también cuando hay 0 filas (PGRST116) — un grupo
  // genuinamente inexistente u oculto por RLS. Reportar eso como "unavailable"
  // sería el mismo error simétrico que este spec corrige: mentir "no pude
  // consultar" cuando en realidad "no existe" (hallazgo de @reviewer,
  // spec-050 Fase 6).
  if (groupError && groupError.code !== "PGRST116") {
    return {
      ok: false,
      error: "No pudimos verificar la evaluación. Intenta de nuevo en un momento.",
      reason: "unavailable",
    };
  }
  if (!group || !group.is_published) {
    return { ok: false, error: "La evaluación no está disponible.", reason: "business" };
  }

  const now = new Date().toISOString();
  if (group.opens_at && group.opens_at > now) {
    return { ok: false, error: "La evaluación aún no está abierta.", reason: "business" };
  }
  if (group.closes_at && group.closes_at < now) {
    return { ok: false, error: "La evaluación ya está cerrada.", reason: "business" };
  }

  // Recuperar un intento en progreso SIEMPRE tiene prioridad sobre el conteo de
  // max_attempts: reabrir la misma evaluación no es un intento nuevo. Revertir
  // este orden (contar y bloquear antes de buscar el in_progress) rechaza con
  // "sin intentos disponibles" al propio intento que se está recuperando en
  // cuanto max_attempts=1, que es exactamente el caso normal de reabrir.
  const { data: existing, error: existingError } = await supabase
    .from("submissions")
    .select("*")
    .eq("variant_group_id", variantGroupId)
    .eq("enrollment_id", enrollmentId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      error: "No pudimos verificar tus intentos anteriores. Intenta de nuevo en un momento.",
      reason: "unavailable",
    };
  }
  if (existing) return { ok: true, data: existing };

  // D3: ante un fallo de conteo, se falla cerrado en vez de asumir 0 —
  // bloquear temporalmente a un estudiante legítimo es molesto y reversible;
  // concederle un intento extra en una evaluación calificable no lo es, y
  // además es invisible.
  const { count: attemptCount, error: countError } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("variant_group_id", variantGroupId)
    .eq("enrollment_id", enrollmentId);

  if (countError) {
    return {
      ok: false,
      error: "No pudimos verificar tus intentos anteriores. Intenta de nuevo en un momento.",
      reason: "unavailable",
    };
  }

  const usedAttempts = attemptCount ?? 0;
  if (usedAttempts >= group.max_attempts) {
    return {
      ok: false,
      error: "Has alcanzado el número máximo de intentos para esta evaluación.",
      reason: "business",
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

  if (error) return { ok: false, error: error.message, reason: "unavailable" };
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
//
// El barajado de preguntas y opciones respeta los flags shuffle_questions y
// shuffle_choices del grupo (spec-035). La semilla es determinista por
// (enrollmentId, assignmentId/questionId), estable entre recargas dentro del
// mismo intento. NO es una garantía criptográfica: mitiga copieteo por vecindad
// ("mira la pantalla de al lado"), no a un atacante con devtools que invoque
// la RPC directa para obtener el orden canónico.
export async function getVariantQuestionDetails(
  assignmentId: string,
  enrollmentId: string,
  groupId: string
): Promise<QuestionDetail[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_variant_question_details", {
    p_assignment_id: assignmentId,
    p_enrollment_id: enrollmentId,
  });

  if (error) throw new Error(error.message);
  const questions = (data ?? []) as QuestionDetail[];

  // Leer los flags de barajado del grupo
  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("shuffle_questions, shuffle_choices")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError) {
    console.error("getVariantQuestionDetails: failed to read group flags:", groupError.message);
    return questions;
  }

  if (!group) {
    console.error("getVariantQuestionDetails: group not found:", groupId);
    return questions;
  }

  let result = questions;

  // Barajar opciones de cada pregunta si está habilitado
  if (group.shuffle_choices) {
    result = result.map((q) => ({
      ...q,
      choices: seededShuffle(q.choices ?? [], `assignment-choices:${enrollmentId}:${q.question_id}`),
    }));
  }

  // Barajar preguntas si está habilitado
  if (group.shuffle_questions) {
    result = seededShuffle(result, `assignment-questions:${enrollmentId}:${assignmentId}`);
  }

  return result;
}

export async function submitSubmission(
  submissionId: string
): Promise<{ ok: true; auto_score: number } | SubmissionFailure> {
  const supabase = await createServerSupabaseClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, assignment_id, variant_group_id, enrollment_id, status")
    .eq("id", submissionId)
    .single();

  // Mismo criterio que en createSubmission: PGRST116 (0 filas) es "no existe
  // / sin acceso", no un fallo de infraestructura — reportarlo como
  // "unavailable" mentiría en la dirección opuesta a la que corrige este
  // spec (hallazgo de @reviewer, spec-050 Fase 6).
  if (submissionError && submissionError.code !== "PGRST116") {
    return {
      ok: false,
      error: "No pudimos verificar tu intento. Intenta de nuevo en un momento.",
      reason: "unavailable",
    };
  }
  if (!submission || submission.status !== "in_progress") {
    return { ok: false, error: "El intento no está en progreso.", reason: "business" };
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("id, question_id, selected_choice_ids, assignment_question:assignment_questions(points)")
    .eq("submission_id", submissionId);

  const { data: variantQuestions, error: variantQuestionsError } = await supabase
    .from("assignment_questions")
    .select("question_id")
    .eq("assignment_id", submission.assignment_id);

  // get_variant_answer_key solo devuelve preguntas multiple_choice (ver
  // migración de la RPC); su ausencia en el mapa marca una pregunta como
  // abierta (open_text/code_write/coding_challenge), sin necesidad de leer
  // `questions.type` con el cliente de sesión (bloqueado por RLS si la
  // pregunta es un borrador del docente — ver Fase 1).
  const { data: answerKeyRows, error: answerKeyError } = await supabase.rpc("get_variant_answer_key", {
    p_assignment_id: submission.assignment_id,
    p_enrollment_id: submission.enrollment_id,
  });

  // D1 (spec-050): ante un fallo de CUALQUIERA de las tres lecturas, se
  // aborta ANTES de cualquier `update`. El intento queda `in_progress` y el
  // estudiante puede reintentar — un intento reintentable es recuperable,
  // una nota falsa en la libreta no.
  if (answersError || variantQuestionsError || answerKeyError) {
    console.error("submitSubmission: fallo al leer respuestas/preguntas/clave:", {
      answersError: answersError?.message,
      variantQuestionsError: variantQuestionsError?.message,
      answerKeyError: answerKeyError?.message,
    });
    return {
      ok: false,
      error: "No pudimos registrar tu envío. Tus respuestas siguen guardadas — intenta de nuevo en un momento.",
      reason: "unavailable",
    };
  }

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
    const updateResults = await Promise.all(
      answerUpdates.map(({ id, is_correct, auto_score }) =>
        supabase.from("answers").update({ is_correct, auto_score }).eq("id", id)
      )
    );
    if (updateResults.some((r) => r.error)) {
      console.error("submitSubmission: fallo al guardar la corrección de una o más respuestas");
      return {
        ok: false,
        error: "No pudimos registrar tu envío. Tus respuestas siguen guardadas — intenta de nuevo en un momento.",
        reason: "unavailable",
      };
    }
  }

  const roundedScore = Math.round(autoScore * 100) / 100;

  const { error: submitUpdateError } = await supabase
    .from("submissions")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      auto_score: roundedScore,
    })
    .eq("id", submissionId);

  if (submitUpdateError) {
    return {
      ok: false,
      error: "No pudimos registrar tu envío. Tus respuestas siguen guardadas — intenta de nuevo en un momento.",
      reason: "unavailable",
    };
  }

  // D2: `hasOpenQuestions` solo se calcula sobre lecturas que ya se
  // confirmaron exitosas arriba — una lista vacía por error de red y una
  // variante sin preguntas abiertas dejan de ser el mismo valor.
  const hasOpenQuestions = (variantQuestions ?? []).some(
    (vq) => !answerKey.has(vq.question_id)
  );

  if (!hasOpenQuestions) {
    // El envío ya quedó guardado como 'submitted' con un auto_score real
    // (arriba) — lo que sigue es solo la transición a 'graded' y la
    // propagación a la libreta. No hay ningún puntaje falso en juego (el
    // auto_score ya escrito es el correcto) pase lo que pase de aquí en
    // adelante.
    //
    // Orden importante (hallazgo de @reviewer, spec-050 Fase 6): la
    // propagación se intenta ANTES de la transición a 'graded', y si falla
    // el envío se queda en 'submitted' — NO se avanza a 'graded'. La
    // versión anterior hacía ambas cosas sin condicionar una a la otra: el
    // envío pasaba a 'graded' aunque la propagación fallara, y como
    // finalizeGrading rechaza cualquier envío que no esté en 'submitted'
    // ("El envío no está pendiente de revisión."), esa promesa de
    // recuperación era falsa — el envío quedaba con una nota real pero sin
    // fila en student_grades, sin ninguna vía para corregirlo salvo tocar
    // la base directamente. Con el fallo detectado a tiempo, el envío
    // sigue siendo un 'submitted' normal: un reintento futuro de este mismo
    // flujo (o una limpieza manual) puede volver a intentar la propagación.
    const propagation = await propagateToGradeItem(supabase, submissionId);

    if (!propagation.ok) {
      console.error(
        "submitSubmission: no se pudo propagar la nota a la libreta; el envío se queda en 'submitted':",
        propagation.error
      );
    } else {
      const { error: gradedUpdateError } = await supabase
        .from("submissions")
        .update({ status: "graded", final_score: roundedScore, graded_at: new Date().toISOString() })
        .eq("id", submissionId);

      if (gradedUpdateError) {
        console.error(
          "submitSubmission: la propagación a la libreta sí funcionó pero no se pudo cerrar el envío a graded; queda en 'submitted':",
          gradedUpdateError.message
        );
      }
    }
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
// spec-050: el resultado distingue "mapa vacío" (la RPC no encontró contexto)
// de "no pude leer" (la RPC falló) — antes ambos colapsaban al mismo Map
// vacío, y en finalizeGrading un Map vacío hace que ninguna pregunta entre en
// OPEN_QUESTION_TYPES, sumando auto_score en vez de manual_score: las notas
// que el docente acaba de poner a mano se ignoraban en silencio.
async function getReviewContextByAssignmentQuestionId(
  supabase: SupabaseClient,
  submissionId: string
): Promise<{ ok: true; data: Map<string, ReviewContextRow> } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc("get_submission_review_context", {
    p_submission_id: submissionId,
  });

  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    data: new Map(
      ((data ?? []) as ReviewContextRow[]).map((row) => [row.assignment_question_id, row])
    ),
  };
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

  // Fuera del endurecimiento de spec-050 (esta función no está en su
  // alcance): ante un fallo se degrada al mismo Map vacío que ya se
  // comportaba antes del spec — la vista de revisión no escribe ninguna
  // nota, solo la muestra.
  const contextResult = await getReviewContextByAssignmentQuestionId(supabase, submissionId);
  const contextByAssignmentQuestionId = contextResult.ok
    ? contextResult.data
    : new Map<string, ReviewContextRow>();

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
): Promise<{ ok: true; final_score: number } | SubmissionFailure> {
  const supabase = await createServerSupabaseClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, assignment_id, enrollment_id, variant_group_id, status, answers(*)")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    return {
      ok: false,
      error: "No se pudo verificar el envío. Intenta de nuevo en un momento.",
      reason: "unavailable",
    };
  }
  if (!submission) {
    return { ok: false, error: "No se encontró el envío o no tienes acceso a él.", reason: "business" };
  }
  if (submission.status !== "submitted") {
    return { ok: false, error: "El envío no está pendiente de revisión.", reason: "business" };
  }

  // D1 aplicado al camino del docente: si no se puede leer el contexto de
  // revisión, se aborta ANTES de calcular nada — sin este resultado, un Map
  // vacío hace que ninguna pregunta entre en OPEN_QUESTION_TYPES y el bucle
  // de abajo sumaría auto_score en vez de manual_score, ignorando en
  // silencio las notas que el docente acaba de poner a mano.
  const contextResult = await getReviewContextByAssignmentQuestionId(supabase, submissionId);
  if (!contextResult.ok) {
    return {
      ok: false,
      error:
        "No pudimos verificar el contexto de revisión. Intenta de nuevo — tus calificaciones manuales ya guardadas no se perdieron.",
      reason: "unavailable",
    };
  }
  const contextByAssignmentQuestionId = contextResult.data;

  const answers = (submission.answers as Answer[]) ?? [];
  let finalScore = 0;
  for (const answer of answers) {
    const type = contextByAssignmentQuestionId.get(answer.assignment_question_id)?.type ?? "";
    finalScore += OPEN_QUESTION_TYPES.has(type)
      ? (answer.manual_score ?? 0)
      : (answer.auto_score ?? 0);
  }
  const roundedScore = Math.round(finalScore * 100) / 100;

  // Mismo orden que submitSubmission (hallazgo de @reviewer, spec-050 Fase 6,
  // 2ª pasada): propagar ANTES de marcar `graded`, no después. La versión
  // anterior escribía `status: 'graded'` primero y, si la propagación
  // fallaba, devolvía un error — pero el envío ya había quedado `graded` sin
  // fila en la libreta y sin ninguna vía de recuperación, porque este mismo
  // guard de arriba (`submission.status !== "submitted"`) rechaza cualquier
  // reintento. Con la propagación primero, un fallo deja el envío tal como
  // estaba (`submitted`, sin `final_score` escrito) — recuperable con un
  // reintento normal de "Finalizar calificación".
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
      error: `No pudimos actualizar la libreta de calificaciones. Intenta de nuevo — tus calificaciones manuales ya guardadas no se perdieron: ${propagation.error}`,
      reason: "unavailable",
    };
  }

  const { data: updated, error } = await supabase
    .from("submissions")
    .update({ status: "graded", final_score: roundedScore, graded_at: new Date().toISOString() })
    .eq("id", submissionId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message, reason: "unavailable" };
  if (!updated) return { ok: false, error: "No tienes acceso a este envío.", reason: "business" };

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
// spec-050: distingue "no hay preguntas con puntos" (0 legítimo) de "no pude
// leer" — antes ambos devolvían 0, y propagateFinalScoreToGradeItem
// convertía un fallo de lectura en normalizedScore = 0, otro cero propagado
// a la libreta como nota real.
async function getMaxPossiblePoints(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<{ ok: true; data: number } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from("assignment_questions")
    .select("points")
    .eq("assignment_id", assignmentId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []).reduce((sum, row) => sum + Number(row.points), 0) };
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
  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("grade_item_id")
    .eq("id", variantGroupId)
    .maybeSingle();

  // Antes, un fallo de lectura aquí se leía igual que "este grupo no tiene
  // ítem de calificación configurado" y la función devolvía {ok:true} sin
  // propagar nada — un fallo de infraestructura reportado como éxito.
  if (groupError) {
    return { ok: false, error: "No se pudo verificar el ítem de calificación." };
  }
  if (!group?.grade_item_id) return { ok: true };

  const maxPointsResult = await getMaxPossiblePoints(supabase, assignmentId);
  if (!maxPointsResult.ok) {
    return { ok: false, error: "No se pudo calcular el puntaje máximo de la evaluación." };
  }
  const maxPoints = maxPointsResult.data;
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
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.rpc("propagate_submission_grade", {
    p_submission_id: submissionId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
