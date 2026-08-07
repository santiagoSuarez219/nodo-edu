import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  apiError,
  unauthorizedError,
  validationError,
  notFoundError,
  internalError,
} from "@/lib/api/errors";
import {
  getServiceQuestionLessons,
  mountServiceQuestionInLesson,
  unmountServiceQuestionFromLesson,
} from "@/lib/questions/service";
import { MountQuestionSchema } from "@/lib/questions/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidUuid(value: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(value);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { questionId } = await params;
    if (!isValidUuid(questionId)) {
      const response = notFoundError("ID de pregunta inválido");
      return NextResponse.json(response, { status: 404 });
    }

    const lessons = await getServiceQuestionLessons(questionId);

    if (lessons === null) {
      const response = notFoundError("Pregunta no encontrada");
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: lessons }, { status: 200 });
  } catch (err) {
    console.error("GET /api/questions/[questionId]/lessons error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

// Monta la pregunta en una lección. Idempotente: montarla dos veces no
// cambia su order_index (ver lib/questions/index.ts:_mountQuestionInLesson).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { questionId } = await params;
    if (!isValidUuid(questionId)) {
      const response = notFoundError("ID de pregunta inválido");
      return NextResponse.json(response, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const response = apiError("bad_request", "JSON malformado");
      return NextResponse.json(response, { status: 400 });
    }

    const parsed = MountQuestionSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const result = await mountServiceQuestionInLesson(
      questionId,
      parsed.data.course_slug,
      parsed.data.lesson_slug
    );

    if (!result.ok) {
      if (result.reason === "not_found") {
        const response = notFoundError("Pregunta no encontrada o no autorizado");
        return NextResponse.json(response, { status: 404 });
      }
      const response = apiError("error", result.error);
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json({ data: result.mount }, { status: 201 });
  } catch (err) {
    console.error("POST /api/questions/[questionId]/lessons error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

// Desmonta la pregunta de una lección: ?course_slug=...&lesson_slug=...
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { questionId } = await params;
    if (!isValidUuid(questionId)) {
      const response = notFoundError("ID de pregunta inválido");
      return NextResponse.json(response, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get("course_slug");
    const lessonSlug = searchParams.get("lesson_slug");

    if (!courseSlug || !lessonSlug) {
      const response = validationError({
        course_slug: courseSlug ? [] : ["course_slug es requerido como query param"],
        lesson_slug: lessonSlug ? [] : ["lesson_slug es requerido como query param"],
      });
      return NextResponse.json(response, { status: 422 });
    }

    const result = await unmountServiceQuestionFromLesson(questionId, courseSlug, lessonSlug);

    if (!result.ok) {
      if (result.reason === "not_found") {
        const response = notFoundError("Pregunta no encontrada o no autorizado");
        return NextResponse.json(response, { status: 404 });
      }
      const response = apiError("error", result.error);
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json(
      { unmounted: true, question_id: questionId, course_slug: courseSlug, lesson_slug: lessonSlug },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/questions/[questionId]/lessons error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
