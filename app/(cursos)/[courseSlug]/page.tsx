import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug, getCourseSlugs } from "@/lib/courses";
import { getCourseWelcome } from "@/lib/courses/content";
import { CourseHeader } from "@/components/courses/CourseHeader";
import { LessonList } from "@/components/courses/LessonList";
import { MdxContent } from "@/components/mdx/MdxContent";

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return slugs.map((courseSlug) => ({ courseSlug }));
}

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

  return (
    <main className="flex-1 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-12 lg:py-16">
        <CourseHeader course={course} />

        {welcome && (
          <section className="mt-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 lg:p-10">
            <MdxContent source={welcome.rawSource} />
          </section>
        )}

        <div className="mt-10">
          <LessonList courseSlug={course.slug} lessons={course.lessons} />
        </div>
      </div>
    </main>
  );
}
