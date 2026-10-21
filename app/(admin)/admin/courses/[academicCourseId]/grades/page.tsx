import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";
import { getGradeItemsByCourse, getGradeGroupsByCourse, getGradesByCourse } from "@/lib/grades/index";
import { GradeItemsPanel } from "@/components/admin/GradeItemsPanel";
import { GradesTable } from "@/components/admin/GradesTable";
import { RecalculateSelfAssessmentButton } from "@/components/admin/RecalculateSelfAssessmentButton";

export const metadata: Metadata = { title: "Calificaciones — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function GradesPage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const [gradeItems, gradeGroups, courseGrades] = await Promise.all([
    getGradeItemsByCourse(academicCourseId),
    getGradeGroupsByCourse(academicCourseId),
    getGradesByCourse(academicCourseId),
  ]);

  const activeRows = courseGrades.filter((r) => r.enrollment_status === "active");

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <GradeItemsPanel
        academicCourseId={academicCourseId}
        initialItems={gradeItems}
        initialGroups={gradeGroups}
      />

      <RecalculateSelfAssessmentButton academicCourseId={academicCourseId} />

      <GradesTable
        academicCourseId={academicCourseId}
        gradeItems={gradeItems}
        groups={gradeGroups}
        rows={activeRows}
      />
    </div>
  );
}
