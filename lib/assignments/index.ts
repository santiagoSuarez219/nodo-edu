import { createServerSupabaseClient } from "@/lib/auth/server";
import { createServiceSupabaseClient } from "@/lib/auth/service";
import type {
  AssignmentVariantGroup,
  AssignmentGroupWithVariants,
  StudentAssignment,
  AssignmentVariant,
  AssignmentQuestion,
  AssignmentContext,
} from "./types";

async function _getGroupsByAcademicCourseForActor(
  context: AssignmentContext,
  academicCourseId: string
): Promise<AssignmentVariantGroup[]> {
  const { supabase } = context;

  let query = supabase
    .from("assignment_variant_groups")
    .select("*")
    .eq("academic_course_id", academicCourseId);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data || [];
}

async function _getGroupByIdForActor(
  context: AssignmentContext,
  groupId: string
): Promise<AssignmentGroupWithVariants | null> {
  const { supabase } = context;

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) return null;

  const { data: variants, error: variantsError } = await supabase
    .from("assignments")
    .select("*")
    .eq("variant_group_id", groupId)
    .order("variant_label", { ascending: true });

  if (variantsError) throw new Error(variantsError.message);

  const variantsWithQuestions = await Promise.all(
    (variants || []).map(async (variant) => {
      const { data: questions } = await supabase
        .from("assignment_questions")
        .select("*, question:questions(id, stem, type)")
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

// DEBT: _getActiveAssignmentsByEnrollmentForActor, _getStudentAssignmentForActor y
// _getOrAllocateVariantForActor (más abajo) seleccionan assignment_questions con "*",
// sin traer el stem/type de la pregunta vía join a questions. Es el mismo problema que
// TC-003 detectó en la UI admin (ver _getGroupByIdForActor arriba), pero aquí afecta al
// flujo de resolución de examen del estudiante — alcance de spec-019, no de spec-018.
// Registrado en docs/specs/backlog.md.
async function _getActiveAssignmentsByEnrollmentForActor(
  context: AssignmentContext,
  enrollmentId: string
): Promise<StudentAssignment[]> {
  const { supabase } = context;

  const now = new Date().toISOString();

  const { data: groups, error: groupsError } = await supabase
    .from("assignment_variant_groups")
    .select("*")
    .eq("is_published", true)
    .or(`opens_at.is.null,opens_at.lte.${now}`)
    .or(`closes_at.is.null,closes_at.gt.${now}`);

  if (groupsError) throw new Error(groupsError.message);

  const assignments: StudentAssignment[] = [];

  for (const group of groups || []) {
    const { data: allocation } = await supabase
      .from("assignment_variant_allocations")
      .select("assignment_id")
      .eq("variant_group_id", group.id)
      .eq("enrollment_id", enrollmentId)
      .single();

    if (!allocation) continue;

    const { data: variant, error: variantError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", allocation.assignment_id)
      .single();

    if (variantError || !variant) continue;

    const { data: questions } = await supabase
      .from("assignment_questions")
      .select("*")
      .eq("assignment_id", variant.id)
      .order("order_index", { ascending: true });

    const totalPoints = (questions || []).reduce((sum, q) => sum + (q.points || 0), 0);

    assignments.push({
      group,
      variant,
      questions: questions || [],
      total_points: totalPoints,
    });
  }

  return assignments;
}

async function _getStudentAssignmentForActor(
  context: AssignmentContext,
  groupId: string,
  enrollmentId: string
): Promise<StudentAssignment | null> {
  const { supabase } = context;

  const { data: group } = await supabase
    .from("assignment_variant_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group || !group.is_published) return null;

  const now = new Date().toISOString();
  if (group.opens_at && new Date(group.opens_at) > new Date(now)) return null;
  if (group.closes_at && new Date(group.closes_at) <= new Date(now)) return null;

  const { data: allocation } = await supabase
    .from("assignment_variant_allocations")
    .select("assignment_id")
    .eq("variant_group_id", groupId)
    .eq("enrollment_id", enrollmentId)
    .single();

  if (!allocation) return null;

  const { data: variant } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", allocation.assignment_id)
    .single();

  if (!variant) return null;

  const { data: questions } = await supabase
    .from("assignment_questions")
    .select("*")
    .eq("assignment_id", variant.id)
    .order("order_index", { ascending: true });

  const totalPoints = (questions || []).reduce((sum, q) => sum + (q.points || 0), 0);

  return {
    group,
    variant,
    questions: questions || [],
    total_points: totalPoints,
  };
}

async function _getOrAllocateVariantForActor(
  context: AssignmentContext,
  enrollmentId: string,
  groupId: string
): Promise<{ variant: AssignmentVariant; questions: AssignmentQuestion[] } | null> {
  const { supabase } = context;

  const { data: existing } = await supabase
    .from("assignment_variant_allocations")
    .select("assignment_id, variant:assignments(*)")
    .eq("variant_group_id", groupId)
    .eq("enrollment_id", enrollmentId)
    .single();

  if (existing) {
    const { data: variant } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", existing.assignment_id)
      .single();

    if (!variant) return null;

    const { data: questions } = await supabase
      .from("assignment_questions")
      .select("*")
      .eq("assignment_id", variant.id)
      .order("order_index", { ascending: true });

    return {
      variant,
      questions: questions || [],
    };
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status")
    .eq("id", enrollmentId)
    .single();

  if (!enrollment || enrollment.status !== "active") return null;

  const { data: group } = await supabase
    .from("assignment_variant_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group || !group.is_published) return null;

  const now = new Date().toISOString();
  if (group.opens_at && new Date(group.opens_at) > new Date(now)) return null;
  if (group.closes_at && new Date(group.closes_at) <= new Date(now)) return null;

  const { data: variants } = await supabase
    .from("assignments")
    .select("id, variant_label")
    .eq("variant_group_id", groupId)
    .order("variant_label", { ascending: true });

  if (!variants || variants.length === 0) return null;

  // El conteo de asignaciones por variante necesita ver el reparto de TODOS los
  // estudiantes del grupo para poder balancear, pero la RLS de
  // assignment_variant_allocations (student_sees_own_allocation) solo expone las
  // filas propias del estudiante — bajo el cliente de sesión, todo conteo daría
  // siempre 0 en el primer acceso de cada estudiante, degenerando el balanceo a
  // azar puro. Se usa el cliente de servicio solo para este agregado numérico
  // (nunca se expone qué variante tiene cada estudiante, solo el total por
  // variante), preservando la privacidad que la RLS protege para el resto del flujo.
  const serviceSupabase = createServiceSupabaseClient();
  const allocationCounts: Record<string, number> = {};

  for (const variant of variants) {
    const { count } = await serviceSupabase
      .from("assignment_variant_allocations")
      .select("id", { count: "exact", head: true })
      .eq("variant_group_id", groupId)
      .eq("assignment_id", variant.id);

    allocationCounts[variant.id] = count || 0;
  }

  const minCount = Math.min(...Object.values(allocationCounts));
  const variantsWithMinCount = variants.filter((v) => allocationCounts[v.id] === minCount);

  const chosenVariant = variantsWithMinCount[Math.floor(Math.random() * variantsWithMinCount.length)];

  const { data: allocation, error: insertError } = await supabase
    .from("assignment_variant_allocations")
    .insert({
      variant_group_id: groupId,
      enrollment_id: enrollmentId,
      assignment_id: chosenVariant.id,
    })
    .select("assignment_id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existingAllocation } = await supabase
        .from("assignment_variant_allocations")
        .select("assignment_id")
        .eq("variant_group_id", groupId)
        .eq("enrollment_id", enrollmentId)
        .single();

      if (!existingAllocation) return null;

      const { data: variant } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", existingAllocation.assignment_id)
        .single();

      if (!variant) return null;

      const { data: questions } = await supabase
        .from("assignment_questions")
        .select("*")
        .eq("assignment_id", variant.id)
        .order("order_index", { ascending: true });

      return {
        variant,
        questions: questions || [],
      };
    }

    return null;
  }

  const { data: variant } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", allocation.assignment_id)
    .single();

  if (!variant) return null;

  const { data: questions } = await supabase
    .from("assignment_questions")
    .select("*")
    .eq("assignment_id", variant.id)
    .order("order_index", { ascending: true });

  return {
    variant,
    questions: questions || [],
  };
}

async function _publishAssignmentGroupForActor(
  context: AssignmentContext,
  groupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase } = context;

  const { data: group, error: groupError } = await supabase
    .from("assignment_variant_groups")
    .select("*, variants:assignments(*)")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return { ok: false, error: "Grupo no encontrado." };
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

export async function getAssignmentGroupsByAcademicCourse(
  academicCourseId: string
): Promise<AssignmentVariantGroup[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  return _getGroupsByAcademicCourseForActor({ supabase, actorId: user.id }, academicCourseId);
}

export async function getAssignmentGroupById(
  groupId: string
): Promise<AssignmentGroupWithVariants | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return _getGroupByIdForActor({ supabase, actorId: user.id }, groupId);
}

export async function getActiveAssignmentsByEnrollment(
  enrollmentId: string
): Promise<StudentAssignment[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  return _getActiveAssignmentsByEnrollmentForActor({ supabase, actorId: user.id }, enrollmentId);
}

export async function getStudentAssignment(
  groupId: string,
  enrollmentId: string
): Promise<StudentAssignment | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return _getStudentAssignmentForActor({ supabase, actorId: user.id }, groupId, enrollmentId);
}

export async function getOrAllocateVariant(
  enrollmentId: string,
  groupId: string
): Promise<{ variant: AssignmentVariant; questions: AssignmentQuestion[] } | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return _getOrAllocateVariantForActor({ supabase, actorId: user.id }, enrollmentId, groupId);
}

async function _getAllocationsForActor(
  context: AssignmentContext,
  groupId: string
): Promise<
  Array<{
    enrollment_id: string;
    assignment_id: string;
    variant_label: string;
    allocated_at: string;
    student_name?: string;
  }>
> {
  const { supabase } = context;

  const { data: allocations, error: allocationsError } = await supabase
    .from("assignment_variant_allocations")
    .select("enrollment_id, assignment_id, allocated_at")
    .eq("variant_group_id", groupId);

  if (allocationsError) throw new Error(allocationsError.message);

  if (!allocations || allocations.length === 0) return [];

  const assignmentIds = allocations.map((a) => a.assignment_id);

  const { data: variants, error: variantsError } = await supabase
    .from("assignments")
    .select("id, variant_label")
    .in("id", assignmentIds);

  if (variantsError) throw new Error(variantsError.message);

  const variantMap = new Map(
    (variants || []).map((v) => [v.id, v.variant_label])
  );

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student:students(full_name)")
    .in("id", allocations.map((a) => a.enrollment_id));

  if (enrollmentsError) throw new Error(enrollmentsError.message);

  const enrollmentMap = new Map(
    (enrollments || []).map((e) => [e.id, (e.student as { full_name?: string })?.full_name || "Desconocido"])
  );

  return allocations.map((a) => ({
    enrollment_id: a.enrollment_id,
    assignment_id: a.assignment_id,
    variant_label: variantMap.get(a.assignment_id) || "Unknown",
    allocated_at: a.allocated_at,
    student_name: enrollmentMap.get(a.enrollment_id),
  }));
}

export async function publishAssignmentGroup(
  groupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "No autenticado" };

  return _publishAssignmentGroupForActor({ supabase, actorId: user.id }, groupId);
}

export async function getAllocations(
  groupId: string
): Promise<
  Array<{
    enrollment_id: string;
    assignment_id: string;
    variant_label: string;
    allocated_at: string;
    student_name?: string;
  }>
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  return _getAllocationsForActor({ supabase, actorId: user.id }, groupId);
}

export {
  _getGroupsByAcademicCourseForActor,
  _getGroupByIdForActor,
  _getActiveAssignmentsByEnrollmentForActor,
  _getStudentAssignmentForActor,
  _getOrAllocateVariantForActor,
  _publishAssignmentGroupForActor,
  _getAllocationsForActor,
};
