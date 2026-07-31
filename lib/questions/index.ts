import { createServerSupabaseClient } from "@/lib/auth/server";
import type {
  Question,
  QuestionChoice,
  QuestionRubric,
  CodingChallengeTest,
  QuestionWithDetails,
  QuestionInput,
  QuestionContext,
} from "./types";

async function _getQuestionsByActor(
  context: QuestionContext,
  filters?: {
    courseSlug?: string;
    lessonSlug?: string;
    type?: string;
    difficulty?: number;
    tag?: string;
    isPublished?: boolean;
    q?: string;
    limit?: number;
    offset?: number;
  }
): Promise<QuestionWithDetails[]> {
  const { supabase, actorId } = context;

  let query = supabase
    .from("questions")
    .select(
      `*, choices:question_choices(*), rubric:question_rubrics(*), challenge_tests:coding_challenge_tests(*), author:profiles(full_name)`
    );

  query = query.or(`created_by.eq.${actorId},is_published.eq.true`);

  if (filters?.courseSlug) {
    query = query.eq("course_slug", filters.courseSlug);
  }
  if (filters?.lessonSlug) {
    query = query.eq("lesson_slug", filters.lessonSlug);
  }
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.difficulty !== undefined) {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters?.tag) {
    query = query.contains("tags", [filters.tag]);
  }
  if (filters?.isPublished !== undefined) {
    query = query.eq("is_published", filters.isPublished);
  }
  if (filters?.q) {
    query = query.ilike("stem", `%${filters.q}%`);
  }

  query = query.order("created_at", { ascending: false });

  if (filters?.limit) {
    query = query.limit(Math.min(filters.limit, 100));
  }
  if (filters?.offset !== undefined) {
    query = query.range(filters.offset, (filters.offset ?? 0) + (filters?.limit ?? 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapQuestionRow);
}

async function _getQuestionByIdForActor(
  context: QuestionContext,
  questionId: string
): Promise<QuestionWithDetails | null> {
  const { supabase, actorId } = context;

  const { data, error } = await supabase
    .from("questions")
    .select(
      `*, choices:question_choices(*), rubric:question_rubrics(*), challenge_tests:coding_challenge_tests(*), author:profiles(full_name)`
    )
    .eq("id", questionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  if (data.created_by !== actorId && !data.is_published) {
    return null;
  }

  return mapQuestionRow(data);
}

async function _createQuestionForActor(
  context: QuestionContext,
  input: QuestionInput
): Promise<Question> {
  const { supabase, actorId } = context;

  const { choices, rubric, challenge_tests, ...questionFields } = input;

  const { data: question, error } = await supabase
    .from("questions")
    .insert({ ...questionFields, created_by: actorId })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await Promise.all([
    choices?.length
      ? supabase
          .from("question_choices")
          .insert(choices.map((c) => ({ ...c, question_id: question.id })))
      : Promise.resolve(),
    rubric
      ? supabase
          .from("question_rubrics")
          .insert({ ...rubric, question_id: question.id })
      : Promise.resolve(),
    challenge_tests?.length
      ? supabase
          .from("coding_challenge_tests")
          .insert(
            challenge_tests.map((t) => ({ ...t, question_id: question.id }))
          )
      : Promise.resolve(),
  ]);

  return question;
}

async function _updateQuestionForActor(
  context: QuestionContext,
  questionId: string,
  input: QuestionInput
): Promise<Question | null> {
  const { supabase, actorId } = context;

  const { data: existing } = await supabase
    .from("questions")
    .select("id, created_by")
    .eq("id", questionId)
    .single();

  if (!existing || existing.created_by !== actorId) {
    return null;
  }

  const { choices, rubric, challenge_tests, ...questionFields } = input;

  const { data: question, error } = await supabase
    .from("questions")
    .update(questionFields)
    .eq("id", questionId)
    .select()
    .single();

  if (error || !question) return null;

  await Promise.all([
    supabase.from("question_choices").delete().eq("question_id", questionId),
    supabase.from("question_rubrics").delete().eq("question_id", questionId),
    supabase
      .from("coding_challenge_tests")
      .delete()
      .eq("question_id", questionId),
  ]);

  await Promise.all([
    choices?.length
      ? supabase
          .from("question_choices")
          .insert(choices.map((c) => ({ ...c, question_id: questionId })))
      : Promise.resolve(),
    rubric
      ? supabase
          .from("question_rubrics")
          .insert({ ...rubric, question_id: questionId })
      : Promise.resolve(),
    challenge_tests?.length
      ? supabase
          .from("coding_challenge_tests")
          .insert(
            challenge_tests.map((t) => ({ ...t, question_id: questionId }))
          )
      : Promise.resolve(),
  ]);

  return question;
}

async function _publishQuestionForActor(
  context: QuestionContext,
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, actorId } = context;

  const { data: q } = await supabase
    .from("questions")
    .select("type, created_by")
    .eq("id", questionId)
    .single();

  if (!q) return { ok: false, error: "Pregunta no encontrada." };
  if (q.created_by !== actorId) return { ok: false, error: "No autorizado." };

  if (q.type === "multiple_choice") {
    const { count } = await supabase
      .from("question_choices")
      .select("id", { count: "exact", head: true })
      .eq("question_id", questionId)
      .eq("is_correct", true);
    if (!count || count === 0) {
      return {
        ok: false,
        error: "Una pregunta de selección múltiple debe tener al menos una opción correcta.",
      };
    }
  }

  const { error } = await supabase
    .from("questions")
    .update({ is_published: true })
    .eq("id", questionId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function _deleteQuestionForActor(
  context: QuestionContext,
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, actorId } = context;

  const { data: existing } = await supabase
    .from("questions")
    .select("id, created_by")
    .eq("id", questionId)
    .single();

  if (!existing || existing.created_by !== actorId) {
    return { ok: false, error: "No encontrado." };
  }

  const { count } = await supabase
    .from("assignment_questions")
    .select("id", { count: "exact", head: true })
    .eq("question_id", questionId);

  if (count && count > 0) {
    return {
      ok: false,
      error: "No se puede eliminar una pregunta que ya está siendo usada en una asignación.",
    };
  }

  await supabase.from("questions").delete().eq("id", questionId);
  return { ok: true };
}

export async function getQuestionsByTeacher(): Promise<QuestionWithDetails[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  return _getQuestionsByActor({ supabase, actorId: user.id });
}

export async function getQuestionById(
  questionId: string
): Promise<QuestionWithDetails | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return _getQuestionByIdForActor({ supabase, actorId: user.id }, questionId);
}

export async function createQuestion(
  input: QuestionInput
): Promise<Question> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  return _createQuestionForActor({ supabase, actorId: user.id }, input);
}

