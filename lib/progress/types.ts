export interface LessonProgress {
  user_id: string;
  course_slug: string;
  lesson_slug: string;
  viewed_at: string;
  completed_at: string | null;
}

export type MarkLessonCompletedResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      reason: "not_authenticated" | "not_enrolled" | "self_assessment_pending";
    };
