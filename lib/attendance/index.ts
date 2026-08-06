'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createServerSupabaseClient } from '@/lib/auth/server';
import type {
  AttendanceCountResult,
  ClassSession,
  MarkAttendanceResult,
  OpenSessionResult,
  OpenSessionSummary,
  RefreshCodeResult,
  StudentAttendanceState,
} from './types';

// Decisión 1: generación de código numérico 4-6 dígitos
function generateAttendanceCode(): string {
  const length = Math.random() < 0.5 ? 4 : 5; // Mitad 4 dígitos, mitad 5 (promedio ~4.5)
  const code = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
  return code;
}

// Decisión 2: expiración ~15 minutos desde ahora
function getCodeExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  return expiresAt;
}

// Decisión 8: session_date en el día local del curso (America/Bogota), no UTC
function getBogotaDateString(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(
    new Date()
  );
}

interface CodeAttemptError {
  code?: string;
  message?: string;
}

type UniqueCodeOutcome<T> =
  | { outcome: 'success'; data: T }
  // Colisión en un índice ajeno al código (ej. el curso ya tiene una sesión
  // abierta) — no tiene sentido reintentar con un código nuevo.
  | { outcome: 'own_conflict' }
  // Se agotaron los intentos sin lograr un código único.
  | { outcome: 'code_exhausted' }
  // Cualquier otro error (ni colisión de código ni del índice propio).
  | { outcome: 'error'; error: CodeAttemptError };

// Decisión 5 (spec-041): el índice `unique (attendance_code) where is_open`
// aplica igual a INSERT (openSession) que a UPDATE (rotateSessionCode) — ambos
// reintentan con un código nuevo ante una colisión, sin duplicar el bucle.
// `ownConflictIndexName` es el índice, si lo hay, que la operación del llamador
// puede violar y que NO debe reintentarse con un código distinto (solo lo usa
// openSession, vía `class_sessions_academic_course_id_idx`).
async function attemptWithUniqueCode<T>(
  attemptFn: (
    code: string
  ) => Promise<{ data: T | null; error: CodeAttemptError | null }>,
  ownConflictIndexName?: string
): Promise<UniqueCodeOutcome<T>> {
  let code = generateAttendanceCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data, error } = await attemptFn(code);

    if (!error) {
      return { outcome: 'success', data: data as T };
    }

    if (error.code === '23505') {
      if (ownConflictIndexName && error.message?.includes(ownConflictIndexName)) {
        return { outcome: 'own_conflict' };
      }
      // Colisión de código entre sesiones abiertas: reintentar con uno nuevo.
      code = generateAttendanceCode();
      attempts++;
      continue;
    }

    return { outcome: 'error', error };
  }

  return { outcome: 'code_exhausted' };
}

export async function openSession(
  academicCourseId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<{ success: boolean; session?: OpenSessionSummary; error?: string }> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error opening session:', err);
    return { success: false, error: 'Error al abrir la sesión' };
  }

  let outcome: UniqueCodeOutcome<unknown>;
  try {
    outcome = await attemptWithUniqueCode(
      async (code) =>
        await supabase
          .from('class_sessions')
          .insert({
            academic_course_id: academicCourseId,
            session_date: getBogotaDateString(),
            attendance_code: code,
            code_expires_at: getCodeExpiresAt().toISOString(),
            is_open: true,
          })
          .select()
          .single(),
      'class_sessions_academic_course_id_idx'
    );
  } catch (err) {
    console.error('Error opening session:', err);
    return { success: false, error: 'Error al abrir la sesión' };
  }

  if (outcome.outcome === 'own_conflict') {
    return {
      success: false,
      error: 'Ya hay una sesión de asistencia abierta en este curso',
    };
  }

  if (outcome.outcome === 'code_exhausted') {
    return {
      success: false,
      error: 'No se pudo generar un código único después de varios intentos',
    };
  }

  if (outcome.outcome === 'error') {
    console.error('Error opening session:', outcome.error);
    return { success: false, error: 'Error al abrir la sesión' };
  }

  // Obtener la sesión completa con conteo
  const summary = await getOpenSessionForCourse(academicCourseId);
  if (summary.status === 'unavailable' || !summary.session) {
    return { success: false, error: 'Error al recuperar la sesión creada' };
  }

  // DEBT-052 (resuelto aquí): sin esto, el snapshot que arma `page.tsx` para
  // `initialSessionsByCourseId` queda desactualizado, y `AdminAttendancePanel`
  // (que remonta con `key={selectedCourse.id}` al cambiar de grupo) puede
  // mostrar "sin sesión abierta" para una sesión recién abierta. Mismo
  // hallazgo que TC-011 destapó en `extendSessionCode`/`rotateSessionCode`.
  revalidatePath(`/${courseSlug}/${lessonSlug}`);
  return { success: true, session: summary.session };
}

