import type { Lesson } from "@/lib/courses/types";
import { TopicList } from "./TopicList";

interface LessonCardProps {
  lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
  return (
    <article
      aria-disabled={!lesson.articleSlug}
      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors"
    >
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
          Clase {lesson.order.toString().padStart(2, "0")}
        </span>
        {lesson.durationMinutes && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lesson.durationMinutes} min
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
    </article>
  );
}
