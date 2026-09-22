import type { SubmissionStatus } from "@/lib/submissions/types";

// spec-056 (Fase 2): extraído de app/cuenta/cursos/[enrollmentId]/evaluaciones/page.tsx
// para que esa página y AssignmentScoreList (vista consolidada de "Mis notas")
// no puedan divergir en las etiquetas de un mismo estado.
export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, { label: string; className: string }> = {
  in_progress: {
    label: "En progreso",
    className: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  },
  submitted: {
    label: "Enviado — pendiente de revisión",
    className: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
  },
  graded: {
    label: "Calificado",
    className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  },
  expired: {
    label: "Expirado",
    className: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
  },
};
