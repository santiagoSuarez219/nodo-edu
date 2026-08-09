import { type NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/auth/middleware";
import { renderServiceUnavailablePage } from "@/lib/auth/service-unavailable-page";

const ADMIN_PREFIXES = ["/admin"];
const PUBLIC_PREFIXES = [
  "/login",
  "/registro",
  "/api", // rutas de servicio (MCP) — autenticadas con API key, no con sesión
  "/servicio-no-disponible", // spec-046 — destino del propio gate, debe quedar exento o entra en bucle
];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, auth, supabase } = await updateSupabaseSession(request);

  const { pathname } = request.nextUrl;

  // spec-046: Supabase Auth no se pudo verificar (caído, inalcanzable, mal
  // configurado). Antes de este spec, `user: null` era indistinguible de
  // "no hay sesión" y el gate expulsaba a todo el mundo a /login — con
  // /login necesitando el mismo servicio caído, nadie podía volver a entrar
  // (DEBT-042). /api queda exento (decisión D3): son rutas MCP autenticadas
  // por API key, no por sesión, y devolverles HTML rompería a los 5 MCPs
  // del proyecto.
  if (auth.status === "unavailable") {
    const isExemptFromOutage = pathname.startsWith("/api");
    if (!isExemptFromOutage) {
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
    // con un 503 o, si es /api, sin llegar nunca a /admin) — se comprueba de
    // todos modos para que TypeScript enlace la nulabilidad de `supabase`
    // con la de `user` y como defensa ante un futuro refactor.
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
