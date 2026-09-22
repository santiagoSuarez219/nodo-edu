"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { enrollByCode, withdrawStudent, reactivateEnrollment } from "./index";
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
  enrollmentId: string,
  academicCourseId: string
): Promise<void> {
  await requireUser();
  await withdrawStudent(enrollmentId);
  revalidatePath(`/admin/courses/${academicCourseId}`);
  revalidatePath("/admin/courses");
}

// spec-056 (Fase 3): reactivar desde el panel — mismo patrón que
// withdrawStudentAction, camino simétrico a "Retirar". A diferencia de
// aquella, sí se comprueba el resultado (hallazgo de @reviewer): revalidar la
// ruta tras un fallo mostraría la tabla como si la reactivación hubiera
// funcionado. El formulario que la invoca no está cableado con
// useActionState (mismo patrón que withdrawStudentAction), así que por ahora
// el fallo se registra en el log del servidor en vez de mostrarse en la UI.
export async function reactivateStudentAction(
  enrollmentId: string,
  academicCourseId: string
): Promise<void> {
  await requireUser();
  const result = await reactivateEnrollment(enrollmentId);
  if (!result.ok) {
    console.error(
      `reactivateStudentAction: no se pudo reactivar la matrícula ${enrollmentId}:`,
      result.error
    );
    return;
  }
  revalidatePath(`/admin/courses/${academicCourseId}`);
  revalidatePath("/admin/courses");
}
