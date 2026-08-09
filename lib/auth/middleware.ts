import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { classifyAuthError } from "./errors";
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

  const auth = await checkAuth(supabase);

  return { supabaseResponse, auth, supabase };
}

async function checkAuth(supabase: SupabaseClient): Promise<AuthCheckResult> {
  const first = await tryGetUser(supabase);

  // Solo se reintenta ante fallo de red o 5xx del servidor de Auth —
  // `misconfigured` no se arregla reintentando.
  const isRetryable =
    first.status === "unavailable" && (first.reason === "network" || first.reason === "server");
  if (!isRetryable) return first;

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return tryGetUser(supabase);
}

async function tryGetUser(supabase: SupabaseClient): Promise<AuthCheckResult> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return classifyAuthError(error);
    }
    return { status: "authenticated", user: data.user };
  } catch (error) {
    // Excepción no capturada por el propio SDK (ver lib/auth/errors.ts):
    // clasificarla igual que un AuthError desconocido, fallando cerrado.
    return classifyAuthError(error);
  }
}
