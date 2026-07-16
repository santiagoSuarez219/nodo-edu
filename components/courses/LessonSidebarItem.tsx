"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lesson } from "@/lib/courses/types";

interface LessonSidebarItemProps {
  courseSlug: string;
  lesson: Lesson;
  isActive: boolean;
  defaultExpanded?: boolean;
  isCompleted?: boolean;
}

export function LessonSidebarItem({
  courseSlug,
  lesson,
  isActive,
  defaultExpanded = false,
  isCompleted = false,
}: LessonSidebarItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = `lesson-${courseSlug}-${lesson.slug}-topics`;
  const hasArticle = Boolean(lesson.articleSlug);
  const orderLabel = lesson.order.toString().padStart(2, "0");

  const linkClass = `flex-1 min-w-0 truncate text-left ${
    isActive
      ? "text-blue-700 dark:text-blue-300 font-semibold"
      : hasArticle
        ? "text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400"
        : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
  }`;

  return (
    <li
      className={`rounded-md ${
        isActive ? "bg-blue-50 dark:bg-blue-900/30" : ""
      }`}
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        <span className="shrink-0 text-xs font-mono text-gray-500 dark:text-gray-400 w-7">
          {orderLabel}
        </span>
        {hasArticle ? (
          <Link
            href={`/${courseSlug}/${lesson.slug}`}
            aria-current={isActive ? "page" : undefined}
            className={linkClass}
          >
            {lesson.title}
          </Link>
        ) : (
          <span aria-disabled className={linkClass} title="Próximamente">
            {lesson.title}
          </span>
        )}
        {isCompleted && (
          <svg className="w-4 h-4 text-green-700 dark:text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {lesson.topics.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={expanded ? "Ocultar temas" : "Mostrar temas"}
            className="shrink-0 p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`size-4 transition-transform duration-200 ${
                expanded ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        )}
      </div>
      {expanded && lesson.topics.length > 0 && (
        <ul
          id={panelId}
          className="ml-9 mb-2 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3"
        >
          {lesson.topics.map((topic, idx) => (
            <li
              key={`${idx}-${topic.title}`}
              className="text-sm text-gray-600 dark:text-gray-400 py-0.5"
            >
              {topic.title}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
