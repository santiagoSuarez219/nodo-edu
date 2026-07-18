import { NextRequest, NextResponse } from "next/server";
import { authenticateServiceRequest } from "@/lib/api/auth";
import {
  unauthorizedError,
  internalError,
  configurationError,
} from "@/lib/api/errors";
import { listAcademicCoursesForTeacher } from "@/lib/assignments/service";

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
    const courses = await listAcademicCoursesForTeacher();
    return NextResponse.json({ data: courses }, { status: 200 });
  } catch (err) {
    console.error("GET /api/assignments/academic-courses error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Error al obtener cursos académicos";

    if (message.includes("QUESTION_BANK_AGENT_TEACHER_ID")) {
      const response = configurationError(message);
      return NextResponse.json(response, { status: 500 });
    }

    const response = internalError(message);
    return NextResponse.json(response, { status: 500 });
  }
}
