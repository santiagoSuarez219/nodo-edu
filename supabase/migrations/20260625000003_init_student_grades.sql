create table public.student_grades (
  id            uuid         primary key default gen_random_uuid(),
  enrollment_id uuid         not null references public.enrollments(id) on delete cascade,
  grade_item_id uuid         not null references public.grade_items(id) on delete cascade,
  score         numeric(5,2) check (score is null or (score >= 0 and score <= 5)),
  recorded_at   timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),

  constraint student_grades_enrollment_item_unique unique (enrollment_id, grade_item_id)
);

create index on public.student_grades (enrollment_id);

create trigger set_student_grades_updated_at
  before update on public.student_grades
  for each row execute function public.set_updated_at();
