-- spec-042 — Montaje de preguntas en lecciones.
-- Sustituye a questions.course_slug/lesson_slug (una pregunta, una lección):
-- una pregunta se "monta" en 0..N lecciones. El montaje es lo único que la
-- autoevaluación de cierre consume desde spec-042 (ver D1/D4/D6 del spec).

create table public.lesson_questions (
  course_slug  text        not null,
  lesson_slug  text        not null,
  question_id  uuid        not null references public.questions(id) on delete cascade,
  -- D4: orden explícito de las preguntas dentro de la lección. Sin unique
  -- sobre (course_slug, lesson_slug, order_index) — ver D4 del spec, evita la
  -- danza de valores temporales al reordenar. Empates se desempatan siempre
  -- por questions.created_at, luego por question_id (idéntico en los 4 puntos
  -- de lectura de lib/self-assessment/index.ts).
  order_index  int         not null default 0,
  created_by   uuid        references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),

  primary key (course_slug, lesson_slug, question_id)
);

-- Reverso: "¿en qué lecciones está montada esta pregunta?" — usado por
-- GET /api/questions/{id}/lessons y por mapQuestionRow para embeber `lessons`.
create index on public.lesson_questions (question_id);

comment on table public.lesson_questions is
  'spec-042: montaje de una pregunta en una lección. No hay FK hacia el '
  'catálogo de lecciones (vive en git, no en Postgres) — course_slug/'
  'lesson_slug siguen siendo texto libre, igual que disabled_lessons.';
