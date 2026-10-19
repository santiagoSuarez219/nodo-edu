-- spec-058 (D9) — contador persistente de ejecuciones de código.
--
-- En serverless un contador en memoria no es global (ver lib/auth/rate-limit.ts)
-- y la cuota del proveedor es por cuenta, no por estudiante: sin esta tabla un
-- solo estudiante podría agotar la cuota y el gasto de todo el salón.
--
-- NO guarda código, entradas ni salidas del estudiante: solo cuenta y mide.

create table public.code_runs (
  id            uuid        primary key default gen_random_uuid(),
  submission_id uuid        not null references public.submissions(id) on delete cascade,
  question_id   uuid        not null references public.questions(id) on delete cascade,
  language      text        not null,
  outcome       text        not null default 'pending',
  cases_count   smallint    not null,
  duration_ms   integer,
  created_at    timestamptz not null default now(),

  constraint code_runs_outcome_check
    check (outcome in ('pending', 'completed', 'compile_error', 'provider_error'))
);

create index code_runs_submission_question_created_idx
  on public.code_runs (submission_id, question_id, created_at desc);

-- RLS habilitada SIN policies: ningún rol `authenticated` o `anon` puede leer ni
-- escribir. Solo `service_role` (que bypasa RLS) la usa, desde lib/code-runner.
-- El estudiante recibe el conteo restante en la respuesta de la Server Action.
alter table public.code_runs enable row level security;

comment on table public.code_runs is
  'spec-058: contador operativo de ejecuciones de coding_challenge. Sin policies a propósito: solo service_role.';
