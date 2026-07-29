import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest, AuthenticationError } from "@/lib/api/auth";
import {
  apiError,
  unauthorizedError,
  validationError,
  notFoundError,
  conflictError,
  configurationError,
  internalError,
} from "@/lib/api/errors";
import {
  getServiceStudentById,
  updateServiceStudent,
  deleteServiceStudent,
} from "@/lib/students/service";
import { UpdateStudentSchema } from "@/lib/students/schemas";

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

    return NextResponse.json({ data: student }, { status: 200 });
  } catch (err) {
    console.error("GET /api/students/[studentId] error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}

export async function PATCH(
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

    const parsed = UpdateStudentSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      return NextResponse.json(validationError(fieldErrors), { status: 422 });
    }

    const student = await updateServiceStudent(studentId, parsed.data);
    if (!student) {
      return NextResponse.json(notFoundError("Estudiante no encontrado"), {
        status: 404,
      });
    }

    return NextResponse.json({ data: student }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/students/[studentId] error:", err);
    const message = err instanceof Error ? err.message : "Error al actualizar el estudiante";
    return NextResponse.json(internalError(message), { status: 500 });
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

    const result = await deleteServiceStudent(studentId);
    if (!result.ok) {
      if (result.error === "Estudiante no encontrado.") {
        return NextResponse.json(notFoundError(result.error), { status: 404 });
      }
      // No se pudo borrar por FKs restrict (entregas reales) — es un
      // conflicto de estado, no un "no encontrado".
      return NextResponse.json(conflictError(result.error), { status: 409 });
    }

    return NextResponse.json({ data: result.result }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/students/[studentId] error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
