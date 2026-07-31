"use client";

import { useEffect, useState } from "react";
import { getVariantAllocationsAction } from "@/lib/assignments/actions";

interface AllocationRecord {
  enrollment_id: string;
  assignment_id: string;
  variant_label: string;
  allocated_at: string;
  student_name?: string;
}

interface VariantAllocationTableProps {
  groupId: string;
}

export default function VariantAllocationTable({ groupId }: VariantAllocationTableProps) {
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const data = await getVariantAllocationsAction(groupId);
        setAllocations(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar asignaciones";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <p className="text-sm text-red-800 dark:text-red-200">Error: {error}</p>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">Ningún estudiante ha abierto esta evaluación aún.</p>
        </div>
      </div>
    );
  }

  const countByVariant = allocations.reduce(
    (acc, a) => {
      acc[a.variant_label] = (acc[a.variant_label] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedAllocations = [...allocations].sort((a, b) => {
    const dateA = new Date(a.allocated_at).getTime();
    const dateB = new Date(b.allocated_at).getTime();
    return dateB - dateA;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-3 flex gap-4">
          {Object.entries(countByVariant).map(([variant, count]) => (
            <div key={variant} className="text-sm">
              <span className="font-semibold text-gray-900 dark:text-white">
                Variante {variant}:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-300 font-mono">
                {count} estudiante{count !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>

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
                Asignada en
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAllocations.map((allocation) => (
              <tr key={allocation.enrollment_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {allocation.student_name || "Desconocido"}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {allocation.variant_label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                  {formatDate(allocation.allocated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
