import { notFound, redirect } from "next/navigation";
import { getCourseBySlug, resolveResumeLessonSlug } from "@/lib/courses";
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

  const resumeLessonSlug = resolveResumeLessonSlug(
    course.lessons,
    completedLessonSlugs
  );

  if (!resumeLessonSlug) {
    notFound();
  }

  redirect(`/${courseSlug}/${resumeLessonSlug}`);
}
