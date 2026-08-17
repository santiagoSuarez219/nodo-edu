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
import { resetServiceStudentPassword } from "@/lib/students/service";
import { ResetStudentPasswordSchema } from "@/lib/students/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireStudentsAdminAuth(req: NextRequest) {
  await authenticateServiceRequest(req, "STUDENTS_ADMIN_API_KEY");
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// spec-051 (Fase 5): mismo dominio y misma clave de servicio que el resto de
// /api/students/*, no un endpoint aparte — restablecer una contraseña es
// tan "administración de estudiantes" como crear o matricular. `password` es
// opcional (ResetStudentPasswordSchema): sin ella, resetServiceStudentPassword
// genera una legible para dictar en clase (D7 de spec-051). La respuesta
// devuelve la contraseña UNA vez, la misma información que ya vería el
// docente en la UI (ResetPasswordButton) — no es un dato nuevo que este
// endpoint invente exponer.
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

    // Cuerpo opcional: sin body, o con `{}`, se genera la contraseña.
    let body: unknown = {};
    const rawBody = await req.text();
    if (rawBody.trim().length > 0) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(apiError("bad_request", "JSON malformado"), {
          status: 400,
        });
      }
    }

    const parsed = ResetStudentPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      return NextResponse.json(validationError(fieldErrors), { status: 422 });
    }

    const result = await resetServiceStudentPassword(studentId, parsed.data.password);
    if (!result.ok) {
      return NextResponse.json(notFoundError(result.error), { status: 404 });
    }

    return NextResponse.json({ data: result.result }, { status: 200 });
  } catch (err) {
    console.error("POST /api/students/[studentId]/reset-password error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
