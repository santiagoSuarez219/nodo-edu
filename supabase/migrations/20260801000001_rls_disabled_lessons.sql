-- Helpers de acceso por course_slug. Espejo de public.has_role
-- (20260623000002_rls_policies.sql): security definer + search_path fijo,
-- para que la política no dependa de las políticas de las tablas que consulta.

create or replace function public.has_course_slug_access(uid uuid, slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.has_role(uid, 'admin')
    or exists (
      select 1 from public.academic_courses ac
      where ac.course_slug = slug and ac.teacher_id = uid
    )
    or exists (
      select 1
      from public.enrollments e
      join public.academic_courses ac on ac.id = e.academic_course_id
      where ac.course_slug = slug
        and e.student_id = uid
        and e.status = 'active'
    );
$$;

create or replace function public.is_course_slug_teacher(uid uuid, slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.has_role(uid, 'admin')
    or exists (
      select 1 from public.academic_courses ac
      where ac.course_slug = slug and ac.teacher_id = uid
    );
$$;

alter table public.disabled_lessons enable row level security;

-- SELECT: cualquiera con acceso al curso (estudiante matriculado activo,
-- docente dueño o admin). Un visitante no autenticado no lee nada: las rutas
-- de curso ya son privadas tras requireCourseAccess, y esto es defensa en
-- profundidad, no el control primario.
create policy "disabled_lessons_select_course_access" on public.disabled_lessons
  for select
  to authenticated
  using (public.has_course_slug_access(auth.uid(), course_slug));

-- INSERT / DELETE: solo docente dueño del course_slug o admin.
-- No hay política de UPDATE: el estado es binario y se modela como
-- presencia/ausencia de fila; "rehabilitar" es un DELETE, no un UPDATE.
-- Cambiar `reason` de una lección ya cerrada = delete + insert.
create policy "disabled_lessons_insert_teacher" on public.disabled_lessons
  for insert
  to authenticated
  with check (public.is_course_slug_teacher(auth.uid(), course_slug));

create policy "disabled_lessons_delete_teacher" on public.disabled_lessons
  for delete
  to authenticated
  using (public.is_course_slug_teacher(auth.uid(), course_slug));

-- service_role bypasa RLS: es la vía que usan las API routes de
-- /api/courses/lessons/* (autenticadas con x-api-key), igual que el resto
-- de rutas de servicio del proyecto.
