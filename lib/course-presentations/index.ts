import { estructurasDatos } from "./data/estructuras-de-datos";
import { programacionCientifica } from "./data/programacion-cientifica";
import { analisisDeAlgoritmos } from "./data/analisis-de-algoritmos";
import type { CoursePresentation } from "./types";

const entries: readonly [string, CoursePresentation][] = [
  ["estructuras-de-datos", estructurasDatos],
  ["programacion-cientifica", programacionCientifica],
  ["analisis-de-algoritmos", analisisDeAlgoritmos],
];

const presentationsBySlug = new Map<string, CoursePresentation>();
for (const [slug, presentation] of entries) {
  if (presentationsBySlug.has(slug)) {
    throw new Error(`Duplicate course presentation slug: ${slug}`);
  }
  presentationsBySlug.set(slug, presentation);
}

export async function getCoursePresentationBySlug(
  slug: string,
): Promise<CoursePresentation | null> {
  return presentationsBySlug.get(slug) ?? null;
}

export type { CoursePresentation, SyllabusUnit, EvaluationItem, ImportantDate } from "./types";
