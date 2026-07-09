-- Fix: un estudiante no puede validar un código de matrícula porque la
-- política "academic_courses: select own or admin" solo permite ver el
-- curso al docente dueño o admin. Esta función security definer expone
-- únicamente id/is_active para el flujo de matrícula, sin ampliar el
-- select general ni filtrar el resto de columnas (enrollment_code sigue
-- siendo confidencial fuera de este camino).
create or replace function public.find_course_by_enrollment_code(p_enrollment_code text)
returns table (id uuid, is_active boolean)
language sql
security definer
set search_path = public
as $$
  select ac.id, ac.is_active
  from public.academic_courses ac
  where ac.enrollment_code = p_enrollment_code;
$$;

grant execute on function public.find_course_by_enrollment_code(text) to authenticated;
