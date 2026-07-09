import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getEnrollmentsByStudent } from "@/lib/enrollments/index";
import { EnrollmentForm } from "@/components/account/EnrollmentForm";
import { EnrolledCourseList } from "@/components/account/EnrolledCourseList";

export const metadata: Metadata = { title: "Mis cursos — Mi cuenta" };

export default async function MisCursosPage() {
  await requireUser("/cuenta/cursos");
  const enrollments = await getEnrollmentsByStudent();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 pt-6 pb-14 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Mis cursos
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consulta tus cursos matriculados y calificaciones.
        </p>
      </div>

      <EnrollmentForm />
      <EnrolledCourseList enrollments={enrollments} />
    </main>
  );
}
