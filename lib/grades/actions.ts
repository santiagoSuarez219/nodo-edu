"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  createGradeItem,
  updateGradeItem,
  deleteGradeItem,
  upsertStudentGrade,
} from "./index";
import type { AuthResult } from "@/lib/auth/types";

export async function createGradeItemAction(
  academicCourseId: string,
  name: string,
  orderIndex: number
): Promise<AuthResult<{ id: string }>> {
  await requireUser();

  if (!name.trim()) return { ok: false, error: "El nombre del ítem es requerido." };

  try {
    const item = await createGradeItem(academicCourseId, name.trim(), orderIndex);
    revalidatePath(`/admin/courses/${academicCourseId}/grades`);
    return { ok: true, data: { id: item.id } };
  } catch {
    return { ok: false, error: "No se pudo crear el ítem. El nombre puede estar duplicado." };
  }
}

export async function updateGradeItemAction(
  gradeItemId: string,
  academicCourseId: string,
  name: string,
  orderIndex: number
): Promise<AuthResult> {
  await requireUser();

  if (!name.trim()) return { ok: false, error: "El nombre del ítem es requerido." };

  const updated = await updateGradeItem(gradeItemId, {
    name: name.trim(),
    order_index: orderIndex,
  });
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

  if (score !== null && (score < 0 || score > 5)) {
    return { ok: false, error: "Nota inválida. Debe estar entre 0.0 y 5.0." };
  }

  try {
    await upsertStudentGrade(enrollmentId, gradeItemId, score);
    revalidatePath(`/admin/courses/${academicCourseId}/grades`);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar la nota." };
  }
}
