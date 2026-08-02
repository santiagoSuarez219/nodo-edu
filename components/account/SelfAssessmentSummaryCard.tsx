import type { SelfAssessmentCourseSummary } from "@/lib/self-assessment/types";

interface Props {
  summary: SelfAssessmentCourseSummary;
}

// spec-040 D7: trazabilidad visible del estudiante — nota, acumulado crudo y
// desglose por lección, marcando explícitamente las no respondidas para que
// la penalización sea visible y explicable, no un descuento invisible.
export function SelfAssessmentSummaryCard({ summary }: Props) {
  if (summary.lessons.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Autoevaluaciones
        </h2>
        <span
          className={`font-mono text-xl font-bold shrink-0 ${
            summary.score !== null
              ? summary.score >= 3
                ? "text-green-700 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {summary.score !== null ? summary.score.toFixed(2) : "—"}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {summary.correctTotal}/{summary.questionTotal} preguntas correctas
      </p>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {summary.lessons.map((lesson) => (
          <div
            key={lesson.lessonSlug}
            className="flex items-center justify-between py-2.5 gap-4"
          >
            <div className="min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">
                {lesson.lessonTitle}
              </p>
              {!lesson.answered && (
                <p className="text-xs text-danger dark:text-red-400">Sin responder</p>
              )}
            </div>
            <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              {lesson.correctCount}/{lesson.questionCount}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Se cuentan las lecciones que ya abriste. Las autoevaluaciones sin responder
        cuentan como incorrectas.
      </p>
    </div>
  );
}
