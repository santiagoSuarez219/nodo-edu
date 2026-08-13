import { type NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/auth/middleware";
import { renderServiceUnavailablePage } from "@/lib/auth/service-unavailable-page";

const ADMIN_PREFIXES = ["/admin"];
const PUBLIC_PREFIXES = [
  "/login",
  "/registro",
  "/servicio-no-disponible", // spec-046 — destino del propio gate, debe quedar exento o entra en bucle
];

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

  const { supabaseResponse, auth, supabase } = await updateSupabaseSession(request);

  // spec-046: Supabase Auth no se pudo verificar (caído, inalcanzable, mal
  // configurado). Antes de este spec, `user: null` era indistinguible de
  // "no hay sesión" y el gate expulsaba a todo el mundo a /login — con
  // /login necesitando el mismo servicio caído, nadie podía volver a entrar
  // (DEBT-042).
  if (auth.status === "unavailable") {
    console.error(`[auth] servicio no disponible (${auth.reason}) — ${pathname}`);
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
