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
