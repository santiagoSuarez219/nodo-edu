export interface NavLink {
  label: string;
  href?: string;
  disabled?: boolean;
  title?: string;
}

export function getStudentNavLinks(): NavLink[] {
  return [
    {
      label: "Grupo de Investigación",
      href: "/grupo-investigacion",
    },
  ];
}

export function getTeacherNavLinks(
  academicCourseId: string | null
): NavLink[] {
  const disabled = !academicCourseId;
  const courseHrefBase = academicCourseId
    ? `/admin/courses/${academicCourseId}`
    : "";

  return [
    {
      label: "Mis cursos",
      href: "/admin/courses",
    },
    {
      label: "Calificaciones",
      href: disabled ? undefined : `${courseHrefBase}/grades`,
      disabled,
      title: disabled
        ? "Selecciona un curso para ver calificaciones"
        : undefined,
    },
    {
      label: "Asistencia",
      href: disabled ? undefined : `${courseHrefBase}/attendance`,
      disabled,
      title: disabled
        ? "Selecciona un curso para ver asistencia"
        : undefined,
    },
    {
      label: "Evaluaciones",
      href: disabled ? undefined : `${courseHrefBase}/assignments`,
      disabled,
      title: disabled
        ? "Selecciona un curso para ver evaluaciones"
        : undefined,
    },
    {
      label: "Grupo de Investigación",
      href: "/grupo-investigacion",
    },
  ];
}
