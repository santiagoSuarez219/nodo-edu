export type SelfAssessmentChoice = {
  id: string;
  body: string;
  order_index: number;
};

export type SelfAssessmentQuestion = {
  id: string;
  stem: string;
  code_snippet: string | null;
  code_language: string | null;
  topic_title: string | null;
  allowMultiple: boolean;
  choices: SelfAssessmentChoice[];
};

// Vista docente: mismo contrato que SelfAssessmentQuestion, pero con
// is_correct visible por opción (clave de respuestas, spec-031).
export type AnswerKeyChoice = SelfAssessmentChoice & {
  is_correct: boolean;
};

export type AnswerKeyQuestion = Omit<SelfAssessmentQuestion, "choices"> & {
  choices: AnswerKeyChoice[];
};

export type CheckAnswerResult =
  | {
      ok: true;
      correct: boolean;
      correctChoiceIds: string[];
      selectedCorrectIds: string[];
    }
  | {
      ok: false;
      error: string;
    };

export type QuestionFeedback = {
  questionId: string;
  correct: boolean;
  correctChoiceIds: string[];
  selectedCorrectIds: string[];
};

export type SelfAssessmentAttemptSummary = {
  correctCount: number;
  questionCount: number;
  submittedAt: string;
};

export type SelfAssessmentStatus = {
  questionCount: number;
  hasAttempt: boolean;
  requiresAttempt: boolean;
  lastAttempt: SelfAssessmentAttemptSummary | null;
};

export type SubmitSelfAssessmentResult =
  | {
      ok: true;
      feedback: QuestionFeedback[];
    }
  | {
      ok: false;
      reason: "not_enrolled" | "incomplete" | "no_questions" | "error";
    };
