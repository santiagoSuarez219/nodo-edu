-- Tabla de intentos de autoevaluación
-- Decisión D1: persistencia agregada de intentos (no por respuesta)
-- Una bitácora append-only de intentos completados por estudiante

create table public.self_assessment_attempts (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  course_slug      text        not null,
  lesson_slug      text        not null,
  submitted_at     timestamptz not null default now(),
  question_count   int         not null,
  answered_count   int         not null,
  correct_count    int         not null,

  constraint self_assessment_attempts_answered_count_check
    check (answered_count = question_count and question_count > 0)
);

-- Índice: única consulta de lectura (¿existe intento?)
create index on public.self_assessment_attempts (user_id, course_slug, lesson_slug);

-- Índice: futuras vistas de curso
create index on public.self_assessment_attempts (user_id, course_slug);
