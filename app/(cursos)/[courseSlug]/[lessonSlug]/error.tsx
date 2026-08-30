"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState, INFRA_ERROR_COPY, isInfraError } from "@/components/ErrorState";

// spec-054 (D-D): un timeout de red (lib/auth/fetch-timeout.ts) llega aquí
// como un `AbortError`/`TimeoutError` — de la propia señal, o envuelto por
// @supabase/auth-js en `AuthRetryableFetchError` (mensaje incluye "aborted
// due to timeout", verificado en node_modules/@supabase/auth-js/dist/module/lib/fetch.js)
// cuando alguna de las llamadas de datos de page.tsx SÍ propaga el error en
// vez de degradar a null/[] (la mayoría de los clientes de este proyecto no
// lanzan por defecto — ver PostgrestBuilder.ts — así que este caso es el
// residual: código que llama `.throwOnError()` o una excepción no atrapada
// del SDK).

// Captura fallos de render en servidor de la página de lección (las llamadas
// a datos de page.tsx: acceso, progreso, asistencia, autoevaluación),
// conservando el layout de lección (sidebar de navegación) en vez de
// desmontarlo todo hasta el fallback genérico de app/error.tsx.
export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const infra = isInfraError(error);

  useEffect(() => {
    console.error("Error al cargar la lección:", error);
    Sentry.captureException(error, {
      tags: { boundary: "lesson", digest: error.digest, infra },
    });
  }, [error, infra]);

  return (
    <div className="py-12">
      <div className="w-full max-w-sm mx-auto">
        <ErrorState
          title={infra ? INFRA_ERROR_COPY.title : "No pudimos cargar esta lección"}
          description={
            infra ? INFRA_ERROR_COPY.description : "Ocurrió un error inesperado. Intenta de nuevo."
          }
          onRetry={reset}
          digest={error.digest}
        />
      </div>
    </div>
  );
}
