import { z } from "zod";

export const CreateStudentSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  career: z.string().optional(),
  semester: z.number().int().min(1).max(20).optional(),
  enrollment_code: z.string().optional(),
  academic_course_id: z.string().uuid().optional(),
});

export const UpdateStudentSchema = z
  .object({
    full_name: z.string().min(2).optional(),
    email: z.string().email("Correo inválido").optional(),
    career: z.string().nullable().optional(),
    semester: z.number().int().min(1).max(20).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes indicar al menos un campo para actualizar",
  });

export const EnrollStudentSchema = z
  .object({
    academic_course_id: z.string().uuid().optional(),
    enrollment_code: z.string().optional(),
  })
  .refine((data) => data.academic_course_id || data.enrollment_code, {
    message: "Indica academic_course_id o enrollment_code",
  });
