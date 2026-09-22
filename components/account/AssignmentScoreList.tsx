import Link from "next/link";
import type { AssignmentScoreRow } from "@/lib/submissions/types";
import { SUBMISSION_STATUS_LABELS } from "./submissionStatusLabels";

interface Props {
  enrollmentId: string;
  assignments: AssignmentScoreRow[];
}

function gradeDisplay(score: number | null, maxPoints: number) {
  if (score === null) return "—";
  return `${score.toFixed(2)}/${maxPoints.toFixed(2)}`;
}

// D3 (spec-056): una evaluación cerrada muestra su puntaje íntegro pero SIN
// enlace a resultados — esa página hace notFound() con el grupo cerrado
// (DEBT-085). Esta lista nunca produce un enlace que lleve a un 404.
export function AssignmentScoreList({ enrollmentId, assignments }: Props) {
  if (assignments.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Evaluaciones
      </h3>
      <ul className="flex flex-col gap-1">
        {assignments.map((assignment) => {
          const status = SUBMISSION_STATUS_LABELS[assignment.status];

          const row = (
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {assignment.title}
                </span>
                <span
                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                >
                  {status.label}
                </span>
                {assignment.is_closed && (
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    Cerrada
                  </span>
                )}
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  Intento {assignment.attempt_number}
                </span>
              </div>
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-white shrink-0">
                {gradeDisplay(assignment.score, assignment.max_points)}
              </span>
            </div>
          );

          return (
            <li key={assignment.variant_group_id}>
              {assignment.is_closed ? (
                row
              ) : (
                <Link
                  href={`/cuenta/cursos/${enrollmentId}/evaluaciones/${assignment.variant_group_id}/resultados`}
                  className="block -mx-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
