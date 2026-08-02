"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deactivateCourseAction,
  reactivateCourseAction,
  deleteCourseAction,
} from "@/lib/academic-courses/actions";
import type { AcademicCourse } from "@/lib/academic-courses/types";
import type { CourseDependencyCountsResult } from "@/lib/academic-courses/index";

interface Props {
  course: AcademicCourse;
  dependencyCountsResult: CourseDependencyCountsResult;
}

type ConfirmAction = "deactivate" | "reactivate" | "delete" | null;

export function CourseLifecycleActions({ course, dependencyCountsResult }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(course.is_active);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Si no se pudieron calcular las dependencias, el borrado se deshabilita:
  // un cero falso llevaría al docente a confirmar un borrado irreversible
  // creyendo que no hay nada que perder (ver lib/academic-courses/index.ts,
  // countRows).
  const dependencyCounts = dependencyCountsResult.ok ? dependencyCountsResult.counts : null;
  const blockingCount = dependencyCounts
    ? dependencyCounts.enrollments +
      dependencyCounts.assignmentVariantGroups +
      dependencyCounts.legacyAssignments
    : 0;
  const canDelete = dependencyCounts !== null && blockingCount === 0;

  function blockReasonText(): string {
    if (!dependencyCounts) {
      return "No se pudieron calcular sus dependencias. Recarga la página e inténtalo de nuevo.";
    }
    const evaluations =
      dependencyCounts.assignmentVariantGroups + dependencyCounts.legacyAssignments;
    const parts: string[] = [];
    if (dependencyCounts.enrollments > 0) {
      parts.push(`${dependencyCounts.enrollments} matrícula(s)`);
    }
    if (evaluations > 0) {
      parts.push(`${evaluations} evaluación(es)`);
    }
    return `No es posible: tiene ${parts.join(" y ")} asociada(s).`;
  }

  // Mismo comportamiento que AdminAttendancePanel: Escape cierra el diálogo,
  // el foco va al botón de confirmar al abrirlo.
  useEffect(() => {
    if (!confirmAction) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmAction(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    confirmButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [confirmAction]);

  function handleConfirm() {
    const action = confirmAction;
    setConfirmAction(null);
    setError(null);

    startTransition(async () => {
      if (action === "deactivate") {
        const result = await deactivateCourseAction(course.id);
        if (result.ok) {
          setIsActive(false);
          router.refresh();
        } else {
          setError(result.error);
        }
      } else if (action === "reactivate") {
        const result = await reactivateCourseAction(course.id);
        if (result.ok) {
          setIsActive(true);
          router.refresh();
        } else {
          setError(result.error);
        }
      } else if (action === "delete") {
        const result = await deleteCourseAction(course.id);
        if (result.ok) {
          router.push("/admin/courses");
        } else {
          setError(result.error);
        }
      }
    });
  }

  const dialogCopy: Record<
    Exclude<ConfirmAction, null>,
    { title: string; description: React.ReactNode; confirmLabel: string }
  > = {
    deactivate: {
      title: "¿Desactivar este curso?",
      description:
        "Dejará de aceptar matrículas nuevas. Los estudiantes ya matriculados conservan el acceso al contenido.",
      confirmLabel: "Desactivar",
    },
    reactivate: {
      title: "¿Reactivar este curso?",
      description: "Volverá a aceptar matrículas nuevas con su código de matrícula.",
      confirmLabel: "Reactivar",
    },
    delete: {
      title: "¿Eliminar este curso definitivamente?",
      description: (
        <>
          <span className="block font-semibold text-red-700 dark:text-red-400">
            Esta acción no se puede deshacer.
          </span>
          {/* El botón "Eliminar" solo se habilita con dependencyCounts !== null
              (canDelete), así que este diálogo nunca se abre con counts en null. */}
          {dependencyCounts && (dependencyCounts.classSessions > 0 || dependencyCounts.gradeItems > 0) ? (
            <span className="block mt-1.5">
              Se eliminarán en cascada{" "}
              {dependencyCounts.classSessions > 0 && (
                <>
                  {dependencyCounts.classSessions} sesión(es) de asistencia con
                  sus registros
                </>
              )}
              {dependencyCounts.classSessions > 0 && dependencyCounts.gradeItems > 0 && " y "}
              {dependencyCounts.gradeItems > 0 && (
                <>{dependencyCounts.gradeItems} ítem(s) de nota</>
              )}
              .
            </span>
          ) : (
            <span className="block mt-1.5">
              El curso no tiene sesiones de asistencia ni ítems de nota registrados.
            </span>
          )}
        </>
      ),
      confirmLabel: "Eliminar definitivamente",
    },
  };

  return (
    <div className="rounded-[var(--radius-base)] border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 px-6 py-6">
      <h2 className="text-sm font-bold text-red-800 dark:text-red-300 mb-4">
        Zona de peligro
      </h2>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 mb-4"
        >
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Descartar mensaje de error"
            className="text-red-700 dark:text-red-400 text-sm font-bold leading-none px-1 hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 divide-y divide-red-100 dark:divide-red-900/40">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isActive ? "Desactivar curso" : "Curso inactivo"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isActive
                ? "Cierra las inscripciones nuevas. Los ya matriculados conservan el acceso."
                : "No acepta matrículas nuevas. Puedes reactivarlo cuando quieras."}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmAction(isActive ? "deactivate" : "reactivate")}
            className="shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {isActive ? "Desactivar" : "Reactivar"}
          </button>
        </div>

        <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Eliminar definitivamente
            </p>
            <p
              id="course-delete-block-reason"
              className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
            >
              {canDelete
                ? "Solo posible porque este curso no tiene matrículas ni evaluaciones."
                : blockReasonText()}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending || !canDelete}
            aria-describedby="course-delete-block-reason"
            onClick={() => setConfirmAction("delete")}
            className="shrink-0 rounded-lg bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3.5 py-2 text-sm font-bold transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      {confirmAction && (
        <>
          <button
            type="button"
            aria-label="Cancelar"
            onClick={() => setConfirmAction(null)}
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-lifecycle-title"
            aria-describedby="confirm-lifecycle-description"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2
                  id="confirm-lifecycle-title"
                  className="text-base font-bold text-gray-900 dark:text-white"
                >
                  {dialogCopy[confirmAction].title}
                </h2>
                <div
                  id="confirm-lifecycle-description"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {dialogCopy[confirmAction].description}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-lg bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:focus-visible:ring-red-700 focus-visible:ring-offset-2"
                >
                  {dialogCopy[confirmAction].confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
