import { existsSync } from "node:fs";
import { createServiceSupabaseClient } from "@/lib/auth/service";
import { resolveArticlePath } from "./content";
import { isGuide } from "./nodes";
import type { Course, Lesson } from "./types";

/**
 * spec-039 (M3) — capa de servicio de `/api/courses/*`, espejo de
 * `lib/attendance/service.ts`: lee y escribe `public.disabled_lessons` con
 * `service_role` (bypasa RLS) y compone el resultado contra el catálogo
 * estático de git, que sigue siendo la única fuente de verdad de *qué
 * lecciones existen*.
 *
 * Todas las funciones reciben el `Course` / `Lesson` ya resueltos del
 * catálogo: la validación de slugs ocurre en la ruta, **antes** de tocar
 * Supabase, para que un slug mal escrito nunca cree una fila.
 */

/** Forma única de salida de las tres herramientas de `courses-mcp` (M3). */
export interface LessonAvailability {
  course_slug: string;
  lesson_slug: string;
  title: string;
  order: number;
  kind: "lesson" | "guide";
  has_article: boolean;
  is_disabled: boolean;
  disabled_at: string | null;
  disabled_reason: string | null;
}

export interface CourseLessonsListing {
  data: {
    course_slug: string;
    course_title: string;
    lessons: LessonAvailability[];
  };
  meta: {
    total: number;
    disabled_count: number;
    orphan_disabled_slugs: string[];
  };
}

interface DisabledLessonRow {
  lesson_slug: string;
  disabled_at: string;
  reason: string | null;
}

// `disabled_by` no se lee ni se expone: las escrituras del MCP van con
// service_role y siempre lo dejan en null (D10), y es un uuid de auth.users
// — exponerlo filtraría identidad sin ningún uso para el agente.
const ROW_COLUMNS = "lesson_slug, disabled_at, reason";

async function fetchDisabledRows(courseSlug: string): Promise<DisabledLessonRow[]> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("disabled_lessons")
    .select(ROW_COLUMNS)
    .eq("course_slug", courseSlug);

  if (error) throw error;
  return (data ?? []) as DisabledLessonRow[];
}

async function fetchDisabledRow(
  courseSlug: string,
  lessonSlug: string
): Promise<DisabledLessonRow | null> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("disabled_lessons")
    .select(ROW_COLUMNS)
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lessonSlug)
    .maybeSingle();

  if (error) throw error;
  return (data as DisabledLessonRow | null) ?? null;
}

/**
 * `has_article`: `articleSlug` presente **y** el archivo existe en disco.
 * No basta con el catálogo: una entrada puede apuntar a un archivo que ya
 * no está, y decir `true` sería afirmar que la lección es navegable.
 */
function hasArticle(courseSlug: string, lesson: Lesson): boolean {
  if (!lesson.articleSlug) return false;
  try {
    return existsSync(
      resolveArticlePath(courseSlug, lesson.articleSlug, lesson.kind)
    );
  } catch {
    return false;
  }
}

function toAvailability(
  courseSlug: string,
  lesson: Lesson,
  row: DisabledLessonRow | null
): LessonAvailability {
  return {
    course_slug: courseSlug,
    lesson_slug: lesson.slug,
    title: lesson.title,
    order: lesson.order,
    kind: isGuide(lesson) ? "guide" : "lesson",
    has_article: hasArticle(courseSlug, lesson),
    is_disabled: row !== null,
    disabled_at: row ? new Date(row.disabled_at).toISOString() : null,
    disabled_reason: row ? row.reason : null,
  };
}

