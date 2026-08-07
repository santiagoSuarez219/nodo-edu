import { SupabaseClient } from "@supabase/supabase-js";

export type QuestionType =
  | "multiple_choice"
  | "open_text"
  | "code_snippet"
  | "code_write"
  | "coding_challenge";

export interface Question {
  id: string;
  created_by: string;
  topic_title: string | null;
  type: QuestionType;
  stem: string;
  code_snippet: string | null;
  code_language: string | null;
  difficulty: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionChoice {
  id: string;
  question_id: string;
  body: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuestionRubric {
  id: string;
  question_id: string;
  criteria: { label: string; points: number; description: string }[];
  max_score: number;
}

export interface CodingChallengeTest {
  id: string;
  question_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  order_index: number;
}

// spec-042: una pregunta se "monta" en 0..N lecciones vía lesson_questions.
export interface LessonMount {
  course_slug: string;
  lesson_slug: string;
  order_index: number;
}

export interface QuestionWithDetails extends Question {
  choices: QuestionChoice[];
  rubric: QuestionRubric | null;
  challenge_tests: CodingChallengeTest[];
  author_name?: string;
  // spec-042: vocabulario controlado (sustituye a questions.tags, deprecado).
  keywords: string[];
  // spec-042: lecciones donde está montada (sustituye a course_slug/lesson_slug,
  // deprecados). Ver D6: PATCH /api/questions/{id} NO modifica este campo.
  lessons: LessonMount[];
}

// Una pregunta tal como aparece en el listado de una lección específica, con
// su order_index de montaje ya resuelto (GET /api/lessons/{c}/{l}/questions).
export type LessonQuestionEntry = QuestionWithDetails & { order_index: number };

export interface QuestionInput {
  topic_title?: string;
  type: QuestionType;
  stem: string;
  code_snippet?: string;
  code_language?: string;
  difficulty: number;
  // spec-042: vocabulario controlado. Debe existir en el catálogo `keywords`
  // (ver lib/keywords/index.ts:assertKeywordsExist) — una keyword inexistente
  // hace fallar la escritura completa, no se autocrea.
  keywords: string[];
  choices?: Omit<QuestionChoice, "id" | "question_id">[];
  rubric?: {
    criteria: { label: string; points: number; description: string }[];
    max_score?: number;
  } | null;
  challenge_tests?: Omit<CodingChallengeTest, "id" | "question_id">[];
}

export interface QuestionContext {
  supabase: SupabaseClient;
  actorId: string;
}

// spec-042: resultado discriminado de create/update — distingue "faltan
// keywords en el catálogo" (422 con la lista completa, D3) de otros errores.
export type QuestionWriteResult =
  | { ok: true; question: Question }
  | { ok: false; reason: "invalid_keywords"; missing: string[] }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "error"; error: string };

export type MountResult =
  | { ok: true; mount: LessonMount }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "error"; error: string };

export type UnmountResult =
  | { ok: true }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "error"; error: string };

// D6: PUT solo reordena — "mismatch" cuando la lista enviada no coincide
// exactamente con lo montado (ni de más ni de menos).
export type ReorderResult =
  | { ok: true }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "mismatch"; mounted: string[] }
  | { ok: false; reason: "error"; error: string };
