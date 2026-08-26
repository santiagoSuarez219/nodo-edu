// Init de Sentry para el runtime Edge (donde corre middleware.ts). Cargado
// desde instrumentation.ts → register(). middleware.ts no se edita: este
// archivo lo instrumenta por configuración, no por código. Ver spec-052.
import * as Sentry from "@sentry/nextjs";

import { isSentryEnabled, sentryDsn } from "@/lib/observability/sentry-enabled";
import { scrubSentryEvent } from "@/lib/observability/scrub-sentry-event";

Sentry.init({
  dsn: sentryDsn,
  enabled: isSentryEnabled,
  environment: "production",
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubSentryEvent,
});
