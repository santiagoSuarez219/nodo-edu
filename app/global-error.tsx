"use client";

import { ErrorState } from "@/components/ErrorState";

// Único boundary que cubre un fallo del propio root layout (app/layout.tsx es
// async y llama a getCurrentProfile()/getCurrentRoles()): un error.tsx no
// captura los errores del layout de su propio segmento, así que este archivo
// es obligatorio, no opcional. Debe renderizar su propio <html>/<body> — no
// hereda la fuente ni el resto del layout raíz.
//
// Decisión D2 del spec: se reinyecta solo el script de tema (evita un flash
// blanco cegador en modo oscuro si la pantalla está proyectada), pero se
// acepta la tipografía de sistema en vez de JetBrains Mono — cargar
// `next/font` aquí añadiría una vía de fallo dentro del propio manejador de
// fallos, y este boundary solo se ve cuando el root layout ya falló.
const themeInitScript = `
(function () {
  try {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  } catch (_) {}
})();
`;

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen flex items-center justify-center bg-white text-gray-900 dark:bg-gray-900 dark:text-white px-4"
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
