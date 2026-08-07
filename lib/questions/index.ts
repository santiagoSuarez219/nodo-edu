import { createServerSupabaseClient } from "@/lib/auth/server";
import { assertKeywordsExist } from "@/lib/keywords/index";
import type {
  Question,
  QuestionChoice,
  QuestionRubric,
  CodingChallengeTest,
  QuestionWithDetails,
  QuestionInput,
  QuestionContext,
  QuestionWriteResult,
  LessonMount,
  LessonQuestionEntry,
  MountResult,
  UnmountResult,
  ReorderResult,
} from "./types";

const QUESTION_SELECT = `*, choices:question_choices(*), rubric:question_rubrics(*), challenge_tests:coding_challenge_tests(*), author:profiles(full_name), keyword_rows:question_keywords(keyword_slug), lessons:lesson_questions(course_slug, lesson_slug, order_index)`;

async function _getQuestionsByActor(
  context: QuestionContext,
  filters?: {
    courseSlug?: string;
    lessonSlug?: string;
    type?: string;
    difficulty?: number;
    keyword?: string;
    isPublished?: boolean;
    q?: string;
    limit?: number;
    offset?: number;
  }
): Promise<QuestionWithDetails[]> {
  const { supabase, actorId } = context;

  // spec-042: course_slug/lesson_slug conservan el nombre del filtro (D6) pero
  // ahora resuelven vía lesson_questions, no columnas directas de questions.
  let questionIds: string[] | null = null;
  if (filters?.courseSlug || filters?.lessonSlug) {
    let mountQuery = supabase.from("lesson_questions").select("question_id");
    if (filters.courseSlug) mountQuery = mountQuery.eq("course_slug", filters.courseSlug);
    if (filters.lessonSlug) mountQuery = mountQuery.eq("lesson_slug", filters.lessonSlug);

    const { data: mounts, error: mountError } = await mountQuery;
    if (mountError) throw new Error(mountError.message);

    questionIds = (mounts ?? []).map((m) => m.question_id as string);
    if (questionIds.length === 0) return [];
  }

  // spec-042: `tag` → `keyword`, ahora resuelve vía question_keywords.
  let keywordQuestionIds: string[] | null = null;
  if (filters?.keyword) {
    const { data: kws, error: kwError } = await supabase
      .from("question_keywords")
      .select("question_id")
      .eq("keyword_slug", filters.keyword);
    if (kwError) throw new Error(kwError.message);

    keywordQuestionIds = (kws ?? []).map((k) => k.question_id as string);
    if (keywordQuestionIds.length === 0) return [];
  }

  let query = supabase.from("questions").select(QUESTION_SELECT);

  query = query.or(`created_by.eq.${actorId},is_published.eq.true`);

  if (questionIds) {
    query = query.in("id", questionIds);
  }
  if (keywordQuestionIds) {
    query = query.in("id", keywordQuestionIds);
  }
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.difficulty !== undefined) {
    query = query.eq("difficulty", filters.difficulty);
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
    .select(QUESTION_SELECT)
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
): Promise<QuestionWriteResult> {
  const { supabase, actorId } = context;

  const { choices, rubric, challenge_tests, keywords, ...questionFields } = input;

  // D3: se valida el catálogo ANTES de escribir nada — una keyword
  // inexistente no crea la pregunta, y se listan TODAS las faltantes.
  const keywordCheck = await assertKeywordsExist(context, keywords ?? []);
  if (!keywordCheck.ok) {
    return { ok: false, reason: "invalid_keywords", missing: keywordCheck.missing };
  }

  const { data: question, error } = await supabase
    .from("questions")
    .insert({ ...questionFields, created_by: actorId })
    .select()
    .single();

  if (error) return { ok: false, reason: "error", error: error.message };

  const detailResults = await Promise.all([
    choices?.length
      ? supabase
          .from("question_choices")
          .insert(choices.map((c) => ({ ...c, question_id: question.id })))
      : Promise.resolve({ error: null }),
    rubric
      ? supabase
          .from("question_rubrics")
          .insert({ ...rubric, question_id: question.id })
      : Promise.resolve({ error: null }),
    challenge_tests?.length
      ? supabase
          .from("coding_challenge_tests")
          .insert(
            challenge_tests.map((t) => ({ ...t, question_id: question.id }))
          )
      : Promise.resolve({ error: null }),
    keywords?.length
      ? supabase
          .from("question_keywords")
          .insert(keywords.map((slug) => ({ question_id: question.id, keyword_slug: slug })))
      : Promise.resolve({ error: null }),
  ]);

  // No se descartan los errores de estos inserts (DEBT-040): si alguno falla
  // (p. ej. una keyword borrada entre la validación de D3 y este insert), la
  // pregunta ya existe con datos parciales — se reporta en vez de devolver
  // `ok: true` con un estado incompleto y sin señal para el agente.
  const detailError = detailResults.find((r) => r.error)?.error;
  if (detailError) {
    return {
      ok: false,
      reason: "error",
      error: `La pregunta se creó (id ${question.id}) pero falló al guardar sus detalles: ${detailError.message}`,
    };
  }

  return { ok: true, question: question as Question };
}

