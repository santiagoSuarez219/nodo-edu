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
      reason:
        | "not_enrolled"
        | "incomplete"
        | "no_questions"
        // spec-040: intento único — ya existe una fila previa (comprobada
        // antes de insertar, o capturada del error 23505 en una carrera).
        | "already_submitted"
        | "error";
    };

// spec-040 D3: revisión permanente del intento, para que sobreviva a la
// recarga aunque ya no se pueda reintentar (spec-033 documentó que el
// resumen agregado no bastaba para reconstruir el feedback).
export type AttemptReviewChoice = {
  id: string;
  body: string;
  order_index: number;
  is_correct: boolean;
  was_selected: boolean;
};

export type AttemptReviewQuestion = {
  questionId: string;
  stem: string;
  code_snippet: string | null;
  code_language: string | null;
  topic_title: string | null;
  allowMultiple: boolean;
  isCorrect: boolean;
  choices: AttemptReviewChoice[];
};

export type AttemptReview = {
  submittedAt: string;
  correctCount: number;
  questionCount: number;
  answers: AttemptReviewQuestion[];
};

// spec-040 D4/D7: desglose por lección de la nota acumulada de un curso, tal
// como lo calcula el RPC `self_assessment_breakdown`.
export type SelfAssessmentLessonRow = {
  lessonSlug: string;
  lessonTitle: string;
  answered: boolean;
  correctCount: number;
  questionCount: number;
};

export type SelfAssessmentCourseSummary = {
  // Nota 0-5, o `null` si el denominador es 0 (D4: nunca 0.00).
  score: number | null;
  correctTotal: number;
  questionTotal: number;
  lessons: SelfAssessmentLessonRow[];
};
