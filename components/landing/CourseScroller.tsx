import Link from 'next/link';
import { LandingCourse } from '@/lib/landing/types';
import { CourseCard } from './CourseCard';

interface CourseScrollerProps {
  courses: LandingCourse[];
}

export function CourseScroller({ courses }: CourseScrollerProps) {
  return (
    <>
      <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tus cursos
        </h2>
        <Link
          href="/cursos"
          className="text-blue-700 dark:text-blue-400 hover:underline font-semibold text-sm"
        >
          Ver catálogo completo →
        </Link>
      </div>

      <ul
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
        role="list"
      >
        {courses.map((course) => (
          <li key={course.id} className="snap-start">
            <CourseCard course={course} />
          </li>
        ))}
      </ul>
      </section>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-8" />
    </>
  );
}
