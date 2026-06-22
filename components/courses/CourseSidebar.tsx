import Link from "next/link";
import type { Lesson } from "@/lib/courses/types";

interface CourseSidebarProps {
  courseSlug: string;
  lessons: Lesson[];
}

export function CourseSidebar({ courseSlug, lessons }: CourseSidebarProps) {
  const ordered = [...lessons].sort((a, b) => a.order - b.order);
  const firstLesson = ordered.find((l) => l.articleSlug);

  return (
    <div className="flex flex-col h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Encabezado */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Contenido del curso
        </p>
      </div>

      {/* Lista de sesiones — scroll interno */}
      <ol className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 list-none">
        {ordered.map((lesson) => (
          <li key={lesson.id} className="flex items-baseline gap-3 px-4 py-3">
            <span className="shrink-0 text-xs font-semibold text-blue-700 dark:text-blue-400">
              {lesson.order.toString().padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
              {lesson.title}
            </span>
            {!lesson.articleSlug && (
              <span className="ml-auto shrink-0 rounded bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                Pronto
              </span>
            )}
          </li>
        ))}
      </ol>

      {/* Botón — anclado al fondo */}
      <div className="shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        {firstLesson ? (
          <Link
            href={`/${courseSlug}/${firstLesson.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
          >
            Ir al curso
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ) : (
          <span className="flex w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-400 dark:text-gray-500">
            Contenido próximamente
          </span>
        )}
      </div>
    </div>
  );
}
