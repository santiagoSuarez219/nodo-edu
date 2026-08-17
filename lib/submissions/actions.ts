"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getOrAllocateVariant } from "@/lib/assignments";
import { runCode, type CodeRunResult } from "@/lib/code-runner";
import { createSubmission, finalizeGrading, gradeAnswer, saveAnswer, submitSubmission } from "./index";
import type { AuthResult } from "@/lib/auth/types";
import type { SubmissionFailure } from "./types";

// spec-050: `AuthResult` (usado por el resto del proyecto) no tiene campo
// `reason` — devolver el `SubmissionFailure` de la capa de datos tal cual
// sigue siendo estructuralmente válido como `AuthResult`, pero el tipo
// declarado de la acción pierde `reason` y el cliente (AssignmentPlayer) no
// puede distinguir un 503 de un rechazo de negocio. Estas tres acciones usan
// su propio tipo de retorno, extendiendo `SubmissionFailure` en vez de
// `AuthResult`, para que ese dato llegue completo hasta el componente.
type SubmissionActionResult<T> = { ok: true; data: T } | SubmissionFailure;

export async function createSubmissionAction(
  assignmentId: string,
  variantGroupId: string,
  enrollmentId: string
): Promise<SubmissionActionResult<{ id: string }>> {
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
): Promise<SubmissionActionResult<{ auto_score: number }>> {
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

function reviewPaths(academicCourseId: string, groupId: string, submissionId: string) {
  return [
    `/admin/courses/${academicCourseId}/assignments/${groupId}/review`,
    `/admin/courses/${academicCourseId}/assignments/${groupId}/review/${submissionId}`,
    `/admin/courses/${academicCourseId}/assignments/${groupId}`,
  ] as const;
}

export async function gradeAnswerAction(
  answerId: string,
  score: number,
  notes: string | null,
  submissionId: string,
  academicCourseId: string,
  groupId: string
): Promise<AuthResult> {
  await requireUser();
  const result = await gradeAnswer(answerId, score, notes);
  if (!result.ok) return result;

  for (const path of reviewPaths(academicCourseId, groupId, submissionId)) {
    revalidatePath(path);
  }
  return { ok: true };
}

export async function finalizeGradingAction(
  submissionId: string,
  academicCourseId: string,
  groupId: string
): Promise<SubmissionActionResult<{ final_score: number }>> {
  await requireUser();
  const result = await finalizeGrading(submissionId);
  if (!result.ok) return result;

  for (const path of reviewPaths(academicCourseId, groupId, submissionId)) {
    revalidatePath(path);
  }
  return { ok: true, data: { final_score: result.final_score } };
}
