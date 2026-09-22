"use client";

import { useEffect, useRef, useState } from "react";
import { updateStudentNameAction } from "@/lib/students/actions";
import { isServerActionTransportError } from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";

type Status = "idle" | "editing" | "saving" | "error";

interface Props {
  studentId: string;
  academicCourseId: string;
  initialName: string;
}

// spec-057: edición inline del nombre del estudiante. A diferencia de
// GradeInputCell (input siempre montado, guarda al blur — apto para notas que
// se editan en lote), un nombre se corrige una vez: la celda arranca en modo
// lectura y solo se convierte en input al activarla, con Guardar/Cancelar
// explícitos. `blur` sin cambios cierra la edición; `blur` CON cambios la
// deja abierta (a diferencia de GradeInputCell) — con un botón Cancelar
// visible, guardar al hacer clic fuera sería sorpresivo.
export function StudentNameCell({ studentId, academicCourseId, initialName }: Props) {
  const [name, setName] = useState(initialName);
  const [draft, setDraft] = useState(initialName);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === "editing") {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [status]);

  function startEditing() {
    setDraft(name);
    setError(null);
    setStatus("editing");
  }

  function cancel() {
    setDraft(name);
    setError(null);
    setStatus("idle");
    editButtonRef.current?.focus();
  }

  async function save() {
    if (draft.trim() === name) {
      setStatus("idle");
      return;
    }

    setStatus("saving");
    setError(null);
    let result;
    try {
      result = await updateStudentNameAction(studentId, academicCourseId, draft);
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

    setName(result.data.full_name);
    setDraft(result.data.full_name);
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

  function handleBlur() {
    if (draft.trim() === name) {
      setStatus("idle");
    }
  }

  if (status === "idle") {
    return (
      <div className="flex min-w-[14rem] items-center gap-2">
        <span className="font-medium text-gray-900 dark:text-white">{name}</span>
        <button
          type="button"
          onClick={startEditing}
          ref={editButtonRef}
          aria-label={`Editar nombre de ${name}`}
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
    <div className="flex min-w-[14rem] flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          disabled={status === "saving"}
          onChange={(e) => { setDraft(e.target.value); if (status === "error") setStatus("editing"); }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-label={`Nombre de ${name}`}
          aria-invalid={status === "error"}
          className={`w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 disabled:opacity-60 ${
            status === "error"
              ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 focus:ring-red-200 dark:focus:ring-red-800"
              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700"
          }`}
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
