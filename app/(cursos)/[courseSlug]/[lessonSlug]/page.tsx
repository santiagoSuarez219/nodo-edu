import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonBySlug } from "@/lib/courses";
import { getLessonArticle } from "@/lib/courses/content";
import { requireCourseAccess } from "@/lib/enrollments";
import { hasCourseAccess } from "@/lib/enrollments/access";
import { markLessonViewed, getLessonProgress } from "@/lib/progress";
import { LessonArticle } from "@/components/courses/LessonArticle";
import { LessonPagination } from "@/components/courses/LessonPagination";
import { LessonClosure } from "@/components/courses/LessonClosure";
import { MdxContent } from "@/components/mdx/MdxContent";
import { TopicList } from "@/components/courses/TopicList";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const ctx = await getLessonBySlug(courseSlug, lessonSlug);
  if (!ctx) return { title: "Lección no encontrada" };
  return {
    title: `${ctx.lesson.title} — ${ctx.course.title}`,
    description: ctx.lesson.summary ?? ctx.course.summary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const ctx = await getLessonBySlug(courseSlug, lessonSlug);
  if (!ctx) notFound();

  await requireCourseAccess(courseSlug, `/${courseSlug}/${lessonSlug}`);

  await markLessonViewed(courseSlug, lessonSlug);
  const access = await hasCourseAccess(courseSlug);
  const progress = await getLessonProgress(courseSlug, lessonSlug);

  const { course, lesson, prev, next } = ctx;
  const article = lesson.articleSlug
    ? await getLessonArticle(course.slug, lesson.articleSlug)
    : null;

  return (
    <>
      <LessonArticle
        course={course}
        lesson={lesson}
        updatedAt={article?.frontmatter.updatedAt}
      >
        {article ? (
          <MdxContent source={article.rawSource} />
        ) : (
          <PreparationPlaceholder
            hasTopics={lesson.topics.length > 0}
            topics={lesson.topics}
          />
        )}
      </LessonArticle>
      <LessonPagination courseSlug={course.slug} prev={prev} next={next} />
      {access.ok && access.reason === "enrolled" && (
        <LessonClosure
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          initialCompletedAt={progress?.completed_at ?? null}
        />
      )}
    </>
  );
}

function PreparationPlaceholder({
  hasTopics,
  topics,
}: {
  hasTopics: boolean;
  topics: import("@/lib/courses/types").Topic[];
}) {
  return (
    <div>
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Apuntes en preparación
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Los apuntes de esta clase aún no están publicados. Vuelve pronto.
        </p>
      </div>
      {hasTopics && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Temas previstos
          </h2>
          <TopicList topics={topics} />
        </section>
      )}
    </div>
  );
}
