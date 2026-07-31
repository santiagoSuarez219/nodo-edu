import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { getAcademicCourseById } from "@/lib/academic-courses/index";
import { CourseHeader } from "@/components/admin/CourseHeader";
import { CourseTabs } from "@/components/admin/CourseTabs";

interface Props {
  params: Promise<{ academicCourseId: string }>;
  children: React.ReactNode;
}

export default async function AcademicCourseLayout({ params, children }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const course = await getAcademicCourseById(academicCourseId);
  if (!course) notFound();

  return (
    <div className="flex flex-col gap-6">
      <CourseHeader course={course} />
      <CourseTabs academicCourseId={academicCourseId} />
      {children}
    </div>
  );
}
