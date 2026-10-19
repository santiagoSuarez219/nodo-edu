import type { CaseVerdict, ChallengeRunResult, VisibleCaseResult } from "@/lib/code-runner/types";

interface Props {
  result: ChallengeRunResult | null;
  transportMessage: string | null;
  stale: boolean;
}

const VERDICT_LABELS: Record<CaseVerdict, string> = {
  passed: "Pasa",
  wrong_answer: "No pasa",
  runtime_error: "Error de ejecución",
  timeout: "Tiempo límite excedido",
  memory_exceeded: "Memoria excedida",
  compile_error: "Error de compilación",
  internal_error: "Error interno del ejecutor",
  executed: "Ejecutado",
};

const BADGE_CLASSES: Record<"ok" | "fail" | "neutral", string> = {
  ok: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  fail: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

function Block({ title, children }: { title: string; children: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</span>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs text-gray-900 dark:text-white font-mono">
        {children === "" ? "(vacío)" : children}
      </pre>
    </div>
  );
}

function CaseCard({ item, showVerdict }: { item: VisibleCaseResult; showVerdict: boolean }) {
  const tone = item.verdict === "passed" ? "ok" : item.verdict === "executed" ? "neutral" : "fail";
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {showVerdict ? `Caso ${item.index}` : "Resultado"}
        </span>
        {showVerdict && (
          <span
            className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${BADGE_CLASSES[tone]}`}
          >
            <span aria-hidden="true">{tone === "ok" ? "✓" : "✗"}</span>
            {VERDICT_LABELS[item.verdict]}
          </span>
        )}
      </div>
      {showVerdict && <Block title="Entrada">{item.input}</Block>}
      {item.expectedOutput !== null && <Block title="Salida esperada">{item.expectedOutput}</Block>}
      <Block title="Tu salida">{item.actualOutput}</Block>
      {item.stderr && <Block title="Errores">{item.stderr}</Block>}
      {item.outputTruncated && (
        <p className="text-xs text-gray-500 dark:text-gray-400">La salida se recortó para mostrarla.</p>
      )}
    </li>
  );
}

export function CodeRunResults({ result, transportMessage, stale }: Props) {
  let body: React.ReactNode = null;

  if (transportMessage) {
    body = <p className="text-xs text-yellow-800 dark:text-yellow-300">{transportMessage}</p>;
  } else if (result?.status === "disabled") {
    body = (
      <p className="text-xs text-yellow-800 dark:text-yellow-300">
        La ejecución de código no está disponible por ahora. Puedes seguir respondiendo y enviar la evaluación.
      </p>
    );
  } else if (result?.status === "rejected") {
    const wait =
      result.retryAfterSeconds !== undefined
        ? ` Espera ${result.retryAfterSeconds} s antes de volver a ejecutar.`
        : "";
    body = (
      <p className="text-xs text-yellow-800 dark:text-yellow-300">
        {result.message}
        {wait}
      </p>
    );
  } else if (result?.status === "unavailable") {
    body = <p className="text-xs text-yellow-800 dark:text-yellow-300">{result.message}</p>;
  } else if (result?.status === "completed") {
    body = (
      <div className="flex flex-col gap-3">
        {stale && (
          <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
            El código cambió desde la última ejecución.
          </p>
        )}
        {result.noExamples && (
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Esta pregunta no tiene casos de ejemplo; tu código se ejecutó sin entrada.
          </p>
        )}
        {result.compileError !== undefined ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-red-800 dark:text-red-300">
              Error de compilación o de sintaxis
            </span>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-900 dark:text-red-200 font-mono">
              {result.compileError || "(sin detalle)"}
            </pre>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {result.cases.map((item) => (
              <CaseCard key={item.index} item={item} showVerdict={!result.noExamples} />
            ))}
          </ul>
        )}
        {result.truncatedCases && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Solo se muestran los primeros casos de ejemplo.
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Te quedan {result.runsRemaining} ejecuciones para esta pregunta. Los casos de ejemplo no definen tu
          nota: la calificación la hace el docente.
        </p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Resultados de la ejecución" aria-live="polite" className="flex flex-col gap-2">
      {body}
    </div>
  );
}
