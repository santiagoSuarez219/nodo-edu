'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  closeSession,
  extendSessionCode,
  getSessionAttendanceCount,
  openSession,
  rotateSessionCode,
} from '@/lib/attendance';
import type {
  OpenSessionResult,
  OpenSessionSummary,
  RefreshCodeResult,
} from '@/lib/attendance/types';

interface AdminAttendancePanelProps {
  academicCourseId: string;
  // Hallazgo TC-011 (spec-041): necesarios para que `extendSessionCode` /
  // `rotateSessionCode` revaliden la ruta real del panel (ver comentario en
  // `lib/attendance/index.ts`), no la subruta muerta `/admin/courses`.
  courseSlug: string;
  lessonSlug: string;
  initialSession: OpenSessionResult;
}

// spec-041 D7: una sola acción a la vez sobre la sesión. Reemplaza el
// `isPending` compartido de abrir/cerrar (que ya causó el parpadeo de
// DEBT-019) por un estado explícito por acción.
type PanelAction = 'open' | 'close' | 'extend' | 'rotate';

// Acción cuyo diálogo de confirmación está abierto. 'open' no tiene diálogo
// (abrir sesión no tiene nada que confirmar).
type ConfirmAction = 'close' | 'extend' | 'rotate' | null;

function computeTimeRemaining(codeExpiresAt: string): string {
  const diff = new Date(codeExpiresAt).getTime() - Date.now();

  if (diff <= 0) return 'expirado';

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AdminAttendancePanel({
  academicCourseId,
  courseSlug,
  lessonSlug,
  initialSession,
}: AdminAttendancePanelProps) {
  const initialResolvedSession =
    initialSession.status === 'ok' ? initialSession.session : null;
  const [session, setSession] = useState<OpenSessionSummary | null>(
    initialResolvedSession
  );
  const [attendanceCount, setAttendanceCount] = useState(
    initialResolvedSession?.attendanceCount ?? 0
  );
  // No sabemos con certeza si hay una sesión abierta: la carga inicial no
  // pudo consultarlo (DEBT-037, Frente 2). El conteo, si lo hay, puede estar
  // desactualizado.
  const [countStale, setCountStale] = useState(
    initialSession.status === 'unavailable'
  );
  const [pendingAction, setPendingAction] = useState<PanelAction | null>(null);
  // `alert()`/`confirm()` nativos quedaron fuera (DEBT-018): este panel se
  // proyecta en clase desde la vista docente de la lección (spec-031).
  const [error, setError] = useState<string | null>(null);
  // Aviso de negocio (spec-041 D6): distinto del banner rojo de `error`, que
  // se reserva a fallos de infraestructura. "La sesión ya se cerró" no es un
  // fallo, es un estado legítimo que el docente debe poder leer sin alarma.
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Polling para conteo en vivo (cada ~5 segundos mientras haya sesión abierta).
  // Deliberadamente FUERA de cualquier acción pendiente: `pendingAction` gobierna
  // los botones de abrir/cerrar/extender/rotar, y compartirlo con el polling
  // hacía que "Cerrar sesión" parpadeara a "Cerrando..." cada 5s durante toda la
  // clase (DEBT-019).
  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      let result: Awaited<ReturnType<typeof getSessionAttendanceCount>>;
      try {
        result = await getSessionAttendanceCount(session.session.id);
      } catch (err) {
        // Fallo de transporte del server action (Frente 3): no generar un
        // banner en cada tick, solo marcar el conteo como desactualizado.
        console.error('Error polling attendance count:', err);
        if (!cancelled) setCountStale(true);
        return;
      }
      // La sesión pudo cerrarse mientras la petición estaba en vuelo; sin este
      // guard una respuesta tardía reviviría un conteo de una sesión ya cerrada.
      if (cancelled) return;
      if (result.status === 'ok') {
        setAttendanceCount(result.count);
        setCountStale(false);
      } else {
        // No pintar 0: conservar el último conteo conocido (DEBT-037).
        setCountStale(true);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session]);

  const handleOpenSession = useCallback(async () => {
    setError(null);
    setNotice(null);
    setPendingAction('open');
    try {
      const result = await openSession(academicCourseId, courseSlug, lessonSlug);
      if (result.success && result.session) {
        setSession(result.session);
        setAttendanceCount(result.session.attendanceCount);
        setCountStale(false);
      } else {
        setError(result.error || 'No se pudo abrir la sesión.');
      }
    } catch (err) {
      // Fallo de transporte del server action (Frente 3, cierra TC-007):
      // sin este catch, la excepción escalaba al boundary y desmontaba
      // toda la lección proyectada en clase.
      console.error('Error opening session:', err);
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setPendingAction(null);
    }
  }, [academicCourseId, courseSlug, lessonSlug]);

  // Calcular tiempo restante de expiración
  const getTimeRemaining = useCallback(() => {
    if (!session) return null;
    return computeTimeRemaining(session.session.code_expires_at);
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

  // spec-041 D6: aplica el resultado discriminado de extender/rotar. El
  // conteo de asistentes NUNCA se toca aquí — sigue siendo dueño del polling,
  // así que un refresco no puede pintar un 0 espurio (el fallo que persiguió
  // DEBT-037 en este mismo panel).
  const applyRefreshResult = useCallback(
    (result: RefreshCodeResult, action: 'extend' | 'rotate') => {
      if (result.status === 'ok') {
        setSession((prev) =>
          prev ? { ...prev, session: result.session } : prev
        );
        // Refrescar la cuenta atrás de inmediato (D8, punto 1): sin esto el
        // docente ve "expirado" hasta un segundo después de confirmar que la
        // acción funcionó.
        setTimeRemaining(computeTimeRemaining(result.session.code_expires_at));
        return;
      }

      if (result.status === 'not_open') {
        // La sesión se cerró desde otra pestaña mientras se intentaba
        // refrescar (D6): no es un fallo, es un estado de negocio legítimo.
        setSession(null);
        setAttendanceCount(0);
        setCountStale(false);
        setNotice(
          'La sesión ya fue cerrada — probablemente desde otra pestaña. Abre una nueva sesión si quieres seguir tomando asistencia.'
        );
        return;
      }

      if (result.status === 'code_collision') {
        setError(
          'No se pudo generar un código único en este intento. Vuelve a intentarlo.'
        );
        return;
      }

      // 'unavailable': fallo de infraestructura.
      setError(
        action === 'extend'
          ? 'No se pudo extender el código. Intenta de nuevo.'
          : 'No se pudo generar el código nuevo. Intenta de nuevo.'
      );
    },
    []
  );

  const handleConfirmAction = useCallback(async () => {
    const action = confirmAction;
    if (!action || !session) return;

    setConfirmAction(null);
    setError(null);
    setNotice(null);
    setPendingAction(action);

    try {
      if (action === 'close') {
        const result = await closeSession(session.session.id, courseSlug, lessonSlug);
        if (result.success) {
          setSession(null);
          setAttendanceCount(0);
          setCountStale(false);
        } else {
          setError(result.error || 'No se pudo cerrar la sesión.');
        }
        return;
      }

      const refresh =
        action === 'extend'
          ? await extendSessionCode(session.session.id, courseSlug, lessonSlug)
          : await rotateSessionCode(session.session.id, courseSlug, lessonSlug);
      applyRefreshResult(refresh, action);
    } catch (err) {
      console.error(`Error en la acción "${action}" de la sesión:`, err);
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setPendingAction(null);
    }
  }, [confirmAction, session, applyRefreshResult, courseSlug, lessonSlug]);

  // Cierre del diálogo con Escape + foco en el botón de confirmar al abrirlo,
  // mismo comportamiento que el diálogo de envío de `AssignmentPlayer`.
  useEffect(() => {
    if (!confirmAction) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmAction(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    confirmButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [confirmAction]);

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

  const noticeBanner = notice && (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3"
    >
      <p className="text-sm text-fg-warning dark:text-yellow-300">{notice}</p>
      <button
        type="button"
        onClick={() => setNotice(null)}
        aria-label="Descartar aviso"
        className="text-fg-warning dark:text-yellow-300 text-sm font-bold leading-none px-1 hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  );

  // spec-041 D2: diálogo único reutilizado por las tres acciones que necesitan
  // confirmación, siguiendo el mismo patrón (confirmAction + mapa de copy) que
  // CourseLifecycleActions (spec-036) — evita triplicar el bloque de
  // accesibilidad del diálogo dentro de este mismo archivo.
  // DEBT-038: este diálogo sigue siendo markup duplicado entre archivos
  // (AssignmentPlayer, AdminAttendancePanel, CourseLifecycleActions); no se
  // extrae a un componente compartido en este spec.
  const dialogCopy: Record<
    Exclude<ConfirmAction, null>,
    { title: string; description: string; confirmLabel: string; confirmClassName: string }
  > = {
    close: {
      title: '¿Cerrar la sesión de asistencia?',
      description:
        'El código dejará de funcionar y los estudiantes que aún no hayan marcado no podrán hacerlo.',
      confirmLabel: 'Cerrar sesión',
      confirmClassName:
        'bg-danger hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white focus-visible:ring-red-300 dark:focus-visible:ring-red-700',
    },
    extend: {
      title: '¿Extender 15 minutos el código actual?',
      description:
        'El código sigue siendo el mismo — quienes ya lo anotaron podrán seguir usándolo. Solo se reinicia el tiempo de expiración.',
      confirmLabel: 'Extender 15 min',
      confirmClassName:
        'bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong text-white focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700',
    },
    rotate: {
      title: '¿Generar un código nuevo?',
      description:
        'El código proyectado ahora mismo dejará de funcionar de inmediato. Úsalo solo si se filtró a alguien fuera del aula.',
      confirmLabel: 'Generar código nuevo',
      confirmClassName:
        'bg-warning hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-gray-900 focus-visible:ring-yellow-300 dark:focus-visible:ring-yellow-700',
    },
  };

  const isBusy = pendingAction !== null;

  if (!session) {
    return (
      <div className="flex flex-col gap-6">
        {errorBanner}
        {noticeBanner}
        {countStale && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3"
          >
            <p className="text-sm text-danger dark:text-red-300">
              No pudimos verificar si hay una sesión abierta. Si intentas abrir
              una y ya existe, te lo indicaremos.
            </p>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-8">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              No hay sesión de asistencia abierta. Abre una nueva sesión para que
              los estudiantes puedan marcar asistencia.
            </p>
            <button
              onClick={handleOpenSession}
              disabled={isBusy}
              className="w-full bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {pendingAction === 'open' ? 'Abriendo sesión...' : 'Abrir sesión de asistencia'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {errorBanner}
      {noticeBanner}

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

            {/* Refrescar el código (spec-041): disponibles durante toda la
                sesión, no solo tras la expiración — el docente sabe antes que
                el reloj que la clase se va a alargar (D1). Secundarias: no
                compiten visualmente con el código ni con "Cerrar sesión". */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => setConfirmAction('extend')}
                disabled={isBusy}
                className="rounded-lg bg-white/70 hover:bg-white dark:bg-gray-800/60 dark:hover:bg-gray-800 border border-border-brand dark:border-brand/30 disabled:opacity-50 text-brand dark:text-blue-300 text-sm font-medium py-2 px-3 transition-colors"
              >
                {pendingAction === 'extend' ? 'Extendiendo…' : 'Extender 15 min'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction('rotate')}
                disabled={isBusy}
                className="rounded-lg bg-warning/10 hover:bg-warning/20 dark:bg-warning/20 dark:hover:bg-warning/30 border border-warning/30 disabled:opacity-50 text-fg-warning dark:text-yellow-300 text-sm font-medium py-2 px-3 transition-colors"
              >
                {pendingAction === 'rotate' ? 'Generando…' : 'Generar código nuevo'}
              </button>
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
              {/* Ante un fallo de consulta se conserva el último valor
                  conocido en vez de mostrar 0 — un docente proyectando esto
                  en clase leería un 0 como "nadie ha marcado" (DEBT-037). */}
              {countStale && (
                <p className="text-xs text-danger dark:text-red-300 mt-1">
                  Desactualizado — no pudimos consultar el conteo más reciente
                </p>
              )}
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => setConfirmAction('close')}
            disabled={isBusy}
            className="w-full bg-danger/10 hover:bg-danger/20 dark:bg-danger/20 dark:hover:bg-danger/30 disabled:opacity-50 text-danger dark:text-red-300 font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            {pendingAction === 'close' ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      {confirmAction && (
        <>
          <button
            type="button"
            aria-label="Cancelar"
            onClick={() => setConfirmAction(null)}
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-attendance-action-title"
            aria-describedby="confirm-attendance-action-description"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2
                  id="confirm-attendance-action-title"
                  className="text-base font-bold text-gray-900 dark:text-white"
                >
                  {dialogCopy[confirmAction].title}
                </h2>
                <p
                  id="confirm-attendance-action-description"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {dialogCopy[confirmAction].description}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={handleConfirmAction}
                  className={`rounded-lg text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${dialogCopy[confirmAction].confirmClassName}`}
                >
                  {dialogCopy[confirmAction].confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
