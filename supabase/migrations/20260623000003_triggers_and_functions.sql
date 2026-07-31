-- Trigger: al registrarse un nuevo usuario, crear automáticamente
-- su fila en profiles, user_roles (rol 'student') y students.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Crear perfil base
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, '')
  );

  -- Asignar rol 'student' por defecto
  insert into public.user_roles (user_id, role)
  values (new.id, 'student');

  -- Crear fila en students
  insert into public.students (profile_id)
  values (new.id);

  return new;
exception
  when others then
    -- Registrar el error sin bloquear el signup
    raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
