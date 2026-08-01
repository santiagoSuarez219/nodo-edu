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

export async function openSession(
  academicCourseId: string
): Promise<{ success: boolean; session?: OpenSessionSummary; error?: string }> {
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (err) {
    console.error('Error opening session:', err);
    return { success: false, error: 'Error al abrir la sesión' };
  }

  // Intentar generar un código único (máximo 5 intentos)
  let code = generateAttendanceCode();
  let attempts = 0;
  let success = false;

  while (attempts < 5 && !success) {
    try {
      const { error } = await supabase
        .from('class_sessions')
        .insert({
          academic_course_id: academicCourseId,
          session_date: getBogotaDateString(),
          attendance_code: code,
          code_expires_at: getCodeExpiresAt().toISOString(),
          is_open: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Violación de unique constraint: distinguir por el índice afectado
          if (error.message?.includes('class_sessions_academic_course_id_idx')) {
            return {
              success: false,
              error: 'Ya hay una sesión de asistencia abierta en este curso',
            };
          }
          // Colisión de código entre sesiones abiertas (class_sessions_attendance_code_idx): reintentar
          code = generateAttendanceCode();
          attempts++;
          continue;
        }
        throw error;
      }

      success = true;
    } catch (err) {
      console.error('Error opening session:', err);
      return { success: false, error: 'Error al abrir la sesión' };
    }
  }

  if (!success) {
    return {
      success: false,
      error: 'No se pudo generar un código único después de varios intentos',
    };
  }

  // Obtener la sesión completa con conteo
  const summary = await getOpenSessionForCourse(academicCourseId);
  if (summary.status === 'unavailable' || !summary.session) {
    return { success: false, error: 'Error al recuperar la sesión creada' };
  }

  return { success: true, session: summary.session };
}

export async function closeSession(
  sessionId: string
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

    // Revalidate para que se reflejen los cambios
    revalidatePath(`/admin/courses`, 'layout');
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
