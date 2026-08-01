'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

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
  // `alert()`/`confirm()` nativos quedaron fuera (DEBT-018): este panel se
  // proyecta en clase desde la vista docente de la lección (spec-031).
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Polling para conteo en vivo (cada ~5 segundos mientras haya sesión abierta).
  // Deliberadamente FUERA de `startTransition`: `isPending` gobierna los botones
  // de abrir/cerrar sesión, y compartirlo con el polling hacía que "Cerrar
  // sesión" parpadeara a "Cerrando..." cada 5s durante toda la clase (DEBT-019).
  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      const count = await getSessionAttendanceCount(session.session.id);
      // La sesión pudo cerrarse mientras la petición estaba en vuelo; sin este
      // guard una respuesta tardía reviviría un conteo de una sesión ya cerrada.
      if (!cancelled) setAttendanceCount(count);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session]);

  const handleOpenSession = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await openSession(academicCourseId);
      if (result.success && result.session) {
        setSession(result.session);
        setAttendanceCount(result.session.attendanceCount);
      } else {
        setError(result.error || 'No se pudo abrir la sesión.');
      }
    });
  }, [academicCourseId]);

  const handleConfirmClose = useCallback(() => {
    if (!session) return;
    setConfirmOpen(false);
    setError(null);

    startTransition(async () => {
      const result = await closeSession(session.session.id);
      if (result.success) {
        setSession(null);
        setAttendanceCount(0);
      } else {
        setError(result.error || 'No se pudo cerrar la sesión.');
      }
    });
  }, [session]);

  // Cierre del diálogo con Escape + foco en el botón de confirmar al abrirlo,
  // mismo comportamiento que el diálogo de envío de `AssignmentPlayer`.
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    confirmButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [confirmOpen]);

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

  const errorBanner = error && (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3"
    >
      <p className="text-sm text-danger dark:text-red-300">{error}</p>
      <button
        type="button"
        onClick={() => setError(null)}
        aria-label="Descartar mensaje de error"
        className="text-danger dark:text-red-300 text-sm font-bold leading-none px-1 hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  );

  if (!session) {
    return (
      <div className="flex flex-col gap-6">
        {errorBanner}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-8">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              No hay sesión de asistencia abierta. Abre una nueva sesión para que
              los estudiantes puedan marcar asistencia.
            </p>
            <button
              onClick={handleOpenSession}
              disabled={isPending}
              className="w-full bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
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
      {errorBanner}

      {/* Sesión abierta */}
      <div className="bg-white dark:bg-gray-800 border border-success/30 dark:border-success/40 rounded-[var(--radius-base)] px-6 py-6">
        <div className="flex flex-col gap-4">
          {/* Info de sesión */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sesión abierta desde{' '}
                {new Date(session.session.created_at).toLocaleTimeString('es-CO')}
              </p>
              <div className="inline-flex items-center gap-2 bg-success/10 text-success dark:text-green-300 px-3 py-1 rounded-lg text-sm font-medium w-fit">
                <div className="w-2 h-2 rounded-full bg-success dark:bg-green-400 animate-pulse" />
                Sesión activa
              </div>
            </div>
          </div>

          {/* Código */}
          <div className="bg-brand-softer dark:bg-gray-700 border border-border-brand dark:border-brand/30 rounded-lg p-4">
            <p className="text-xs text-brand dark:text-blue-300 font-medium mb-2">
              CÓDIGO DE ASISTENCIA
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-5xl font-mono font-bold text-brand-strong dark:text-blue-200 tracking-widest">
                  {session.session.attendance_code}
                </p>
                <p className="text-xs text-brand dark:text-blue-300 mt-2">
                  Expira en:{' '}
                  <span
                    className={`font-bold ${
                      timeRemaining === 'expirado'
                        ? 'text-danger dark:text-red-300'
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
            onClick={() => setConfirmOpen(true)}
            disabled={isPending}
            className="w-full bg-danger/10 hover:bg-danger/20 dark:bg-danger/20 dark:hover:bg-danger/30 disabled:opacity-50 text-danger dark:text-red-300 font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            {isPending ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      {confirmOpen && (
        <>
          <button
            type="button"
            aria-label="Cancelar cierre de sesión"
            onClick={() => setConfirmOpen(false)}
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-close-session-title"
            aria-describedby="confirm-close-session-description"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2
                  id="confirm-close-session-title"
                  className="text-base font-bold text-gray-900 dark:text-white"
                >
                  ¿Cerrar la sesión de asistencia?
                </h2>
                <p
                  id="confirm-close-session-description"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  El código dejará de funcionar y los estudiantes que aún no
                  hayan marcado no podrán hacerlo.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={handleConfirmClose}
                  className="rounded-lg bg-danger hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:focus-visible:ring-red-700 focus-visible:ring-offset-2"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
