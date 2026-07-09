import { CourseLevel } from '@/lib/landing/types';

interface LevelBadgeProps {
  level: CourseLevel;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span className="inline-block px-3 py-1 text-xs font-semibold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
      {level}
    </span>
  );
}
