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
export type AuthUnavailableReason = "network" | "server" | "misconfigured" | "unknown";

export type AuthCheckResult =
  | { status: "authenticated"; user: User }
  | { status: "anonymous" }
  | { status: "unavailable"; reason: AuthUnavailableReason };
