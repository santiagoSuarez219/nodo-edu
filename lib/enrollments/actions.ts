"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { enrollByCode, withdrawStudent } from "./index";
import type { AuthResult } from "@/lib/auth/types";

export async function enrollByCourseCodeAction(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  await requireUser();

  const code = (formData.get("enrollment_code") as string | null)?.trim().toUpperCase();
  if (!code || code.length === 0) {
    return { ok: false, error: "Ingresa un código de matrícula." };
  }

  const result = await enrollByCode(code);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/cuenta/cursos");
  return { ok: true };
}

export async function withdrawStudentAction(
  enrollmentId: string
): Promise<void> {
  await requireUser();
  await withdrawStudent(enrollmentId);
  revalidatePath("/admin/courses");
}
