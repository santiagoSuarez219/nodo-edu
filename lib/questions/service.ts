import { createServiceSupabaseClient } from "@/lib/auth/service";
import {
  _getQuestionsByActor,
  _getQuestionByIdForActor,
  _createQuestionForActor,
  _updateQuestionForActor,
  _publishQuestionForActor,
  _deleteQuestionForActor,
} from "./index";
import type { Question, QuestionWithDetails, QuestionInput, QuestionContext } from "./types";

export function getServiceQuestionsContext(): QuestionContext {
  const supabase = createServiceSupabaseClient();
  const actorId = process.env.QUESTION_BANK_AGENT_TEACHER_ID;

  if (!actorId) {
    throw new Error("QUESTION_BANK_AGENT_TEACHER_ID no configurada");
  }

  return { supabase, actorId };
}

export async function getServiceQuestions(filters?: {
  courseSlug?: string;
  lessonSlug?: string;
  type?: string;
  difficulty?: number;
  tag?: string;
  isPublished?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<QuestionWithDetails[]> {
  const context = getServiceQuestionsContext();
  return _getQuestionsByActor(context, filters);
}

export async function getServiceQuestionById(
  questionId: string
): Promise<QuestionWithDetails | null> {
  const context = getServiceQuestionsContext();
  return _getQuestionByIdForActor(context, questionId);
}

export async function createServiceQuestion(
  input: QuestionInput
): Promise<Question> {
  const context = getServiceQuestionsContext();
  return _createQuestionForActor(context, input);
}

export async function updateServiceQuestion(
  questionId: string,
  input: QuestionInput
): Promise<Question | null> {
  const context = getServiceQuestionsContext();
  return _updateQuestionForActor(context, questionId, input);
}

export async function publishServiceQuestion(
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const context = getServiceQuestionsContext();
  return _publishQuestionForActor(context, questionId);
}

export async function deleteServiceQuestion(
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const context = getServiceQuestionsContext();
  return _deleteQuestionForActor(context, questionId);
}
