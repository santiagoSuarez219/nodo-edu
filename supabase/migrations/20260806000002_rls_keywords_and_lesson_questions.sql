-- spec-042 — RLS de keywords, question_keywords y lesson_questions (ver D7).
--
-- Particularidad: la autoevaluación de cierre lee lesson_questions con la
-- sesión del propio estudiante (spec-011/D1), así que debe ser legible para
-- cualquiera que pueda ver la pregunta montada — si no, el join devuelve
-- vacío y la nota se cae a cero en silencio.
--
-- El cliente service_role de la API bypasa RLS: las funciones de servicio
-- replican en código la frontera de propiedad (created_by = actorId), igual
-- que en spec-005.

-- ─── keywords ────────────────────────────────────────────────────────────────
alter table public.keywords enable row level security;

-- El catálogo no es sensible: cualquier usuario autenticado puede leerlo
-- (lo necesita para no inventar keywords al asignar, ver D3).
create policy "keywords: select authenticated"
  on public.keywords for select
  to authenticated
  using (true);

create policy "keywords: insert teacher or admin"
  on public.keywords for insert
  with check (
    public.has_role(auth.uid(), 'teacher')
    or public.has_role(auth.uid(), 'admin')
  );

create policy "keywords: update teacher or admin"
  on public.keywords for update
  using (
    public.has_role(auth.uid(), 'teacher')
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    public.has_role(auth.uid(), 'teacher')
    or public.has_role(auth.uid(), 'admin')
  );

create policy "keywords: delete teacher or admin"
  on public.keywords for delete
  using (
    public.has_role(auth.uid(), 'teacher')
    or public.has_role(auth.uid(), 'admin')
  );

-- ─── question_keywords ───────────────────────────────────────────────────────
alter table public.question_keywords enable row level security;

-- Hereda visibilidad de la pregunta padre — espejo exacto de question_choices.
create policy "question_keywords: select"
  on public.question_keywords for select
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or q.is_published = true or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_keywords: insert own or admin"
  on public.question_keywords for insert
  with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "question_keywords: delete own or admin"
  on public.question_keywords for delete
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

-- ─── lesson_questions ────────────────────────────────────────────────────────
alter table public.lesson_questions enable row level security;

-- Autor de la pregunta, o pregunta publicada (== la puede ver un estudiante en
-- su autoevaluación), o admin — espejo de "questions: select own or published".
create policy "lesson_questions: select own or published"
  on public.lesson_questions for select
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or q.is_published = true or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "lesson_questions: insert own or admin"
  on public.lesson_questions for insert
  with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "lesson_questions: update own or admin"
  on public.lesson_questions for update
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  )
  with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "lesson_questions: delete own or admin"
  on public.lesson_questions for delete
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.created_by = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );
