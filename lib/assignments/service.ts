import { createServiceSupabaseClient } from "@/lib/auth/service";
import type {
  AssignmentVariantGroup,
  AssignmentGroupWithVariants,
  AssignmentContext,
} from "./types";
import type { AssignmentGroupInput } from "./schemas";

export function getServiceAssignmentsContext(): AssignmentContext {
  const supabase = createServiceSupabaseClient();
  const actorId = process.env.QUESTION_BANK_AGENT_TEACHER_ID;

  if (!actorId) {
    throw new Error("QUESTION_BANK_AGENT_TEACHER_ID no configurada");
  }

  return { supabase, actorId };
}

export async function createGroupWithVariants(
  input: AssignmentGroupInput
): Promise<AssignmentVariantGroup> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const courseCheckResult = await supabase
    .from("academic_courses")
    .select("id, teacher_id")
    .eq("id", input.academic_course_id)
    .eq("teacher_id", actorId)
    .single();

  if (courseCheckResult.error || !courseCheckResult.data) {
    throw new Error("Curso académico no encontrado o no pertenece al docente.");
  }

  const groupData = {
    academic_course_id: input.academic_course_id,
    grade_item_id: input.grade_item_id || null,
    title: input.title,
    description: input.description || null,
    type: input.type,
    opens_at: input.opens_at || null,
    closes_at: input.closes_at || null,
    time_limit_minutes: input.time_limit_minutes || null,
    shuffle_questions: input.shuffle_questions || false,
    shuffle_choices: input.shuffle_choices || false,
    show_feedback_on: input.show_feedback_on || "submit",
    max_attempts: input.max_attempts || 1,
    is_published: false,
  };

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .insert(groupData)
    .select()
    .single();

  if (groupError || !group) {
    throw new Error(`Error creando grupo: ${groupError?.message}`);
  }

  for (const variantInput of input.variants) {
    const { data: variant, error: variantError } = await supabase
      .from("assignments")
      .insert({
        variant_group_id: group.id,
        variant_label: variantInput.variant_label,
        description: variantInput.description || null,
      })
      .select()
      .single();

    if (variantError || !variant) {
      await supabase.from("assignment_variant_groups").delete().eq("id", group.id);
      throw new Error(
        `Error creando variante ${variantInput.variant_label}: ${variantError?.message}`
      );
    }

    const questionsToInsert = variantInput.questions.map((q) => ({
      assignment_id: variant.id,
      question_id: q.question_id,
      order_index: q.order_index,
      points: q.points,
    }));

    const { error: questionsError } = await supabase
      .from("assignment_questions")
      .insert(questionsToInsert);

    if (questionsError) {
      await supabase.from("assignment_variant_groups").delete().eq("id", group.id);
      throw new Error(
        `Error agregando preguntas a variante ${variantInput.variant_label}: ${questionsError.message}`
      );
    }
  }

  return group;
}

export async function publishGroup(
  groupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("*, variants:assignments(*)")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return { ok: false, error: "Grupo no encontrado." };
  }

  const courseResult = await supabase
    .from("academic_courses")
    .select("teacher_id")
    .eq("id", group.academic_course_id)
    .single();

  if (courseResult.error || courseResult.data?.teacher_id !== actorId) {
    return { ok: false, error: "No autorizado." };
  }

  const variants = group.variants || [];

  if (variants.length < 2) {
    return {
      ok: false,
      error: `El grupo debe tener al menos 2 variantes. Actualmente tiene ${variants.length}.`,
    };
  }

  const variantPointsMap: Record<string, number> = {};

  for (const variant of variants) {
    const { data: questions, error: questionsError } = await supabase
      .from("assignment_questions")
      .select("points")
      .eq("assignment_id", variant.id);

    if (questionsError) {
      return { ok: false, error: `Error obteniendo preguntas de variante ${variant.variant_label}.` };
    }

    if (!questions || questions.length === 0) {
      return {
        ok: false,
        error: `Variante ${variant.variant_label} no tiene preguntas.`,
      };
    }

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    variantPointsMap[variant.id] = totalPoints;
  }

  const pointsValues = Object.values(variantPointsMap);
  const firstPoints = pointsValues[0];

  if (!pointsValues.every((p) => p === firstPoints)) {
    return {
      ok: false,
      error: `Las variantes deben tener el mismo puntaje total. Encontrados: ${pointsValues.join(", ")}.`,
    };
  }

  if (group.closes_at) {
    const closesAt = new Date(group.closes_at);
    const now = new Date();
    if (closesAt <= now) {
      return {
        ok: false,
        error: `La fecha de cierre ya ha pasado.`,
      };
    }
  }

  const { error: updateError } = await supabase
    .from("assignment_variant_groups")
    .update({ is_published: true })
    .eq("id", groupId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}

