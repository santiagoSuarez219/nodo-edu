import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// SupabaseClient explícito, NO ReturnType<typeof createClient>: para una
// función genérica, ReturnType<T> no resuelve los parámetros de tipo por
// defecto igual que una invocación real, y termina tipando las filas de
// .insert()/.update() como `never` en vez de `any`.
let serviceClient: SupabaseClient | null = null;

export function createServiceSupabaseClient() {
  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    serviceClient = createClient(url, key);
  }

  return serviceClient;
}
