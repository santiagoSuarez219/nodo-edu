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
  getServiceLessonQuestions,
  reorderServiceLessonQuestions,
} from "@/lib/questions/service";
import { ReorderLessonQuestionsSchema } from "@/lib/questions/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { courseSlug, lessonSlug } = await params;
    const questions = await getServiceLessonQuestions(courseSlug, lessonSlug);

    return NextResponse.json(
      { data: questions, meta: { total: questions.length, course_slug: courseSlug, lesson_slug: lessonSlug } },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/lessons/[courseSlug]/[lessonSlug]/questions error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

// D6: SOLO reordena. La lista enviada debe coincidir exactamente con lo
// montado (ni de más ni de menos) — ninguna llamada de esta ruta puede
// desmontar una pregunta de la lección (eso alteraría notas, ver spec-042).
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { courseSlug, lessonSlug } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const response = apiError("bad_request", "JSON malformado");
      return NextResponse.json(response, { status: 400 });
    }

    const parsed = ReorderLessonQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const result = await reorderServiceLessonQuestions(
      courseSlug,
      lessonSlug,
      parsed.data.question_ids
    );

    if (!result.ok) {
      if (result.reason === "not_found") {
        const response = notFoundError(
          "No hay preguntas montadas en esta lección, o no son del actor autenticado"
        );
        return NextResponse.json(response, { status: 404 });
      }
      if (result.reason === "mismatch") {
        const response = apiError(
          "validation_error",
          "La lista enviada no coincide exactamente con las preguntas montadas en esta lección. " +
            "Este endpoint solo reordena — para montar o desmontar preguntas usa " +
            "POST/DELETE /api/questions/{questionId}/lessons.",
          { mounted: result.mounted }
        );
        return NextResponse.json(response, { status: 422 });
      }
      const response = apiError("error", result.error);
      return NextResponse.json(response, { status: 400 });
    }

    const questions = await getServiceLessonQuestions(courseSlug, lessonSlug);
    return NextResponse.json({ data: questions }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/lessons/[courseSlug]/[lessonSlug]/questions error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
