"use client";

import { useState } from "react";
import { GradeInputCell } from "./GradeInputCell";
import { SelfAssessmentGradeCell } from "./SelfAssessmentGradeCell";
import { formatStudentListName } from "@/lib/students/names";
import { computeGradeSummary, formatInstitutionalGrade } from "@/lib/grades/compute";
import type { GradeItem, GradeGroup, CourseGradesRow } from "@/lib/grades/types";

interface Props {
  academicCourseId: string;
  gradeItems: GradeItem[];
  groups: GradeGroup[];
  rows: CourseGradesRow[];
}

const fmt = (n: number | null) => (n !== null ? n.toFixed(2) : "—");

export function GradesTable({ academicCourseId, gradeItems, groups, rows }: Props) {
  const [view, setView] = useState<"item" | "group">("item");
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);
  const [gradesState, setGradesState] = useState<
    Record<string, Record<string, number | null>>
  >(
    Object.fromEntries(rows.map((r) => [r.enrollment_id, { ...r.grades }]))
  );

  // D11: ítems agrupados por corte (en el orden de los cortes); sin corte al final.
  const sortedGroups = [...groups].sort((a, b) => a.order_index - b.order_index);
  const orderedItems = [
    ...sortedGroups.flatMap((g) => gradeItems.filter((i) => i.group_id === g.id)),
    ...gradeItems.filter((i) => !i.group_id || !groups.some((g) => g.id === i.group_id)),
  ];
  const ungroupedCount = orderedItems.length - sortedGroups.reduce(
    (acc, g) => acc + gradeItems.filter((i) => i.group_id === g.id).length,
    0
  );

  const summaryOf = (row: CourseGradesRow) =>
    computeGradeSummary(gradeItems, groups, gradesState[row.enrollment_id] ?? row.grades);

  async function copyGroupColumn(groupId: string) {
    const lines = rows.map((row) => {
      const gs = summaryOf(row).groups.find((g) => g.group_id === groupId);
      return formatInstitutionalGrade(gs?.grade_institutional ?? null);
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedGroupId(groupId);
      setTimeout(() => setCopiedGroupId((c) => (c === groupId ? null : c)), 2000);
    } catch {
      // Sin permiso de portapapeles: no hay nada útil que mostrar.
    }
  }

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

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-blue-700 text-white dark:bg-blue-600"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  const mismatched = sortedGroups.filter((g) => {
    const itemsWeight = gradeItems
      .filter((i) => i.group_id === g.id && i.weight !== null)
      .reduce((acc, i) => acc + Math.round((i.weight as number) * 1000), 0);
    return itemsWeight !== Math.round(g.target_weight * 1000);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Vista de la planilla" className="flex gap-1">
          <button role="tab" aria-selected={view === "item"} onClick={() => setView("item")} className={tabClass(view === "item")}>
            Por ítem
          </button>
          <button role="tab" aria-selected={view === "group"} onClick={() => setView("group")} className={tabClass(view === "group")}>
            Por corte
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md text-right">
          Una celda vacía es «aún no calificado» y no cuenta. Si el estudiante no entregó, registra{" "}
          <span className="font-mono">0</span>.
        </p>
      </div>

      {gradeItems.every((i) => i.weight === null) && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Este curso no tiene ponderaciones: el Promedio es un promedio simple (sin ponderar) de las
          notas registradas y no hay Acumulado.
        </p>
      )}

      {view === "group" && (
        <div className="text-xs flex flex-col gap-1">
          {ungroupedCount > 0 && (
            <p className="text-amber-700 dark:text-amber-400">
              {ungroupedCount === 1 ? "1 ítem sin corte" : `${ungroupedCount} ítems sin corte`}: cuentan en el
              acumulado y el promedio, pero no aparecen en ninguna columna de corte.
            </p>
          )}
          {mismatched.map((g) => (
            <p key={g.id} className="text-amber-700 dark:text-amber-400">
              {g.name}: los ítems no suman su peso objetivo ({g.target_weight.toFixed(2)}).
            </p>
          ))}
          <p className="text-gray-500 dark:text-gray-400">
            Notas de corte en formato institucional (un decimal, coma). La definitiva que calcule la plataforma
            institucional desde estos cortes puede diferir en unas centésimas del acumulado.
          </p>
        </div>
      )}

      <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {view === "item" ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {sortedGroups.length > 0 && (
                  <tr>
                    <th className="px-5 py-2 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10" />
                    {[
                      ...sortedGroups.map((g) => ({
                        key: g.id,
                        label: g.name,
                        span: gradeItems.filter((i) => i.group_id === g.id).length,
                      })),
                      { key: "none", label: "Sin corte", span: ungroupedCount },
                    ]
                      .filter((h) => h.span > 0)
                      .map((h) => (
                        <th key={h.key} colSpan={h.span} className="px-4 py-2 text-center border-l border-gray-200 dark:border-gray-600">
                          {h.label}
                        </th>
                      ))}
                    <th colSpan={2} />
                  </tr>
                )}
                <tr>
                  <th className="px-5 py-3 text-left sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">Estudiante</th>
                  {orderedItems.map((item) => (
                    <th key={item.id} className="px-4 py-3 text-right min-w-[9rem]">
                      {item.name}
                      {item.weight !== null && (
                        <span className="block font-mono font-normal normal-case text-gray-400">
                          peso {item.weight}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right min-w-[7rem]">Acumulado</th>
                  <th className="px-5 py-3 text-right min-w-[7rem]">Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {rows.map((row) => {
                  const grades = gradesState[row.enrollment_id] ?? row.grades;
                  const summary = summaryOf(row);
                  return (
                    <tr key={row.enrollment_id}>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">
                        {formatStudentListName({
                          first_name: row.student_first_name,
                          last_name: row.student_last_name,
                          full_name: row.student_name,
                        })}
                      </td>
                      {orderedItems.map((item) => (
                        <td key={item.id} className="px-4 py-2">
                          {item.kind === "self_assessment" ? (
                            // spec-040 D5: la nota es derivada — editarla a mano
                            // quedaría pisada por el siguiente recálculo, así que
                            // la celda es de solo lectura (se actualiza con el
                            // botón "Recalcular autoevaluaciones") con desglose
                            // por lección bajo demanda (D7).
                            <SelfAssessmentGradeCell
                              enrollmentId={row.enrollment_id}
                              academicCourseId={academicCourseId}
                              score={grades[item.id] ?? null}
                            />
                          ) : (
                            <GradeInputCell
                              enrollmentId={row.enrollment_id}
                              gradeItemId={item.id}
                              academicCourseId={academicCourseId}
                              initialScore={grades[item.id] ?? null}
                              studentName={row.student_name}
                              itemName={item.name}
                              onSave={(gradeItemId, score) =>
                                handleCellSave(row.enrollment_id, gradeItemId, score)
                              }
                            />
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                        {fmt(summary.accumulated)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                        {fmt(summary.projected)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">Estudiante</th>
                  {sortedGroups.map((g) => {
                    const incomplete = rows.filter((row) => {
                      const gs = summaryOf(row).groups.find((x) => x.group_id === g.id);
                      return gs?.grade_institutional != null && !gs.is_complete;
                    }).length;
                    return (
                      <th key={g.id} className="px-4 py-3 text-right min-w-[9rem]">
                        {g.name}
                        <span className="block font-mono font-normal normal-case text-gray-400">
                          objetivo {g.target_weight}
                        </span>
                        <button
                          onClick={() => copyGroupColumn(g.id)}
                          className="mt-1 normal-case font-medium text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          {copiedGroupId === g.id ? "¡Copiada!" : "Copiar columna"}
                        </button>
                        {incomplete > 0 && (
                          <span className="block normal-case font-normal text-amber-700 dark:text-amber-400">
                            {incomplete === 1 ? "1 fila incompleta" : `${incomplete} filas incompletas`}
                          </span>
                        )}
                      </th>
                    );
                  })}
                  <th className="px-5 py-3 text-right min-w-[7rem]">Acumulado</th>
                  <th className="px-5 py-3 text-right min-w-[7rem]">Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {rows.map((row) => {
                  const summary = summaryOf(row);
                  return (
                    <tr key={row.enrollment_id}>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">
                        {formatStudentListName({
                          first_name: row.student_first_name,
                          last_name: row.student_last_name,
                          full_name: row.student_name,
                        })}
                      </td>
                      {sortedGroups.map((g) => {
                        const gs = summary.groups.find((x) => x.group_id === g.id);
                        const value = gs?.grade_institutional ?? null;
                        return (
                          <td key={g.id} className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                            {value !== null ? formatInstitutionalGrade(value) : "—"}
                            {value !== null && gs && !gs.is_complete && (
                              <span className="ml-1.5 text-xs font-sans text-amber-700 dark:text-amber-400">
                                incompleto
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-5 py-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                        {fmt(summary.accumulated)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300">
                        {fmt(summary.projected)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
