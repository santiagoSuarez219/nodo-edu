import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { classifyAuthError, isAuthErrorLike } from "./errors";
import type { AuthCheckResult } from "./auth-check";

// spec-046 (decisión D2): un solo reintento ante fallo de red o 5xx del
// propio servidor de Auth, para que la pérdida de un solo paquete no tumbe
// el sitio entero con un 503. No se reintenta ante `misconfigured` (falta
// una env var — reintentar no cambia nada) ni en lib/auth/session.ts (esa
// capa se alcanza después de un middleware que ya reintentó, y
// getAuthCheck() está cache()-ada por request).
const RETRY_DELAY_MS = 250;
// Timeout por intento — evita agotar el límite de ejecución del middleware
// en Vercel. Peor caso: ~2 intentos × 2s + 250ms de backoff ≈ 4.25s antes
// del 503.
const REQUEST_TIMEOUT_MS = 2000;

// Incidente del 2026-08-29: el sitio entero alternó entre 503 y 200 durante
// ~35 minutos sin que Auth estuviera caído. `/auth/v1/health` sufría
// episodios de latencia (medido: 5.98s, y >15s en el peor tramo) mientras
// `/token` y `/user` seguían respondiendo en ~200ms — los usuarios con
// sesión navegaban con normalidad y solo los visitantes anónimos, que son
// los únicos que llegan a este ping, recibían el 503. Con los 2s de
// REQUEST_TIMEOUT_MS, cada uno de esos episodios se traducía en una caída
// total.
//
// Dos cambios, deliberadamente conservadores:
//
// 1. Un timeout propio y más holgado SOLO para el ping de salud. El resto
//    del cliente (getUser, user_roles) conserva los 2s: esas llamadas nunca
//    han mostrado esta latencia y no hay motivo para relajarlas. Peor caso
//    del ping: ~2 intentos × 5s + 250ms ≈ 10.25s, muy por debajo del límite
//    de ejecución del middleware en Vercel.
const HEALTH_TIMEOUT_MS = 5000;
// 2. Cachear el resultado **sano** por instancia. Sin esto, cada request sin
//    cookie de sesión paga un ping completo (nota de DEBT en
//    docs/specs/backlog.md), así que un episodio de lentitud se amplifica a
//    todo el tráfico anónimo. Solo se cachea el resultado positivo: un fallo
//    nunca se cachea, para que la recuperación sea inmediata y no se
//    prolongue el 503 más allá del incidente real. El precio es que una
//    caída de Auth puede tardar hasta este TTL en detectarse, que es
//    exactamente el intercambio que el backlog dejaba pendiente de evaluar.
const HEALTH_CACHE_TTL_MS = 10_000;

// Estado por instancia del runtime, no compartido entre regiones ni
// invocaciones frías — es un amortiguador, no una fuente de verdad.
let healthyUntil = 0;

export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // spec-046: antes esto lanzaba dentro de createServerClient() vía
    // non-null assertion (`!`), una excepción cruda que tumbaba el sitio con
    // la pantalla genérica de error de Next. Se distingue explícitamente
    // como "no se pudo configurar", no como "no hay sesión" — mismo destino
    // visual (503), log distinto para quien opera el sitio.
    console.error(
      "[auth] configuration_error: falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
    const auth: AuthCheckResult = { status: "unavailable", reason: "misconfigured" };
    return { supabaseResponse, auth, supabase: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    // `global.fetch`, no `auth.fetch`: es la única vía tipada de
    // @supabase/supabase-js para inyectar un fetch propio. Se aplica a todas
    // las llamadas de este cliente del middleware (también a la consulta de
    // `user_roles` del bloque /admin), lo cual es aceptable — un timeout
    // evita que cualquiera de las dos se cuelgue indefinidamente.
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }),
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const auth = await checkAuth(supabase, supabaseUrl, supabaseKey);

  return { supabaseResponse, auth, supabase };
}

async function checkAuth(
  supabase: SupabaseClient,
  supabaseUrl: string,
  supabaseKey: string
): Promise<AuthCheckResult> {
  const first = await tryGetUser(supabase, supabaseUrl, supabaseKey);

  // Solo se reintenta ante fallo de red o 5xx del servidor de Auth —
  // `misconfigured` no se arregla reintentando. Esto también cubre el ping
  // de checkAuthHealth() de más abajo: si vuelve `unavailable` con motivo
  // `network`/`server`, se reintenta con el mismo backoff sin código extra.
  const isRetryable =
    first.status === "unavailable" && (first.reason === "network" || first.reason === "server");
  if (!isRetryable) return first;

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return tryGetUser(supabase, supabaseUrl, supabaseKey);
}

