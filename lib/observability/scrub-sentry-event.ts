import type { ErrorEvent, EventHint } from "@sentry/nextjs";

import { isSentryEnabled } from "@/lib/observability/sentry-enabled";

// beforeSend compartido entre los tres runtimes (server, edge, cliente).
// Spec-052, decisión D5: además de sendDefaultPii: false, se depuran a mano
// las cookies de sesión de Supabase y las cabeceras que llevan las claves de
// servicio del proyecto (QUESTION_BANK_API_KEY, STUDENTS_ADMIN_API_KEY,
// COURSES_ADMIN_API_KEY viajan como Authorization o *-api-key).
export function scrubSentryEvent(event: ErrorEvent, _hint: EventHint) {
  // Segunda barrera de "solo producción" (defensa en profundidad): si por
  // algún motivo Sentry.init corrió con enabled: true fuera de las
  // condiciones de isSentryEnabled, el evento igual se descarta acá.
  if (!isSentryEnabled) {
    return null;
  }

  if (event.request) {
    delete event.request.cookies;

    const headers = event.request.headers;
    if (headers) {
      for (const name of Object.keys(headers)) {
        const lower = name.toLowerCase();
        if (lower === "authorization" || lower.includes("api-key")) {
          delete headers[name];
        }
      }
    }
  }

  return event;
}
