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
  /** spec-060 D5: grupos recalculados tras el cambio (0 si no hubo cambio). */
  recalculatedGroups: number;
}

/**
 * spec-060 D5: abrir o cerrar una lección cambia el denominador de todos los
 * grupos que la tengan marcada, así que se recalculan los grupos del curso.
 * Un fallo se registra pero no revierte el cambio de disponibilidad: el
 * docente puede corregirlo con "Recalcular".
 */
async function recalculateGroupsOfCourse(courseSlug: string): Promise<number> {
  const supabase = createServiceSupabaseClient();
  const { data: groups, error } = await supabase
    .from("academic_courses")
    .select("id")
    .eq("course_slug", courseSlug);
  if (error) {
    console.error("recalculateGroupsOfCourse groups error:", error);
    return 0;
  }

  let recalculated = 0;
  for (const group of groups ?? []) {
    const { error: rpcError } = await supabase.rpc(
      "recalculate_course_self_assessment_grades_internal",
      { p_academic_course_id: group.id }
    );
    if (rpcError) {
      console.error("recalculateGroupsOfCourse rpc error:", rpcError);
      continue;
    }
    recalculated += 1;
  }
  return recalculated;
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
  const result = await writeLessonAvailability(course, lesson, input);
  // Un cambio de `reason` no altera el denominador, pero recalcular es
  // idempotente y barato; se evita solo cuando no hubo cambio.
  const recalculatedGroups = result.changed
    ? await recalculateGroupsOfCourse(course.slug)
    : 0;
  return { ...result, recalculatedGroups };
}

async function writeLessonAvailability(
  course: Course,
  lesson: Lesson,
  input: SetLessonAvailabilityInput
): Promise<Omit<SetLessonAvailabilityResult, "recalculatedGroups">> {
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


// ─── spec-060: lecciones dictadas por grupo ────────────────────────────────

export interface CourseGroup {
  academic_course_id: string;
  name: string;
  code: string | null;
  is_active: boolean;
  active_student_count: number;
}

export interface TaughtLesson {
  lesson_slug: string;
  title: string;
  order: number;
  is_taught: boolean;
  taught_at: string | null;
  is_disabled: boolean;
  question_count: number;
  counts_for_grade: boolean;
}

export interface TaughtLessonsListing {
  lessons: TaughtLesson[];
  meta: {
    taught_count: number;
    counted_count: number;
    orphan_taught_slugs: string[];
  };
}

export interface GroupRef {
  id: string;
  name: string;
  course_slug: string | null;
}

/** `GET /api/courses/[courseSlug]/groups`. */
export async function listServiceCourseGroups(
  courseSlug: string
): Promise<CourseGroup[]> {
  const supabase = createServiceSupabaseClient();
  const { data: groups, error } = await supabase
    .from("academic_courses")
    .select("id, name, code, is_active")
    .eq("course_slug", courseSlug)
    .order("name", { ascending: true });
  if (error) throw error;
  if (!groups || groups.length === 0) return [];

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("academic_course_id")
    .in(
      "academic_course_id",
      groups.map((g) => g.id)
    )
    .eq("status", "active");
  if (enrollmentsError) throw enrollmentsError;

  const counts = new Map<string, number>();
  for (const e of enrollments ?? []) {
    counts.set(e.academic_course_id, (counts.get(e.academic_course_id) ?? 0) + 1);
  }

  return groups.map((g) => ({
    academic_course_id: g.id,
    name: g.name,
    code: g.code ?? null,
    is_active: g.is_active ?? true,
    active_student_count: counts.get(g.id) ?? 0,
  }));
}

/** Grupo por id, o `null`. La ruta compara `course_slug` para el 404 por discrepancia. */
export async function getServiceGroup(
  academicCourseId: string
): Promise<GroupRef | null> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("academic_courses")
    .select("id, name, course_slug")
    .eq("id", academicCourseId)
    .maybeSingle();
  if (error) throw error;
  return (data as GroupRef | null) ?? null;
}

/** Conteo vivo de preguntas multiple_choice publicadas montadas, por lección. */
async function fetchLiveQuestionCounts(
  courseSlug: string
): Promise<Map<string, number>> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("lesson_questions")
    .select("lesson_slug, questions!inner(type, is_published)")
    .eq("course_slug", courseSlug)
    .eq("questions.type", "multiple_choice")
    .eq("questions.is_published", true);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.lesson_slug, (counts.get(row.lesson_slug) ?? 0) + 1);
  }
  return counts;
}

/**
 * Catálogo (solo `kind: "lesson"`) × `taught_lessons` × `disabled_lessons` ×
 * conteo vivo de preguntas, para un grupo. Lo usan la ruta API y la pestaña
 * Contenido; la autorización la hace quien llama.
 */
