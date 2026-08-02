'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { submitSelfAssessment } from '@/lib/self-assessment';
import type { SelfAssessmentQuestion, AttemptReview } from '@/lib/self-assessment/types';
import { QuestionStem } from '@/components/courses/QuestionStem';

interface SelfAssessmentSectionProps {
  courseSlug: string;
  lessonSlug: string;
  questions: SelfAssessmentQuestion[];
  // spec-040: `null` mientras no hay intento; una vez enviado, la revisión
  // persistente reemplaza por completo el formulario — no hay reintentos.
  attemptReview: AttemptReview | null;
}

export function SelfAssessmentSection({
  courseSlug,
  lessonSlug,
  questions,
  attemptReview,
}: SelfAssessmentSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

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

  const { register, handleSubmit, watch } = useForm<FormInput>({
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
        // El servidor ya tiene el intento persistido; refrescar trae
        // `attemptReview` con la revisión completa y oculta el formulario.
        router.refresh();
      } else if (result.reason === 'already_submitted') {
        // Condición de carrera (doble clic, dos pestañas): el servidor ya
        // tiene un intento aunque esta pestaña no lo supiera. Refrescar trae
        // la revisión real en vez de dejar el formulario reenviable.
        setAlreadySubmitted(true);
        router.refresh();
      } else {
        const errorMessages: Record<string, string> = {
          not_enrolled: 'No estás matriculado en este curso',
          incomplete: 'Debes responder todas las preguntas',
          no_questions: 'No hay preguntas disponibles',
          error: 'Ocurrió un error al enviar. Intenta de nuevo.',
        };
        setAwaitingConfirmation(false);
        setSubmitError(errorMessages[result.reason] || 'Error desconocido');
      }
    });
  };

  const formValues = watch();

  const answeredCount = Object.values(formValues).filter((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  }).length;
  const missingCount = questions.length - answeredCount;
  const canSubmit = missingCount === 0;

  // --- Ya hay un intento: revisión permanente, sin formulario ---
  if (attemptReview) {
    return (
      <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Autoevaluación
            </h2>
            <span className="shrink-0 text-sm font-mono text-gray-600 dark:text-gray-400">
              {attemptReview.correctCount}/{attemptReview.questionCount} correctas
            </span>
          </div>

          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Enviada el{' '}
              {new Date(attemptReview.submittedAt).toLocaleString('es-CO', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              . Este es tu único intento: hace parte de tu nota del curso y no se puede repetir.
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {attemptReview.answers.map((question) => (
              <div key={question.questionId} className="px-6 py-6">
                <QuestionStem
                  topicTitle={question.topic_title}
                  stem={question.stem}
                  codeSnippet={question.code_snippet}
                />

                <div className="space-y-2">
                  {question.choices.map((choice) => {
                    let choiceClassName =
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors ';
                    if (choice.is_correct) {
                      choiceClassName +=
                        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50';
                    } else if (choice.was_selected) {
                      choiceClassName +=
                        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50';
                    } else {
                      choiceClassName += 'border-gray-200 dark:border-gray-600';
                    }

                    return (
                      <div key={choice.id} className={choiceClassName}>
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {choice.body}
                        </span>
                        {choice.is_correct && (
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
                        {!choice.is_correct && choice.was_selected && (
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
                      </div>
                    );
                  })}
                </div>

                <div
                  className={`mt-4 flex items-center gap-2 text-sm font-medium ${
                    question.isCorrect
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {question.isCorrect ? 'Correcto' : 'Incorrecto'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- Sin intento todavía: formulario con aviso de intento único ---
  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Autoevaluación
          </h2>
        </div>

        <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700/50">
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            Tienes <strong>un único intento</strong>. Esta autoevaluación hace parte de tu nota
            del curso y no se puede repetir.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-200 dark:divide-gray-700">
          {questions.map((question) => {
            return (
              <div key={question.id} className="px-6 py-6">
                <QuestionStem
                  topicTitle={question.topic_title}
                  stem={question.stem}
                  codeSnippet={question.code_snippet}
                />

                <div className="space-y-2">
                  {question.choices.map((choice) => {
                    const selectedValue = formValues[question.id];
                    const wasSelected = Array.isArray(selectedValue)
                      ? selectedValue.includes(choice.id)
                      : selectedValue === choice.id;

                    const choiceClassName = `flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      wasSelected
                        ? 'border-brand bg-brand-softer dark:bg-blue-900/20 dark:border-blue-600'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`;

                    const inputType = question.allowMultiple ? 'checkbox' : 'radio';

                    return (
                      <label key={choice.id} className={choiceClassName}>
                        <input
                          type={inputType}
                          {...register(question.id, { required: false })}
                          value={choice.id}
                          disabled={awaitingConfirmation}
                          className="mt-1 shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {choice.body}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

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

            {alreadySubmitted && (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Ya enviaste esta autoevaluación. Actualizando tu revisión…
              </p>
            )}

            {!awaitingConfirmation ? (
              <>
                {missingCount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Faltan {missingCount} {missingCount === 1 ? 'pregunta' : 'preguntas'} por responder
                  </p>
                )}
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => setAwaitingConfirmation(true)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar respuestas
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Vas a enviar tus {questions.length}{' '}
                  {questions.length === 1 ? 'respuesta' : 'respuestas'} de forma{' '}
                  <strong>definitiva</strong>: no podrás volver a intentarlo.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setAwaitingConfirmation(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Volver a revisar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Enviando…' : 'Sí, enviar definitivamente'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
