-- spec-060: lecciones que el docente dio en clase, por grupo (curso académico).
-- La presencia de una fila significa "vista en clase"; desmarcar es un delete.
-- Mismo modelo que disabled_lessons (spec-039). El catálogo de lecciones vive
-- en git, por lo que no hay FK hacia él: la validación del slug ocurre en
-- TypeScript antes de escribir.

create table public.taught_lessons (
  academic_course_id uuid        not null references public.academic_courses(id) on delete cascade,
  lesson_slug        text        not null,
  marked_at          timestamptz not null default now(),
  -- Nullable: las escrituras vía service_role (MCP) no tienen auth.uid().
  marked_by          uuid        references auth.users(id) on delete set null,

  primary key (academic_course_id, lesson_slug)
);

comment on table public.taught_lessons is
  'spec-060: lecciones vistas en clase por grupo. La fila existe => cuenta '
  'para la nota de autoevaluaciones (salvo que esté en disabled_lessons).';
