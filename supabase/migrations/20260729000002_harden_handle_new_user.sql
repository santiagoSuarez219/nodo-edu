-- spec-027: handle_new_user silenciaba CUALQUIER error (when others) y
-- devolvía new igual, dejando usuarios de auth.users sin rol 'student' de
-- forma invisible. Con el registro fusionado (registro + matrícula en un
-- solo paso) ese fallo silencioso ahora rompe la matrícula con un error
-- opaco de RLS. Se restringe el catch a unique_violation (reintentos
-- idempotentes) y se deja que cualquier otro error se propague, para que
-- signUp falle de forma visible en vez de crear una cuenta a medias.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, '')
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'student');

  insert into public.students (profile_id)
  values (new.id);

  return new;
exception
  when unique_violation then
    raise warning 'handle_new_user: fila duplicada ignorada para %: %', new.id, sqlerrm;
    return new;
end;
$$;
