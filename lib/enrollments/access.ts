import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getEnrollmentsByStudent } from "./index";

export type CourseAccess =
  | { ok: true; reason: "enrolled" | "owner" | "admin" }
  | { ok: false; reason: "unauthenticated" | "not-enrolled" | "no-course" };

export const hasCourseAccess = cache(async (courseSlug: string): Promise<CourseAccess> => {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const supabase = await createServerSupabaseClient();

  // Check if user is admin
  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (adminRole) {
    return { ok: true, reason: "admin" };
  }

  // Check if user is the course owner. Un docente puede tener varios
  // academic_courses con el mismo course_slug (distintos grupos/semestres,
  // ver spec-031) — .maybeSingle() falla con más de una fila (PGRST116) y
  // dejaba al docente sin acceso, así que solo comprobamos que exista al
  // menos una.
  const { data: ownedCourses } = await supabase
    .from("academic_courses")
    .select("id")
    .eq("course_slug", courseSlug)
    .eq("teacher_id", user.id)
    .limit(1);

  if (ownedCourses && ownedCourses.length > 0) {
    return { ok: true, reason: "owner" };
  }

  // Check if user has an active enrollment in the course
  const enrollments = await getEnrollmentsByStudent();
  const activeEnrollment = enrollments.find(
    (e) => e.academic_course?.course_slug === courseSlug && e.status === "active"
  );

  if (activeEnrollment) {
    return { ok: true, reason: "enrolled" };
  }

  return { ok: false, reason: "not-enrolled" };
});

export async function requireCourseAccess(
  courseSlug: string,
  currentPath: string = `/${courseSlug}`
): Promise<void> {
  const access = await hasCourseAccess(courseSlug);

  if (access.ok) {
    return;
  }

  if (access.reason === "unauthenticated") {
    redirect(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
  }

  if (access.reason === "not-enrolled") {
    redirect(`/cuenta/cursos?sinAcceso=${encodeURIComponent(courseSlug)}`);
  }

  if (access.reason === "no-course") {
    // This shouldn't happen if the route exists, but fallback to 404-like behavior
    redirect("/cuenta/cursos?sinAcceso=unknown");
  }
}
