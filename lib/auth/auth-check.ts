import type { User } from "@supabase/supabase-js";

// spec-046: resultado de verificar la sesión que distingue "no hay sesión"
// de "no se pudo verificar" (Supabase Auth inalcanzable, caído, o mal
// configurado). Antes de este spec ambos casos colapsaban a `user: null` en
// `lib/auth/middleware.ts` y `lib/auth/session.ts`, lo que expulsaba a
// cualquier usuario a /login ante una caída del servicio (DEBT-042).
//
// Nombre de archivo separado de `lib/auth/types.ts` a propósito: ese archivo
// ya existía con `AuthResult` (resultado de server actions), un tipo
// homónimo pero no relacionado — mezclar ambos en el mismo módulo habría
// confundido dos dominios distintos.
// spec-054 (D-B): "timeout" es un motivo aparte de "network" — no es que la
// petición fallara, es que el presupuesto de tiempo del *gate* se agotó
// mientras Supabase seguía intentando responder (posiblemente atrapado en el
// bucle de reintentos interno de @supabase/auth-js, ver
// lib/auth/middleware.ts). Distinguirlo en Sentry es lo que permitió
// diagnosticar el incidente del 2026-08-29 en primer lugar.
export type AuthUnavailableReason =
  | "network"
  | "server"
  | "misconfigured"
  | "timeout"
  | "unknown";

export type AuthCheckResult =
  | { status: "authenticated"; user: User }
  | { status: "anonymous" }
  | { status: "unavailable"; reason: AuthUnavailableReason };
