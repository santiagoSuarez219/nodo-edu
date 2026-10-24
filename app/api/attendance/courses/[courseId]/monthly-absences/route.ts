import { NextRequest, NextResponse } from 'next/server';
import { authenticateServiceRequest } from '@/lib/api/auth';
import { unauthorizedError, internalError, apiError } from '@/lib/api/errors';
import { getServiceMonthlyAbsenceSummary } from '@/lib/attendance/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// spec-063 Fase 5: inasistencias por estudiante y mes, en horas y clases.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'API key no válida';
    return NextResponse.json(unauthorizedError(message), { status: 401 });
  }

  try {
    const { courseId } = await params;
    const month = new URL(req.url).searchParams.get('month') ?? undefined;

    if (!UUID_RE.test(courseId)) {
      return NextResponse.json(
        apiError('validation_error', 'courseId debe ser un UUID válido'),
        { status: 422 }
      );
    }
    if (month !== undefined && !MONTH_RE.test(month)) {
      return NextResponse.json(
        apiError('validation_error', 'month debe tener formato YYYY-MM'),
        { status: 422 }
      );
    }

    const summary = await getServiceMonthlyAbsenceSummary(courseId, { month });
    if (!summary) {
      return NextResponse.json(apiError('not_found', 'Curso no encontrado'), {
        status: 404,
      });
    }

    return NextResponse.json({ data: summary }, { status: 200 });
  } catch (err) {
    console.error('GET /api/attendance/courses/[courseId]/monthly-absences error:', err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
