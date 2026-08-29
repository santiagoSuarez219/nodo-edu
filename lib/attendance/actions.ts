"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import type { AuthResult } from "@/lib/auth/types";
import {
  CreateManualSessionSchema,
  DeleteSessionSchema,
  MarkAttendanceSchema,
  UpdateSessionDateSchema,
} from "./schemas";

function attendanceSheetPath(academicCourseId: string): string {
  return `/admin/courses/${academicCourseId}/asistencia`;
}

// spec-054 (D6, D8): marca a mano la asistencia de un estudiante. Autorizado
// por la policy `attendance_records_insert_teacher_or_admin` — el `with
// check` exige que el llamador sea el docente dueño (o admin), que el
// estudiante tenga matrícula activa en el curso de la sesión, y que
// `marked_by = auth.uid()`. RLS rechaza cualquier intento fuera de esas
// condiciones; esta acción no repite esa comprobación en código (D1).
export async function markStudentAttendanceAction(
  sessionId: string,
  studentId: string,
  academicCourseId: string
): Promise<AuthResult> {
  const user = await requireUser();

  const parsed = MarkAttendanceSchema.safeParse({
    session_id: sessionId,
    student_id: studentId,
  });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("attendance_records").insert({
    session_id: parsed.data.session_id,
    student_id: parsed.data.student_id,
    marked_by: user.id,
  });

  // 23505 = unique_violation en (session_id, student_id): ya estaba marcado
  // (doble clic, otra pestaña). Es idempotente, no un fallo.
  if (error && error.code !== "23505") {
    console.error("Error marking attendance:", error);
    return { ok: false, error: "No se pudo marcar la asistencia." };
  }

  revalidatePath(attendanceSheetPath(academicCourseId));
  return { ok: true };
}

// Desmarcar no necesita policy nueva: `attendance_records_delete_teacher_or_admin`
// ya autorizaba esta corrección desde spec-010 ("correcciones manuales futuras").
export async function unmarkStudentAttendanceAction(
  sessionId: string,
  studentId: string,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const parsed = MarkAttendanceSchema.safeParse({
    session_id: sessionId,
    student_id: studentId,
  });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("attendance_records")
    .delete()
    .eq("session_id", parsed.data.session_id)
    .eq("student_id", parsed.data.student_id);

  if (error) {
    console.error("Error unmarking attendance:", error);
    return { ok: false, error: "No se pudo desmarcar la asistencia." };
  }

  revalidatePath(attendanceSheetPath(academicCourseId));
  return { ok: true };
}

// spec-054 (D7, D13): crea una sesión registrada a mano, sin código. Nace
// siempre cerrada (`is_open: false`) para no chocar con el índice único que
// permite una sola sesión abierta por curso, y con `attendance_code` /
// `code_expires_at` en `null` — inalcanzable por `mark_attendance_by_code` y
// nunca ofrecida por `get_student_session_status` (verificado en D7).
export async function createManualSessionAction(
  academicCourseId: string,
  sessionDate: string
): Promise<AuthResult<{ id: string }>> {
  await requireUser();

  const parsed = CreateManualSessionSchema.safeParse({
    academic_course_id: academicCourseId,
    session_date: sessionDate,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("class_sessions")
    .insert({
      academic_course_id: parsed.data.academic_course_id,
      session_date: parsed.data.session_date,
      is_open: false,
      attendance_code: null,
      code_expires_at: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating manual session:", error);
    return { ok: false, error: "No se pudo crear la sesión." };
  }

  revalidatePath(attendanceSheetPath(academicCourseId));
  return { ok: true, data: { id: data.id as string } };
}

// spec-054 (D5, D12): solo opera sobre sesiones cerradas — la UI deshabilita
// esta acción para la sesión en curso, que se gestiona desde la lección. La
// policy `class_sessions_mutate_owner_or_admin` ahora valida también la fila
// resultante (DEBT-046), aunque este `update` no toca `academic_course_id`.
export async function updateSessionDateAction(
  sessionId: string,
  sessionDate: string,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const parsed = UpdateSessionDateSchema.safeParse({
    session_id: sessionId,
    session_date: sessionDate,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  // `.select().single()` para distinguir "sin filas afectadas" (sesión
  // abierta, ajena por RLS, o inexistente) de un fallo real: sin esto, un
  // `update` que RLS filtra en silencio a cero filas devolvería `{ok: true}`
  // sin haber cambiado nada (mismo criterio que `extendSessionCode`).
  const { error } = await supabase
    .from("class_sessions")
    .update({ session_date: parsed.data.session_date })
    .eq("id", parsed.data.session_id)
    .eq("is_open", false)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return {
        ok: false,
        error: "No se pudo editar la sesión: no existe, está en curso o no es tuya.",
      };
    }
    console.error("Error updating session date:", error);
    return { ok: false, error: "No se pudo actualizar la fecha de la sesión." };
  }

  revalidatePath(attendanceSheetPath(academicCourseId));
  return { ok: true };
}

// spec-054 (D11): destructivo en cascada — borra también los
// `attendance_records` de esa sesión (`on delete cascade`). La confirmación
// con el conteo real vive en la UI (`AttendanceSessionActions`), a partir de
// los datos que la planilla ya tiene en pantalla; esta acción no vuelve a
// contar antes de borrar.
export async function deleteSessionAction(
  sessionId: string,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const parsed = DeleteSessionSchema.safeParse({ session_id: sessionId });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  // Ver comentario equivalente en `updateSessionDateAction`.
  const { error } = await supabase
    .from("class_sessions")
    .delete()
    .eq("id", parsed.data.session_id)
    .eq("is_open", false)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return {
        ok: false,
        error: "No se pudo eliminar la sesión: no existe, está en curso o no es tuya.",
      };
    }
    console.error("Error deleting session:", error);
    return { ok: false, error: "No se pudo eliminar la sesión." };
  }

  revalidatePath(attendanceSheetPath(academicCourseId));
  return { ok: true };
}