export async function extendSessionCode(
  sessionId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<RefreshCodeResult> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error extending session code:', err);
    return { status: 'unavailable' };
  }

  try {
    // Decisión 6 (spec-041): `is_open = true` en el WHERE evita revivir el
    // código de una sesión cerrada desde otra pestaña. Sin fila afectada,
    // Supabase responde PGRST116 ("no rows"), el mismo criterio de negocio
    // que ya usa getOpenSessionForCourse.
    const { data, error } = await supabase
      .from('class_sessions')
      .update({ code_expires_at: getCodeExpiresAt().toISOString() })
      .eq('id', sessionId)
      .eq('is_open', true)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { status: 'not_open' };
      }
      throw error;
    }

    // Hallazgo TC-011 (spec-041): revalidar `/admin/courses` no tiene efecto
    // sobre este panel — vive en la vista de lección desde spec-031, y esa
    // subruta ya no existe. Sin la ruta correcta, el snapshot que lee
    // `page.tsx` para armar `initialSessionsByCourseId` queda desactualizado,
    // y al cambiar de grupo (que remonta `AdminAttendancePanel` con
    // `key={selectedCourse.id}`) el panel remontado muestra ese snapshot
    // viejo en vez del estado real. `openSession`/`closeSession` compartían el
    // mismo defecto — ver DEBT-052 (resuelto) en backlog.md.
    revalidatePath(`/${courseSlug}/${lessonSlug}`);
    return { status: 'ok', session: data as ClassSession };
  } catch (err) {
    console.error('Error extending session code:', err);
    return { status: 'unavailable' };
  }
}

export async function rotateSessionCode(
  sessionId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<RefreshCodeResult> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error rotating session code:', err);
    return { status: 'unavailable' };
  }

  let outcome: UniqueCodeOutcome<ClassSession>;
  try {
    // Sin `ownConflictIndexName`: un UPDATE de attendance_code nunca toca
    // academic_course_id ni is_open, así que el único índice que puede violar
    // es el de código único entre sesiones abiertas (D5) — siempre reintenta.
    outcome = await attemptWithUniqueCode<ClassSession>(
      async (code) =>
        await supabase
          .from('class_sessions')
          .update({
            attendance_code: code,
            code_expires_at: getCodeExpiresAt().toISOString(),
          })
          .eq('id', sessionId)
          .eq('is_open', true)
          .select()
          .single()
    );
  } catch (err) {
    console.error('Error rotating session code:', err);
    return { status: 'unavailable' };
  }

  if (outcome.outcome === 'code_exhausted') {
    return { status: 'code_collision' };
  }

  if (outcome.outcome === 'error') {
    if (outcome.error.code === 'PGRST116') {
      return { status: 'not_open' };
    }
    console.error('Error rotating session code:', outcome.error);
    return { status: 'unavailable' };
  }

  // `own_conflict` nunca ocurre aquí: rotateSessionCode no pasa
  // `ownConflictIndexName`, así que attemptWithUniqueCode no lo produce. Se
  // trata como fallo de infraestructura por si el contrato cambiara.
  if (outcome.outcome === 'own_conflict') {
    console.error('Unexpected own_conflict outcome rotating session code');
    return { status: 'unavailable' };
  }

  // Ver comentario equivalente en `extendSessionCode` (hallazgo TC-011).
  revalidatePath(`/${courseSlug}/${lessonSlug}`);
  return { status: 'ok', session: outcome.data };
}

