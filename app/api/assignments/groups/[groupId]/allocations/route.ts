import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  notFoundError,
  internalError,
} from "@/lib/api/errors";
import { listAllocations } from "@/lib/assignments/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const allocations = await listAllocations(groupId);
    return NextResponse.json({ data: allocations }, { status: 200 });
  } catch (err) {
    console.error(
      "GET /api/assignments/groups/[groupId]/allocations error:",
      err
    );
    const message =
      err instanceof Error ? err.message : "Error al obtener asignaciones";

    if (message.includes("no encontrado")) {
      const response = notFoundError(message);
      return NextResponse.json(response, { status: 404 });
    }

    const response = internalError(message);
    return NextResponse.json(response, { status: 500 });
  }
}
