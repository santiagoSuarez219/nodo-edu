"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { markStudentAttendanceAction, unmarkStudentAttendanceAction } from "@/lib/attendance/actions";
import {
  isServerActionTransportError,
  SERVER_ACTION_TRANSPORT_ERROR_MESSAGE,
} from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";
import { formatSessionDateLong, formatSessionDateShort } from "@/lib/attendance/date-format";
import { AttendanceCell } from "./AttendanceCell";
import { AttendanceSessionActions } from "./AttendanceSessionActions";
import { CreateManualSessionForm } from "./CreateManualSessionForm";
import type {
  AttendanceSheetCell,
  AttendanceSheetResult,
  AttendanceSheetRow,
} from "@/lib/attendance/types";

interface Props {
  academicCourseId: string;
  sheet: AttendanceSheetResult;
}

type CellSaveStatus = "idle" | "saving" | "error";

const EMPTY_CELL: AttendanceSheetCell = {
  present: false,
  marked_at: null,
  marked_manually: false,
};

function cellKey(studentId: string, sessionId: string): string {
  return `${studentId}:${sessionId}`;
}

// Identidad estable: un `[]` inline en cada render (cuando `status:
// 'unavailable'`) haría que `useMemo` de abajo recalculara siempre.
const EMPTY_ROWS: AttendanceSheetRow[] = [];

