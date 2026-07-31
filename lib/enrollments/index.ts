import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { createServiceSupabaseClient } from "@/lib/auth/service";
import { getCurrentUser } from "@/lib/auth/session";
import type { AcademicCoursePublic } from "@/lib/academic-courses/types";
import type { Enrollment, EnrollmentWithCourse, EnrollmentWithStudent } from "./types";

export { hasCourseAccess, requireCourseAccess } from "./access";
export type { CourseAccess } from "./access";

function computeTotalGrade(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / valid.length) * 100) / 100;
}

// El estudiante no tiene acceso vía RLS a academic_courses (solo el docente
// dueño o admin) ni a profiles de otros usuarios, así que el embed de
// PostgREST llega null. Este RPC (security definer) resuelve ambos datos
// en una sola llamada sin exponer enrollment_code.
async function fetchAcademicCoursesPublic(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  courseIds: string[]
): Promise<Map<string, { course: AcademicCoursePublic; teacher_name: string | null }>> {
  if (courseIds.length === 0) return new Map();

  const { data } = await supabase.rpc("get_academic_courses_public", {
    p_ids: courseIds,
  });

  const map = new Map<string, { course: AcademicCoursePublic; teacher_name: string | null }>();
  for (const row of data ?? []) {
    const { teacher_name, ...course } = row;
    map.set(row.id, { course, teacher_name });
  }
  return map;
}

// El docente no tiene acceso vía RLS a profiles de sus estudiantes (misma
// política "select own or admin"), así que el embed many-to-one también
// se resuelve como inner join implícito y descarta la matrícula completa
// cuando el perfil no puede leerse. RPC security definer, sin email.
export async function fetchStudentProfilesPublic(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  studentIds: string[]
): Promise<Map<string, { id: string; full_name: string }>> {
  if (studentIds.length === 0) return new Map();

  const { data } = await supabase.rpc("get_student_profiles_public", {
    p_ids: studentIds,
  });

  return new Map((data ?? []).map((p: { id: string; full_name: string }) => [p.id, p]));
}

async function resolveCourseByEnrollmentCode(
  supabase: SupabaseClient,
  enrollmentCode: string
): Promise<{ id: string; is_active: boolean } | null> {
  const { data: courses } = await supabase.rpc("find_course_by_enrollment_code", {
    p_enrollment_code: enrollmentCode,
  });
  return courses?.[0] ?? null;
}

async function insertEnrollment(
  supabase: SupabaseClient,
  studentId: string,
  academicCourseId: string
): Promise<{ ok: true; enrollment: Enrollment } | { ok: false; error: string }> {
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", studentId)
    .eq("academic_course_id", academicCourseId)
    .maybeSingle();

  if (existing)
    return { ok: false, error: "Ya estás matriculado en este curso." };

  const { data, error } = await supabase
    .from("enrollments")
    .insert({ student_id: studentId, academic_course_id: academicCourseId })
    .select()
    .single();

  if (error) return { ok: false, error: "No se pudo completar la matrícula." };
  return { ok: true, enrollment: data };
}

export async function enrollByCode(
  enrollmentCode: string
): Promise<{ ok: true; enrollment: Enrollment } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const supabase = await createServerSupabaseClient();
  const course = await resolveCourseByEnrollmentCode(supabase, enrollmentCode);

  if (!course) return { ok: false, error: "Código no encontrado." };
  if (!course.is_active)
    return { ok: false, error: "El curso no está aceptando matrículas." };

  return insertEnrollment(supabase, user.id, course.id);
}

