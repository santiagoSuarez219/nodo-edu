import { z } from "zod";

const CLASS_DAYS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
] as const;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const AcademicCourseSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    code: z.string().min(2, "El código es requerido"),
    class_days: z
      .array(z.enum(CLASS_DAYS))
      .min(1, "Selecciona al menos un día de clase"),
    class_time_start: z
      .string()
      .regex(timeRegex, "Formato HH:mm requerido"),
    class_time_end: z
      .string()
      .regex(timeRegex, "Formato HH:mm requerido"),
    enrollment_code: z
      .string()
      .length(8, "El código de matrícula debe tener 8 caracteres")
      .regex(/^[A-Z0-9]+$/, "Solo letras mayúsculas y números")
      .optional()
      .or(z.literal("")),
    // La existencia del slug se valida en la server action (D3 de spec-036):
    // depende de lib/courses, que no puede importarse desde este esquema
    // compartido con el cliente (arrastraría node:fs al bundle del navegador).
    course_slug: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.class_time_end > data.class_time_start, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["class_time_end"],
  });

export type AcademicCourseSchemaInput = z.infer<typeof AcademicCourseSchema>;