/** `GET /api/courses/[courseSlug]/lessons` — catálogo × estado. */
export async function listServiceCourseLessons(
  course: Course
): Promise<CourseLessonsListing> {
  const rows = await fetchDisabledRows(course.slug);
  const bySlug = new Map(rows.map((row) => [row.lesson_slug, row]));

  const ordered = [...course.lessons].sort((a, b) => a.order - b.order);
  const lessons = ordered.map((lesson) =>
    toAvailability(course.slug, lesson, bySlug.get(lesson.slug) ?? null)
  );

  // Filas cuyo lesson_slug ya no existe en el catálogo (lección renombrada o
  // borrada en git). No se borran automáticamente — solo se informan, para
  // que el docente detecte la deriva (R4).
  const catalogSlugs = new Set(ordered.map((lesson) => lesson.slug));
  const orphanDisabledSlugs = rows
    .map((row) => row.lesson_slug)
    .filter((slug) => !catalogSlugs.has(slug))
    .sort();

  return {
    data: {
      course_slug: course.slug,
      course_title: course.title,
      lessons,
    },
    meta: {
      total: lessons.length,
      disabled_count: lessons.filter((lesson) => lesson.is_disabled).length,
      orphan_disabled_slugs: orphanDisabledSlugs,
    },
  };
}

/** `GET /api/courses/[courseSlug]/lessons/[lessonSlug]`. */
export async function getServiceLessonAvailability(
  course: Course,
  lesson: Lesson
): Promise<LessonAvailability> {
  const row = await fetchDisabledRow(course.slug, lesson.slug);
  return toAvailability(course.slug, lesson, row);
}

export interface SetLessonAvailabilityInput {
  enabled: boolean;
  reason?: string;
}

export interface SetLessonAvailabilityResult {
  availability: LessonAvailability;
  changed: boolean;
}

/**
 * `PATCH /api/courses/[courseSlug]/lessons/[lessonSlug]` — escritura
 * idempotente según la tabla de M4. Nunca responde 409: pedir el estado en el
 * que ya se está no es un conflicto, es un no-op, y `changed` se lo dice al
 * agente para que no informe de un cambio que no ocurrió.
 */
export async function setServiceLessonAvailability(
  course: Course,
  lesson: Lesson,
  input: SetLessonAvailabilityInput
): Promise<SetLessonAvailabilityResult> {
  const supabase = createServiceSupabaseClient();
  const existing = await fetchDisabledRow(course.slug, lesson.slug);

  if (input.enabled) {
    // Habilitada ya → no se toca nada. Deshabilitada → se borra la fila.
    if (!existing) {
      return {
        availability: toAvailability(course.slug, lesson, null),
        changed: false,
      };
    }

    const { error } = await supabase
      .from("disabled_lessons")
      .delete()
      .eq("course_slug", course.slug)
      .eq("lesson_slug", lesson.slug);
    if (error) throw error;

    return {
      availability: toAvailability(course.slug, lesson, null),
      changed: true,
    };
  }

  // enabled: false
  if (existing) {
    const sameReason =
      input.reason === undefined || (existing.reason ?? null) === input.reason;

    // Ya deshabilitada y sin `reason` nuevo (o con el mismo): fila intacta,
    // `disabled_at` original preservado.
    if (sameReason) {
      return {
        availability: toAvailability(course.slug, lesson, existing),
        changed: false,
      };
    }

    // `reason` distinto: se reemplaza y se refresca `disabled_at`.
    const disabledAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("disabled_lessons")
      .update({ reason: input.reason, disabled_at: disabledAt })
      .eq("course_slug", course.slug)
      .eq("lesson_slug", lesson.slug)
      .select(ROW_COLUMNS)
      .single();
    if (error) throw error;

    return {
      availability: toAvailability(
        course.slug,
        lesson,
        data as DisabledLessonRow
      ),
      changed: true,
    };
  }

  // Habilitada → se inserta la fila. `disabled_by` queda null: la escritura
  // va con service_role y no tiene un auth.uid() asociado (D10).
  const { data, error } = await supabase
    .from("disabled_lessons")
    .insert({
      course_slug: course.slug,
      lesson_slug: lesson.slug,
      reason: input.reason ?? null,
    })
    .select(ROW_COLUMNS)
    .single();
  if (error) throw error;

  return {
    availability: toAvailability(course.slug, lesson, data as DisabledLessonRow),
    changed: true,
  };
}
