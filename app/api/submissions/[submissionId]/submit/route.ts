import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { submitSubmission } from "@/lib/submissions";
import {
  apiError,
  notFoundError,
  unauthorizedError,
  badRequestError,
  serviceUnavailableError,
} from "@/lib/api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ submissionId: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(unauthorizedError(), { status: 401 });
  }

  const { submissionId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, enrollment:enrollments(student_id)")
    .eq("id", submissionId)
    .maybeSingle();

  // spec-050: antes esto descartaba `error` y respondía 404 "Intento no
  // encontrado" tanto si el intento genuinamente no existía como si la
  // consulta había fallado por infraestructura — mentira en el segundo caso,
  // el intento sí existe.
  if (submissionError) {
    return NextResponse.json(serviceUnavailableError(), {
      status: 503,
      headers: { "Retry-After": "30" },
    });
  }

  if (!submission) {
    return NextResponse.json(notFoundError("Intento no encontrado"), { status: 404 });
  }

  const enrollment = submission.enrollment as unknown as { student_id: string } | null;
  if (!enrollment || enrollment.student_id !== user.id) {
    return NextResponse.json(apiError("forbidden", "No autorizado para este intento"), {
      status: 403,
    });
  }

  const result = await submitSubmission(submissionId);
  if (!result.ok) {
    if (result.reason === "unavailable") {
      return NextResponse.json(serviceUnavailableError(result.error), {
        status: 503,
        headers: { "Retry-After": "30" },
      });
    }
    return NextResponse.json(badRequestError(result.error), { status: 400 });
  }

  return NextResponse.json({ auto_score: result.auto_score });
}
