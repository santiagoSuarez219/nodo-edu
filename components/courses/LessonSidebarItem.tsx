"use client";

import Link from "next/link";
import { useState } from "react";
import type { Lesson } from "@/lib/courses/types";

function isGuide(node: Lesson): boolean {
  return node.kind === "guide";
}

function isNavigable(node: Lesson): boolean {
  return Boolean(node.articleSlug);
}

interface LessonSidebarItemProps {
  courseSlug: string;
  lesson: Lesson;
  classIndex: number | null;
  isActive: boolean;
  defaultExpanded?: boolean;
  isCompleted?: boolean;
}

export function LessonSidebarItem({
  courseSlug,
  lesson,
  classIndex,
  isActive,
  defaultExpanded = false,
  isCompleted = false,
}: LessonSidebarItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = `lesson-${courseSlug}-${lesson.slug}-topics`;
  const isNav = isNavigable(lesson);
  const isGuideNode = isGuide(lesson);
  const orderLabel = classIndex ? classIndex.toString().padStart(2, "0") : null;

  const linkClass = `flex-1 min-w-0 truncate text-left ${
    isActive
      ? "text-blue-700 dark:text-blue-300 font-semibold"
      : isNav
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
        <div className="shrink-0 w-7 flex items-center justify-center">
          {isGuideNode ? (
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          ) : (
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {orderLabel}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          {isNav ? (
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
          {isGuideNode && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Guía</span>
          )}
        </div>
        {isCompleted && (
          <svg className="w-4 h-4 text-success shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
