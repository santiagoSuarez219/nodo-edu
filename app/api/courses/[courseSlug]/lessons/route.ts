import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest, AuthenticationError } from "@/lib/api/auth";
import {
  unauthorizedError,
  notFoundError,
  configurationError,
  internalError,
} from "@/lib/api/errors";
import { getCourseBySlug } from "@/lib/courses";
import { listServiceCourseLessons } from "@/lib/courses/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireCoursesAdminAuth(req: NextRequest) {
  await authenticateServiceRequest(req, "COURSES_ADMIN_API_KEY");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    await requireCoursesAdminAuth(req);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return NextResponse.json(unauthorizedError(err.message), { status: 401 });
    }
    // Falta COURSES_ADMIN_API_KEY en el entorno: error de configuración del
    // servidor, no de credenciales del llamador — nunca 401 (filtraría el
    // motivo exacto a un cliente no autenticado).
    console.error("COURSES_ADMIN_API_KEY error de configuración:", err);
    return NextResponse.json(configurationError("Servicio mal configurado."), {
      status: 500,
    });
  }

  try {
    const { courseSlug } = await params;

    // Validación contra el catálogo estático ANTES de tocar Supabase.
    const course = await getCourseBySlug(courseSlug);
    if (!course) {
      return NextResponse.json(
        notFoundError(`Curso no encontrado: ${courseSlug}`),
        { status: 404 }
      );
    }

    const listing = await listServiceCourseLessons(course);
    return NextResponse.json(listing, { status: 200 });
  } catch (err) {
    console.error("GET /api/courses/[courseSlug]/lessons error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
