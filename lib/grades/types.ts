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
