import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  validationError,
  notFoundError,
  conflictError,
  internalError,
  apiError,
} from "@/lib/api/errors";
import {
  getGroupDetail,
  updateGroup,
  deleteGroup,
} from "@/lib/assignments/service";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateGroupSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  opens_at: z.string().datetime().optional().nullable(),
  closes_at: z.string().datetime().optional().nullable(),
  time_limit_minutes: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .nullable(),
  shuffle_questions: z.boolean().optional(),
  shuffle_choices: z.boolean().optional(),
  show_feedback_on: z.enum(["submit", "close", "never"]).optional(),
  max_attempts: z.coerce.number().int().min(1).optional(),
  grade_item_id: z.string().uuid().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
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
    const { groupId } = await params;

    if (!groupId || !/^[0-9a-f-]{36}$/i.test(groupId)) {
      const response = notFoundError("ID de grupo inválido");
      return NextResponse.json(response, { status: 404 });
    }

    const group = await getGroupDetail(groupId);

    if (!group) {
      const response = notFoundError("Grupo no encontrado");
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: group }, { status: 200 });
  } catch (err) {
    console.error("GET /api/assignments/groups/[groupId] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
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
    const { groupId } = await params;

    if (!groupId || !/^[0-9a-f-]{36}$/i.test(groupId)) {
      const response = notFoundError("ID de grupo inválido");
      return NextResponse.json(response, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const response = apiError("bad_request", "JSON malformado");
      return NextResponse.json(response, { status: 400 });
    }

    const parsed = UpdateGroupSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      const response = validationError(fieldErrors);
      return NextResponse.json(response, { status: 422 });
    }

    const updates = parsed.data;
    const group = await updateGroup(groupId, updates);

    if (!group) {
      const response = notFoundError(
        "Grupo no encontrado o no autorizado"
      );
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: group }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/assignments/groups/[groupId] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
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
    const { groupId } = await params;

    if (!groupId || !/^[0-9a-f-]{36}$/i.test(groupId)) {
      const response = notFoundError("ID de grupo inválido");
      return NextResponse.json(response, { status: 404 });
    }

    const result = await deleteGroup(groupId);

    if (!result.ok) {
      if (result.error.includes("no encontrado")) {
        const response = notFoundError(result.error);
        return NextResponse.json(response, { status: 404 });
      } else if (result.error.includes("submissions")) {
        const response = conflictError(result.error);
        return NextResponse.json(response, { status: 409 });
      } else {
        const response = apiError("error", result.error);
        return NextResponse.json(response, { status: 400 });
      }
    }

    return NextResponse.json(
      { ok: true, id: groupId },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/assignments/groups/[groupId] error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
