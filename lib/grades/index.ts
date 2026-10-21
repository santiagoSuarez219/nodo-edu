import { createServerSupabaseClient } from "@/lib/auth/server";
import { fetchStudentProfilesPublic } from "@/lib/enrollments/index";
import { compareStudentsBySurname } from "@/lib/students/names";
import { computeGradeSummary } from "./compute";
import type {
  GradeItem,
  GradeGroup,
  StudentGrade,
  EnrollmentWithGrades,
  CourseGradesRow,
  GradeItemWithScore,
} from "./types";

export type MutationResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const toMillis = (weight: number) => Math.round(weight * 1000);
const formatWeight = (millis: number) =>
  (millis / 1000).toFixed(3).replace(/0$/, "");

// spec-059 D3: traduce los errores de los triggers y de RLS a texto de UI.
function mapGradeError(error: {
  message: string;
  details?: string | null;
  code?: string;
}): string {
  const available = /available=([\d.]+)/.exec(error.details ?? "")?.[1];
  const tail = available ? ` Disponible: ${formatWeight(toMillis(Number(available)))}.` : "";
  if (error.message.includes("grade_items_weight_sum_exceeded"))
    return `La suma de ponderaciones del curso superaría 1.00.${tail}`;
  if (error.message.includes("grade_groups_target_sum_exceeded"))
    return `La suma de pesos de cortes superaría 1.00.${tail}`;
  if (error.message.includes("self_assessment_item_name_taken"))
    return "Ya existe un ítem manual llamado 'Autoevaluaciones'; renómbralo para crear el automático.";
  if (error.code === "42501") return "No tienes acceso a este curso.";
  if (error.code === "23505") return "Ya existe un registro con ese nombre en el curso.";
  return error.message;
}

export async function getGradeItemsByCourse(
  academicCourseId: string
): Promise<GradeItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("grade_items")
    .select("*")
    .eq("academic_course_id", academicCourseId)
    .order("order_index", { ascending: true });
  return data ?? [];
}

// D3: valida Σ ≤ 1 con el disponible antes de escribir; el trigger es la
// garantía real (escrituras fuera de la UI, dos pestañas a la vez).
async function checkWeightAvailable(
  table: "grade_items" | "grade_groups",
  column: "weight" | "target_weight",
  academicCourseId: string,
  newWeight: number,
  excludeId?: string
): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from(table)
    .select(`id, ${column}`)
    .eq("academic_course_id", academicCourseId);

  const rows = ((data ?? []) as unknown as Array<Record<string, unknown>>).filter(
    (r) => r[column] !== null
  );
  const others = rows
    .filter((r) => r.id !== excludeId)
    .reduce((acc, r) => acc + toMillis(Number(r[column])), 0);

  if (others + toMillis(newWeight) <= 1000) return null;
  // "Disponible" = lo que queda sin asignar en todo el curso (incluido el peso
  // actual del propio registro), que es la cifra que ve el docente en el panel.
  const total = rows.reduce((acc, r) => acc + toMillis(Number(r[column])), 0);
  const what = table === "grade_items" ? "ponderaciones del curso" : "pesos de cortes";
  return `La suma de ${what} superaría 1.00. Disponible: ${formatWeight(Math.max(1000 - total, 0))}.`;
}

export async function createGradeItem(
  academicCourseId: string,
  name: string,
  orderIndex: number,
  weight: number | null = null,
  groupId: string | null = null
): Promise<MutationResult<GradeItem>> {
  if (weight !== null) {
    const over = await checkWeightAvailable("grade_items", "weight", academicCourseId, weight);
    if (over) return { ok: false, error: over };
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("grade_items")
    .insert({
      academic_course_id: academicCourseId,
      name,
      order_index: orderIndex,
      weight,
      group_id: groupId,
    })
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: mapGradeError(error) };
  if (!data) return { ok: false, error: "No tienes acceso a este curso." };
  return { ok: true, data };
}

