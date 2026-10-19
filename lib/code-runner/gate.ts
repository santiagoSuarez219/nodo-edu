import { createServerSupabaseClient } from "@/lib/auth/server";
import { createServiceSupabaseClient } from "@/lib/auth/service";
import { MAX_VISIBLE_CASES } from "./config";
import { resolveRunnerLanguage, type RunnerLanguage } from "./languages";
import type { RejectionReason, VisibleTestCase } from "./types";

// spec-058 (D3, D4) — gate de autorización y lectura de los casos visibles.
// El service role vive SOLO aquí, y solo después de comprobar con la sesión del
// invocante que el intento es suyo.

const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  not_in_progress: "Este intento ya no admite ejecuciones.",
  window_closed: "La evaluación ya cerró; no se puede ejecutar código.",
  not_owner: "No puedes ejecutar código en este intento.",
  question_not_in_variant: "Esta pregunta no pertenece a tu evaluación.",
  not_coding_challenge: "Esta pregunta no es de programación.",
  unsupported_language: "Esta pregunta usa un lenguaje que todavía no se puede ejecutar.",
  code_too_large: "El código es demasiado largo para ejecutarse.",
  rate_limited: "Alcanzaste el límite de ejecuciones para esta pregunta.",
  empty_code: "Escribe tu código antes de ejecutarlo.",
};

export function rejectionMessage(reason: RejectionReason): string {
  return REJECTION_MESSAGES[reason];
}

export type GateResult =
  | { ok: false; reason: RejectionReason }
  | {
      ok: true;
      language: RunnerLanguage;
      tests: VisibleTestCase[];
      testsTruncated: boolean;
    };

export async function checkChallengeAccess(
  userId: string,
  submissionId: string,
  questionId: string
): Promise<GateResult> {
  const session = await createServerSupabaseClient();

  // La RLS de `submissions` ya limita la fila a quien puede verla; además se
  // exige que el intento sea del propio invocante, porque un docente también
  // puede leer entregas de su curso y no debe gastar ejecuciones por otro.
  const { data: submission, error: submissionError } = await session
    .from("submissions")
    .select("id, assignment_id, variant_group_id, enrollment_id, status, started_at")
    .eq("id", submissionId)
    .maybeSingle();
  if (submissionError) throw submissionError;
  if (!submission) return { ok: false, reason: "not_owner" };

  const { data: enrollment, error: enrollmentError } = await session
    .from("enrollments")
    .select("student_id")
    .eq("id", submission.enrollment_id)
    .maybeSingle();
  if (enrollmentError) throw enrollmentError;
  if (!enrollment || enrollment.student_id !== userId) {
    return { ok: false, reason: "not_owner" };
  }

  if (submission.status !== "in_progress") return { ok: false, reason: "not_in_progress" };

  const service = createServiceSupabaseClient();

  const { data: group, error: groupError } = await service
    .from("assignment_variant_groups")
    .select("closes_at, time_limit_minutes")
    .eq("id", submission.variant_group_id)
    .maybeSingle();
  if (groupError) throw groupError;
  if (!group) return { ok: false, reason: "window_closed" };

  const now = Date.now();
  if (group.closes_at && new Date(group.closes_at).getTime() <= now) {
    return { ok: false, reason: "window_closed" };
  }
  if (
    group.time_limit_minutes &&
    new Date(submission.started_at).getTime() + group.time_limit_minutes * 60_000 <= now
  ) {
    return { ok: false, reason: "window_closed" };
  }

  const { data: mounted, error: mountedError } = await service
    .from("assignment_questions")
    .select("id")
    .eq("assignment_id", submission.assignment_id)
    .eq("question_id", questionId)
    .maybeSingle();
  if (mountedError) throw mountedError;
  if (!mounted) return { ok: false, reason: "question_not_in_variant" };

  const { data: question, error: questionError } = await service
    .from("questions")
    .select("type, code_language")
    .eq("id", questionId)
    .maybeSingle();
  if (questionError) throw questionError;
  if (!question || question.type !== "coding_challenge") {
    return { ok: false, reason: "not_coding_challenge" };
  }

  const language = resolveRunnerLanguage(question.code_language);
  if (!language) return { ok: false, reason: "unsupported_language" };

  // El filtro `is_hidden = false` va en la consulta, no en memoria: los casos
  // ocultos nunca salen de Postgres en este flujo.
  const { data: tests, error: testsError } = await service
    .from("coding_challenge_tests")
    .select("input, expected_output")
    .eq("question_id", questionId)
    .eq("is_hidden", false)
    .order("order_index", { ascending: true })
    .limit(MAX_VISIBLE_CASES + 1);
  if (testsError) throw testsError;

  const rows = tests ?? [];
  return {
    ok: true,
    language,
    testsTruncated: rows.length > MAX_VISIBLE_CASES,
    tests: rows
      .slice(0, MAX_VISIBLE_CASES)
      .map((row) => ({ input: row.input, expectedOutput: row.expected_output })),
  };
}