export async function listServiceTaughtLessons(
  course: Course,
  academicCourseId: string
): Promise<TaughtLessonsListing> {
  const supabase = createServiceSupabaseClient();
  const [taughtResult, disabledRows, questionCounts] = await Promise.all([
    supabase
      .from("taught_lessons")
      .select("lesson_slug, marked_at")
      .eq("academic_course_id", academicCourseId),
    fetchDisabledRows(course.slug),
    fetchLiveQuestionCounts(course.slug),
  ]);
  if (taughtResult.error) throw taughtResult.error;

  const taughtBySlug = new Map(
    (taughtResult.data ?? []).map((row) => [row.lesson_slug, row.marked_at as string])
  );
  const disabledSlugs = new Set(disabledRows.map((row) => row.lesson_slug));

  const ordered = [...course.lessons]
    .filter((lesson) => !isGuide(lesson))
    .sort((a, b) => a.order - b.order);

  const lessons: TaughtLesson[] = ordered.map((lesson) => {
    const markedAt = taughtBySlug.get(lesson.slug);
    const isTaught = markedAt !== undefined;
    const isDisabled = disabledSlugs.has(lesson.slug);
    const questionCount = questionCounts.get(lesson.slug) ?? 0;
    return {
      lesson_slug: lesson.slug,
      title: lesson.title,
      order: lesson.order,
      is_taught: isTaught,
      taught_at: isTaught ? new Date(markedAt).toISOString() : null,
      is_disabled: isDisabled,
      question_count: questionCount,
      counts_for_grade: isTaught && !isDisabled && questionCount > 0,
    };
  });

  // D9: marcas cuyo slug ya no está en el catálogo (renombre / cambio de
  // course_slug del grupo). No se filtran en SQL: se reportan.
  const catalogSlugs = new Set(course.lessons.map((lesson) => lesson.slug));
  const orphanTaughtSlugs = [...taughtBySlug.keys()]
    .filter((slug) => !catalogSlugs.has(slug))
    .sort();

  return {
    lessons,
    meta: {
      taught_count: lessons.filter((l) => l.is_taught).length,
      counted_count: lessons.filter((l) => l.counts_for_grade).length,
      orphan_taught_slugs: orphanTaughtSlugs,
    },
  };
}

export type InvalidTaughtSlug = {
  lesson_slug: string;
  reason: "not_found" | "is_guide";
};

/**
 * D14: valida TODOS los slugs antes de escribir. Con `taught: true` cada slug
 * debe ser una lección del catálogo; con `taught: false` también se acepta una
 * marca huérfana del grupo (D9).
 */
export async function findInvalidTaughtSlugs(
  course: Course,
  academicCourseId: string,
  slugs: string[],
  taught: boolean
): Promise<InvalidTaughtSlug[]> {
  const bySlug = new Map(course.lessons.map((l) => [l.slug, l]));

  let orphanMarks = new Set<string>();
  if (!taught) {
    const { data, error } = await createServiceSupabaseClient()
      .from("taught_lessons")
      .select("lesson_slug")
      .eq("academic_course_id", academicCourseId)
      .in("lesson_slug", slugs);
    if (error) throw error;
    orphanMarks = new Set((data ?? []).map((row) => row.lesson_slug));
  }

  const invalid: InvalidTaughtSlug[] = [];
  for (const slug of slugs) {
    const lesson = bySlug.get(slug);
    if (!lesson) {
      if (!(orphanMarks.has(slug)))
        invalid.push({ lesson_slug: slug, reason: "not_found" });
    } else if (isGuide(lesson)) {
      invalid.push({ lesson_slug: slug, reason: "is_guide" });
    }
  }
  return invalid;
}

export interface SetLessonsTaughtResult {
  lessons: TaughtLesson[];
  meta: {
    changed_slugs: string[];
    unchanged_slugs: string[];
    recalculated_count: number;
    warnings: Array<{ lesson_slug: string; code: "lesson_disabled" }>;
  };
}

/**
 * `PATCH .../taught-lessons`: una sola transacción en la RPC (todo o nada) y
 * un único recálculo del grupo. La validación de slugs ya ocurrió en la ruta.
 */
export async function setServiceLessonsTaught(
  course: Course,
  academicCourseId: string,
  slugs: string[],
  taught: boolean
): Promise<SetLessonsTaughtResult> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.rpc("set_lessons_taught_internal", {
    p_academic_course_id: academicCourseId,
    p_lesson_slugs: slugs,
    p_taught: taught,
    p_actor: null,
  });
  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as {
    changed_slugs: string[];
    unchanged_slugs: string[];
    recalculated_count: number;
  };

  const listing = await listServiceTaughtLessons(course, academicCourseId);
  const requested = new Set(slugs);
  const lessons = listing.lessons.filter((l) => requested.has(l.lesson_slug));

  return {
    lessons,
    meta: {
      changed_slugs: row.changed_slugs,
      unchanged_slugs: row.unchanged_slugs,
      recalculated_count: row.recalculated_count,
      warnings: taught
        ? lessons
            .filter((l) => l.is_taught && l.is_disabled)
            .map((l) => ({ lesson_slug: l.lesson_slug, code: "lesson_disabled" as const }))
        : [],
    },
  };
}
