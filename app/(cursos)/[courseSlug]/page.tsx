import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, resolveResumeLessonSlug } from "@/lib/courses";
import { getDisabledLessonSlugs } from "@/lib/courses/availability";
import { requireCourseAccess } from "@/lib/enrollments";
import { getCourseProgress } from "@/lib/progress";

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;

  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  await requireCourseAccess(courseSlug, `/${courseSlug}`);

  const progress = await getCourseProgress(courseSlug);
  const completedLessonSlugs = new Set(
    progress.filter((p) => p.completed_at !== null).map((p) => p.lesson_slug)
  );

  // spec-039 (D6): ante un fallo de infraestructura, el redirect de
  // reanudación es navegación, no el gate real — degrada a "ninguna
  // deshabilitada" en vez de bloquear la entrada al curso.
  const disabledResult = await getDisabledLessonSlugs(courseSlug);
  const disabledLessonSlugs =
    disabledResult.status === "ok" ? disabledResult.slugs : new Set<string>();

  const resumeLessonSlug = resolveResumeLessonSlug(
    course.lessons,
    completedLessonSlugs,
    disabledLessonSlugs
  );

  if (!resumeLessonSlug) {
    notFound();
  }

  redirect(`/${courseSlug}/${resumeLessonSlug}`);
}
