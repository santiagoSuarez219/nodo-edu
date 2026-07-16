'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { markAttendanceByCode } from '@/lib/attendance';
import type {
  StudentAttendanceState,
  MarkAttendanceResult,
} from '@/lib/attendance/types';

interface AttendanceSectionProps {
  courseSlug: string;
  attendanceState: StudentAttendanceState;
}

const codeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{4,6}$/, 'El código debe tener 4 a 6 dígitos'),
});

type CodeFormData = z.infer<typeof codeSchema>;

const resultMessages: Record<MarkAttendanceResult, { title: string; message: string; type: 'success' | 'error' }> = {
  marked: {
    title: 'Asistencia registrada',
    message: 'Tu asistencia ha sido registrada correctamente.',
    type: 'success',
  },
  already_marked: {
    title: 'Asistencia ya registrada',
    message: 'Tu asistencia ya estaba registrada en esta sesión.',
    type: 'success',
  },
  not_found: {
    title: 'Código no válido',
    message: 'El código que ingresaste no corresponde a ninguna sesión abierta.',
    type: 'error',
  },
  expired: {
    title: 'Código expirado',
    message: 'El código ha expirado. Solicita un nuevo código al docente.',
    type: 'error',
  },
  closed: {
    title: 'Sesión cerrada',
    message: 'La sesión de asistencia ha sido cerrada.',
    type: 'error',
  },
  not_enrolled: {
    title: 'No estás matriculado',
    message: 'No tienes matrícula activa en este curso.',
    type: 'error',
  },
};

export function AttendanceSection({
  courseSlug,
  attendanceState,
}: AttendanceSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<MarkAttendanceResult | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
  });

  const onSubmit = (data: CodeFormData) => {
    startTransition(async () => {
      const result = await markAttendanceByCode(courseSlug, data.code);
      setLastResult(result);
      reset();
      if (result === 'marked' || result === 'already_marked') {
        // Refrescar para mostrar estado actualizado
        router.refresh();
      }
    });
  };

  // Caso 1: Sin sesión abierta
  if (!attendanceState.sessionOpen) {
    return (
      <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Asistencia
          </h2>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sin sesión de asistencia activa. Espera a que el docente abra una.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Caso 2: Ya marcado
  if (attendanceState.alreadyMarked) {
    const markedDate = attendanceState.markedAt
      ? new Date(attendanceState.markedAt).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    return (
      <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Asistencia
          </h2>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[#f3faf7] dark:bg-[#014737] border border-green-200 dark:border-green-900">
            <svg
              className="w-5 h-5 text-success dark:text-green-300 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-success dark:text-green-300">
                Asistencia marcada
              </p>
              {markedDate && (
                <p className="text-xs text-success/80 dark:text-green-300/80 mt-1">
                  Registrada el {markedDate}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Caso 3: Sesión abierta, sin marcar
  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Asistencia
        </h2>

        {/* Mensajes de resultado */}
        {lastResult && (
          <div
            className={`mb-4 flex items-start gap-3 p-4 rounded-lg border ${
              resultMessages[lastResult].type === 'success'
                ? 'bg-[#f3faf7] dark:bg-[#014737] border-green-200 dark:border-green-900'
                : 'bg-[#fdf2f2] dark:bg-[#771d1d] border-red-200 dark:border-red-900'
            }`}
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                resultMessages[lastResult].type === 'success'
                  ? 'text-success dark:text-green-300'
                  : 'text-danger dark:text-red-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              {resultMessages[lastResult].type === 'success' ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            <div>
              <p
                className={`text-sm font-medium ${
                  resultMessages[lastResult].type === 'success'
                    ? 'text-success dark:text-green-300'
                    : 'text-danger dark:text-red-300'
                }`}
              >
                {resultMessages[lastResult].title}
              </p>
              <p
                className={`text-xs mt-1 ${
                  resultMessages[lastResult].type === 'success'
                    ? 'text-success/80 dark:text-green-300/80'
                    : 'text-danger/80 dark:text-red-300/80'
                }`}
              >
                {resultMessages[lastResult].message}
              </p>
            </div>
          </div>
        )}

        {/* Formulario de código */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Código de sesión (4-6 dígitos)
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="Ej. 12345"
              {...register('code')}
              className={`w-full px-4 py-2.5 text-center text-2xl font-mono tracking-widest rounded-lg border ${
                errors.code
                  ? 'border-danger bg-danger/5 dark:bg-danger/10'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand/50`}
            />
            {errors.code && (
              <p className="text-xs text-danger mt-1">{errors.code.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Registrando...' : 'Registrar asistencia'}
          </button>
        </form>
      </div>
    </section>
  );
}
