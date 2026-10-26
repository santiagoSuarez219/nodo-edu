// Cualquier tipo distinto de multiple_choice es "abierto" para efectos de
// calificación manual — mismo criterio que submitSubmission ya usa para
// auto_score (ausencia en get_variant_answer_key, que solo cubre
// multiple_choice). code_snippet no estaba en la lista original de spec-020
// (ajuste de scope aprobado tras encontrar el caso real en G2, fixture de
// test-019).
//
// spec-064 (D4): criterio único para servidor y UI (sin imports de servidor,
// para poder usarlo desde Client Components).
const OPEN_QUESTION_TYPES: ReadonlySet<string> = new Set([
  "open_text",
  "code_snippet",
  "code_write",
  "coding_challenge",
]);

export function isOpenQuestionType(type: string): boolean {
  return OPEN_QUESTION_TYPES.has(type);
}
