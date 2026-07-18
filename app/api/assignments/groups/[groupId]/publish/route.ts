import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  notFoundError,
  internalError,
  apiError,
} from "@/lib/api/errors";
import { publishGroup, getGroupDetail } from "@/lib/assignments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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

    const result = await publishGroup(groupId);

    if (!result.ok) {
      if (result.error.includes("no encontrado")) {
        const response = notFoundError(result.error);
        return NextResponse.json(response, { status: 404 });
      } else {
        const response = apiError("validation_error", result.error);
        return NextResponse.json(response, { status: 422 });
      }
    }

    const group = await getGroupDetail(groupId);
    if (!group) {
      const response = notFoundError("Grupo no encontrado después de publicar");
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json({ data: group }, { status: 200 });
  } catch (err) {
    console.error("POST /api/assignments/groups/[groupId]/publish error:", err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
