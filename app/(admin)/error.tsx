"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ErrorState";

// Conserva el chrome admin (layout de app/(admin)/layout.tsx) al fallar,
// en vez de caer al fallback genérico de app/error.tsx.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en el panel admin:", error);
    Sentry.captureException(error, {
      tags: { boundary: "admin", digest: error.digest },
    });
  }, [error]);

  return (
    <div className="py-12">
      <div className="w-full max-w-sm mx-auto">
        <ErrorState
          title="Algo salió mal"
          description="No pudimos cargar esta sección del panel admin. Intenta de nuevo."
          onRetry={reset}
          digest={error.digest}
        />
      </div>
    </div>
  );
}
