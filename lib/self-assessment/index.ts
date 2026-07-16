'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/auth/server';
import { hasCourseAccess } from '@/lib/enrollments/access';
import type { SelfAssessmentQuestion, CheckAnswerResult } from './types';

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
