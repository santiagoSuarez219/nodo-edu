import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getEnrollmentById } from "@/lib/enrollments/index";
import { getGradesByEnrollment } from "@/lib/grades/index";
import { EnrollmentDetail } from "@/components/account/EnrollmentDetail";

export const metadata: Metadata = { title: "Detalle de matrícula — Mis cursos" };

interface Props {
  params: Promise<{ enrollmentId: string }>;
}

export default async function EnrollmentDetailPage({ params }: Props) {
  const { enrollmentId } = await params;
  const user = await requireUser("/cuenta/cursos");

  const [enrollment, gradesData] = await Promise.all([
    getEnrollmentById(enrollmentId),
    getGradesByEnrollment(enrollmentId),
  ]);

  if (!enrollment || enrollment.student_id !== user.id) notFound();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 pt-6 pb-14 flex flex-col gap-6">
      <div>
        <Link
          href="/cuenta/cursos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mis cursos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {enrollment.academic_course.name}
        </h1>
      </div>

      <EnrollmentDetail enrollment={enrollment} gradesData={gradesData} />
    </main>
  );
}
