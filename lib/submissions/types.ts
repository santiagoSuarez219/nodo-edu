export type SubmissionStatus = "in_progress" | "submitted" | "graded" | "expired";

export interface Submission {
  id: string;
  assignment_id: string;
  variant_group_id: string;
  enrollment_id: string;
  attempt_number: number;
  started_at: string;
  submitted_at: string | null;
  status: SubmissionStatus;
  auto_score: number | null;
  final_score: number | null;
  graded_at: string | null;
}

export interface Answer {
  id: string;
  submission_id: string;
  question_id: string;
  assignment_question_id: string;
  selected_choice_ids: string[];
  text_response: string | null;
  is_correct: boolean | null;
  auto_score: number | null;
  manual_score: number | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
}

export interface SubmissionWithAnswers extends Submission {
  answers: Answer[];
  student_name?: string;
}

// Devuelto por la RPC `get_variant_question_details` (ver migración
// 20260724000002_variant_question_content_rpcs.sql). `is_correct` viene ya
// gateado por show_feedback_on/closes_at/estado del intento: es `null`
// mientras no corresponda revelarlo.
//
// IMPORTANTE (spec-035): `order_index` es la posición canónica de autoría en
// la base de datos, NO la de renderizado. Si shuffle_choices está habilitado,
// las opciones llegan barajadas y no coinciden con order_index. Nunca ordenar
// por este campo en el cliente — renderizar en el orden que las opciones
// llegan del servidor. Ver lib/submissions/index.ts getVariantQuestionDetails().
export interface QuestionChoiceDetail {
  id: string;
  body: string;
  order_index: number;
  is_correct: boolean | null;
}

// IMPORTANTE (spec-035): `order_index` es la posición canónica de autoría en
// la base de datos, NO la de renderizado. Si shuffle_questions está habilitado,
// las preguntas llegan barajadas y no coinciden con order_index. Nunca ordenar
// por este campo en el cliente — renderizar en el orden que las preguntas
// llegan del servidor. Ver lib/submissions/index.ts getVariantQuestionDetails().
export interface QuestionDetail {
  assignment_question_id: string;
  question_id: string;
  order_index: number;
  points: number;
  type: string;
  stem: string;
  code_snippet: string | null;
  code_language: string | null;
  choices: QuestionChoiceDetail[];
}

export interface AnswerForReview extends Answer {
  question_type: string;
  question_stem: string;
  question_code_snippet: string | null;
  question_code_language: string | null;
  question_choices: { id: string; body: string; is_correct: boolean }[];
  question_rubric: {
    criteria: { label: string; points: number; description: string }[];
    max_score: number;
  } | null;
  max_points: number;
}

export interface SubmissionForReview extends Submission {
  student_name: string;
  answers: AnswerForReview[];
}