// Se usa desde el registro (spec-027): el visitante aún es anónimo, así que
// `find_course_by_enrollment_code` (grant solo a `authenticated`) no es
// invocable con el cliente de sesión. El cliente de servicio bypasa RLS y no
// depende de ese grant. Mensaje unificado a propósito para "no existe" y
// "inactivo": no dar señal de enumeración sobre el espacio de códigos.
export async function resolveCourseForRegistration(
  enrollmentCode: string
): Promise<{ ok: true; academicCourseId: string } | { ok: false; error: string }> {
  const supabase = createServiceSupabaseClient();
  const course = await resolveCourseByEnrollmentCode(supabase, enrollmentCode);

  if (!course || !course.is_active) {
    return { ok: false, error: "Código de curso inválido. Verifica con tu docente." };
  }

  return { ok: true, academicCourseId: course.id };
}

// Se usa desde el registro (spec-027) con el MISMO cliente que ejecutó
// `supabase.auth.signUp`: ese cliente ya tiene la sesión recién creada en
// memoria, así que `auth.uid()` resuelve correctamente en el insert pese a
// que las cookies de la request entrante no la contengan todavía.
export async function enrollNewUserInCourse(
  supabase: SupabaseClient,
  userId: string,
  academicCourseId: string
): Promise<{ ok: true; enrollment: Enrollment } | { ok: false; error: string }> {
  return insertEnrollment(supabase, userId, academicCourseId);
}

export async function getEnrollmentsByStudent(): Promise<EnrollmentWithCourse[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("enrollments")
    .select("*, student_grades(score)")
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  if (!data) return [];

  const courseIds = [...new Set(data.map((r) => r.academic_course_id as string))];
  const courses = await fetchAcademicCoursesPublic(supabase, courseIds);

  return data.map((row) => {
    const scores = (row.student_grades as { score: number | null }[]).map((g) => g.score);
    const courseEntry = courses.get(row.academic_course_id);
    return {
      id: row.id,
      student_id: row.student_id,
      academic_course_id: row.academic_course_id,
      status: row.status,
      enrolled_at: row.enrolled_at,
      withdrawn_at: row.withdrawn_at,
      academic_course: courseEntry?.course,
      teacher_name: courseEntry?.teacher_name ?? null,
      total_grade: computeTotalGrade(scores),
    } as EnrollmentWithCourse;
  });
}

export async function getEnrollmentById(
  enrollmentId: string
): Promise<EnrollmentWithCourse | null> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("enrollments")
    .select("*, student_grades(score)")
    .eq("id", enrollmentId)
    .single();

  if (!data) return null;

  const courses = await fetchAcademicCoursesPublic(supabase, [data.academic_course_id]);
  const courseEntry = courses.get(data.academic_course_id);
  const scores = (data.student_grades as { score: number | null }[]).map((g) => g.score);
  return {
    id: data.id,
    student_id: data.student_id,
    academic_course_id: data.academic_course_id,
    status: data.status,
    enrolled_at: data.enrolled_at,
    withdrawn_at: data.withdrawn_at,
    academic_course: courseEntry?.course,
    teacher_name: courseEntry?.teacher_name ?? null,
    total_grade: computeTotalGrade(scores),
  } as EnrollmentWithCourse;
}

export async function getEnrollmentsByAcademicCourse(
  academicCourseId: string
): Promise<EnrollmentWithStudent[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("enrollments")
    .select("*, student_grades(score)")
    .eq("academic_course_id", academicCourseId)
    .order("enrolled_at", { ascending: true });

  if (!data) return [];

  const studentIds = [...new Set(data.map((r) => r.student_id as string))];
  const profiles = await fetchStudentProfilesPublic(supabase, studentIds);

  return data.map((row) => {
    const scores = (row.student_grades as { score: number | null }[]).map(
      (g) => g.score
    );
    return {
      id: row.id,
      student_id: row.student_id,
      academic_course_id: row.academic_course_id,
      status: row.status,
      enrolled_at: row.enrolled_at,
      withdrawn_at: row.withdrawn_at,
      profile: profiles.get(row.student_id) ?? { id: row.student_id, full_name: "Estudiante" },
      total_grade: computeTotalGrade(scores),
    } as EnrollmentWithStudent;
  });
}

export async function withdrawStudent(
  enrollmentId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("enrollments")
    .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() })
    .eq("id", enrollmentId);
}
