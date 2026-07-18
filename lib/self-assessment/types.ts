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

export type SelfAssessmentStatus = {
  questionCount: number;
  hasAttempt: boolean;
  requiresAttempt: boolean;
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
