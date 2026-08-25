// Init de Sentry para el navegador. Convención de Next 15.3+/16 — sustituye
// al antiguo sentry.client.config.ts. Sin Session Replay ni Browser Tracing
// (decisión del usuario, spec-052): no se importa replayIntegration() ni
// browserTracingIntegration(), para no engordar el bundle del cliente.
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

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
