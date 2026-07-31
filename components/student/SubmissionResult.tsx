import { QuestionRenderer } from "./QuestionRenderer";
import type { QuestionDetail, SubmissionWithAnswers } from "@/lib/submissions/types";

interface Props {
  submission: SubmissionWithAnswers;
  questions: QuestionDetail[];
  totalPoints: number;
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Selección múltiple",
  open_text: "Texto abierto",
  code_snippet: "Código (lectura)",
  code_write: "Código (escritura)",
  coding_challenge: "Challenge",
};

export function SubmissionResult({ submission, questions, totalPoints }: Props) {
  const displayScore = submission.final_score ?? submission.auto_score;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {submission.status === "graded" ? "Calificación final" : "Puntaje automático"}
          </p>
          {submission.status === "submitted" && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
              Pendiente de revisión por el docente.
            </p>
          )}
        </div>
        <div className="text-right">
          {displayScore !== null ? (
            <>
              <p className="text-3xl font-bold font-mono text-gray-900 dark:text-white">
                {displayScore.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">/ {totalPoints.toFixed(2)} pts</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-400 dark:text-gray-500">—</p>
          )}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Detalle por pregunta
          </h2>
          {questions.map((q, idx) => {
            const answer = submission.answers.find((a) => a.question_id === q.question_id);
            const earned = answer?.auto_score ?? answer?.manual_score ?? null;
            const needsManual = ["open_text", "code_write", "coding_challenge"].includes(q.type);

            return (
              <div
                key={q.assignment_question_id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-5 py-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      #{idx + 1} · {TYPE_LABELS[q.type] ?? q.type}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{q.stem}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                      {earned !== null ? earned.toFixed(2) : "—"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">/ {q.points.toFixed(2)}</p>
                  </div>
                </div>

                {answer && (
                  <QuestionRenderer
                    question={q}
                    answer={{
                      selected_choice_ids: answer.selected_choice_ids,
                      text_response: answer.text_response ?? "",
                    }}
                    disabled
                  />
                )}

                {needsManual && answer?.reviewer_notes && (
                  <>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Retroalimentación del docente
                    </p>
                    <div className="rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">
                      {answer.reviewer_notes}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
