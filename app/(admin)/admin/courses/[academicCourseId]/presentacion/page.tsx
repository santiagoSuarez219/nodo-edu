import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { getAcademicCourseById } from "@/lib/academic-courses/index";

export const metadata: Metadata = { title: "Presentación del curso — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function CoursePresentationPage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const course = await getAcademicCourseById(academicCourseId);
  if (!course) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href={`/admin/courses/${academicCourseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {course.name}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Presentación del curso
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Información introductoria que verán los estudiantes matriculados.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <Link
          href={`/admin/courses/${academicCourseId}`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Estudiantes
        </Link>
        <Link
          href={`/admin/courses/${academicCourseId}/grades`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Calificaciones
        </Link>
        <Link
          href={`/admin/courses/${academicCourseId}/attendance`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Asistencia
        </Link>
        <span className="px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400">
          Presentación del curso
        </span>
        <Link
          href={`/admin/courses/${academicCourseId}/contenido`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Contenido del curso
        </Link>
      </div>

      {/* Placeholder */}
      <div className="rounded-[var(--radius-base)] border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 py-16 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Próximamente
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aquí podrás editar la presentación del curso que verán los estudiantes.
        </p>
      </div>
    </div>
  );
}
