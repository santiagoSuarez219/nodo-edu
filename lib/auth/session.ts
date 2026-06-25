import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./server";
import type { Profile } from "@/lib/students/types";

type AppRole = "student" | "teacher" | "admin";

export const getCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
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

export async function requireUser(redirectTo?: string) {
  const user = await getCurrentUser();
  if (!user) {
    const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/login${params}`);
  }
  return user;
}

export async function requireRole(role: AppRole) {
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
    .in("role", roles)
    .maybeSingle();

  if (!data) redirect("/");
  return user;
}
