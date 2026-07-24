-- Row Level Security for submissions and answers (spec-019).
--
-- submissions: the student's attempt over their allocated variant. Select is
-- shared between the owning student and the teacher of the group's academic
-- course; insert is restricted to the student's own active enrollment AND to
-- the variant (assignment_id) that student was actually allocated in
-- assignment_variant_allocations — without this last condition a student
-- could open an attempt on a variant that was not theirs and read its
-- questions through the submission (see spec-019 "Políticas RLS").
--
-- answers: ownership cascades through the parent submission.

alter table submissions enable row level security;
alter table answers enable row level security;

create policy "student_sees_own_submissions"
  on submissions for select
  using (
    enrollment_id in (select id from enrollments where student_id = auth.uid())
    or exists (
      select 1 from assignment_variant_groups g
      where g.id = variant_group_id
      and (select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

create policy "student_inserts_own_submission_on_allocated_variant"
  on submissions for insert
  with check (
    enrollment_id in (
      select id from enrollments
      where student_id = auth.uid() and status = 'active'
    )
    and exists (
      select 1 from assignment_variant_allocations alloc
      where alloc.variant_group_id = submissions.variant_group_id
        and alloc.enrollment_id = submissions.enrollment_id
        and alloc.assignment_id = submissions.assignment_id
    )
  );

create policy "student_or_teacher_updates_submission"
  on submissions for update
  using (
    enrollment_id in (select id from enrollments where student_id = auth.uid())
    or exists (
      select 1 from assignment_variant_groups g
      where g.id = variant_group_id
      and (select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

create policy "owner_sees_own_answers"
  on answers for select
  using (
    exists (
      select 1 from submissions s
      where s.id = submission_id
      and (
        s.enrollment_id in (select id from enrollments where student_id = auth.uid())
        or exists (
          select 1 from assignment_variant_groups g
          where g.id = s.variant_group_id
          and (select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
        )
        or public.has_role(auth.uid(), 'admin')
      )
    )
  );

create policy "student_inserts_own_answer"
  on answers for insert
  with check (
    exists (
      select 1 from submissions s
      where s.id = submission_id
        and s.enrollment_id in (select id from enrollments where student_id = auth.uid())
    )
  );

create policy "student_or_teacher_updates_answer"
  on answers for update
  using (
    exists (
      select 1 from submissions s
      where s.id = submission_id
      and (
        s.enrollment_id in (select id from enrollments where student_id = auth.uid())
        or exists (
          select 1 from assignment_variant_groups g
          where g.id = s.variant_group_id
          and (select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
        )
        or public.has_role(auth.uid(), 'admin')
      )
    )
  );
