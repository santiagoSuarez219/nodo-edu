import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { classifyAuthError, isAuthErrorLike } from "./errors";
import { createBudgetedFetch } from "./fetch-timeout";
import type { AuthCheckResult } from "./auth-check";

// spec-046 (decisión D2): un solo reintento ante fallo de red o 5xx del
// propio servidor de Auth, para que la pérdida de un solo paquete no tumbe
// el sitio entero con un 503. No se reintenta ante `misconfigured` (falta
// una env var — reintentar no cambia nada) ni en lib/auth/session.ts (esa
// capa se alcanza después de un middleware que ya reintentó, y
// getAuthCheck() está cache()-ada por request).
const RETRY_DELAY_MS = 250;

// spec-054 (D-A) — presupuesto GLOBAL de todo el gate de autenticación del
// middleware, compartido por getUser, el ping de salud y sus reintentos.
// Vercel corta la invocación del middleware a los 25s; 8s deja ~3× de
// holgura para construir y devolver el HTML del 503, y sigue estando ~20×
// por encima del peor caso legítimo medido en producción durante el
// incidente (auth_logs: getUser/token respondiendo en 7-389ms cuando Auth
// estaba sano). Con Auth realmente lento, el visitante espera hasta 8s antes
// de ver el 503 diseñado — pero lo ve, en vez de la pantalla cruda de Vercel.
const GLOBAL_DEADLINE_MS = 8000;

// Timeout por intento — sigue existiendo como cap individual, pero ya no es
// el único límite: ver GLOBAL_DEADLINE_MS y el comentario de
// createBudgetedFetch() más abajo.
const REQUEST_TIMEOUT_MS = 2000;

// Incidente del 2026-08-29: el sitio entero alternó entre 503 y 200 durante
// ~35 minutos sin que Auth estuviera caído. `/auth/v1/health` sufría
// episodios de latencia (medido: 5.98s, y >15s en el peor tramo) mientras
// `/token` y `/user` seguían respondiendo en ~200ms — los usuarios con
// sesión navegaban con normalidad y solo los visitantes anónimos, que son
// los únicos que llegan a este ping, recibían el 503.
//
// Dos cambios de ese día, deliberadamente conservadores en su momento:
//
// 1. Un timeout propio y más holgado para el ping de salud (HEALTH_TIMEOUT_MS
//    más abajo). El comentario original de este archivo afirmaba un peor
//    caso de "~2 intentos × 5s + 250ms ≈ 10.25s, muy por debajo del límite
//    de ejecución del middleware en Vercel" — **esa cifra era falsa**. No
//    contemplaba el bucle de reintentos INTERNO de `@supabase/auth-js` al
//    refrescar un token (`_refreshAccessToken`, GoTrueClient.js:3902-3918):
//    reintenta con backoff `200·2^(n-1)` ms bajo un predicado que corta por
//    **reloj de pared contra 30s** (`AUTO_REFRESH_TICK_DURATION_MS`), no por
//    número de intentos. Con el `AbortSignal.timeout(2000)` que antes se
//    inyectaba por-fetch (cada intento aborta a los 2s exactos con
//    `AuthRetryableFetchError`, el error que ese predicado considera
//    reintentable), el bucle cabe **7 veces** antes de que el siguiente
//    backoff exceda la ventana de 30s: una sola llamada a `getUser()` que
//    necesite refrescar el token puede consumir **~26.6s**, ya por encima de
//    los 25s de Vercel — y `checkAuth()` la reintenta una vez más, hasta
//    ~53s de peor caso. Esto explica sin hipótesis residual los 504
//    `MIDDLEWARE_INVOCATION_TIMEOUT` del incidente (docs/specs/spec-054).
//
//    Corolario contraintuitivo: **bajar** REQUEST_TIMEOUT_MS empeora este
//    problema, porque caben más iteraciones dentro de la ventana de 30s del
//    SDK. La única forma real de acotarlo es un presupuesto GLOBAL que no
//    dependa de cuántos intentos quepan — ver GLOBAL_DEADLINE_MS.
//
// 2. Cachear el resultado **sano** por instancia. Sin esto, cada request sin
//    cookie de sesión paga un ping completo, así que un episodio de lentitud
//    se amplifica a todo el tráfico anónimo. Solo se cachea el resultado
//    positivo: un fallo nunca se cachea, para que la recuperación sea
//    inmediata y no se prolongue el 503 más allá del incidente real.
const HEALTH_TIMEOUT_MS = 5000;
const HEALTH_CACHE_TTL_MS = 10_000;

// Estado por instancia del runtime, no compartido entre regiones ni
// invocaciones frías — es un amortiguador, no una fuente de verdad.
let healthyUntil = 0;

export interface UpdateSupabaseSessionResult {
  supabaseResponse: NextResponse;
  auth: AuthCheckResult;
  supabase: SupabaseClient | null;
  // spec-054 — para los tags de Sentry en middleware.ts (raíz): cuánto tardó
  // el gate y si terminó por el deadline global o por una clasificación
  // normal (network/server/misconfigured/...).
  authDurationMs: number;
  deadlineExceeded: boolean;
}

