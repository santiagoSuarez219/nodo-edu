-- spec-062 D4: parte de 20260729000003 (on conflict por sentencia, sin
-- bloque exception). Solo cambia el insert en profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    -- Si faltan las partes, sync_profile_names propone la separación desde aquí.
    coalesce(new.raw_user_meta_data->>'full_name', new.email, '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id, role) do nothing;

  insert into public.students (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;
