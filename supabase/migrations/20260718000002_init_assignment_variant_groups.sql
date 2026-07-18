-- Assignment Variant Groups: the evaluation as an academic unit
create table if not exists assignment_variant_groups (
  id uuid primary key default gen_random_uuid(),
  academic_course_id uuid not null references academic_courses(id) on delete restrict,
  grade_item_id uuid references grade_items(id) on delete set null,
  title text not null,
  description text,
  type text not null check (type in ('practice','quiz','exam','homework')),
  opens_at timestamptz,
  closes_at timestamptz,
  time_limit_minutes smallint check (time_limit_minutes is null or time_limit_minutes > 0),
  shuffle_questions boolean not null default false,
  shuffle_choices boolean not null default false,
  show_feedback_on text not null default 'submit' check (show_feedback_on in ('submit','close','never')),
  max_attempts smallint not null default 1 check (max_attempts >= 1),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_window check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create index if not exists assignment_variant_groups_academic_course_published
  on assignment_variant_groups(academic_course_id, is_published);

-- Ensure assignments table has variant_group_id column if it doesn't exist
-- (table may already exist from prior integration)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'assignments' and column_name = 'variant_group_id'
  ) then
    alter table assignments add column variant_group_id uuid references assignment_variant_groups(id) on delete cascade;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'assignments' and column_name = 'variant_label'
  ) then
    alter table assignments add column variant_label text check (variant_label ~ '^[A-Z]$');
  end if;
end $$;

-- Add constraint if it doesn't exist (ignore if already there)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'assignments' and constraint_name = 'unique_variant_label'
  ) then
    alter table assignments add constraint unique_variant_label unique (variant_group_id, variant_label);
  end if;
exception when duplicate_object then
  null;
end $$;

-- Assignment Questions: ordered union between variant and question with points
create table if not exists assignment_questions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  question_id uuid not null references questions(id) on delete restrict,
  order_index smallint not null default 0,
  points numeric(5,2) not null check (points > 0 and points <= 5),
  constraint unique_question_per_variant unique (assignment_id, question_id)
);

create index if not exists assignment_questions_assignment_order
  on assignment_questions(assignment_id, order_index);

-- Assignment Variant Allocations: persistent ballot allocation
create table if not exists assignment_variant_allocations (
  id uuid primary key default gen_random_uuid(),
  variant_group_id uuid not null references assignment_variant_groups(id) on delete cascade,
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  assignment_id uuid not null references assignments(id) on delete cascade,
  allocated_at timestamptz not null default now(),
  constraint unique_allocation unique (variant_group_id, enrollment_id)
);

create index if not exists assignment_variant_allocations_by_variant
  on assignment_variant_allocations(variant_group_id, assignment_id);

-- Trigger to update updated_at if not already there
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'assignment_variant_groups_updated_at'
      and tgrelid = 'assignment_variant_groups'::regclass
  ) then
    create trigger assignment_variant_groups_updated_at before update on assignment_variant_groups
      for each row execute function set_updated_at();
  end if;
end $$;
