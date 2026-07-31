"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  academicCourseId: string;
}

export function CourseTabs({ academicCourseId }: Props) {
  const pathname = usePathname();

  const isActive = (segment: string | null) => {
    if (segment === null) {
      return pathname === `/admin/courses/${academicCourseId}`;
    }
    const base = `/admin/courses/${academicCourseId}/${segment}`;
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
      <Link
        href={`/admin/courses/${academicCourseId}`}
        aria-current={isActive(null) ? "page" : undefined}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          isActive(null)
            ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 font-semibold"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        Estudiantes
      </Link>
      <Link
        href={`/admin/courses/${academicCourseId}/grades`}
        aria-current={isActive("grades") ? "page" : undefined}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          isActive("grades")
            ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 font-semibold"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        Calificaciones
      </Link>
      <Link
        href={`/admin/courses/${academicCourseId}/assignments`}
        aria-current={isActive("assignments") ? "page" : undefined}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          isActive("assignments")
            ? "text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 font-semibold"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        Evaluaciones
      </Link>
    </div>
  );
}
