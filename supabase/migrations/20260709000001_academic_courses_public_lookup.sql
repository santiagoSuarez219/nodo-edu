-- Fix: getEnrollmentsByStudent/getEnrollmentById embeben academic_courses(*)
-- vía PostgREST, pero RLS ("academic_courses: select own or admin") oculta
-- la fila al estudiante, devolviendo el embed como null y provocando un
-- crash al leer academic_course.teacher_id. La misma RLS de profiles
-- ("select own or admin") también le oculta el nombre del docente.
--
-- Esta función security definer expone únicamente las columnas no
-- confidenciales del curso (excluye enrollment_code, que debe seguir
-- siendo conocido solo por el docente dueño) junto con el nombre del
-- docente, para cualquier curso de una lista de ids.
create or replace function public.get_academic_courses_public(p_ids uuid[])
returns table (
  id uuid,
  teacher_id uuid,
  teacher_name text,
  name text,
  code text,
  class_days text[],
  class_time_start time,
  class_time_end time,
  course_slug text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    ac.id, ac.teacher_id, p.full_name, ac.name, ac.code, ac.class_days,
    ac.class_time_start, ac.class_time_end, ac.course_slug,
    ac.is_active, ac.created_at, ac.updated_at
  from public.academic_courses ac
  left join public.profiles p on p.id = ac.teacher_id
  where ac.id = any(p_ids);
$$;

grant execute on function public.get_academic_courses_public(uuid[]) to authenticated;