export function AttendanceSheet({ academicCourseId, sheet }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // DEBT-075: `overrides` nunca se limpia. Converge con el servidor tras un
  // guardado propio (la siguiente `sheet` revalidada coincide), pero si OTRA
  // pestaña/sesión cambia la misma celda mientras esta sigue abierta, el
  // override local la enmascara indefinidamente. Mismo límite que ya acepta
  // `gradesState` en GradesTable.tsx; ver docs/specs/backlog.md.
  const [overrides, setOverrides] = useState<Record<string, AttendanceSheetCell>>({});
  const [cellStatus, setCellStatus] = useState<Record<string, CellSaveStatus>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  // D10: al MONTAR (no en cada actualización), la sesión más reciente
  // (extremo derecho, orden ascendente) queda a la vista sin dejar de leer el
  // semestre en su dirección natural. Deps vacías a propósito: cada Server
  // Action llama a `revalidatePath`, lo que trae una `sheet` con identidad
  // nueva en cada guardado — con `[sheet]` como dependencia, el efecto se
  // repetía en cada clic y arrastraba la vista al extremo derecho aunque el
  // docente estuviera corrigiendo una sesión antigua (hallazgo @reviewer).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  // Reglas de los Hooks: `rows` (y su Map derivado) se calculan siempre, aun
  // en `status: 'unavailable'`, para no llamar a `useMemo` condicionalmente
  // antes del `return` temprano de abajo. `EMPTY_ROWS` mantiene identidad
  // estable entre renders para que el `useMemo` de abajo no recalcule de más.
  const rows = sheet.status === "ok" ? sheet.rows : EMPTY_ROWS;

  // Hallazgo @reviewer: `rows.find()` dentro del recorrido de cada celda es
  // O(estudiantes × sesiones × estudiantes) en un curso grande. Un `Map` lo
  // deja lineal.
  const rowsByStudentId = useMemo(
    () => new Map(rows.map((r) => [r.student_id, r])),
    [rows]
  );

  if (sheet.status === "unavailable") {
    return (
      <div className="rounded-[var(--radius-base)] border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-8 py-12 text-center">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
          No se pudo cargar la asistencia
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          Hubo un problema al consultar los datos. Intenta recargar la página en un momento.
        </p>
      </div>
    );
  }

  const { sessions } = sheet;

  function getCell(studentId: string, sessionId: string): AttendanceSheetCell {
    const key = cellKey(studentId, sessionId);
    if (key in overrides) return overrides[key];
    const row = rowsByStudentId.get(studentId);
    return row?.cells[sessionId] ?? EMPTY_CELL;
  }

  function computePct(studentId: string): number | null {
    if (sessions.length === 0) return null;
    const attended = sessions.filter((s) => getCell(studentId, s.id).present).length;
    return Math.round((attended / sessions.length) * 100);
  }

  async function handleToggle(studentId: string, sessionId: string) {
    const key = cellKey(studentId, sessionId);
    const current = getCell(studentId, sessionId);
    const optimistic: AttendanceSheetCell = current.present
      ? { present: false, marked_at: null, marked_manually: false }
      : { present: true, marked_at: new Date().toISOString(), marked_manually: true };

    setActionError(null);
    setOverrides((prev) => ({ ...prev, [key]: optimistic }));
    setCellStatus((prev) => ({ ...prev, [key]: "saving" }));

    let result;
    try {
      result = current.present
        ? await unmarkStudentAttendanceAction(sessionId, studentId, academicCourseId)
        : await markStudentAttendanceAction(sessionId, studentId, academicCourseId);
    } catch (err) {
      if (!isServerActionTransportError(err)) throw err;
      reportTransportError(
        err,
        current.present ? "unmarkStudentAttendanceAction" : "markStudentAttendanceAction"
      );
      setOverrides((prev) => ({ ...prev, [key]: current }));
      setCellStatus((prev) => ({ ...prev, [key]: "error" }));
      setActionError(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
      return;
    }

    if (!result.ok) {
      setOverrides((prev) => ({ ...prev, [key]: current }));
      setCellStatus((prev) => ({ ...prev, [key]: "error" }));
      setActionError(result.error);
      return;
    }

    setCellStatus((prev) => ({ ...prev, [key]: "idle" }));
  }

  return (
    <div className="flex flex-col gap-4">
      <CreateManualSessionForm
        academicCourseId={academicCourseId}
        existingDates={sessions.map((s) => s.session_date)}
      />

      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-700 dark:text-red-400"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Descartar"
            className="font-bold leading-none"
          >
            ×
          </button>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-12 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Aún no se ha registrado ninguna sesión
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ábrela desde la lección al empezar la clase, o registra una pasada arriba.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay estudiantes con matrícula activa.
          </p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div ref={scrollRef} className="overflow-x-auto">
            <table className="text-sm border-separate border-spacing-0">
              <caption className="sr-only">
                Planilla de asistencia: una fila por estudiante activo, una columna por sesión de
                clase, con el porcentaje de asistencia al final.
              </caption>
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left sticky left-0 bg-gray-50 dark:bg-gray-700 z-20"
                  >
                    Estudiante
                  </th>
                  {sessions.map((session) => {
                    const { day, month } = formatSessionDateShort(session.session_date);
                    return (
                      <th
                        key={session.id}
                        scope="col"
                        className="px-2 py-2 text-center min-w-[4.5rem]"
                        title={formatSessionDateLong(session.session_date)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span aria-hidden="true" className="font-mono normal-case">
                            {day}
                            <br />
                            {month}
                          </span>
                          <span className="sr-only">
                            {formatSessionDateLong(session.session_date)}
                          </span>
                          {session.is_open ? (
                            <span className="rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-1.5 py-0.5 text-[0.6rem] font-bold normal-case">
                              En curso
                            </span>
                          ) : (
                            !session.has_code && (
                              <span
                                title="Registrada manualmente por el docente, sin código"
                                className="rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 text-[0.6rem] font-bold normal-case"
                              >
                                Manual
                              </span>
                            )
                          )}
                          <AttendanceSessionActions
                            academicCourseId={academicCourseId}
                            session={session}
                            attendeeCount={session.attendee_count}
                          />
                        </div>
                      </th>
                    );
                  })}
                  <th
                    scope="col"
                    className="px-4 py-3 text-right sticky right-0 bg-gray-50 dark:bg-gray-700 z-20 min-w-[4rem]"
                  >
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {rows.map((row) => {
                  const pct = computePct(row.student_id);
                  return (
                    <tr key={row.student_id}>
                      <th
                        scope="row"
                        className="px-5 py-3 text-left font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10"
                      >
                        {row.student_name}
                      </th>
                      {sessions.map((session) => {
                        const cell = getCell(row.student_id, session.id);
                        const key = cellKey(row.student_id, session.id);
                        return (
                          <td key={session.id} className="px-2 py-2 text-center">
                            <AttendanceCell
                              checked={cell.present}
                              markedManually={cell.marked_manually}
                              markedAt={cell.marked_at}
                              status={cellStatus[key] ?? "idle"}
                              studentName={row.student_name}
                              sessionDateLabel={formatSessionDateLong(session.session_date)}
                              onToggle={() => handleToggle(row.student_id, session.id)}
                            />
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-700 dark:text-gray-300 sticky right-0 bg-white dark:bg-gray-800">
                        {pct !== null ? `${pct}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
