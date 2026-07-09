import { Teacher } from '@/lib/landing/types';

interface TeacherBarProps {
  teacher: Teacher;
}

export function TeacherBar({ teacher }: TeacherBarProps) {
  return (
    <>
      <section className="py-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Docente principal
      </h2>

      <div className="flex gap-6 items-start p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-700 dark:bg-blue-600 text-white text-2xl font-bold">
            {teacher.initial}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {teacher.name}
          </h3>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
            {teacher.role}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            {teacher.bio}
          </p>
        </div>
      </div>
      </section>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-8" />
    </>
  );
}
