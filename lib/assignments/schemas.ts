import { z } from "zod";

export const AssignmentQuestionInputSchema = z.object({
  question_id: z.string().uuid("ID de pregunta debe ser UUID válido"),
  points: z.coerce
    .number()
    .min(0.01, "Puntos mínimos: 0.01")
    .max(5.0, "Puntos máximos: 5.00"),
  order_index: z.coerce.number().int().min(0),
});

export const AssignmentVariantInputSchema = z.object({
  variant_label: z
    .string()
    .regex(/^[A-Z]$/, "Etiqueta de variante debe ser una letra mayúscula [A-Z]"),
  description: z.string().optional().nullable(),
  questions: z
    .array(AssignmentQuestionInputSchema)
    .min(1, "Cada variante debe tener al menos una pregunta"),
});

export const AssignmentGroupInputSchema = z.object({
  academic_course_id: z.string().uuid("ID de curso académico debe ser UUID válido"),
  grade_item_id: z.string().uuid("ID de elemento de calificación debe ser UUID válido").optional().nullable(),
  title: z.string().min(1, "Título es requerido"),
  description: z.string().optional().nullable(),
  type: z.enum(["practice", "quiz", "exam", "homework"]),
  opens_at: z.string().datetime().optional().nullable(),
  closes_at: z.string().datetime().optional().nullable(),
  time_limit_minutes: z.coerce.number().int().min(1, "Límite de tiempo debe ser mínimo 1 minuto").optional().nullable(),
  shuffle_questions: z.boolean().default(false),
  shuffle_choices: z.boolean().default(false),
  show_feedback_on: z.enum(["submit", "close", "never"]).default("submit"),
  max_attempts: z.coerce.number().int().min(1, "Máximo de intentos debe ser mínimo 1").default(1),
  variants: z
    .array(AssignmentVariantInputSchema)
    .min(2, "Se requieren al menos 2 variantes"),
});

export const PublishGroupSchema = z.object({
  group_id: z.string().uuid("ID de grupo debe ser UUID válido"),
});

export type AssignmentGroupInput = z.infer<typeof AssignmentGroupInputSchema>;
export type AssignmentVariantInput = z.infer<typeof AssignmentVariantInputSchema>;
export type AssignmentQuestionInput = z.infer<typeof AssignmentQuestionInputSchema>;
export type PublishGroupInput = z.infer<typeof PublishGroupSchema>;
