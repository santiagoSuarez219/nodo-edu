import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";
import { getAttendanceSheet } from "@/lib/attendance/index";
import { AttendanceSheet } from "@/components/admin/AttendanceSheet";

export const metadata: Metadata = { title: "Asistencia — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function AttendancePage({ params }: Props) {
  const { academicCourseId } = await params;
  await requireAnyRole(["teacher", "admin"]);

  const sheet = await getAttendanceSheet(academicCourseId);

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <AttendanceSheet academicCourseId={academicCourseId} sheet={sheet} />
    </div>
  );
}
