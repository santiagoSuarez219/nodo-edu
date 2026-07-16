import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { getAcademicCourseById } from "@/lib/academic-courses/index";
import { getEnrollmentsByAcademicCourse } from "@/lib/enrollments/index";
import { EnrollmentTable } from "@/components/admin/EnrollmentTable";

export const metadata: Metadata = { title: "Detalle de curso — Panel docente" };

const DAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
};

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function AcademicCourseDetailPage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const [course, enrollments] = await Promise.all([
    getAcademicCourseById(academicCourseId),
    getEnrollmentsByAcademicCourse(academicCourseId),
  ]);

  if (!course) notFound();

  const days = course.class_days.map((d) => DAY_LABELS[d] ?? d).join(", ");
  const timeStart = course.class_time_start.slice(0, 5);
  const timeEnd = course.class_time_end.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Mis cursos
      </Link>

      {/* Header del curso */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                {course.name}
              </h1>
              {course.is_active ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Inactivo
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Código:</span>{" "}
                <span className="font-mono">{course.code}</span>
              </span>
              <span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Horario:</span>{" "}
                {days} · {timeStart}–{timeEnd}
              </span>
              <span>
                <span className="font-medium text-gray-700 dark:text-gray-300">Matrícula:</span>{" "}
                <span className="font-mono tracking-widest">{course.enrollment_code}</span>
              </span>
            </div>
          </div>
          <Link
            href={`/admin/courses/${academicCourseId}/edit`}
            className="shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Editar curso
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <span className="px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400">
          Estudiantes
        </span>
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
      </div>

      {/* Tabla de estudiantes */}
      <EnrollmentTable
        enrollments={enrollments}
        academicCourseId={academicCourseId}
      />
    </div>
  );
}
