-- Fix: getEnrollmentsByAcademicCourse embebe profiles(id, full_name) del
-- estudiante vía PostgREST. RLS ("profiles: select own or admin") bloquea
-- al docente de ver el perfil de otro usuario, y para embeds many-to-one
-- PostgREST resuelve por inner join implícito: cuando el embed no puede
-- resolverse, la fila completa de enrollments se excluye del resultado
-- (el estudiante matriculado desaparece por completo de la lista del
-- docente, no solo su nombre).
--
-- Esta función security definer expone únicamente id/full_name del
-- estudiante (sin email, consistente con el resto de columnas sensibles
-- que ya se omiten en EnrollmentTable).
create or replace function public.get_student_profiles_public(p_ids uuid[])
returns table (id uuid, full_name text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.full_name
  from public.profiles p
  where p.id = any(p_ids);
$$;

grant execute on function public.get_student_profiles_public(uuid[]) to authenticated;
