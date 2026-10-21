"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import {
  createGradeItem,
  updateGradeItem,
  deleteGradeItem,
  upsertStudentGrade,
  createGradeGroup,
  updateGradeGroup,
  deleteGradeGroup,
  ensureSelfAssessmentGradeItem,
} from "./index";
import { GradeGroupSchema, GradeItemWeightSchema } from "./schemas";
import type { AuthResult } from "@/lib/auth/types";

const gradesPath = (academicCourseId: string) =>
  `/admin/courses/${academicCourseId}/grades`;

function parseWeight(weight: number | null): { ok: true; value: number | null } | { ok: false; error: string } {
  const parsed = GradeItemWeightSchema.safeParse(weight);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  return { ok: true, value: parsed.data };
}

export async function createGradeItemAction(
  academicCourseId: string,
  name: string,
  orderIndex: number,
  weight: number | null = null,
  groupId: string | null = null
): Promise<AuthResult<{ id: string }>> {
  await requireUser();

  if (!name.trim()) return { ok: false, error: "El nombre del ítem es requerido." };
  const w = parseWeight(weight);
  if (!w.ok) return w;

  const result = await createGradeItem(academicCourseId, name.trim(), orderIndex, w.value, groupId);
  if (!result.ok) return result;
  revalidatePath(gradesPath(academicCourseId));
  return { ok: true, data: { id: result.data.id } };
}

export async function updateGradeItemAction(
  gradeItemId: string,
  academicCourseId: string,
  name: string,
  orderIndex: number,
  weight: number | null,
  groupId: string | null
): Promise<AuthResult> {
  await requireUser();

  if (!name.trim()) return { ok: false, error: "El nombre del ítem es requerido." };
  const w = parseWeight(weight);
  if (!w.ok) return w;

  const result = await updateGradeItem(gradeItemId, {
    name: name.trim(),
    order_index: orderIndex,
    weight: w.value,
    group_id: groupId,
  });
  if (!result.ok) return result;

  revalidatePath(gradesPath(academicCourseId));
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

// spec-040 Fase 5: recálculo masivo de la nota de autoevaluaciones de todo
// un curso académico. El RPC valida por sí mismo que el llamador sea el
// docente dueño o un admin (devuelve 0 en caso contrario, sin tocar nada) —
// `requireUser()` aquí es solo para no exponer la acción a un visitante
// anónimo; la autorización real vive en la base de datos.
export async function recalculateCourseSelfAssessmentGrades(
  academicCourseId: string
): Promise<AuthResult<{ updatedCount: number }>> {
  await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc(
    "recalculate_course_self_assessment_grades",
    { p_academic_course_id: academicCourseId }
  );

  if (error) {
    console.error("Error recalculating course self-assessment grades:", error);
    return { ok: false, error: "No se pudo recalcular las notas de autoevaluaciones." };
  }

  revalidatePath(`/admin/courses/${academicCourseId}/grades`);
  return { ok: true, data: { updatedCount: (data as number) ?? 0 } };
}

export async function createGradeGroupAction(
  academicCourseId: string,
  name: string,
  targetWeight: number,
  orderIndex: number
): Promise<AuthResult<{ id: string }>> {
  await requireUser();

  const parsed = GradeGroupSchema.safeParse({ name, target_weight: targetWeight });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const result = await createGradeGroup(
    academicCourseId,
    parsed.data.name,
    parsed.data.target_weight,
    orderIndex
  );
  if (!result.ok) return result;
  revalidatePath(gradesPath(academicCourseId));
  return { ok: true, data: { id: result.data.id } };
}

export async function updateGradeGroupAction(
  groupId: string,
  academicCourseId: string,
  name: string,
  targetWeight: number,
  orderIndex: number
): Promise<AuthResult> {
  await requireUser();

  const parsed = GradeGroupSchema.safeParse({ name, target_weight: targetWeight });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const result = await updateGradeGroup(groupId, {
    name: parsed.data.name,
    target_weight: parsed.data.target_weight,
    order_index: orderIndex,
  });
  if (!result.ok) return result;
  revalidatePath(gradesPath(academicCourseId));
  return { ok: true };
}

export async function deleteGradeGroupAction(
  groupId: string,
  academicCourseId: string
): Promise<AuthResult> {
  await requireUser();

  const result = await deleteGradeGroup(groupId);
  if (!result.ok) return result;
  revalidatePath(gradesPath(academicCourseId));
  return { ok: true };
}

// spec-059 D15
export async function ensureSelfAssessmentGradeItemAction(
  academicCourseId: string
): Promise<AuthResult<{ id: string }>> {
  await requireUser();

  const result = await ensureSelfAssessmentGradeItem(academicCourseId);
  if (!result.ok) return result;
  revalidatePath(gradesPath(academicCourseId));
  return { ok: true, data: result.data };
}