async function tryGetUser(
  supabase: SupabaseClient,
  supabaseUrl: string,
  supabaseKey: string
): Promise<AuthCheckResult> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      // TC-046-003/004 (hallazgo de la ronda de pruebas manuales, ver
      // docs/testing/test-046-gate-auth-degradado.md): sin cookie de sesión,
      // el SDK resuelve `AuthSessionMissingError` de forma puramente local
      // (GoTrueClient._getUser, node_modules/@supabase/auth-js — no hay
      // access_token que validar, así que nunca llega a hacer una petición
      // de red). classifyAuthError() por sí sola no puede distinguir "no hay
      // sesión, Auth sano" de "no hay sesión, Auth caído" — ambos casos
      // colapsaban al mismo `anonymous`, incumpliendo el criterio de
      // aceptación #2 del spec (D4: un visitante sin sesión también debe
      // fallar cerrado si Auth no responde). Se verifica Auth de forma
      // explícita solo en esta rama — un JWT presente pero inválido/
      // caducado/corrupto (TC-046-015) ya dispara una llamada de red real
      // dentro de getUser(), así que ese caso no necesita este ping extra.
      if (isAuthErrorLike(error) && error.name === "AuthSessionMissingError") {
        return checkAuthHealth(supabaseUrl, supabaseKey);
      }
      return classifyAuthError(error);
    }
    return { status: "authenticated", user: data.user };
  } catch (error) {
    // Excepción no capturada por el propio SDK (ver lib/auth/errors.ts):
    // clasificarla igual que un AuthError desconocido, fallando cerrado.
    return classifyAuthError(error);
  }
}

// Ping directo a Auth para un visitante sin cookie de sesión (ver el
// comentario en tryGetUser()). GoTrue expone `/auth/v1/health` sin validar
// ninguna sesión, pero **sí** exige la `apikey` a través del gateway de
// Supabase hosted (Kong) — verificado contra el proyecto real de producción,
// que devuelve 401 sin ella. El Kong local de `supabase start` no la exige
// en esta ruta, lo que ocultó el bug en la primera versión de este fix (ver
// hallazgo 🔴-1 de la revisión de código de spec-046, 2026-08-13): sin la
// key, cualquier visitante anónimo en producción recibía 503 con Auth
// perfectamente sano. Timeout propio (HEALTH_TIMEOUT_MS) y caché del
// resultado sano tras el incidente del 2026-08-29 — ver el bloque de
// constantes; el reintento ante fallo lo aporta gratis checkAuth() de más
// arriba.
async function checkAuthHealth(supabaseUrl: string, supabaseKey: string): Promise<AuthCheckResult> {
  if (Date.now() < healthyUntil) return { status: "anonymous" };

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (res.ok) {
      healthyUntil = Date.now() + HEALTH_CACHE_TTL_MS;
      return { status: "anonymous" };
    }

    // El log de arriba (middleware.ts) solo imprime el `reason` agrupado —
    // no alcanza para diagnosticar un 401/403 (apikey rotada/entorno
    // equivocado) o un 404 (¿cambió la ruta de salud en una versión nueva de
    // GoTrue?). Este log deja el status crudo para quien opera el sitio.
    console.error(
      `[auth] ping de salud a Auth respondió ${res.status} — ${supabaseUrl}/auth/v1/health`
    );

    if (res.status === 401 || res.status === 403) {
      // La propia app no pudo autenticarse contra Auth — no es que Auth
      // esté caído, es que NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY no sirve
      // contra esa URL. Mismo destino visual (503) que `misconfigured`,
      // pero no se reintenta: la misma key inválida fallaría igual.
      return { status: "unavailable", reason: "misconfigured" };
    }

    if (res.status === 429) {
      // Rate limit del gateway (relevante dado DEBT-059): se trata como
      // `server` para que checkAuth() lo reintente una vez con el backoff
      // existente, en vez de tumbar el sitio ante un pico pasajero.
      return { status: "unavailable", reason: "server" };
    }

    return res.status >= 500
      ? { status: "unavailable", reason: "server" }
      : { status: "unavailable", reason: "unknown" };
  } catch {
    // `fetch` rechaza ante fallo de red o el timeout de arriba — mismo
    // criterio que `AuthRetryableFetchError` con `status: 0` en errors.ts.
    return { status: "unavailable", reason: "network" };
  }
}
