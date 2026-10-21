import type { GradeSummary } from "@/lib/grades/types";

interface Props {
  summary: GradeSummary;
}

const fmt = (n: number | null) => (n !== null ? n.toFixed(2) : "—");

// D10: verde/rojo sobre el promedio, nunca sobre el acumulado.
export function gradeToneClass(grade: number | null): string {
  if (grade === null) return "text-gray-400 dark:text-gray-500";
  return grade >= 3
    ? "text-green-700 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
}

export function formatWeightPercent(weight: number): string {
  return `${+(weight * 100).toFixed(1)} %`;
}

// spec-059 D4, D10, D11: nota a la fecha del curso, dos cifras con 2 decimales.
export function GradeSummaryBlock({ summary }: Props) {
  if (summary.mode === "unweighted") {
    return (
      <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Promedio simple (sin ponderar)
          </span>
          <span className={`font-mono text-xl font-bold ${gradeToneClass(summary.projected)}`}>
            {fmt(summary.projected)}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tu docente aún no ha definido el peso de cada nota.
        </p>
      </div>
    );
  }

  // Con todo el peso calificado ambas cifras coinciden: "Nota final".
  const isFinal = summary.weight_defined > 0 && summary.weight_graded === 1;

  if (isFinal) {
    return (
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Nota final</span>
        <span className={`font-mono text-xl font-bold ${gradeToneClass(summary.projected)}`}>
          {fmt(summary.projected)}
        </span>
      </div>
    );
  }

  return (
    <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          Promedio en lo evaluado
        </span>
        <span className={`font-mono text-xl font-bold ${gradeToneClass(summary.projected)}`}>
          {fmt(summary.projected)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">Acumulado en el curso</span>
        <span className="font-mono text-base font-semibold text-gray-900 dark:text-white">
          {fmt(summary.accumulated)} <span className="text-xs font-normal text-gray-500">de 5.00</span>
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Llevas evaluado el {formatWeightPercent(summary.weight_graded)} del curso. El promedio es tu
        nota sobre lo ya evaluado; el acumulado es lo que has sumado hasta hoy.
      </p>
    </div>
  );
}
