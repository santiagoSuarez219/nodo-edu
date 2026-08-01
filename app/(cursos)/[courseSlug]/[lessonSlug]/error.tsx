"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

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
  useEffect(() => {
    console.error("Error al cargar la lección:", error);
  }, [error]);

  return (
    <div className="py-12">
      <div className="w-full max-w-sm mx-auto">
        <ErrorState
          title="No pudimos cargar esta lección"
          description="Ocurrió un error inesperado. Intenta de nuevo."
          onRetry={reset}
          digest={error.digest}
        />
      </div>
    </div>
  );
}
