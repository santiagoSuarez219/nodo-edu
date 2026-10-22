import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest, AuthenticationError } from "@/lib/api/auth";
import {
  unauthorizedError,
  notFoundError,
  configurationError,
  internalError,
} from "@/lib/api/errors";
import { getCourseBySlug } from "@/lib/courses";
import { listServiceCourseGroups } from "@/lib/courses/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// spec-060: grupos (cursos académicos) de un course_slug. Misma clave que el
// resto de /api/courses/*.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  try {
    await authenticateServiceRequest(req, "COURSES_ADMIN_API_KEY");
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return NextResponse.json(unauthorizedError(err.message), { status: 401 });
    }
    console.error("COURSES_ADMIN_API_KEY error de configuración:", err);
    return NextResponse.json(configurationError("Servicio mal configurado."), {
      status: 500,
    });
  }

  try {
    const { courseSlug } = await params;
    const course = await getCourseBySlug(courseSlug);
    if (!course) {
      return NextResponse.json(
        notFoundError(`Curso no encontrado: ${courseSlug}`),
        { status: 404 }
      );
    }

    const groups = await listServiceCourseGroups(course.slug);
    return NextResponse.json(
      { data: { course_slug: course.slug, groups }, meta: { total: groups.length } },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/courses/[courseSlug]/groups error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
