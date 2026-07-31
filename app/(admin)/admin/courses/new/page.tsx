import type { Metadata } from "next";
import Link from "next/link";
import { requireAnyRole } from "@/lib/auth/session";
import { AcademicCourseForm } from "@/components/admin/AcademicCourseForm";

export const metadata: Metadata = { title: "Nuevo curso — Panel docente" };

export default async function NewCoursePage() {
  await requireAnyRole(["teacher", "admin"]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis cursos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Nuevo curso
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Crea una instancia académica para matricular estudiantes.
        </p>
      </div>

      <AcademicCourseForm />
    </div>
  );
}
