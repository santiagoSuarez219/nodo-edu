-- spec-039: estado de habilitación de lecciones.
-- La presencia de una fila significa que la lección está DESHABILITADA.
-- Ausencia = habilitada (el default y el comportamiento previo al spec).
-- El catálogo de lecciones sigue viviendo en git (lib/courses/data/*.ts);
-- esta tabla solo guarda el estado que debe ser mutable en runtime, porque
-- el filesystem de Vercel es de solo lectura.

create table public.disabled_lessons (
  course_slug   text        not null,
  lesson_slug   text        not null,
  disabled_at   timestamptz not null default now(),
  disabled_by   uuid        references auth.users(id) on delete set null,
  reason        text,

  primary key (course_slug, lesson_slug)
);

-- Sin índices adicionales: la única consulta de lectura es
--   select lesson_slug from disabled_lessons where course_slug = $1
-- y la PK (course_slug, lesson_slug) ya la sirve por prefijo.
-- `disabled_by` es nullable a propósito: las escrituras vía service_role
-- (MCP) no tienen un auth.uid() asociado.

comment on table public.disabled_lessons is
  'spec-039: lecciones cerradas al estudiante. La fila existe => deshabilitada.';
