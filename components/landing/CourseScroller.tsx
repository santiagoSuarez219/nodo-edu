import Link from 'next/link';
import { LandingCourse } from '@/lib/landing/types';
import { CourseCard } from './CourseCard';

interface CourseScrollerProps {
  courses: LandingCourse[];
}

export function CourseScroller({ courses }: CourseScrollerProps) {
  const recommendedCourses = courses.slice(0, 4);

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cursos recomendados
        </h2>
        <Link
          href="/cursos"
          className="text-blue-700 dark:text-blue-400 hover:underline font-semibold text-sm"
        >
          Ver catálogo completo →
        </Link>
      </div>

      <ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        role="list"
      >
        {recommendedCourses.map((course) => (
          <li key={course.id}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>
    </section>
  );
}
