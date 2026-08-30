import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./server";
import { classifyAuthError } from "./errors";
import type { AuthCheckResult } from "./auth-check";
import type { Profile } from "@/lib/students/types";

export type AppRole = "student" | "teacher" | "admin";

// spec-046 — Capa 2 del gate de autenticación: distingue "no hay sesión"
// (anonymous) de "no se pudo verificar" (unavailable) para que requireUser/
// requireRole/requireAnyRole puedan responder distinto a cada caso. Sin
// reintento aquí a propósito (a diferencia de lib/auth/middleware.ts): esta
// capa se alcanza después de un middleware que ya reintentó, y esta función
// está cache()-ada por request, así que un reintento aquí se multiplicaría
// por cada llamada dentro del mismo render.
const getAuthCheck = cache(async (): Promise<AuthCheckResult> => {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return classifyAuthError(error);
    return { status: "authenticated", user: data.user };
  } catch (error) {
    return classifyAuthError(error);
  }
});

// Mantiene su firma histórica (`Promise<User | null>`, 16 call sites en
// lib/ y app/ sin tocar) y colapsa `anonymous` y `unavailable` en `null`.
// Es una mentira consciente y acotada: esos 16 consumidores no distinguen
// hoy infraestructura de negocio, y corregirlos es el alcance de
// DEBT-040, no de este spec. Lo que sí distingue es requireUser/
// requireRole/requireAnyRole, que son quienes deciden a dónde redirigir.
//
// DEBT: getCurrentUser() (y por tanto getCurrentProfile()/getCurrentRoles(),
// consumidos por el root layout) siguen leyendo `unavailable` como "no hay
// sesión" — con Auth caído la navbar desaparece en vez de mostrar un aviso.
// Ver docs/specs/backlog.md → DEBT-040.
export const getCurrentUser = cache(async () => {
  const auth = await getAuthCheck();
  return auth.status === "authenticated" ? auth.user : null;
});

// spec-054: consulta a `profiles` compartida por `getCurrentProfile()` (firma
// histórica, `Profile | null`, 16 call sites) y `getAuthDegradedReason()`
// (necesita saber si la consulta *falló*, no solo si vino vacía). `cache()`
// de React dedup: aunque ambas la llamen, solo hace una petición de red.
const getProfileResult = cache(
  async (): Promise<{ profile: Profile | null; failed: boolean }> => {
    const user = await getCurrentUser();
    if (!user) return { profile: null, failed: false };

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // `.single()` devuelve error con código PGRST116 cuando la consulta trae
    // **cero filas** — un caso perfectamente sano (una sesión válida cuyo
    // `profiles` no existe todavía, o que RLS oculta), no un fallo de
    // infraestructura. Sin esta distinción, `getAuthDegradedReason()` mostraba
    // el banner de "problemas de conexión" con la red y Supabase impecables
    // (hallazgo 🟠-2 de la revisión de código, 2026-08-29). `failed` significa
    // exclusivamente "la consulta no se pudo completar".
    const isEmptyResult = error?.code === "PGRST116";

    return { profile: data ?? null, failed: !!error && !isEmptyResult };
  }
);

// spec-054 (D-F): para que el root layout pueda mostrar un aviso discreto en
// vez de dejar que una sesión válida parezca cerrada. `getCurrentUser()`
// colapsa `unavailable` en `null` (DEBT-040, gap deliberado y documentado
// arriba) — sin esta función, el layout no tiene forma de distinguir "eres
// anónimo" de "no pudimos verificarte" y la navbar simplemente desaparece,
// que es exactamente la mentira que spec-046 cerró un nivel más arriba
// (DEBT-042). Devuelve el motivo solo cuando es transitorio: si llegó hasta
// aquí con `misconfigured`/`unknown`, la ruta ya habría recibido el 503 total
// del middleware (spec-054, DEBT-069) y este código nunca se ejecutaría.
//
// TC-054-009 (ronda de pruebas, 2026-08-29): el chequeo original solo miraba
// `auth.status === "unavailable"` — cubre "no pudimos verificar tu sesión",
// pero no el caso, igual de real, en que Auth respondió bien (sesión válida)
// y fue la consulta a `profiles` la que abortó por el timeout de datos
// (DEBT-070). Sin este segundo chequeo, ese caso mostraba la navbar oculta
// sin ningún aviso — el mismo síntoma que este banner existe para evitar.
export const getAuthDegradedReason = cache(
  async (): Promise<"network" | "server" | "timeout" | null> => {
    const auth = await getAuthCheck();
    if (auth.status === "unavailable") {
      if (auth.reason === "network" || auth.reason === "server" || auth.reason === "timeout") {
        return auth.reason;
      }
      return null;
    }
    if (auth.status === "authenticated") {
      const { failed } = await getProfileResult();
      if (failed) return "timeout";
    }
    return null;
  }
);

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const { profile } = await getProfileResult();
  return profile;
});

export const getCurrentRoles = cache(async (): Promise<AppRole[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  return (data ?? []).map((r) => r.role as AppRole);
});

// Ante `unavailable` redirige a /servicio-no-disponible en vez de /login
// (spec-046): antes de este spec, un fallo de infraestructura aquí era
// indistinguible de "no hay sesión" y expulsaba al usuario al login —
// exactamente el síntoma de DEBT-042, pero en la Capa 2 del gate.
export async function requireUser(redirectTo?: string) {
  const auth = await getAuthCheck();

  if (auth.status === "unavailable") {
    redirectToServiceUnavailable(redirectTo);
  }

  if (auth.status === "anonymous") {
    const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/login${params}`);
  }

  return auth.user;
}

export async function requireRole(role: AppRole) {
  // requireUser() ya redirige a /login o /servicio-no-disponible antes de
  // devolver — si esta línea sigue ejecutándose, `auth.status` era
  // "authenticated".
  const user = await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", role)
    .maybeSingle();

  if (!data) redirect("/");
  return user;
}

export async function requireAnyRole(roles: AppRole[]) {
  const user = await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", roles);

  if (!data || data.length === 0) redirect("/");
  return user;
}

function redirectToServiceUnavailable(from?: string): never {
  const params = from ? `?from=${encodeURIComponent(from)}` : "";
  redirect(`/servicio-no-disponible${params}`);
}