export async function updateGroup(
  groupId: string,
  updates: Partial<{
    title: string;
    description: string | null;
    opens_at: string | null;
    closes_at: string | null;
    time_limit_minutes: number | null;
    shuffle_questions: boolean;
    shuffle_choices: boolean;
    show_feedback_on: "submit" | "close" | "never";
    max_attempts: number;
    grade_item_id: string | null;
  }>
): Promise<AssignmentVariantGroup | null> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("id, academic_course_id")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return null;
  }

  const courseResult = await supabase
    .from("academic_courses")
    .select("teacher_id")
    .eq("id", group.academic_course_id)
    .single();

  if (courseResult.error || courseResult.data?.teacher_id !== actorId) {
    return null;
  }

  const { data: updated, error: updateError } = await supabase
    .from("assignment_variant_groups")
    .update(updates)
    .eq("id", groupId)
    .select()
    .single();

  if (updateError || !updated) {
    return null;
  }

  return updated;
}

export async function replaceVariantQuestions(
  variantId: string,
  questions: Array<{
    question_id: string;
    points: number;
    order_index: number;
  }>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const { data: variant, error: variantError } = await supabase
    .from("assignments")
    .select("variant_group_id")
    .eq("id", variantId)
    .single();

  if (variantError || !variant) {
    return { ok: false, error: "Variante no encontrada." };
  }

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("academic_course_id")
    .eq("id", variant.variant_group_id)
    .single();

  if (groupError || !group) {
    return { ok: false, error: "Grupo no encontrado." };
  }

  const courseResult = await supabase
    .from("academic_courses")
    .select("teacher_id")
    .eq("id", group.academic_course_id)
    .single();

  if (courseResult.error || courseResult.data?.teacher_id !== actorId) {
    return { ok: false, error: "No autorizado." };
  }

  await supabase.from("assignment_questions").delete().eq("assignment_id", variantId);

  const questionsToInsert = questions.map((q) => ({
    assignment_id: variantId,
    question_id: q.question_id,
    order_index: q.order_index,
    points: q.points,
  }));

  const { error: insertError } = await supabase
    .from("assignment_questions")
    .insert(questionsToInsert);

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  return { ok: true };
}

export async function deleteGroup(
  groupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("academic_course_id")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return { ok: false, error: "Grupo no encontrado." };
  }

  const courseResult = await supabase
    .from("academic_courses")
    .select("teacher_id")
    .eq("id", group.academic_course_id)
    .single();

  if (courseResult.error || courseResult.data?.teacher_id !== actorId) {
    return { ok: false, error: "No autorizado." };
  }

  const { count: submissionCount } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("variant_group_id", groupId);

  if (submissionCount && submissionCount > 0) {
    return {
      ok: false,
      error: "No se puede eliminar una evaluación que ya tiene submissions.",
    };
  }

  const { error: deleteError } = await supabase
    .from("assignment_variant_groups")
    .delete()
    .eq("id", groupId);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  return { ok: true };
}

