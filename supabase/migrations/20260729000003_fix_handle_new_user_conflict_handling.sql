-- spec-027 (revisión de código): la migración anterior
-- (20260729000002_harden_handle_new_user.sql) envolvía los 3 inserts en un
-- único bloque "exception when unique_violation", pero en PL/pgSQL capturar
-- una excepción revierte TODO el bloque que la contiene — si el insert en
-- user_roles chocaba con un duplicado, el insert ya exitoso en profiles
-- también se revertía, dejando exactamente el escenario que se quería
-- erradicar (usuario sin rol student). Se reemplaza por "on conflict do
-- nothing" por sentencia: cada insert es idempotente por sí mismo y ya no
-- depende de un catch que revierta a sus vecinos. Cualquier error que no sea
-- un conflicto de duplicado sigue sin capturarse y revierte la transacción
-- completa (comportamiento intencional, ver Fase 1 del spec).
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
