import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceSupabaseClient } from "@/lib/auth/service";
import type {
  AdminEnrollmentSummary,
  AdminStudentDetail,
  AdminStudentSummary,
  CreateStudentInput,
  UpdateStudentInput,
  DeleteStudentResult,
} from "./types";

// spec-027 (hallazgo de la ronda de pruebas manuales, TC-027-003): el trigger
// on_auth_user_created es un AFTER INSERT — si el correo ya existía en
// auth.users sin confirmar (ej. un intento de registro abandonado de antes
// de este spec, cuando la confirmación de correo aún bloqueaba a la mayoría),
// signUp() reactiva esa fila con un UPDATE, no un INSERT, y el trigger nunca
// dispara. Resultado: sesión creada, pero sin profiles/user_roles/students.
// Ninguna de esas 3 tablas tiene policy de INSERT propia (solo select/update
// del propio usuario, ver 20260623000002_rls_policies.sql), así que la
// reconstrucción solo es posible con el cliente de servicio.
//
// Idempotente POR TABLA (mismo patrón que
// 20260729000003_fix_handle_new_user_conflict_handling.sql, `on conflict do
// nothing`): un guard de lectura único sobre `profiles` (revisión anterior)
// dejaba sin reparar el caso donde `profiles` sí existe pero `user_roles` o
// `students` faltan — exactamente el tipo de estado a medias que este mismo
// fallback existe para corregir.
export async function ensureStudentAccountBootstrap(
  userId: string,
  fullName: string
): Promise<void> {
  const supabase = createServiceSupabaseClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, full_name: fullName }, { onConflict: "id", ignoreDuplicates: true });
  if (profileError) throw profileError;

  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert(
      { user_id: userId, role: "student" },
      { onConflict: "user_id,role", ignoreDuplicates: true }
    );
  if (roleError) throw roleError;

  const { error: studentError } = await supabase
    .from("students")
    .upsert({ profile_id: userId }, { onConflict: "profile_id", ignoreDuplicates: true });
  if (studentError) throw studentError;
}

interface ListStudentsOptions {
  academicCourseId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// auth.users no es visible por PostgREST (schema `auth`, no expuesto). El
// API admin sí lo es; para no hacer una llamada admin por estudiante, se trae
// una vez por request y se arma un mapa id -> email. Alcance del proyecto
// (un docente, unos cientos de estudiantes como techo): una sola página de
// 1000 basta, no hace falta paginar.
async function fetchEmailsById(
  supabase: SupabaseClient
): Promise<Map<string, string>> {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  return new Map(data.users.map((u) => [u.id, u.email ?? ""]));
}

// `students` tiene una fila para CUALQUIER usuario que alguna vez pasó por
// signUp (la crea el trigger on_auth_user_created, sin importar el rol),
// incluida una cuenta docente/admin que se registró antes de que le
// asignaran esos roles manualmente. Sin este filtro, list/get/update/delete
// podían operar sobre el propio docente. `has_role` no distingue "solo
// student" de "student + teacher", así que se filtra explícitamente contra
// user_roles con role = 'student'.
async function fetchStudentRoleIds(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "student");
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.user_id as string));
}

async function fetchEnrollments(
  supabase: SupabaseClient,
  studentId: string
): Promise<AdminEnrollmentSummary[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, academic_course_id, status, enrolled_at, withdrawn_at")
    .eq("student_id", studentId)
    .order("enrolled_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listServiceStudents(
  options: ListStudentsOptions = {}
): Promise<AdminStudentSummary[]> {
  const supabase = createServiceSupabaseClient();
  const limit = Math.min(options.limit ?? 50, 100);
  const offset = options.offset ?? 0;

  let studentIds: string[] | null = null;
  if (options.academicCourseId) {
    const { data, error } = await supabase
      .from("enrollments")
      .select("student_id")
      .eq("academic_course_id", options.academicCourseId)
      .eq("status", "active");
    if (error) throw error;
    studentIds = [...new Set((data ?? []).map((r) => r.student_id as string))];
    if (studentIds.length === 0) return [];
  }

  let query = supabase
    .from("profiles")
    .select("id, full_name, github_username, students!inner(career, semester)")
    .order("full_name", { ascending: true });

  if (studentIds) query = query.in("id", studentIds);

  const { data: profiles, error: profilesError } = await query;
  if (profilesError) throw profilesError;

  const emails = await fetchEmailsById(supabase);
  const studentRoleIds = await fetchStudentRoleIds(supabase);

  const rows = (profiles ?? [])
    .filter((p) => studentRoleIds.has(p.id as string))
    .map((p) => {
      const studentRow = Array.isArray(p.students) ? p.students[0] : p.students;
      return {
        id: p.id as string,
        full_name: p.full_name as string,
        career: (studentRow?.career as string | null) ?? null,
        semester: (studentRow?.semester as number | null) ?? null,
        github_username: (p.github_username as string | null) ?? null,
        email: emails.get(p.id as string) ?? "",
      };
    });

  const search = options.search?.trim().toLowerCase();
  const filtered = search
    ? rows.filter(
        (r) =>
          r.full_name.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search)
      )
    : rows;

  return filtered.slice(offset, offset + limit);
}

