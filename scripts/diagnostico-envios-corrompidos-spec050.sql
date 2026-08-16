-- spec-050 (Fase 5) — Diagnóstico de envíos ya corrompidos por el bug que
-- este spec corrige: un fallo de lectura/escritura de Supabase durante
-- submitSubmission/finalizeGrading podía dejar un envío en status='graded'
-- con final_score/auto_score en 0 sin que ese 0 estuviera realmente
-- justificado por las respuestas del estudiante.
--
-- Solo LECTURA. No modifica ninguna nota (ver D6/D7 del spec).
--
-- Dos patrones de corrupción, sobre envíos graded con auto_score=0 o
-- final_score=0:
--
--   (A) Pregunta multiple_choice con respuesta seleccionada
--       (selected_choice_ids no vacío) pero is_correct IS NULL: el auto-grading
--       nunca corrió sobre esa respuesta, así que el 0 no refleja si acertó.
--
--   (B) Pregunta "abierta" (open_text/code_snippet/code_write/coding_challenge,
--       ver OPEN_QUESTION_TYPES en lib/submissions/index.ts) sin manual_score
--       y sin reviewed_at, en un envío que YA está en status='graded': el
--       envío se cerró sin que un docente la calificara manualmente.
--
-- Ejecutar primero contra desarrollo (mirp-lab). Contra producción solo con
-- confirmación explícita del usuario en la sesión (D7).

with flagged_answers as (
  select
    a.submission_id,
    a.id as answer_id,
    q.type as question_type,
    case
      when q.type = 'multiple_choice'
        and a.selected_choice_ids <> '{}'::uuid[]
        and a.is_correct is null
      then 'A_multiple_choice_sin_evaluar'
      when q.type <> 'multiple_choice'
        and a.manual_score is null
        and a.reviewed_at is null
      then 'B_abierta_sin_calificar'
      else null
    end as flag_reason
  from public.answers a
  join public.assignment_questions aq on aq.id = a.assignment_question_id
  join public.questions q on q.id = aq.question_id
)
select
  s.id as submission_id,
  s.status,
  s.auto_score,
  s.final_score,
  s.submitted_at,
  s.graded_at,
  ac.name as curso,
  ac.course_slug,
  asg.title as evaluacion,
  p.full_name as estudiante,
  p.id as student_id,
  count(*) filter (where fa.flag_reason = 'A_multiple_choice_sin_evaluar') as respuestas_mc_sin_evaluar,
  count(*) filter (where fa.flag_reason = 'B_abierta_sin_calificar') as respuestas_abiertas_sin_calificar
from public.submissions s
join flagged_answers fa on fa.submission_id = s.id and fa.flag_reason is not null
join public.enrollments e on e.id = s.enrollment_id
join public.profiles p on p.id = e.student_id
join public.assignments asg on asg.id = s.assignment_id
join public.academic_courses ac on ac.id = asg.academic_course_id
where s.status = 'graded'
  and (coalesce(s.auto_score, 0) = 0 or coalesce(s.final_score, 0) = 0)
group by s.id, ac.name, ac.course_slug, asg.title, p.full_name, p.id
order by s.graded_at desc;

-- Ventana del incidente de DEBT-059 (2026-08-13) — acotar manualmente si el
-- listado anterior es largo y se quiere aislar esa ventana específica:
--
-- ... and s.graded_at between '2026-08-13 00:00:00+00' and '2026-08-14 00:00:00+00'
