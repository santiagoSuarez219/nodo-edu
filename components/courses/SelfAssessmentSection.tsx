'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { submitSelfAssessment } from '@/lib/self-assessment';
import type { SelfAssessmentQuestion, QuestionFeedback, SelfAssessmentAttemptSummary } from '@/lib/self-assessment/types';
import { QuestionStem } from '@/components/courses/QuestionStem';

interface SelfAssessmentSectionProps {
  courseSlug: string;
  lessonSlug: string;
  questions: SelfAssessmentQuestion[];
  onRetryingChange?: (isRetrying: boolean) => void;
  lastAttempt: SelfAssessmentAttemptSummary | null;
}

export function SelfAssessmentSection({
  courseSlug,
  lessonSlug,
  questions,
  onRetryingChange,
  lastAttempt,
}: SelfAssessmentSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<
    Record<string, QuestionFeedback>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(!!lastAttempt);

  const schemaObject: Record<string, z.ZodTypeAny> = {};
  questions.forEach((q) => {
    if (q.allowMultiple) {
      schemaObject[q.id] = z.array(z.string().uuid()).min(1, 'Selecciona al menos una opción');
    } else {
      schemaObject[q.id] = z.string().uuid('Selecciona una opción');
    }
  });

  const formSchema = z.object(schemaObject);
  type FormInput = z.infer<typeof formSchema>;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormInput) => {
    startTransition(async () => {
      setSubmitError(null);

      const answers: Record<string, string[]> = {};
      for (const question of questions) {
        const selectedValue = data[question.id];
        if (Array.isArray(selectedValue)) {
          answers[question.id] = selectedValue;
        } else if (typeof selectedValue === 'string') {
          answers[question.id] = [selectedValue];
        }
      }

      const result = await submitSelfAssessment(courseSlug, lessonSlug, answers);

      if (result.ok) {
        setFeedbackByQuestion(
          result.feedback.reduce((acc, f) => {
            acc[f.questionId] = f;
            return acc;
          }, {} as Record<string, QuestionFeedback>)
        );
        setHasSubmitted(true);
        onRetryingChange?.(false);
        router.refresh();
      } else {
        const errorMessages: Record<string, string> = {
          not_enrolled: 'No estás matriculado en este curso',
          incomplete: 'Debes responder todas las preguntas',
          no_questions: 'No hay preguntas disponibles',
          error: 'Ocurrió un error al enviar. Intenta de nuevo.',
        };
        setSubmitError(errorMessages[result.reason] || 'Error desconocido');
      }
    });
  };

  const handleRetry = () => {
    reset();
    setFeedbackByQuestion({});
    setHasSubmitted(false);
    setSubmitError(null);
    onRetryingChange?.(true);
  };

  const formValues = watch();

  const answeredCount = Object.values(formValues).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  }).length;
  const missingCount = questions.length - answeredCount;
  const canSubmit = missingCount === 0;

  // Post-recarga: hay un intento previo pero todavía no se respondió en esta
  // sesión (sin feedback en memoria) — se muestra el resumen agregado en vez
  // del formulario, para no dejar preguntas respondibles sin botón de envío.
  const showAttemptSummary =
    hasSubmitted && Object.keys(feedbackByQuestion).length === 0 && !!lastAttempt;

  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        {/* Encabezado */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Autoevaluación
          </h2>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-200 dark:divide-gray-700">
          {showAttemptSummary && (
            <div className="px-6 py-6 flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300 text-sm">
              <svg
                className="w-4 h-4 shrink-0"
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
                <p className="font-medium">Ya completaste esta autoevaluación</p>
                <p className="text-xs opacity-90">
                  {lastAttempt.correctCount}/{lastAttempt.questionCount} correctas
                  {' · '}
                  {new Date(lastAttempt.submittedAt).toLocaleString('es-CO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>
          )}

          {!showAttemptSummary && questions.map((question, index) => {
            const feedback = feedbackByQuestion[question.id];
            const isAnswered = !!feedback;

            return (
              <div key={question.id} className="px-6 py-6">
                {/* Pregunta */}
                <QuestionStem
                  topicTitle={question.topic_title}
                  stem={question.stem}
                  codeSnippet={question.code_snippet}
                />

                {/* Opciones */}
                <div className="space-y-2">
                  {question.choices.map((choice) => {
                    const isCorrect = feedback?.correctChoiceIds.includes(
                      choice.id
                    );
                    const selectedValue = formValues[question.id];
                    const wasSelected = Array.isArray(selectedValue)
                      ? selectedValue.includes(choice.id)
                      : selectedValue === choice.id;
                    const wasSelectedCorrectly =
                      feedback?.selectedCorrectIds.includes(choice.id);

                    let choiceClassName =
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ';

                    if (isAnswered) {
                      if (isCorrect) {
                        choiceClassName +=
                          'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50';
                      } else if (wasSelected && !wasSelectedCorrectly) {
                        choiceClassName +=
                          'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50';
                      } else {
                        choiceClassName +=
                          'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';
                      }
                    } else {
                      choiceClassName +=
                        'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';
                    }

                    const inputType = question.allowMultiple
                      ? 'checkbox'
                      : 'radio';

                    return (
                      <label key={choice.id} className={choiceClassName}>
                        <input
                          type={inputType}
                          {...register(question.id, {
                            required: false,
                          })}
                          value={choice.id}
                          disabled={isAnswered}
                          className="mt-1 shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {choice.body}
                        </span>
                        {isAnswered && isCorrect && (
                          <svg
                            className="ml-auto w-5 h-5 text-green-600 dark:text-green-400 shrink-0"
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
                        {isAnswered && wasSelected && !isCorrect && (
                          <svg
                            className="ml-auto w-5 h-5 text-red-600 dark:text-red-400 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Feedback de resultado */}
                {isAnswered && (
                  <div
                    className={`mt-4 flex items-start gap-3 p-3 rounded-lg border text-sm ${
                      feedback.correct
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-300'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      {feedback.correct ? (
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
                      <p className="font-medium">
                        {feedback.correct ? 'Correcto' : 'Incorrecto'}
                      </p>
                      {!feedback.correct && (
                        <p className="text-xs mt-1 opacity-90">
                          La respuesta correcta{' '}
                          {feedback.correctChoiceIds.length === 1
                            ? 'es:'
                            : 'son:'}{' '}
                          {question.choices
                            .filter((c) =>
                              feedback.correctChoiceIds.includes(c.id)
                            )
                            .map((c) => c.body)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pie con botón */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            {submitError && (
              <div className="mb-4 flex items-start gap-3 p-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-300 text-sm">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{submitError}</p>
              </div>
            )}

            {hasSubmitted ? (
              <div className="flex flex-col gap-2">
                {!showAttemptSummary && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-300 text-sm">
                    <svg
                      className="w-4 h-4 shrink-0"
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
                    <p className="font-medium">Autoevaluación enviada</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {missingCount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Faltan {missingCount} {missingCount === 1 ? 'pregunta' : 'preguntas'} por responder
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isPending || !canSubmit}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Verificando...' : 'Enviar respuestas'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
