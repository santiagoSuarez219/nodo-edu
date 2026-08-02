"use client";

import { ErrorState } from "@/components/ErrorState";

// Único boundary que cubre un fallo del propio root layout (app/layout.tsx es
// async y llama a getCurrentProfile()/getCurrentRoles()): un error.tsx no
// captura los errores del layout de su propio segmento, así que este archivo
// es obligatorio, no opcional. Debe renderizar su propio <html>/<body> — no
// hereda la fuente ni el resto del layout raíz.
//
// Decisión D2 del spec: evitar un flash blanco cegador en modo oscuro si la
// pantalla está proyectada. La primera versión reinyectaba el script de tema
// del root layout (toggle de la clase `.dark` vía JS), pero un <script>
// crudo dentro de JSX hace que React rehúse ejecutarlo en cliente y el
// boundary de último recurso terminaba rompiéndose él mismo (hallazgo de
// TC-037-006). En su lugar: un <style> con @media (prefers-color-scheme)
// —seguro de renderizar, sin JS— que solo ajusta el fondo/color base de la
// página; no intenta replicar la clase `.dark` completa del resto de la app.
// Se acepta la tipografía de sistema en vez de JetBrains Mono — cargar
// `next/font` aquí añadiría una vía de fallo dentro del propio manejador de
// fallos, y este boundary solo se ve cuando el root layout ya falló.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="global-error-body min-h-screen flex items-center justify-center px-4">
        <style>{`
          .global-error-body { background: #ffffff; color: #111827; }
          @media (prefers-color-scheme: dark) {
            .global-error-body { background: #111827; color: #ffffff; }
          }
        `}</style>
        <div className="w-full max-w-sm">
          <ErrorState
            title="Algo salió mal"
            description="Ocurrió un error inesperado y no pudimos cargar la página. Intenta de nuevo."
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  );
}
