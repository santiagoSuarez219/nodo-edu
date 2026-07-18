import type { Lesson, Course } from "./types";

export function isGuide(node: Lesson): boolean {
  return node.kind === "guide";
}

export function isNavigable(node: Lesson): boolean {
  return Boolean(node.articleSlug);
}

export interface OutlineNode extends Lesson {
  classIndex: number | null;
}

export function buildCourseOutline(course: Course): OutlineNode[] {
  const ordered = [...course.lessons].sort((a, b) => a.order - b.order);
  let classIndex = 0;

  return ordered.map((node) => {
    const outline: OutlineNode = { ...node, classIndex: null };
    if (!isGuide(node) && isNavigable(node)) {
      outline.classIndex = ++classIndex;
    }
    return outline;
  });
}

export function countProgressibleLessons(course: Course): Lesson[] {
  return course.lessons.filter((l) => !isGuide(l) && isNavigable(l));
}
