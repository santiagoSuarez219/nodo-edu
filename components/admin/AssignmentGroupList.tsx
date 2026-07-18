"use client";

import Link from "next/link";
import { AssignmentVariantGroup } from "@/lib/assignments/types";

interface AssignmentGroupListProps {
  groups: AssignmentVariantGroup[];
  courseId: string;
}

export default function AssignmentGroupList({ groups, courseId }: AssignmentGroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">No hay evaluaciones. Crealas via MCP.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Sin límite";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Título</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Ventana</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Variantes</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {groups.map((group) => {
            const typeLabels: Record<string, string> = {
              practice: "Práctica",
              quiz: "Quiz",
              exam: "Examen",
              homework: "Tarea",
            };

            const window = group.opens_at || group.closes_at
              ? `${formatDate(group.opens_at)} - ${formatDate(group.closes_at)}`
              : "Sin ventana";

            return (
              <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/courses/${courseId}/assignments/${group.id}`}
                    className="text-blue-700 dark:text-blue-400 hover:underline font-medium"
                  >
                    {group.title}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {typeLabels[group.type] || group.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {window}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">3 variantes</td>
                <td className="px-6 py-4">
                  {group.is_published ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Publicada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Borrador
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
