-- ─── questions ───────────────────────────────────────────────────────────────
alter table public.questions enable row level security;

-- Docente: ve sus propias preguntas + las publicadas de todos los docentes.
-- Estudiantes no tienen acceso directo; reciben preguntas solo via Server Actions.
create policy "questions: select own or published"
  on public.questions for select
  using (
    created_by = auth.uid()
    or is_published = true
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo teacher o admin pueden crear preguntas; created_by debe ser el propio usuario
create policy "questions: insert teacher or admin"
  on public.questions for insert
  with check (
    created_by = auth.uid()
    and (
      public.has_role(auth.uid(), 'teacher')
      or public.has_role(auth.uid(), 'admin')
    )
  );

-- Solo el autor o admin pueden editar
create policy "questions: update own or admin"
  on public.questions for update
  using (
    created_by = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    created_by = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- Solo el autor o admin pueden borrar
create policy "questions: delete own or admin"
  on public.questions for delete
  using (
    created_by = auth.uid()
    or public.has_role(auth.uid(), 'admin')
  );

-- ─── question_choices ────────────────────────────────────────────────────────
alter table public.question_choices enable row level security;

-- Hereda visibilidad de la pregunta padre
create policy "question_choices: select"
  on public.question_choices for select
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or q.is_published = true or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_choices: insert teacher or admin"
  on public.question_choices for insert
  with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_choices: update own or admin"
  on public.question_choices for update
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_choices: delete own or admin"
  on public.question_choices for delete
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

-- ─── question_rubrics ────────────────────────────────────────────────────────
alter table public.question_rubrics enable row level security;

create policy "question_rubrics: select"
  on public.question_rubrics for select
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or q.is_published = true or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_rubrics: insert teacher or admin"
  on public.question_rubrics for insert
  with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_rubrics: update own or admin"
  on public.question_rubrics for update
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_rubrics: delete own or admin"
  on public.question_rubrics for delete
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

-- ─── coding_challenge_tests ──────────────────────────────────────────────────
alter table public.coding_challenge_tests enable row level security;

-- Los tests ocultos nunca son visibles para estudiantes (solo el autor y admin)
create policy "coding_challenge_tests: select"
  on public.coding_challenge_tests for select
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "coding_challenge_tests: insert teacher or admin"
  on public.coding_challenge_tests for insert
  with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "coding_challenge_tests: update own or admin"
  on public.coding_challenge_tests for update
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "coding_challenge_tests: delete own or admin"
  on public.coding_challenge_tests for delete
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );
