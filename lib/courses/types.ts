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
  order: number;
  title: string;
  summary?: string;
  topics: Topic[];
  durationMinutes?: number;
  publishedAt?: string;
  // Anchor a la futura página de la clase (Fase 1.5: artículos MDX).
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
