import Link from "next/link";
import type { SubmissionWithAnswers } from "@/lib/submissions/types";

interface SubmissionListProps {
  academicCourseId: string;
  groupId: string;
  pending: SubmissionWithAnswers[];
  graded: SubmissionWithAnswers[];
  variantLabelByAssignmentId: Record<string, string>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SubmissionTable({
  submissions,
  academicCourseId,
  groupId,
  variantLabelByAssignmentId,
  emptyMessage,
}: {
  submissions: SubmissionWithAnswers[];
  academicCourseId: string;
  groupId: string;
  variantLabelByAssignmentId: Record<string, string>;
  emptyMessage: string;
}) {
  if (submissions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-600 dark:text-gray-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
              Estudiante
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
              Variante
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
              Enviado
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
              Calificado
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">
              Puntaje
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {submissions.map((submission) => (
            <tr
              key={submission.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {submission.student_name || "Desconocido"}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {variantLabelByAssignmentId[submission.assignment_id] ?? "—"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                {formatDate(submission.submitted_at)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                {formatDate(submission.graded_at)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                {submission.final_score ?? submission.auto_score ?? "—"}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/admin/courses/${academicCourseId}/assignments/${groupId}/review/${submission.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                >
                  Revisar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SubmissionList({
  academicCourseId,
  groupId,
  pending,
  graded,
  variantLabelByAssignmentId,
}: SubmissionListProps) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Pendientes de revisión
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({pending.length})
          </span>
        </h2>
        <SubmissionTable
          submissions={pending}
          academicCourseId={academicCourseId}
          groupId={groupId}
          variantLabelByAssignmentId={variantLabelByAssignmentId}
          emptyMessage="No hay envíos pendientes de revisión."
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Calificados
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({graded.length})
          </span>
        </h2>
        <SubmissionTable
          submissions={graded}
          academicCourseId={academicCourseId}
          groupId={groupId}
          variantLabelByAssignmentId={variantLabelByAssignmentId}
          emptyMessage="Todavía no hay envíos calificados."
        />
      </section>
    </div>
  );
}