export async function getServiceStudentById(
  studentId: string
): Promise<AdminStudentDetail | null> {
  const supabase = createServiceSupabaseClient();

  // !inner: descarta cualquier UUID de `profiles` que no tenga fila en
  // `students`. No basta solo con esto: una cuenta docente/admin que se
  // registró antes de que le asignaran esos roles SÍ tiene fila en
  // `students` (la crea el trigger para cualquier signUp), así que también
  // se exige el rol 'student' explícito vía fetchStudentRoleIds.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, github_username, students!inner(career, semester)")
    .eq("id", studentId)
    .maybeSingle();

  if (!profile) return null;

  const studentRoleIds = await fetchStudentRoleIds(supabase);
  if (!studentRoleIds.has(profile.id as string)) return null;

  const emails = await fetchEmailsById(supabase);
  const studentRow = Array.isArray(profile.students)
    ? profile.students[0]
    : profile.students;
  const enrollments = await fetchEnrollments(supabase, studentId);

  return {
    id: profile.id as string,
    full_name: profile.full_name as string,
    career: (studentRow?.career as string | null) ?? null,
    semester: (studentRow?.semester as number | null) ?? null,
    github_username: (profile.github_username as string | null) ?? null,
    email: emails.get(profile.id as string) ?? "",
    enrollments,
  };
}

// Resuelve un enrollment_code sin enmascarar el motivo (a diferencia de
// resolveCourseForRegistration en lib/enrollments/index.ts): este camino lo
// invoca el docente vía MCP, ya autenticado con la API key de servicio, así
// que no hay riesgo de enumeración que mitigar con un mensaje genérico.
async function resolveCourseIdByCode(
  supabase: SupabaseClient,
  enrollmentCode: string
): Promise<{ ok: true; academicCourseId: string } | { ok: false; error: string }> {
  const { data } = await supabase.rpc("find_course_by_enrollment_code", {
    p_enrollment_code: enrollmentCode.trim().toUpperCase(),
  });
  const course = data?.[0];

  if (!course) return { ok: false, error: "Código de curso no encontrado." };
  if (!course.is_active)
    return { ok: false, error: "El curso no está aceptando matrículas." };

  return { ok: true, academicCourseId: course.id };
}

export async function createServiceStudent(
  input: CreateStudentInput
): Promise<
  | { ok: true; student: AdminStudentDetail; enrollment_warning?: string }
  | { ok: false; error: string }
> {
  const supabase = createServiceSupabaseClient();

  let academicCourseId: string | undefined = input.academic_course_id;
  if (!academicCourseId && input.enrollment_code) {
    const resolved = await resolveCourseIdByCode(supabase, input.enrollment_code);
    if (!resolved.ok) return { ok: false, error: resolved.error };
    academicCourseId = resolved.academicCourseId;
  }

  const { data: created, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });

  if (error || !created.user) {
    return { ok: false, error: error?.message ?? "No se pudo crear el estudiante." };
  }

  const userId = created.user.id;

  if (input.career !== undefined || input.semester !== undefined) {
    await supabase
      .from("students")
      .update({
        ...(input.career !== undefined && { career: input.career }),
        ...(input.semester !== undefined && { semester: input.semester }),
      })
      .eq("profile_id", userId);
  }

  if (input.github_username !== undefined) {
    await supabase
      .from("profiles")
      .update({ github_username: input.github_username })
      .eq("id", userId);
  }

  // A diferencia de un console.error silencioso: si la matrícula falla, el
  // agente (y el docente) deben saberlo en la propia respuesta — de lo
  // contrario se reporta "creado y matriculado" cuando solo lo primero es
  // cierto.
  let enrollmentWarning: string | undefined;
  if (academicCourseId) {
    const { error: enrollError } = await supabase
      .from("enrollments")
      .insert({ student_id: userId, academic_course_id: academicCourseId });
    if (enrollError) {
      enrollmentWarning = `El estudiante se creó, pero la matrícula automática falló: ${enrollError.message}. Usa enroll_student para completarla.`;
      console.error(
        `createServiceStudent: matrícula automática falló para ${userId} en ${academicCourseId}: ${enrollError.message}`
      );
    }
  }

  const student = await getServiceStudentById(userId);
  if (!student) {
    // No debería ocurrir (el usuario se acaba de crear), pero no hay que
    // fingir éxito con una aserción de tipos si de algún modo pasa.
    return {
      ok: false,
      error: "El estudiante se creó pero no se pudo leer de vuelta.",
    };
  }

  return {
    ok: true,
    student,
    ...(enrollmentWarning && { enrollment_warning: enrollmentWarning }),
  };
}

