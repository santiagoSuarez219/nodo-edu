create table public.grade_groups (
  id                  uuid         primary key default gen_random_uuid(),
  academic_course_id  uuid         not null references public.academic_courses(id) on delete cascade,
  name                text         not null check (length(btrim(name)) > 0),
  -- spec-059 D12: peso declarado del corte ante la plataforma institucional.
  target_weight       numeric(4,3) not null check (target_weight > 0 and target_weight <= 1),
  order_index         smallint     not null default 0,
  created_at          timestamptz  not null default now(),

  constraint grade_groups_course_name_unique unique (academic_course_id, name),
  constraint grade_groups_id_course_unique unique (id, academic_course_id)
);

create index on public.grade_groups (academic_course_id, order_index);

-- spec-059 D3/D12: Σ target_weight por curso ≤ 1.
create or replace function public.enforce_grade_groups_target_sum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_others numeric;
begin
  perform pg_advisory_xact_lock(
    hashtextextended('grade_groups_target:' || new.academic_course_id::text, 0)
  );

  select coalesce(sum(gg.target_weight), 0) into v_others
  from grade_groups gg
  where gg.academic_course_id = new.academic_course_id
    and gg.id <> new.id;

  if v_others + new.target_weight > 1 then
    raise exception using
      errcode = '23514',
      message = 'grade_groups_target_sum_exceeded',
      detail  = format('available=%s', greatest(1 - v_others, 0));
  end if;

  return new;
end;
$$;

create trigger enforce_grade_groups_target_sum
  before insert or update of target_weight on public.grade_groups
  for each row execute function public.enforce_grade_groups_target_sum();
