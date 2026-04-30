import type { Course, Lesson } from "@/lib/courses/types";

interface LessonArticleProps {
  course: Course;
  lesson: Lesson;
  updatedAt?: string;
  children: React.ReactNode;
}

export function LessonArticle({
  course,
  lesson,
  updatedAt,
  children,
}: LessonArticleProps) {
  const orderLabel = lesson.order.toString().padStart(2, "0");

  return (
    <article>
      <header className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
          {course.title} · Clase {orderLabel}
        </p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
            {lesson.summary}
          </p>
        )}
        {updatedAt && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Actualizado el {updatedAt}
          </p>
        )}
      </header>
      {children}
    </article>
  );
}
