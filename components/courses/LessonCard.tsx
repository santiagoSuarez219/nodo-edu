import Link from "next/link";
import type { Lesson } from "@/lib/courses/types";
import { TopicList } from "./TopicList";

interface LessonCardProps {
  courseSlug: string;
  lesson: Lesson;
}

export function LessonCard({ courseSlug, lesson }: LessonCardProps) {
  const hasArticle = Boolean(lesson.articleSlug);

  const cardClass = `block rounded-lg border p-6 shadow-sm transition-colors ${
    hasArticle
      ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-700"
      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60"
  }`;

  const inner = (
    <>
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
          Clase {lesson.order.toString().padStart(2, "0")}
        </span>
        {lesson.durationMinutes && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lesson.durationMinutes} min
          </span>
        )}
        {!hasArticle && (
          <span className="ml-auto inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Próximamente
          </span>
        )}
      </div>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {lesson.title}
      </h2>
      {lesson.summary && (
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {lesson.summary}
        </p>
      )}
      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Temas
      </h3>
      <TopicList topics={lesson.topics} />
    </>
  );

  if (hasArticle) {
    return (
      <Link href={`/${courseSlug}/${lesson.slug}`} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return <article className={cardClass}>{inner}</article>;
}
