'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/auth/server';
import { createServiceSupabaseClient } from '@/lib/auth/service';
import { getCurrentUser } from '@/lib/auth/session';
import { hasCourseAccess } from '@/lib/enrollments/access';
import { seededShuffle } from '@/lib/shuffle';
import { getCourseBySlug } from '@/lib/courses';
import type {
  SelfAssessmentQuestion,
  AnswerKeyQuestion,
  CheckAnswerResult,
  QuestionFeedback,
  SelfAssessmentStatus,
  SubmitSelfAssessmentResult,
  AttemptReview,
  AttemptReviewQuestion,
  SelfAssessmentCourseSummary,
  SelfAssessmentLessonRow,
} from './types';

type ChoiceRow = {
  id: string;
  body: string;
  order_index: number;
  is_correct: boolean;
};

// spec-042: la pregunta ya no vive en questions.course_slug/lesson_slug —
// se lee desde el montaje (lesson_questions), embebiendo la pregunta con
// questions!inner para que el filtro de type/is_published excluya montajes
// que ya no califican (borrador, o un tipo distinto a multiple_choice).
type LessonQuestionRow = {
  order_index: number;
  question: {
    id: string;
    stem: string;
    code_snippet: string | null;
    code_language: string | null;
    topic_title: string | null;
    created_at: string;
    choices: ChoiceRow[];
  };
};

type AttemptRow = {
  question_count: number;
  correct_count: number;
  submitted_at: string;
};

// D4: mismo desempate en los 4 puntos de lectura que dependen del orden de
// las preguntas (este, getAnswerKeyForLesson, submitSelfAssessment,
// getAttemptReview) — order_index del montaje, luego questions.created_at,
// luego questions.id. Si diverge entre puntos, el estudiante ve un orden y
// la revisión otro.
// Genérica sobre la forma mínima que necesita (order_index + id/created_at de
// la pregunta) para que la reutilicen tanto las consultas completas (con
// choices) como las livianas (submitSelfAssessment, que no necesita choices
// en este punto) — un solo lugar define el desempate, no una copia por sitio.
function sortByMountOrder<T extends { order_index: number; question: { id: string; created_at: string } }>(
  rows: T[]
): T[] {
  return [...rows].sort((a, b) => {
    if (a.order_index !== b.order_index) return a.order_index - b.order_index;
    const createdDiff =
      new Date(a.question.created_at).getTime() - new Date(b.question.created_at).getTime();
    if (createdDiff !== 0) return createdDiff;
    return a.question.id.localeCompare(b.question.id);
  });
}

const LESSON_QUESTIONS_SELECT = `
  order_index,
  question:questions!inner(
    id,
    stem,
    code_snippet,
    code_language,
    topic_title,
    created_at,
    choices:question_choices(id, body, order_index, is_correct)
  )
`;

export async function getSelfAssessmentForLesson(
  courseSlug: string,
  lessonSlug: string
): Promise<SelfAssessmentQuestion[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const user = await getCurrentUser();

    // Punto 1 (spec-042): las preguntas de la lección salen del montaje, no
    // de columnas directas de questions.
    const { data, error } = await supabase
      .from('lesson_questions')
      .select(LESSON_QUESTIONS_SELECT)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('question.type', 'multiple_choice')
      .eq('question.is_published', true);

    if (error) throw error;

    const rows = sortByMountOrder((data as unknown as LessonQuestionRow[] | null) ?? []);

    // Punto 2 (spec-042): se conserva intacto el barajado por estudiante
    // (spec-034) — solo cambia de dónde sale la fila. Las opciones se
    // ordenan por order_index en TS (en vez de vía embed de PostgREST, que
    // no soporta ordenar de forma fiable un embed anidado a dos niveles) para
    // fijar la ENTRADA canónica del barajado; sin esto, seededShuffle
    // produciría un resultado distinto al histórico.
    const questions: SelfAssessmentQuestion[] = rows.map((row) => {
      const q = row.question;
      const orderedChoices = [...q.choices].sort((a, b) => a.order_index - b.order_index);
      const correctCount = orderedChoices.filter((c) => c.is_correct).length;

      // Sembrado por (usuario, pregunta): estable para ese estudiante en esa
      // pregunta entre recargas y router.refresh(); distinto entre estudiantes.
      const seed = user ? `${user.id}:${q.id}` : q.id;
      const shuffledChoices = seededShuffle(orderedChoices, seed);

      return {
        id: q.id,
        stem: q.stem,
        code_snippet: q.code_snippet,
        code_language: q.code_language,
        topic_title: q.topic_title,
        allowMultiple: correctCount > 1,
        choices: shuffledChoices.map((c) => ({
          id: c.id,
          body: c.body,
          order_index: c.order_index,
        })),
      };
    });

    return questions;
  } catch (error) {
    console.error('Error getting self-assessment questions:', error);
    return [];
  }
}

