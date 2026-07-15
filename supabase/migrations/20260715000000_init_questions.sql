-- ─── questions ───────────────────────────────────────────────────────────────
create table public.questions (
  id            uuid        primary key default gen_random_uuid(),
  created_by    uuid        not null references auth.users(id) on delete restrict,
  course_slug   text,
  lesson_slug   text,
  topic_title   text,
  type          text        not null,
  stem          text        not null,
  code_snippet  text,
  code_language text,
  difficulty    smallint    not null default 1,
  tags          text[]      not null default '{}',
  is_published  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint questions_type_check
    check (type in ('multiple_choice', 'open_text', 'code_snippet', 'code_write', 'coding_challenge')),
  constraint questions_difficulty_check
    check (difficulty between 1 and 5)
);

create index on public.questions (created_by);
create index on public.questions (course_slug, lesson_slug);
create index on public.questions (type);

create trigger set_questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

-- ─── question_choices ────────────────────────────────────────────────────────
create table public.question_choices (
  id          uuid     primary key default gen_random_uuid(),
  question_id uuid     not null references public.questions(id) on delete cascade,
  body        text     not null,
  is_correct  boolean  not null default false,
  order_index smallint not null default 0,

  constraint question_choices_order_unique unique (question_id, order_index)
);

create index on public.question_choices (question_id);

-- ─── question_rubrics ────────────────────────────────────────────────────────
create table public.question_rubrics (
  id          uuid           primary key default gen_random_uuid(),
  question_id uuid           not null unique references public.questions(id) on delete cascade,
  criteria    jsonb          not null default '[]',
  max_score   numeric(5, 2)  not null,

  constraint question_rubrics_max_score_check
    check (max_score > 0 and max_score <= 5)
);

-- ─── coding_challenge_tests ──────────────────────────────────────────────────
create table public.coding_challenge_tests (
  id              uuid     primary key default gen_random_uuid(),
  question_id     uuid     not null references public.questions(id) on delete cascade,
  input           text     not null,
  expected_output text     not null,
  is_hidden       boolean  not null default false,
  order_index     smallint not null default 0
);

create index on public.coding_challenge_tests (question_id);
