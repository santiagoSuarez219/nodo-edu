import { GradeBreakdown } from "./GradeBreakdown";
import type { EnrollmentWithCourse } from "@/lib/enrollments/types";
import type { EnrollmentWithGrades } from "@/lib/grades/types";

const DAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
};

interface Props {
  enrollment: EnrollmentWithCourse;
  gradesData: EnrollmentWithGrades;
}

export function EnrollmentDetail({ enrollment, gradesData }: Props) {
  const course = enrollment.academic_course;
  const days = course.class_days.map((d) => DAY_LABELS[d] ?? d).join(", ");
  const timeStart = course.class_time_start.slice(0, 5);
  const timeEnd = course.class_time_end.slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      {/* Info del curso */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Información del curso
        </h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Código
            </dt>
            <dd className="font-mono text-gray-900 dark:text-white">{course.code}</dd>
          </div>
          {enrollment.teacher_name && (
            <div>
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                Docente
              </dt>
              <dd className="text-gray-900 dark:text-white">{enrollment.teacher_name}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Días
            </dt>
            <dd className="text-gray-900 dark:text-white">{days}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Horario
            </dt>
            <dd className="text-gray-900 dark:text-white">
              {timeStart} – {timeEnd}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Estado
            </dt>
            <dd>
              {enrollment.status === "active" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Retirado
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Calificaciones */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Calificaciones
        </h2>

        {gradesData.items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            El docente aún no ha definido ítems de evaluación.
          </p>
        ) : (
          <GradeBreakdown
            items={gradesData.items}
            groups={gradesData.groups}
            summary={gradesData.grade_summary}
            rowClassName="py-3"
          />
        )}
      </div>
    </div>
  );
}
