import { NextRequest, NextResponse } from 'next/server';
import { authenticateServiceRequest } from '@/lib/api/auth';
import { unauthorizedError, internalError, apiError } from '@/lib/api/errors';
import { getServiceCourseAttendanceSummary } from '@/lib/attendance/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'API key no válida';
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { courseId } = await params;
    const { searchParams } = new URL(req.url);

    if (!courseId) {
      const response = apiError(
        'validation_error',
        'courseId es requerido'
      );
      return NextResponse.json(response, { status: 422 });
    }

    const fromDate = searchParams.get('fromDate') ?? undefined;
    const toDate = searchParams.get('toDate') ?? undefined;

    const summary = await getServiceCourseAttendanceSummary(courseId, {
      fromDate,
      toDate,
    });

    return NextResponse.json(
      { data: summary },
      { status: 200 }
    );
  } catch (err) {
    console.error('GET /api/attendance/courses/[courseId]/summary error:', err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
