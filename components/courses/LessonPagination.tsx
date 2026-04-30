import Link from "next/link";
import type { Lesson } from "@/lib/courses/types";

interface LessonPaginationProps {
  courseSlug: string;
  prev: Lesson | null;
  next: Lesson | null;
}

export function LessonPagination({
  courseSlug,
  prev,
  next,
}: LessonPaginationProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Paginación de lecciones"
      className="mt-12 grid gap-3 sm:grid-cols-2 border-t border-gray-200 dark:border-gray-700 pt-6"
    >
      {prev && prev.articleSlug ? (
        <Link
          href={`/${courseSlug}/${prev.slug}`}
          className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
        >
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Anterior
          </p>
          <p className="mt-1 font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
            {prev.title}
          </p>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {next && next.articleSlug ? (
        <Link
          href={`/${courseSlug}/${next.slug}`}
          className="group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:text-right hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
        >
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Siguiente
          </p>
          <p className="mt-1 font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
            {next.title}
          </p>
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </nav>
  );
}
