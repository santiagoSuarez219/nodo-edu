"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getAllCourses } from "@/lib/courses/index";
import { AcademicCourseSchema, type AcademicCourseSchemaInput } from "./schemas";
import {
  createAcademicCourse,
  updateAcademicCourse,
  getAcademicCourseById,
  deactivateAcademicCourse,
  reactivateAcademicCourse,
  deleteAcademicCourse,
} from "./index";
import type { AuthResult } from "@/lib/auth/types";

// D3 de spec-036: el <select> del formulario evita el typo, pero la barrera
// real es esta validación de servidor contra la lista real de contenido.
async function validateCourseSlug(
  slug: string,
  currentSlugForEdit?: string | null
): Promise<string[] | null> {
  if (!slug) return null; // "— Sin vincular —" siempre es válido
  const courses = await getAllCourses();
  if (courses.some((c) => c.slug === slug)) return null;
  // D2: el slug "fantasma" ya persistido para este curso se acepta aunque no
  // exista, para no impedir guardar otros cambios sin tocar el campo.
  if (currentSlugForEdit && slug === currentSlugForEdit) return null;
  return ["No corresponde a ningún curso de contenido existente."];
}

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

  const slugErrors = await validateCourseSlug(parsed.data.course_slug || "");
  if (slugErrors) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: { course_slug: slugErrors },
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

  const existing = await getAcademicCourseById(courseId);
  const slugErrors = await validateCourseSlug(
    parsed.data.course_slug || "",
    existing?.course_slug
  );
  if (slugErrors) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: { course_slug: slugErrors },
    };
  }

  const updated = await updateAcademicCourse(courseId, {
    ...parsed.data,
    enrollment_code: parsed.data.enrollment_code || undefined,
    // Fix del bug de desvinculado (ver spec-036, Contexto): "" debe traducirse
    // a null explícito, no a undefined, o Supabase omite la columna del UPDATE
    // y el slug anterior sobrevive en silencio.
    course_slug: parsed.data.course_slug === "" ? null : parsed.data.course_slug,
  });

  if (!updated) return { ok: false, error: "No se pudo actualizar el curso." };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  return { ok: true };
}

// D5 de spec-036: las tres actions de ciclo de vida devuelven AuthResult y no
// redirigen — la navegación (o el permanecer en la página) la decide el
// client component según D8. deactivateCourseAction cambia de firma respecto
// de su versión anterior (Promise<void> + redirect incondicional); es seguro
// porque no tiene ningún consumidor hoy.

export async function deactivateCourseAction(courseId: string): Promise<AuthResult> {
  await requireUser();
  const result = await deactivateAcademicCourse(courseId);
  if (!result.ok) return result;
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  return { ok: true };
}

export async function reactivateCourseAction(courseId: string): Promise<AuthResult> {
  await requireUser();
  const result = await reactivateAcademicCourse(courseId);
  if (!result.ok) return result;
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/admin/courses");
  return { ok: true };
}

export async function deleteCourseAction(courseId: string): Promise<AuthResult> {
  await requireUser();
  const result = await deleteAcademicCourse(courseId);
  if (!result.ok) return result;
  revalidatePath("/admin/courses");
  return { ok: true };
}