export async function closeSession(
  sessionId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<{ success: boolean; error?: string }> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error closing session:', err);
    return { success: false, error: 'Error al cerrar la sesión' };
  }

  try {
    const { error } = await supabase
      .from('class_sessions')
      .update({ is_open: false })
      .eq('id', sessionId);

    if (error) throw error;

    // DEBT-052 (resuelto aquí): `/admin/courses` es una ruta muerta desde
    // spec-031 — el panel vive en `/${courseSlug}/${lessonSlug}`. Ver
    // comentario equivalente en `openSession`.
    revalidatePath(`/${courseSlug}/${lessonSlug}`);
    return { success: true };
  } catch (err) {
    console.error('Error closing session:', err);
    return { success: false, error: 'Error al cerrar la sesión' };
  }
}

export async function getOpenSessionForCourse(
  academicCourseId: string
): Promise<OpenSessionResult> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error getting open session:', err);
    return { status: 'unavailable' };
  }

  try {
    const { data: session, error: sessionError } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('academic_course_id', academicCourseId)
      .eq('is_open', true)
      .single();

    // PGRST116 ("no rows") es el caso de negocio "sin sesión abierta"; otros
    // errores son un fallo de consulta (infraestructura).
    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError;
    }

    if (!session) return { status: 'ok', session: null };

    const { count, error: countError } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact' })
      .eq('session_id', session.id);

    if (countError) throw countError;

    return {
      status: 'ok',
      session: {
        session: session as ClassSession,
        attendanceCount: count || 0,
      },
    };
  } catch (err) {
    console.error('Error getting open session:', err);
    return { status: 'unavailable' };
  }
}

export async function getSessionAttendanceCount(
  sessionId: string
): Promise<AttendanceCountResult> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error getting attendance count:', err);
    return { status: 'unavailable' };
  }

  try {
    const { count, error } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact' })
      .eq('session_id', sessionId);

    if (error) throw error;
    return { status: 'ok', count: count || 0 };
  } catch (err) {
    console.error('Error getting attendance count:', err);
    return { status: 'unavailable' };
  }
}

export async function markAttendanceByCode(
  courseSlug: string,
  lessonSlug: string,
  code: string
): Promise<MarkAttendanceResult> {
  // Validar formato del código: 4-6 dígitos. Rechazo de negocio, no de
  // infraestructura — un código con formato inválido nunca fue un código
  // real, así que se queda en 'not_found'.
  const codeSchema = z
    .string()
    .regex(/^\d{4,6}$/, 'El código debe tener 4 a 6 dígitos');
  try {
    codeSchema.parse(code);
  } catch {
    return 'not_found';
  }

  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error marking attendance:', err);
    return 'unavailable';
  }

  try {
    const { data, error } = await supabase.rpc(
      'mark_attendance_by_code',
      { p_code: code }
    );

    if (error) {
      // Fallo del RPC (infraestructura): antes se leía como 'not_found', y el
      // estudiante recibía la culpa de un fallo ajeno ("código incorrecto").
      console.error('RPC error:', error);
      return 'unavailable';
    }

    if (!data || data.length === 0) {
      return 'not_found';
    }

    const result = data[0] as { status: string };
    revalidatePath(`/${courseSlug}/${lessonSlug}`);
    return (result.status as MarkAttendanceResult) || 'not_found';
  } catch (err) {
    console.error('Error marking attendance:', err);
    return 'unavailable';
  }
}

export async function getStudentAttendanceForCourse(
  courseSlug: string
): Promise<StudentAttendanceState> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error getting student attendance status:', err);
    return { status: 'unavailable' };
  }

  try {
    const { data, error } = await supabase.rpc(
      'get_student_session_status',
      { p_course_slug: courseSlug }
    );

    if (error) {
      // Fallo del RPC (infraestructura): antes se fundía con "sin sesión
      // abierta", indistinguible del caso legítimo.
      console.error('RPC error:', error);
      return { status: 'unavailable' };
    }

    if (!data || data.length === 0) {
      // Curso inexistente o sin matrícula activa — negocio (ver RPC), no infra.
      return { status: 'ok', sessionOpen: false, alreadyMarked: false };
    }

    const result = data[0] as {
      session_open: boolean;
      session_id: string;
      already_marked: boolean;
      marked_at: string;
    };

    return {
      status: 'ok',
      sessionOpen: result.session_open,
      sessionId: result.session_id,
      alreadyMarked: result.already_marked,
      markedAt: result.marked_at,
    };
  } catch (err) {
    console.error('Error getting student attendance status:', err);
    return { status: 'unavailable' };
  }
}
