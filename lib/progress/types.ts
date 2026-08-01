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
      reason:
        | "not_authenticated"
        | "not_enrolled"
        | "self_assessment_pending"
        // Fallar cerrado (D8 de spec-037): no se pudo verificar la
        // autoevaluación, así que no se permite completar la lección.
        | "self_assessment_unavailable"
        // El upsert de lesson_progress falló y antes se reportaba éxito
        // igual (DEBT-037, Frente 4).
        | "save_failed";
    };
