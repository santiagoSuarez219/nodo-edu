"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState, INFRA_ERROR_COPY, isInfraError } from "@/components/ErrorState";

// Red de seguridad general: cubre cualquier ruta sin un error.tsx propio
// (limitación de D1). No captura errores del root layout — eso es
// exclusivo de global-error.tsx.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // spec-054 (D-D): mismo criterio que app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx.
  const infra = isInfraError(error);

  useEffect(() => {
    console.error("Error de renderizado:", error);
    Sentry.captureException(error, {
      tags: { boundary: "root", digest: error.digest, infra },
    });
  }, [error, infra]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <ErrorState
          title={infra ? INFRA_ERROR_COPY.title : "Algo salió mal"}
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
