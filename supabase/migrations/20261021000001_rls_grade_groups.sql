alter table public.grade_groups enable row level security;

-- Espejo de "grade_items: select" (20260625000004_rls_academic.sql:93).
create policy "grade_groups: select"
  on public.grade_groups for select
  using (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or exists (select 1 from public.enrollments e
               where e.academic_course_id = grade_groups.academic_course_id
                 and e.student_id = auth.uid()
                 and e.status = 'active')
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_groups: insert teacher or admin"
  on public.grade_groups for insert
  with check (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_groups: update teacher or admin"
  on public.grade_groups for update
  using (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_groups: delete teacher or admin"
  on public.grade_groups for delete
  using (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );
