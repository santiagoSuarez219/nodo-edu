"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { UpdateProfileSchema } from "@/lib/auth/schemas";
import type { AuthResult } from "@/lib/auth/types";

export async function updateAccountAction(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const parsed = UpdateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    career: formData.get("career") || undefined,
    semester: formData.get("semester") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id);

  if (profileError) {
    return { ok: false, error: "No se pudo actualizar el perfil." };
  }

  const { error: studentError } = await supabase
    .from("students")
    .update({
      career: parsed.data.career ?? null,
      semester: parsed.data.semester !== "" ? Number(parsed.data.semester) : null,
    })
    .eq("profile_id", user.id);

  if (studentError) {
    return { ok: false, error: "No se pudo actualizar la información académica." };
  }

  revalidatePath("/cuenta");
  return { ok: true };
}
