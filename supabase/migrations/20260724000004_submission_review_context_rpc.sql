-- Security-definer RPC to close an RLS gap found while designing spec-020
-- (assignment review): `questions` RLS ("select own or published",
-- 20260715000001_rls_questions.sql) only lets a teacher read a question they
-- did NOT author when it is globally `is_published = true`. Nothing enforces
-- that a question used in an `assignment_questions` row must be published
-- (lib/assignments/service.ts never checks it) — so a teacher reviewing a
-- submission would get null content for a colleague's draft question when
-- joining `questions`/`question_choices`/`question_rubrics` directly under
-- their own session client. Same class of gap as DEBT-007
-- (20260724000002_variant_question_content_rpcs.sql), but for the teacher
-- review path instead of the student player path.
--
-- Authorization: the caller must be the teacher who owns the academic course
-- of the submission's evaluation (assignment_variant_groups -> academic_courses
-- .teacher_id), or an admin. No allocation check is needed here (unlike the
-- student-facing RPCs) since the caller is not the student.
create or replace function public.get_submission_review_context(p_submission_id uuid)
returns table (
  assignment_question_id uuid,
  question_id uuid,
  order_index smallint,
  type text,
  stem text,
  code_snippet text,
  code_language text,
  points numeric,
  choices jsonb,
  rubric jsonb
)
language sql
security definer
set search_path = public
as $$
  with sub as (
    select s.assignment_id, s.variant_group_id
    from submissions s
    where s.id = p_submission_id
  ),
  authorized as (
    select 1
    from sub
    join assignment_variant_groups g on g.id = sub.variant_group_id
    join academic_courses ac on ac.id = g.academic_course_id
    where ac.teacher_id = auth.uid()
       or public.has_role(auth.uid(), 'admin')
  )
  select
    aq.id as assignment_question_id,
    q.id as question_id,
    aq.order_index,
    q.type,
    q.stem,
    q.code_snippet,
    q.code_language,
    aq.points,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('id', c.id, 'body', c.body, 'is_correct', c.is_correct)
          order by c.order_index
        )
        from question_choices c
        where c.question_id = q.id
      ),
      '[]'::jsonb
    ) as choices,
    (
      select jsonb_build_object('criteria', r.criteria, 'max_score', r.max_score)
      from question_rubrics r
      where r.question_id = q.id
    ) as rubric
  from sub
  join assignment_questions aq on aq.assignment_id = sub.assignment_id
  join questions q on q.id = aq.question_id
  where exists (select 1 from authorized)
  order by aq.order_index;
$$;

grant execute on function public.get_submission_review_context(uuid) to authenticated;