// Vista docente (spec-031): misma consulta y mismo orden que
// getSelfAssessmentForLesson, pero propaga is_correct en vez de descartarlo
// y NO baraja (spec-034 Fase 1: la clave del docente va en orden canónico).
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

  try {
    const supabase = await createServerSupabaseClient();

    // Punto 3 (spec-042): mismo cambio de origen que Punto 1.
    const { data, error } = await supabase
      .from('lesson_questions')
      .select(LESSON_QUESTIONS_SELECT)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('question.type', 'multiple_choice')
      .eq('question.is_published', true);

    if (error) throw error;

    const rows = sortByMountOrder((data as unknown as LessonQuestionRow[] | null) ?? []);

    const questions: AnswerKeyQuestion[] = rows.map((row) => {
      const q = row.question;
      const orderedChoices = [...q.choices].sort((a, b) => a.order_index - b.order_index);
      const correctCount = orderedChoices.filter((c) => c.is_correct).length;

      return {
        id: q.id,
        stem: q.stem,
        code_snippet: q.code_snippet,
        code_language: q.code_language,
        topic_title: q.topic_title,
        allowMultiple: correctCount > 1,
        choices: orderedChoices.map((c) => ({
          id: c.id,
          body: c.body,
          order_index: c.order_index,
          is_correct: c.is_correct,
        })),
      };
    });

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

  try {
    const supabase = await createServerSupabaseClient();

    // Punto 4 (spec-042): "la pregunta pertenece a esta lección" pasa de dos
    // .eq() sobre questions a comprobar que existe el montaje, con la
    // pregunta embebida vía !inner filtrando type/is_published.
    const { data: mount, error: mountError } = await supabase
      .from('lesson_questions')
      .select('question:questions!inner(id)')
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('question_id', questionId)
      .eq('question.type', 'multiple_choice')
      .eq('question.is_published', true)
      .maybeSingle();

    if (mountError || !mount) {
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

  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch (error) {
    console.error('Error getting self-assessment status:', error);
    return { status: 'unavailable' };
  }

  try {
    // Punto 5 (spec-042): el conteo pasa de una columna directa a contar
    // montajes con la pregunta embebida vía !inner. Fail-closed sin cambios
    // (D8 de spec-037, ver catch): si esta consulta falla, 'unavailable',
    // nunca requiresAttempt: false.
    const { data: mounts, error: qError } = await supabase
      .from('lesson_questions')
      .select('question:questions!inner(id)')
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('question.type', 'multiple_choice')
      .eq('question.is_published', true);

    if (qError) throw qError;
    const questionCount = (mounts || []).length;

    if (!user) {
      return {
        status: 'ok',
        questionCount,
        hasAttempt: false,
        requiresAttempt: questionCount > 0,
        lastAttempt: null,
      };
    }

    const { data: attempts, error: aError } = await supabase
      .from('self_assessment_attempts')
      .select('question_count, correct_count, submitted_at')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .order('submitted_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .returns<AttemptRow[]>();

    if (aError) throw aError;
    const attempt = attempts?.[0];
    const hasAttempt = !!attempt;
    const lastAttempt = attempt
      ? {
          correctCount: attempt.correct_count,
          questionCount: attempt.question_count,
          submittedAt: attempt.submitted_at,
        }
      : null;

    return {
      status: 'ok',
      questionCount,
      hasAttempt,
      requiresAttempt: questionCount > 0,
      lastAttempt,
    };
  } catch (error) {
    // Fallar cerrado (D8 de spec-037): antes esto devolvía
    // `requiresAttempt: false`, que markLessonCompleted leía como "esta
    // lección no tiene autoevaluación" y dejaba completar sin responder.
    console.error('Error getting self-assessment status:', error);
    return { status: 'unavailable' };
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
  // spec-050: "unavailable" (el chequeo de matrícula falló por
  // infraestructura) ya no colapsa en "not_enrolled" — un estudiante
  // matriculado real no debe leer "No estás matriculado en este curso"
  // cuando lo que falló fue Postgres/RLS, no su matrícula.
  if (!access.ok && access.reason === 'unavailable') {
    return { ok: false, reason: 'unavailable' };
  }
  if (!access.ok || access.reason !== 'enrolled') {
    return { ok: false, reason: 'not_enrolled' };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // spec-040 D1, capa 2: comprobación previa. No es atómica respecto del
    // insert (capa 3, la constraint `unique`, es la que resiste la carrera),
    // pero evita el trabajo de calificar cuando ya se sabe que va a fallar.
    const { data: existing, error: existingError } = await supabase
      .from('self_assessment_attempts')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing attempt:', existingError);
      return { ok: false, reason: 'error' };
    }
    if (existing) {
      return { ok: false, reason: 'already_submitted' };
    }

    // Punto 6 (spec-042): el conjunto de preguntas a calificar sale del
    // mismo origen y el mismo desempate que Punto 1 (D4, sortByMountOrder) —
    // debe ser EXACTAMENTE el conjunto que el estudiante vio, o
    // Object.keys(answers).length !== questionCount (abajo) rechaza el envío
    // como incompleto. Sin `choices` acá: se piden por pregunta más abajo.
    type MountedQuestionRow = {
      order_index: number;
      question: { id: string; created_at: string };
    };

    const { data: mountRows, error: qError } = await supabase
      .from('lesson_questions')
      .select('order_index, question:questions!inner(id, created_at)')
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .eq('question.type', 'multiple_choice')
      .eq('question.is_published', true);

    if (qError || !mountRows) {
      return { ok: false, reason: 'error' };
    }

    const questions = sortByMountOrder((mountRows as unknown as MountedQuestionRow[]) ?? []).map(
      (row) => ({ id: row.question.id })
    );

    const questionCount = questions.length;
    if (questionCount === 0) {
      return { ok: false, reason: 'no_questions' };
    }

    if (Object.keys(answers).length !== questionCount) {
      return { ok: false, reason: 'incomplete' };
    }

    const feedback: QuestionFeedback[] = [];
    const answerRows: {
      question_id: string;
      selected_choice_ids: string[];
      is_correct: boolean;
    }[] = [];
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
      answerRows.push({
        question_id: question.id,
        selected_choice_ids: selectedChoiceIds,
        is_correct: isCorrect,
      });
    }

    const { data: attempt, error: insertError } = await supabase
      .from('self_assessment_attempts')
      .insert({
        user_id: user.id,
        course_slug: courseSlug,
        lesson_slug: lessonSlug,
        question_count: questionCount,
        answered_count: questionCount,
        correct_count: correctCount,
      })
      .select('id')
      .single();

    if (insertError) {
      // spec-040 D1, capa 3: la constraint `unique (user_id, course_slug,
      // lesson_slug)` es la única capa que resiste una carrera real (doble
      // clic, dos pestañas). 23505 = unique_violation de Postgres.
      if (insertError.code === '23505') {
        return { ok: false, reason: 'already_submitted' };
      }
      console.error('Error inserting attempt:', insertError);
      return { ok: false, reason: 'error' };
    }

    // spec-040 D3: persistir la revisión por pregunta — sin reintentos, es la
    // única forma de que el estudiante vea después qué falló.
    const { error: answersError } = await supabase
      .from('self_assessment_attempt_answers')
      .insert(
        answerRows.map((row) => ({ attempt_id: attempt.id, ...row }))
      );
    if (answersError) {
      // El intento ya quedó registrado (es lo que cuenta para el gate y para
      // la nota); un fallo aquí solo pierde el detalle de revisión, así que
      // se registra pero no se revierte el envío.
      console.error('Error inserting attempt answers:', answersError);
    }

    // spec-040 D4: recalcular la nota tras el envío (sube numerador y
    // denominador). Un fallo aquí no debe impedir que el envío cuente como
    // exitoso: el docente puede recalcular manualmente (Fase 5).
    const { error: recalcError } = await supabase.rpc(
      'recalculate_self_assessment_grade',
      { p_course_slug: courseSlug }
    );
    if (recalcError) {
      console.error('Error recalculating self-assessment grade:', recalcError);
    }

    revalidatePath(`/${courseSlug}/${lessonSlug}`);
    revalidatePath('/cuenta/cursos');

    return { ok: true, feedback };
  } catch (error) {
    console.error('Error submitting self-assessment:', error);
    return { ok: false, reason: 'error' };
  }
}

// spec-040 D3: revisión permanente del intento único, para que sobreviva a
// la recarga. `null` si el estudiante todavía no respondió.
export async function getAttemptReview(
  courseSlug: string,
  lessonSlug: string
): Promise<AttemptReview | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = await createServerSupabaseClient();

    const { data: attempt, error: attemptError } = await supabase
      .from('self_assessment_attempts')
      .select('id, submitted_at, question_count, correct_count')
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug)
      .maybeSingle();

    if (attemptError) throw attemptError;
    if (!attempt) return null;

    // Punto 7 (spec-042): mapa question_id → order_index del montaje VIGENTE
    // de esta lección. Puede faltar alguna pregunta que el estudiante
    // respondió y que luego se desmontó de esta lección — para esas, el
    // desempate cae a created_at/id (mismo criterio de D4), en vez de perder
    // la fila de la revisión.
    const { data: mountRows, error: mountsError } = await supabase
      .from('lesson_questions')
      .select('question_id, order_index')
      .eq('course_slug', courseSlug)
      .eq('lesson_slug', lessonSlug);

    if (mountsError) throw mountsError;

    const orderIndexByQuestionId = new Map<string, number>(
      (mountRows ?? []).map((m) => [m.question_id as string, m.order_index as number])
    );

    const { data: answerRows, error: answersError } = await supabase
      .from('self_assessment_attempt_answers')
      .select(
        `
        question_id,
        selected_choice_ids,
        is_correct,
        questions (
          stem,
          code_snippet,
          code_language,
          topic_title,
          created_at,
          choices:question_choices(id, body, order_index, is_correct)
        )
      `
      )
      .eq('attempt_id', attempt.id);

    if (answersError) throw answersError;

    type AnswerRow = {
      question_id: string;
      selected_choice_ids: string[];
      is_correct: boolean;
      questions: {
        stem: string;
        code_snippet: string | null;
        code_language: string | null;
        topic_title: string | null;
        created_at: string;
        choices: ChoiceRow[];
      } | null;
    };

    const answers: AttemptReviewQuestion[] = ((answerRows as unknown as AnswerRow[] | null) ?? [])
      .filter((row): row is AnswerRow & { questions: NonNullable<AnswerRow['questions']> } =>
        row.questions !== null
      )
      .sort((a, b) => {
        const orderA = orderIndexByQuestionId.get(a.question_id);
        const orderB = orderIndexByQuestionId.get(b.question_id);

        if (orderA !== undefined && orderB !== undefined && orderA !== orderB) {
          return orderA - orderB;
        }
        // Montada (con order_index vigente) siempre antes que desmontada.
        if (orderA !== undefined && orderB === undefined) return -1;
        if (orderA === undefined && orderB !== undefined) return 1;

        // Empate de order_index, o ambas desmontadas de esta lección desde
        // que se respondió: mismo desempate que el resto (D4).
        const createdDiff =
          new Date(a.questions.created_at).getTime() - new Date(b.questions.created_at).getTime();
        if (createdDiff !== 0) return createdDiff;
        return a.question_id.localeCompare(b.question_id);
      })
      .map((row) => {
        const choices = [...row.questions.choices].sort(
          (a, b) => a.order_index - b.order_index
        );
        const correctCount = choices.filter((c) => c.is_correct).length;
        const selected = new Set(row.selected_choice_ids);

        return {
          questionId: row.question_id,
          stem: row.questions.stem,
          code_snippet: row.questions.code_snippet,
          code_language: row.questions.code_language,
          topic_title: row.questions.topic_title,
          allowMultiple: correctCount > 1,
          isCorrect: row.is_correct,
          choices: choices.map((c) => ({
            id: c.id,
            body: c.body,
            order_index: c.order_index,
            is_correct: c.is_correct,
            was_selected: selected.has(c.id),
          })),
        };
      });

    return {
      submittedAt: attempt.submitted_at,
      correctCount: attempt.correct_count,
      questionCount: attempt.question_count,
      answers,
    };
  } catch (error) {
    console.error('Error getting attempt review:', error);
    return null;
  }
}

