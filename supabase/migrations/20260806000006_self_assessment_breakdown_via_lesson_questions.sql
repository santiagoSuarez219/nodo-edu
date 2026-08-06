-- spec-042 Punto 8 — self_assessment_breakdown resuelve el conteo vivo vía
-- lesson_questions en vez de questions.course_slug/lesson_slug (deprecadas,
-- ver 20260806000003). Firma y tipo de retorno IDÉNTICOS a
-- 20260802000004_self_assessment_grade_rpcs.sql:13-58 — apply_self_assessment_grade
-- y las dos RPC de recálculo la consumen por firma y no se tocan.
--
-- BLOQUE 039 preservado literalmente (ver DEBT-045 en docs/specs/backlog.md).
create or replace function public.self_assessment_breakdown(
  p_user_id     uuid,
  p_course_slug text
)
returns table (
  lesson_slug    text,
  question_count int,
  correct_count  int,
  answered       boolean
)
language sql
stable
set search_path = public
as $$
  select
    lp.lesson_slug,
    -- D6: congelado si ya respondió; vivo si no.
    coalesce(
      a.question_count,
      (select count(*)::int
         from lesson_questions lq
         join questions q on q.id = lq.question_id
        where lq.course_slug = lp.course_slug
          and lq.lesson_slug = lp.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as question_count,
    coalesce(a.correct_count, 0) as correct_count,
    (a.id is not null)           as answered
  from lesson_progress lp
  left join self_assessment_attempts a
    on  a.user_id     = lp.user_id
    and a.course_slug = lp.course_slug
    and a.lesson_slug = lp.lesson_slug
  where lp.user_id     = p_user_id
    and lp.course_slug = p_course_slug
    -- ▼▼▼ BLOQUE 039 — incluir SOLO si spec-039 ya está mergeado; ajustar
    --     el nombre real de la tabla/columna leyendo su migración.
    -- and not exists (
    --   select 1 from lesson_visibility lv
    --    where lv.course_slug = lp.course_slug
    --      and lv.lesson_slug = lp.lesson_slug
    --      and lv.is_disabled
    -- )
    -- ▲▲▲ BLOQUE 039
  ;
$$;