async function _updateQuestionForActor(
  context: QuestionContext,
  questionId: string,
  input: QuestionInput
): Promise<QuestionWriteResult> {
  const { supabase, actorId } = context;

  const { data: existing } = await supabase
    .from("questions")
    .select("id, created_by")
    .eq("id", questionId)
    .single();

  if (!existing || existing.created_by !== actorId) {
    return { ok: false, reason: "not_found" };
  }

  const { choices, rubric, challenge_tests, keywords, ...questionFields } = input;

  const keywordCheck = await assertKeywordsExist(context, keywords ?? []);
  if (!keywordCheck.ok) {
    return { ok: false, reason: "invalid_keywords", missing: keywordCheck.missing };
  }

  const { data: question, error } = await supabase
    .from("questions")
    .update(questionFields)
    .eq("id", questionId)
    .select()
    .single();

  if (error || !question) {
    return { ok: false, reason: "error", error: error?.message ?? "No se pudo actualizar." };
  }

  // Reemplazo total del recurso (spec-005): choices, rubric, challenge_tests
  // Y ahora también keywords. lesson_questions NO se toca aquí (D6) — el
  // montaje se cambia solo con /api/questions/{id}/lessons.
  await Promise.all([
    supabase.from("question_choices").delete().eq("question_id", questionId),
    supabase.from("question_rubrics").delete().eq("question_id", questionId),
    supabase.from("coding_challenge_tests").delete().eq("question_id", questionId),
    supabase.from("question_keywords").delete().eq("question_id", questionId),
  ]);

  const detailResults = await Promise.all([
    choices?.length
      ? supabase
          .from("question_choices")
          .insert(choices.map((c) => ({ ...c, question_id: questionId })))
      : Promise.resolve({ error: null }),
    rubric
      ? supabase
          .from("question_rubrics")
          .insert({ ...rubric, question_id: questionId })
      : Promise.resolve({ error: null }),
    challenge_tests?.length
      ? supabase
          .from("coding_challenge_tests")
          .insert(
            challenge_tests.map((t) => ({ ...t, question_id: questionId }))
          )
      : Promise.resolve({ error: null }),
    keywords?.length
      ? supabase
          .from("question_keywords")
          .insert(keywords.map((slug) => ({ question_id: questionId, keyword_slug: slug })))
      : Promise.resolve({ error: null }),
  ]);

  // No se descartan los errores (DEBT-040): el borrado previo (:215-220) ya
  // se ejecutó, así que un fallo aquí deja la pregunta con detalles
  // incompletos (posiblemente sin keywords) — se reporta en vez de un
  // `ok: true` que oculta la pérdida.
  const detailError = detailResults.find((r) => r.error)?.error;
  if (detailError) {
    return {
      ok: false,
      reason: "error",
      error: `La pregunta se actualizó (id ${questionId}) pero falló al reescribir sus detalles: ${detailError.message}`,
    };
  }

  return { ok: true, question: question as Question };
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

  // lesson_questions y question_keywords se limpian solos (on delete cascade).
  await supabase.from("questions").delete().eq("id", questionId);
  return { ok: true };
}

