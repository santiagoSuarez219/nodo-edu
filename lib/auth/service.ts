import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

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

// spec-051 (D2): la marca `must_change_password` vive en `app_metadata`
// precisamente porque solo `service_role` puede escribirla — el propio
// usuario no puede borrársela desde su sesión. Se pasa el `app_metadata`
// actual completo y se sobreescribe con un spread en vez de mandar solo
// `{ must_change_password: false }`: no está documentado si el servidor de
// Auth mergea o reemplaza el objeto, así que el merge se hace aquí, en
// código, sin depender de ese comportamiento.
//
// No-op si la marca no estaba puesta — seguro de llamar siempre, incluso
// antes de que exista ningún flujo que la escriba (Fase 3/4 de spec-051).
//
// Devuelve `true` si la marca quedó limpia (o no estaba puesta) y `false` si
// el `update` falló. Revisión de código (2026-08-16, @reviewer): antes esta
// función no devolvía nada — `changePassword` no podía saber que la marca
// había quedado sin limpiar y reportaba éxito igual, dejando al usuario
// encerrado en /cambiar-contrasena con una contraseña que ya no puede
// repetir (D6 rechaza la nueva = la actual). El llamador ahora puede avisar.
export async function clearMustChangePasswordFlag(
  userId: string,
  currentAppMetadata: User["app_metadata"]
): Promise<boolean> {
  if (!currentAppMetadata?.must_change_password) return true;

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { ...currentAppMetadata, must_change_password: false },
  });

  if (error) {
    console.error(
      `clearMustChangePasswordFlag: no se pudo limpiar la marca para ${userId}:`,
      error.message
    );
    return false;
  }
  return true;
}
