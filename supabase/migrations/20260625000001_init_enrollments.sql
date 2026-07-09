create table public.enrollments (
  id                  uuid        primary key default gen_random_uuid(),
  student_id          uuid        not null references auth.users(id) on delete restrict,
  academic_course_id  uuid        not null references public.academic_courses(id) on delete restrict,
  status              text        not null default 'active'
                                  check (status in ('active', 'withdrawn')),
  enrolled_at         timestamptz not null default now(),
  withdrawn_at        timestamptz,

  constraint enrollments_student_course_unique unique (student_id, academic_course_id)
);

create index on public.enrollments (student_id);
create index on public.enrollments (academic_course_id);
create index on public.enrollments (academic_course_id, status);
