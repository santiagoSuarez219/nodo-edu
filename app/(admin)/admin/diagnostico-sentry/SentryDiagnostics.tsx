"use client";

import { useState, useTransition } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { triggerServerError } from "./actions";

// Botón que lanza dentro de un handler de cliente, envuelto en el
// ErrorBoundary existente (spec-037) para que el fallo degrade solo este
// recuadro (spec-052, D6/D7).
function ClientErrorTrigger() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Sentry client-side check");
  }

  return (
    <button
      type="button"
      onClick={() => setShouldThrow(true)}
      className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
    >
      Probar error de cliente
    </button>
  );
}

export function SentryDiagnostics() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleServerCheck = () => {
    setServerError(null);
    startTransition(async () => {
      try {
        await triggerServerError();
      } catch (error) {
        // El error ya se reportó a Sentry en el boundary/onRequestError del
        // servidor; acá solo se avisa en pantalla que la prueba se disparó.
        setServerError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-300">
        Estos botones generan errores <strong>reales</strong> que llegarán a
        Sentry. No usar durante una clase en curso.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleServerCheck}
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "Probando…" : "Probar error de servidor"}
        </button>

        <ErrorBoundary
          title="Error de cliente capturado"
          description="El fallo se reportó a Sentry sin desmontar el resto de la página."
        >
          <ClientErrorTrigger />
        </ErrorBoundary>
      </div>

      {serverError && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          El servidor respondió con: <code>{serverError}</code> — revisar el
          panel de Sentry para confirmar el evento.
        </p>
      )}
    </div>
  );
}
