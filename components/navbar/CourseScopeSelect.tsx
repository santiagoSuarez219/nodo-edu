"use client";

import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AcademicCourse } from "@/lib/academic-courses/types";

export function CourseScopeSelect({
  courses,
  onNavigate,
}: {
  courses: AcademicCourse[];
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const academicCourseId = params.academicCourseId as string | undefined;
  const currentCourse = academicCourseId
    ? courses.find((c) => c.id === academicCourseId)
    : null;

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen]);

  const handleSelect = (courseId: string) => {
    const matches = pathname.match(/\/admin\/courses\/[^/]+\/([^/]+)/);
    const section = matches ? matches[1] : null;

    const newPath = section
      ? `/admin/courses/${courseId}/${section}`
      : `/admin/courses/${courseId}`;

    setIsOpen(false);
    onNavigate?.();
    router.push(newPath);
  };

  const displayText =
    courses.length === 0
      ? "Sin cursos"
      : currentCourse
        ? currentCourse.code
        : "Selecciona un curso";

  const isDisabled = courses.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Seleccionar curso académico"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
          isDisabled
            ? "text-fg-disabled dark:text-gray-600 cursor-not-allowed"
            : "text-body dark:text-gray-300 hover:bg-neutral-tertiary dark:hover:bg-gray-700"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700`}
      >
        <span className="max-w-xs truncate">{displayText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && !isDisabled && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-border-default dark:border-gray-700 bg-neutral-primary dark:bg-gray-800 shadow-lg py-1 z-50"
        >
          <div className="max-h-64 overflow-y-auto">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleSelect(course.id)}
                role="menuitem"
                aria-current={course.id === academicCourseId}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  course.id === academicCourseId
                    ? "bg-brand-soft dark:bg-blue-900 text-fg-brand-strong dark:text-blue-100 font-semibold"
                    : "text-body dark:text-gray-300 hover:bg-neutral-tertiary dark:hover:bg-gray-700"
                }`}
              >
                <div className="font-medium">{course.code}</div>
                <div className="text-xs text-body-subtle dark:text-gray-400 truncate">
                  {course.name}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border-default dark:border-gray-700 px-3 py-2">
            <Link
              href="/admin/courses/new"
              role="menuitem"
              onClick={close}
              className="text-xs text-fg-brand dark:text-blue-400 hover:underline"
            >
              Crear nuevo curso
            </Link>
          </div>
        </div>
      )}

      {isOpen && isDisabled && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-56 rounded-lg border border-border-default dark:border-gray-700 bg-neutral-primary dark:bg-gray-800 shadow-lg p-4 z-50"
        >
          <p className="text-sm text-body dark:text-gray-300 mb-3">
            No tienes cursos académicos. Crea uno para empezar.
          </p>
          <Link
            href="/admin/courses/new"
            role="menuitem"
            onClick={close}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-brand hover:bg-brand-strong dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Crear nuevo curso
          </Link>
        </div>
      )}
    </div>
  );
}
