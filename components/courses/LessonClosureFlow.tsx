"use client";

import { useState } from "react";
import { SelfAssessmentSection } from "@/components/courses/SelfAssessmentSection";
import { LessonClosure } from "@/components/courses/LessonClosure";
import type { SelfAssessmentQuestion } from "@/lib/self-assessment/types";

interface LessonClosureFlowProps {
  courseSlug: string;
  lessonSlug: string;
  questions: SelfAssessmentQuestion[];
  attendance: React.ReactNode;
  initialCompletedAt: string | null;
  canComplete: boolean;
  blockedReason?: "self_assessment_pending";
}

export function LessonClosureFlow({
  courseSlug,
  lessonSlug,
  questions,
  attendance,
  initialCompletedAt,
  canComplete,
  blockedReason,
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
