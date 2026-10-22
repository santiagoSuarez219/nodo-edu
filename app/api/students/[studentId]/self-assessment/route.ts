import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest, AuthenticationError } from "@/lib/api/auth";
import {
  unauthorizedError,
  validationError,
  notFoundError,
  configurationError,
  internalError,
  apiError,
} from "@/lib/api/errors";
import {
  getServiceStudentById,
  getServiceStudentSelfAssessmentSummary,
} from "@/lib/students/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireStudentsAdminAuth(req: NextRequest) {
  await authenticateServiceRequest(req, "STUDENTS_ADMIN_API_KEY");
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// spec-040 Fase 7: solo lectura. La nota de autoevaluaciones es derivada
// (la recalcula la propagación a la libreta), así que este recurso no expone
// ni expondrá métodos de escritura.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    await requireStudentsAdminAuth(req);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return NextResponse.json(unauthorizedError(err.message), { status: 401 });
    }
    console.error("STUDENTS_ADMIN_API_KEY error de configuración:", err);
    return NextResponse.json(configurationError("Servicio mal configurado."), {
      status: 500,
    });
  }

  try {
    const { studentId } = await params;
    if (!UUID_RE.test(studentId)) {
      return NextResponse.json(notFoundError("ID de estudiante inválido"), {
        status: 404,
      });
    }

    // D10: exactamente uno de los dos.
    const searchParams = new URL(req.url).searchParams;
    const courseSlug = searchParams.get("course_slug");
    const academicCourseId = searchParams.get("academic_course_id");
    if (!courseSlug === !academicCourseId) {
      return NextResponse.json(
        validationError({
          academic_course_id: [
            "Indica exactamente uno: academic_course_id (preferido) o course_slug",
          ],
        }),
        { status: 422 }
      );
    }
    if (academicCourseId && !UUID_RE.test(academicCourseId)) {
      return NextResponse.json(
        validationError({ academic_course_id: ["academic_course_id inválido"] }),
        { status: 422 }
      );
    }

    const student = await getServiceStudentById(studentId);
    if (!student) {
      return NextResponse.json(notFoundError("Estudiante no encontrado"), {
        status: 404,
      });
    }

    const result = await getServiceStudentSelfAssessmentSummary(
      studentId,
      academicCourseId
        ? { academicCourseId }
        : { courseSlug: courseSlug as string }
    );
    if (!result.ok) {
      if (result.kind === "not_found") {
        return NextResponse.json(notFoundError(result.error), { status: 404 });
      }
      if (result.kind === "ambiguous") {
        return NextResponse.json(
          apiError("conflict", result.error, { groups: result.groups }),
          { status: 409 }
        );
      }
      return NextResponse.json(apiError("internal_error", result.error), {
        status: 500,
      });
    }

    return NextResponse.json({ data: result.summary }, { status: 200 });
  } catch (err) {
    console.error("GET /api/students/[studentId]/self-assessment error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
