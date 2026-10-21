import { createServiceSupabaseClient } from '@/lib/auth/service';
import { compareStudentsBySurname } from '@/lib/students/names';
import type { ClassSession } from './types';

interface ListSessionsOptions {
  courseId: string;
  fromDate?: string;
  toDate?: string;
  isOpen?: boolean;
  limit?: number;
  offset?: number;
}

interface SessionWithAttendance {
  id: string;
  session_date: string;
  is_open: boolean;
  // spec-054 (D7): null en una sesión registrada manualmente, sin código.
  code_expires_at: string | null;
  attendee_count: number;
  created_at: string;
}

// spec-062 D11: `first_name`/`last_name` se suman a `student_name` (cambio
// aditivo: no rompe a los consumidores existentes).
interface ProfileNames {
  full_name: string;
  first_name: string;
  last_name: string;
}

interface AttendanceRecord {
  student_id: string;
  student_name: string;
  first_name: string;
  last_name: string;
  marked_at: string;
}

interface SessionAttendance {
  session: Omit<ClassSession, 'attendance_code'>;
  records: AttendanceRecord[];
  attendee_count: number;
}

interface StudentAttendanceSummary {
  student_id: string;
  student_name: string;
  first_name: string;
  last_name: string;
  sessions_attended: number;
  attendance_pct: number;
}

interface CourseAttendanceSummary {
  course_id: string;
  total_sessions: number;
  students: StudentAttendanceSummary[];
}

export async function getServiceSessions(
  options: ListSessionsOptions
): Promise<SessionWithAttendance[]> {
  const supabase = createServiceSupabaseClient();

  let query = supabase
    .from('class_sessions')
    .select(
      `
      id,
      session_date,
      is_open,
      code_expires_at,
      created_at,
      attendance_records(count)
    `,
      { count: 'exact' }
    )
    .eq('academic_course_id', options.courseId);

  if (options.fromDate) {
    query = query.gte('session_date', options.fromDate);
  }

  if (options.toDate) {
    query = query.lte('session_date', options.toDate);
  }

  if (options.isOpen !== undefined) {
    query = query.eq('is_open', options.isOpen);
  }

  const limit = Math.min(options.limit ?? 100, 100);
  const offset = options.offset ?? 0;

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => {
    const attendanceRecords = row.attendance_records as Array<{ count: number }> | undefined;
    return {
      id: row.id as string,
      session_date: row.session_date as string,
      is_open: row.is_open as boolean,
      code_expires_at: row.code_expires_at as string | null,
      attendee_count: attendanceRecords?.[0]?.count ?? 0,
      created_at: row.created_at as string,
    };
  });
}

export async function getServiceSessionAttendance(
  sessionId: string
): Promise<SessionAttendance> {
  const supabase = createServiceSupabaseClient();

  const { data: sessionData, error: sessionError } = await supabase
    .from('class_sessions')
    .select(
      `
      id,
      academic_course_id,
      session_date,
      code_expires_at,
      is_open,
      created_at,
      updated_at
    `
    )
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;
  if (!sessionData) throw new Error('Sesión no encontrada');

  const session = sessionData as Record<string, unknown>;

  // Obtener los registros de asistencia
  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('student_id, marked_at')
    .eq('session_id', sessionId)
    .order('marked_at', { ascending: true });

  if (recordsError) throw recordsError;

  // Obtener los nombres de los estudiantes desde perfiles (profiles.id = auth.users.id)
  const studentIds = (records || []).map((r: Record<string, unknown>) => r.student_id);
  let students: Record<string, ProfileNames> = {};

  if (studentIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, first_name, last_name')
      .in('id', studentIds);

    if (profilesError) throw profilesError;

    students = Object.fromEntries(
      (profiles || []).map((p: Record<string, unknown>) => [p.id, p as unknown as ProfileNames])
    );
  }

  // D11: se conserva el orden de llegada (`marked_at`): este roster responde
  // "quién marcó y a qué hora".
  const attendanceRecords = (records || []).map((r: Record<string, unknown>) => {
    const profile = students[r.student_id as string];
    return {
      student_id: r.student_id as string,
      student_name: profile?.full_name || 'Desconocido',
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      marked_at: r.marked_at as string,
    };
  });

  return {
    session: {
      id: session.id as string,
      academic_course_id: session.academic_course_id as string,
      session_date: session.session_date as string,
      code_expires_at: session.code_expires_at as string | null,
      is_open: session.is_open as boolean,
      created_at: session.created_at as string,
      updated_at: session.updated_at as string,
    },
    records: attendanceRecords,
    attendee_count: attendanceRecords.length,
  };
}

