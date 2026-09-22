import Link from "next/link";
import type { StudentGradesOverview } from "@/lib/grades/types";
import { CourseGradesCard } from "./CourseGradesCard";

interface Props {
  overview: StudentGradesOverview;
}

function gradeDisplay(grade: number | null) {
  return grade !== null ? grade.toFixed(2) : "—";
}

// D1 (spec-056): orquesta "Cursos activos" (desglose completo) y "Cursos
// retirados" (D4: solo nota total, sin desglose — la RLS no deja leer más).
export function GradesOverview({ overview }: Props) {
  const { active, withdrawn } = overview;

  if (active.length === 0 && withdrawn.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-8 py-14 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Aún no tienes cursos
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa el código de matrícula que te compartió tu docente desde{" "}
          <Link href="/cuenta/cursos" className="text-blue-700 dark:text-blue-400 hover:underline">
            Mis cursos
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {active.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Cursos activos
          </h2>
          <div className="flex flex-col gap-4">
            {active.map((summary) => (
              <CourseGradesCard key={summary.enrollment_id} summary={summary} />
            ))}
          </div>
        </section>
      )}

      {withdrawn.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Cursos retirados
          </h2>
          <div className="flex flex-col gap-3">
            {withdrawn.map((summary) => (
              <div
                key={summary.enrollment_id}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-4 opacity-75"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {summary.academic_course.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="font-mono">{summary.academic_course.code}</span>
                      {summary.teacher_name && <> · {summary.teacher_name}</>}
                    </p>
                  </div>
                  <span className="font-mono text-lg font-bold text-gray-500 dark:text-gray-400 shrink-0">
                    {gradeDisplay(summary.total_grade)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Fuiste retirado de este curso — el desglose de calificaciones no está disponible.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
