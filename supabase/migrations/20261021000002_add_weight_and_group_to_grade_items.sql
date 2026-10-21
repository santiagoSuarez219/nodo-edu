-- spec-059 D1/D2: fracción de la nota FINAL; null = sin ponderar.
alter table public.grade_items
  add column weight numeric(4,3)
  check (weight is null or (weight > 0 and weight <= 1));

-- spec-059 D12: corte institucional opcional, del MISMO curso.
alter table public.grade_items add column group_id uuid;

alter table public.grade_items
  add constraint grade_items_group_fk
  foreign key (group_id, academic_course_id)
  references public.grade_groups (id, academic_course_id)
  on delete set null (group_id);

create index on public.grade_items (group_id);

-- spec-059 D3: Σ weight por curso ≤ 1.
create or replace function public.enforce_grade_items_weight_sum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_others numeric;
begin
  if new.weight is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('grade_items_weight:' || new.academic_course_id::text, 0)
  );

  select coalesce(sum(gi.weight), 0) into v_others
  from grade_items gi
  where gi.academic_course_id = new.academic_course_id
    and gi.id <> new.id
    and gi.weight is not null;

  if v_others + new.weight > 1 then
    raise exception using
      errcode = '23514',
      message = 'grade_items_weight_sum_exceeded',
      detail  = format('available=%s', greatest(1 - v_others, 0));
  end if;

  return new;
end;
$$;

create trigger enforce_grade_items_weight_sum
  before insert or update of weight on public.grade_items
  for each row execute function public.enforce_grade_items_weight_sum();
