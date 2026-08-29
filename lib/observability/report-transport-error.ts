import * as Sentry from "@sentry/nextjs";
import { isSentryEnabled } from "./sentry-enabled";

// spec-053 (D4): cuando un componente cliente deja de escalar un fallo de
// transporte al error boundary (ver lib/errors/server-action.ts), la señal
// de Sentry no puede desaparecer con él — si el `catch` la reportara al
// `console.error` únicamente, este spec arreglaría el síntoma visible pero
// dejaría el problema real invisible en producción.
//
// `level: "warning"`, no "error": es un fallo esperado y ya manejado (el
// usuario ve un mensaje y puede reintentar), no debe competir en el panel de
// Sentry con las excepciones no controladas. Respeta el mismo gate de
// spec-052 (D1) que el resto de la instrumentación: en desarrollo no envía
// nada.
export function reportTransportError(error: unknown, action: string): void {
  if (!isSentryEnabled) return;

  Sentry.captureException(error, {
    level: "warning",
    tags: { transport: "server_action", action },
  });
}
