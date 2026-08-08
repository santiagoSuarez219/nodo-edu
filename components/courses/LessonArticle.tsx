import Link from "next/link";
import type { Course, Lesson } from "@/lib/courses/types";
import { isGuide } from "@/lib/courses";

interface LessonArticleProps {
  course: Course;
  lesson: Lesson;
  classIndex?: number | null;
  updatedAt?: string;
  // spec-044: presente solo para owner/admin cuando existe un apunte docente
  // para esta sección — enlaza a la ruta dedicada `/apuntes`, nunca embebido
  // en la página (mantenía la lección extremadamente larga).
  teacherNotesHref?: string | null;
  children: React.ReactNode;
}

export function LessonArticle({
  course,
  lesson,
  classIndex,
  updatedAt,
  teacherNotesHref,
  children,
}: LessonArticleProps) {
  const isGuideNode = isGuide(lesson);
  const orderLabel = classIndex ? classIndex.toString().padStart(2, "0") : null;

  return (
    <article>
      <header className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              {course.title} · {isGuideNode ? "Guía" : `Clase ${orderLabel}`}
            </p>
            <h1 className="mt-2 text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {lesson.title}
            </h1>
          </div>
          {teacherNotesHref && (
            <Link
              href={teacherNotesHref}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand dark:text-blue-300 bg-brand-softer dark:bg-blue-900/20 hover:bg-brand-soft dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Apuntes de clase
            </Link>
          )}
        </div>
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
