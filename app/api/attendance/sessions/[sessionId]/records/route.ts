import { NextRequest, NextResponse } from 'next/server';
import { authenticateServiceRequest } from '@/lib/api/auth';
import { unauthorizedError, internalError, apiError } from '@/lib/api/errors';
import { getServiceSessionAttendance } from '@/lib/attendance/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
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
    const { sessionId } = await params;

    if (!sessionId) {
      const response = apiError(
        'validation_error',
        'sessionId es requerido'
      );
      return NextResponse.json(response, { status: 422 });
    }

    const attendance = await getServiceSessionAttendance(sessionId);

    return NextResponse.json(
      { data: attendance },
      { status: 200 }
    );
  } catch (err) {
    console.error('GET /api/attendance/sessions/[sessionId]/records error:', err);

    const message = err instanceof Error ? err.message : 'Error interno';

    if (message.includes('no encontrada')) {
      const response = apiError('not_found', 'Sesión no encontrada');
      return NextResponse.json(response, { status: 404 });
    }

    const response = internalError();
    return NextResponse.json(response, { status: 500 });
  }
}
