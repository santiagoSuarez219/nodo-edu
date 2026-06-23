-- Función reutilizable para verificar roles en políticas RLS
create or replace function public.has_role(uid uuid, role_name public.app_role)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = uid and role = role_name
  );
$$;

-- ─── profiles ────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Un usuario solo puede ver su propio perfil; admin ve todos
create policy "profiles: select own or admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.has_role(auth.uid(), 'admin')
  );

-- Un usuario solo puede actualizar su propio perfil
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── students ────────────────────────────────────────────────────────────────
alter table public.students enable row level security;

create policy "students: select own or admin"
  on public.students for select
  using (
    auth.uid() = profile_id
    or public.has_role(auth.uid(), 'admin')
  );

create policy "students: update own"
  on public.students for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ─── user_roles ──────────────────────────────────────────────────────────────
alter table public.user_roles enable row level security;

-- Solo el propio usuario o admin puede ver los roles
create policy "user_roles: select own or admin"
  on public.user_roles for select
  using (
    auth.uid() = user_id
    or public.has_role(auth.uid(), 'admin')
  );

-- Nadie puede insertar/modificar/eliminar roles desde el cliente
-- (solo el trigger de signup asigna 'student'; los demás roles se asignan con service_role)

-- ─── lesson_progress ─────────────────────────────────────────────────────────
alter table public.lesson_progress enable row level security;

create policy "lesson_progress: select own or admin"
  on public.lesson_progress for select
  using (
    auth.uid() = user_id
    or public.has_role(auth.uid(), 'admin')
  );

create policy "lesson_progress: insert own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "lesson_progress: update own"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lesson_progress: delete own"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);
