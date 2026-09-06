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
//
// A diferencia de `updateSessionDateAction`/`deleteSessionAction`, esta
// acción (y `unmarkStudentAttendanceAction`) NO valida `academicCourseId`
// contra el curso real de `sessionId` — es un desvío deliberado, no una
// omisión (hallazgo @reviewer): un `sessionId` fabricado que apunte a OTRO
// curso del MISMO docente sigue exigiendo, vía RLS, que ese curso también sea
// suyo y que el estudiante esté matriculado activo ahí. No hay estudiante
// marcado en un curso ajeno ni docente ajeno pudiendo marcar — solo el
// registro quedaría atribuido al curso real de la sesión, no al que dice
// `academicCourseId` (que aquí solo determina qué ruta revalidar). Es un
// desajuste de caché en el peor caso, no una vía de escritura no autorizada
// — por eso no justifica una lectura extra en cada marcado, a diferencia de
// reasignar la fecha o borrar una sesión completa (criterio 12), que si movía
// el recurso de un curso a otro sin verificarlo.
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
//
// A diferencia de `updateSessionDateAction`/`deleteSessionAction`, esta acción
// NO usa `.select().single()` para detectar "cero filas afectadas": aquí cero
// filas es indistinguible entre "RLS lo bloqueó" y "ya estaba desmarcado"
// (idempotencia legítima, simétrica al `on conflict do nothing` de `marked`),
// y forzar un error en el segundo caso rompería un doble clic inofensivo. La
// UI solo llega aquí con sesiones de la propia planilla del docente (ya
// filtradas por RLS en `getAttendanceSheet`), así que el caso "bloqueado por
// RLS" no es alcanzable sin fabricar la llamada a mano, y de lograrlo no
// desmarca nada (no hay corrupción posible, solo un no-op silencioso).
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
// resultante (DEBT-046). El filtro por `academic_course_id` (hallazgo
// @reviewer) cierra el criterio 12 en el servidor, no solo en la UI: sin él,
// un docente con dos cursos podía, con un `session_id` fabricado, editar una
// sesión del curso B desde la planilla del curso A — RLS ya lo impedía entre
// docentes distintos, pero no entre los propios cursos de un mismo docente.
export async function updateSessionDateAction(
  sessionId: string,
  sessionDate: string,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const parsed = UpdateSessionDateSchema.safeParse({
    session_id: sessionId,
    session_date: sessionDate,
    academic_course_id: academicCourseId,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  // `.select().single()` para distinguir "sin filas afectadas" (sesión
  // abierta, ajena por RLS, de otro curso, o inexistente) de un fallo real:
  // sin esto, un `update` filtrado en silencio a cero filas devolvería
  // `{ok: true}` sin haber cambiado nada (mismo criterio que `extendSessionCode`).
  const { error } = await supabase
    .from("class_sessions")
    .update({ session_date: parsed.data.session_date })
    .eq("id", parsed.data.session_id)
    .eq("academic_course_id", parsed.data.academic_course_id)
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
// `attendance_records` de esa sesión (`on delete cascade`), incluidos los de
// estudiantes retirados que la planilla ya no muestra (D2). La confirmación
// con el conteo real vive en la UI (`AttendanceSessionActions`), a partir de
// `AttendanceSheetSession.attendee_count` (que sí cuenta esos registros);
// esta acción no vuelve a contar antes de borrar. Filtro por
// `academic_course_id`: ver comentario en `updateSessionDateAction`.
export async function deleteSessionAction(
  sessionId: string,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const parsed = DeleteSessionSchema.safeParse({
    session_id: sessionId,
    academic_course_id: academicCourseId,
  });
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const supabase = await createServerSupabaseClient();
  // Ver comentario equivalente en `updateSessionDateAction`.
  const { error } = await supabase
    .from("class_sessions")
    .delete()
    .eq("id", parsed.data.session_id)
    .eq("academic_course_id", parsed.data.academic_course_id)
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
