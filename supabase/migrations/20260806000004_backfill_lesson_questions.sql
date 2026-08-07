-- spec-042 — Backfill de lesson_questions desde questions.course_slug/lesson_slug.
--
-- Idempotente: `on conflict do nothing` sobre la PK compuesta. Reejecutar esta
-- migración (o correrla dos veces a mano) no duplica filas ni cambia
-- order_index de lo ya montado.
--
-- D4: el order_index reproduce EXACTAMENTE el orden actual de lectura de la
-- autoevaluación (`.order('created_at', { ascending: true })` en
-- lib/self-assessment/index.ts, líneas 69/140/383), vía row_number() con el
-- mismo desempate (created_at, luego id). Nadie percibe un cambio de orden el
-- día del despliegue.
insert into public.lesson_questions (course_slug, lesson_slug, question_id, order_index)
select
  q.course_slug,
  q.lesson_slug,
  q.id,
  row_number() over (
    partition by q.course_slug, q.lesson_slug
    order by q.created_at, q.id
  ) - 1 as order_index
from public.questions q
where q.course_slug is not null
  and q.lesson_slug is not null
on conflict (course_slug, lesson_slug, question_id) do nothing;
