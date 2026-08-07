"use client";

import { useState } from "react";
import { runCodeAction } from "@/lib/submissions/actions";
import type { QuestionDetail } from "@/lib/submissions/types";
import { QuestionText } from "@/components/questions/QuestionText";

export interface QuestionAnswer {
  selected_choice_ids: string[];
  text_response: string;
}

interface Props {
  question: QuestionDetail;
  answer: QuestionAnswer;
  onChange?: (answer: QuestionAnswer) => void;
  disabled?: boolean;
}

export function QuestionRenderer({ question, answer, onChange, disabled = false }: Props) {
  const { type, choices, code_snippet, code_language } = question;
  const [runResult, setRunResult] = useState<string | null>(null);

  if (type === "multiple_choice") {
    const correctCount = choices.filter((c) => c.is_correct === true).length;
    const isMulti = correctCount > 1;

    function toggleChoice(id: string, checked: boolean) {
      if (!onChange) return;
      if (isMulti) {
        const next = checked
          ? [...answer.selected_choice_ids, id]
          : answer.selected_choice_ids.filter((x) => x !== id);
        onChange({ ...answer, selected_choice_ids: next });
      } else {
        onChange({ ...answer, selected_choice_ids: checked ? [id] : [] });
      }
    }

    return (
      <div className="flex flex-col gap-2.5">
        {choices.map((c) => {
          const checked = answer.selected_choice_ids.includes(c.id);
          const revealed = c.is_correct !== null;
          const feedbackClass = revealed
            ? checked && c.is_correct
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : checked && !c.is_correct
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : !checked && c.is_correct
                  ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            : checked
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700";

          return (
            <label
              key={c.id}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 select-none transition-colors ${feedbackClass} ${
                disabled ? "cursor-not-allowed opacity-90" : "cursor-pointer"
              }`}
            >
              <input
                type={isMulti ? "checkbox" : "radio"}
                name={`q-${question.question_id}`}
                checked={checked}
                disabled={disabled}
                onChange={(e) => toggleChoice(c.id, e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-blue-600"
              />
              <QuestionText text={c.body} className="text-sm text-gray-800 dark:text-gray-200" />
              {revealed && !checked && c.is_correct && (
                <span className="ml-auto text-xs text-green-600 dark:text-green-400 shrink-0">
                  correcta
                </span>
              )}
            </label>
          );
        })}
        {isMulti && !disabled && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Selecciona todas las opciones correctas.
          </p>
        )}
      </div>
    );
  }

  const codeBlock = code_snippet && (
    <div className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 overflow-x-auto">
      {code_language && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
          {code_language}
        </p>
      )}
      <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
        {code_snippet}
      </pre>
    </div>
  );

  if (type === "open_text") {
    const inputId = `q-${question.question_id}-open`;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="sr-only">
          Respuesta
        </label>
        <textarea
          id={inputId}
          value={answer.text_response}
          onChange={(e) => onChange?.({ ...answer, text_response: e.target.value })}
          disabled={disabled}
          rows={5}
          placeholder="Escribe tu respuesta aquí…"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-y disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  if (type === "code_snippet") {
    const inputId = `q-${question.question_id}-snippet`;
    return (
      <div className="flex flex-col gap-3">
        {codeBlock}
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
        >
          Tu respuesta
        </label>
        <textarea
          id={inputId}
          value={answer.text_response}
          onChange={(e) => onChange?.({ ...answer, text_response: e.target.value })}
          disabled={disabled}
          rows={4}
          placeholder="Describe lo que hace el código…"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-y disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  if (type === "code_write") {
    const inputId = `q-${question.question_id}-write`;
    return (
      <div className="flex flex-col gap-3">
        {codeBlock}
        <label htmlFor={inputId} className="sr-only">
          Código
        </label>
        <textarea
          id={inputId}
          value={answer.text_response}
          onChange={(e) => onChange?.({ ...answer, text_response: e.target.value })}
          disabled={disabled}
          rows={8}
          placeholder="// Escribe tu solución aquí…"
          spellCheck={false}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-gray-950 px-4 py-3 text-sm text-green-300 font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-y disabled:opacity-70 disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  if (type === "coding_challenge") {
    const inputId = `q-${question.question_id}-challenge`;
    return (
      <div className="flex flex-col gap-3">
        {codeBlock}
        <label htmlFor={inputId} className="sr-only">
          Solución
        </label>
        <textarea
          id={inputId}
          value={answer.text_response}
          onChange={(e) => onChange?.({ ...answer, text_response: e.target.value })}
          disabled={disabled}
          rows={8}
          placeholder="// Escribe tu solución aquí…"
          spellCheck={false}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-gray-950 px-4 py-3 text-sm text-green-300 font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-y disabled:opacity-70 disabled:cursor-not-allowed"
        />
        {!disabled && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                const result = await runCodeAction(code_language ?? "text", answer.text_response);
                setRunResult(
                  result.status === "disabled"
                    ? "La ejecución de código no está disponible en esta versión."
                    : (result.output ?? result.error ?? "Sin salida.")
                );
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Ejecutar
            </button>
            {runResult && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400">{runResult}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
