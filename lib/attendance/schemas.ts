import { z } from "zod";

// Mismo criterio que `getBogotaDateString()` en `lib/attendance/index.ts`
// (spec-054 D13): "hoy" se calcula en el día local del curso
// (America/Bogota), no en UTC. Duplicado a propósito y no importado desde
// `index.ts`: ese archivo lleva `"use server"`, y Next.js exige que todo
// export de un módulo así sea una función async — un helper síncrono
// compartido rompería esa regla.
function getBogotaDateString(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(
    new Date()
  );
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD")
  .refine((value) => value <= getBogotaDateString(), {
    message: "La fecha no puede ser futura",
  });

export const CreateManualSessionSchema = z.object({
  academic_course_id: z.string().uuid(),
  session_date: dateSchema,
});

// Solo el campo que pide el formulario de sesión manual — `academic_course_id`
// llega como prop del componente, no del usuario.
export const CreateManualSessionFormSchema = CreateManualSessionSchema.pick({
  session_date: true,
});

export const UpdateSessionDateSchema = z.object({
  session_id: z.string().uuid(),
  session_date: dateSchema,
  academic_course_id: z.string().uuid(),
});

export const MarkAttendanceSchema = z.object({
  session_id: z.string().uuid(),
  student_id: z.string().uuid(),
});

export const DeleteSessionSchema = z.object({
  session_id: z.string().uuid(),
  academic_course_id: z.string().uuid(),
});

export type CreateManualSessionInput = z.infer<typeof CreateManualSessionSchema>;
export type CreateManualSessionFormInput = z.infer<typeof CreateManualSessionFormSchema>;
export type UpdateSessionDateInput = z.infer<typeof UpdateSessionDateSchema>;
export type MarkAttendanceInput = z.infer<typeof MarkAttendanceSchema>;
export type DeleteSessionInput = z.infer<typeof DeleteSessionSchema>;
