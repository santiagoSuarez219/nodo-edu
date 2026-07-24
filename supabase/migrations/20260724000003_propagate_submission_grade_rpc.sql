-- Security-definer RPC to close a second RLS gap found while implementing
-- spec-019: `student_grades` RLS only allows insert/update by the teacher who
-- owns the course ("student_grades: insert/update teacher or admin",
-- 20260625000004_rls_academic.sql). `submitSubmission`'s auto-close-to-graded
-- path (lib/submissions/index.ts) runs under the STUDENT's own session client
-- and needs to propagate the score to `student_grades` when the group has a
-- `grade_item_id` linked — that write was silently rejected by RLS (the
-- original code never checked the upsert's error), so the grade never
-- propagated for a fully auto-graded submission.
--
-- The score is read from `submissions.auto_score` (already computed and
-- persisted by submitSubmission BEFORE this call) rather than accepted as a
-- parameter — a client-supplied score would let a student call this RPC
-- directly via the Supabase REST API with an arbitrary value and overwrite
-- their own grade.
create or replace function public.propagate_submission_grade(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment_id uuid;
  v_variant_group_id uuid;
  v_auto_score numeric;
  v_grade_item_id uuid;
begin
  select s.enrollment_id, s.variant_group_id, s.auto_score
    into v_enrollment_id, v_variant_group_id, v_auto_score
  from submissions s
  where s.id = p_submission_id;

  if v_enrollment_id is null or v_auto_score is null then
    return;
  end if;

  if not exists (
    select 1 from enrollments e
    where e.id = v_enrollment_id and e.student_id = auth.uid()
  ) then
    return;
  end if;

  select g.grade_item_id into v_grade_item_id
  from assignment_variant_groups g
  where g.id = v_variant_group_id;

  if v_grade_item_id is null then
    return;
  end if;

  insert into student_grades (enrollment_id, grade_item_id, score)
  values (v_enrollment_id, v_grade_item_id, v_auto_score)
  on conflict (enrollment_id, grade_item_id)
  do update set score = excluded.score;
end;
$$;

grant execute on function public.propagate_submission_grade(uuid) to authenticated;
