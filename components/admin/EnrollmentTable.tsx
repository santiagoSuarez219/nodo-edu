import { withdrawStudentAction } from "@/lib/enrollments/actions";
import { ResetPasswordButton } from "./ResetPasswordButton";
import type { EnrollmentWithStudent } from "@/lib/enrollments/types";

interface Props {
  enrollments: EnrollmentWithStudent[];
  academicCourseId: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function gradeDisplay(grade: number | null) {
  if (grade === null) return "—";
  return grade.toFixed(2);
}

export function EnrollmentTable({ enrollments, academicCourseId }: Props) {
  const active = enrollments.filter((e) => e.status === "active");
  const withdrawn = enrollments.filter((e) => e.status === "withdrawn");

  if (enrollments.length === 0) {
    return (
      <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-14 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Ningún estudiante matriculado
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Comparte el código de matrícula para que los estudiantes puedan inscribirse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 ">
      {/* Estudiantes activos */}
      <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 overflow-hidden ">
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Activos
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {active.length} {active.length === 1 ? "estudiante" : "estudiantes"}
          </span>
        </div>
        {active.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
            No hay estudiantes activos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-white dark:bg-gray-800">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Fecha matrícula</th>
                  <th className="px-5 py-3 text-right">Nota total</th>
                  <th className="px-5 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {active.map((enrollment) => {
                  const withdrawAction = withdrawStudentAction.bind(
                    null,
                    enrollment.id,
                    academicCourseId
                  );
                  return (
                    <tr key={enrollment.id}>
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {enrollment.profile.full_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(enrollment.enrolled_at)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-gray-700 dark:text-gray-300">
                        {gradeDisplay(enrollment.total_grade)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <ResetPasswordButton
                            studentId={enrollment.student_id}
                            studentName={enrollment.profile.full_name}
                            academicCourseId={academicCourseId}
                          />
                          <form action={withdrawAction}>
                            <button
                              type="submit"
                              className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline transition-colors"
                            >
                              Retirar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estudiantes retirados */}
      {withdrawn.length > 0 && (
        <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Retirados
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {withdrawn.length} {withdrawn.length === 1 ? "estudiante" : "estudiantes"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-white dark:bg-gray-800">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Fecha matrícula</th>
                  <th className="px-5 py-3">Fecha retiro</th>
                  <th className="px-5 py-3 text-right">Nota total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {withdrawn.map((enrollment) => (
                  <tr key={enrollment.id} className="opacity-60">
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {enrollment.profile.full_name}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(enrollment.enrolled_at)}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                      {enrollment.withdrawn_at ? formatDate(enrollment.withdrawn_at) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-gray-500 dark:text-gray-400">
                      {gradeDisplay(enrollment.total_grade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
