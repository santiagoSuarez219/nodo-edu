-- Tabla lesson_progress: progreso de lectura por usuario y lección
create table public.lesson_progress (
  user_id      uuid references auth.users(id) on delete cascade,
  course_slug  text not null,
  lesson_slug  text not null,
  viewed_at    timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, course_slug, lesson_slug)
);

-- Índices
create index on public.lesson_progress (user_id);
create index on public.lesson_progress (user_id, course_slug);
