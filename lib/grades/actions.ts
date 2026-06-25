"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { GradeItemSchema, StudentGradeSchema } from "./schemas";
import {
  createGradeItem,
  updateGradeItem,
  deleteGradeItem,
  upsertStudentGrade,
} from "./index";
import type { AuthResult } from "@/lib/auth/types";

export async function createGradeItemAction(
  academicCourseId: string,
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  await requireUser();

  const parsed = GradeItemSchema.safeParse({
    name: formData.get("name"),
    order_index: formData.get("order_index") ?? 0,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del ítem.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await createGradeItem(
      academicCourseId,
      parsed.data.name,
      parsed.data.order_index
    );
    revalidatePath(`/admin/courses/${academicCourseId}/grades`);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo crear el ítem. El nombre puede estar duplicado." };
  }
}

export async function updateGradeItemAction(
  gradeItemId: string,
  academicCourseId: string,
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  await requireUser();

  const parsed = GradeItemSchema.safeParse({
    name: formData.get("name"),
    order_index: formData.get("order_index") ?? 0,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del ítem.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await updateGradeItem(gradeItemId, parsed.data);
  if (!updated) return { ok: false, error: "No se pudo actualizar el ítem." };

  revalidatePath(`/admin/courses/${academicCourseId}/grades`);
  return { ok: true };
}

export async function deleteGradeItemAction(
  gradeItemId: string,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const result = await deleteGradeItem(gradeItemId);
  if (!result.ok) return result;

  revalidatePath(`/admin/courses/${academicCourseId}/grades`);
  return { ok: true };
}

export async function upsertStudentGradeAction(
  enrollmentId: string,
  gradeItemId: string,
  score: number | null,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const parsed = StudentGradeSchema.safeParse({
    enrollment_id: enrollmentId,
    grade_item_id: gradeItemId,
    score,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Nota inválida. Debe estar entre 0.0 y 5.0.",
    };
  }

  try {
    await upsertStudentGrade(enrollmentId, gradeItemId, parsed.data.score);
    revalidatePath(`/admin/courses/${academicCourseId}/grades`);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar la nota." };
  }
}
