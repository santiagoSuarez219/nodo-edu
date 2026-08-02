"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recalculateCourseSelfAssessmentGrades } from "@/lib/grades/actions";

interface Props {
  academicCourseId: string;
}

// spec-040 Fase 5: recálculo masivo, disparado por el docente. El
// estudiante ya recalcula la suya al enviar un intento o ver una lección
// nueva; este botón cubre lo que el estudiante no dispara: habilitar o
// deshabilitar lecciones, o publicar/despublicar preguntas.
//
// Confirmación en línea, no `window.confirm` (mismo criterio que D3 para el
// estudiante: no es estilizable, no respeta el modo oscuro y su
// accesibilidad es pobre) — y esta es la acción más destructiva de la
// libreta, escribe la nota de todo el curso a la vez.
export function RecalculateSelfAssessmentButton({ academicCourseId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setAwaitingConfirmation(false);
    setResult(null);
    setError(null);
    startTransition(async () => {
      const res = await recalculateCourseSelfAssessmentGrades(academicCourseId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const updatedCount = res.data?.updatedCount ?? 0;
      setResult(
        `${updatedCount} ${updatedCount === 1 ? "matrícula actualizada" : "matrículas actualizadas"}.`
      );
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {!awaitingConfirmation ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAwaitingConfirmation(true)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand dark:text-blue-300 bg-brand-softer dark:bg-blue-900/20 hover:bg-brand-soft dark:hover:bg-blue-900/30 disabled:opacity-60 rounded-lg px-3 py-1.5 transition-colors"
          >
            {isPending ? "Recalculando…" : "Recalcular autoevaluaciones"}
          </button>
          {result && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{result}</span>
          )}
          {error && (
            <span className="text-xs text-danger dark:text-red-400">{error}</span>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2">
          <p className="text-xs text-yellow-800 dark:text-yellow-300 flex-1">
            ¿Recalcular la nota de autoevaluaciones de todo el curso? Se actualizará la nota
            de cada estudiante matriculado según las lecciones que ya vio y respondió.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setAwaitingConfirmation(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong rounded-lg transition-colors"
            >
              Sí, recalcular
            </button>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        La nota de autoevaluaciones se calcula sobre las lecciones que cada estudiante ya
        vio: <code className="text-[0.7rem]">correctas / preguntas × 5</code>. Ver una
        lección nueva sin responderla baja la nota; publicar preguntas en una lección ya
        respondida no cambia la nota de quien ya la respondió.
      </p>
    </div>
  );
}
