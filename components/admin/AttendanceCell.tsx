"use client";

type CellStatus = "idle" | "saving" | "error";

interface Props {
  checked: boolean;
  markedManually: boolean;
  status: CellStatus;
  studentName: string;
  sessionDateLabel: string;
  onToggle: () => void;
}

// spec-054 (D9, D10): celda pura y controlada — todo el estado (optimista,
// guardado, reversión) vive en `AttendanceSheet`, que es quien conoce el
// valor anterior para revertir y quien necesita el valor actual para el %.
export function AttendanceCell({
  checked,
  markedManually,
  status,
  studentName,
  sessionDateLabel,
  onToggle,
}: Props) {
  const ariaLabel = `Asistencia de ${studentName} el ${sessionDateLabel}`;
  const statusLabel =
    status === "saving" ? "Guardando" : status === "error" ? "Error al guardar" : "";

  return (
    <div className="relative flex items-center justify-center gap-1">
      <input
        type="checkbox"
        checked={checked}
        disabled={status === "saving"}
        onChange={onToggle}
        aria-label={ariaLabel}
        title={
          markedManually
            ? "Marcada manualmente por el docente"
            : checked
              ? "Marcada con el código de asistencia"
              : undefined
        }
        className={`h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-700 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 disabled:opacity-50
          ${status === "error" ? "outline outline-2 outline-red-400 dark:outline-red-500" : ""}`}
      />
      {markedManually && checked && (
        <span
          aria-hidden="true"
          title="Marcada manualmente por el docente"
          className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
        />
      )}
      <span className="sr-only" aria-live="polite">
        {statusLabel}
      </span>
    </div>
  );
}
