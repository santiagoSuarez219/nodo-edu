-- Tablas para asistencia por sesión con código efímero
-- Decisión 1: código único entre sesiones abiertas (índice parcial)
-- Decisión 7: una sola sesión abierta por curso a la vez (índice único parcial)
-- Decisión 8: session_date en zona horaria America/Bogota (server-side en
-- la Server Action openSession, lib/attendance/index.ts)

create table public.class_sessions (
  id               uuid        primary key default gen_random_uuid(),
  academic_course_id uuid      not null references public.academic_courses(id) on delete cascade,
  session_date     date        not null,
  attendance_code  text        not null,
  code_expires_at  timestamptz not null,
  is_open          boolean     not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index on public.class_sessions (academic_course_id) where is_open;
create unique index on public.class_sessions (attendance_code) where is_open;
create index on public.class_sessions (academic_course_id, session_date);

create trigger set_class_sessions_updated_at
  before update on public.class_sessions
  for each row
  execute function public.set_updated_at();

-- Decisión 5: idempotencia (unique constraint + on conflict do nothing)
-- Decisión 4: sin insert policy de estudiante — solo RPC security definer

create table public.attendance_records (
  id         uuid        primary key default gen_random_uuid(),
  session_id uuid        not null references public.class_sessions(id) on delete cascade,
  student_id uuid        not null references auth.users(id) on delete cascade,
  marked_at  timestamptz not null default now(),

  constraint attendance_records_unique unique (session_id, student_id)
);

create index on public.attendance_records (session_id);
