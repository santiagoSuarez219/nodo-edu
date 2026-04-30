import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses";
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

  return (
    <main className="flex-1 bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-6 lg:py-10 lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
          <LessonSidebar course={course} activeLessonSlug={lessonSlug} />
        </aside>

        <div className="min-w-0">
          <div className="lg:hidden mb-4">
            <LessonSidebarMobile>
              <LessonSidebar course={course} activeLessonSlug={lessonSlug} />
            </LessonSidebarMobile>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
