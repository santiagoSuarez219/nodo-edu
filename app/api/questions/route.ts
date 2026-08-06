import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  validationError,
  configurationError,
  internalError,
  apiError,
} from "@/lib/api/errors";
import {
  getServiceQuestions,
  createServiceQuestion,
} from "@/lib/questions/service";
import { QuestionSchema, findLegacyQuestionFields } from "@/lib/questions/schemas";

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

    // spec-042: se mantienen con el mismo nombre (D6) — ahora resuelven vía
    // lesson_questions en vez de columnas directas de questions.
    const courseSlug = searchParams.get("course_slug") ?? undefined;
    const lessonSlug = searchParams.get("lesson_slug") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const difficulty = searchParams.get("difficulty")
      ? parseInt(searchParams.get("difficulty")!, 10)
      : undefined;
    // spec-042: `tag` → `keyword` (vocabulario controlado, ver D2).
    const keyword = searchParams.get("keyword") ?? undefined;
    const isPublished = searchParams.get("is_published")
      ? searchParams.get("is_published") === "true"
      : undefined;
    const q = searchParams.get("q") ?? undefined;
    const limit = searchParams.get("limit")
      ? Math.min(parseInt(searchParams.get("limit")!, 10), 100)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : 0;

    if (
      difficulty !== undefined &&
      (difficulty < 1 || difficulty > 5 || !Number.isInteger(difficulty))
    ) {
      const response = apiError(
        "validation_error",
        "difficulty debe ser un número entero entre 1 y 5"
      );
      return NextResponse.json(response, { status: 422 });
    }

    if (
      type &&
      ![
        "multiple_choice",
        "open_text",
        "code_snippet",
        "code_write",
        "coding_challenge",
      ].includes(type)
    ) {
      const response = apiError(
        "validation_error",
        "type debe ser uno de: multiple_choice, open_text, code_snippet, code_write, coding_challenge"
      );
      return NextResponse.json(response, { status: 422 });
    }

    const questions = await getServiceQuestions({
      courseSlug,
      lessonSlug,
      type,
      difficulty,
      keyword,
      isPublished,
      q,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        data: questions,
        meta: { total: questions.length, limit, offset },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/questions error:", err);
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

    // spec-042 D2: el contrato anterior (course_slug/lesson_slug/tags) no se
    // ignora en silencio — se rechaza con el endpoint correcto.
    const legacyFields = findLegacyQuestionFields(body);
    if (legacyFields.length > 0) {
      const response = apiError(
        "validation_error",
        `El campo${legacyFields.length > 1 ? "s" : ""} ${legacyFields.map((f) => `'${f}'`).join(", ")} ya no ${
          legacyFields.length > 1 ? "se aceptan" : "se acepta"
        } en /api/questions. course_slug/lesson_slug se reemplazaron por el montaje ` +
          "en POST /api/questions/{questionId}/lessons; tags se reemplazó por " +
          "keywords (POST /api/keywords para crear el catálogo, GET /api/keywords para listarlo).",
        { fields: legacyFields }
      );
      return NextResponse.json(response, { status: 422 });
    }

    const parsed = QuestionSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const input = parsed.data;
    const result = await createServiceQuestion(input);

    if (!result.ok) {
      if (result.reason === "invalid_keywords") {
        const response = validationError({
          keywords: result.missing.map(
            (slug) => `La keyword '${slug}' no existe en el catálogo. Créala con POST /api/keywords.`
          ),
        });
        return NextResponse.json(response, { status: 422 });
      }
      if (result.reason === "not_found") {
        // _createQuestionForActor nunca devuelve "not_found" en la práctica
        // (no hay recurso previo que buscar) — se cubre por exhaustividad del
        // tipo compartido con update.
        const response = internalError("Estado inesperado al crear la pregunta.");
        return NextResponse.json(response, { status: 500 });
      }
      const response = internalError(result.error);
      return NextResponse.json(response, { status: 500 });
    }

    return NextResponse.json(
      { data: result.question },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/questions error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Error al crear la pregunta";

    if (message.includes("QUESTION_BANK_AGENT_TEACHER_ID")) {
      const response = configurationError(message);
      return NextResponse.json(response, { status: 500 });
    }

    const response = internalError(message);
    return NextResponse.json(response, { status: 500 });
  }
}
