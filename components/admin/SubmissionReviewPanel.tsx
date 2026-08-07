"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finalizeGradingAction, gradeAnswerAction } from "@/lib/submissions/actions";
import type { AnswerForReview, SubmissionForReview } from "@/lib/submissions/types";
import { QuestionText } from "@/components/questions/QuestionText";

interface SubmissionReviewPanelProps {
  submission: SubmissionForReview;
  academicCourseId: string;
  groupId: string;
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Selección múltiple",
  open_text: "Texto abierto",
  code_snippet: "Código (lectura)",
  code_write: "Código (escritura)",
  coding_challenge: "Challenge",
};

// Cualquier tipo distinto de multiple_choice se califica manualmente — ver
// lib/submissions/index.ts (OPEN_QUESTION_TYPES) para el mismo criterio.
const OPEN_TYPES = new Set(["open_text", "code_snippet", "code_write", "coding_challenge"]);
const PROSE_RESPONSE_TYPES = new Set(["open_text", "code_snippet"]);

interface AnswerDraft {
  score: string;
  notes: string;
}

function AnswerCard({
  answer,
  submissionId,
  academicCourseId,
  groupId,
  readOnly,
}: {
  answer: AnswerForReview;
  submissionId: string;
  academicCourseId: string;
  groupId: string;
  readOnly: boolean;
}) {
  const isOpen = OPEN_TYPES.has(answer.question_type);
  const [draft, setDraft] = useState<AnswerDraft>({
    score: answer.manual_score !== null ? String(answer.manual_score) : "",
    notes: answer.reviewer_notes ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, startSaving] = useTransition();

  function handleSave() {
    setError(null);
    setSaved(false);

    const score = Number(draft.score);
    if (draft.score.trim() === "" || Number.isNaN(score)) {
      setError("Ingresa un puntaje válido.");
      return;
    }

    startSaving(async () => {
      const result = await gradeAnswerAction(
        answer.id,
        score,
        draft.notes.trim() === "" ? null : draft.notes,
        submissionId,
        academicCourseId,
        groupId
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-5 py-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {TYPE_LABELS[answer.question_type] ?? answer.question_type}
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            <QuestionText text={answer.question_stem} />
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
            {(isOpen ? answer.manual_score : answer.auto_score)?.toFixed(2) ?? "—"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">/ {answer.max_points.toFixed(2)}</p>
        </div>
      </div>

      {answer.question_code_snippet && (
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 overflow-x-auto">
          {answer.question_code_language && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              {answer.question_code_language}
            </p>
          )}
          <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
            {answer.question_code_snippet}
          </pre>
        </div>
      )}

      {answer.question_type === "multiple_choice" ? (
        <div className="flex flex-col gap-2">
          {answer.question_choices.map((choice) => {
            const checked = answer.selected_choice_ids.includes(choice.id);
            const feedbackClass = checked && choice.is_correct
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : checked && !choice.is_correct
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : !checked && choice.is_correct
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
            return (
              <div
                key={choice.id}
                className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 ${feedbackClass}`}
              >
                <span className="w-4 h-4 shrink-0 rounded-full border border-gray-400 dark:border-gray-500 flex items-center justify-center">
                  {checked && <span className="w-2 h-2 rounded-full bg-current" />}
                </span>
                <QuestionText text={choice.body} className="flex-1" />
                {choice.is_correct && (
                  <span className="ml-auto text-xs text-green-600 dark:text-green-400 shrink-0">
                    correcta
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Respuesta del estudiante
          </p>
          <pre
            className={`text-sm whitespace-pre-wrap ${
              PROSE_RESPONSE_TYPES.has(answer.question_type)
                ? "text-gray-800 dark:text-gray-200 font-sans"
                : "text-green-700 dark:text-green-300 font-mono"
            }`}
          >
            {answer.text_response || "(sin respuesta)"}
          </pre>
        </div>
      )}

      {answer.question_rubric && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1.5">
            Rúbrica (máx. {answer.question_rubric.max_score.toFixed(2)} pts)
          </p>
          <ul className="flex flex-col gap-1">
            {answer.question_rubric.criteria.map((criterion, idx) => (
              <li key={idx} className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-semibold">
                  {criterion.label} ({criterion.points} pts):
                </span>{" "}
                {criterion.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`score-${answer.id}`}
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Puntaje (0–{answer.max_points})
              </label>
              <input
                id={`score-${answer.id}`}
                type="number"
                min={0}
                max={answer.max_points}
                step={0.25}
                value={draft.score}
                disabled={readOnly}
                onChange={(e) => setDraft((d) => ({ ...d, score: e.target.value }))}
                className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Guardando…" : "Guardar"}
              </button>
            )}
            {saved && !isSaving && (
              <span className="text-sm text-green-700 dark:text-green-400">Guardado</span>
            )}
          </div>

          <label
            htmlFor={`notes-${answer.id}`}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Retroalimentación (opcional)
          </label>
          <textarea
            id={`notes-${answer.id}`}
            value={draft.notes}
            disabled={readOnly}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            rows={3}
            placeholder="Comentarios para el estudiante…"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-y disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {error && <p className="text-sm text-red-700 dark:text-red-400 font-mono">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function SubmissionReviewPanel({
  submission,
  academicCourseId,
  groupId,
}: SubmissionReviewPanelProps) {
  const router = useRouter();
  const isGraded = submission.status === "graded";
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(submission.final_score);
  const [isFinalizing, startFinalizing] = useTransition();

  function handleFinalize() {
    setFinalizeError(null);
    startFinalizing(async () => {
      const result = await finalizeGradingAction(submission.id, academicCourseId, groupId);
      if (!result.ok) {
        setFinalizeError(result.error);
        return;
      }
      if (result.data) setFinalScore(result.data.final_score);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {submission.student_name || "Desconocido"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {isGraded ? "Calificación finalizada" : "Pendiente de revisión"}
          </p>
        </div>
        <div className="text-right">
          {finalScore !== null ? (
            <p className="text-3xl font-bold font-mono text-gray-900 dark:text-white">
              {finalScore.toFixed(2)}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">—</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {submission.answers.map((answer) => (
          <AnswerCard
            key={answer.id}
            answer={answer}
            submissionId={submission.id}
            academicCourseId={academicCourseId}
            groupId={groupId}
            readOnly={isGraded}
          />
        ))}
      </div>

      {!isGraded && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={isFinalizing}
            className="self-start inline-flex items-center gap-2 rounded-lg bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFinalizing ? "Finalizando…" : "Finalizar calificación"}
          </button>
          {finalizeError && (
            <p className="text-sm text-red-700 dark:text-red-400 font-mono">{finalizeError}</p>
          )}
        </div>
      )}
    </div>
  );
}
