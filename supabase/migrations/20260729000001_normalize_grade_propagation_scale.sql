-- Fix found during spec-020 manual testing (TC-011, test-020-assignment-review.md):
-- student_grades.score requires the 0-5 scale used by the rest of the gradebook
-- (see 20260625000003_init_student_grades.sql), but assignment_questions.points
-- only caps the score PER question (<= 5) — the sum across a variant's questions
-- can easily exceed 5. propagate_submission_grade was inserting the raw
-- auto_score, silently violating the CHECK constraint and never propagating.
-- Normalize to a 0-5 scale using the variant's total possible points, same fix
-- applied to finalizeGrading's propagateFinalScoreToGradeItem in
-- lib/submissions/index.ts.
create or replace function public.propagate_submission_grade(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment_id uuid;
  v_variant_group_id uuid;
  v_assignment_id uuid;
  v_auto_score numeric;
  v_grade_item_id uuid;
  v_max_points numeric;
  v_normalized_score numeric;
begin
  select s.enrollment_id, s.variant_group_id, s.assignment_id, s.auto_score
    into v_enrollment_id, v_variant_group_id, v_assignment_id, v_auto_score
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

  select coalesce(sum(points), 0) into v_max_points
  from assignment_questions
  where assignment_id = v_assignment_id;

  if v_max_points <= 0 then
    return;
  end if;

  v_normalized_score := round((v_auto_score / v_max_points) * 5, 2);

  insert into student_grades (enrollment_id, grade_item_id, score)
  values (v_enrollment_id, v_grade_item_id, v_normalized_score)
  on conflict (enrollment_id, grade_item_id)
  do update set score = excluded.score;
end;
$$;
