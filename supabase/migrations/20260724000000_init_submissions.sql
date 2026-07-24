-- The remote project already had `submissions`/`answers` tables, RLS enabled,
-- and 6 policies (e.g. "submissions: select") — none of it tracked by any
-- migration in this repo. It predates spec-018's 2026-07-18 pivot to the
-- variant-group model: `submissions` has no `variant_group_id` column, and
-- its one row (status=in_progress, started_at 2026-07-15) references an
-- `assignments` row with `variant_group_id is null` (a legacy, pre-redesign
-- assignment). This is debris from an abandoned earlier iteration, not real
-- student data — dropped here so spec-019 starts from a clean, fully tracked
-- schema instead of migrating orphaned rows forward.
drop table if exists public.submissions cascade;
drop table if exists public.answers cascade;

-- Submissions: a student's attempt over their allocated variant of an evaluation
-- (one row per attempt_number). Ported from backup/feat-question-bank's
-- 20260625000007_init_submissions.sql, adapted to the variant-group model
-- introduced by spec-018: attempts are limited per group (evaluation), not per
-- variant, so `variant_group_id` is added and the unique constraint moves to it.
create table public.submissions (
  id              uuid          primary key default gen_random_uuid(),
  assignment_id   uuid          not null references public.assignments(id) on delete restrict,
  variant_group_id uuid         not null references public.assignment_variant_groups(id) on delete restrict,
  enrollment_id   uuid          not null references public.enrollments(id) on delete restrict,
  attempt_number  smallint      not null default 1,
  started_at      timestamptz   not null default now(),
  submitted_at    timestamptz,
  status          text          not null default 'in_progress',
  auto_score      numeric(5, 2),
  final_score     numeric(5, 2),
  graded_at       timestamptz,

  constraint submissions_unique unique (variant_group_id, enrollment_id, attempt_number),
  constraint submissions_status_check
    check (status in ('in_progress', 'submitted', 'graded', 'expired')),
  constraint submissions_attempt_check
    check (attempt_number >= 1)
);

create index on public.submissions (enrollment_id);
create index on public.submissions (variant_group_id, status);
create index on public.submissions (assignment_id);

-- Answers: a student's response to a question within an attempt (exists from
-- the start due to auto-save).
create table public.answers (
  id                     uuid          primary key default gen_random_uuid(),
  submission_id          uuid          not null references public.submissions(id) on delete cascade,
  question_id            uuid          not null references public.questions(id) on delete restrict,
  assignment_question_id uuid          not null references public.assignment_questions(id) on delete restrict,
  selected_choice_ids    uuid[]        not null default '{}',
  text_response          text,
  is_correct             boolean,
  auto_score             numeric(5, 2),
  manual_score           numeric(5, 2),
  reviewer_notes         text,
  reviewed_at            timestamptz,

  constraint answers_unique unique (submission_id, question_id)
);

create index on public.answers (submission_id);