// ─── Montaje de preguntas en lecciones (spec-042) ─────────────────────────

async function _mountQuestionInLesson(
  context: QuestionContext,
  questionId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<MountResult> {
  const { supabase, actorId } = context;

  const { data: question } = await supabase
    .from("questions")
    .select("id, created_by")
    .eq("id", questionId)
    .maybeSingle();

  if (!question || question.created_by !== actorId) {
    return { ok: false, reason: "not_found" };
  }

  // Idempotente: si ya está montada, se devuelve tal cual — no cambia su
  // order_index (evita que un mount repetido la mueva al final).
  const { data: existingMount } = await supabase
    .from("lesson_questions")
    .select("course_slug, lesson_slug, order_index")
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lessonSlug)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existingMount) {
    return { ok: true, mount: existingMount as LessonMount };
  }

  const { data: maxRow } = await supabase
    .from("lesson_questions")
    .select("order_index")
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lessonSlug)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderIndex = maxRow ? (maxRow.order_index as number) + 1 : 0;

  const { data: mount, error } = await supabase
    .from("lesson_questions")
    .insert({
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      question_id: questionId,
      order_index: nextOrderIndex,
      created_by: actorId,
    })
    .select("course_slug, lesson_slug, order_index")
    .single();

  if (error) return { ok: false, reason: "error", error: error.message };
  return { ok: true, mount: mount as LessonMount };
}

async function _unmountQuestionFromLesson(
  context: QuestionContext,
  questionId: string,
  courseSlug: string,
  lessonSlug: string
): Promise<UnmountResult> {
  const { supabase, actorId } = context;

  const { data: question } = await supabase
    .from("questions")
    .select("id, created_by")
    .eq("id", questionId)
    .maybeSingle();

  if (!question || question.created_by !== actorId) {
    return { ok: false, reason: "not_found" };
  }

  const { error } = await supabase
    .from("lesson_questions")
    .delete()
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lessonSlug)
    .eq("question_id", questionId);

  if (error) return { ok: false, reason: "error", error: error.message };
  return { ok: true };
}

async function _getQuestionLessonsForActor(
  context: QuestionContext,
  questionId: string
): Promise<LessonMount[] | null> {
  const { supabase, actorId } = context;

  const { data: question } = await supabase
    .from("questions")
    .select("id, created_by, is_published")
    .eq("id", questionId)
    .maybeSingle();

  if (!question || (question.created_by !== actorId && !question.is_published)) {
    return null;
  }

  const { data, error } = await supabase
    .from("lesson_questions")
    .select("course_slug, lesson_slug, order_index")
    .eq("question_id", questionId)
    .order("course_slug", { ascending: true })
    .order("lesson_slug", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as LessonMount[];
}

async function _getLessonQuestionsForActor(
  context: QuestionContext,
  courseSlug: string,
  lessonSlug: string
): Promise<LessonQuestionEntry[]> {
  const { supabase, actorId } = context;

  const { data, error } = await supabase
    .from("lesson_questions")
    .select(`order_index, question:questions(${QUESTION_SELECT})`)
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lessonSlug)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const questionRow = row.question as unknown as Record<string, unknown> | null;
      if (!questionRow) return null;
      if (questionRow.created_by !== actorId && !questionRow.is_published) return null;
      return {
        ...mapQuestionRow(questionRow),
        order_index: row.order_index as number,
      };
    })
    .filter((entry): entry is LessonQuestionEntry => entry !== null);
}

