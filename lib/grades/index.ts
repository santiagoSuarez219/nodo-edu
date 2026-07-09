import { createServerSupabaseClient } from "@/lib/auth/server";
import { fetchStudentProfilesPublic } from "@/lib/enrollments/index";
import type {
  GradeItem,
  StudentGrade,
  EnrollmentWithGrades,
  CourseGradesRow,
  GradeItemWithScore,
} from "./types";

function computeTotalGrade(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / valid.length) * 100) / 100;
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

export async function createGradeItem(
  academicCourseId: string,
  name: string,
  orderIndex: number
): Promise<GradeItem> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("grade_items")
    .insert({ academic_course_id: academicCourseId, name, order_index: orderIndex })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateGradeItem(
  gradeItemId: string,
  fields: Partial<Pick<GradeItem, "name" | "order_index">>
): Promise<GradeItem | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("grade_items")
    .update(fields)
    .eq("id", gradeItemId)
    .select()
    .single();
  return data ?? null;
}

export async function deleteGradeItem(
  gradeItemId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

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
    return { enrollment_id: enrollmentId, student_id: "", items: [], total_grade: null };
  }

  const [{ data: gradeItems }, { data: studentGrades }] = await Promise.all([
    supabase
      .from("grade_items")
      .select("*")
      .eq("academic_course_id", enrollment.academic_course_id)
      .order("order_index", { ascending: true }),
    supabase
      .from("student_grades")
      .select("*")
      .eq("enrollment_id", enrollmentId),
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
    total_grade: computeTotalGrade(items.map((i) => i.score)),
  };
}

export async function getGradesByCourse(
  academicCourseId: string
): Promise<CourseGradesRow[]> {
  const supabase = await createServerSupabaseClient();

  const [{ data: gradeItems }, { data: enrollments }] = await Promise.all([
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
  ]);

  if (!enrollments || !gradeItems) return [];

  const studentIds = [...new Set(enrollments.map((r) => r.student_id as string))];
  const profiles = await fetchStudentProfilesPublic(supabase, studentIds);

  return enrollments.map((row) => {
    const gradeMap: Record<string, number | null> = {};
    for (const item of gradeItems as GradeItem[]) {
      gradeMap[item.id] = null;
    }
    for (const g of row.student_grades as { grade_item_id: string; score: number | null }[]) {
      gradeMap[g.grade_item_id] = g.score;
    }

    const profile = profiles.get(row.student_id);
    const scores = Object.values(gradeMap);

    return {
      enrollment_id: row.id,
      student_id: row.student_id,
      student_name: profile?.full_name ?? "",
      student_email: "",
      enrollment_status: row.status as "active" | "withdrawn",
      grades: gradeMap,
      total_grade: computeTotalGrade(scores),
    };
  });
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
