import Link from "next/link";
import type { Course } from "@/lib/courses/types";
import { LessonSidebarItem } from "./LessonSidebarItem";

interface LessonSidebarProps {
  course: Course;
  activeLessonSlug: string;
  completedLessonSlugs?: Set<string>;
}

export function LessonSidebar({
  course,
  activeLessonSlug,
  completedLessonSlugs = new Set(),
}: LessonSidebarProps) {
  const ordered = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <nav
      aria-label="Lecciones del curso"
      className="flex flex-col gap-3 text-sm"
    >
      <div className="px-2">
        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Curso
        </p>
        <Link
          href={`/${course.slug}`}
          className="mt-1 block font-semibold text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400"
        >
          {course.title}
        </Link>
      </div>
      <ol className="list-none space-y-0.5">
        {ordered.map((lesson) => (
          <LessonSidebarItem
            key={lesson.id}
            courseSlug={course.slug}
            lesson={lesson}
            isActive={lesson.slug === activeLessonSlug}
            defaultExpanded={lesson.slug === activeLessonSlug}
            isCompleted={completedLessonSlugs.has(lesson.slug)}
          />
        ))}
      </ol>
    </nav>
  );
}