export async function updateSupabaseSession(
  request: NextRequest
): Promise<UpdateSupabaseSessionResult> {
  let supabaseResponse = NextResponse.next({ request });
  const startedAt = Date.now();

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
    return {
      supabaseResponse,
      auth,
      supabase: null,
      authDurationMs: Date.now() - startedAt,
      deadlineExceeded: false,
    };
  }

  // spec-054 (D-B) — un `AbortController` por request, compartido por TODAS
  // las llamadas de red de este gate (getUser, sus reintentos, el ping de
  // salud). Al agotarse GLOBAL_DEADLINE_MS, aborta: cualquier fetch en curso
  // rechaza de inmediato, y cualquier fetch NUEVO que el bucle interno del
  // SDK intente después recibe una señal ya abortada y rechaza sin esperar
  // su propio timeout — es lo que corta el bucle de _refreshAccessToken de
  // raíz, no solo desde afuera.
  const deadline = new AbortController();
  const deadlineTimer = setTimeout(() => deadline.abort(), GLOBAL_DEADLINE_MS);

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      // `global.fetch`, no `auth.fetch`: es la única vía tipada de
      // @supabase/supabase-js para inyectar un fetch propio. Se aplica a
      // todas las llamadas de este cliente (también a `user_roles` del
      // bloque /admin) — cada una respeta el cap por intento Y el deadline
      // global.
      global: {
        fetch: createBudgetedFetch(REQUEST_TIMEOUT_MS, deadline.signal),
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

    // El ping de salud (checkAuthHealth) llama a `fetch` directamente, fuera
    // del cliente de arriba — recibe su propio fetch presupuestado, también
    // subordinado al mismo deadline compartido. Antes de este spec tenía un
    // timeout paralelo (HEALTH_TIMEOUT_MS = 5s) que por sí solo podía superar
    // el presupuesto del gate entero; ahora es un cap por intento dentro del
    // mismo deadline, nunca una ventana aparte.
    const healthFetch = createBudgetedFetch(HEALTH_TIMEOUT_MS, deadline.signal);

    // Cinturón de seguridad (D-B): el `AbortController` de arriba corta las
    // conexiones de red, pero no puede garantizar que checkAuth() en sí
    // *resuelva* antes del deadline si alguna rama del SDK no propagara la
    // señal como se espera. Este `Promise.race` sí lo garantiza: la función
    // devuelve dentro del presupuesto pase lo que pase con la promesa
    // perdedora (que en Edge/serverless muere con la invocación).
    const auth = await Promise.race([
      checkAuth(supabase, supabaseUrl, supabaseKey, healthFetch),
      new Promise<AuthCheckResult>((resolve) => {
        deadline.signal.addEventListener(
          "abort",
          () => resolve({ status: "unavailable", reason: "timeout" }),
          { once: true }
        );
      }),
    ]);

    return {
      supabaseResponse,
      auth,
      supabase,
      authDurationMs: Date.now() - startedAt,
      deadlineExceeded: auth.status === "unavailable" && auth.reason === "timeout",
    };
  } finally {
    clearTimeout(deadlineTimer);
  }
}

async function checkAuth(
  supabase: SupabaseClient,
  supabaseUrl: string,
  supabaseKey: string,
  healthFetch: typeof fetch
): Promise<AuthCheckResult> {
  const first = await tryGetUser(supabase, supabaseUrl, supabaseKey, healthFetch);

  // Solo se reintenta ante fallo de red o 5xx del servidor de Auth —
  // `misconfigured` no se arregla reintentando, y `timeout` significa que ya
  // se agotó el presupuesto global: reintentar no tendría tiempo. Esto
  // también cubre el ping de checkAuthHealth() de más abajo: si vuelve
  // `unavailable` con motivo `network`/`server`, se reintenta con el mismo
  // backoff sin código extra.
  const isRetryable =
    first.status === "unavailable" && (first.reason === "network" || first.reason === "server");
  if (!isRetryable) return first;

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return tryGetUser(supabase, supabaseUrl, supabaseKey, healthFetch);
}

async function tryGetUser(
  supabase: SupabaseClient,
  supabaseUrl: string,
  supabaseKey: string,
  healthFetch: typeof fetch
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
        return checkAuthHealth(supabaseUrl, supabaseKey, healthFetch);
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
// perfectamente sano. `healthFetch` ya trae el timeout por intento y el
// deadline global inyectados (spec-054) — el reintento ante fallo lo aporta
// gratis checkAuth() de más arriba.
async function checkAuthHealth(
  supabaseUrl: string,
  supabaseKey: string,
  healthFetch: typeof fetch
): Promise<AuthCheckResult> {
  if (Date.now() < healthyUntil) return { status: "anonymous" };

  try {
    const res = await healthFetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
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
    // `fetch` rechaza ante fallo de red, el cap por intento o el deadline
    // global compartido (spec-054) — mismo criterio que
    // `AuthRetryableFetchError` con `status: 0` en errors.ts. El caso en que
    // el deadline global ya se agotó queda cubierto aparte por el
    // `Promise.race` de `updateSupabaseSession`, que resuelve
    // `reason: "timeout"` sin depender de que esta rama distinga la causa.
    return { status: "unavailable", reason: "network" };
  }
}