async function _reorderLessonQuestions(
  context: QuestionContext,
  courseSlug: string,
  lessonSlug: string,
  questionIds: string[]
): Promise<ReorderResult> {
  const { supabase, actorId } = context;

  const { data: mounted, error: mountError } = await supabase
    .from("lesson_questions")
    .select("question_id, question:questions(created_by)")
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lessonSlug);

  if (mountError) return { ok: false, reason: "error", error: mountError.message };

  const rows = mounted ?? [];
  if (rows.length === 0) {
    return { ok: false, reason: "not_found" };
  }

  // Frontera de propiedad: si alguna pregunta montada no es del actor, se
  // trata como "no encontrado" en vez de dejarlo reordenar parcialmente.
  const notOwned = rows.some((m) => {
    const q = m.question as { created_by: string } | { created_by: string }[] | null;
    const createdBy = Array.isArray(q) ? q[0]?.created_by : q?.created_by;
    return createdBy !== actorId;
  });
  if (notOwned) {
    return { ok: false, reason: "not_found" };
  }

  const mountedIds = rows.map((m) => m.question_id as string);

  // D6: la lista enviada debe coincidir EXACTAMENTE con lo montado — ni de
  // más ni de menos. Ninguna llamada de reordenamiento puede desmontar nada.
  const sameSet =
    mountedIds.length === questionIds.length &&
    mountedIds.every((id) => questionIds.includes(id)) &&
    questionIds.every((id) => mountedIds.includes(id));

  if (!sameSet) {
    return { ok: false, reason: "mismatch", mounted: mountedIds };
  }

  for (let i = 0; i < questionIds.length; i++) {
    const { error } = await supabase
      .from("lesson_questions")
      .update({ order_index: i })
      .eq("course_slug", courseSlug)
      .eq("lesson_slug", lessonSlug)
      .eq("question_id", questionIds[i]);
    if (error) return { ok: false, reason: "error", error: error.message };
  }

  return { ok: true };
}

// ─── Wrappers de sesión (Server Components/Actions) ───────────────────────
// Sin consumidores en la app hoy (igual que antes de spec-042, ver spec-005):
// se mantienen por paridad con el patrón de lib/questions/service.ts, para
// cuando exista una UI que opere con la sesión real del docente.

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
): Promise<QuestionWriteResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "error", error: "No autenticado" };

  return _createQuestionForActor({ supabase, actorId: user.id }, input);
}

export async function updateQuestion(
  questionId: string,
  input: QuestionInput
): Promise<QuestionWriteResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "error", error: "No autenticado" };

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
  _mountQuestionInLesson,
  _unmountQuestionFromLesson,
  _getQuestionLessonsForActor,
  _getLessonQuestionsForActor,
  _reorderLessonQuestions,
};

export function mapQuestionRow(row: Record<string, unknown>): QuestionWithDetails {
  const author = row.author as { full_name: string } | null;
  const rubricRaw = row.rubric as QuestionRubric[] | QuestionRubric | null;
  const rubric = Array.isArray(rubricRaw)
    ? (rubricRaw[0] ?? null)
    : (rubricRaw ?? null);

  const keywordRows = (row.keyword_rows as { keyword_slug: string }[] | null) ?? [];
  const keywords = keywordRows.map((k) => k.keyword_slug).sort();

  const lessonRows = (row.lessons as LessonMount[] | null) ?? [];
  const lessons = [...lessonRows].sort((a, b) =>
    a.course_slug === b.course_slug
      ? a.lesson_slug.localeCompare(b.lesson_slug)
      : a.course_slug.localeCompare(b.course_slug)
  );

  return {
    id: row.id as string,
    created_by: row.created_by as string,
    topic_title: row.topic_title as string | null,
    type: row.type as Question["type"],
    stem: row.stem as string,
    code_snippet: row.code_snippet as string | null,
    code_language: row.code_language as string | null,
    difficulty: row.difficulty as number,
    is_published: row.is_published as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    choices: (row.choices as QuestionChoice[]) ?? [],
    rubric,
    challenge_tests: (row.challenge_tests as CodingChallengeTest[]) ?? [],
    author_name: author?.full_name,
    keywords,
    lessons,
  };
}
