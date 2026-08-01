"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasCourseAccess } from "@/lib/enrollments/access";
import { getSelfAssessmentStatus } from "@/lib/self-assessment";
import type { LessonProgress, MarkLessonCompletedResult } from "./types";

export async function getLessonProgress(
  courseSlug: string,
  lessonSlug: string
): Promise<LessonProgress | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .eq("lesson_slug", lessonSlug)
    .single();

  return data ?? null;
}

export async function getCourseProgress(
  courseSlug: string
): Promise<LessonProgress[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .order("viewed_at", { ascending: true });

  return data ?? [];
}

export async function markLessonViewed(
  courseSlug: string,
  lessonSlug: string
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      viewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false }
  );
}

export async function markLessonCompleted(
  courseSlug: string,
  lessonSlug: string
): Promise<MarkLessonCompletedResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, reason: "not_authenticated" };
  }

  const access = await hasCourseAccess(courseSlug);
  if (!access.ok || access.reason !== "enrolled") {
    return { ok: false, reason: "not_enrolled" };
  }

  const status = await getSelfAssessmentStatus(courseSlug, lessonSlug);
  // Fallar cerrado (D8 de spec-037): no se pudo verificar si esta lección
  // requiere autoevaluación, así que se deniega en vez de asumir que no la
  // requiere.
  if (status.status === "unavailable") {
    return { ok: false, reason: "self_assessment_unavailable" };
  }
  if (status.requiresAttempt && !status.hasAttempt) {
    return { ok: false, reason: "self_assessment_pending" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false }
  );

  // Antes este error se descartaba por completo y la función reportaba éxito
  // aunque la escritura nunca ocurriera (DEBT-037, Frente 4).
  if (error) {
    console.error("Error marking lesson completed:", error);
    return { ok: false, reason: "save_failed" };
  }

  revalidatePath(`/${courseSlug}/${lessonSlug}`);
  revalidatePath("/cuenta/cursos");

  return { ok: true };
}

export async function markLessonUncompleted(
  courseSlug: string,
  lessonSlug: string
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const access = await hasCourseAccess(courseSlug);
  if (!access.ok || access.reason !== "enrolled") return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      completed_at: null,
    },
    { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false }
  );

  revalidatePath(`/${courseSlug}/${lessonSlug}`);
  revalidatePath("/cuenta/cursos");
}
