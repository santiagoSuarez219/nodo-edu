import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses";
import { requireCourseAccess } from "@/lib/enrollments";
import { getCourseProgress } from "@/lib/progress";
import { LessonSidebar } from "@/components/courses/LessonSidebar";
import { LessonSidebarMobile } from "@/components/courses/LessonSidebarMobile";

interface LessonLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export default async function LessonLayout({
  children,
  params,
}: LessonLayoutProps) {
  const { courseSlug, lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  await requireCourseAccess(courseSlug, `/${courseSlug}/${lessonSlug}`);

  const progress = await getCourseProgress(courseSlug);
  const completedLessonSlugs = new Set(
    progress
      .filter((p) => p.completed_at !== null)
      .map((p) => p.lesson_slug)
  );

  return (
    <main
      className="flex-1 w-full px-4 md:px-6 lg:px-0 py-6 lg:py-10 lg:flex-none lg:h-[calc(100dvh_-_var(--header-height,6rem))] lg:min-h-0 lg:overflow-hidden"
    >
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10 lg:h-full">
        <aside className="hidden lg:block lg:h-96 lg:overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          <LessonSidebar
            course={course}
            activeLessonSlug={lessonSlug}
            completedLessonSlugs={completedLessonSlugs}
          />
        </aside>

        <div className="min-w-0 lg:h-full lg:overflow-y-auto">
          <div className="lg:hidden mb-4">
            <LessonSidebarMobile>
              <LessonSidebar
                course={course}
                activeLessonSlug={lessonSlug}
                completedLessonSlugs={completedLessonSlugs}
              />
            </LessonSidebarMobile>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
