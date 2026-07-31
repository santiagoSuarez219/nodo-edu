"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "./server";
import { SignInSchema, SignUpSchema } from "./schemas";
import type { AuthResult } from "./types";
import {
  resolveCourseForRegistration,
  enrollNewUserInCourse,
} from "@/lib/enrollments";
import { checkRegistrationRateLimit } from "./rate-limit";
import { ensureStudentAccountBootstrap } from "@/lib/students/service";

export async function signIn(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const parsed = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");

  // "/" no es un destino específico: es a donde el middleware manda a
  // cualquier visitante no autenticado que entra por la raíz del sitio. Si lo
  // honráramos igual que un redirectTo real (ej. una lección puntual), un
  // estudiante que abre nod0.dev y luego inicia sesión terminaría en la
  // grilla general de cursos en vez de /cuenta/cursos.
  const redirectTo = formData.get("redirectTo")?.toString();
  if (redirectTo && redirectTo !== "/") {
    redirect(redirectTo);
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user?.id);

  const hasStudentRole = roles?.some((r) => r.role === "student");
  if (hasStudentRole) {
    redirect("/cuenta/cursos");
  }

  redirect("/");
}

export async function signUp(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const parsed = SignUpSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirmation: formData.get("password_confirmation"),
    enrollment_code: formData.get("enrollment_code"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Límite por IP y por código (ver lib/auth/rate-limit.ts para las
  // limitaciones conocidas de esta mitigación). El límite por código es
  // deliberadamente más alto: esa clave la comparte TODO un salón (hasta 30
  // estudiantes reales, más los typos que cuentan como intento aunque
  // fallen), mientras que el límite por IP acota a un solo origen de red.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const withinIpLimit = checkRegistrationRateLimit(`signup:ip:${ip}`, 40);
  const withinCodeLimit = checkRegistrationRateLimit(
    `signup:code:${parsed.data.enrollment_code}`,
    200
  );
  if (!withinIpLimit || !withinCodeLimit) {
    return {
      ok: false,
      error: "Demasiados intentos de registro. Intenta de nuevo en unos minutos.",
    };
  }

  // Resolver el código antes de crear el usuario: evita dejar cuentas
  // huérfanas por un código mal escrito (el error más probable con ~120
  // estudiantes tecleándolo en clase). El visitante aún es anónimo, por eso
  // usa el cliente de servicio (ver resolveCourseForRegistration).
  const courseResult = await resolveCourseForRegistration(
    parsed.data.enrollment_code
  );
  if (!courseResult.ok) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: { enrollment_code: [courseResult.error] },
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error || !signUpData.user) {
    return { ok: false, error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  // Si "Confirm email" llegara a reactivarse en el dashboard de Supabase
  // (fuera del control de este código), signUp no devuelve sesión: el
  // insert de matrícula correría como anónimo y RLS lo rechazaría en
  // silencio. Fallar explícito aquí en vez de dejar al estudiante en un
  // estado ambiguo con la cuenta creada pero sin matrícula ni sesión.
  if (!signUpData.session) {
    return {
      ok: false,
      error:
        "Tu cuenta se creó pero no se pudo iniciar sesión automáticamente. Intenta iniciar sesión manualmente.",
    };
  }

  // Si el correo ya existía sin confirmar (registro abandonado de antes de
  // este spec), signUp() reactiva esa fila con un UPDATE y el trigger
  // on_auth_user_created (AFTER INSERT) nunca dispara: la cuenta queda sin
  // profiles/user_roles/students. Sin esto, el insert de matrícula de abajo
  // fallaría contra RLS (el estudiante no tendría el rol 'student').
  try {
    await ensureStudentAccountBootstrap(signUpData.user.id, parsed.data.full_name);
  } catch (bootstrapError) {
    console.error(
      `signUp: no se pudo inicializar perfil/rol para ${signUpData.user.id}:`,
      bootstrapError
    );
    return {
      ok: false,
      error:
        "Tu cuenta se creó pero no se pudo completar la configuración inicial. Contacta a tu docente.",
    };
  }

  // Mismo cliente que hizo signUp: ya tiene la sesión recién creada en
  // memoria, así que auth.uid() resuelve en este insert aunque las cookies
  // de la request entrante todavía no la reflejen.
  const enrollResult = await enrollNewUserInCourse(
    supabase,
    signUpData.user.id,
    courseResult.academicCourseId
  );
  if (!enrollResult.ok) {
    console.error(
      `signUp: matrícula automática falló para user ${signUpData.user.id} en curso ${courseResult.academicCourseId}: ${enrollResult.error}`
    );
  }

  revalidatePath("/", "layout");
  redirect("/cuenta/cursos");
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
