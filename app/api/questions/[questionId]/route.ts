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
  getServiceQuestionById,
  updateServiceQuestion,
  deleteServiceQuestion,
} from "@/lib/questions/service";
import { QuestionSchema } from "@/lib/questions/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { questionId } = await params;

    if (!questionId || !/^[0-9a-f-]{36}$/i.test(questionId)) {
      const response = notFoundError("ID de pregunta inválido");
      return NextResponse.json(response, { status: 404 });
    }

    const question = await getServiceQuestionById(questionId);

    if (!question) {
      const response = notFoundError("Pregunta no encontrada");
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: question }, { status: 200 });
  } catch (err) {
    console.error("GET /api/questions/[questionId] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { questionId } = await params;

    if (!questionId || !/^[0-9a-f-]{36}$/i.test(questionId)) {
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
    const question = await updateServiceQuestion(questionId, input);

    if (!question) {
      const response = notFoundError(
        "Pregunta no encontrada o no autorizado"
      );
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: question }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/questions/[questionId] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "API key no válida";
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { questionId } = await params;

    if (!questionId || !/^[0-9a-f-]{36}$/i.test(questionId)) {
      const response = notFoundError("ID de pregunta inválido");
      return NextResponse.json(response, { status: 404 });
    }

    const result = await deleteServiceQuestion(questionId);

    if (!result.ok) {
      if (result.error.includes("no encontrado")) {
        const response = notFoundError(result.error);
        return NextResponse.json(response, { status: 404 });
      } else if (result.error.includes("en uso")) {
        const response = conflictError(result.error);
        return NextResponse.json(response, { status: 409 });
      } else {
        const response = apiError("error", result.error);
        return NextResponse.json(response, { status: 400 });
      }
    }

    return NextResponse.json(
      { deleted: true, id: questionId },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/questions/[questionId] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
