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

export type StudentAttendanceState = {
  sessionOpen: boolean;
  sessionId?: string;
  alreadyMarked: boolean;
  markedAt?: string;
};

export type MarkAttendanceResult =
  | 'marked'
  | 'already_marked'
  | 'not_found'
  | 'expired'
  | 'closed'
  | 'not_enrolled';
