import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { getAcademicCourseById } from "@/lib/academic-courses/index";
import { getGradeItemsByCourse } from "@/lib/grades/index";
import { getGradesByCourse } from "@/lib/grades/index";
import { GradeItemsPanel } from "@/components/admin/GradeItemsPanel";
import { GradesTable } from "@/components/admin/GradesTable";

export const metadata: Metadata = { title: "Calificaciones — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function GradesPage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const course = await getAcademicCourseById(academicCourseId);
  if (!course) notFound();

  const [gradeItems, courseGrades] = await Promise.all([
    getGradeItemsByCourse(academicCourseId),
    getGradesByCourse(academicCourseId),
  ]);

  const activeRows = courseGrades.filter((r) => r.enrollment_status === "active");

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
          Calificaciones
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona los ítems de evaluación y registra notas por estudiante.
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
        <span className="px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400">
          Calificaciones
        </span>
      </div>

      <GradeItemsPanel
        academicCourseId={academicCourseId}
        initialItems={gradeItems}
      />

      <GradesTable
        academicCourseId={academicCourseId}
        gradeItems={gradeItems}
        rows={activeRows}
      />
    </div>
  );
}
