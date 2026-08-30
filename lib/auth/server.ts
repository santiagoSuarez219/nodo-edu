import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createTimeoutFetch } from "./fetch-timeout";

// spec-054 (D-C) — 6s: las consultas normales de este cliente están en
// decenas de ms (auth_logs, incidente 2026-08-29: 7-31ms), así que 6s es
// ~100× el caso normal y ~50× mejor que los 300s de hoy (DEBT-070: 10
// ejecuciones de /[courseSlug] muertas por el límite de 300s de Vercel
// porque este cliente no tenía ningún timeout).
const DATA_TIMEOUT_MS = 6000;

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // spec-054: antes esto lanzaba dentro de createServerClient() vía
    // non-null assertion (`!`), una excepción cruda — exactamente el fallo
    // que spec-046 corrigió en lib/auth/middleware.ts y que aquí quedó vivo.
    // Este cliente no tiene el equivalente al `AuthCheckResult` del
    // middleware para reportar "misconfigured" con matiz, así que falla
    // igual de explícito pero con un mensaje que sí distingue la causa.
    console.error(
      "[auth] configuration_error: falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
    throw new Error("Supabase no está configurado: faltan variables de entorno.");
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        fetch: createTimeoutFetch(DATA_TIMEOUT_MS),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll llamado desde un Server Component — las cookies no se pueden
            // modificar aquí, el middleware se encarga del refresco.
          }
        },
      },
    }
  );
}
