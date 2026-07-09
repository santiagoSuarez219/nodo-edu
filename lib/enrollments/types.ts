import type { AcademicCoursePublic } from "@/lib/academic-courses/types";
import type { Profile } from "@/lib/students/types";

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
  total_grade: number | null;
}

export interface EnrollmentWithStudent extends Enrollment {
  profile: Pick<Profile, "id" | "full_name">;
  total_grade: number | null;
}
