"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { AcademicCourseSchema, type AcademicCourseSchemaInput } from "./schemas";
import {
  createAcademicCourse,
  updateAcademicCourse,
  deactivateAcademicCourse,
} from "./index";
import type { AuthResult } from "@/lib/auth/types";

export async function createCourseAction(
  data: AcademicCourseSchemaInput
): Promise<AuthResult<{ id: string }>> {
  const user = await requireUser();

  const parsed = AcademicCourseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const course = await createAcademicCourse({
      ...parsed.data,
      enrollment_code: parsed.data.enrollment_code || "",
      course_slug: parsed.data.course_slug || null,
      teacher_id: user.id,
    });
    revalidatePath("/admin/courses");
    return { ok: true, data: { id: course.id } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al crear el curso.";
    if (message.includes("unique") || message.includes("duplicate")) {
      return {
        ok: false,
        error: "El código de matrícula ya existe. Genera uno diferente.",
        fieldErrors: { enrollment_code: ["Ya existe este código."] },
      };
    }
    return { ok: false, error: message };
  }
}

export async function updateCourseAction(
  courseId: string,
  data: AcademicCourseSchemaInput
): Promise<AuthResult> {
  await requireUser();

  const parsed = AcademicCourseSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const updated = await updateAcademicCourse(courseId, {
    ...parsed.data,
    enrollment_code: parsed.data.enrollment_code || undefined,
    course_slug: parsed.data.course_slug || undefined,
  });

  if (!updated) return { ok: false, error: "No se pudo actualizar el curso." };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  return { ok: true };
}

export async function deactivateCourseAction(courseId: string): Promise<void> {
  await requireUser();
  await deactivateAcademicCourse(courseId);
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}
