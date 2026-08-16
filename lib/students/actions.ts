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
// cliente de SESIÓN, en dos pasos:
//
// 1. ¿Quien invoca es dueño de `academicCourseId` (o admin)? Se consulta
//    `academic_courses` por su id — la policy "academic_courses: select own
//    or admin" (`teacher_id = auth.uid() OR has_role(admin)`) es la única
//    autorización real aquí.
// 2. ¿`studentId` está matriculado en ESE curso? Se consulta `enrollments`.
//
// Revisión de código (2026-08-16, @reviewer): la versión anterior solo hacía
// el paso 2, confiando en que la policy "enrollments: select" ya implicaba
// "docente dueño o admin" — falso: esa policy tiene una TERCERA rama,
// `student_id = auth.uid()`, que aprueba también al propio estudiante. Un
// estudiante autenticado invocando esta acción con su propio `studentId` y el
// `academicCourseId` de un curso en el que está matriculado pasaba el gate y
// se restablecía su propia contraseña sin conocer la actual — exactamente el
// escenario que D4 existe para impedir. El paso 1 cierra el hueco: un
// estudiante nunca tiene fila propia en `academic_courses` (no es
// `teacher_id` de nada), así que ningún estudiante puede pasar de ahí, sin
// importar qué `studentId` use.
export async function resetStudentPasswordAction(
  studentId: string,
  academicCourseId: string
): Promise<AuthResult<ResetStudentPasswordResult>> {
  await requireUser();

  const supabase = await createServerSupabaseClient();

  const { data: course, error: courseError } = await supabase
    .from("academic_courses")
    .select("id")
    .eq("id", academicCourseId)
    .maybeSingle();

  if (courseError || !course) {
    return { ok: false, error: "No tienes acceso a este curso." };
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("academic_course_id", academicCourseId)
    .maybeSingle();

  if (enrollmentError || !enrollment) {
    return { ok: false, error: "Este estudiante no está matriculado en este curso." };
  }

  const result = await resetServiceStudentPassword(studentId);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/admin/courses/${academicCourseId}`);
  return { ok: true, data: result.result };
}
