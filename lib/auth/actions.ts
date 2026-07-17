"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./server";
import {
  SignInSchema,
  SignUpSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
} from "./schemas";
import type { AuthResult } from "./types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function signIn(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");

  const redirectTo = formData.get("redirectTo")?.toString();
  if (redirectTo) {
    redirect(redirectTo);
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user?.id);

  const hasStudentRole = roles?.some((r) => r.role === "student");
  if (hasStudentRole) {
    redirect("/cuenta/cursos");
  }

  redirect("/");
}

export async function signUp(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const parsed = SignUpSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirmation: formData.get("password_confirmation"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  redirect("/registro/confirmar");
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const parsed = PasswordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Ingresa un correo válido.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/recuperar-password/confirmar`,
  });

  // Mensaje genérico: no filtramos si el email existe o no
  return { ok: true };
}

export async function updatePassword(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const parsed = PasswordResetConfirmSchema.safeParse({
    password: formData.get("password"),
    password_confirmation: formData.get("password_confirmation"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: "No se pudo actualizar la contraseña. El enlace puede haber expirado." };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resendConfirmation(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email")?.toString();
  if (!email) return { ok: false, error: "Correo requerido." };

  const supabase = await createServerSupabaseClient();
  await supabase.auth.resend({ type: "signup", email });

  // Mensaje genérico siempre
  return { ok: true };
}
