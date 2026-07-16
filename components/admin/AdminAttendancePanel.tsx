'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import {
  closeSession,
  getSessionAttendanceCount,
  openSession,
} from '@/lib/attendance';
import type {
  OpenSessionSummary,
} from '@/lib/attendance/types';

interface AdminAttendancePanelProps {
  academicCourseId: string;
  initialSession: OpenSessionSummary | null;
}

export function AdminAttendancePanel({
  academicCourseId,
  initialSession,
}: AdminAttendancePanelProps) {
  const [session, setSession] = useState<OpenSessionSummary | null>(
    initialSession
  );
  const [attendanceCount, setAttendanceCount] = useState(
    initialSession?.attendanceCount ?? 0
  );
  const [isPending, startTransition] = useTransition();

  // Polling para conteo en vivo (cada ~5 segundos mientras haya sesión abierta)
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      startTransition(async () => {
        const count = await getSessionAttendanceCount(session.session.id);
        setAttendanceCount(count);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [session]);

  const handleOpenSession = useCallback(() => {
    startTransition(async () => {
      const result = await openSession(academicCourseId);
      if (result.success && result.session) {
        setSession(result.session);
        setAttendanceCount(result.session.attendanceCount);
      } else {
        alert(`Error: ${result.error || 'No se pudo abrir la sesión'}`);
      }
    });
  }, [academicCourseId]);

  const handleCloseSession = useCallback(() => {
    if (!session) return;

    const confirmed = confirm(
      '¿Estás seguro que quieres cerrar la sesión de asistencia?'
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await closeSession(session.session.id);
      if (result.success) {
        setSession(null);
        setAttendanceCount(0);
      } else {
        alert(`Error: ${result.error || 'No se pudo cerrar la sesión'}`);
      }
    });
  }, [session]);

  // Calcular tiempo restante de expiración
  const getTimeRemaining = useCallback(() => {
    if (!session) return null;
    const expiresAt = new Date(session.session.code_expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'expirado';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [session]);

  const [timeRemaining, setTimeRemaining] = useState<string | null>(getTimeRemaining());

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-8">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              No hay sesión de asistencia abierta. Abre una nueva sesión para que
              los estudiantes puedan marcar asistencia.
            </p>
            <button
              onClick={handleOpenSession}
              disabled={isPending}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {isPending ? 'Abriendo sesión...' : 'Abrir sesión de asistencia'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sesión abierta */}
      <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900 rounded-[var(--radius-base)] px-6 py-6">
        <div className="flex flex-col gap-4">
          {/* Info de sesión */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sesión abierta desde{' '}
                {new Date(session.session.created_at).toLocaleTimeString('es-CO')}
              </p>
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-lg text-sm font-medium w-fit">
                <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400 animate-pulse" />
                Sesión activa
              </div>
            </div>
          </div>

          {/* Código */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-2">
              CÓDIGO DE ASISTENCIA
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-5xl font-mono font-bold text-blue-900 dark:text-blue-100 tracking-widest">
                  {session.session.attendance_code}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                  Expira en:{' '}
                  <span
                    className={`font-bold ${
                      timeRemaining === 'expirado'
                        ? 'text-red-600 dark:text-red-400'
                        : ''
                    }`}
                  >
                    {timeRemaining}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Conteo */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                ASISTENTES
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {attendanceCount}
              </p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleCloseSession}
            disabled={isPending}
            className="w-full bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900 disabled:opacity-50 text-red-800 dark:text-red-200 font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            {isPending ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
