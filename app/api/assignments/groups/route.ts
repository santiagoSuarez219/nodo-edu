import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  validationError,
  internalError,
  configurationError,
  apiError,
} from "@/lib/api/errors";
import {
  listGroupsForTeacher,
  createGroupWithVariants,
} from "@/lib/assignments/service";
import { AssignmentGroupInputSchema } from "@/lib/assignments/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const academicCourseId = searchParams.get("academic_course_id") ?? undefined;
    const isPublished = searchParams.get("is_published")
      ? searchParams.get("is_published") === "true"
      : undefined;

    const filters: {
      academic_course_id?: string;
      is_published?: boolean;
    } = {};

    if (academicCourseId) {
      filters.academic_course_id = academicCourseId;
    }

    if (isPublished !== undefined) {
      filters.is_published = isPublished;
    }

    const groups = await listGroupsForTeacher(filters);
    return NextResponse.json({ data: groups }, { status: 200 });
  } catch (err) {
    console.error("GET /api/assignments/groups error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const response = apiError("bad_request", "JSON malformado");
      return NextResponse.json(response, { status: 400 });
    }

    const parsed = AssignmentGroupInputSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const input = parsed.data;
    const group = await createGroupWithVariants(input);

    return NextResponse.json({ data: group }, { status: 201 });
  } catch (err) {
    console.error("POST /api/assignments/groups error:", err);
    const message =
      err instanceof Error ? err.message : "Error al crear la evaluación";

    if (message.includes("QUESTION_BANK_AGENT_TEACHER_ID")) {
      const response = configurationError(message);
      return NextResponse.json(response, { status: 500 });
    }

    if (message.includes("Error creando variante")) {
      const response = apiError("validation_error", message);
      return NextResponse.json(response, { status: 422 });
    }

    if (message.includes("Error agregando preguntas")) {
      const response = apiError("validation_error", message);
      return NextResponse.json(response, { status: 422 });
    }

    const response = internalError(message);
    return NextResponse.json(response, { status: 500 });
  }
}
