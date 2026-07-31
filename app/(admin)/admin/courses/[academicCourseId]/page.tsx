import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";
import { getEnrollmentsByAcademicCourse } from "@/lib/enrollments/index";
import { EnrollmentTable } from "@/components/admin/EnrollmentTable";

export const metadata: Metadata = { title: "Estudiantes — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function AcademicCourseDetailPage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const enrollments = await getEnrollmentsByAcademicCourse(academicCourseId);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <EnrollmentTable
        enrollments={enrollments}
        academicCourseId={academicCourseId}
      />
    </div>
  );
}
