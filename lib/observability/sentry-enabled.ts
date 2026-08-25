// Única fuente de verdad de "¿Sentry está activo?" (spec-052, decisión D1).
//
// Activo solo si hay DSN configurado y NODE_ENV es "production". Doble
// candado: npm run dev tiene NODE_ENV "development" (falla el segundo), y el
// entorno de desarrollo contra mirp-lab además no tiene el DSN en .env.local
// (falla el primero). Un npm run build && npm run start local también queda
// apagado mientras el DSN no esté presente.
//
// A diferencia de lib/auth/server.ts, la ausencia del DSN es un estado
// válido aquí (desarrollo), no un error de configuración: no se usa `!`.
export const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const isSentryEnabled =
  Boolean(sentryDsn) && process.env.NODE_ENV === "production";
