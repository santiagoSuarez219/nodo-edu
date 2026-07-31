-- RLS was never provisioned for the `assignments` table itself (only for
-- assignment_variant_groups, assignment_questions and
-- assignment_variant_allocations in 20260718000003_rls_assignment_variants.sql).
-- `assignments` holds one row per variant (A/B/C) of a group; without RLS
-- enabled here, any authenticated session client could read variant metadata
-- (variant_label, description) of any group in any course, bypassing the
-- group's visibility cascade — the spec's RLS summary requires "assignments
-- inherits the parent group's visibility; write only by owning teacher/admin".
--
-- All session-client access to `assignments` in lib/assignments/index.ts is
-- read-only (writes to this table only happen via the service-role client in
-- lib/assignments/service.ts, which bypasses RLS entirely) — so only a
-- SELECT policy is needed, mirroring assignment_questions' existing
-- "inherits_variant_select" cascade pattern.

alter table assignments enable row level security;

drop policy if exists "inherits_group_select" on assignments;

create policy "inherits_group_select"
  on assignments for select
  using (
    exists (
      select 1 from assignment_variant_groups g
      where g.id = variant_group_id
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
