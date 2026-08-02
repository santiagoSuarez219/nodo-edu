import { SelfAssessmentSection } from "@/components/courses/SelfAssessmentSection";
import { LessonClosure } from "@/components/courses/LessonClosure";
import type { SelfAssessmentQuestion, AttemptReview } from "@/lib/self-assessment/types";

interface LessonClosureFlowProps {
  courseSlug: string;
  lessonSlug: string;
  questions: SelfAssessmentQuestion[];
  attendance: React.ReactNode;
  initialCompletedAt: string | null;
  canComplete: boolean;
  blockedReason?:
    | "self_assessment_pending"
    | "self_assessment_unavailable"
    | "lesson_disabled"
    | "availability_unavailable";
  // spec-040: revisión persistente del intento único, o `null` si el
  // estudiante todavía no respondió. Reemplaza el resumen agregado de
  // spec-033 — ya no hace falta el estado "isRetrying" (no hay reintentos).
  attemptReview: AttemptReview | null;
  // `true` cuando el estudiante ya tiene un intento registrado (el gate ya
  // lo confirmó) pero `getAttemptReview` no pudo reconstruirlo — distinto de
  // "todavía no respondió", para no ofrecer un formulario reenviable.
  attemptReviewUnavailable: boolean;
}

export function LessonClosureFlow({
  courseSlug,
  lessonSlug,
  questions,
  attendance,
  initialCompletedAt,
  canComplete,
  blockedReason,
  attemptReview,
  attemptReviewUnavailable,
}: LessonClosureFlowProps) {
  return (
    <>
      {questions.length > 0 && (
        <SelfAssessmentSection
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          questions={questions}
          attemptReview={attemptReview}
          attemptReviewUnavailable={attemptReviewUnavailable}
        />
      )}

      {attendance}

      <LessonClosure
        courseSlug={courseSlug}
        lessonSlug={lessonSlug}
        initialCompletedAt={initialCompletedAt}
        canComplete={canComplete}
        blockedReason={blockedReason}
      />
    </>
  );
}
