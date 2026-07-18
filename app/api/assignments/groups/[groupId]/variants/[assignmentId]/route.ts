import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  validationError,
  notFoundError,
  internalError,
  apiError,
} from "@/lib/api/errors";
import { replaceVariantQuestions } from "@/lib/assignments/service";
import { AssignmentQuestionInputSchema } from "@/lib/assignments/schemas";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReplaceQuestionsSchema = z.object({
  questions: z.array(AssignmentQuestionInputSchema),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; assignmentId: string }> }
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
    const { groupId, assignmentId } = await params;

    if (
      !groupId ||
      !/^[0-9a-f-]{36}$/i.test(groupId) ||
      !assignmentId ||
      !/^[0-9a-f-]{36}$/i.test(assignmentId)
    ) {
      const response = notFoundError("IDs inválidos");
      return NextResponse.json(response, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const response = apiError("bad_request", "JSON malformado");
      return NextResponse.json(response, { status: 400 });
    }

    const parsed = ReplaceQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const { questions } = parsed.data;
    const result = await replaceVariantQuestions(assignmentId, questions);

    if (!result.ok) {
      if (result.error.includes("no encontrada")) {
        const response = notFoundError(result.error);
        return NextResponse.json(response, { status: 404 });
      } else {
        const response = apiError("validation_error", result.error);
        return NextResponse.json(response, { status: 422 });
      }
    }

    return NextResponse.json(
      { ok: true, assignment_id: assignmentId },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "PATCH /api/assignments/groups/[groupId]/variants/[assignmentId] error:",
      err
    );
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