export async function updateServiceStudent(
  studentId: string,
  input: UpdateStudentInput
): Promise<AdminStudentDetail | null> {
  const supabase = createServiceSupabaseClient();

  const existing = await getServiceStudentById(studentId);
  if (!existing) return null;

  if (input.email !== undefined) {
    // email_confirm: true evita que el nuevo correo quede pendiente de
    // verificación — sin SMTP propio, ese correo de confirmación nunca
    // llegaría y la cuenta quedaría en un limbo irrecuperable.
    const { error } = await supabase.auth.admin.updateUserById(studentId, {
      email: input.email,
      email_confirm: true,
    });
    if (error) throw error;
  }

  if (input.full_name !== undefined || input.github_username !== undefined) {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...(input.full_name !== undefined && { full_name: input.full_name }),
        ...(input.github_username !== undefined && {
          github_username: input.github_username,
        }),
      })
      .eq("id", studentId);
    if (error) throw error;
  }

  if (input.career !== undefined || input.semester !== undefined) {
    const { error } = await supabase
      .from("students")
      .update({
        ...(input.career !== undefined && { career: input.career }),
        ...(input.semester !== undefined && { semester: input.semester }),
      })
      .eq("profile_id", studentId);
    if (error) throw error;
  }

  return getServiceStudentById(studentId);
}

export async function deleteServiceStudent(
  studentId: string
): Promise<{ ok: true; result: DeleteStudentResult } | { ok: false; error: string }> {
  const supabase = createServiceSupabaseClient();

  const existing = await getServiceStudentById(studentId);
  if (!existing) return { ok: false, error: "Estudiante no encontrado." };

  let enrollmentsRemoved = 0;

  // Borrar el usuario de auth.users SÍ hace cascade sobre profiles,
  // user_roles y students (spec-002) — pero `enrollments.student_id` es
  // `on delete restrict`, no cascade (spec-003), así que deleteUser fallaría
  // con un error crudo de FK de Postgres para cualquier estudiante con al
  // menos una matrícula (la mayoría, desde que este spec fusionó registro y
  // matrícula). Hay que borrar las matrículas explícitamente primero — en UNA
  // sola sentencia: si alguna tiene entregas (submissions.enrollment_id
  // también es `restrict`), Postgres aborta la sentencia COMPLETA, así que no
  // hay riesgo de borrar unas matrículas sí y otras no.
  if (existing.enrollments.length > 0) {
    const { data: deletedEnrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", studentId)
      .select("id");
    if (!enrollmentsError) {
      enrollmentsRemoved = deletedEnrollments?.length ?? 0;
    }
    if (enrollmentsError) {
      console.error(
        `deleteServiceStudent: no se pudieron borrar las matrículas de ${studentId}: ${enrollmentsError.code} ${enrollmentsError.message}`
      );

      // 23503 = violación de FK de Postgres — la única causa esperada es
      // `submissions` bloqueando el borrado (entregas reales). Cualquier
      // otro código es un fallo distinto y no debe reportarse como si el
      // estudiante tuviera entregas cuando puede no ser el caso.
      if (enrollmentsError.code === "23503") {
        const blockedCourses = existing.enrollments.map((e) => e.academic_course_id);
        return {
          ok: false,
          error: `No se puede eliminar: el estudiante tiene entregas registradas en al menos uno de estos cursos (${blockedCourses.join(", ")}). Usa unenroll_student si solo quieres retirarlo del curso.`,
        };
      }

      return { ok: false, error: "No se pudo eliminar el estudiante (error interno)." };
    }
  }

  const { error } = await supabase.auth.admin.deleteUser(studentId);
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    result: {
      deleted_id: studentId,
      email: existing.email,
      full_name: existing.full_name,
      enrollments_removed: enrollmentsRemoved,
    },
  };
}

