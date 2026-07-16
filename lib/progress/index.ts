"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/session";
import { hasCourseAccess } from "@/lib/enrollments/access";
import type { LessonProgress } from "./types";

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
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false }
  );

  revalidatePath(`/${courseSlug}/${lessonSlug}`);
  revalidatePath("/cuenta/cursos");
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

export interface CourseProgressSummary {
  completed: number;
  total: number;
}

export async function getCourseProgressSummary(
  courseSlug: string
): Promise<CourseProgressSummary> {
  const user = await getCurrentUser();
  if (!user) return { completed: 0, total: 0 };

  const supabase = await createServerSupabaseClient();
  const { data: lessons } = await supabase
    .from("lesson_progress")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug);

  if (!lessons) return { completed: 0, total: 0 };

  const completed = lessons.filter((l) => l.completed_at !== null).length;
  const total = lessons.length;

  return { completed, total };
}
