'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/auth/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hasCourseAccess } from '@/lib/enrollments/access';
import type {
  SelfAssessmentQuestion,
  AnswerKeyQuestion,
  CheckAnswerResult,
  QuestionFeedback,
  SelfAssessmentStatus,
  SubmitSelfAssessmentResult,
} from './types';

type QuestionRow = {
  id: string;
  stem: string;
  code_snippet: string | null;
  code_language: string | null;
  topic_title: string | null;
  choices: Array<{
    id: string;
    body: string;
    order_index: number;
    is_correct: boolean;
  }>;
};

export async function getSelfAssessmentForLesson(
  courseSlug: string,
  lessonSlug: string
): Promise<SelfAssessmentQuestion[]> {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        id,
        stem,
        code_snippet,
        code_language,
        topic_title,
        choices:question_choices(id, body, order_index, is_correct)
      `
      )
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('type', 'multiple_choice')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const questions: SelfAssessmentQuestion[] = (data as QuestionRow[] | null || []).map(
      (row: QuestionRow) => {
        const correctCount = (row.choices || []).filter(
          (c) => c.is_correct
        ).length;

        return {
          id: row.id,
          stem: row.stem,
          code_snippet: row.code_snippet,
          code_language: row.code_language,
          topic_title: row.topic_title,
          allowMultiple: correctCount > 1,
          choices: (row.choices || []).map((c) => ({
            id: c.id,
            body: c.body,
            order_index: c.order_index,
          })),
        };
      }
    );

    return questions;
  } catch (error) {
    console.error('Error getting self-assessment questions:', error);
    return [];
  }
}

// Vista docente (spec-031): misma consulta y mismo orden que
// getSelfAssessmentForLesson, pero propaga is_correct en vez de descartarlo.
// Solo el docente dueño o un admin pueden obtener esta clave de respuestas;
// el gate vive aquí (no solo en la página) porque es una Server Action
// invocable directamente.
export async function getAnswerKeyForLesson(
  courseSlug: string,
  lessonSlug: string
): Promise<AnswerKeyQuestion[]> {
  const access = await hasCourseAccess(courseSlug);
  if (!access.ok || (access.reason !== 'owner' && access.reason !== 'admin')) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        id,
        stem,
        code_snippet,
        code_language,
        topic_title,
        choices:question_choices(id, body, order_index, is_correct)
      `
      )
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('type', 'multiple_choice')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const questions: AnswerKeyQuestion[] = (data as QuestionRow[] | null || []).map(
      (row: QuestionRow) => {
        const correctCount = (row.choices || []).filter(
          (c) => c.is_correct
        ).length;

        return {
          id: row.id,
          stem: row.stem,
          code_snippet: row.code_snippet,
          code_language: row.code_language,
          topic_title: row.topic_title,
          allowMultiple: correctCount > 1,
          choices: (row.choices || []).map((c) => ({
            id: c.id,
            body: c.body,
            order_index: c.order_index,
            is_correct: c.is_correct,
          })),
        };
      }
    );

    return questions;
  } catch (error) {
    console.error('Error getting answer key questions:', error);
    return [];
  }
}

export async function checkSelfAssessmentAnswer(
  courseSlug: string,
  lessonSlug: string,
  questionId: string,
  selectedChoiceIds: string[]
): Promise<CheckAnswerResult> {
  // Validación de input
  const schema = z.object({
    courseSlug: z.string().min(1),
    lessonSlug: z.string().min(1),
    questionId: z.string().uuid(),
    selectedChoiceIds: z.array(z.string().uuid()),
  });

  try {
    schema.parse({
      courseSlug,
      lessonSlug,
      questionId,
      selectedChoiceIds,
    });
  } catch (err) {
    return { ok: false, error: 'Entrada inválida' };
  }

  // Reverificar matrícula
  const access = await hasCourseAccess(courseSlug);
  if (!access.ok || access.reason !== 'enrolled') {
    return { ok: false, error: 'No autorizado' };
  }

  const supabase = await createServerSupabaseClient();

  try {
    // Verificar que la pregunta es multiple_choice, publicada y pertenece a la lección
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, type, is_published')
      .eq('id', questionId)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('type', 'multiple_choice')
      .eq('is_published', true)
      .single();

    if (questionError || !question) {
      return { ok: false, error: 'Pregunta no encontrada' };
    }

    // Obtener todas las opciones de la pregunta con is_correct
    const { data: choices, error: choicesError } = await supabase
      .from('question_choices')
      .select('id, is_correct')
      .eq('question_id', questionId);

    if (choicesError || !choices) {
      return { ok: false, error: 'Error al obtener opciones' };
    }

    // Identificar opciones correctas
    const correctChoiceIds = choices
      .filter((c: { id: string; is_correct: boolean }) => c.is_correct)
      .map((c: { id: string; is_correct: boolean }) => c.id);

    // Verificar respuesta: el estudiante acertó si seleccionó TODAS las correctas y NINGUNA incorrecta
    const selectedCorrectIds = selectedChoiceIds.filter((id) =>
      correctChoiceIds.includes(id)
    );

    const isCorrect =
      selectedChoiceIds.length === correctChoiceIds.length &&
      selectedCorrectIds.length === correctChoiceIds.length;

    return {
      ok: true,
      correct: isCorrect,
      correctChoiceIds,
      selectedCorrectIds,
    };
  } catch (err) {
    console.error('Error checking answer:', err);
    return { ok: false, error: 'Error al procesar respuesta' };
  }
}

