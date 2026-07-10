import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/courses";
import { getCourseWelcome } from "@/lib/courses/content";
import { requireCourseAccess } from "@/lib/enrollments";
import { CourseHeader } from "@/components/courses/CourseHeader";
import { CourseSidebar } from "@/components/courses/CourseSidebar";
import { MdxContent } from "@/components/mdx/MdxContent";

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    return { title: "Curso no encontrado" };
  }

  return {
    title: `${course.title} — Semillero SITAIM`,
    description: course.summary,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;

  const [course, welcome] = await Promise.all([
    getCourseBySlug(courseSlug),
    getCourseWelcome(courseSlug),
  ]);

  if (!course) {
    notFound();
  }

  await requireCourseAccess(courseSlug);

  return (
    <main className="flex-1 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto w-full px-2 md:px-4 lg:px-24 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[3fr_1fr] lg:gap-6 xl:gap-8 lg:items-start">

          {/* Columna izquierda — información del curso */}
          <div className="min-w-0 lg:pt-12">
            <CourseHeader course={course} />

            {welcome && (
              <section className="mt-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 lg:p-10">
                <MdxContent source={welcome.rawSource} />
              </section>
            )}
          </div>

          {/* Columna derecha — índice del curso + botón */}
          <aside className="lg:pt-6 mt-10 lg:mt-0 lg:sticky lg:top-18 lg:h-[calc(100vh-7rem)]">
            <CourseSidebar courseSlug={course.slug} lessons={course.lessons} />
          </aside>

        </div>
      </div>
    </main>
  );
}
