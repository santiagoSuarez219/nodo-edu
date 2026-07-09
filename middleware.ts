import { type NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/auth/middleware";

const PRIVATE_PREFIXES = ["/cuenta"];
const ADMIN_PREFIXES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSupabaseSession(request);

  const { pathname } = request.nextUrl;

  // /cuenta — solo requiere sesión activa
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
  if (isPrivate && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin — requiere sesión + rol teacher o admin
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdmin) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

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
