-- Row Level Security para self_assessment_attempts
-- Decisión D1: solo persistencia agregada de intentos completados

alter table public.self_assessment_attempts enable row level security;

-- select: propio estudiante o admin
create policy "self_assessment_attempts_select_own_or_admin" on public.self_assessment_attempts
  for select
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- insert: solo la sesión del propio estudiante
create policy "self_assessment_attempts_insert_own" on public.self_assessment_attempts
  for insert
  with check (user_id = auth.uid());

-- INTENCIONALMENTE: sin políticas de update ni delete. La tabla es append-only:
-- un intento enviado no se edita ni se borra. Si el estudiante intenta una
-- lección nuevamente, se inserta un nuevo registro. Las correcciones
-- o borrados de intentos quedan para una futura necesidad analítica.
