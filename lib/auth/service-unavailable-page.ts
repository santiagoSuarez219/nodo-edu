// spec-046 (decisión D1): el middleware no puede renderizar React —
// `NextResponse.rewrite(url, { status: 503 })` no produce un 503 real en
// Next 16.2.4 (el status se descarta aguas abajo, ver "Diseño" del spec) —
// así que esta pantalla se construye como HTML inline, igual que
// `app/global-error.tsx` (que ya tomó y documentó el mismo trade-off:
// renderizar su propio <html>/<body> sin JetBrains Mono ni globals.css
// porque cargar next/font "añadiría una vía de fallo dentro del propio
// manejador de fallos").
//
// La estructura y los colores replican `components/ErrorState.tsx`
// (role="alert", título/descripción/botón, tokens --color-danger de
// DESIGN.md) volcados a hex literal — no hay hoja de estilos cargada aquí.
// Duplicación aceptada y documentada, como en global-error.tsx.
// El copy es el corazón de la deuda que cierra este spec: dejar claro que la
// sesión NO se cerró y que el problema no es la contraseña del usuario (ver
// docs/specs/spec-046-gate-auth-degradado.md). El texto no varía por `reason`
// — el usuario no necesita distinguir "red" de "servidor caído"; ese detalle
// va solo al log del servidor (ver lib/auth/middleware.ts).
export function renderServiceUnavailablePage(currentPath: string): string {
  const retryHref = currentPath || "/";

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Servicio no disponible</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    color: #111827;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #111827; color: #ffffff; }
  }
  .card {
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(185, 28, 28, 0.3);
    background: rgba(185, 28, 28, 0.1);
    padding: 1rem;
  }
  .title { margin: 0; font-size: 0.875rem; font-weight: 500; color: #b91c1c; }
  .description { margin: 0.25rem 0 0; font-size: 0.875rem; color: #b91c1c; }
  @media (prefers-color-scheme: dark) {
    .title, .description { color: #fca5a5; }
  }
  .retry {
    display: inline-block;
    border-radius: 0.5rem;
    background: #b91c1c;
    color: #ffffff;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    text-decoration: none;
  }
  @media (prefers-color-scheme: dark) {
    .retry { background: #dc2626; }
  }
</style>
</head>
<body>
  <div class="card" role="alert">
    <div>
      <p class="title">No pudimos verificar tu sesión</p>
      <p class="description">
        El servicio de autenticación no está respondiendo. <strong>Tu sesión
        sigue activa</strong> — esto no es un problema con tu usuario ni tu
        contraseña. Intenta de nuevo en unos segundos.
      </p>
    </div>
    <a class="retry" href="${escapeHtml(retryHref)}">Reintentar</a>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
