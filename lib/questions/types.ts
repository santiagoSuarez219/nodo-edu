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
  course_slug: string | null;
  lesson_slug: string | null;
  topic_title: string | null;
  type: QuestionType;
  stem: string;
  code_snippet: string | null;
  code_language: string | null;
  difficulty: number;
  tags: string[];
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

export interface QuestionWithDetails extends Question {
  choices: QuestionChoice[];
  rubric: QuestionRubric | null;
  challenge_tests: CodingChallengeTest[];
  author_name?: string;
}

export interface QuestionInput {
  course_slug?: string;
  lesson_slug?: string;
  topic_title?: string;
  type: QuestionType;
  stem: string;
  code_snippet?: string;
  code_language?: string;
  difficulty: number;
  tags: string[];
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
