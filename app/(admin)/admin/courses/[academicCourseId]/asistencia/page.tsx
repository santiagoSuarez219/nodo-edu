import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";
import { getAttendanceSheet, getAttendanceMonthlySummary } from "@/lib/attendance/index";
import { AttendanceSheet } from "@/components/admin/AttendanceSheet";
import { AttendanceViewSwitcher } from "@/components/admin/AttendanceViewSwitcher";
import { AttendanceMonthlySummary } from "@/components/admin/AttendanceMonthlySummary";

export const metadata: Metadata = { title: "Asistencia — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
  searchParams: Promise<{ vista?: string | string[]; mes?: string | string[] }>;
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export default async function AttendancePage({ params, searchParams }: Props) {
  const { academicCourseId } = await params;
  const { vista, mes } = await searchParams;
  await requireAnyRole(["teacher", "admin"]);

  // spec-063 D1: cualquier valor distinto de "resumen" pinta la planilla, y
  // solo se ejecuta la lectura de la vista activa.
  const isSummary = vista === "resumen";
  const month = typeof mes === "string" && MONTH_RE.test(mes) ? mes : null;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <AttendanceViewSwitcher
        academicCourseId={academicCourseId}
        active={isSummary ? "resumen" : "planilla"}
      />
      {isSummary ? (
        <AttendanceMonthlySummary
          academicCourseId={academicCourseId}
          summary={await getAttendanceMonthlySummary(academicCourseId)}
          month={month}
        />
      ) : (
        <AttendanceSheet
          academicCourseId={academicCourseId}
          sheet={await getAttendanceSheet(academicCourseId)}
        />
      )}
    </div>
  );
}