export async function updateGradeItem(
  gradeItemId: string,
  fields: Partial<Pick<GradeItem, "name" | "order_index" | "weight" | "group_id">>
): Promise<MutationResult<GradeItem>> {
  const supabase = await createServerSupabaseClient();

  if (fields.weight !== undefined && fields.weight !== null) {
    const { data: current } = await supabase
      .from("grade_items")
      .select("academic_course_id")
      .eq("id", gradeItemId)
      .maybeSingle();
    if (current) {
      const over = await checkWeightAvailable(
        "grade_items",
        "weight",
        current.academic_course_id,
        fields.weight,
        gradeItemId
      );
      if (over) return { ok: false, error: over };
    }
  }

  const { data, error } = await supabase
    .from("grade_items")
    .update(fields)
    .eq("id", gradeItemId)
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: mapGradeError(error) };
  if (!data) return { ok: false, error: "No tienes acceso a este ítem o no existe." };
  return { ok: true, data };
}

export async function deleteGradeItem(
  gradeItemId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

  // spec-040 D5: el ítem de autoevaluaciones lo crea y mantiene el RPC de
  // propagación. Si el docente lo borrara, el siguiente envío lo recrearía
  // en silencio con el order_index movido — un comportamiento incomprensible
  // desde la UI. Renombrarlo sigue permitido (updateGradeItem no lo bloquea).
  const { data: item } = await supabase
    .from("grade_items")
    .select("kind")
    .eq("id", gradeItemId)
    .single();

  if (item?.kind === "self_assessment") {
    return {
      ok: false,
      error:
        "Este ítem se genera automáticamente a partir de las autoevaluaciones y no se puede eliminar. Puedes renombrarlo si lo prefieres.",
    };
  }

  const { count } = await supabase
    .from("student_grades")
    .select("id", { count: "exact", head: true })
    .eq("grade_item_id", gradeItemId)
    .not("score", "is", null);

  if (count && count > 0) {
    return {
      ok: false,
      error: "No se puede eliminar un ítem que ya tiene notas registradas.",
    };
  }

  await supabase.from("grade_items").delete().eq("id", gradeItemId);
  return { ok: true };
}

export async function getGradeGroupsByCourse(
  academicCourseId: string
): Promise<GradeGroup[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("grade_groups")
    .select("*")
    .eq("academic_course_id", academicCourseId)
    .order("order_index", { ascending: true });
  return data ?? [];
}

export async function createGradeGroup(
  academicCourseId: string,
  name: string,
  targetWeight: number,
  orderIndex: number
): Promise<MutationResult<GradeGroup>> {
  const over = await checkWeightAvailable(
    "grade_groups",
    "target_weight",
    academicCourseId,
    targetWeight
  );
  if (over) return { ok: false, error: over };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("grade_groups")
    .insert({
      academic_course_id: academicCourseId,
      name,
      target_weight: targetWeight,
      order_index: orderIndex,
    })
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: mapGradeError(error) };
  if (!data) return { ok: false, error: "No tienes acceso a este curso." };
  return { ok: true, data };
}

export async function updateGradeGroup(
  groupId: string,
  fields: Partial<Pick<GradeGroup, "name" | "target_weight" | "order_index">>
): Promise<MutationResult<GradeGroup>> {
  const supabase = await createServerSupabaseClient();

  if (fields.target_weight !== undefined) {
    const { data: current } = await supabase
      .from("grade_groups")
      .select("academic_course_id")
      .eq("id", groupId)
      .maybeSingle();
    if (current) {
      const over = await checkWeightAvailable(
        "grade_groups",
        "target_weight",
        current.academic_course_id,
        fields.target_weight,
        groupId
      );
      if (over) return { ok: false, error: over };
    }
  }

  const { data, error } = await supabase
    .from("grade_groups")
    .update(fields)
    .eq("id", groupId)
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: mapGradeError(error) };
  if (!data) return { ok: false, error: "No tienes acceso a este corte o no existe." };
  return { ok: true, data };
}

// La FK `on delete set null (group_id)` deja los ítems sin corte, con pesos
// y notas intactos (D12).
export async function deleteGradeGroup(groupId: string): Promise<MutationResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("grade_groups")
    .delete()
    .eq("id", groupId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: mapGradeError(error) };
  if (!data) return { ok: false, error: "No tienes acceso a este corte o no existe." };
  return { ok: true, data: undefined };
}

