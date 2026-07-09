import Link from 'next/link';
import { LandingCourse } from '@/lib/landing/types';
import { LevelBadge } from './LevelBadge';
import { ProgressBar } from './ProgressBar';

interface CourseCardProps {
  course: LandingCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/cursos/${course.slug}`}>
      <div className="w-full p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-200 cursor-pointer">
        <div className="mb-4">
          <LevelBadge level={course.level} />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {course.description}
        </p>
        <ProgressBar
          value={course.progress}
          label="Progreso"
          className="text-xs"
        />
      </div>
    </Link>
  );
}
