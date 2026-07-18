"use server";

import { publishAssignmentGroup } from "./index";

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
