import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest, AuthenticationError } from "@/lib/api/auth";
import {
  apiError,
  unauthorizedError,
  validationError,
  configurationError,
  internalError,
} from "@/lib/api/errors";
import { listServiceStudents, createServiceStudent } from "@/lib/students/service";
import { CreateStudentSchema } from "@/lib/students/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireStudentsAdminAuth(req: NextRequest) {
  await authenticateServiceRequest(req, "STUDENTS_ADMIN_API_KEY");
}

export async function GET(req: NextRequest) {
  try {
    await requireStudentsAdminAuth(req);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return NextResponse.json(unauthorizedError(err.message), { status: 401 });
    }
    // Falta STUDENTS_ADMIN_API_KEY en el entorno: error de configuración del
    // servidor, no de credenciales del llamador — nunca 401 (filtraría el
    // motivo exacto a un cliente no autenticado).
    console.error("STUDENTS_ADMIN_API_KEY error de configuración:", err);
    return NextResponse.json(configurationError("Servicio mal configurado."), {
      status: 500,
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const academicCourseId = searchParams.get("academic_course_id") ?? undefined;
    const search = searchParams.get("q") ?? undefined;
    const limit = searchParams.get("limit")
      ? Math.min(parseInt(searchParams.get("limit")!, 10), 100)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    const students = await listServiceStudents({
      academicCourseId,
      search,
      limit,
      offset,
    });

    return NextResponse.json(
      { data: students, meta: { total: students.length, limit, offset } },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/students error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireStudentsAdminAuth(req);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return NextResponse.json(unauthorizedError(err.message), { status: 401 });
    }
    // Falta STUDENTS_ADMIN_API_KEY en el entorno: error de configuración del
    // servidor, no de credenciales del llamador — nunca 401 (filtraría el
    // motivo exacto a un cliente no autenticado).
    console.error("STUDENTS_ADMIN_API_KEY error de configuración:", err);
    return NextResponse.json(configurationError("Servicio mal configurado."), {
      status: 500,
    });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(apiError("bad_request", "JSON malformado"), {
        status: 400,
      });
    }

    const parsed = CreateStudentSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      return NextResponse.json(validationError(fieldErrors), { status: 422 });
    }

    const result = await createServiceStudent(parsed.data);
    if (!result.ok) {
      return NextResponse.json(apiError("bad_request", result.error), {
        status: 400,
      });
    }

    return NextResponse.json(
      {
        data: result.student,
        ...(result.enrollment_warning && { warning: result.enrollment_warning }),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/students error:", err);
    const message = err instanceof Error ? err.message : "Error al crear el estudiante";
    return NextResponse.json(internalError(message), { status: 500 });
  }
}
