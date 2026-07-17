import Link from "next/link";
import type { AcademicCourse } from "@/lib/academic-courses/types";

const DAY_LABELS: Record<string, string> = {
  lunes: "Lun",
  martes: "Mar",
  miercoles: "Mié",
  jueves: "Jue",
  viernes: "Vie",
  sabado: "Sáb",
};

function formatTime(t: string) {
  return t.slice(0, 5);
}

interface Props {
  courses: AcademicCourse[];
}

export function AcademicCourseList({ courses }: Props) {
  if (courses.length === 0) {
    return (
      <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-16 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          No tienes cursos todavía
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Crea tu primer curso para empezar a matricular estudiantes.
        </p>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear curso
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Horario</th>
              <th className="px-5 py-3">Código matrícula</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                  {course.name}
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                  {course.code}
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                  <span className="block">
                    {course.class_days.map((d) => DAY_LABELS[d] ?? d).join(", ")}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTime(course.class_time_start)} – {formatTime(course.class_time_end)}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                  {course.enrollment_code}
                </td>
                <td className="px-5 py-4">
                  {course.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Ver detalle
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/presentacion`}
                      className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Presentación
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/contenido`}
                      className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:underline"
                    >
                      Contenido
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
