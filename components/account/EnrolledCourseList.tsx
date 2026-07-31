import Link from "next/link";
import type { EnrollmentWithCourse } from "@/lib/enrollments/types";

const DAY_LABELS: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sáb",
};

interface Props {
  enrollments: EnrollmentWithCourse[];
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export function EnrolledCourseList({ enrollments }: Props) {
  if (enrollments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-8 py-14 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          No estás matriculado en ningún curso
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa el código de matrícula que te compartió tu docente.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {enrollments.map((enrollment) => {
        const course = enrollment.academic_course;
        const days = course.class_days.map((d) => DAY_LABELS[d] ?? d).join(", ");
        const timeStart = formatTime(course.class_time_start);
        const timeEnd = formatTime(course.class_time_end);
        const isWithdrawn = enrollment.status === "withdrawn";
        const contentHref = course.course_slug ? `/${course.course_slug}` : null;

        const courseInfo = (
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {course.name}
              </span>
              {isWithdrawn ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Retirado
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Activo
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
              <span>
                <span className="font-medium text-gray-600 dark:text-gray-300">Código:</span>{" "}
                <span className="font-mono">{course.code}</span>
              </span>
              {enrollment.teacher_name && (
                <span>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Docente:</span>{" "}
                  {enrollment.teacher_name}
                </span>
              )}
              <span>
                {days} · {timeStart}–{timeEnd}
              </span>
            </div>
          </div>
        );

        const gradeInfo = (
          <div className="text-right">
            <span className="text-xs text-gray-400 dark:text-gray-500 block">Nota</span>
            <span className="text-lg font-bold font-mono text-gray-900 dark:text-white">
              {enrollment.total_grade !== null ? enrollment.total_grade.toFixed(2) : "—"}
            </span>
          </div>
        );

        return (
          <div
            key={enrollment.id}
            className={`bg-white dark:bg-gray-800 border rounded-[var(--radius-base)] overflow-hidden flex items-stretch transition-colors ${
              isWithdrawn
                ? "border-gray-100 dark:border-gray-700 opacity-60"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {contentHref && !isWithdrawn ? (
              <Link
                href={contentHref}
                aria-label={`Ver contenido de ${course.name}`}
                className="flex-1 min-w-0 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {courseInfo}
              </Link>
            ) : (
              <div className="flex-1 min-w-0 px-5 py-4">{courseInfo}</div>
            )}

            <div className="w-px bg-gray-200 dark:bg-gray-700 shrink-0" />

            {isWithdrawn ? (
              <div className="shrink-0 px-5 py-4 flex items-center">{gradeInfo}</div>
            ) : (
              <Link
                href={`/cuenta/cursos/${enrollment.id}`}
                aria-label={`Ver detalle de matrícula de ${course.name}`}
                className="shrink-0 px-5 py-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {gradeInfo}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
