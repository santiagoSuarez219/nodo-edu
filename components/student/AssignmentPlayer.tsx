"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveAnswerAction } from "@/lib/submissions/actions";
import { QuestionRenderer, type QuestionAnswer } from "./QuestionRenderer";
import type { QuestionDetail, Answer, Submission } from "@/lib/submissions/types";

interface Props {
  questions: QuestionDetail[];
  submission: Submission;
  initialAnswers: Answer[];
  enrollmentId: string;
  groupId: string;
  timeLimitMinutes: number | null;
}

function buildInitialAnswers(
  questions: QuestionDetail[],
  saved: Answer[]
): Record<string, QuestionAnswer> {
  const map: Record<string, QuestionAnswer> = {};
  for (const q of questions) {
    const found = saved.find((a) => a.question_id === q.question_id);
    map[q.question_id] = {
      selected_choice_ids: found?.selected_choice_ids ?? [],
      text_response: found?.text_response ?? "",
    };
  }
  return map;
}

function useCountdown(
  startedAt: string,
  timeLimitMinutes: number | null,
  onExpire: () => void
) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const expireRef = useRef(onExpire);
  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!timeLimitMinutes) return;

    const started = new Date(startedAt).getTime();
    const deadline = started + timeLimitMinutes * 60 * 1000;

    function tick() {
      const left = deadline - Date.now();
      if (left <= 0) {
        setRemaining(0);
        expireRef.current();
        return;
      }
      setRemaining(Math.ceil(left / 1000));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes]);

  return remaining;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AssignmentPlayer({
  questions,
  submission,
  initialAnswers,
  enrollmentId,
  groupId,
  timeLimitMinutes,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState(() => buildInitialAnswers(questions, initialAnswers));
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  function handleAnswerChange(
    questionId: string,
    assignmentQuestionId: string,
    answer: QuestionAnswer
  ) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setSaveStatus("unsaved");

    const existing = debounceTimers.current.get(questionId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      await saveAnswerAction(submission.id, questionId, assignmentQuestionId, {
        selected_choice_ids: answer.selected_choice_ids,
        text_response: answer.text_response || undefined,
      });
      setSaveStatus("saved");
      debounceTimers.current.delete(questionId);
    }, 3000);

    debounceTimers.current.set(questionId, timer);
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    for (const [questionId, timer] of debounceTimers.current.entries()) {
      clearTimeout(timer);
      debounceTimers.current.delete(questionId);

      const q = questions.find((qq) => qq.question_id === questionId);
      if (!q) continue;
      const answer = answers[questionId];
      if (answer) {
        await saveAnswerAction(submission.id, questionId, q.assignment_question_id, {
          selected_choice_ids: answer.selected_choice_ids,
          text_response: answer.text_response || undefined,
        });
      }
    }

    const res = await fetch(`/api/submissions/${submission.id}/submit`, {
      method: "POST",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSubmitError(body?.error?.message ?? "Error al enviar.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/cuenta/cursos/${enrollmentId}/evaluaciones/${groupId}/resultados`);
  }, [isSubmitting, submission.id, questions, answers, enrollmentId, groupId, router]);

  const remaining = useCountdown(submission.started_at, timeLimitMinutes, handleSubmit);
  const countdownUrgent = remaining !== null && remaining < 60;

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      debounceTimers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    confirmButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [confirmOpen]);

  function handleConfirmSubmit() {
    setConfirmOpen(false);
    handleSubmit();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-10 flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 -mx-4 md:-mx-6 md:px-6">
        <div
          className="text-xs text-gray-400 dark:text-gray-500"
          aria-live="polite"
          aria-atomic="true"
        >
          {saveStatus === "saving" && "Guardando…"}
          {saveStatus === "saved" && "✓ Guardado"}
          {saveStatus === "unsaved" && "Sin guardar"}
        </div>

        <div className="flex items-center gap-4">
          {remaining !== null && (
            <span
              className={`text-sm font-mono font-semibold tabular-nums ${
                countdownUrgent ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
              }`}
              aria-live="off"
            >
              {formatCountdown(remaining)}
            </span>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 transition-colors"
          >
            {isSubmitting ? "Enviando…" : "Enviar respuestas"}
          </button>
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {questions.map((q, idx) => {
          const answer = answers[q.question_id] ?? { selected_choice_ids: [], text_response: "" };

          return (
            <div
              key={q.assignment_question_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-5 py-5 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Pregunta {idx + 1} · {q.points.toFixed(2)} pts
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                  {q.stem}
                </p>
              </div>

              <QuestionRenderer
                question={q}
                answer={answer}
                onChange={(next) => handleAnswerChange(q.question_id, q.assignment_question_id, next)}
                disabled={isSubmitting}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-3 transition-colors"
        >
          {isSubmitting ? "Enviando…" : "Enviar respuestas"}
        </button>
      </div>

      {confirmOpen && (
        <>
          <button
            type="button"
            aria-label="Cancelar envío"
            onClick={() => setConfirmOpen(false)}
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-submit-title"
            aria-describedby="confirm-submit-description"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2
                  id="confirm-submit-title"
                  className="text-base font-bold text-gray-900 dark:text-white"
                >
                  ¿Enviar respuestas?
                </h2>
                <p
                  id="confirm-submit-description"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  No podrás modificar tus respuestas después de enviarlas.
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
                  onClick={handleConfirmSubmit}
                  className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
