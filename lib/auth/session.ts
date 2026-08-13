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

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data ?? null;
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
