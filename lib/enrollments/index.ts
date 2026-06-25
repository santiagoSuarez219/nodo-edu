import { createServerSupabaseClient } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { Enrollment, EnrollmentWithCourse, EnrollmentWithStudent } from "./types";

function computeTotalGrade(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / valid.length) * 100) / 100;
}

export async function enrollByCode(
  enrollmentCode: string
): Promise<{ ok: true; enrollment: Enrollment } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const supabase = await createServerSupabaseClient();

  const { data: course } = await supabase
    .from("academic_courses")
    .select("id, is_active")
    .eq("enrollment_code", enrollmentCode)
    .maybeSingle();

  if (!course) return { ok: false, error: "Código no encontrado." };
  if (!course.is_active)
    return { ok: false, error: "El curso no está aceptando matrículas." };

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", user.id)
    .eq("academic_course_id", course.id)
    .maybeSingle();

  if (existing)
    return { ok: false, error: "Ya estás matriculado en este curso." };

  const { data, error } = await supabase
    .from("enrollments")
    .insert({ student_id: user.id, academic_course_id: course.id })
    .select()
    .single();

  if (error) return { ok: false, error: "No se pudo completar la matrícula." };
  return { ok: true, enrollment: data };
}

async function fetchTeacherNames(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  teacherIds: string[]
): Promise<Map<string, string>> {
  if (teacherIds.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", teacherIds);
  return new Map((data ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));
}

export async function getEnrollmentsByStudent(): Promise<EnrollmentWithCourse[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("enrollments")
    .select("*, academic_course:academic_courses(*), student_grades(score)")
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  if (!data) return [];

  const teacherIds = [...new Set(data.map((r) => r.academic_course.teacher_id as string))];
  const teacherNames = await fetchTeacherNames(supabase, teacherIds);

  return data.map((row) => {
    const scores = (row.student_grades as { score: number | null }[]).map((g) => g.score);
    const { student_grades: _sg, ...enrollment } = row;
    return {
      ...enrollment,
      academic_course: row.academic_course,
      teacher_name: teacherNames.get(row.academic_course.teacher_id) ?? null,
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
    .select("*, academic_course:academic_courses(*), student_grades(score)")
    .eq("id", enrollmentId)
    .single();

  if (!data) return null;

  const teacherNames = await fetchTeacherNames(supabase, [data.academic_course.teacher_id]);
  const scores = (data.student_grades as { score: number | null }[]).map((g) => g.score);
  const { student_grades: _sg, ...enrollment } = data;
  return {
    ...enrollment,
    academic_course: data.academic_course,
    teacher_name: teacherNames.get(data.academic_course.teacher_id) ?? null,
    total_grade: computeTotalGrade(scores),
  } as EnrollmentWithCourse;
}

export async function getEnrollmentsByAcademicCourse(
  academicCourseId: string
): Promise<EnrollmentWithStudent[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("enrollments")
    .select(
      "*, profile:profiles(id, full_name), student_grades(score)"
    )
    .eq("academic_course_id", academicCourseId)
    .order("enrolled_at", { ascending: true });

  if (!data) return [];

  return data.map((row) => {
    const scores = (row.student_grades as { score: number | null }[]).map(
      (g) => g.score
    );
    const { student_grades: _sg, profile, ...enrollment } = row;
    return {
      ...enrollment,
      profile: profile as { id: string; full_name: string },
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
