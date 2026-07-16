-- Row Level Security para attendance
-- Decisión 4: ninguna insert policy de estudiante — solo RPC security definer
-- Decisión 6: visibilidad solo para estudiantes matriculados (reason = 'enrolled')

alter table public.class_sessions enable row level security;
alter table public.attendance_records enable row level security;

-- class_sessions: select solo para docente dueño o admin
create policy "class_sessions_select_owner_or_admin" on public.class_sessions
  for select
  using (
    exists (
      select 1
      from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

-- class_sessions: insert/update/delete solo para docente dueño o admin
create policy "class_sessions_mutate_owner_or_admin" on public.class_sessions
  for update
  using (
    exists (
      select 1
      from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

create policy "class_sessions_insert_owner_or_admin" on public.class_sessions
  for insert
  with check (
    exists (
      select 1
      from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

create policy "class_sessions_delete_owner_or_admin" on public.class_sessions
  for delete
  using (
    exists (
      select 1
      from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

-- attendance_records: select para propio, docente dueño o admin
create policy "attendance_records_select_own_or_teacher_or_admin" on public.attendance_records
  for select
  using (
    student_id = auth.uid()
    or exists (
      select 1
      from public.class_sessions cs
      join public.academic_courses ac on ac.id = cs.academic_course_id
      where cs.id = session_id
        and ac.teacher_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

-- attendance_records: delete solo para docente dueño o admin (correcciones manuales futuras)
create policy "attendance_records_delete_teacher_or_admin" on public.attendance_records
  for delete
  using (
    exists (
      select 1
      from public.class_sessions cs
      join public.academic_courses ac on ac.id = cs.academic_course_id
      where cs.id = session_id
        and ac.teacher_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

-- INTENCIONALMENTE: sin insert policy. Toda inserción de asistencia ocurre a través
-- del RPC security definer mark_attendance_by_code, que valida matrícula activa y
-- evita fraude sin confiar en la política de tabla. Esto reduce la superficie de ataque.
