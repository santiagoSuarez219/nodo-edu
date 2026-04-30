import type { Course } from "./types";
import { estructurasDeDatos } from "./data/estructuras-de-datos";
import { programacionCientifica } from "./data/programacion-cientifica";
import { analisisDeAlgoritmos } from "./data/analisis-de-algoritmos";

// Las firmas son async desde el inicio para que en Fase 2 (Payload + Postgres)
// la implementación se pueda sustituir sin cambiar consumidores.

const courses: readonly Course[] = Object.freeze([
  estructurasDeDatos,
  programacionCientifica,
  analisisDeAlgoritmos,
]);

(function validate() {
  const slugs = new Set<string>();
  for (const course of courses) {
    if (slugs.has(course.slug)) {
      throw new Error(`Duplicate course slug: ${course.slug}`);
    }
    slugs.add(course.slug);

    const lessonIds = new Set<string>();
    for (const lesson of course.lessons) {
      if (lessonIds.has(lesson.id)) {
        throw new Error(
          `Duplicate lesson id "${lesson.id}" in course "${course.slug}"`,
        );
      }
      lessonIds.add(lesson.id);
    }
  }
})();

export async function getAllCourses(): Promise<Course[]> {
  return [...courses];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  return courses.find((c) => c.slug === slug) ?? null;
}

export async function getCourseSlugs(): Promise<string[]> {
  return courses.map((c) => c.slug);
}

export type { Course, Lesson, Topic, CourseLevel, CourseAudience } from "./types";
