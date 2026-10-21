import { z } from "zod";
import { CreateGithubUsernameField, UpdateGithubUsernameField } from "./github";

// spec-062: nombres y apellidos por separado, 2–60 caracteres cada uno.
export const NamePartSchema = z
  .string()
  .trim()
  .min(2, "Debe tener al menos 2 caracteres")
  .max(60, "No puede superar los 60 caracteres");

const LegacyFullNameSchema = z.string().min(2, "El nombre debe tener al menos 2 caracteres");

export const CreateStudentSchema = z
  .object({
    first_name: NamePartSchema.optional(),
    last_name: NamePartSchema.optional(),
    full_name: LegacyFullNameSchema.optional(),
    email: z.string().email("Correo inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    career: z.string().optional(),
    semester: z.number().int().min(1).max(20).optional(),
    github_username: CreateGithubUsernameField,
    enrollment_code: z.string().optional(),
    academic_course_id: z.string().uuid().optional(),
  })
  .refine((d) => (d.first_name !== undefined && d.last_name !== undefined) || d.full_name, {
    message: "Indica first_name y last_name (o full_name)",
    path: ["first_name"],
  })
  .refine((d) => (d.first_name === undefined) === (d.last_name === undefined), {
    message: "first_name y last_name se envían juntos",
    path: ["last_name"],
  });

export const UpdateStudentSchema = z
  .object({
    first_name: NamePartSchema.optional(),
    last_name: NamePartSchema.optional(),
    full_name: z.string().min(2).optional(),
    email: z.string().email("Correo inválido").optional(),
    career: z.string().nullable().optional(),
    semester: z.number().int().min(1).max(20).nullable().optional(),
    github_username: UpdateGithubUsernameField,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes indicar al menos un campo para actualizar",
  });

// spec-051 (Fase 3/5): `password` es opcional — sin ella,
// resetServiceStudentPassword() genera una legible (D7). El botón de la UI
// docente (EnrollmentTable) nunca la pasa; la herramienta MCP
// reset_student_password sí puede, para dictar la misma a varios estudiantes
// en clase.
export const ResetStudentPasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
});

// spec-057 / spec-062 D5: edición inline de nombres y apellidos.
export const EditStudentNameSchema = z.object({
  first_name: NamePartSchema,
  last_name: NamePartSchema,
});

export const EnrollStudentSchema = z
  .object({
    academic_course_id: z.string().uuid().optional(),
    enrollment_code: z.string().optional(),
  })
  .refine((data) => data.academic_course_id || data.enrollment_code, {
    message: "Indica academic_course_id o enrollment_code",
  });
