export type ClassSession = {
  id: string;
  academic_course_id: string;
  session_date: string;
  // spec-054 (D7): NULL = sesión registrada manualmente por el docente, sin
  // código. Una sesión abierta con código real siempre tiene ambos poblados.
  attendance_code: string | null;
  code_expires_at: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecord = {
  id: string;
  session_id: string;
  student_id: string;
  marked_at: string;
  // spec-054 (D8): NULL = el propio estudiante marcó con el código de
  // asistencia. uuid = el docente que marcó manualmente desde la planilla.
  marked_by: string | null;
};

// spec-054: la planilla matriz estudiantes × sesiones del panel del curso.

export type AttendanceSheetSession = {
  id: string;
  session_date: string;
  // Una sesión sin código (D7) es una sesión creada manualmente.
  has_code: boolean;
  is_open: boolean;
  // Conteo real de attendance_records de esta sesión, SIN restringir a
  // matrículas activas (a diferencia de las filas de la planilla, D2). Es el
  // número que el `on delete cascade` se llevaría de verdad, incluidos los
  // registros de estudiantes retirados — el que necesita el modal de borrado
  // (D11).
  attendee_count: number;
};

export type AttendanceSheetCell = {
  present: boolean;
  marked_at: string | null;
  // D8: distingue el marcado del docente del marcado con código del propio
  // estudiante. `false` cuando la celda está ausente.
  marked_manually: boolean;
};

export type AttendanceSheetRow = {
  student_id: string;
  student_name: string;
  // Una entrada por sesión del curso, en el mismo orden que `sessions`. El %
  // de asistencia no vive aquí: `AttendanceSheet.computePct()` lo calcula en
  // cliente a partir de estas celdas, porque necesita incorporar el estado
  // optimista de una celda recién marcada/desmarcada (D2, D9).
  cells: Record<string, AttendanceSheetCell>;
};

// Resultado discriminado de getAttendanceSheet (D3): un curso sin sesiones o
// sin estudiantes activos es un dato de negocio legítimo (arrays vacíos), no
// un fallo — `status: 'unavailable'` está reservado a fallos de lectura.
export type AttendanceSheetResult =
  | { status: 'ok'; sessions: AttendanceSheetSession[]; rows: AttendanceSheetRow[] }
  | { status: 'unavailable' };

export type OpenSessionSummary = {
  session: ClassSession;
  attendanceCount: number;
};

// Resultado discriminado de getOpenSessionForCourse: `session: null` significa
// "no hay sesión abierta" (negocio); `status: 'unavailable'` significa "no se
// pudo consultar" (infraestructura) — antes ambos casos colapsaban en `null`.
export type OpenSessionResult =
  | { status: 'ok'; session: OpenSessionSummary | null }
  | { status: 'unavailable' };

// Resultado discriminado de getSessionAttendanceCount: antes un fallo de
// consulta devolvía `0`, indistinguible de "nadie ha marcado".
export type AttendanceCountResult =
  | { status: 'ok'; count: number }
  | { status: 'unavailable' };

// Resultado discriminado de getStudentAttendanceForCourse: antes un fallo de
// consulta devolvía el mismo shape que "sin sesión abierta".
export type StudentAttendanceState =
  | {
      status: 'ok';
      sessionOpen: boolean;
      sessionId?: string;
      alreadyMarked: boolean;
      markedAt?: string;
    }
  | { status: 'unavailable' };

// Resultado discriminado de extendSessionCode / rotateSessionCode. Sigue el
// criterio de spec-037: los estados de negocio son valores distintos y
// nombrados; 'unavailable' está reservado a fallos de infraestructura.
export type RefreshCodeResult =
  | { status: 'ok'; session: ClassSession }
  | { status: 'not_open' } // negocio: ya no hay sesión abierta con ese id
  | { status: 'code_collision' } // negocio: no se logró un código único (solo rotate)
  | { status: 'unavailable' }; // infraestructura

export type MarkAttendanceResult =
  | 'marked'
  | 'already_marked'
  | 'not_found'
  | 'expired'
  | 'closed'
  | 'not_enrolled'
  // Fallo de infraestructura (consulta caída, RPC inalcanzable) — antes se
  // fundía en 'not_found', que el estudiante leía como "código incorrecto".
  | 'unavailable';
