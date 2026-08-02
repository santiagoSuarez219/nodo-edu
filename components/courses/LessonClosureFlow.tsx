"use client";

import { useState } from "react";
import { SelfAssessmentSection } from "@/components/courses/SelfAssessmentSection";
import { LessonClosure } from "@/components/courses/LessonClosure";
import type { SelfAssessmentQuestion, SelfAssessmentAttemptSummary } from "@/lib/self-assessment/types";

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
  lastAttempt: SelfAssessmentAttemptSummary | null;
}

export function LessonClosureFlow({
  courseSlug,
  lessonSlug,
  questions,
  attendance,
  initialCompletedAt,
  canComplete,
  blockedReason,
  lastAttempt,
}: LessonClosureFlowProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  return (
    <>
      {questions.length > 0 && (
        <SelfAssessmentSection
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          questions={questions}
          onRetryingChange={setIsRetrying}
          lastAttempt={lastAttempt}
        />
      )}

      {attendance}

      <LessonClosure
        courseSlug={courseSlug}
        lessonSlug={lessonSlug}
        initialCompletedAt={initialCompletedAt}
        canComplete={isRetrying ? false : canComplete}
        blockedReason={isRetrying ? "self_assessment_pending" : blockedReason}
      />
    </>
  );
}
