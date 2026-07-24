"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getOrAllocateVariant } from "@/lib/assignments";
import { runCode, type CodeRunResult } from "@/lib/code-runner";
import { createSubmission, saveAnswer, submitSubmission } from "./index";
import type { AuthResult } from "@/lib/auth/types";

export async function createSubmissionAction(
  assignmentId: string,
  variantGroupId: string,
  enrollmentId: string
): Promise<AuthResult<{ id: string }>> {
  await requireUser();
  const result = await createSubmission(assignmentId, variantGroupId, enrollmentId);
  if (!result.ok) return result;
  return { ok: true, data: { id: result.data.id } };
}

export async function saveAnswerAction(
  submissionId: string,
  questionId: string,
  assignmentQuestionId: string,
  response: { selected_choice_ids?: string[]; text_response?: string }
): Promise<AuthResult> {
  await requireUser();
  return saveAnswer(submissionId, questionId, assignmentQuestionId, response);
}

export async function submitSubmissionAction(
  submissionId: string
): Promise<AuthResult<{ auto_score: number }>> {
  await requireUser();
  const result = await submitSubmission(submissionId);
  if (!result.ok) return result;
  return { ok: true, data: { auto_score: result.auto_score } };
}

// Inicia un nuevo intento (attempt_number + 1) sobre la MISMA variante ya
// asignada al estudiante y redirige al jugador. Usada desde el botón
// "Iniciar nuevo intento" en la página de resultados cuando quedan intentos
// disponibles (max_attempts contado por grupo, no por variante).
export async function startNewAttemptAction(
  variantGroupId: string,
  enrollmentId: string
): Promise<void> {
  await requireUser();

  const allocation = await getOrAllocateVariant(enrollmentId, variantGroupId);
  if (!allocation) return;

  const result = await createSubmission(allocation.variant.id, variantGroupId, enrollmentId);
  if (!result.ok) return;

  redirect(`/cuenta/cursos/${enrollmentId}/evaluaciones/${variantGroupId}`);
}

// coding_challenge se renderiza y guarda como respuesta abierta, pero no se
// ejecuta (stub de spec-005): siempre devuelve { status: "disabled" }.
export async function runCodeAction(
  language: string,
  code: string,
  input?: string
): Promise<CodeRunResult> {
  await requireUser();
  return runCode(language, code, input);
}
