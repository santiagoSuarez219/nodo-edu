-- EXCEPCIÓN ÚNICA Y DELIBERADA al carácter append-only de
-- self_assessment_attempts (20260718000000): spec-040 convierte la
-- autoevaluación en nota de curso, y una nota exige un intento único.
-- Las filas descartadas NO se borran: se archivan.
--
-- Fase 0 de spec-040 (2026-08-01): diagnóstico contra producción confirmó
-- 0 grupos duplicados existentes, así que esta migración no tiene efecto
-- retroactivo real hoy. Se implementa igual el criterio confirmado
-- ("más antiguo") como comportamiento correcto ante cualquier duplicado
-- que pueda existir en desarrollo o aparecer antes del deploy de este spec.

create table public.self_assessment_attempts_discarded (
  like public.self_assessment_attempts including defaults,
  discarded_at timestamptz not null default now(),
  discarded_reason text not null default 'spec-040 dedupe: kept earliest attempt'
);

alter table public.self_assessment_attempts_discarded enable row level security;
-- Sin políticas: tabla de auditoría, accesible solo con service_role.

with ranked as (
  select id,
         row_number() over (
           partition by user_id, course_slug, lesson_slug
           -- CRITERIO CONFIRMADO EN FASE 0. Alternativa evaluada y
           -- descartada: order by correct_count desc, submitted_at asc
           order by submitted_at asc, id asc
         ) as rn
  from public.self_assessment_attempts
)
insert into public.self_assessment_attempts_discarded
  (id, user_id, course_slug, lesson_slug, submitted_at,
   question_count, answered_count, correct_count)
select a.id, a.user_id, a.course_slug, a.lesson_slug, a.submitted_at,
       a.question_count, a.answered_count, a.correct_count
from public.self_assessment_attempts a
join ranked r on r.id = a.id
where r.rn > 1;

delete from public.self_assessment_attempts a
using public.self_assessment_attempts_discarded d
where d.id = a.id;

alter table public.self_assessment_attempts
  add constraint self_assessment_attempts_one_per_lesson
  unique (user_id, course_slug, lesson_slug);

-- El índice no-único de 20260718000000 sobre las mismas columnas queda
-- redundante frente al índice único que crea la constraint.
drop index if exists public.self_assessment_attempts_user_id_course_slug_lesson_slug_idx;
