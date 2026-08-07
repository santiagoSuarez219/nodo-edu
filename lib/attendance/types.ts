export type ClassSession = {
  id: string;
  academic_course_id: string;
  session_date: string;
  attendance_code: string;
  code_expires_at: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecord = {
  id: string;
  session_id: string;
  student_id: string;
  marked_at: string;
};

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
