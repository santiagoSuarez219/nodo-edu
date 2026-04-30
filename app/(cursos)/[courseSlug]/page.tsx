import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug, getCourseSlugs } from "@/lib/courses";
import { CourseHeader } from "@/components/courses/CourseHeader";
import { LessonList } from "@/components/courses/LessonList";

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
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  return (
    <main className="flex-1 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-12 lg:py-16">
        <CourseHeader course={course} />
        <LessonList courseSlug={course.slug} lessons={course.lessons} />
      </div>
    </main>
  );
}
