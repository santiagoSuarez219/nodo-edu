"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLessonTaught } from "@/lib/courses/taught-lessons";
import {
  isServerActionTransportError,
  SERVER_ACTION_TRANSPORT_ERROR_MESSAGE,
} from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";
import type { TaughtLesson } from "@/lib/courses/service";

interface Props {
  academicCourseId: string;
  lessons: TaughtLesson[];
  orphanTaughtSlugs: string[];
  activeStudentCount: number;
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// spec-060 D12: la UI marca lección por lección. "Vista en clase" y "Abierta"
// son interruptores independientes (D6): marcar no abre la lección.
export function TaughtLessonsTable({
  academicCourseId,
  lessons,
  orphanTaughtSlugs,
  activeStudentCount,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const taughtCount = lessons.filter((l) => l.is_taught).length;
  const countedCount = lessons.filter((l) => l.counts_for_grade).length;

  function change(slug: string, taught: boolean) {
    setConfirmSlug(null);
    setNotice(null);
    setError(null);
    setBusySlug(slug);
    startTransition(async () => {
      let res;
      try {
        res = await setLessonTaught(academicCourseId, slug, taught);
      } catch (err) {
        if (!isServerActionTransportError(err)) throw err;
        reportTransportError(err, "setLessonTaught");
        setError(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
        setBusySlug(null);
        return;
      }
      setBusySlug(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const n = res.data?.recalculatedCount ?? 0;
      setNotice(
        `Se recalcularon las notas de ${n} ${n === 1 ? "estudiante" : "estudiantes"}.`
      );
      router.refresh();
    });
  }

  function onToggle(lesson: TaughtLesson) {
    if (lesson.is_taught) {
      setConfirmSlug(lesson.lesson_slug);
    } else {
      change(lesson.lesson_slug, true);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-semibold">{taughtCount}</span>{" "}
        {taughtCount === 1 ? "lección marcada" : "lecciones marcadas"} ·{" "}
        <span className="font-semibold">{countedCount}</span> cuentan para la nota
      </p>

      <div aria-live="polite" className="min-h-5 text-xs">
        {notice && <span className="text-gray-500 dark:text-gray-400">{notice}</span>}
        {error && <span className="text-danger dark:text-red-400">{error}</span>}
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="px-4 py-3 w-12">#</th>
              <th scope="col" className="px-4 py-3">Lección</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3">Preguntas</th>
              <th scope="col" className="px-4 py-3">Vista en clase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {lessons.map((lesson) => {
              const busy = isPending && busySlug === lesson.lesson_slug;
              return (
                <tr key={lesson.lesson_slug} className="align-top">
                  <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">
                    {lesson.order}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 dark:text-white">{lesson.title}</p>
                    <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
                      {lesson.lesson_slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        lesson.is_disabled
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {lesson.is_disabled ? "Cerrada" : "Abierta"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {lesson.question_count > 0 ? (
                      <span className="font-mono">{lesson.question_count}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">
                        Sin autoevaluación
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={lesson.is_taught}
                        aria-label={`Marcar ${lesson.title} como vista en clase`}
                        disabled={isPending}
                        onClick={() => onToggle(lesson)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
                          lesson.is_taught
                            ? "bg-brand"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                            lesson.is_taught ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      {busy && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Guardando…
                        </span>
                      )}
                    </div>
                    {lesson.taught_at && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Marcada el {dateFormatter.format(new Date(lesson.taught_at))}
                      </p>
                    )}
                    {lesson.is_taught && lesson.is_disabled && (
                      <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                        Esta lección está cerrada a los estudiantes: no cuenta para la
                        nota hasta que la abras.
                      </p>
                    )}
                    {lesson.is_taught && !lesson.is_disabled && lesson.question_count === 0 && (
                      <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                        Sin preguntas publicadas: no suma a la nota.
                      </p>
                    )}
                    {confirmSlug === lesson.lesson_slug && (
                      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2">
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          Al desmarcarla, deja de contar para la nota de los{" "}
                          {activeStudentCount} estudiantes del grupo.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmSlug(null)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => change(lesson.lesson_slug, false)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-strong rounded-lg transition-colors"
                          >
                            Sí, desmarcar
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orphanTaughtSlugs.length > 0 && (
        <div className="rounded-[var(--radius-base)] border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Marcas sin lección en el catálogo
          </p>
          <ul className="flex flex-col gap-2">
            {orphanTaughtSlugs.map((slug) => (
              <li key={slug} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-yellow-900 dark:text-yellow-200">
                    {slug}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setConfirmSlug(slug)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-60 rounded-lg transition-colors"
                  >
                    Desmarcar
                  </button>
                </div>
                {confirmSlug === slug && (
                  <div className="flex flex-col gap-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      Al desmarcarla, deja de contar para la nota de los{" "}
                      {activeStudentCount} estudiantes del grupo.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmSlug(null)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => change(slug, false)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-brand hover:bg-brand-strong rounded-lg transition-colors"
                      >
                        Sí, desmarcar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Marcar una lección no la abre a los estudiantes; ábrela o ciérrala desde
        courses-mcp.
      </p>
    </div>
  );
}
