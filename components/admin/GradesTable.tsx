"use client";

import { useState } from "react";
import { GradeInputCell } from "./GradeInputCell";
import type { GradeItem, CourseGradesRow } from "@/lib/grades/types";

interface Props {
  academicCourseId: string;
  gradeItems: GradeItem[];
  rows: CourseGradesRow[];
}

function computeTotal(grades: Record<string, number | null>): number | null {
  const scores = Object.values(grades).filter((s): s is number => s !== null);
  if (scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 100) / 100;
}

export function GradesTable({ academicCourseId, gradeItems, rows }: Props) {
  const [gradesState, setGradesState] = useState<
    Record<string, Record<string, number | null>>
  >(
    Object.fromEntries(rows.map((r) => [r.enrollment_id, { ...r.grades }]))
  );

  function handleCellSave(
    enrollmentId: string,
    gradeItemId: string,
    score: number | null
  ) {
    setGradesState((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [gradeItemId]: score },
    }));
  }

  if (gradeItems.length === 0) {
    return (
      <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-12 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Sin ítems de evaluación
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Añade al menos un ítem de evaluación para registrar calificaciones.
        </p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay estudiantes activos matriculados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                Estudiante
              </th>
              {gradeItems.map((item) => (
                <th key={item.id} className="px-4 py-3 text-right min-w-[9rem]">
                  {item.name}
                </th>
              ))}
              <th className="px-5 py-3 text-right min-w-[7rem]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {rows.map((row) => {
              const grades = gradesState[row.enrollment_id] ?? row.grades;
              const total = computeTotal(grades);
              return (
                <tr key={row.enrollment_id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">
                    {row.student_name}
                  </td>
                  {gradeItems.map((item) => (
                    <td key={item.id} className="px-4 py-2">
                      <GradeInputCell
                        enrollmentId={row.enrollment_id}
                        gradeItemId={item.id}
                        academicCourseId={academicCourseId}
                        initialScore={grades[item.id] ?? null}
                        onSave={(gradeItemId, score) =>
                          handleCellSave(row.enrollment_id, gradeItemId, score)
                        }
                      />
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                    {total !== null ? total.toFixed(2) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
