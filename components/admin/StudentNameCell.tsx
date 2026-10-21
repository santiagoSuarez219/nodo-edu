"use client";

import { useEffect, useRef, useState } from "react";
import { updateStudentNameAction } from "@/lib/students/actions";
import { formatStudentListName } from "@/lib/students/names";
import { isServerActionTransportError } from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";

type Status = "idle" | "editing" | "saving" | "error";

interface Props {
  studentId: string;
  academicCourseId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  needsReview: boolean;
}

const INPUT_BASE =
  "w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 disabled:opacity-60";
const INPUT_OK =
  "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700";
const INPUT_ERROR =
  "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 focus:ring-red-200 dark:focus:ring-red-800";

// spec-057 / spec-062 D5: edición inline de nombres y apellidos. A diferencia
// de GradeInputCell (input siempre montado, guarda al blur — apto para notas
// que se editan en lote), un nombre se corrige una vez: la celda arranca en
// modo lectura y solo se convierte en inputs al activarla, con
// Guardar/Cancelar explícitos. `blur` sin cambios cierra la edición; `blur`
// CON cambios la deja abierta — con un botón Cancelar visible, guardar al
// hacer clic fuera sería sorpresivo.
//
// Una fila "por revisar" (propuesta automática de la migración) permite
// guardar SIN cambios: es el gesto de "la propuesta es correcta".
export function StudentNameCell({
  studentId,
  academicCourseId,
  firstName,
  lastName,
  fullName,
  needsReview,
}: Props) {
  const [names, setNames] = useState({ first: firstName, last: lastName, full: fullName });
  const [pendingReview, setPendingReview] = useState(needsReview);
  const [draft, setDraft] = useState({ first: firstName, last: lastName });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === "editing" && firstInputRef.current) {
      firstInputRef.current.focus();
      firstInputRef.current.select();
    }
    // Solo al entrar en edición; no en cada transición editing <-> error.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status === "idle"]);

  const unchanged =
    draft.first.trim() === names.first && draft.last.trim() === names.last;

  function startEditing() {
    setDraft({ first: names.first, last: names.last });
    setError(null);
    setStatus("editing");
  }

  function cancel() {
    setDraft({ first: names.first, last: names.last });
    setError(null);
    setStatus("idle");
    editButtonRef.current?.focus();
  }

  async function save() {
    if (unchanged && !pendingReview) {
      setStatus("idle");
      return;
    }

    setStatus("saving");
    setError(null);
    let result;
    try {
      result = await updateStudentNameAction(studentId, academicCourseId, {
        first_name: draft.first,
        last_name: draft.last,
      });
    } catch (err) {
      // spec-053: ver LoginForm.tsx para el motivo.
      if (!isServerActionTransportError(err)) throw err;
      reportTransportError(err, "updateStudentNameAction");
      setStatus("error");
      return;
    }

    if (!result.ok || !result.data) {
      setError(!result.ok ? result.error : "No se pudo guardar el nombre.");
      setStatus("error");
      return;
    }

    setNames({
      first: result.data.first_name,
      last: result.data.last_name,
      full: result.data.full_name,
    });
    setDraft({ first: result.data.first_name, last: result.data.last_name });
    setPendingReview(false);
    setStatus("idle");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    if (unchanged && !pendingReview) {
      setStatus("idle");
    }
  }

  function handleChange(field: "first" | "last", value: string) {
    setDraft((d) => ({ ...d, [field]: value }));
    if (status === "error") setStatus("editing");
  }

  if (status === "idle") {
    return (
      <div className="flex min-w-[14rem] items-center gap-2">
        <span className="font-medium text-gray-900 dark:text-white">
          {formatStudentListName({
            first_name: names.first,
            last_name: names.last,
            full_name: names.full,
          })}
        </span>
        {pendingReview && (
          <span className="shrink-0 rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Revisar
          </span>
        )}
        <button
          type="button"
          onClick={startEditing}
          ref={editButtonRef}
          aria-label={`Editar nombre de ${names.full}`}
          className="shrink-0 rounded p-1 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </div>
    );
  }

  // editing | saving | error: la edición permanece abierta con lo tecleado
  // (D6) — un error nunca revierte silenciosamente al modo lectura.
  return (
    <div className="flex min-w-[14rem] flex-col gap-1" onBlur={handleBlur}>
      <div className="flex items-center gap-1.5">
        <input
          ref={firstInputRef}
          type="text"
          value={draft.first}
          disabled={status === "saving"}
          onChange={(e) => handleChange("first", e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={`Nombres de ${names.full}`}
          aria-invalid={status === "error"}
          placeholder="Nombres"
          className={`${INPUT_BASE} ${status === "error" ? INPUT_ERROR : INPUT_OK}`}
        />
        <input
          type="text"
          value={draft.last}
          disabled={status === "saving"}
          onChange={(e) => handleChange("last", e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={`Apellidos de ${names.full}`}
          aria-invalid={status === "error"}
          placeholder="Apellidos"
          className={`${INPUT_BASE} ${status === "error" ? INPUT_ERROR : INPUT_OK}`}
        />
        <span className="sr-only" aria-live="polite">
          {status === "saving" ? "Guardando" : status === "error" ? "Error al guardar" : ""}
        </span>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => void save()}
          disabled={status === "saving"}
          aria-label="Guardar nombre"
          className="shrink-0 rounded p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700"
        >
          {status === "saving" ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          disabled={status === "saving"}
          aria-label="Cancelar edición"
          className="shrink-0 rounded p-1 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {status === "error" && error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
