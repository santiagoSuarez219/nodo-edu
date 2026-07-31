import type { Metadata } from "next";
import Link from "next/link";
import { requireAnyRole } from "@/lib/auth/session";
import { getCoursesByTeacher } from "@/lib/academic-courses/index";
import { AcademicCourseList } from "@/components/admin/AcademicCourseList";

export const metadata: Metadata = { title: "Mis cursos — Panel docente" };

export default async function AdminCoursesPage() {
  const user = await requireAnyRole(["teacher", "admin"]);
  const courses = await getCoursesByTeacher(user.id);

  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Mis cursos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona tus cursos académicos y estudiantes matriculados.
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo curso
        </Link>
      </div>

      <AcademicCourseList courses={courses} />
    </div>
  );
}
