"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markLessonCompleted, markLessonUncompleted } from "@/lib/progress";
import { reportTransportError } from "@/lib/observability/report-transport-error";

interface LessonClosureProps {
  courseSlug: string;
  lessonSlug: string;
  initialCompletedAt: string | null;
  canComplete?: boolean;
  blockedReason?:
    | "self_assessment_pending"
    | "self_assessment_unavailable"
    | "lesson_disabled"
    | "availability_unavailable";
}

export function LessonClosure({
  courseSlug,
  lessonSlug,
  initialCompletedAt,
  canComplete = true,
  blockedReason,
}: LessonClosureProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isCompleted = initialCompletedAt !== null;
  const isBlocked = !canComplete || blockedReason !== undefined;

  const handleToggleCompletion = () => {
    setError(null);
    startTransition(async () => {
      try {
        if (isCompleted) {
          await markLessonUncompleted(courseSlug, lessonSlug);
          router.refresh();
        } else {
          const result = await markLessonCompleted(courseSlug, lessonSlug);
          if (result.ok) {
            router.refresh();
          } else if (
            result.reason === "save_failed" ||
            result.reason === "self_assessment_unavailable" ||
            result.reason === "lesson_disabled" ||
            result.reason === "availability_unavailable"
          ) {
            // No reportar éxito silencioso ante un fallo de escritura o de
            // verificación (DEBT-037, Frente 4). "lesson_disabled" y
            // "availability_unavailable" (spec-039) solo llegan aquí por una
            // condición de carrera: la lección se cerró (o dejó de poder
            // verificarse) después de que la página cargó el estado con el
            // que se calculó `canComplete`.
            const messages: Record<string, string> = {
              save_failed: "No se pudo guardar. Inténtalo de nuevo.",
              self_assessment_unavailable:
                "No pudimos verificar tu autoevaluación. Inténtalo de nuevo en un momento.",
              lesson_disabled:
                "Esta lección se deshabilitó. Actualiza la página para ver su estado actual.",
              availability_unavailable:
                "No pudimos verificar si esta lección está disponible. Inténtalo de nuevo en un momento.",
            };
            setError(messages[result.reason]);
          }
        }
      } catch (err) {
        console.error("Error toggling lesson completion:", err);
        // spec-053: sin esto, el fallo capturado no dejaba ningún rastro en
        // Sentry (D4) — se veía bien para el estudiante pero era invisible
        // en el panel.
        reportTransportError(err, "markLessonCompleted/markLessonUncompleted");
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      }
    });
  };

  const completedDate = initialCompletedAt
    ? new Date(initialCompletedAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const blockedExplanations: Record<string, string> = {
    self_assessment_pending:
      "Completa la autoevaluación antes de marcar la lección como finalizada.",
    self_assessment_unavailable:
      "No pudimos verificar tu autoevaluación. Inténtalo de nuevo en un momento.",
    lesson_disabled: "Esta lección está deshabilitada por tu docente.",
    availability_unavailable:
      "No pudimos verificar si esta lección está disponible. Inténtalo de nuevo en un momento.",
  };

  return (
    <section className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Finalizar lección
      </h2>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3"
        >
          <p className="text-sm text-danger dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Descartar mensaje de error"
            className="text-danger dark:text-red-300 text-sm font-bold leading-none px-1 hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>
      )}

      {isCompleted ? (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-[#f3faf7] dark:bg-[#014737] border border-success/30 dark:border-success/40">
          <svg
            className="w-5 h-5 text-success flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-success">Lección completada</p>
            {completedDate && (
              <p className="text-xs text-success/80 mt-1">
                Completada el {completedDate}
              </p>
            )}
          </div>
          <button
            onClick={handleToggleCompletion}
            disabled={isPending}
            className="px-3 py-1 text-sm font-medium text-success hover:bg-success/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Guardando..." : "Desmarcar"}
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Marca esta lección como completada cuando termines de estudiarla.
            </p>
            {isBlocked && blockedReason && (
              <p
                id="complete-button-explanation"
                className="text-xs text-danger mt-2"
              >
                {blockedExplanations[blockedReason]}
              </p>
            )}
          </div>
          <button
            onClick={handleToggleCompletion}
            disabled={isPending || isBlocked}
            aria-describedby={isBlocked ? "complete-button-explanation" : undefined}
            className="ml-auto px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Guardando..." : "Completar lección"}
          </button>
        </div>
      )}
    </section>
  );
}
