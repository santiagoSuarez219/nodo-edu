export interface Profile {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  name_needs_review: boolean;
  avatar_url: string | null;
  github_username: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

// Lo que expone el RPC get_student_profiles_public al docente (sin email).
export type StudentProfilePublic = Pick<
  Profile,
  "id" | "full_name" | "first_name" | "last_name" | "name_needs_review"
>;

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
  first_name: string;
  last_name: string;
  name_needs_review: boolean;
  career: string | null;
  semester: number | null;
  github_username: string | null;
}

export interface AdminStudentDetail extends AdminStudentSummary {
  enrollments: AdminEnrollmentSummary[];
}

// spec-062 D10: `first_name` + `last_name`, o `full_name` por compatibilidad
// (se separa automáticamente y queda por revisar).
export interface CreateStudentInput {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email: string;
  password: string;
  career?: string;
  semester?: number;
  github_username?: string;
  enrollment_code?: string;
  academic_course_id?: string;
}

export interface UpdateStudentInput {
  first_name?: string;
  last_name?: string;
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
