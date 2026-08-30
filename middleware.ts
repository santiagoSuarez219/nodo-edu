import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/auth/middleware";
import { renderServiceUnavailablePage } from "@/lib/auth/service-unavailable-page";

const ADMIN_PREFIXES = ["/admin"];
const PUBLIC_PREFIXES = [
  "/login",
  "/registro",
  "/servicio-no-disponible", // spec-046 — destino del propio gate, debe quedar exento o entra en bucle
];
const CHANGE_PASSWORD_PATH = "/cambiar-contrasena"; // spec-051 — mismo motivo: debe quedar exento o entra en bucle

// spec-054 (DEBT-069, decisión D-E = E1): rutas que no necesitan Auth para
// renderizar (ambas leen MDX/son estáticas) y que por tanto pueden dejarse
// pasar en modo degradado — SOLO cuando el fallo es transitorio. Coincidencia
// EXACTA a propósito, no prefijo: un prefijo "/"' matchearía todo el sitio, y
// un curso futuro con slug "grupo-investigacion-2" no debe heredar la
// excepción por accidente.
//
// La excepción es de NAVEGACIÓN, no de AUTORIZACIÓN: las rutas de curso y
// lección siguen exigiendo sesión y matrícula (requireCourseAccess,
// lib/enrollments/access.ts) sin ninguna excepción — D4 de spec-046 queda
// intacto. Ver "Hallazgo 3" de docs/specs/spec-054-resiliencia-latencia-supabase.md:
// hoy no existe contenido público más allá de estas dos rutas.
const DEGRADABLE_OPEN_ROUTES = new Set(["/", "/grupo-investigacion"]);

