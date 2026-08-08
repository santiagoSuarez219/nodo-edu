import { existsSync } from "node:fs";
import type { Course, Lesson } from "./types";
import { estructurasDeDatos } from "./data/estructuras-de-datos";
import { programacionCientifica } from "./data/programacion-cientifica";
import { analisisDeAlgoritmos } from "./data/analisis-de-algoritmos";
import { isGuide, isNavigable } from "./nodes";
import { resolveArticlePath } from "./content";

// Las firmas son async desde el inicio para que en Fase 2 (Payload + Postgres)
// la implementación se pueda sustituir sin cambiar consumidores.

const courses: readonly Course[] = Object.freeze([
  estructurasDeDatos,
  programacionCientifica,
  analisisDeAlgoritmos,
]);

// Slugs reservados que no pueden usarse como `lessonSlug` para evitar colisión
// con futuras rutas hermanas dentro de un curso.
const RESERVED_LESSON_SLUGS = new Set([
  "recursos",
  "evaluaciones",
  "notebooks",
  "presentacion",
  "guias",
  "apuntes",
]);

(function validate() {
  const slugs = new Set<string>();
  for (const course of courses) {
    if (slugs.has(course.slug)) {
      throw new Error(`Duplicate course slug: ${course.slug}`);
    }
    slugs.add(course.slug);

    const lessonIds = new Set<string>();
    const lessonSlugs = new Set<string>();
    const lessonOrders = new Set<number>();
    for (const lesson of course.lessons) {
      if (lessonIds.has(lesson.id)) {
        throw new Error(
          `Duplicate lesson id "${lesson.id}" in course "${course.slug}"`,
        );
      }
      lessonIds.add(lesson.id);

      if (lessonSlugs.has(lesson.slug)) {
        throw new Error(
          `Duplicate lesson slug "${lesson.slug}" in course "${course.slug}"`,
        );
      }
      lessonSlugs.add(lesson.slug);

      if (lessonOrders.has(lesson.order)) {
        throw new Error(
          `Duplicate order "${lesson.order}" in course "${course.slug}" (lesson "${lesson.slug}"). ` +
            `Each lesson/guide must have a unique order value.`,
        );
      }
      lessonOrders.add(lesson.order);

      if (RESERVED_LESSON_SLUGS.has(lesson.slug)) {
        throw new Error(
          `Lesson slug "${lesson.slug}" in course "${course.slug}" is reserved`,
        );
      }

      // Validar que kind sea un valor válido
      if (lesson.kind !== undefined && lesson.kind !== "lesson" && lesson.kind !== "guide") {
        throw new Error(
          `Invalid kind "${lesson.kind}" in lesson "${lesson.slug}" of course "${course.slug}". Must be "lesson" or "guide".`,
        );
      }

      if (lesson.articleSlug && shouldValidateContentFiles()) {
        const articlePath = resolveArticlePath(course.slug, lesson.articleSlug, lesson.kind);
        if (!existsSync(articlePath)) {
          throw new Error(
            `Missing article file "${articlePath}" referenced by ${lesson.kind || "lesson"} "${course.slug}/${lesson.slug}"`,
          );
        }
      }
    }
  }
})();

function shouldValidateContentFiles(): boolean {
  // Validar en build y en dev. En runtime de producción evitamos fs syscalls
  // al cargar el módulo (los archivos ya fueron verificados en build).
  const phase = process.env.NEXT_PHASE;
  if (phase === "phase-production-build") return true;
  return process.env.NODE_ENV !== "production";
}

export async function getAllCourses(): Promise<Course[]> {
  return [...courses];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  return courses.find((c) => c.slug === slug) ?? null;
}

// Reserved for sitemap.ts (spec-005: routes are now dynamic, no consumers here).
export async function getCourseSlugs(): Promise<string[]> {
  return courses.map((c) => c.slug);
}

export interface LessonWithContext {
  course: Course;
  lesson: Lesson;
  prev: Lesson | null;
  next: Lesson | null;
}

export async function getLessonBySlug(
  courseSlug: string,
  lessonSlug: string,
): Promise<LessonWithContext | null> {
  const course = courses.find((c) => c.slug === courseSlug);
  if (!course) return null;

  const ordered = [...course.lessons].sort((a, b) => a.order - b.order);
  const idx = ordered.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return null;

  return {
    course,
    lesson: ordered[idx],
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  };
}

// Reserved for sitemap.ts (spec-005: routes are now dynamic, no consumers here).
export async function getCourseLessonSlugPairs(): Promise<
  { courseSlug: string; lessonSlug: string }[]
> {
  const pairs: { courseSlug: string; lessonSlug: string }[] = [];
  for (const course of courses) {
    for (const lesson of course.lessons) {
      // Sólo pre-renderizar lecciones con artículo (excluir guías).
      // Las demás se generan dinámicamente como placeholder.
      if (lesson.articleSlug && !isGuide(lesson)) {
        pairs.push({ courseSlug: course.slug, lessonSlug: lesson.slug });
      }
    }
  }
  return pairs;
}

export function resolveResumeLessonSlug(
  lessons: Lesson[],
  completedLessonSlugs: Set<string>,
  disabledLessonSlugs?: ReadonlySet<string>,
): string | null {
  if (lessons.length === 0) return null;

  // Filtrar solo lecciones navegables y habilitadas (excluir guías y
  // deshabilitadas, spec-039 D7): sin este filtro el redirect de
  // `/[courseSlug]` podría aterrizar siempre en una lección cerrada.
  const navigableLessons = lessons.filter(
    (l) => !isGuide(l) && isNavigable(l) && !disabledLessonSlugs?.has(l.slug)
  );
  if (navigableLessons.length === 0) return null;

  const ordered = [...navigableLessons].sort((a, b) => a.order - b.order);

  // Primera lección sin completar
  for (const lesson of ordered) {
    if (!completedLessonSlugs.has(lesson.slug)) {
      return lesson.slug;
    }
  }

  // Si todas están completas, última lección
  return ordered[ordered.length - 1].slug;
}

export type {
  Course,
  Lesson,
  Topic,
  CourseLevel,
  CourseAudience,
} from "./types";
export {
  isGuide,
  isNavigable,
  buildCourseOutline,
  countProgressibleLessons,
} from "./nodes";
export type { OutlineNode } from "./nodes";
export { getDisabledLessonSlugs, isLessonDisabled } from "./availability";
export type { DisabledLessonsResult } from "./availability";
