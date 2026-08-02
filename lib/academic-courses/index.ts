import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { CourseAccess } from "@/lib/enrollments/access";
import type { AcademicCourse, AcademicCourseInput, AcademicCourseUpdate } from "./types";
import type { AuthResult } from "@/lib/auth/types";

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

export const getAcademicCourseById = cache(async function getAcademicCourseById(
  courseId: string
): Promise<AcademicCourse | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("academic_courses")
    .select("*")
    .eq("id", courseId)
    .single();
  return data ?? null;
});

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

// D6 de spec-036: bajo RLS, un UPDATE/DELETE sin autorización o sobre una fila
// inexistente no da error — filtra la fila y afecta cero registros. Por eso
// las tres funciones piden `.select()` sobre la mutación y tratan "cero filas"
// como fallo explícito, en vez de reportar éxito con nada persistido.

export async function deactivateAcademicCourse(
  courseId: string
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("academic_courses")
    .update({ is_active: false })
    .eq("id", courseId)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return {
      ok: false,
      error: "No se pudo desactivar el curso (puede que ya no exista o no tengas permiso).",
    };
  }
  return { ok: true };
}

export async function reactivateAcademicCourse(
  courseId: string
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("academic_courses")
    .update({ is_active: true })
    .eq("id", courseId)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return {
      ok: false,
      error: "No se pudo reactivar el curso (puede que ya no exista o no tengas permiso).",
    };
  }
  return { ok: true };
}

export interface CourseDependencyCounts {
  // Bloquean el borrado (FK ON DELETE RESTRICT).
  enrollments: number;
  assignmentVariantGroups: number;
  legacyAssignments: number;
  // Se arrastran en cascada si el borrado procede (FK ON DELETE CASCADE) — D1.
  classSessions: number;
  gradeItems: number;
}

async function countRows(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  table: string,
  courseId: string
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("academic_course_id", courseId);
  // Un fallo de la consulta NO puede degradarse a "0 dependencias": el
  // diálogo de borrado (D1) usa este conteo para advertir del arrastre en
  // cascada, y un cero falso haría que el docente confirmara un borrado
  // irreversible creyendo que no hay nada que perder.
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export type CourseDependencyCountsResult =
  | { ok: true; counts: CourseDependencyCounts }
  | { ok: false };

export async function getCourseDependencyCounts(
  courseId: string
): Promise<CourseDependencyCountsResult> {
  const supabase = await createServerSupabaseClient();
  try {
    const [enrollments, assignmentVariantGroups, legacyAssignments, classSessions, gradeItems] =
      await Promise.all([
        countRows(supabase, "enrollments", courseId),
        countRows(supabase, "assignment_variant_groups", courseId),
        countRows(supabase, "assignments", courseId),
        countRows(supabase, "class_sessions", courseId),
        countRows(supabase, "grade_items", courseId),
      ]);

    return {
      ok: true,
      counts: {
        enrollments,
        assignmentVariantGroups,
        legacyAssignments,
        classSessions,
        gradeItems,
      },
    };
  } catch {
    return { ok: false };
  }
}

export async function deleteAcademicCourse(
  courseId: string
): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("academic_courses")
    .delete()
    .eq("id", courseId)
    .select("id");

  if (error) {
    // 23503: violates foreign key constraint — el curso tiene matrículas o
    // evaluaciones (FK restrict, ver spec-036 D1). La UI ya debería haber
    // deshabilitado el botón usando getCourseDependencyCounts, así que llegar
    // aquí es un caso límite (otra pestaña creó una matrícula mientras tanto).
    if (error.code === "23503") {
      return {
        ok: false,
        error:
          "No se puede eliminar: el curso tiene matrículas o evaluaciones asociadas.",
      };
    }
    return { ok: false, error: error.message };
  }
  if (!data || data.length === 0) {
    return {
      ok: false,
      error: "No se pudo eliminar el curso (puede que ya no exista o no tengas permiso).",
    };
  }
  return { ok: true };
}
