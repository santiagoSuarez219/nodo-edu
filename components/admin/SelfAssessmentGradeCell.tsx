"use client";

import { useState, useTransition } from "react";
import { getSelfAssessmentBreakdownForEnrollment } from "@/lib/self-assessment";
import type { SelfAssessmentCourseSummary } from "@/lib/self-assessment/types";

interface Props {
  enrollmentId: string;
  academicCourseId: string;
  score: number | null;
}

// spec-040 Fase 5 (D7): celda de solo lectura del ítem de autoevaluaciones,
// con un desglose por lección bajo demanda para que el docente pueda
// responder "¿por qué tengo 3.2?" sin consultar la base de datos.
export function SelfAssessmentGradeCell({ enrollmentId, academicCourseId, score }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState<SelfAssessmentCourseSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && !summary) {
      startTransition(async () => {
        const result = await getSelfAssessmentBreakdownForEnrollment(
          enrollmentId,
          academicCourseId
        );
        setSummary(result);
      });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        title="Ver desglose por lección"
        className="block w-20 text-right text-sm font-mono text-gray-700 dark:text-gray-300 hover:text-brand dark:hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors"
      >
        {score !== null ? score.toFixed(2) : "—"}
      </button>

      {expanded && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3 text-left">
          {isPending && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Cargando…</p>
          )}
          {!isPending && summary && summary.lessons.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sin lecciones evaluables todavía.
            </p>
          )}
          {!isPending && summary && summary.lessons.length > 0 && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {summary.correctTotal}/{summary.questionTotal} preguntas correctas
              </p>
              <ul className="flex flex-col gap-1 max-h-56 overflow-y-auto">
                {summary.lessons.map((lesson) => (
                  <li
                    key={lesson.lessonSlug}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate text-gray-700 dark:text-gray-300">
                      {lesson.lessonTitle}
                      {!lesson.answered && (
                        <span className="ml-1 text-danger dark:text-red-400">
                          (sin responder)
                        </span>
                      )}
                    </span>
                    <span className="font-mono shrink-0 text-gray-600 dark:text-gray-400">
                      {lesson.correctCount}/{lesson.questionCount}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {!isPending && !summary && (
            <p className="text-xs text-danger dark:text-red-400">
              No se pudo cargar el desglose.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
