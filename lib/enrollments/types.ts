import type { AcademicCoursePublic } from "@/lib/academic-courses/types";
import type { StudentProfilePublic } from "@/lib/students/types";
import type { GradeSummary } from "@/lib/grades/types";

export interface Enrollment {
  id: string;
  student_id: string;
  academic_course_id: string;
  status: "active" | "withdrawn";
  enrolled_at: string;
  withdrawn_at: string | null;
}

export interface EnrollmentWithCourse extends Enrollment {
  academic_course: AcademicCoursePublic;
  teacher_name: string | null;
}

// spec-059 D9: con la nota a la fecha; solo para las vistas que la muestran.
export interface EnrollmentWithCourseAndGrades extends EnrollmentWithCourse {
  grade_summary: GradeSummary;
}

export interface EnrollmentWithStudent extends Enrollment {
  profile: StudentProfilePublic;
  grade_summary: GradeSummary;
}
