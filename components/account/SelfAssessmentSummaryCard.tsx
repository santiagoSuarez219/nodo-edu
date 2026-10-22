import Link from "next/link";
import type { SelfAssessmentCourseSummary } from "@/lib/self-assessment/types";

interface Props {
  summary: SelfAssessmentCourseSummary;
  courseSlug: string;
}

// spec-040 D7 + spec-060 D11: trazabilidad visible del estudiante — nota,
// acumulado crudo y desglose por lección dictada, marcando explícitamente las
// no respondidas para que la penalización sea visible y explicable, y
// recordando que aún puede responderlas.
export function SelfAssessmentSummaryCard({ summary, courseSlug }: Props) {

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

      {summary.taughtLessonCount === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tu docente aún no ha marcado lecciones como vistas en clase. Tu nota de
          autoevaluaciones aparecerá cuando lo haga.
        </p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {summary.correctTotal}/{summary.questionTotal} preguntas correctas
        </p>
      )}

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
                <p className="text-xs text-danger dark:text-red-400">
                  Sin responder — 0/{lesson.questionCount}{" "}
                  <Link
                    href={`/${courseSlug}/${lesson.lessonSlug}`}
                    className="underline underline-offset-2"
                  >
                    Responder
                  </Link>
                </p>
              )}
            </div>
            <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              {lesson.correctCount}/{lesson.questionCount}
            </span>
          </div>
        ))}
      </div>

      {summary.taughtLessonCount > 0 && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Cuentan las lecciones que tu docente ya marcó como vistas en clase. Si aún
          no respondiste la autoevaluación de una de ellas, cuenta como 0, pero
          todavía puedes responderla y tu nota se actualizará.
        </p>
      )}
    </div>
  );
}