export async function getServiceCourseAttendanceSummary(
  courseId: string,
  options?: { fromDate?: string; toDate?: string }
): Promise<CourseAttendanceSummary> {
  const supabase = createServiceSupabaseClient();

  // Contar sesiones del curso
  let sessionsQuery = supabase
    .from('class_sessions')
    .select('id', { count: 'exact' })
    .eq('academic_course_id', courseId);

  if (options?.fromDate) {
    sessionsQuery = sessionsQuery.gte('session_date', options.fromDate);
  }

  if (options?.toDate) {
    sessionsQuery = sessionsQuery.lte('session_date', options.toDate);
  }

  const { count: totalSessions, error: sessionsError } = await sessionsQuery;
  if (sessionsError) throw sessionsError;

  // Obtener todas las sesiones del curso
  let allSessionsQuery = supabase
    .from('class_sessions')
    .select('id')
    .eq('academic_course_id', courseId);

  if (options?.fromDate) {
    allSessionsQuery = allSessionsQuery.gte('session_date', options.fromDate);
  }

  if (options?.toDate) {
    allSessionsQuery = allSessionsQuery.lte('session_date', options.toDate);
  }

  const { data: sessions, error: allSessionsError } = await allSessionsQuery;
  if (allSessionsError) throw allSessionsError;

  const sessionIds = (sessions || []).map((s: Record<string, unknown>) => s.id);

  if (sessionIds.length === 0) {
    return {
      course_id: courseId,
      total_sessions: 0,
      students: [],
    };
  }

  // Obtener todos los registros de asistencia
  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('student_id, session_id')
    .in('session_id', sessionIds);

  if (recordsError) throw recordsError;

  // Obtener los nombres de los estudiantes involucrados (profiles.id = auth.users.id)
  const uniqueStudentIds = Array.from(
    new Set((records || []).map((r: Record<string, unknown>) => r.student_id as string))
  );
  let studentNames: Record<string, ProfileNames> = {};

  if (uniqueStudentIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, first_name, last_name')
      .in('id', uniqueStudentIds);

    if (profilesError) throw profilesError;

    studentNames = Object.fromEntries(
      (profiles || []).map((p: Record<string, unknown>) => [p.id, p as unknown as ProfileNames])
    );
  }

  // Agrupar por estudiante y contar sesiones asistidas
  const studentStats: Record<
    string,
    { profile: ProfileNames | undefined; sessionsAttended: Set<string> }
  > = {};

  (records || []).forEach((r: Record<string, unknown>) => {
    const studentId = r.student_id as string;

    if (!studentStats[studentId]) {
      studentStats[studentId] = {
        profile: studentNames[studentId],
        sessionsAttended: new Set(),
      };
    }

    studentStats[studentId].sessionsAttended.add(r.session_id as string);
  });

  const students: StudentAttendanceSummary[] = Object.entries(studentStats).map(
    ([studentId, stats]) => ({
      student_id: studentId,
      student_name: stats.profile?.full_name || 'Desconocido',
      first_name: stats.profile?.first_name ?? '',
      last_name: stats.profile?.last_name ?? '',
      sessions_attended: stats.sessionsAttended.size,
      attendance_pct:
        totalSessions && totalSessions > 0
          ? Math.round((stats.sessionsAttended.size / totalSessions) * 100)
          : 0,
    })
  );

  return {
    course_id: courseId,
    total_sessions: totalSessions || 0,
    // D11: por apellido (antes por `full_name`, es decir, por el primer nombre).
    students: students.sort((a, b) =>
      compareStudentsBySurname(
        { first_name: a.first_name, last_name: a.last_name, full_name: a.student_name },
        { first_name: b.first_name, last_name: b.last_name, full_name: b.student_name }
      )
    ),
  };
}
