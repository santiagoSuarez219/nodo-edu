export interface AcademicCourse {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  class_days: string[];
  class_time_start: string;
  class_time_end: string;
  enrollment_code: string;
  course_slug: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AcademicCourseInput = Pick<
  AcademicCourse,
  | "name"
  | "code"
  | "class_days"
  | "class_time_start"
  | "class_time_end"
  | "enrollment_code"
  | "course_slug"
>;

export type AcademicCourseUpdate = Partial<
  AcademicCourseInput & { is_active: boolean }
>;
