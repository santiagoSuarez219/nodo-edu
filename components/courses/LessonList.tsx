import type { Lesson } from "@/lib/courses/types";
import { LessonCard } from "./LessonCard";

interface LessonListProps {
  lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
  const ordered = [...lessons].sort((a, b) => a.order - b.order);

  if (ordered.length === 0) {
    return (
      <p className="mt-8 text-sm text-gray-600 dark:text-gray-300">
        Aún no hay clases publicadas para este curso.
      </p>
    );
  }

  return (
    <ol className="mt-8 grid gap-4 list-none">
      {ordered.map((lesson) => (
        <li key={lesson.id}>
          <LessonCard lesson={lesson} />
        </li>
      ))}
    </ol>
  );
}
