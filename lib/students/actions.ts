"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { UpdateProfileSchema } from "@/lib/auth/schemas";
import { resetServiceStudentPassword } from "./service";
import type { AuthResult } from "@/lib/auth/types";
import type { ResetStudentPasswordResult } from "./types";

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
    github_username: formData.get("github_username") || undefined,
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
    .update({
      full_name: parsed.data.full_name,
      github_username: parsed.data.github_username,
    })
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

// spec-051 (Fase 3): restablece la contraseña de un estudiante desde la lista
// de matriculados del docente (EnrollmentTable). `resetServiceStudentPassword`
// corre con service_role y NO comprueba propiedad — se verifica aquí, con el
// cliente de SESIÓN, reutilizando exactamente la policy "enrollments: select"
// (docente dueño del curso o admin): si esta consulta no devuelve fila, quien
// invoca no tiene autoridad sobre este estudiante en este curso, sin importar
// qué studentId le hayan pasado a la acción. Mismo patrón que D1 de spec-052
// para la pestaña de asistencia — dejar que RLS haga la autorización en vez
// de reimplementar la regla en código.
export async function resetStudentPasswordAction(
  studentId: string,
  academicCourseId: string
): Promise<AuthResult<ResetStudentPasswordResult>> {
  await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data: authorized } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("academic_course_id", academicCourseId)
    .maybeSingle();

  if (!authorized) {
    return { ok: false, error: "No tienes acceso a este estudiante." };
  }

  const result = await resetServiceStudentPassword(studentId);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/admin/courses/${academicCourseId}`);
  return { ok: true, data: result.result };
}
