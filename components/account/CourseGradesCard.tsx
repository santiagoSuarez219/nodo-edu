import Link from "next/link";
import type { CourseGradesSummary } from "@/lib/grades/types";
import { AssignmentScoreList } from "./AssignmentScoreList";
import { ErrorState, INFRA_ERROR_COPY } from "@/components/ErrorState";

interface Props {
  summary: CourseGradesSummary;
}

export function CourseGradesCard({ summary }: Props) {
  const course = summary.academic_course;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate">{course.name}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span className="font-mono">{course.code}</span>
            {summary.teacher_name && <> · {summary.teacher_name}</>}
          </p>
        </div>
        <Link
          href={`/cuenta/cursos/${summary.enrollment_id}`}
          className="shrink-0 text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
        >
          Ver curso
        </Link>
      </div>

      {summary.items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          El docente aún no ha definido ítems de evaluación.
        </p>
      ) : (
        <>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {summary.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 gap-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                  {item.score !== null ? item.score.toFixed(2) : "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Nota total</span>
            <span
              className={`font-mono text-xl font-bold ${
                summary.total_grade !== null
                  ? summary.total_grade >= 3
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {summary.total_grade !== null ? summary.total_grade.toFixed(2) : "—"}
            </span>
          </div>
        </>
      )}

      {summary.self_assessment && summary.self_assessment.lessons.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">Autoevaluaciones</span>
          <span
            className={`font-mono text-sm font-semibold ${
              summary.self_assessment.score !== null
                ? summary.self_assessment.score >= 3
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {summary.self_assessment.score !== null
              ? summary.self_assessment.score.toFixed(2)
              : "—"}
          </span>
        </div>
      )}

      {/* D5: null marca fallo de la consulta de evaluaciones — se reemplaza esa
          sección por ErrorState sin tumbar el resto de la tarjeta. */}
      {summary.assignments === null ? (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <ErrorState title={INFRA_ERROR_COPY.title} description={INFRA_ERROR_COPY.description} />
        </div>
      ) : (
        <AssignmentScoreList enrollmentId={summary.enrollment_id} assignments={summary.assignments} />
      )}
    </div>
  );
}
