export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  github_username: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  profile_id: string;
  career: string | null;
  semester: number | null;
  enrolled_at: string;
}

export interface ProfileWithStudent extends Profile {
  student: Student | null;
}

// Tipos de la capa de servicio de administración (spec-027, students-mcp).
// Deliberadamente sin enrollment_code ni password en ninguna salida.

export interface AdminEnrollmentSummary {
  id: string;
  academic_course_id: string;
  status: "active" | "withdrawn";
  enrolled_at: string;
  withdrawn_at: string | null;
}

export interface AdminStudentSummary {
  id: string;
  email: string;
  full_name: string;
  career: string | null;
  semester: number | null;
  github_username: string | null;
}

export interface AdminStudentDetail extends AdminStudentSummary {
  enrollments: AdminEnrollmentSummary[];
}

export interface CreateStudentInput {
  full_name: string;
  email: string;
  password: string;
  career?: string;
  semester?: number;
  github_username?: string;
  enrollment_code?: string;
  academic_course_id?: string;
}

export interface UpdateStudentInput {
  full_name?: string;
  email?: string;
  career?: string | null;
  semester?: number | null;
  github_username?: string | null;
}

export interface DeleteStudentResult {
  deleted_id: string;
  email: string;
  full_name: string;
  enrollments_removed: number;
}

// spec-051: tipo dedicado y separado de AdminStudentDetail/AdminStudentSummary
// a propósito — la contraseña se muestra una sola vez, en la respuesta directa
// del restablecimiento, nunca en una lectura general (ver el comentario de
// arriba: "Deliberadamente sin enrollment_code ni password en ninguna
// salida").
export interface ResetStudentPasswordResult {
  student_id: string;
  password: string;
  must_change_password: true;
}
