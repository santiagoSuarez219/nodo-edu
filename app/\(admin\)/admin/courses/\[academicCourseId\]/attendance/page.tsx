import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireAnyRole } from '@/lib/auth/session';
import { getAcademicCourseById } from '@/lib/academic-courses/index';
import { getOpenSessionForCourse } from '@/lib/attendance';
import { AdminAttendancePanel } from '@/components/admin/AdminAttendancePanel';

export const metadata: Metadata = { title: 'Asistencia — Panel docente' };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function AttendancePage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(['teacher', 'admin']);

  const course = await getAcademicCourseById(academicCourseId);
  if (!course) notFound();

  const openSession = await getOpenSessionForCourse(academicCourseId);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href={`/admin/courses/${academicCourseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {course.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Asistencia
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Gestiona las sesiones de asistencia del curso.
        </p>
      </div>

      {/* Panel */}
      <AdminAttendancePanel
        academicCourseId={academicCourseId}
        initialSession={openSession}
      />
    </div>
  );
}
