import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/auth/server";

/**
 * spec-039: estado de habilitación de lecciones, compuesto en runtime desde
 * `public.disabled_lessons` (Supabase) contra el catálogo estático de git.
 * `unavailable` codifica un fallo de infraestructura — nunca se lanza — para
 * que cada consumidor decida cómo fallar cerrado (D6).
 */
export type DisabledLessonsResult =
  | { status: "ok"; slugs: Set<string> }
  | { status: "unavailable" };

/**
 * Envuelta en `cache()` de React (igual que `hasCourseAccess`): varias
 * llamadas dentro del mismo render no multiplican la consulta a Supabase.
 * Devuelve todos los slugs deshabilitados del curso, lecciones y guías por
 * igual — filtrar por `kind` es responsabilidad del consumidor.
 */
export const getDisabledLessonSlugs = cache(
  async (courseSlug: string): Promise<DisabledLessonsResult> => {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("disabled_lessons")
        .select("lesson_slug")
        .eq("course_slug", courseSlug);

      if (error) throw error;

      return {
        status: "ok",
        slugs: new Set((data ?? []).map((row) => row.lesson_slug as string)),
      };
    } catch (error) {
      console.error("Error getting disabled lesson slugs:", error);
      return { status: "unavailable" };
    }
  }
);

export async function isLessonDisabled(
  courseSlug: string,
  lessonSlug: string
): Promise<{ status: "ok"; disabled: boolean } | { status: "unavailable" }> {
  const result = await getDisabledLessonSlugs(courseSlug);
  if (result.status === "unavailable") return { status: "unavailable" };
  return { status: "ok", disabled: result.slugs.has(lessonSlug) };
}
