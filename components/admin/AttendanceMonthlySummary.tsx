import Link from "next/link";
import type {
  MonthlyAbsenceCell,
  MonthlyAbsenceSummaryResult,
} from "@/lib/attendance/types";
import { formatHours } from "@/lib/attendance/monthly-summary";
import {
  formatMonthLong,
  formatMonthShort,
  formatSessionDateLong,
} from "@/lib/attendance/date-format";
import { formatStudentListName } from "@/lib/students/names";

interface Props {
  academicCourseId: string;
  summary: MonthlyAbsenceSummaryResult;
  // Mes elegido en la URL (D10); null = todos.
  month: string | null;
}

const box =
  "rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-12 text-center";
const linkBase =
  "rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700";
const linkActive = `${linkBase} bg-blue-700 text-white dark:bg-blue-600`;
const linkIdle = `${linkBase} border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700`;

function Cell({ cell }: { cell: MonthlyAbsenceCell }) {
  if (cell.kind === "not_applicable") {
    return (
      <td className="px-4 py-3 text-center text-gray-400 dark:text-gray-500">
        <span aria-hidden="true">—</span>
        <span className="sr-only">
          No aplica: matriculado después de estas clases
        </span>
      </td>
    );
  }
  if (cell.absences === 0) {
    return (
      <td className="px-4 py-3 text-center font-mono text-gray-400 dark:text-gray-500">
        <span aria-hidden="true">{formatHours(0)}</span>
        <span className="sr-only">Sin inasistencias</span>
      </td>
    );
  }
  return (
    <td className="px-4 py-3 text-center font-mono font-semibold text-gray-900 dark:text-white">
      <span aria-hidden="true">
        {formatHours(cell.hours)} ({cell.absences})
      </span>
      <span className="sr-only">
        {formatHours(cell.hours).replace(" h", "")} horas, {cell.absences}{" "}
        {cell.absences === 1 ? "clase faltada" : "clases faltadas"}
      </span>
    </td>
  );
}

// spec-063: vista de solo lectura, sin estado de cliente (D13).
export function AttendanceMonthlySummary({ academicCourseId, summary, month }: Props) {
  if (summary.status === "unavailable") {
    return (
      <div className="rounded-[var(--radius-base)] border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-8 py-12 text-center">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
          No se pudo cargar el resumen
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          Hubo un problema al consultar los datos. Intenta recargar la página en un momento.
        </p>
      </div>
    );
  }

  const base = `/admin/courses/${academicCourseId}/asistencia?vista=resumen`;
  const activeMonth = month && summary.months.some((m) => m.key === month) ? month : null;
  const shownMonths = activeMonth
    ? summary.months.filter((m) => m.key === activeMonth)
    : summary.months;

  const openNotice = summary.open_session_date && (
    <p
      role="status"
      className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 text-sm text-amber-800 dark:text-amber-300"
    >
      La clase del {formatSessionDateLong(summary.open_session_date)} está en curso y no se
      cuenta hasta que se cierre.
    </p>
  );

  if (summary.rows.length === 0) {
    return (
      <div className={box}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Este curso no tiene estudiantes con matrícula activa.
        </p>
      </div>
    );
  }

  if (summary.months.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {openNotice}
        <div className={box}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aún no hay clases cerradas para resumir.
          </p>
        </div>
      </div>
    );
  }

  const hoursLabel = formatHours(summary.hours_per_session);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Horas por sesión:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{hoursLabel}</span>{" "}
          <Link
            href={`/admin/courses/${academicCourseId}/edit`}
            className="text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded"
          >
            Cambiar
          </Link>
        </p>
        <p>
          Cada celda muestra horas y, entre paréntesis, clases faltadas. No se cuentan las
          clases anteriores a la fecha de matrícula de cada estudiante.
        </p>
      </div>

      {openNotice}

      <nav aria-label="Filtrar por mes" className="flex flex-wrap gap-2">
        <Link
          href={base}
          aria-current={activeMonth === null ? "true" : undefined}
          className={activeMonth === null ? linkActive : linkIdle}
        >
          Todos los meses
        </Link>
        {summary.months.map((m) => (
          <Link
            key={m.key}
            href={`${base}&mes=${m.key}`}
            aria-current={activeMonth === m.key ? "true" : undefined}
            className={activeMonth === m.key ? linkActive : linkIdle}
          >
            {formatMonthShort(m.key)}
          </Link>
        ))}
      </nav>

      <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <caption className="sr-only">
              Inasistencias por mes en horas y número de clases — Horas por sesión: {hoursLabel}
            </caption>
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th
                  scope="col"
                  className="px-5 py-3 text-left sticky left-0 bg-gray-50 dark:bg-gray-700 z-20"
                >
                  Estudiante
                </th>
                {shownMonths.map((m) => (
                  <th
                    key={m.key}
                    scope="col"
                    className="px-4 py-3 text-center"
                    title={`${formatMonthLong(m.key)}, ${m.session_count} ${m.session_count === 1 ? "clase" : "clases"}`}
                  >
                    <span aria-hidden="true" className="normal-case">
                      {formatMonthShort(m.key)}
                    </span>
                    <span className="sr-only">
                      {formatMonthLong(m.key)}, {m.session_count}{" "}
                      {m.session_count === 1 ? "clase" : "clases"}
                    </span>
                  </th>
                ))}
                {!activeMonth && (
                  <th scope="col" className="px-4 py-3 text-center">
                    Total
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {summary.rows.map((row) => (
                <tr key={row.student_id}>
                  <th
                    scope="row"
                    className="px-5 py-3 text-left font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10"
                  >
                    {formatStudentListName({
                      first_name: row.student_first_name,
                      last_name: row.student_last_name,
                      full_name: row.student_name,
                    })}
                  </th>
                  {shownMonths.map((m) => (
                    <Cell key={m.key} cell={row.months[m.key]} />
                  ))}
                  {!activeMonth && <Cell cell={row.total} />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
