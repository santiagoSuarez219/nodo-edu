import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  apiError,
  unauthorizedError,
  validationError,
  notFoundError,
  conflictError,
  internalError,
} from "@/lib/api/errors";
import {
  getServiceKeywordBySlug,
  updateServiceKeyword,
  deleteServiceKeyword,
} from "@/lib/keywords/service";
import { KeywordUpdateSchema } from "@/lib/keywords/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { slug } = await params;
    const keyword = await getServiceKeywordBySlug(slug);

    if (!keyword) {
      const response = notFoundError("Keyword no encontrada");
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: keyword }, { status: 200 });
  } catch (err) {
    console.error("GET /api/keywords/[slug] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { slug } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const response = apiError("bad_request", "JSON malformado");
      return NextResponse.json(response, { status: 400 });
    }

    const parsed = KeywordUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const keyword = await updateServiceKeyword(slug, parsed.data);

    if (!keyword) {
      const response = notFoundError("Keyword no encontrada");
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: keyword }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/keywords/[slug] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { slug } = await params;
    const result = await deleteServiceKeyword(slug);

    if (!result.ok) {
      if (result.code === "not_found") {
        const response = notFoundError(result.error);
        return NextResponse.json(response, { status: 404 });
      }
      if (result.code === "conflict") {
        const response = conflictError(result.error);
        return NextResponse.json(response, { status: 409 });
      }
      const response = apiError("error", result.error);
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json({ deleted: true, slug }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/keywords/[slug] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