export async function listGroupsForTeacher(filters?: {
  academic_course_id?: string;
  is_published?: boolean;
}): Promise<AssignmentVariantGroup[]> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const courseResult = await supabase
    .from("academic_courses")
    .select("id")
    .eq("teacher_id", actorId);

  if (courseResult.error) {
    throw new Error(courseResult.error.message);
  }

  const courseIds = (courseResult.data || []).map((c) => c.id);

  if (courseIds.length === 0) {
    return [];
  }

  let query = supabase.from("assignment_variant_groups").select("*");

  if (filters?.academic_course_id) {
    query = query.eq("academic_course_id", filters.academic_course_id);
  } else {
    query = query.in("academic_course_id", courseIds);
  }

  if (filters?.is_published !== undefined) {
    query = query.eq("is_published", filters.is_published);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getGroupDetail(
  groupId: string
): Promise<AssignmentGroupWithVariants | null> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return null;
  }

  const courseResult = await supabase
    .from("academic_courses")
    .select("teacher_id")
    .eq("id", group.academic_course_id)
    .single();

  if (courseResult.error || courseResult.data?.teacher_id !== actorId) {
    return null;
  }

  const { data: variants, error: variantsError } = await supabase
    .from("assignments")
    .select("*")
    .eq("variant_group_id", groupId)
    .order("variant_label", { ascending: true });

  if (variantsError) {
    throw new Error(variantsError.message);
  }

  const variantsWithQuestions = await Promise.all(
    (variants || []).map(async (variant) => {
      const { data: questions } = await supabase
        .from("assignment_questions")
        .select("*")
        .eq("assignment_id", variant.id)
        .order("order_index", { ascending: true });

      const totalPoints = (questions || []).reduce((sum, q) => sum + (q.points || 0), 0);

      return {
        ...variant,
        questions: questions || [],
        total_points: totalPoints,
      };
    })
  );

  return {
    ...group,
    variants: variantsWithQuestions,
  };
}

export async function listAllocations(
  groupId: string
): Promise<
  Array<{
    enrollment_id: string;
    assignment_id: string;
    variant_label: string;
    allocated_at: string;
  }>
> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("academic_course_id")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    throw new Error("Grupo no encontrado.");
  }

  const courseResult = await supabase
    .from("academic_courses")
    .select("teacher_id")
    .eq("id", group.academic_course_id)
    .single();

  if (courseResult.error || courseResult.data?.teacher_id !== actorId) {
    throw new Error("No autorizado.");
  }

  const { data: allocations, error: allocationsError } = await supabase
    .from("assignment_variant_allocations")
    .select("enrollment_id, assignment_id, allocated_at")
    .eq("variant_group_id", groupId);

  if (allocationsError) {
    throw new Error(allocationsError.message);
  }

  const assignmentIds = (allocations || []).map((a) => a.assignment_id);

  if (assignmentIds.length === 0) {
    return [];
  }

  const { data: variants, error: variantsError } = await supabase
    .from("assignments")
    .select("id, variant_label")
    .in("id", assignmentIds);

  if (variantsError) {
    throw new Error(variantsError.message);
  }

  const variantMap = new Map(
    (variants || []).map((v) => [v.id, v.variant_label])
  );

  return (allocations || []).map((a) => ({
    enrollment_id: a.enrollment_id,
    assignment_id: a.assignment_id,
    variant_label: variantMap.get(a.assignment_id) || "Unknown",
    allocated_at: a.allocated_at,
  }));
}

export async function listAcademicCoursesForTeacher(): Promise<
  Array<{
    id: string;
    name: string;
    period: string;
  }>
> {
  const context = getServiceAssignmentsContext();
  const { supabase, actorId } = context;

  const { data: courses, error } = await supabase
    .from("academic_courses")
    .select("id, name, period")
    .eq("teacher_id", actorId);

  if (error) {
    throw new Error(error.message);
  }

  return courses || [];
}
