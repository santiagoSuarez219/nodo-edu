"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState, INFRA_ERROR_COPY, isInfraError } from "@/components/ErrorState";

// Conserva el chrome admin (layout de app/(admin)/layout.tsx) al fallar,
// en vez de caer al fallback genérico de app/error.tsx.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // spec-054 (D-D): mismo criterio que app/(cursos)/[courseSlug]/[lessonSlug]/error.tsx.
  const infra = isInfraError(error);

  useEffect(() => {
    console.error("Error en el panel admin:", error);
    Sentry.captureException(error, {
      tags: { boundary: "admin", digest: error.digest, infra },
    });
  }, [error, infra]);

  return (
    <div className="py-12">
      <div className="w-full max-w-sm mx-auto">
        <ErrorState
          title={infra ? INFRA_ERROR_COPY.title : "Algo salió mal"}
          description={
            infra
              ? INFRA_ERROR_COPY.description
              : "No pudimos cargar esta sección del panel admin. Intenta de nuevo."
          }
          onRetry={reset}
          digest={error.digest}
        />
      </div>
    </div>
  );
}
