'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createServerSupabaseClient } from '@/lib/auth/server';
import type {
  ClassSession,
  MarkAttendanceResult,
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

export async function openSession(
  academicCourseId: string
): Promise<{ success: boolean; session?: OpenSessionSummary; error?: string }> {
  const supabase = await createServerSupabaseClient();

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
          session_date: new Date().toISOString().split('T')[0],
          attendance_code: code,
          code_expires_at: getCodeExpiresAt().toISOString(),
          is_open: true,
        })
        .select()
        .single();

      if (error) {
        if (error.message?.includes('unique constraint')) {
          // Colisión de código (muy raro) o ya hay sesión abierta
          if (error.message?.includes('academic_course_id')) {
            return {
              success: false,
              error: 'Ya hay una sesión de asistencia abierta en este curso',
            };
          }
          // Reintentar con nuevo código
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
  if (!summary) {
    return { success: false, error: 'Error al recuperar la sesión creada' };
  }

  revalidatePath(`/admin/courses/${academicCourseId}/attendance`);
  return { success: true, session: summary };
}

export async function closeSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

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
): Promise<OpenSessionSummary | null> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: session, error: sessionError } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('academic_course_id', academicCourseId)
      .eq('is_open', true)
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError;
    }

    if (!session) return null;

    const { count, error: countError } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact' })
      .eq('session_id', session.id);

    if (countError) throw countError;

    return {
      session: session as ClassSession,
      attendanceCount: count || 0,
    };
  } catch (err) {
    console.error('Error getting open session:', err);
    return null;
  }
}

export async function getSessionAttendanceCount(
  sessionId: string
): Promise<number> {
  const supabase = await createServerSupabaseClient();

  try {
    const { count, error } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact' })
      .eq('session_id', sessionId);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error getting attendance count:', err);
    return 0;
  }
}

export async function markAttendanceByCode(
  courseSlug: string,
  code: string
): Promise<MarkAttendanceResult> {
  const supabase = await createServerSupabaseClient();

  // Validar formato del código: 4-6 dígitos
  const codeSchema = z
    .string()
    .regex(/^\d{4,6}$/, 'El código debe tener 4 a 6 dígitos');
  try {
    codeSchema.parse(code);
  } catch {
    return 'not_found';
  }

  try {
    const { data, error } = await supabase.rpc(
      'mark_attendance_by_code',
      { p_code: code }
    );

    if (error) {
      console.error('RPC error:', error);
      return 'not_found';
    }

    if (!data || data.length === 0) {
      return 'not_found';
    }

    const result = data[0] as { status: string };
    revalidatePath(`/${courseSlug}`);
    return (result.status as MarkAttendanceResult) || 'not_found';
  } catch (err) {
    console.error('Error marking attendance:', err);
    return 'not_found';
  }
}

export async function getStudentAttendanceForCourse(
  courseSlug: string
): Promise<StudentAttendanceState> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase.rpc(
      'get_student_session_status',
      { p_course_slug: courseSlug }
    );

    if (error || !data || data.length === 0) {
      return { sessionOpen: false, alreadyMarked: false };
    }

    const result = data[0] as {
      session_open: boolean;
      session_id: string;
      already_marked: boolean;
      marked_at: string;
    };

    return {
      sessionOpen: result.session_open,
      sessionId: result.session_id,
      alreadyMarked: result.already_marked,
      markedAt: result.marked_at,
    };
  } catch (err) {
    console.error('Error getting student attendance status:', err);
    return { sessionOpen: false, alreadyMarked: false };
  }
}
