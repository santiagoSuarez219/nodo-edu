import Link from "next/link";

interface Props {
  academicCourseId: string;
  active: "planilla" | "resumen";
}

const base =
  "rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700";
const activeClass = `${base} bg-blue-700 text-white dark:bg-blue-600`;
const idleClass = `${base} border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700`;

// spec-063 D1/D12: la vista vive en la URL; el selector son dos enlaces.
export function AttendanceViewSwitcher({ academicCourseId, active }: Props) {
  const href = `/admin/courses/${academicCourseId}/asistencia`;
  return (
    <nav aria-label="Vista de asistencia" className="flex gap-2">
      <Link
        href={href}
        aria-current={active === "planilla" ? "page" : undefined}
        className={active === "planilla" ? activeClass : idleClass}
      >
        Planilla
      </Link>
      <Link
        href={`${href}?vista=resumen`}
        aria-current={active === "resumen" ? "page" : undefined}
        className={active === "resumen" ? activeClass : idleClass}
      >
        Resumen mensual
      </Link>
    </nav>
  );
}
