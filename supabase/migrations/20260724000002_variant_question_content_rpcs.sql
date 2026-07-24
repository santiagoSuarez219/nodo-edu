-- Security-definer RPCs to close a gap found while implementing spec-019
-- (registered as follow-up to DEBT-007, docs/specs/backlog.md): `questions`
-- RLS ("select own or published", spec-005) only lets a student read a
-- question they did NOT author when it is globally `is_published = true`
-- (visible in the shared bank). `is_published` means "shared across
-- teachers" — it is NOT a requirement for a question to be used in an
-- assignment variant (lib/assignments/service.ts never enforces it). A
-- teacher's own draft question, used in a published assignment, would be
-- unreadable by the allocated student's session client: DEBT-007's fix
-- (joining `question:questions(...)`) returns a null-content row for those.
--
-- Both functions verify ownership the same way: the caller's enrollment must
-- hold an allocation for the given variant (assignment_id) in
-- assignment_variant_allocations — the same condition the submissions
-- insert policy already relies on.

-- get_variant_question_details: question content for rendering (player and
-- results view). `choices[].is_correct` is computed INSIDE this function from
-- the group's `show_feedback_on`/`closes_at` and the enrollment's latest
-- submission status — never from a caller-supplied flag, since this function
-- is reachable directly via the Supabase REST API with the student's own
-- session (not only through our Next.js server), and a client-supplied
-- "reveal" boolean would let a student always request it.
create or replace function public.get_variant_question_details(
  p_assignment_id uuid,
  p_enrollment_id uuid
)
returns table (
  assignment_question_id uuid,
  question_id uuid,
  order_index smallint,
  points numeric,
  type text,
  stem text,
  code_snippet text,
  code_language text,
  choices jsonb
)
language sql
security definer
set search_path = public
as $$
  with allowed as (
    select 1 from assignment_variant_allocations alloc
    where alloc.assignment_id = p_assignment_id
      and alloc.enrollment_id = p_enrollment_id
  ),
  group_cfg as (
    select g.show_feedback_on, g.closes_at
    from assignments a
    join assignment_variant_groups g on g.id = a.variant_group_id
    where a.id = p_assignment_id
  ),
  latest_submission as (
    select status
    from submissions
    where assignment_id = p_assignment_id
      and enrollment_id = p_enrollment_id
    order by attempt_number desc
    limit 1
  ),
  reveal as (
    select case
      when (select status from latest_submission) is null
        or (select status from latest_submission) = 'in_progress'
        then false
      when (select show_feedback_on from group_cfg) = 'never' then false
      when (select show_feedback_on from group_cfg) = 'submit' then true
      when (select show_feedback_on from group_cfg) = 'close' then
        (select closes_at from group_cfg) is not null
        and (select closes_at from group_cfg) <= now()
      else false
    end as should_reveal
  )
  select
    aq.id as assignment_question_id,
    q.id as question_id,
    aq.order_index,
    aq.points,
    q.type,
    q.stem,
    q.code_snippet,
    q.code_language,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'body', c.body,
            'order_index', c.order_index,
            'is_correct',
              case when (select should_reveal from reveal) then c.is_correct else null end
          ) order by c.order_index
        )
        from question_choices c
        where c.question_id = q.id
      ),
      '[]'::jsonb
    ) as choices
  from assignment_questions aq
  join questions q on q.id = aq.question_id
  where aq.assignment_id = p_assignment_id
    and exists (select 1 from allowed)
  order by aq.order_index;
$$;

grant execute on function public.get_variant_question_details(uuid, uuid) to authenticated;

-- get_variant_answer_key: correct choice ids per multiple_choice question,
-- with NO reveal gating — used exclusively by submitSubmission's internal
-- auto_score computation (lib/submissions/index.ts), never forwarded raw to
-- the client. Scoring must know correctness at submit time regardless of
-- show_feedback_on (that setting only governs what the STUDENT sees).
create or replace function public.get_variant_answer_key(
  p_assignment_id uuid,
  p_enrollment_id uuid
)
returns table (
  question_id uuid,
  correct_choice_ids uuid[]
)
language sql
security definer
set search_path = public
as $$
  select
    q.id as question_id,
    coalesce(
      array_agg(c.id) filter (where c.is_correct),
      '{}'::uuid[]
    ) as correct_choice_ids
  from assignment_questions aq
  join questions q on q.id = aq.question_id
  left join question_choices c on c.question_id = q.id
  where aq.assignment_id = p_assignment_id
    and q.type = 'multiple_choice'
    and exists (
      select 1 from assignment_variant_allocations alloc
      where alloc.assignment_id = p_assignment_id
        and alloc.enrollment_id = p_enrollment_id
    )
  group by q.id;
$$;

grant execute on function public.get_variant_answer_key(uuid, uuid) to authenticated;
