import { createServerSupabaseClient } from "@/lib/auth/server";
import { getEnrollmentsWithGradesByStudent } from "@/lib/enrollments/index";
import { computeGradeSummary } from "./compute";
import { getAssignmentScoresByEnrollments } from "@/lib/submissions/index";
import { getSelfAssessmentCourseSummary } from "@/lib/self-assessment";
import type { GradeItem, GradeGroup, StudentGrade, GradeItemWithScore, CourseGradesSummary, WithdrawnCourseSummary, StudentGradesOverview } from "./types";
import type { AssignmentScoreRow } from "@/lib/submissions/types";

// spec-056 (D2, Fase 1): resuelve "Mis notas" para TODAS las matrículas del
// estudiante en un número fijo de consultas en vez de 3N (una por matrícula,
// que es lo que haría llamar getGradesByEnrollment en bucle). No toca
// getGradesByEnrollment ni EnrollmentDetail — el detalle por matrícula sigue
// exactamente igual.
export async function getStudentGradesOverview(): Promise<StudentGradesOverview> {
  const enrollments = await getEnrollmentsWithGradesByStudent();
  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const withdrawnEnrollments = enrollments.filter((e) => e.status === "withdrawn");

  // D4: un curso retirado solo expone la nota a la fecha (spec-059 D8, vía
  // el RPC acotado) — sin desglose, porque la RLS bloquea grade_items y assignment_variant_groups para una
  // matrícula `withdrawn`.
  const withdrawn: WithdrawnCourseSummary[] = withdrawnEnrollments.map((e) => ({
    enrollment_id: e.id,
    academic_course: e.academic_course,
    teacher_name: e.teacher_name,
    grade_summary: e.grade_summary,
    withdrawn_at: e.withdrawn_at,
  }));

  if (activeEnrollments.length === 0) {
    return { active: [], withdrawn };
  }

  const supabase = await createServerSupabaseClient();
  const courseIds = [...new Set(activeEnrollments.map((e) => e.academic_course_id))];
  const enrollmentIds = activeEnrollments.map((e) => e.id);

  const [
    { data: gradeItems },
    { data: gradeGroups },
    { data: studentGrades },
    assignmentsResult,
    selfAssessmentSummaries,
  ] = await Promise.all([
      supabase
        .from("grade_items")
        .select("*")
        .in("academic_course_id", courseIds)
        .order("order_index", { ascending: true }),
      supabase
        .from("grade_groups")
        .select("*")
        .in("academic_course_id", courseIds)
        .order("order_index", { ascending: true }),
      supabase.from("student_grades").select("*").in("enrollment_id", enrollmentIds),
      getAssignmentScoresByEnrollments(enrollmentIds),
      // D5-adjacent: getSelfAssessmentCourseSummary ya degrada a `null` por sí
      // sola ante un fallo (ver lib/self-assessment/index.ts) — no se envuelve
      // en un try/catch adicional aquí.
      Promise.all(
        activeEnrollments.map((e) =>
          e.academic_course.course_slug
            ? getSelfAssessmentCourseSummary(e.academic_course.course_slug)
            : Promise.resolve(null)
        )
      ),
    ]);

  const gradeItemsByCourse = new Map<string, GradeItem[]>();
  for (const item of (gradeItems ?? []) as GradeItem[]) {
    const list = gradeItemsByCourse.get(item.academic_course_id) ?? [];
    list.push(item);
    gradeItemsByCourse.set(item.academic_course_id, list);
  }

  const groupsByCourse = new Map<string, GradeGroup[]>();
  for (const group of (gradeGroups ?? []) as GradeGroup[]) {
    const list = groupsByCourse.get(group.academic_course_id) ?? [];
    list.push(group);
    groupsByCourse.set(group.academic_course_id, list);
  }

  const scoresByEnrollment = new Map<string, Map<string, number | null>>();
  for (const g of (studentGrades ?? []) as StudentGrade[]) {
    const map = scoresByEnrollment.get(g.enrollment_id) ?? new Map();
    map.set(g.grade_item_id, g.score);
    scoresByEnrollment.set(g.enrollment_id, map);
  }

  const assignmentsByEnrollment = new Map<string, AssignmentScoreRow[]>();
  if (assignmentsResult.status === "ok") {
    for (const row of assignmentsResult.rows) {
      const list = assignmentsByEnrollment.get(row.enrollment_id) ?? [];
      list.push(row);
      assignmentsByEnrollment.set(row.enrollment_id, list);
    }
  }

  const active: CourseGradesSummary[] = activeEnrollments.map((enrollment, index) => {
    const items: GradeItemWithScore[] = (
      gradeItemsByCourse.get(enrollment.academic_course_id) ?? []
    ).map((item) => ({
      ...item,
      score: scoresByEnrollment.get(enrollment.id)?.get(item.id) ?? null,
    }));

    const groups = groupsByCourse.get(enrollment.academic_course_id) ?? [];

    return {
      enrollment_id: enrollment.id,
      academic_course: enrollment.academic_course,
      teacher_name: enrollment.teacher_name,
      items,
      groups,
      grade_summary: computeGradeSummary(
        items,
        groups,
        Object.fromEntries(items.map((i) => [i.id, i.score]))
      ),
      self_assessment: selfAssessmentSummaries[index],
      // D5: `null` marca "la consulta de evaluaciones falló" (unavailable),
      // distinto de "no tiene evaluaciones" ([]).
      assignments:
        assignmentsResult.status === "ok" ? (assignmentsByEnrollment.get(enrollment.id) ?? []) : null,
    };
  });

  return { active, withdrawn };
}
