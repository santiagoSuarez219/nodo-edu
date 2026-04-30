export type CourseLevel = "introductorio" | "intermedio" | "avanzado";

export type CourseAudience =
  | "ingenieria-de-sistemas"
  | "ingenieria-electronica"
  | "ciencia-de-datos";

export interface Topic {
  title: string;
  description?: string;
}

export interface Lesson {
  id: string;
  // URL de la lección (`/<courseSlug>/<slug>`). Por defecto coincide con `id`.
  slug: string;
  order: number;
  title: string;
  summary?: string;
  topics: Topic[];
  durationMinutes?: number;
  publishedAt?: string;
  // Clave opaca al cuerpo del artículo. En Fase 1 corresponde al nombre del
  // archivo MDX en content/cursos/<courseSlug>/. En Fase 2 será el ID del
  // documento Payload. El frontend nunca asume su forma.
  articleSlug?: string;
}

export interface Course {
  slug: string;
  title: string;
  summary: string;
  audience: CourseAudience[];
  level: CourseLevel;
  lessons: Lesson[];
}
