import { z } from "zod";

export function sanitizeGithubUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/^@/, "");
  return trimmed === "" ? null : trimmed;
}

// Opcional y sin validación de formato (spec-029): solo sanea (trim, quita
// '@' inicial), no verifica que la cuenta exista en GitHub. Preserva la
// ausencia del campo (undefined) para no romper updates parciales
// (Object.keys().length en UpdateStudentSchema/EnrollStudentSchema).

// Creación: no hay concepto de "limpiar", una cadena vacía equivale a no
// mandar el campo.
export const CreateGithubUsernameField = z
  .string()
  .optional()
  .transform((value) => (value === undefined ? undefined : (sanitizeGithubUsername(value) ?? undefined)));

// Actualización: admite null explícito (o cadena vacía) para limpiar el
// valor guardado, distinto de omitir el campo (no tocarlo).
export const UpdateGithubUsernameField = z
  .string()
  .nullable()
  .optional()
  .transform((value) => (value === undefined ? undefined : sanitizeGithubUsername(value)));