type SelfAssessmentBreakdownRow = {
  lesson_slug: string;
  question_count: number;
  correct_count: number;
  answered: boolean;
};

// Agregación compartida entre el camino del estudiante y el del docente:
// mismo cálculo que la propagación a la libreta (D4), para que nunca se
// vean números distintos entre la UI y la nota real.
async function buildCourseSummaryFromBreakdown(
  courseSlug: string,
  rows: SelfAssessmentBreakdownRow[] | null
): Promise<SelfAssessmentCourseSummary> {
  const breakdown = rows ?? [];

  const course = await getCourseBySlug(courseSlug);
  const lessonOrder = new Map(
    (course?.lessons ?? []).map((l) => [l.slug, { title: l.title, order: l.order }])
  );

  const questionTotal = breakdown.reduce((sum, r) => sum + r.question_count, 0);
  const correctTotal = breakdown.reduce((sum, r) => sum + r.correct_count, 0);
  // D4: sin nada evaluable la nota es NULL, no 0 (un 0 se lee como reprobado).
  const score =
    questionTotal > 0 ? Math.round((correctTotal / questionTotal) * 5 * 100) / 100 : null;

  const lessons: SelfAssessmentLessonRow[] = breakdown
    .filter((r) => r.question_count > 0)
    .map((r) => ({
      lessonSlug: r.lesson_slug,
      lessonTitle: lessonOrder.get(r.lesson_slug)?.title ?? r.lesson_slug,
      answered: r.answered,
      correctCount: r.correct_count,
      questionCount: r.question_count,
    }))
    .sort(
      (a, b) =>
        (lessonOrder.get(a.lessonSlug)?.order ?? 0) -
        (lessonOrder.get(b.lessonSlug)?.order ?? 0)
    );

  return { score, correctTotal, questionTotal, lessons };
}

