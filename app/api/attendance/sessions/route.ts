import { NextRequest, NextResponse } from 'next/server';
import { authenticateServiceRequest } from '@/lib/api/auth';
import { unauthorizedError, internalError, apiError } from '@/lib/api/errors';
import { getServiceSessions } from '@/lib/attendance/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await authenticateServiceRequest(req);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'API key no válida';
    const response = unauthorizedError(message);
    return NextResponse.json(response, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get('courseId');
    if (!courseId) {
      const response = apiError(
        'validation_error',
        'courseId es requerido'
      );
      return NextResponse.json(response, { status: 422 });
    }

    const fromDate = searchParams.get('fromDate') ?? undefined;
    const toDate = searchParams.get('toDate') ?? undefined;
    const isOpen = searchParams.get('isOpen')
      ? searchParams.get('isOpen') === 'true'
      : undefined;
    const limit = searchParams.get('limit')
      ? Math.min(parseInt(searchParams.get('limit')!, 10), 100)
      : 100;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!, 10)
      : 0;

    const sessions = await getServiceSessions({
      courseId,
      fromDate,
      toDate,
      isOpen,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        data: sessions,
        meta: { total: sessions.length, limit, offset },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('GET /api/attendance/sessions error:', err);
    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
