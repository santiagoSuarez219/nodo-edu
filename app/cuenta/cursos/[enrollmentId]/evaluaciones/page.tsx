import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getEnrollmentById } from "@/lib/enrollments/index";
import { getSubmissionByStudent } from "@/lib/submissions";
import { getOpenAssignmentGroupsForStudent } from "@/lib/assignments";
import { ErrorState, INFRA_ERROR_COPY } from "@/components/ErrorState";

export const metadata: Metadata = { title: "Evaluaciones — Mis cursos" };

interface Props {
  params: Promise<{ enrollmentId: string }>;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
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

export default async function EvaluacionesPage({ params }: Props) {
  const { enrollmentId } = await params;
  const user = await requireUser(`/cuenta/cursos/${enrollmentId}/evaluaciones`);

  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.student_id !== user.id || enrollment.status !== "active") {
    notFound();
  }

  // No se usa getActiveAssignmentsByEnrollment (spec-018): solo devuelve
  // grupos con una allocation YA existente, así que un estudiante que nunca
  // abrió ninguna evaluación vería el listado vacío — el sorteo ocurre recién
  // al entrar a .../evaluaciones/[groupId] (getOrAllocateVariant), no al
  // listar. La RLS de assignment_variant_groups ("student_sees_published_groups")
  // ya permite esta lectura por matrícula activa, sin necesidad de allocation.
  // spec-055: consulta compartida con la tarjeta de acceso del detalle de
  // matrícula — mismo criterio, sin poder divergir.
  const openGroups = await getOpenAssignmentGroupsForStudent(enrollment.academic_course_id);

  const header = (
    <div>
      <Link
        href={`/cuenta/cursos/${enrollmentId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al curso
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        Evaluaciones
      </h1>
    </div>
  );

  if (openGroups.status === "unavailable") {
    return (
      <main className="flex-1 pt-6 pb-14 flex flex-col gap-6">
        {header}
        <ErrorState title={INFRA_ERROR_COPY.title} description={INFRA_ERROR_COPY.description} />
      </main>
    );
  }

  const withStatus = await Promise.all(
    openGroups.groups.map(async (group) => ({
      group,
      lastSubmission: await getSubmissionByStudent(group.id, enrollmentId),
    }))
  );

  return (
    <main className="flex-1 pt-6 pb-14 flex flex-col gap-6">
      {header}

      {withStatus.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay evaluaciones disponibles por ahora.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {withStatus.map(({ group, lastSubmission }) => {
            const status = lastSubmission ? STATUS_LABELS[lastSubmission.status] : null;
            return (
              <li key={group.id}>
                <Link
                  href={`/cuenta/cursos/${enrollmentId}/evaluaciones/${group.id}`}
                  className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-5 py-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{group.title}</p>
                      {group.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                        status?.className ?? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {status?.label ?? "Sin intentos"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
