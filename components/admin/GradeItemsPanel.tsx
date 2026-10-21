"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createGradeItemAction,
  deleteGradeItemAction,
  updateGradeItemAction,
  createGradeGroupAction,
  updateGradeGroupAction,
  deleteGradeGroupAction,
  ensureSelfAssessmentGradeItemAction,
} from "@/lib/grades/actions";
import type { GradeItem, GradeGroup } from "@/lib/grades/types";
import { isServerActionTransportError, SERVER_ACTION_TRANSPORT_ERROR_MESSAGE } from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";

interface Props {
  academicCourseId: string;
  initialItems: GradeItem[];
  initialGroups: GradeGroup[];
}

const inputClass =
  "rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors";
const primaryButtonClass =
  "rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 transition-colors";
const secondaryButtonClass =
  "rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors";
const linkButtonClass =
  "inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors disabled:opacity-40";

const toMillis = (w: number) => Math.round(w * 1000);
const fmtWeight = (millis: number) => (millis / 1000).toFixed(2);

// "" → null; coma o punto decimal. NaN se trata como entrada inválida.
function parseWeightInput(raw: string): number | null | undefined {
  const t = raw.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function ItemRow({
  item,
  groups,
  disabled,
  onSaveError,
  onDelete,
  onSave,
  deleting,
}: {
  item: GradeItem;
  groups: GradeGroup[];
  disabled: boolean;
  deleting: boolean;
  onSaveError: (msg: string) => void;
  onDelete: () => void;
  onSave: (weight: number | null, groupId: string | null) => Promise<string | null>;
}) {
  const [weightText, setWeightText] = useState(item.weight !== null ? String(item.weight) : "");
  const [groupId, setGroupId] = useState(item.group_id ?? "");

  async function commit(nextWeightText: string, nextGroupId: string) {
    const weight = parseWeightInput(nextWeightText);
    if (weight === undefined) {
      onSaveError("El peso debe ser un número entre 0 y 1.");
      return;
    }
    if (weight === item.weight && (nextGroupId || null) === item.group_id) return;
    const error = await onSave(weight, nextGroupId || null);
    if (error) {
      onSaveError(error);
      setWeightText(item.weight !== null ? String(item.weight) : "");
      setGroupId(item.group_id ?? "");
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between py-2.5 gap-x-4 gap-y-2">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-5 text-right">
          {item.order_index + 1}
        </span>
        <span className="text-sm text-gray-900 dark:text-white font-medium">{item.name}</span>
        {item.kind === "self_assessment" && (
          <span
            className="text-xs px-1.5 py-0.5 rounded bg-brand-softer dark:bg-blue-900/20 text-brand dark:text-blue-300"
            title="Se genera y actualiza automáticamente a partir de las autoevaluaciones"
          >
            Automático
          </span>
        )}
        {item.weight === null && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
            Sin ponderar
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          Peso
          <input
            type="text"
            inputMode="decimal"
            value={weightText}
            disabled={disabled}
            onChange={(e) => setWeightText(e.target.value)}
            onBlur={() => commit(weightText, groupId)}
            placeholder="0.20"
            aria-label={`Peso de ${item.name}`}
            className={`${inputClass} w-20 text-right font-mono`}
          />
          {item.weight !== null && (
            <span className="font-mono">· {+(item.weight * 100).toFixed(1)} %</span>
          )}
        </label>
        <select
          value={groupId}
          disabled={disabled || groups.length === 0}
          onChange={(e) => {
            setGroupId(e.target.value);
            void commit(weightText, e.target.value);
          }}
          aria-label={`Corte de ${item.name}`}
          className={`${inputClass} max-w-[10rem]`}
        >
          <option value="">Sin corte</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        {item.kind === "self_assessment" ? (
          <span
            className="text-xs text-gray-400 dark:text-gray-500"
            title="Este ítem no se puede eliminar. Puedes renombrarlo."
          >
            No se puede eliminar
          </span>
        ) : (
          <button
            onClick={onDelete}
            disabled={deleting || disabled}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
            aria-label={`Eliminar ítem ${item.name}`}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </button>
        )}
      </div>
    </li>
  );
}

export function GradeItemsPanel({ academicCourseId, initialItems, initialGroups }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newGroupId, setNewGroupId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupWeight, setGroupWeight] = useState("");
  const [groupError, setGroupError] = useState<string | null>(null);
  // Remonta las filas de corte para descartar una edición rechazada.
  const [groupResetNonce, setGroupResetNonce] = useState(0);

  const weightDefined = initialItems.reduce(
    (acc, i) => acc + (i.weight !== null ? toMillis(i.weight) : 0),
    0
  );
  const unweightedCount = initialItems.filter((i) => i.weight === null).length;
  const targetDefined = initialGroups.reduce((acc, g) => acc + toMillis(g.target_weight), 0);
  const hasSelfAssessmentItem = initialItems.some((i) => i.kind === "self_assessment");

  // Envuelve una action: captura el error de transporte (spec-053) y devuelve
  // el mensaje de error o null si fue bien.
  async function run(
    label: string,
    fn: () => Promise<{ ok: boolean; error?: string }>
  ): Promise<string | null> {
    try {
      const result = await fn();
      if (!result.ok) return result.error ?? "No se pudo completar la acción.";
      setPanelError(null);
      setGroupError(null);
      router.refresh();
      return null;
    } catch (err) {
      // spec-053: ver LoginForm.tsx para el motivo.
      if (!isServerActionTransportError(err)) throw err;
      reportTransportError(err, label);
      return SERVER_ACTION_TRANSPORT_ERROR_MESSAGE;
    }
  }

  function handleAdd() {
    if (!newName.trim()) {
      setFormError("El nombre es requerido.");
      return;
    }
    const weight = parseWeightInput(newWeight);
    if (weight === undefined) {
      setFormError("El peso debe ser un número entre 0 y 1.");
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const error = await run("createGradeItemAction", () =>
        createGradeItemAction(
          academicCourseId,
          newName.trim(),
          initialItems.length,
          weight,
          newGroupId || null
        )
      );
      if (error) {
        setFormError(error);
        return;
      }
      setNewName("");
      setNewWeight("");
      setNewGroupId("");
      setShowForm(false);
    });
  }

  function handleDelete(itemId: string, itemName: string) {
    if (!confirm(`¿Eliminar el ítem "${itemName}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(itemId);
    startTransition(async () => {
      const error = await run("deleteGradeItemAction", () =>
        deleteGradeItemAction(itemId, academicCourseId)
      );
      setDeletingId(null);
      if (error) setPanelError(error);
    });
  }

  function handleAddGroup() {
    const weight = parseWeightInput(groupWeight);
    if (!groupName.trim()) {
      setGroupError("El nombre es requerido.");
      return;
    }
    if (weight === undefined || weight === null) {
      setGroupError("El peso objetivo debe ser un número entre 0 y 1.");
      return;
    }
    setGroupError(null);
    startTransition(async () => {
      const error = await run("createGradeGroupAction", () =>
        createGradeGroupAction(
          academicCourseId,
          groupName.trim(),
          weight,
          // max + 1, no length: borrar un corte intermedio deja huecos y repetiría el índice.
          initialGroups.reduce((max, g) => Math.max(max, g.order_index), -1) + 1
        )
      );
      if (error) {
        setGroupError(error);
        return;
      }
      setGroupName("");
      setGroupWeight("");
      setShowGroupForm(false);
    });
  }

  function handleDeleteGroup(group: GradeGroup) {
    if (
      !confirm(
        `¿Eliminar el corte "${group.name}"? Sus ítems quedarán sin corte, con sus pesos y notas intactos.`
      )
    )
      return;
    startTransition(async () => {
      const error = await run("deleteGradeGroupAction", () =>
        deleteGradeGroupAction(group.id, academicCourseId)
      );
      if (error) setGroupError(error);
    });
  }

  function handleRenameOrReweightGroup(group: GradeGroup, name: string, weightText: string) {
    const weight = parseWeightInput(weightText);
    if (!name.trim() || weight === undefined || weight === null) {
      setGroupError("Nombre y peso objetivo (entre 0 y 1) son requeridos.");
      return;
    }
    if (name.trim() === group.name && weight === group.target_weight) return;
    setGroupError(null);
    startTransition(async () => {
      const error = await run("updateGradeGroupAction", () =>
        updateGradeGroupAction(group.id, academicCourseId, name.trim(), weight, group.order_index)
      );
      if (error) {
        setGroupError(error);
        setGroupResetNonce((n) => n + 1);
      }
    });
  }

  function handleMoveGroup(index: number, direction: -1 | 1) {
    const a = initialGroups[index];
    const b = initialGroups[index + direction];
    if (!a || !b) return;
    // Se re-numera toda la lista (0..n-1) tras el intercambio: intercambiar solo
    // los dos valores no mueve nada si hay índices repetidos.
    const reordered = [...initialGroups];
    reordered[index] = b;
    reordered[index + direction] = a;
    startTransition(async () => {
      for (const [position, group] of reordered.entries()) {
        if (group.order_index === position) continue;
        const error = await run("updateGradeGroupAction", () =>
          updateGradeGroupAction(
            group.id,
            academicCourseId,
            group.name,
            group.target_weight,
            position
          )
        );
        if (error) return setGroupError(error);
      }
    });
  }

  function handleEnsureSelfAssessment() {
    startTransition(async () => {
      const error = await run("ensureSelfAssessmentGradeItemAction", () =>
        ensureSelfAssessmentGradeItemAction(academicCourseId)
      );
      if (error) setPanelError(error);
    });
  }

  async function saveItem(item: GradeItem, weight: number | null, groupId: string | null) {
    return run("updateGradeItemAction", () =>
      updateGradeItemAction(
        item.id,
        academicCourseId,
        item.name,
        item.order_index,
        weight,
        groupId
      )
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-5 py-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Ítems de evaluación</h2>
        <div className="flex items-center gap-4">
          {!hasSelfAssessmentItem && (
            <button
              onClick={handleEnsureSelfAssessment}
              disabled={isPending}
              className={linkButtonClass}
              title="Crea el ítem para poder ponderarlo antes de la primera autoevaluación"
            >
              Crear ítem de autoevaluaciones
            </button>
          )}
          {!showForm && (
            <button onClick={() => setShowForm(true)} className={linkButtonClass}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir ítem
            </button>
          )}
        </div>
      </div>

      {initialItems.length > 0 && (
        <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-col gap-1">
          <p>
            Ponderación definida{" "}
            <span className="font-mono font-semibold text-gray-900 dark:text-white">
              {fmtWeight(weightDefined)} / 1.00
            </span>{" "}
            · disponible {fmtWeight(Math.max(1000 - weightDefined, 0))}
          </p>
          {unweightedCount > 0 && (
            <p className="text-amber-700 dark:text-amber-400">
              {unweightedCount === 1
                ? "Hay 1 ítem sin ponderar: no cuenta en la nota a la fecha."
                : `Hay ${unweightedCount} ítems sin ponderar: no cuentan en la nota a la fecha.`}
              {weightDefined === 0 && " Mientras ninguno tenga peso, los estudiantes ven un promedio simple."}
            </p>
          )}
        </div>
      )}

      {panelError && <p className="text-xs text-red-600 dark:text-red-400">{panelError}</p>}

      {initialItems.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 dark:text-gray-400 py-1">
          No hay ítems de evaluación. Añade uno para empezar a registrar calificaciones.
        </p>
      )}

      {initialItems.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
          {initialItems.map((item) => (
            <ItemRow
              key={`${item.id}-${item.weight}-${item.group_id}`}
              item={item}
              groups={initialGroups}
              disabled={isPending}
              deleting={deletingId === item.id}
              onSaveError={setPanelError}
              onDelete={() => handleDelete(item.id, item.name)}
              onSave={(weight, groupId) => saveItem(item, weight, groupId)}
            />
          ))}
        </ul>
      )}

      {showForm && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setShowForm(false);
                  setNewName("");
                  setFormError(null);
                }
              }}
              placeholder="Ej. Parcial 1"
              className={`${inputClass} flex-1 min-w-[10rem] py-2`}
            />
            <input
              type="text"
              inputMode="decimal"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Peso (0.20)"
              aria-label="Peso del nuevo ítem"
              className={`${inputClass} w-28 py-2 font-mono`}
            />
            <select
              value={newGroupId}
              onChange={(e) => setNewGroupId(e.target.value)}
              disabled={initialGroups.length === 0}
              aria-label="Corte del nuevo ítem"
              className={`${inputClass} py-2`}
            >
              <option value="">Sin corte</option>
              {initialGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <button onClick={handleAdd} disabled={isPending} className={primaryButtonClass}>
              {isPending ? "…" : "Añadir"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setNewName("");
                setNewWeight("");
                setFormError(null);
              }}
              className={secondaryButtonClass}
            >
              Cancelar
            </button>
          </div>
          {formError && <p className="text-xs text-red-600 dark:text-red-400">{formError}</p>}
        </div>
      )}

      {/* Cortes institucionales (D12) */}
      <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Cortes{" "}
            {initialGroups.length > 0 && (
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                · pesos objetivo {fmtWeight(targetDefined)} / 1.00
              </span>
            )}
          </h3>
          {!showGroupForm && (
            <button onClick={() => setShowGroupForm(true)} className={linkButtonClass}>
              Añadir corte
            </button>
          )}
        </div>

        {initialGroups.length === 0 && !showGroupForm && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Los cortes agrupan ítems para subir las notas a la plataforma institucional (p. ej.
            «Nota 1 — 0.20»).
          </p>
        )}

        {initialGroups.map((group, index) => {
          const itemsWeight = initialItems
            .filter((i) => i.group_id === group.id && i.weight !== null)
            .reduce((acc, i) => acc + toMillis(i.weight as number), 0);
          const mismatch = itemsWeight !== toMillis(group.target_weight);
          return (
            <GroupRow
              key={`${group.id}-${group.name}-${group.target_weight}-${groupResetNonce}`}
              group={group}
              itemsWeight={itemsWeight}
              mismatch={mismatch}
              disabled={isPending}
              canMoveUp={index > 0}
              canMoveDown={index < initialGroups.length - 1}
              onMove={(dir) => handleMoveGroup(index, dir)}
              onSave={(name, weightText) => handleRenameOrReweightGroup(group, name, weightText)}
              onDelete={() => handleDeleteGroup(group)}
            />
          );
        })}

        {showGroupForm && (
          <div className="flex flex-wrap gap-2">
            <input
              autoFocus
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ej. Nota 1"
              className={`${inputClass} flex-1 min-w-[10rem] py-2`}
            />
            <input
              type="text"
              inputMode="decimal"
              value={groupWeight}
              onChange={(e) => setGroupWeight(e.target.value)}
              placeholder="Peso objetivo (0.20)"
              aria-label="Peso objetivo del corte"
              className={`${inputClass} w-40 py-2 font-mono`}
            />
            <button onClick={handleAddGroup} disabled={isPending} className={primaryButtonClass}>
              {isPending ? "…" : "Añadir"}
            </button>
            <button
              onClick={() => {
                setShowGroupForm(false);
                setGroupName("");
                setGroupWeight("");
                setGroupError(null);
              }}
              className={secondaryButtonClass}
            >
              Cancelar
            </button>
          </div>
        )}
        {groupError && <p className="text-xs text-red-600 dark:text-red-400">{groupError}</p>}
      </div>
    </div>
  );
}

function GroupRow({
  group,
  itemsWeight,
  mismatch,
  disabled,
  canMoveUp,
  canMoveDown,
  onMove,
  onSave,
  onDelete,
}: {
  group: GradeGroup;
  itemsWeight: number;
  mismatch: boolean;
  disabled: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
  onSave: (name: string, weightText: string) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [weightText, setWeightText] = useState(String(group.target_weight));

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={name}
          disabled={disabled}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onSave(name, weightText)}
          aria-label={`Nombre del corte ${group.name}`}
          className={`${inputClass} flex-1 min-w-[8rem]`}
        />
        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          Objetivo
          <input
            type="text"
            inputMode="decimal"
            value={weightText}
            disabled={disabled}
            onChange={(e) => setWeightText(e.target.value)}
            onBlur={() => onSave(name, weightText)}
            aria-label={`Peso objetivo de ${group.name}`}
            className={`${inputClass} w-20 text-right font-mono`}
          />
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          ítems {fmtWeight(itemsWeight)}
        </span>
        <button
          onClick={() => onMove(-1)}
          disabled={disabled || !canMoveUp}
          aria-label={`Subir ${group.name}`}
          className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
        >
          ↑
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={disabled || !canMoveDown}
          aria-label={`Bajar ${group.name}`}
          className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30"
        >
          ↓
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          aria-label={`Eliminar corte ${group.name}`}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
        >
          Eliminar
        </button>
      </div>
      {mismatch && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {group.name}: los ítems suman {fmtWeight(itemsWeight)} de {fmtWeight(toMillis(group.target_weight))}.
        </p>
      )}
    </div>
  );
}
