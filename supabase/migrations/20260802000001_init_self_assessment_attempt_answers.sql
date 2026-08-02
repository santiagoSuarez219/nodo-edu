-- spec-040 D3: la nota debe ser auditable y el intento es irrepetible, así que
-- la revisión por pregunta tiene que sobrevivir a la recarga (limitación
-- documentada en spec-033).
create table public.self_assessment_attempt_answers (
  attempt_id          uuid    not null
                              references public.self_assessment_attempts(id) on delete cascade,
  question_id         uuid    not null references public.questions(id) on delete cascade,
  selected_choice_ids uuid[]  not null default '{}',
  is_correct          boolean not null,

  primary key (attempt_id, question_id)
);

create index on public.self_assessment_attempt_answers (question_id);
