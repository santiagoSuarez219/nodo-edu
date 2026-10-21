-- spec-062 D5/D9: la insignia "Revisar" de la lista de matriculados necesita
-- `name_needs_review`, que el docente no puede leer de `profiles` (RLS).
-- Cambia el tipo de retorno → drop + create.
drop function if exists public.get_student_profiles_public(uuid[]);

create function public.get_student_profiles_public(p_ids uuid[])
returns table (id uuid, full_name text, first_name text, last_name text, name_needs_review boolean)
language sql
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.first_name, p.last_name, p.name_needs_review
  from public.profiles p
  where p.id = any(p_ids);
$$;

grant execute on function public.get_student_profiles_public(uuid[]) to authenticated;
