import Link from "next/link";
import type { Course } from "@/lib/courses/types";
import { LessonSidebarItem } from "./LessonSidebarItem";
import { CourseProgressBar } from "./CourseProgressBar";
import { countProgressibleLessons, buildCourseOutline } from "@/lib/courses";

interface LessonSidebarProps {
  course: Course;
  activeLessonSlug: string;
  completedLessonSlugs?: Set<string>;
  disabledLessonSlugs?: Set<string>;
}

export function LessonSidebar({
  course,
  activeLessonSlug,
  completedLessonSlugs = new Set(),
  disabledLessonSlugs = new Set(),
}: LessonSidebarProps) {
  const outline = buildCourseOutline(course, disabledLessonSlugs);
  // spec-039 (D5): las lecciones deshabilitadas salen del numerador y del
  // denominador — `countProgressibleLessons` ya las excluye, así que el
  // filtro de abajo nunca las cuenta como completadas.
  const progressibleLessons = countProgressibleLessons(course, disabledLessonSlugs);
  const total = progressibleLessons.length;
  const completed = progressibleLessons.filter((l) =>
    completedLessonSlugs.has(l.slug)
  ).length;

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
      <CourseProgressBar completed={completed} total={total} />
      <ol className="list-none space-y-0.5">
        {outline.map((node) => (
          <LessonSidebarItem
            key={node.id}
            courseSlug={course.slug}
            lesson={node}
            classIndex={node.classIndex}
            isActive={node.slug === activeLessonSlug}
            defaultExpanded={node.slug === activeLessonSlug}
            isCompleted={node.kind !== "guide" && completedLessonSlugs.has(node.slug)}
            isDisabled={node.isDisabled}
          />
        ))}
      </ol>
    </nav>
  );
}
