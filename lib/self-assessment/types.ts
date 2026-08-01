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

// Resultado discriminado de getSelfAssessmentStatus: antes un fallo de
// consulta degradaba a `requiresAttempt: false`, lo que abría el gate de
// "completar lección" de lib/progress/index.ts ante un fallo de
// infraestructura (DEBT-037, Frente 4). `status: 'unavailable'` obliga al
// llamador a fallar cerrado en vez de dejar pasar.
export type SelfAssessmentStatus =
  | {
      status: "ok";
      questionCount: number;
      hasAttempt: boolean;
      requiresAttempt: boolean;
      lastAttempt: SelfAssessmentAttemptSummary | null;
    }
  | { status: "unavailable" };

export type SubmitSelfAssessmentResult =
  | {
      ok: true;
      feedback: QuestionFeedback[];
    }
  | {
      ok: false;
      reason: "not_enrolled" | "incomplete" | "no_questions" | "error";
    };
