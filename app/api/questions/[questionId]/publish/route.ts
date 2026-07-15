import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  validationError,
  notFoundError,
  internalError,
} from "@/lib/api/errors";
import { publishServiceQuestion } from "@/lib/questions/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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

    const result = await publishServiceQuestion(questionId);

    if (!result.ok) {
      if (result.error.includes("no encontrada")) {
        const response = notFoundError(result.error);
        return NextResponse.json(response, { status: 404 });
      } else {
        const response = validationError({
          publish: [result.error],
        });
        return NextResponse.json(response, { status: 422 });
      }
    }

    return NextResponse.json(
      {
        data: {
          id: questionId,
          is_published: true,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/questions/[questionId]/publish error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
