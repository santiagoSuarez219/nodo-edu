'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { checkSelfAssessmentAnswer } from '@/lib/self-assessment';
import type { SelfAssessmentQuestion } from '@/lib/self-assessment/types';

interface SelfAssessmentSectionProps {
  courseSlug: string;
  lessonSlug: string;
  questions: SelfAssessmentQuestion[];
}

interface QuestionFeedback {
  questionId: string;
  correct: boolean;
  correctChoiceIds: string[];
  selectedCorrectIds: string[];
}

export function SelfAssessmentSection({
  courseSlug,
  lessonSlug,
  questions,
}: SelfAssessmentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<
    Record<string, QuestionFeedback>
  >({});

  // Construir el schema dinámicamente basado en preguntas
  const schemaObject: Record<string, z.ZodTypeAny> = {};
  questions.forEach((q) => {
    if (q.allowMultiple) {
      schemaObject[q.id] = z.array(z.string()).optional();
    } else {
      schemaObject[q.id] = z.string().optional();
    }
  });

  const formSchema = z.object(schemaObject);
  type FormInput = z.infer<typeof formSchema>;

  const { register, handleSubmit, watch } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormInput) => {
    startTransition(async () => {
      const newFeedback: Record<string, QuestionFeedback> = {};

      for (const question of questions) {
        const selectedValue = data[question.id];

        // Convertir a array de IDs de opciones seleccionadas
        let selectedIds: string[] = [];
        if (Array.isArray(selectedValue)) {
          selectedIds = selectedValue;
        } else if (typeof selectedValue === 'string' && selectedValue) {
          selectedIds = [selectedValue];
        }

        // Si no hay selección, saltar
        if (selectedIds.length === 0) {
          continue;
        }

        const result = await checkSelfAssessmentAnswer(
          courseSlug,
          lessonSlug,
          question.id,
          selectedIds
        );

        if (result.ok) {
          newFeedback[question.id] = {
            questionId: question.id,
            correct: result.correct,
            correctChoiceIds: result.correctChoiceIds,
            selectedCorrectIds: result.selectedCorrectIds,
          };
        }
      }

      setFeedbackByQuestion(newFeedback);
    });
  };

  const formValues = watch();

  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Autoevaluación
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {questions.map((question) => {
            const feedback = feedbackByQuestion[question.id];
            const isAnswered = !!feedback;

            return (
              <div
                key={question.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                {/* Pregunta */}
                <div className="mb-4">
                  {question.topic_title && (
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                      {question.topic_title}
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {question.stem}
                  </p>
                  {question.code_snippet && (
                    <pre className="mt-2 p-3 rounded bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto">
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {question.code_snippet}
                      </code>
                    </pre>
                  )}
                </div>

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
                          'bg-[#f3faf7] dark:bg-[#014737] border-success/30 dark:border-success/40';
                      } else if (wasSelected && !wasSelectedCorrectly) {
                        choiceClassName +=
                          'bg-[#fdf2f2] dark:bg-[#771d1d] border-danger/30 dark:border-danger/40';
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
                          className="mt-1 flex-shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {choice.body}
                        </span>
                        {isAnswered && isCorrect && (
                          <svg
                            className="ml-auto w-5 h-5 text-success dark:text-green-300 flex-shrink-0"
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
                            className="ml-auto w-5 h-5 text-danger dark:text-red-300 flex-shrink-0"
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
                        ? 'bg-[#f3faf7] dark:bg-[#014737] border-success/30 dark:border-success/40 text-success dark:text-green-300'
                        : 'bg-[#fdf2f2] dark:bg-[#771d1d] border-danger/30 dark:border-danger/40 text-danger dark:text-red-300'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-strong dark:bg-brand dark:hover:bg-brand-strong rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Verificando...' : 'Enviar respuestas'}
          </button>
        </form>
      </div>
    </section>
  );
}