// reason que spec-054 considera transitorio — un episodio de latencia o de
// caída puntual del proveedor, del tipo que la excepción de arriba busca no
// amplificar. `misconfigured` y `unknown` NUNCA activan la excepción: son
// fallos permanentes (env var ausente, algo no anticipado) donde fallar
// cerrado en todo el sitio sigue siendo lo correcto.
const TRANSIENT_REASONS = new Set(["network", "server", "timeout"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // D3 + hallazgo 🟠 de la revisión de código de spec-046 (2026-08-13): las
  // rutas /api se autentican con API key, nunca con cookie de sesión — antes
  // de este cambio pagaban igual el costo de updateSupabaseSession()
  // (incluido el ping a checkAuthHealth() cuando no hay cookie, hasta ~4.25s
  // en el peor caso) solo para que `auth.status` se descartara dos líneas
  // más abajo. Se cortocircuita antes de tocar Supabase — los 5 MCPs del
  // proyecto ni siquiera notan una caída de Auth.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const { supabaseResponse, auth, supabase, authDurationMs, deadlineExceeded } =
    await updateSupabaseSession(request);

  // spec-046: Supabase Auth no se pudo verificar (caído, inalcanzable, mal
  // configurado). Antes de este spec, `user: null` era indistinguible de
  // "no hay sesión" y el gate expulsaba a todo el mundo a /login — con
  // /login necesitando el mismo servicio caído, nadie podía volver a entrar
  // (DEBT-042).
  if (auth.status === "unavailable") {
    console.error(
      `[auth] servicio no disponible (${auth.reason}, ${authDurationMs}ms) — ${pathname}`
    );

    // spec-054 (DEBT-069, D-E = E1): un fallo TRANSITORIO no tumba las dos
    // rutas que no dependen de Auth para renderizar. La excepción nunca
    // aplica a `misconfigured`/`unknown` (fallos permanentes) ni a ninguna
    // ruta fuera de DEGRADABLE_OPEN_ROUTES — en particular, nunca a una
    // lección: esas siguen su propio gate de matrícula
    // (requireCourseAccess) más abajo en el render, que sigue fallando
    // cerrado ante `unavailable` sin ninguna excepción.
    const degradedRouteException =
      TRANSIENT_REASONS.has(auth.reason) && DEGRADABLE_OPEN_ROUTES.has(pathname);

    // spec-053: sin esto, este 503 no dejaba ningún rastro en Sentry — solo
    // el console.error de arriba, invisible fuera de los runtime logs de
    // Vercel. `captureMessage`, no `captureException`: no hay una excepción
    // real, es una decisión deliberada del gate de spec-046 (D3). El tag
    // `is_server_action` distingue el caso benigno (una navegación normal
    // que ve la página de servicio no disponible, como se diseñó) del caso
    // que motivó spec-053 (un Server Action que esperaba RSC y recibió este
    // mismo 503 — issue NODO-EDU-4 de Sentry). spec-054 añade `duration_ms`
    // y `deadline_exceeded` (para medir en producción si GLOBAL_DEADLINE_MS
    // sigue siendo suficiente) y `degraded_route_exception` (para medir
    // cuánto tráfico salva realmente la excepción de E1).
    Sentry.captureMessage("Gate de Auth: servicio no disponible", {
      level: "error",
      tags: {
        gate: "auth",
        reason: auth.reason,
        path: pathname,
        is_server_action: request.headers.has("Next-Action"),
        duration_ms: authDurationMs,
        deadline_exceeded: deadlineExceeded,
        degraded_route_exception: degradedRouteException,
      },
    });

    if (degradedRouteException) {
      // Navegación anónima en modo degradado — nunca autorización: el
      // contenido de "/" y "/grupo-investigacion" no consulta Supabase, así
      // que no hay nada que este bypass exponga. `no-store` para que ningún
      // CDN fije la versión anónima de estas rutas como si fuera la normal.
      supabaseResponse.headers.set("Cache-Control", "no-store, must-revalidate");
      supabaseResponse.headers.set("X-Auth-Degraded", auth.reason);
      return supabaseResponse;
    }

    return new NextResponse(renderServiceUnavailablePage(pathname), {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
        "Retry-After": "30",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  const user = auth.status === "authenticated" ? auth.user : null;

  // spec-051 (D2/D3): gate de cambio forzado de contraseña. La marca
  // `must_change_password` vive en `app_metadata`, que `auth.user` ya trae
  // completo desde el `getUser()` de arriba — cero consultas adicionales a
  // Postgres (a diferencia del bloque /admin de más abajo, que sí paga una
  // consulta a `user_roles`). `getUser()` revalida contra el servidor de Auth
  // en cada llamada (no decodifica un JWT local cacheado — por eso el resto
  // de este archivo puede permitirse reintentos/timeouts), así que en cuanto
  // la Fase 3 o el propio cambio (Fase 2) limpian la marca, la siguiente
  // request ya no la ve.
  //
  // Va antes del gate de sesión de abajo para que un usuario marcado no vea
  // ninguna otra página, ni siquiera /login o /registro si de algún modo
  // llega ahí con sesión viva. Exención de la propia ruta: sin ella, redirigir
  // a /cambiar-contrasena entraría en bucle contra sí misma.
  //
  // Sin exención aparte para "cerrar sesión": el formulario del navbar
  // (components/navbar/{Navbar,UserMenu}.tsx) es un Server Action que hace
  // POST a la URL de la página actual — que para un usuario marcado siempre
  // es /cambiar-contrasena, porque este mismo gate no lo deja estar en
  // ninguna otra — así que ya queda cubierto por la exención de ruta. Para
  // cuando el redirect("/") de signOut() vuelve a pasar por este middleware,
  // las cookies de sesión ya se limpiaron: auth.status deja de ser
  // "authenticated" y este bloque ni se evalúa.
  if (
    user &&
    user.app_metadata?.must_change_password &&
    pathname !== CHANGE_PASSWORD_PATH
  ) {
    const changePasswordUrl = request.nextUrl.clone();
    changePasswordUrl.pathname = CHANGE_PASSWORD_PATH;
    return NextResponse.redirect(changePasswordUrl);
  }

  // Todo el sitio requiere sesión activa, salvo las rutas de auth
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isPublic && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin — requiere sesión + rol teacher o admin
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdmin) {
    // `!supabase` es inalcanzable en la práctica en este punto (solo es
    // `null` cuando `auth.status === "unavailable"`, caso ya resuelto arriba
    // con un 503) — se comprueba de todos modos para que TypeScript enlace
    // la nulabilidad de `supabase` con la de `user` y como defensa ante un
    // futuro refactor.
    if (!user || !supabase) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // DEBT-040 (fuera del alcance de spec-046, ver "No incluye"): esta
    // consulta a `user_roles` sigue descartando `error` al destructurar. Un
    // fallo de lectura de Postgres/RLS (con Auth sano) expulsa a un docente
    // legítimo a "/" en vez de señalar un fallo de infraestructura.
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["teacher", "admin"]);

    if (!roles || roles.length === 0) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