export async function updateQuestion(
  questionId: string,
  input: QuestionInput
): Promise<Question | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return _updateQuestionForActor({ supabase, actorId: user.id }, questionId, input);
}

export async function publishQuestion(
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  return _publishQuestionForActor({ supabase, actorId: user.id }, questionId);
}

export async function deleteQuestion(
  questionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  return _deleteQuestionForActor({ supabase, actorId: user.id }, questionId);
}

export {
  _getQuestionsByActor,
  _getQuestionByIdForActor,
  _createQuestionForActor,
  _updateQuestionForActor,
  _publishQuestionForActor,
  _deleteQuestionForActor,
};

export function mapQuestionRow(row: Record<string, unknown>): QuestionWithDetails {
  const author = row.author as { full_name: string } | null;
  const rubricRaw = row.rubric as QuestionRubric[] | QuestionRubric | null;
  const rubric = Array.isArray(rubricRaw)
    ? (rubricRaw[0] ?? null)
    : (rubricRaw ?? null);

  return {
    id: row.id as string,
    created_by: row.created_by as string,
    course_slug: row.course_slug as string | null,
    lesson_slug: row.lesson_slug as string | null,
    topic_title: row.topic_title as string | null,
    type: row.type as Question["type"],
    stem: row.stem as string,
    code_snippet: row.code_snippet as string | null,
    code_language: row.code_language as string | null,
    difficulty: row.difficulty as number,
    tags: (row.tags as string[]) ?? [],
    is_published: row.is_published as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    choices: (row.choices as QuestionChoice[]) ?? [],
    rubric,
    challenge_tests: (row.challenge_tests as CodingChallengeTest[]) ?? [],
    author_name: author?.full_name,
  };
}
