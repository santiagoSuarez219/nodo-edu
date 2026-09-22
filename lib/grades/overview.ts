import { createServerSupabaseClient } from "@/lib/auth/server";
import { getEnrollmentsByStudent } from "@/lib/enrollments/index";
import { getAssignmentScoresByEnrollments } from "@/lib/submissions/index";
import { getSelfAssessmentCourseSummary } from "@/lib/self-assessment";
import type { GradeItem, StudentGrade, GradeItemWithScore, CourseGradesSummary, WithdrawnCourseSummary, StudentGradesOverview } from "./types";
import type { AssignmentScoreRow } from "@/lib/submissions/types";

// Copia deliberada de la misma fórmula que lib/grades/index.ts y
// lib/enrollments/index.ts (D2 de spec-056): unificar las tres en un único
// export ampliaría el scope de este spec tocando módulos que no cambian.
function computeTotalGrade(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / valid.length) * 100) / 100;
}

// spec-056 (D2, Fase 1): resuelve "Mis notas" para TODAS las matrículas del
// estudiante en un número fijo de consultas en vez de 3N (una por matrícula,
// que es lo que haría llamar getGradesByEnrollment en bucle). No toca
// getGradesByEnrollment ni EnrollmentDetail — el detalle por matrícula sigue
// exactamente igual.
export async function getStudentGradesOverview(): Promise<StudentGradesOverview> {
  const enrollments = await getEnrollmentsByStudent();
  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const withdrawnEnrollments = enrollments.filter((e) => e.status === "withdrawn");

  // D4: un curso retirado solo expone la nota total que ya calcula
  // getEnrollmentsByStudent() (embed student_grades(score)) — sin desglose,
  // porque la RLS bloquea grade_items y assignment_variant_groups para una
  // matrícula `withdrawn`.
  const withdrawn: WithdrawnCourseSummary[] = withdrawnEnrollments.map((e) => ({
    enrollment_id: e.id,
    academic_course: e.academic_course,
    teacher_name: e.teacher_name,
    total_grade: e.total_grade,
    withdrawn_at: e.withdrawn_at,
  }));

  if (activeEnrollments.length === 0) {
    return { active: [], withdrawn };
  }

  const supabase = await createServerSupabaseClient();
  const courseIds = [...new Set(activeEnrollments.map((e) => e.academic_course_id))];
  const enrollmentIds = activeEnrollments.map((e) => e.id);

  const [{ data: gradeItems }, { data: studentGrades }, assignmentsResult, selfAssessmentSummaries] =
    await Promise.all([
      supabase
        .from("grade_items")
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

    return {
      enrollment_id: enrollment.id,
      academic_course: enrollment.academic_course,
      teacher_name: enrollment.teacher_name,
      items,
      total_grade: computeTotalGrade(items.map((i) => i.score)),
      self_assessment: selfAssessmentSummaries[index],
      // D5: `null` marca "la consulta de evaluaciones falló" (unavailable),
      // distinto de "no tiene evaluaciones" ([]).
      assignments:
        assignmentsResult.status === "ok" ? (assignmentsByEnrollment.get(enrollment.id) ?? []) : null,
    };
  });

  return { active, withdrawn };
}
