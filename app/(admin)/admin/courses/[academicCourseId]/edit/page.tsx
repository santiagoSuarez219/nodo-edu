import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { getAcademicCourseById } from "@/lib/academic-courses/index";
import { AcademicCourseForm } from "@/components/admin/AcademicCourseForm";

export const metadata: Metadata = { title: "Editar curso — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const course = await getAcademicCourseById(academicCourseId);
  if (!course) notFound();

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <AcademicCourseForm course={course} />
    </div>
  );
}
