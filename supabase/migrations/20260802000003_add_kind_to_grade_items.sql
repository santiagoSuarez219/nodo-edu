alter table public.grade_items
  add column kind text not null default 'manual'
  check (kind in ('manual', 'self_assessment'));

-- spec-040 D5: como máximo un ítem de autoevaluaciones por curso académico.
-- Índice parcial (no constraint) para no restringir los ítems manuales.
create unique index grade_items_one_self_assessment_per_course
  on public.grade_items (academic_course_id)
  where kind = 'self_assessment';
