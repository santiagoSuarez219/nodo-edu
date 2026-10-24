// spec-063: agregación pura de inasistencias por mes. Sin "use server", sin
// Supabase y sin Date.now(): la usan la lectura de la UI y el servicio del MCP
// para que ambos den las mismas cifras (un solo cálculo, ver spec-063 D4).
import type {
  AttendanceSheetResult,
  AttendanceSheetSession,
  MonthlyAbsenceCell,
  MonthlyAbsenceRow,
  MonthlyAbsenceSummaryResult,
} from "./types";

type SheetOk = Extract<AttendanceSheetResult, { status: "ok" }>;
type SummaryOk = Extract<MonthlyAbsenceSummaryResult, { status: "ok" }>;

// `enrolled_at` es timestamptz; se compara con `session_date` (día de Bogotá),
// así que se convierte con la misma zona que getBogotaDateString().
export function toBogotaDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(
    new Date(iso)
  );
}

// D5: el mismo día de la matrícula cuenta.
export function isSessionApplicable(sessionDate: string, enrolledOn: string): boolean {
  return sessionDate >= enrolledOn;
}

// D9: "4 h", "4,5 h", "0 h".
export function formatHours(hours: number): string {
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(hours)} h`;
}

// Una sola multiplicación, redondeada una vez (D4).
function toHours(absences: number, hoursPerSession: number): number {
  return Math.round(absences * hoursPerSession * 100) / 100;
}

function countCell(
  sessions: AttendanceSheetSession[],
  presentIds: (id: string) => boolean,
  hoursPerSession: number
): MonthlyAbsenceCell {
  if (sessions.length === 0) return { kind: "not_applicable" };
  const absences = sessions.filter((s) => !presentIds(s.id)).length;
  return {
    kind: "counted",
    absences,
    hours: toHours(absences, hoursPerSession),
    applicable_sessions: sessions.length,
  };
}

export function buildMonthlyAbsenceSummary(
  sheet: SheetOk,
  hoursPerSession: number
): SummaryOk {
  // D7: la sesión en curso no cuenta.
  const openSession = sheet.sessions.find((s) => s.is_open) ?? null;
  const counted = sheet.sessions.filter((s) => !s.is_open);

  // D8: mes = session_date.slice(0, 7), sin pasar por Date.
  const monthCounts = new Map<string, number>();
  for (const s of counted) {
    const key = s.session_date.slice(0, 7);
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  const months = [...monthCounts.keys()]
    .sort()
    .map((key) => ({ key, session_count: monthCounts.get(key)! }));

  const rows: MonthlyAbsenceRow[] = sheet.rows.map((row) => {
    const applicable = counted.filter((s) =>
      isSessionApplicable(s.session_date, row.enrolled_on)
    );
    const isPresent = (id: string) => row.cells[id]?.present === true;

    const byMonth: Record<string, MonthlyAbsenceCell> = {};
    for (const { key } of months) {
      byMonth[key] = countCell(
        applicable.filter((s) => s.session_date.startsWith(key)),
        isPresent,
        hoursPerSession
      );
    }

    return {
      student_id: row.student_id,
      student_name: row.student_name,
      student_first_name: row.student_first_name,
      student_last_name: row.student_last_name,
      enrolled_on: row.enrolled_on,
      months: byMonth,
      total: countCell(applicable, isPresent, hoursPerSession),
    };
  });

  return {
    status: "ok",
    hours_per_session: hoursPerSession,
    months,
    rows,
    open_session_date: openSession?.session_date ?? null,
  };
}
