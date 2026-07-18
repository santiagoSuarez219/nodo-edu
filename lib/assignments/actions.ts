"use server";

import { publishAssignmentGroup, getAllocations } from "./index";

export async function publishAssignmentGroupAction(
  groupId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    return await publishAssignmentGroup(groupId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { ok: false, error: message };
  }
}

export async function getVariantAllocationsAction(
  groupId: string
): Promise<
  Array<{
    enrollment_id: string;
    assignment_id: string;
    variant_label: string;
    allocated_at: string;
    student_name?: string;
  }>
> {
  try {
    return await getAllocations(groupId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al obtener asignaciones";
    console.error(message);
    return [];
  }
}
