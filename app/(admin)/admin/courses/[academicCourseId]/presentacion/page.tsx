import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { getAcademicCourseById } from "@/lib/academic-courses/index";
import { getCoursePresentationBySlug } from "@/lib/course-presentations";
import { CoursePresentation } from "@/components/course-presentations/CoursePresentation";

export const metadata: Metadata = {
  title: "Presentación del curso — Panel docente",
};

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function CoursePresentationPage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const course = await getAcademicCourseById(academicCourseId);
  if (!course) notFound();

  let presentation = null;
  if (course.course_slug) {
    presentation = await getCoursePresentationBySlug(course.course_slug);
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
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

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Presentación del curso
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Vista previa de la presentación para estudiantes (lectura).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <Link
          href={`/admin/courses/${academicCourseId}`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
        >
          Estudiantes
        </Link>
        <Link
          href={`/admin/courses/${academicCourseId}/grades`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
        >
          Calificaciones
        </Link>
        <Link
          href={`/admin/courses/${academicCourseId}/attendance`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
        >
          Asistencia
        </Link>
        <span className="px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 whitespace-nowrap">
          Presentación del curso
        </span>
        <Link
          href={`/admin/courses/${academicCourseId}/contenido`}
          className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
        >
          Contenido del curso
        </Link>
      </div>

      {/* Content */}
      {presentation ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <CoursePresentation
            presentation={presentation}
            cta={
              <button
                disabled
                aria-disabled
                className="w-full lg:w-auto px-4 py-2.5 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-lg cursor-not-allowed opacity-60"
              >
                Matricular este curso (vista previa)
              </button>
            }
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            No hay presentación asociada
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {course.course_slug
              ? "El curso está vinculado a un contenido sin presentación."
              : "Este curso aún no está vinculado a un contenido."}
          </p>
        </div>
      )}
    </div>
  );
}
