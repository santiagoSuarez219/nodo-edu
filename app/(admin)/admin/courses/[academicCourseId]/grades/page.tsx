import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";
import { getGradeItemsByCourse, getGradesByCourse } from "@/lib/grades/index";
import { GradeItemsPanel } from "@/components/admin/GradeItemsPanel";
import { GradesTable } from "@/components/admin/GradesTable";

export const metadata: Metadata = { title: "Calificaciones — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function GradesPage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const [gradeItems, courseGrades] = await Promise.all([
    getGradeItemsByCourse(academicCourseId),
    getGradesByCourse(academicCourseId),
  ]);

  const activeRows = courseGrades.filter((r) => r.enrollment_status === "active");

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <GradeItemsPanel
        academicCourseId={academicCourseId}
        initialItems={gradeItems}
      />

      <GradesTable
        academicCourseId={academicCourseId}
        gradeItems={gradeItems}
        rows={activeRows}
      />
    </div>
  );
}
