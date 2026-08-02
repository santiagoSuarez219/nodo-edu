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
export function RecalculateSelfAssessmentButton({ academicCourseId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (
      !confirm(
        "¿Recalcular la nota de autoevaluaciones de todo el curso? Se actualizará la nota de cada estudiante matriculado según las lecciones que ya vio y respondió."
      )
    ) {
      return;
    }

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
      <div className="flex items-center gap-3">
        <button
          onClick={handleClick}
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
      <p className="text-xs text-gray-500 dark:text-gray-400">
        La nota de autoevaluaciones se calcula sobre las lecciones que cada estudiante ya
        vio: <code className="text-[0.7rem]">correctas / preguntas × 5</code>. Ver una
        lección nueva sin responderla baja la nota; publicar preguntas en una lección ya
        respondida no cambia la nota de quien ya la respondió.
      </p>
    </div>
  );
}
