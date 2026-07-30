import { createServerSupabaseClient } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { CourseAccess } from "@/lib/enrollments/access";
import type { AcademicCourse, AcademicCourseInput, AcademicCourseUpdate } from "./types";

function generateEnrollmentCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

async function findUniqueEnrollmentCode(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  for (let i = 0; i < 10; i++) {
    const code = generateEnrollmentCode();
    const { data } = await supabase
      .from("academic_courses")
      .select("id")
      .eq("enrollment_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error("No se pudo generar un código de matrícula único.");
}

export async function getCoursesByTeacher(
  teacherId: string
): Promise<AcademicCourse[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("academic_courses")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAcademicCourseById(
  courseId: string
): Promise<AcademicCourse | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("academic_courses")
    .select("*")
    .eq("id", courseId)
    .single();
  return data ?? null;
}

export async function createAcademicCourse(
  input: AcademicCourseInput & { teacher_id: string }
): Promise<AcademicCourse> {
  const supabase = await createServerSupabaseClient();

  const enrollmentCode =
    input.enrollment_code && input.enrollment_code.length === 8
      ? input.enrollment_code
      : await findUniqueEnrollmentCode();

  const { data, error } = await supabase
    .from("academic_courses")
    .insert({
      ...input,
      enrollment_code: enrollmentCode,
      course_slug: input.course_slug || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAcademicCourse(
  courseId: string,
  update: AcademicCourseUpdate
): Promise<AcademicCourse | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("academic_courses")
    .update({
      ...update,
      course_slug: update.course_slug === "" ? null : update.course_slug,
    })
    .eq("id", courseId)
    .select()
    .single();
  return data ?? null;
}

// Vista docente (spec-031): resuelve los cursos académicos activos detrás de
// un course_slug de contenido. course_slug no es único (dos grupos/semestres
// pueden compartirlo), así que se devuelve la lista completa y es la UI quien
// decide el desempate (selector de grupo) en vez de asumir un único curso.
export async function resolveAcademicCoursesBySlug(
  courseSlug: string,
  access: CourseAccess
): Promise<AcademicCourse[]> {
  if (!access.ok || (access.reason !== "owner" && access.reason !== "admin")) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("academic_courses")
    .select("*")
    .eq("course_slug", courseSlug)
    .eq("is_active", true);

  // Un admin puede no ser el dueño del curso: no filtramos por teacher_id.
  // Un owner sí, para no exponerle cursos académicos de otros docentes que
  // compartan el mismo course_slug.
  if (access.reason === "owner") {
    const user = await getCurrentUser();
    if (!user) return [];
    query = query.eq("teacher_id", user.id);
  }

  const { data } = await query.order("name", { ascending: true });
  return data ?? [];
}

export async function deactivateAcademicCourse(
  courseId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("academic_courses")
    .update({ is_active: false })
    .eq("id", courseId);
}
