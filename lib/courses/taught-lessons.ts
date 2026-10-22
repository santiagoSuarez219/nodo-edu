"use server";

import { revalidatePath } from "next/cache";
import { requireAnyRole } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getAcademicCourseById } from "@/lib/academic-courses/index";
import { getCourseBySlug } from "@/lib/courses";
import type { AuthResult } from "@/lib/auth/types";

/**
 * spec-060: marca o desmarca UNA lección como vista en clase en un grupo.
 * Es la contraparte de UI del `PATCH .../taught-lessons`: ambas pasan por la
 * RPC `set_lessons_taught*`, que escribe y recalcula el grupo en una sola
 * transacción (la tabla no admite escritura directa por RLS).
 *
 * La autorización real vive en la RPC (dueño del grupo o admin). Aquí se
 * valida el slug contra el catálogo, que Postgres no conoce.
 */
export async function setLessonTaught(
  academicCourseId: string,
  lessonSlug: string,
  taught: boolean
): Promise<
  AuthResult<{ recalculatedCount: number; disabledWarning: boolean }>
> {
  await requireAnyRole(["teacher", "admin"]);

  const academicCourse = await getAcademicCourseById(academicCourseId);
  if (!academicCourse?.course_slug) {
    return { ok: false, error: "Este curso no tiene contenido asociado." };
  }

  // Desmarcar no exige que el slug exista en el catálogo: debe poder limpiarse
  // una marca huérfana (D9).
  if (taught) {
    const course = await getCourseBySlug(academicCourse.course_slug);
    const lesson = course?.lessons.find((l) => l.slug === lessonSlug);
    if (!lesson) {
      return { ok: false, error: "La lección no existe en el catálogo del curso." };
    }
    if (lesson.kind === "guide") {
      return { ok: false, error: "Las guías de laboratorio no se marcan como vistas." };
    }
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("set_lessons_taught", {
    p_academic_course_id: academicCourseId,
    p_lesson_slugs: [lessonSlug],
    p_taught: taught,
  });

  if (error) {
    console.error("Error setting taught lesson:", error);
    return {
      ok: false,
      error:
        error.code === "42501"
          ? "No tienes permiso para modificar este curso."
          : "No se pudo actualizar la lección.",
    };
  }

  const row = (Array.isArray(data) ? data[0] : data) as {
    recalculated_count: number;
  } | null;

  let disabledWarning = false;
  if (taught) {
    const { data: disabled } = await supabase
      .from("disabled_lessons")
      .select("lesson_slug")
      .eq("course_slug", academicCourse.course_slug)
      .eq("lesson_slug", lessonSlug)
      .maybeSingle();
    disabledWarning = !!disabled;
  }

  revalidatePath(`/admin/courses/${academicCourseId}/contenido`);
  revalidatePath(`/admin/courses/${academicCourseId}/grades`);
  revalidatePath("/cuenta/cursos", "layout");

  return {
    ok: true,
    data: { recalculatedCount: row?.recalculated_count ?? 0, disabledWarning },
  };
}
