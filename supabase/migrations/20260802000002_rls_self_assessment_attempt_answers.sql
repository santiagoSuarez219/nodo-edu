alter table public.self_assessment_attempt_answers enable row level security;

-- select: dueño del intento, docente del curso o admin.
create policy "sa_attempt_answers: select"
  on public.self_assessment_attempt_answers for select
  using (
    exists (
      select 1 from public.self_assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.self_assessment_attempts a
      join public.academic_courses ac on ac.course_slug = a.course_slug
      where a.id = attempt_id and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- insert: solo sobre un intento propio.
create policy "sa_attempt_answers: insert own"
  on public.self_assessment_attempt_answers for insert
  with check (
    exists (
      select 1 from public.self_assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

-- Sin update ni delete: la revisión de un intento único es inmutable.