// spec-040 D4/D7: nota acumulada del curso, leída del RPC canónico
// `self_assessment_breakdown` (mismo cálculo que usa la propagación a la
// libreta, para que estudiante y docente nunca vean números distintos).
// Punto 8 (spec-042): el RPC en sí resuelve ahora vía lesson_questions — ver
// supabase/migrations/20260806000006_self_assessment_breakdown_via_lesson_questions.sql.
// Esta función y la de abajo no cambian: consumen el RPC por firma.
export async function getSelfAssessmentCourseSummary(
  courseSlug: string
): Promise<SelfAssessmentCourseSummary | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = await createServerSupabaseClient();

    const { data: rows, error } = await supabase.rpc('self_assessment_breakdown', {
      p_user_id: user.id,
      p_course_slug: courseSlug,
    });
    if (error) throw error;

    return await buildCourseSummaryFromBreakdown(
      courseSlug,
      rows as SelfAssessmentBreakdownRow[] | null
    );
  } catch (error) {
    console.error('Error getting self-assessment course summary:', error);
    return null;
  }
}

// spec-040 Fase 5 (D7): desglose por estudiante para el docente ("¿por qué
// tengo 3.2?"), accesible desde la libreta. `self_assessment_breakdown` no
// es security definer, así que hereda RLS del rol que la invoca — y
// `lesson_progress`/`self_assessment_attempts` solo permiten leer las
// propias filas o con rol admin (ver RLS de esas tablas). Un docente
// (no-admin) no tiene ese permiso, así que esta función valida la propiedad
// del curso académico en la sesión del usuario y luego lee con
// `service_role`, igual que las rutas de servicio del proyecto.
export async function getSelfAssessmentBreakdownForEnrollment(
  enrollmentId: string,
  academicCourseId: string
): Promise<SelfAssessmentCourseSummary | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const supabase = await createServerSupabaseClient();

    const { data: academicCourse } = await supabase
      .from('academic_courses')
      .select('teacher_id, course_slug')
      .eq('id', academicCourseId)
      .maybeSingle();
    if (!academicCourse || !academicCourse.course_slug) return null;

    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const isAuthorized = academicCourse.teacher_id === user.id || !!adminRole;
    if (!isAuthorized) return null;

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('id', enrollmentId)
      .eq('academic_course_id', academicCourseId)
      .maybeSingle();
    if (!enrollment) return null;

    const serviceSupabase = createServiceSupabaseClient();
    const { data: rows, error } = await serviceSupabase.rpc('self_assessment_breakdown', {
      p_user_id: enrollment.student_id,
      p_course_slug: academicCourse.course_slug,
    });
    if (error) throw error;

    return await buildCourseSummaryFromBreakdown(
      academicCourse.course_slug,
      rows as SelfAssessmentBreakdownRow[] | null
    );
  } catch (error) {
    console.error('Error getting self-assessment breakdown for teacher:', error);
    return null;
  }
}
