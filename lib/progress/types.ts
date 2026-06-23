export interface LessonProgress {
  user_id: string;
  course_slug: string;
  lesson_slug: string;
  viewed_at: string;
  completed_at: string | null;
}