// spec-059 D15: crea de antemano el ítem de autoevaluaciones (idempotente).
export async function ensureSelfAssessmentGradeItem(
  academicCourseId: string
): Promise<MutationResult<{ id: string }>> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("ensure_self_assessment_grade_item", {
    p_academic_course_id: academicCourseId,
  });
  if (error) return { ok: false, error: mapGradeError(error) };
  return { ok: true, data: { id: data as string } };
}

export async function getGradesByEnrollment(
  enrollmentId: string
): Promise<EnrollmentWithGrades> {
  const supabase = await createServerSupabaseClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("student_id, academic_course_id")
    .eq("id", enrollmentId)
    .single();

  if (!enrollment) {
    return {
      enrollment_id: enrollmentId,
      student_id: "",
      items: [],
      groups: [],
      grade_summary: computeGradeSummary([], [], {}),
    };
  }

  const [{ data: gradeItems }, { data: studentGrades }, groups] = await Promise.all([
    supabase
      .from("grade_items")
      .select("*")
      .eq("academic_course_id", enrollment.academic_course_id)
      .order("order_index", { ascending: true }),
    supabase
      .from("student_grades")
      .select("*")
      .eq("enrollment_id", enrollmentId),
    getGradeGroupsByCourse(enrollment.academic_course_id),
  ]);

  const gradeMap = new Map(
    (studentGrades ?? []).map((g: StudentGrade) => [g.grade_item_id, g.score])
  );

  const items: GradeItemWithScore[] = (gradeItems ?? []).map((item: GradeItem) => ({
    ...item,
    score: gradeMap.get(item.id) ?? null,
  }));

  return {
    enrollment_id: enrollmentId,
    student_id: enrollment.student_id,
    items,
    groups,
    grade_summary: computeGradeSummary(
      items,
      groups,
      Object.fromEntries(items.map((i) => [i.id, i.score]))
    ),
  };
}

export async function getGradesByCourse(
  academicCourseId: string
): Promise<CourseGradesRow[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: gradeItems }, { data: enrollments }, groups] = await Promise.all([
    supabase
      .from("grade_items")
      .select("*")
      .eq("academic_course_id", academicCourseId)
      .order("order_index", { ascending: true }),
    supabase
      .from("enrollments")
      .select("id, student_id, status, student_grades(grade_item_id, score)")
      .eq("academic_course_id", academicCourseId)
      .order("enrolled_at", { ascending: true }),
    getGradeGroupsByCourse(academicCourseId),
  ]);

  if (!enrollments || !gradeItems) return [];

  const studentIds = [...new Set(enrollments.map((r) => r.student_id as string))];
  const profiles = await fetchStudentProfilesPublic(supabase, studentIds);

  const rows = enrollments.map((row) => {
    const gradeMap: Record<string, number | null> = {};
    for (const item of gradeItems as GradeItem[]) {
      gradeMap[item.id] = null;
    }
    for (const g of row.student_grades as { grade_item_id: string; score: number | null }[]) {
      gradeMap[g.grade_item_id] = g.score;
    }

    const profile = profiles.get(row.student_id);

    return {
      enrollment_id: row.id,
      student_id: row.student_id,
      student_name: profile?.full_name ?? "",
      student_first_name: profile?.first_name ?? "",
      student_last_name: profile?.last_name ?? "",
      student_email: "",
      enrollment_status: row.status as "active" | "withdrawn",
      grades: gradeMap,
      grade_summary: computeGradeSummary(gradeItems as GradeItem[], groups, gradeMap),
    };
  });

  // spec-062 D7/D8: por apellido, no por fecha de matrícula.
  return rows.sort((a, b) =>
    compareStudentsBySurname(
      { first_name: a.student_first_name, last_name: a.student_last_name, full_name: a.student_name },
      { first_name: b.student_first_name, last_name: b.student_last_name, full_name: b.student_name }
    )
  );
}

export async function upsertStudentGrade(
  enrollmentId: string,
  gradeItemId: string,
  score: number | null
): Promise<StudentGrade> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("student_grades")
    .upsert(
      { enrollment_id: enrollmentId, grade_item_id: gradeItemId, score },
      { onConflict: "enrollment_id,grade_item_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
