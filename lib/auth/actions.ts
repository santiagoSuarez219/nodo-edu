"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "./server";
import { SignInSchema, SignUpSchema, ChangePasswordSchema } from "./schemas";
import { getCurrentUser } from "./session";
import { clearMustChangePasswordFlag } from "./service";
import { isAuthErrorLike } from "./errors";
import { createTimeoutFetch } from "./fetch-timeout";

// spec-054 (D-C) — mismo presupuesto que lib/auth/server.ts: es una llamada
// de datos de página (verificar una contraseña), no el gate del middleware.
const DATA_TIMEOUT_MS = 6000;
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

type PasswordVerification =
  | { ok: true }
  | { ok: false; reason: "incorrect" | "unavailable" };

// spec-051 (D2/D4): verifica la contraseña actual con un cliente que NO
// persiste sesión — sin el adaptador de cookies de @supabase/ssr. Llamar
// signInWithPassword() sobre el cliente normal de servidor (createServerSupabaseClient)
// emitiría una sesión nueva y reescribiría las cookies de la request,
// desplazando la sesión en curso. Este cliente vive solo en memoria, para
// esta única llamada, y nunca toca las cookies de Next.
async function verifyCurrentPassword(
  email: string,
  password: string
): Promise<PasswordVerification> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[auth] changePassword: faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
    return { ok: false, reason: "unavailable" };
  }

  const throwaway = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // spec-054 (DEBT-070): este cliente no pasaba por lib/auth/server.ts, así
    // que quedaba fuera del timeout que el resto de este archivo hereda de
    // createServerSupabaseClient() — sin timeout propio hasta ahora.
    global: { fetch: createTimeoutFetch(DATA_TIMEOUT_MS) },
  });

  // DEBT: signInWithPassword emite una sesión/refresh token real en GoTrue
  // que nadie cierra explícitamente aquí. En el camino feliz queda barrida
  // por el signOut({scope:'others'}) posterior de changePassword, pero si
  // updateUser falla justo después de una verificación EXITOSA, esa sesión
  // huérfana sobrevive hasta expirar por sí sola. Impacto bajo hoy; anotado
  // por la segunda revisión de código de spec-051 (2026-08-16) como
  // candidato a `throwaway.auth.signOut()` en un `finally` si el volumen de
  // cambios de contraseña crece. Ver docs/specs/backlog.md.
  const { error } = await throwaway.auth.signInWithPassword({ email, password });
  if (!error) return { ok: true };

  // Mismo criterio de clasificación que lib/auth/errors.ts: fallo de red o
  // 5xx del propio servidor de Auth es infraestructura; un 4xx (incluida
  // "Invalid login credentials") es la contraseña actual, que sí es
  // incorrecta. No se reutiliza classifyAuthError() directamente porque su
  // resultado (anonymous/unavailable) no distingue "credencial incorrecta" —
  // aquí sí hace falta esa tercera rama.
  //
  // Revisión de código (2026-08-16, @reviewer): 429 quedaba dentro del "todo
  // lo demás es incorrecta" — GoTrue limita los intentos de
  // signInWithPassword, y este verificador consume esa misma cuota en cada
  // cambio de contraseña. Sin este caso aparte, un 429 se reportaba como
  // "La contraseña actual no es correcta" siendo falso: la contraseña era
  // correcta, solo se agotó el límite de intentos. Se clasifica como
  // infraestructura para que D9 no mienta.
  if (!isAuthErrorLike(error)) return { ok: false, reason: "unavailable" };
  if (error.name === "AuthRetryableFetchError") return { ok: false, reason: "unavailable" };
  if (typeof error.status === "number" && (error.status >= 500 || error.status === 429)) {
    return { ok: false, reason: "unavailable" };
  }
  return { ok: false, reason: "incorrect" };
}

const INFRA_ERROR_MESSAGE =
  "No se pudo verificar tu contraseña en este momento. Intenta de nuevo en unos minutos.";

// Cambio con sesión activa (spec-051, Fase 2) — cubre tanto el cambio
// voluntario desde /cuenta como el cambio forzado desde /cambiar-contrasena
// (Fase 4): ambos usan el mismo ChangePasswordSchema y esta misma acción.
// spec-051 (revisión de código, 2026-08-16): `flagCleared` deja que el
// llamador (ChangePasswordForm) distinga un cambio completamente exitoso de
// uno donde la contraseña sí cambió pero la marca `must_change_password` no
// se pudo limpiar — sin este dato, ese segundo caso se veía idéntico al
// primero y el usuario quedaba encerrado en /cambiar-contrasena sin saber
// por qué.
export type ChangePasswordResult = AuthResult<{ flagCleared: boolean }>;

export async function changePassword(
  _prev: ChangePasswordResult,
  formData: FormData
): Promise<ChangePasswordResult> {
  // Mismo patrón que updateAccountAction (lib/students/actions.ts): usa
  // getCurrentUser(), no requireUser(). Colapsa "sin sesión" y "no se pudo
  // verificar" en el mismo mensaje genérico — gap ya documentado en
  // DEBT-040/lib/auth/session.ts, no exclusivo de esta acción.
  const user = await getCurrentUser();
  if (!user || !user.email) {
    return { ok: false, error: "No autenticado." };
  }

  const parsed = ChangePasswordSchema.safeParse({
    current_password: formData.get("current_password"),
    new_password: formData.get("new_password"),
    new_password_confirmation: formData.get("new_password_confirmation"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisa los campos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const verification = await verifyCurrentPassword(user.email, parsed.data.current_password);
  if (!verification.ok) {
    if (verification.reason === "unavailable") {
      return { ok: false, error: INFRA_ERROR_MESSAGE };
    }
    return {
      ok: false,
      error: "La contraseña actual no es correcta.",
      fieldErrors: { current_password: ["La contraseña actual no es correcta."] },
    };
  }

  // Cliente con la sesión real (cookies) para el cambio en sí: la identidad
  // ya quedó demostrada por verifyCurrentPassword(), así que aquí no hay
  // riesgo de desplazar nada — es la misma sesión que se conserva (D8).
  const supabase = await createServerSupabaseClient();
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });

  // D9: nunca reportar éxito sin verificar `error`.
  if (updateError) {
    console.error("changePassword: updateUser falló:", updateError.message);
    return { ok: false, error: INFRA_ERROR_MESSAGE };
  }

  const flagCleared = await clearMustChangePasswordFlag(user.id, user.app_metadata);

  // D8: se cierran las demás sesiones, se conserva la propia — 'others' deja
  // viva exactamente la sesión desde la que se hizo el cambio.
  const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });
  if (signOutError) {
    // El cambio de contraseña ya ocurrió (lo de arriba es lo que importa);
    // no cerrar las otras sesiones es una degradación, no un fallo del
    // cambio en sí. Se registra y se sigue reportando éxito.
    console.error("changePassword: no se pudieron cerrar las otras sesiones:", signOutError.message);
  }

  revalidatePath("/cuenta");
  return { ok: true, data: { flagCleared } };
}
