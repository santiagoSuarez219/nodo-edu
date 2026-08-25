"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ErrorState";

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
  useEffect(() => {
    console.error("Error de renderizado:", error);
    Sentry.captureException(error, {
      tags: { boundary: "root", digest: error.digest },
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <ErrorState
          title="Algo salió mal"
          description="Ocurrió un error inesperado. Intenta de nuevo."
          onRetry={reset}
          digest={error.digest}
        />
      </div>
    </div>
  );
}
