import { z } from "zod";
import { CreateGithubUsernameField, UpdateGithubUsernameField } from "./github";

export const CreateStudentSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  career: z.string().optional(),
  semester: z.number().int().min(1).max(20).optional(),
  github_username: CreateGithubUsernameField,
  enrollment_code: z.string().optional(),
  academic_course_id: z.string().uuid().optional(),
});

export const UpdateStudentSchema = z
  .object({
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

export const EnrollStudentSchema = z
  .object({
    academic_course_id: z.string().uuid().optional(),
    enrollment_code: z.string().optional(),
  })
  .refine((data) => data.academic_course_id || data.enrollment_code, {
    message: "Indica academic_course_id o enrollment_code",
  });
