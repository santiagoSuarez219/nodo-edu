import Link from "next/link";
import type { Course } from "@/lib/courses";

interface HomeCourseCardProps {
  course: Course;
}

function levelBadgeStyle(level: Course["level"]): string {
  const baseStyle = "inline-block px-3 py-1 text-xs font-semibold uppercase rounded";
  const levelStyles: Record<Course["level"], string> = {
    introductorio:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    intermedio:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    avanzado:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };
  return `${baseStyle} ${levelStyles[level]}`;
}

export function HomeCourseCard({ course }: HomeCourseCardProps) {
  return (
    <Link href={`/${course.slug}`}>
      <div className="w-full p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-200 cursor-pointer">
        <div className="mb-4">
          <span className={levelBadgeStyle(course.level)}>
            {course.level}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {course.summary}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{course.lessons.length} lecciones</span>
        </div>
      </div>
    </Link>
  );
}
