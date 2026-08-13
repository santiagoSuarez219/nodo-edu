import type { AuthUnavailableReason } from "./auth-check";

// Duck-typed en vez de importar `isAuthError`/`isAuthRetryableFetchError` de
// @supabase/supabase-js (spec-046, sección "Diseño"): esa librería no la
// re-exporta @supabase/ssr, que es lo único que hoy carga el runtime Edge
// del middleware. `__isAuthError` y `name` son parte del contrato público de
// las clases de error de @supabase/auth-js
// (node_modules/@supabase/auth-js/dist/module/lib/errors.js).
interface AuthErrorLike {
  name: string;
  status?: number;
  __isAuthError?: boolean;
}

export function isAuthErrorLike(error: unknown): error is AuthErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { __isAuthError?: unknown }).__isAuthError === true
  );
}

type AuthErrorClassification =
  | { status: "anonymous" }
  | { status: "unavailable"; reason: AuthUnavailableReason };

// Clasifica el `error` devuelto por `supabase.auth.getUser()`. Verificado en
// @supabase/auth-js (GoTrueClient._getUser y lib/fetch.js): un fallo de red
// (fetch rechaza) o un 5xx del propio servidor de Auth llegan como
// `AuthRetryableFetchError`; un JWT ausente/inválido llega como
// `AuthSessionMissingError` o `AuthApiError` 4xx. El SDK ya distingue
// infraestructura de negocio — este helper solo traduce esa distinción a
// `AuthCheckResult`.
//
// Falla cerrado (decisión D4 del spec): cualquier error no reconocido se
// trata como `unavailable`, no como `anonymous`, para no abrir el gate ante
// un fallo de infraestructura que no anticipamos.
export function classifyAuthError(error: unknown): AuthErrorClassification {
  if (!isAuthErrorLike(error)) {
    return { status: "unavailable", reason: "unknown" };
  }

  if (error.name === "AuthSessionMissingError") {
    return { status: "anonymous" };
  }

  if (error.name === "AuthRetryableFetchError") {
    return { status: "unavailable", reason: error.status === 0 ? "network" : "server" };
  }

  if (error.name === "AuthUnknownError") {
    return { status: "unavailable", reason: "unknown" };
  }

  // Cualquier otro AuthError con status conocido (p. ej. AuthApiError): 4xx
  // es un caso de negocio (JWT inválido/caducado, credenciales), 5xx es el
  // propio servidor de Auth cayéndose.
  if (typeof error.status === "number") {
    return error.status >= 500
      ? { status: "unavailable", reason: "server" }
      : { status: "anonymous" };
  }

  return { status: "unavailable", reason: "unknown" };
}
