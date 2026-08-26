"use server";

import { requireAnyRole } from "@/lib/auth/session";

// Lanza a propósito, para verificar la captura server-side de Sentry
// (spec-052, D6). No hace nada más: no toca datos ni servicios externos.
export async function triggerServerError(): Promise<never> {
  await requireAnyRole(["teacher", "admin"]);
  throw new Error("Sentry server-side check");
}
