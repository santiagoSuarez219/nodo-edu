-- spec-059 D15: crea de antemano el ítem de autoevaluaciones (idempotente).
-- security INVOKER: la política de insert de grade_items autoriza.
-- Mismos valores que la creación perezosa de apply_self_assessment_grade,
-- que lo reutiliza al encontrarlo por kind.
create or replace function public.ensure_self_assessment_grade_item(
  p_academic_course_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  select gi.id into v_id
  from grade_items gi
  where gi.academic_course_id = p_academic_course_id
    and gi.kind = 'self_assessment';

  if v_id is not null then
    return v_id;
  end if;

  if exists (
    select 1 from grade_items gi
    where gi.academic_course_id = p_academic_course_id
      and gi.name = 'Autoevaluaciones'
  ) then
    raise exception using
      errcode = '23505',
      message = 'self_assessment_item_name_taken';
  end if;

  -- Sin destino de conflicto: cubre el índice único parcial de spec-040 D5.
  insert into grade_items (academic_course_id, name, order_index, kind)
  values (
    p_academic_course_id,
    'Autoevaluaciones',
    coalesce((select max(order_index) + 1 from grade_items
               where academic_course_id = p_academic_course_id), 0),
    'self_assessment'
  )
  on conflict do nothing
  returning id into v_id;

  if v_id is null then
    select gi.id into v_id
    from grade_items gi
    where gi.academic_course_id = p_academic_course_id
      and gi.kind = 'self_assessment';
  end if;

  return v_id;
end;
$$;

revoke all on function public.ensure_self_assessment_grade_item(uuid) from public, anon;
grant execute on function public.ensure_self_assessment_grade_item(uuid) to authenticated;
