import { z } from "zod";

export const GradeItemSchema = z.object({
  name: z.string().min(1, "El nombre del ítem es requerido"),
  order_index: z.coerce
    .number()
    .int()
    .min(0, "El orden debe ser un número positivo"),
});

const WeightSchema = z.coerce
  .number()
  .gt(0, "El peso debe ser mayor que 0")
  .max(1, "El peso máximo es 1.00")
  .multipleOf(0.001, "Máximo tres decimales");

export const GradeItemWeightSchema = WeightSchema.nullable();

export const GradeGroupSchema = z.object({
  name: z.string().trim().min(1, "El nombre del corte es requerido"),
  target_weight: WeightSchema,
});

export const StudentGradeSchema = z.object({
  enrollment_id: z.string().uuid(),
  grade_item_id: z.string().uuid(),
  score: z.coerce
    .number()
    .min(0, "La nota mínima es 0.0")
    .max(5, "La nota máxima es 5.0")
    .multipleOf(0.01, "Máximo dos decimales")
    .nullable(),
});

export type GradeItemInput = z.infer<typeof GradeItemSchema>;
export type GradeGroupInput = z.infer<typeof GradeGroupSchema>;
export type StudentGradeInput = z.infer<typeof StudentGradeSchema>;