export async function getSelfAssessmentStatus(
  courseSlug: string,
  lessonSlug: string
): Promise<SelfAssessmentStatus> {
  const user = await getCurrentUser();
  const supabase = await createServerSupabaseClient();

  try {
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id')
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('type', 'multiple_choice')
      .eq('is_published', true);

    if (qError) throw qError;
    const questionCount = (questions || []).length;

    if (!user) {
      return {
        questionCount,
        hasAttempt: false,
        requiresAttempt: questionCount > 0,
      };
    }

    const { data: attempts, error: aError } = await supabase
      .from('self_assessment_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .limit(1);

    if (aError) throw aError;
    const hasAttempt = (attempts || []).length > 0;

    return {
      questionCount,
      hasAttempt,
      requiresAttempt: questionCount > 0,
    };
  } catch (error) {
    console.error('Error getting self-assessment status:', error);
    return { questionCount: 0, hasAttempt: false, requiresAttempt: false };
  }
}

export async function submitSelfAssessment(
  courseSlug: string,
  lessonSlug: string,
  answers: Record<string, string[]>
): Promise<SubmitSelfAssessmentResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, reason: 'not_enrolled' };
  }

  const schema = z.record(z.string().uuid(), z.array(z.string().uuid()));
  try {
    schema.parse(answers);
  } catch (err) {
    return { ok: false, reason: 'error' };
  }

  const access = await hasCourseAccess(courseSlug);
  if (!access.ok || access.reason !== 'enrolled') {
    return { ok: false, reason: 'not_enrolled' };
  }

  const supabase = await createServerSupabaseClient();

  try {
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, type, is_published')
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('type', 'multiple_choice')
      .eq('is_published', true)
      .order('created_at', { ascending: true });

    if (qError || !questions) {
      return { ok: false, reason: 'error' };
    }

    const questionCount = questions.length;
    if (questionCount === 0) {
      return { ok: false, reason: 'no_questions' };
    }

    if (Object.keys(answers).length !== questionCount) {
      return { ok: false, reason: 'incomplete' };
    }

    const feedback: QuestionFeedback[] = [];
    let correctCount = 0;

    for (const question of questions) {
      const selectedChoiceIds = answers[question.id] || [];

      const { data: choices, error: choicesError } = await supabase
        .from('question_choices')
        .select('id, is_correct')
        .eq('question_id', question.id);

      if (choicesError || !choices) {
        return { ok: false, reason: 'error' };
      }

      const correctChoiceIds = choices
        .filter((c: { id: string; is_correct: boolean }) => c.is_correct)
        .map((c: { id: string; is_correct: boolean }) => c.id);

      const selectedCorrectIds = selectedChoiceIds.filter((id) =>
        correctChoiceIds.includes(id)
      );

      const isCorrect =
        selectedChoiceIds.length === correctChoiceIds.length &&
        selectedCorrectIds.length === correctChoiceIds.length;

      if (isCorrect) correctCount++;

      feedback.push({
        questionId: question.id,
        correct: isCorrect,
        correctChoiceIds,
        selectedCorrectIds,
      });
    }

    const { error: insertError } = await supabase
      .from('self_assessment_attempts')
      .insert({
        user_id: user.id,
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        question_count: questionCount,
        answered_count: questionCount,
        correct_count: correctCount,
      });

    if (insertError) {
      console.error('Error inserting attempt:', insertError);
      return { ok: false, reason: 'error' };
    }

    revalidatePath(`/${courseSlug}/${lessonSlug}`);

    return { ok: true, feedback };
  } catch (error) {
    console.error('Error submitting self-assessment:', error);
    return { ok: false, reason: 'error' };
  }
}
