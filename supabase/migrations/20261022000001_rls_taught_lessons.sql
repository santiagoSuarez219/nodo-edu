-- spec-060 D1: lectura para docente dueño, admin y estudiante con matrícula
-- activa en el grupo. Sin políticas de insert/update/delete: se escribe solo
-- por las RPC security definer (set_lessons_taught*), para que la marca y el
-- recálculo del grupo ocurran en la misma transacción.

create or replace function public.can_read_taught_lessons(uid uuid, p_academic_course_id uuid)
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
      where ac.id = p_academic_course_id and ac.teacher_id = uid
    )
    or exists (
      select 1 from public.enrollments e
      where e.academic_course_id = p_academic_course_id
        and e.student_id = uid
        and e.status = 'active'
    );
$$;

alter table public.taught_lessons enable row level security;

create policy "taught_lessons_select_group_access" on public.taught_lessons
  for select
  to authenticated
  using (public.can_read_taught_lessons(auth.uid(), academic_course_id));

grant select on public.taught_lessons to authenticated;
grant all on public.taught_lessons to service_role;
