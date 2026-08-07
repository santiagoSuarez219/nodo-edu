"use client";

import { AssignmentGroupWithVariants } from "@/lib/assignments/types";
import { QuestionText } from "@/components/questions/QuestionText";

interface AssignmentGroupDetailProps {
  group: AssignmentGroupWithVariants;
  courseId: string;
  groupId: string;
}

export default function AssignmentGroupDetail({ group }: AssignmentGroupDetailProps) {
  const typeLabels: Record<string, string> = {
    practice: "Práctica",
    quiz: "Quiz",
    exam: "Examen",
    homework: "Tarea",
  };

  const showFeedbackLabels: Record<string, string> = {
    submit: "Al enviar",
    close: "Al cerrar",
    never: "Nunca",
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const allPointsSame =
    group.variants.length > 0 &&
    group.variants.every((v) => v.total_points === group.variants[0].total_points);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Configuración</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Tipo
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {typeLabels[group.type] || group.type}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Intentos máximos
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{group.max_attempts}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Abre
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatDate(group.opens_at)}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Cierra
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatDate(group.closes_at)}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Límite de tiempo
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {group.time_limit_minutes ? `${group.time_limit_minutes} minutos` : "Sin límite"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Mostrar retroalimentación
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {showFeedbackLabels[group.show_feedback_on] || group.show_feedback_on}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Mezclar preguntas
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {group.shuffle_questions ? "Sí" : "No"}
            </p>
            {group.shuffle_questions && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Cada estudiante ve las preguntas en un orden distinto. La numeración de esta ficha no coincide con la que ellos ven.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Mezclar opciones
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
              {group.shuffle_choices ? "Sí" : "No"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Variantes</h2>
          {allPointsSame && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Balanceadas
            </span>
          )}
        </div>

        <div className="space-y-4">
          {group.variants.map((variant) => (
            <div
              key={variant.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Variante {variant.variant_label}</h3>
                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-2 py-1 rounded">
                  {variant.total_points} pts
                </span>
              </div>

              {variant.questions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Sin preguntas</p>
              ) : (
                <div className="space-y-2">
                  {variant.questions.map((q) => (
                    <div key={q.id} className="flex items-start gap-3 text-sm">
                      <span className="font-mono text-gray-600 dark:text-gray-400 min-w-fit">
                        {q.order_index + 1}.
                      </span>
                      <span className="flex-1 text-gray-700 dark:text-gray-200">
                        {q.question?.stem ? (
                          <QuestionText text={q.question.stem} />
                        ) : (
                          <span className="italic text-gray-400 dark:text-gray-500">
                            Pregunta no encontrada ({q.question_id.slice(0, 8)}...)
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-gray-600 dark:text-gray-400 min-w-fit">
                        {q.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
