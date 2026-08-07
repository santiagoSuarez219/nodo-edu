'use client';

import { useId, useMemo, useState } from 'react';
import { QuestionStem } from '@/components/courses/QuestionStem';
import { QuestionText } from '@/components/questions/QuestionText';
import {
  ANSWER_KEY_COOKIE_NAME,
  ANSWER_KEY_COOKIE_MAX_AGE_SECONDS,
} from '@/lib/self-assessment/answer-key-preference';
import type { AnswerKeyQuestion } from '@/lib/self-assessment/types';

interface TeacherAnswerKeyProps {
  questions: AnswerKeyQuestion[];
  initialExpanded: boolean;
}

export function TeacherAnswerKey({ questions, initialExpanded }: TeacherAnswerKeyProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const bodyId = useId();

  const allRevealed = useMemo(
    () => questions.length > 0 && questions.every((q) => revealedIds.has(q.id)),
    [questions, revealedIds]
  );

  const toggleQuestion = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setRevealedIds(allRevealed ? new Set() : new Set(questions.map((q) => q.id)));
  };

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      document.cookie = `${ANSWER_KEY_COOKIE_NAME}=1; path=/; max-age=${ANSWER_KEY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    } else {
      // Plegar borra la cookie en vez de escribir "0": el estado por defecto
      // y el estado plegado son el mismo estado (spec-038, D4).
      document.cookie = `${ANSWER_KEY_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
      // Volver a desplegar nunca debe mostrar respuestas ya reveladas antes
      // de plegar (spec-038, D8).
      setRevealedIds(new Set());
    }
  };

  if (questions.length === 0) return null;

  const questionCountLabel =
    questions.length === 1 ? '1 pregunta' : `${questions.length} preguntas`;

  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Clave de respuestas
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {questionCountLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-label={expanded ? 'Ocultar la clave de respuestas' : 'Mostrar la clave de respuestas'}
          className="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          {expanded ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      <div id={bodyId} hidden={!expanded} className="border-t border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end">
          <button
            type="button"
            onClick={toggleAll}
            className="shrink-0 px-3 py-1.5 text-xs font-medium text-brand dark:text-blue-300 bg-brand-softer dark:bg-blue-900/20 hover:bg-brand-soft dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            {allRevealed ? 'Ocultar todas' : 'Revelar todas'}
          </button>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {questions.map((question) => {
            const isRevealed = revealedIds.has(question.id);

            return (
              <div key={question.id} className="px-6 py-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <QuestionStem
                      topicTitle={question.topic_title}
                      stem={question.stem}
                      codeSnippet={question.code_snippet}
                    />
                    {question.allowMultiple && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3 mb-2">
                        Admite varias respuestas correctas
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleQuestion(question.id)}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {isRevealed ? 'Ocultar' : 'Revelar'}
                  </button>
                </div>

                <div className="space-y-2">
                  {question.choices.map((choice) => {
                    const highlight = isRevealed && choice.is_correct;

                    return (
                      <div
                        key={choice.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          highlight
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <QuestionText
                          text={choice.body}
                          className="text-sm text-gray-800 dark:text-gray-200"
                        />
                        {highlight && (
                          <svg
                            className="ml-auto w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0"
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
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
