create table public.grade_items (
  id                  uuid        primary key default gen_random_uuid(),
  academic_course_id  uuid        not null references public.academic_courses(id) on delete cascade,
  name                text        not null,
  order_index         smallint    not null default 0,
  created_at          timestamptz not null default now(),

  constraint grade_items_course_name_unique unique (academic_course_id, name)
);

create index on public.grade_items (academic_course_id, order_index);