export async function enrollServiceStudent(
  studentId: string,
  target: { academicCourseId?: string; enrollmentCode?: string }
): Promise<{ ok: true; enrollment: AdminEnrollmentSummary } | { ok: false; error: string }> {
  const supabase = createServiceSupabaseClient();

  let academicCourseId = target.academicCourseId;
  if (!academicCourseId && target.enrollmentCode) {
    const resolved = await resolveCourseIdByCode(supabase, target.enrollmentCode);
    if (!resolved.ok) return { ok: false, error: resolved.error };
    academicCourseId = resolved.academicCourseId;
  }
  if (!academicCourseId) {
    return { ok: false, error: "Falta academic_course_id o enrollment_code." };
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("academic_course_id", academicCourseId)
    .maybeSingle();
  if (existing) return { ok: false, error: "Ya está matriculado en este curso." };

  const { data, error } = await supabase
    .from("enrollments")
    .insert({ student_id: studentId, academic_course_id: academicCourseId })
    .select("id, academic_course_id, status, enrolled_at, withdrawn_at")
    .single();

  if (error) return { ok: false, error: "No se pudo completar la matrícula." };
  return { ok: true, enrollment: data };
}

export async function unenrollServiceStudent(
  studentId: string,
  academicCourseId: string
): Promise<{ ok: true; enrollment: AdminEnrollmentSummary } | { ok: false; error: string }> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("enrollments")
    .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() })
    .eq("student_id", studentId)
    .eq("academic_course_id", academicCourseId)
    .select("id, academic_course_id, status, enrolled_at, withdrawn_at")
    .maybeSingle();

  if (error) return { ok: false, error: "No se pudo retirar la matrícula." };
  if (!data) return { ok: false, error: "Matrícula no encontrada." };
  return { ok: true, enrollment: data };
}

// spec-040 Fase 7: lectura de la nota de autoevaluaciones de un estudiante
// para el agente docente (students-mcp). Solo lectura: la nota es derivada y
// se recalcula sola, así que no existe contraparte de escritura.
//
// `self_assessment_breakdown` no es security definer (hereda RLS del rol que
// la invoca) y este camino ya está detrás de STUDENTS_ADMIN_API_KEY, así que
// se invoca con el cliente de servicio, igual que el resto de este módulo.
//
// A diferencia del camino de UI (lib/self-assessment), aquí no se resuelven
// títulos de lección desde el catálogo MDX: el agente solo necesita el slug.
type ServiceSelfAssessmentBreakdownRow = {
  lesson_slug: string;
  question_count: number;
  correct_count: number;
  answered: boolean;
};

export interface ServiceSelfAssessmentSummary {
  course_slug: string;
  score: number | null;
  correct_total: number;
  question_total: number;
  lessons: Array<{
    lesson_slug: string;
    answered: boolean;
    correct_count: number;
    question_count: number;
  }>;
}

export async function getServiceStudentSelfAssessmentSummary(
  studentId: string,
  courseSlug: string
): Promise<
  { ok: true; summary: ServiceSelfAssessmentSummary } | { ok: false; error: string }
> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase.rpc("self_assessment_breakdown", {
    p_user_id: studentId,
    p_course_slug: courseSlug,
  });

  if (error) {
    console.error("self_assessment_breakdown error:", error);
    return { ok: false, error: "No se pudo calcular la nota de autoevaluaciones." };
  }

  const rows = (data ?? []) as ServiceSelfAssessmentBreakdownRow[];
  const questionTotal = rows.reduce((sum, r) => sum + r.question_count, 0);
  const correctTotal = rows.reduce((sum, r) => sum + r.correct_count, 0);
  // D4: sin nada evaluable la nota es null, nunca 0.00 (un 0 se lee como reprobado).
  const score =
    questionTotal > 0
      ? Math.round((correctTotal / questionTotal) * 5 * 100) / 100
      : null;

  return {
    ok: true,
    summary: {
      course_slug: courseSlug,
      score,
      correct_total: correctTotal,
      question_total: questionTotal,
      lessons: rows
        .filter((r) => r.question_count > 0)
        .map((r) => ({
          lesson_slug: r.lesson_slug,
          answered: r.answered,
          correct_count: r.correct_count,
          question_count: r.question_count,
        })),
    },
  };
}
