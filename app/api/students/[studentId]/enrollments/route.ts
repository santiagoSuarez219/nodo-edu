import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest, AuthenticationError } from "@/lib/api/auth";
import {
  apiError,
  unauthorizedError,
  validationError,
  notFoundError,
  configurationError,
  internalError,
} from "@/lib/api/errors";
import {
  getServiceStudentById,
  enrollServiceStudent,
  unenrollServiceStudent,
} from "@/lib/students/service";
import { EnrollStudentSchema } from "@/lib/students/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireStudentsAdminAuth(req: NextRequest) {
  await authenticateServiceRequest(req, "STUDENTS_ADMIN_API_KEY");
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const student = await getServiceStudentById(studentId);
    if (!student) {
      return NextResponse.json(notFoundError("Estudiante no encontrado"), {
        status: 404,
      });
    }

    return NextResponse.json({ data: student.enrollments }, { status: 200 });
  } catch (err) {
    console.error("GET /api/students/[studentId]/enrollments error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}

export async function POST(
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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(apiError("bad_request", "JSON malformado"), {
        status: 400,
      });
    }

    const parsed = EnrollStudentSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      return NextResponse.json(validationError(fieldErrors), { status: 422 });
    }

    const result = await enrollServiceStudent(studentId, {
      academicCourseId: parsed.data.academic_course_id,
      enrollmentCode: parsed.data.enrollment_code,
    });
    if (!result.ok) {
      return NextResponse.json(apiError("bad_request", result.error), {
        status: 400,
      });
    }

    return NextResponse.json({ data: result.enrollment }, { status: 201 });
  } catch (err) {
    console.error("POST /api/students/[studentId]/enrollments error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}

export async function DELETE(
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

    const academicCourseId = new URL(req.url).searchParams.get(
      "academic_course_id"
    );
    if (!academicCourseId) {
      return NextResponse.json(
        apiError("validation_error", "academic_course_id es requerido"),
        { status: 422 }
      );
    }

    const result = await unenrollServiceStudent(studentId, academicCourseId);
    if (!result.ok) {
      return NextResponse.json(notFoundError(result.error), { status: 404 });
    }

    return NextResponse.json({ data: result.enrollment }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/students/[studentId]/enrollments error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
