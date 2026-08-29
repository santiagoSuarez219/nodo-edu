"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGradeItemAction, deleteGradeItemAction } from "@/lib/grades/actions";
import type { GradeItem } from "@/lib/grades/types";
import { isServerActionTransportError, SERVER_ACTION_TRANSPORT_ERROR_MESSAGE } from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";

interface Props {
  academicCourseId: string;
  initialItems: GradeItem[];
}

export function GradeItemsPanel({ academicCourseId, initialItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    if (!newName.trim()) {
      setFormError("El nombre es requerido.");
      return;
    }
    setFormError(null);
    startTransition(async () => {
      let result;
      try {
        result = await createGradeItemAction(
          academicCourseId,
          newName.trim(),
          initialItems.length
        );
      } catch (err) {
        // spec-053: ver LoginForm.tsx para el motivo.
        if (!isServerActionTransportError(err)) throw err;
        reportTransportError(err, "createGradeItemAction");
        setFormError(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
        return;
      }
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setNewName("");
      setShowForm(false);
      router.refresh();
    });
  }

  function handleDelete(itemId: string, itemName: string) {
    if (!confirm(`¿Eliminar el ítem "${itemName}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(itemId);
    startTransition(async () => {
      let result;
      try {
        result = await deleteGradeItemAction(itemId, academicCourseId);
      } catch (err) {
        setDeletingId(null);
        // spec-053: ver LoginForm.tsx para el motivo.
        if (!isServerActionTransportError(err)) throw err;
        reportTransportError(err, "deleteGradeItemAction");
        alert(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
        return;
      }
      setDeletingId(null);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Ítems de evaluación
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir ítem
          </button>
        )}
      </div>

      {initialItems.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-1">
          No hay ítems de evaluación. Añade uno para empezar a registrar calificaciones.
        </p>
      )}

      {initialItems.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
          {initialItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-2.5 gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-5 text-right">
                  {item.order_index + 1}
                </span>
                <span className="text-sm text-gray-900 dark:text-white font-medium">
                  {item.name}
                </span>
                {item.kind === "self_assessment" && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded bg-brand-softer dark:bg-blue-900/20 text-brand dark:text-blue-300"
                    title="Se genera y actualiza automáticamente a partir de las autoevaluaciones"
                  >
                    Automático
                  </span>
                )}
              </div>
              {item.kind === "self_assessment" ? (
                <span
                  className="text-xs text-gray-400 dark:text-gray-500"
                  title="Este ítem no se puede eliminar. Puedes renombrarlo."
                >
                  No se puede eliminar
                </span>
              ) : (
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  disabled={deletingId === item.id || isPending}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
                  aria-label={`Eliminar ítem ${item.name}`}
                >
                  {deletingId === item.id ? "Eliminando…" : "Eliminar"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setShowForm(false); setNewName(""); setFormError(null); } }}
              placeholder="Ej. Parcial 1"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={isPending}
              className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 transition-colors"
            >
              {isPending ? "…" : "Añadir"}
            </button>
            <button
              onClick={() => { setShowForm(false); setNewName(""); setFormError(null); }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
          {formError && (
            <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>
          )}
        </div>
      )}
    </div>
  );
}
