import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";
import { getAssignmentGroupsByAcademicCourse } from "@/lib/assignments";
import AssignmentGroupList from "@/components/admin/AssignmentGroupList";

export const metadata: Metadata = { title: "Evaluaciones — Panel docente" };

interface PageProps {
  params: Promise<{ academicCourseId: string }>;
}

export default async function AssignmentsPage({ params }: PageProps) {
  const { academicCourseId } = await params;

  await requireAnyRole(["teacher", "admin"]);
  const groups = await getAssignmentGroupsByAcademicCourse(academicCourseId);

  return (
    <div className="flex flex-col gap-6">
      <AssignmentGroupList groups={groups} courseId={academicCourseId} />
    </div>
  );
}
