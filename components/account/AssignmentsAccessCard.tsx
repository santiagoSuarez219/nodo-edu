import Link from "next/link";

interface Props {
  enrollmentId: string;
  // spec-055 (D4): `null` significa "no se pudo contar" — un fallo de la
  // consulta no oculta el acceso, degrada a la versión genérica. Distinto de
  // `0`, que no debería llegar aquí: el consumidor no renderiza esta tarjeta
  // sin al menos una evaluación abierta o un fallo.
  openCount: number | null;
}

// spec-055: acceso a /cuenta/cursos/[enrollmentId]/evaluaciones desde el
// detalle de matrícula — antes de este spec no existía ningún enlace hacia
// ahí (DEBT-084). Toda la tarjeta es el área clicable, con el mismo patrón
// visual que sus tarjetas hermanas (EnrollmentDetail, SelfAssessmentSummaryCard).
export function AssignmentsAccessCard({ enrollmentId, openCount }: Props) {
  const description =
    openCount === null
      ? "Consulta las evaluaciones de este curso."
      : openCount === 1
        ? "Tienes 1 evaluación abierta."
        : `Tienes ${openCount} evaluaciones abiertas.`;

  // TC-055-011: el nombre accesible del `<Link>` no se calculaba desde su
  // contenido (verificado en el árbol de accesibilidad real de Chrome — el
  // enlace aparecía sin nombre, a diferencia de cualquier otro de la página),
  // pese a envolver un `<h2>` y un `<p>` con texto visible. `aria-label`
  // explícito evita depender de ese cálculo y garantiza el nombre exigido
  // por el criterio de aceptación 8 del spec, sin importar la causa exacta.
  const accessibleLabel = `Evaluaciones. ${description}`;

  return (
    <Link
      href={`/cuenta/cursos/${enrollmentId}/evaluaciones`}
      aria-label={accessibleLabel}
      className="flex items-center justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700"
    >
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
          Evaluaciones
        </h2>
        <p className="text-sm text-gray-900 dark:text-white">{description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {openCount !== null && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {openCount}
          </span>
        )}
        <svg
          className="w-4 h-4 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
