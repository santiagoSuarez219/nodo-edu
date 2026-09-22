import type { AcademicCoursePublic } from "@/lib/academic-courses/types";
import type { SelfAssessmentCourseSummary } from "@/lib/self-assessment/types";
import type { AssignmentScoreRow } from "@/lib/submissions/types";

export interface GradeItem {
  id: string;
  academic_course_id: string;
  name: string;
  order_index: number;
  created_at: string;
  // spec-040 D5: "manual" (docente) o "self_assessment" (creado y mantenido
  // por el RPC de propagación de la nota de autoevaluaciones). Como máximo
  // un ítem "self_assessment" por curso académico.
  kind: "manual" | "self_assessment";
}

export interface StudentGrade {
  id: string;
  enrollment_id: string;
  grade_item_id: string;
  score: number | null;
  recorded_at: string;
  updated_at: string;
}

export interface GradeItemWithScore extends GradeItem {
  score: number | null;
}

export interface EnrollmentWithGrades {
  enrollment_id: string;
  student_id: string;
  items: GradeItemWithScore[];
  total_grade: number | null;
}

export interface CourseGradesRow {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  enrollment_status: "active" | "withdrawn";
  grades: Record<string, number | null>;
  total_grade: number | null;
}

// spec-056 (Fase 1): resumen de un curso activo para "Mis notas". `assignments`
// distingue "consulta ok con 0 filas" ([]) de "la consulta falló" (null) — D5,
// mismo contrato de degradación que AssignmentScoresResult
// (lib/submissions/types.ts) del que se deriva.
export interface CourseGradesSummary {
  enrollment_id: string;
  academic_course: AcademicCoursePublic;
  teacher_name: string | null;
  items: GradeItemWithScore[];
  total_grade: number | null;
  self_assessment: SelfAssessmentCourseSummary | null;
  assignments: AssignmentScoreRow[] | null;
}

// D4: un curso retirado solo expone la nota total ya calculada por
// getEnrollmentsByStudent() — la RLS no deja leer grade_items ni
// assignment_variant_groups para una matrícula `withdrawn`, así que no hay
// desglose posible sin dar una tarjeta vacía engañosa.
export interface WithdrawnCourseSummary {
  enrollment_id: string;
  academic_course: AcademicCoursePublic;
  teacher_name: string | null;
  total_grade: number | null;
  withdrawn_at: string | null;
}

export interface StudentGradesOverview {
  active: CourseGradesSummary[];
  withdrawn: WithdrawnCourseSummary[];
}
