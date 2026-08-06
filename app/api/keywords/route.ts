import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  validationError,
  configurationError,
  conflictError,
  apiError,
  internalError,
} from "@/lib/api/errors";
import { getServiceKeywords, createServiceKeyword } from "@/lib/keywords/service";
import { KeywordCreateSchema, ListKeywordsFiltersSchema } from "@/lib/keywords/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const parsed = ListKeywordsFiltersSchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      kind: searchParams.get("kind") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const keywords = await getServiceKeywords(parsed.data);

    return NextResponse.json(
      { data: keywords, meta: { total: keywords.length, ...parsed.data } },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/keywords error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
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

    const parsed = KeywordCreateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const result = await createServiceKeyword(parsed.data);

    if (!result.ok) {
      if (result.code === "conflict") {
        const response = conflictError(result.error);
        return NextResponse.json(response, { status: 409 });
      }
      const response = apiError("validation_error", result.error);
      return NextResponse.json(response, { status: 422 });
    }

    return NextResponse.json({ data: result.keyword }, { status: 201 });
  } catch (err) {
    console.error("POST /api/keywords error:", err);
    const message = err instanceof Error ? err.message : "Error al crear la keyword";

    if (message.includes("QUESTION_BANK_AGENT_TEACHER_ID")) {
      const response = configurationError(message);
      return NextResponse.json(response, { status: 500 });
    }

    const response = internalError(message);
    return NextResponse.json(response, { status: 500 });
  }
}
