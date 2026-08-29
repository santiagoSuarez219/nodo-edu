"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSessionDateAction, deleteSessionAction } from "@/lib/attendance/actions";
import {
  isServerActionTransportError,
  SERVER_ACTION_TRANSPORT_ERROR_MESSAGE,
} from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";
import { formatSessionDateLong } from "@/lib/attendance/date-format";
import type { AttendanceSheetSession } from "@/lib/attendance/types";

interface Props {
  academicCourseId: string;
  session: AttendanceSheetSession;
  // D11: el conteo real de registros que se perderían al borrar, calculado
  // por el padre a partir de la planilla que ya está en pantalla.
  attendeeCount: number;
}

type DialogKind = "edit" | "delete" | null;

// spec-054 (D5, D11, D12): acciones curatoriales sobre una sesión cerrada —
// editar su fecha o eliminarla. Deshabilitadas en la sesión en curso: esos
// controles viven en la vista de lección (AdminAttendancePanel), no aquí.
export function AttendanceSessionActions({ academicCourseId, session, attendeeCount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [dateValue, setDateValue] = useState(session.session_date);
  const [error, setError] = useState<string | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Mismo comportamiento que CourseLifecycleActions: Escape cierra, el foco
  // va al control principal del diálogo al abrirlo.
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialog(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    (dialog === "edit" ? dateInputRef : confirmButtonRef).current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [dialog]);

  function openDialog(kind: DialogKind) {
    setError(null);
    setDateValue(session.session_date);
    setDialog(kind);
  }

  function handleSaveDate() {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await updateSessionDateAction(session.id, dateValue, academicCourseId);
      } catch (err) {
        if (!isServerActionTransportError(err)) throw err;
        reportTransportError(err, "updateSessionDateAction");
        setError(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDialog(null);
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await deleteSessionAction(session.id, academicCourseId);
      } catch (err) {
        if (!isServerActionTransportError(err)) throw err;
        reportTransportError(err, "deleteSessionAction");
        setError(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDialog(null);
      router.refresh();
    });
  }

  const disabledReason = session.is_open
    ? "Esta sesión está en curso; se cierra desde la lección."
    : undefined;

  return (
    <>
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          disabled={session.is_open}
          onClick={() => openDialog("edit")}
          aria-label={`Editar fecha de la sesión del ${formatSessionDateLong(session.session_date)}`}
          title={disabledReason ?? "Editar fecha"}
          className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:hover:text-gray-400"
        >
          ✏️
        </button>
        <button
          type="button"
          disabled={session.is_open}
          onClick={() => openDialog("delete")}
          aria-label={`Eliminar la sesión del ${formatSessionDateLong(session.session_date)}`}
          title={disabledReason ?? "Eliminar sesión"}
          className="rounded p-1 text-gray-400 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-400"
        >
          🗑️
        </button>
      </div>

      {dialog && (
        <>
          <button
            type="button"
            aria-label="Cancelar"
            onClick={() => setDialog(null)}
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-session-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl flex flex-col gap-4">
              {dialog === "edit" ? (
                <>
                  <h2
                    id="attendance-session-dialog-title"
                    className="text-base font-bold text-gray-900 dark:text-white"
                  >
                    Editar fecha de la sesión
                  </h2>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
                  />
                  {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDialog(null)}
                      className="rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleSaveDate}
                      className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2
                    id="attendance-session-dialog-title"
                    className="text-base font-bold text-gray-900 dark:text-white"
                  >
                    Eliminar sesión
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Eliminar la sesión del{" "}
                    <strong>{formatSessionDateLong(session.session_date)}</strong> borrará también
                    sus <strong>{attendeeCount} registro(s) de asistencia</strong>. Esta acción no
                    se puede deshacer.
                  </p>
                  {error && <p className="text-sm text-red-700 dark:text-red-400">{error}</p>}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDialog(null)}
                      className="rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      ref={confirmButtonRef}
                      type="button"
                      disabled={isPending}
                      onClick={handleDelete}
                      className="rounded-lg bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
