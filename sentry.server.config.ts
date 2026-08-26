// Init de Sentry para el runtime Node (Server Components, Server Actions,
// Route Handlers). Cargado desde instrumentation.ts → register(). Ver
// spec-052.
import * as Sentry from "@sentry/nextjs";

import { isSentryEnabled, sentryDsn } from "@/lib/observability/sentry-enabled";
import { scrubSentryEvent } from "@/lib/observability/scrub-sentry-event";

Sentry.init({
  dsn: sentryDsn,
  enabled: isSentryEnabled,
  environment: "production",
  // Sin Performance/Tracing (decisión del usuario, spec-052).
  tracesSampleRate: 0,
  // No enviar PII por defecto: los usuarios son estudiantes reales
  // identificables por correo institucional.
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
});
