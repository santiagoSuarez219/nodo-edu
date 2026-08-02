import type { Topic } from "@/lib/courses/types";
import { TopicList } from "@/components/courses/TopicList";

interface LessonUnavailableProps {
  /**
   * `disabled`: el docente cerró la lección — mensaje honesto sobre el motivo.
   * `unavailable`: no se pudo verificar el estado (fallo de infraestructura,
   * D6 de spec-039) — nunca afirmar "deshabilitada" cuando no se sabe.
   */
  reason: "disabled" | "unavailable";
  hasTopics: boolean;
  topics: Topic[];
}

export function LessonUnavailable({ reason, hasTopics, topics }: LessonUnavailableProps) {
  const isDisabled = reason === "disabled";

  return (
    <div>
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {isDisabled ? "Esta lección todavía no está disponible" : "No pudimos verificar esta lección"}
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isDisabled
            ? "Tu docente la abrirá cuando corresponda."
            : "No pudimos verificar la disponibilidad de esta lección. Intenta de nuevo en unos minutos."}
        </p>
      </div>
      {hasTopics && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Temas previstos
          </h2>
          <TopicList topics={topics} />
        </section>
      )}
    </div>
  );
}
