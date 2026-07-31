export interface NavLink {
  label: string;
  href?: string;
  disabled?: boolean;
  title?: string;
}

export function getStudentNavLinks(): NavLink[] {
  return [
    {
      label: "Mis cursos",
      href: "/cuenta/cursos",
    },
    {
      label: "Grupo de Investigación",
      href: "/grupo-investigacion",
    },
  ];
}

export function getTeacherNavLinks(): NavLink[] {
  return [
    {
      label: "Mis cursos",
      href: "/admin/courses",
    },
    {
      label: "Grupo de Investigación",
      href: "/grupo-investigacion",
    },
  ];
}
