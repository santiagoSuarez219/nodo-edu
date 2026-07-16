"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markLessonCompleted, markLessonUncompleted } from "@/lib/progress";
import { AttendanceSection } from "@/components/courses/AttendanceSection";
import { SelfAssessmentSection } from "@/components/courses/SelfAssessmentSection";
import type { StudentAttendanceState } from "@/lib/attendance/types";
import type { SelfAssessmentQuestion } from "@/lib/self-assessment/types";

interface LessonClosureProps {
  courseSlug: string;
  lessonSlug: string;
  initialCompletedAt: string | null;
  attendance?: StudentAttendanceState;
  selfAssessment?: SelfAssessmentQuestion[];
}

export function LessonClosure({
  courseSlug,
  lessonSlug,
  initialCompletedAt,
  attendance,
  selfAssessment,
}: LessonClosureProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isCompleted = initialCompletedAt !== null;

  const handleToggleCompletion = () => {
    startTransition(async () => {
      if (isCompleted) {
        await markLessonUncompleted(courseSlug, lessonSlug);
      } else {
        await markLessonCompleted(courseSlug, lessonSlug);
      }
      router.refresh();
    });
  };

  const completedDate = initialCompletedAt
    ? new Date(initialCompletedAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Finalizar lección
        </h2>

        {isCompleted ? (
          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#f3faf7] dark:bg-[#014737] border border-success/30 dark:border-success/40">
            <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-success">
                Lección completada
              </p>
              {completedDate && (
                <p className="text-xs text-success/80 mt-1">
                  Completada el {completedDate}
                </p>
              )}
            </div>
            <button
              onClick={handleToggleCompletion}
              disabled={isPending}
              className="px-3 py-1 text-sm font-medium text-success hover:bg-success/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Guardando..." : "Desmarcar"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Marca esta lección como completada cuando termines de estudiarla.
            </p>
            <button
              onClick={handleToggleCompletion}
              disabled={isPending}
              className="ml-auto px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Guardando..." : "Completar lección"}
            </button>
          </div>
        )}
      </div>

      {/* Sección de asistencia (solo para estudiantes matriculados) */}
      {attendance && (
        <AttendanceSection
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          attendanceState={attendance}
        />
      )}

      {/* Sección de autoevaluación (solo para estudiantes matriculados con preguntas publicadas) */}
      {selfAssessment && selfAssessment.length > 0 && (
        <SelfAssessmentSection
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          questions={selfAssessment}
        />
      )}
    </section>
  );
}
