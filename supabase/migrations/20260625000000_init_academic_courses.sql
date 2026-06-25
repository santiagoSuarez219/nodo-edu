create table public.academic_courses (
  id                uuid        primary key default gen_random_uuid(),
  teacher_id        uuid        not null references auth.users(id) on delete restrict,
  name              text        not null,
  code              text        not null,
  class_days        text[]      not null,
  class_time_start  time        not null,
  class_time_end    time        not null,
  enrollment_code   text        not null unique,
  course_slug       text,
  is_active         boolean     not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint check_class_times check (class_time_end > class_time_start)
);

create index on public.academic_courses (teacher_id);

-- Función reutilizable para actualizar updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_academic_courses_updated_at
  before update on public.academic_courses
  for each row execute function public.set_updated_at();
