-- Row Level Security for assignment variant tables

-- Enable RLS on assignment tables if not already enabled
alter table assignment_variant_groups enable row level security;
alter table assignment_questions enable row level security;
alter table assignment_variant_allocations enable row level security;

-- Drop old conflicting policies if they exist, then create new ones
drop policy if exists "teacher_sees_own_course_groups" on assignment_variant_groups;
drop policy if exists "student_sees_published_groups" on assignment_variant_groups;
drop policy if exists "teacher_manages_own_course_groups" on assignment_variant_groups;
drop policy if exists "inherits_variant_select" on assignment_questions;
drop policy if exists "teacher_manages_own_questions" on assignment_questions;
drop policy if exists "student_sees_own_allocation" on assignment_variant_allocations;
drop policy if exists "student_allocates_self" on assignment_variant_allocations;
drop policy if exists "disable_update_allocations" on assignment_variant_allocations;
drop policy if exists "disable_delete_allocations" on assignment_variant_allocations;

-- assignment_variant_groups policies
create policy "teacher_sees_own_course_groups"
  on assignment_variant_groups for select
  using (
    (select teacher_id from academic_courses where id = academic_course_id) = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

create policy "student_sees_published_groups"
  on assignment_variant_groups for select
  using (
    is_published
    and (
      select status from enrollments
      where student_id = auth.uid() and academic_course_id = assignment_variant_groups.academic_course_id
      limit 1
    ) = 'active'
    or public.has_role(auth.uid(), 'admin')
  );

create policy "teacher_inserts_own_course_groups"
  on assignment_variant_groups for insert
  with check (
    (select teacher_id from academic_courses where id = academic_course_id) = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

create policy "teacher_updates_own_course_groups"
  on assignment_variant_groups for update
  using (
    (select teacher_id from academic_courses where id = academic_course_id) = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

create policy "teacher_deletes_own_course_groups"
  on assignment_variant_groups for delete
  using (
    (select teacher_id from academic_courses where id = academic_course_id) = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- assignment_questions policies
create policy "inherits_variant_select"
  on assignment_questions for select
  using (
    exists (
      select 1 from assignments a
      join assignment_variant_groups g on g.id = a.variant_group_id
      where a.id = assignment_id
      and (
        (select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
        or (g.is_published and exists (
          select 1 from enrollments
          where student_id = auth.uid()
            and academic_course_id = g.academic_course_id
            and status = 'active'
        ))
        or public.has_role(auth.uid(), 'admin')
      )
    )
  );

create policy "teacher_inserts_own_questions"
  on assignment_questions for insert
  with check (
    exists (
      select 1 from assignments a
      join assignment_variant_groups g on g.id = a.variant_group_id
      where a.id = assignment_id
      and ((select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
        or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "teacher_updates_own_questions"
  on assignment_questions for update
  using (
    exists (
      select 1 from assignments a
      join assignment_variant_groups g on g.id = a.variant_group_id
      where a.id = assignment_id
      and ((select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
        or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "teacher_deletes_own_questions"
  on assignment_questions for delete
  using (
    exists (
      select 1 from assignments a
      join assignment_variant_groups g on g.id = a.variant_group_id
      where a.id = assignment_id
      and ((select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
        or public.has_role(auth.uid(), 'admin'))
    )
  );

-- assignment_variant_allocations policies
create policy "student_sees_own_allocation"
  on assignment_variant_allocations for select
  using (
    enrollment_id in (select id from enrollments where student_id = auth.uid())
    or exists (
      select 1 from assignment_variant_groups g
      where g.id = variant_group_id
      and (select teacher_id from academic_courses where id = g.academic_course_id) = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

create policy "student_allocates_self"
  on assignment_variant_allocations for insert
  with check (
    enrollment_id in (
      select id from enrollments
      where student_id = auth.uid() and status = 'active'
    )
    and exists (
      select 1 from assignment_variant_groups g
      where g.id = variant_group_id
        and g.is_published
        and (g.opens_at is null or g.opens_at <= now())
        and (g.closes_at is null or g.closes_at > now())
    )
    and exists (
      select 1 from assignments a
      where a.id = assignment_id
        and a.variant_group_id = variant_group_id
    )
  );

create policy "disable_update_allocations"
  on assignment_variant_allocations for update
  using (false);

create policy "disable_delete_allocations"
  on assignment_variant_allocations for delete
  using (false);
