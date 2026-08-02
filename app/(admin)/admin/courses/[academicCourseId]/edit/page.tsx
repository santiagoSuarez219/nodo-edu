import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import {
  getAcademicCourseById,
  getCourseDependencyCounts,
} from "@/lib/academic-courses/index";
import { getAllCourses } from "@/lib/courses/index";
import { AcademicCourseForm } from "@/components/admin/AcademicCourseForm";
import { CourseLifecycleActions } from "@/components/admin/CourseLifecycleActions";

export const metadata: Metadata = { title: "Editar curso — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const course = await getAcademicCourseById(academicCourseId);
  if (!course) notFound();

  const [contentCourses, dependencyCountsResult] = await Promise.all([
    getAllCourses(),
    getCourseDependencyCounts(academicCourseId),
  ]);
  const availableCourses = contentCourses.map((c) => ({ slug: c.slug, name: c.title }));

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <AcademicCourseForm course={course} availableCourses={availableCourses} />
      <CourseLifecycleActions course={course} dependencyCountsResult={dependencyCountsResult} />
    </div>
  );
}
