-- spec-059 D8: pares (peso, nota) de las matrículas PROPIAS (activas o
-- retiradas). Sin nombres de ítems ni cortes.
create or replace function public.get_own_enrollment_grade_lines(
  p_enrollment_ids uuid[]
)
returns table (
  enrollment_id uuid,
  grade_item_id uuid,
  weight        numeric,
  score         numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, gi.id, gi.weight, sg.score
  from enrollments e
  join grade_items gi
    on gi.academic_course_id = e.academic_course_id
  left join student_grades sg
    on sg.enrollment_id = e.id
   and sg.grade_item_id = gi.id
  where e.id = any(p_enrollment_ids)
    and e.student_id = auth.uid();
$$;

revoke all on function public.get_own_enrollment_grade_lines(uuid[]) from public, anon;
grant execute on function public.get_own_enrollment_grade_lines(uuid[]) to authenticated;
