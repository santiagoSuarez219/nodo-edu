-- Reconstruye la tabla `assignment_questions` tal como existía en producción
-- antes de `20260718000002_init_assignment_variant_groups.sql`.
--
-- Contexto (DEBT-031): igual que `assignments` (ver 20260717000000), esta tabla
-- se creó fuera de git. `20260718000002` la declara con `create table if not
-- exists`, así que en producción esa sentencia nunca se ejecutó y el esquema
-- real conserva los nombres legacy:
--   * la constraint única se llama `assignment_questions_unique`, no
--     `unique_question_per_variant`;
--   * existe un índice legacy `assignment_questions_assignment_id_order_index_idx`
--     *además* del `assignment_questions_assignment_order` que crea 20260718000002
--     (producción tiene los dos, sobre las mismas columnas).
-- Sin esta migración, un `supabase db reset` producía un esquema parecido pero
-- no idéntico al real, con nombres de objeto distintos.
--
-- DDL extraído de `supabase db dump --linked --schema public` (2026-07-31).
-- Las columnas coinciden exactamente con las que declara 20260718000002.
--
-- Esta migración NO se aplica en producción (el objeto ya existe ahí): se marca
-- como aplicada con `supabase migration repair --status applied 20260717000001`.

create table if not exists assignment_questions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  question_id   uuid not null references questions(id) on delete restrict,
  order_index   smallint not null default 0,
  points        numeric(5,2) not null,
  constraint assignment_questions_points_check check (points > 0 and points <= 5),
  constraint assignment_questions_unique unique (assignment_id, question_id)
);

create index if not exists assignment_questions_assignment_id_order_index_idx
  on assignment_questions (assignment_id, order_index);

-- Políticas RLS heredadas del diseño original, cuando una fila de `assignments`
-- era la evaluación completa y no una variante. Conviven en producción con
-- `inherits_variant_select` / `teacher_manages_own_questions` de 20260718000003.
alter table assignment_questions enable row level security;

drop policy if exists "assignment_questions: select" on assignment_questions;
create policy "assignment_questions: select"
  on assignment_questions for select
  using (
    exists (
      select 1
      from assignments a
      join academic_courses ac on ac.id = a.academic_course_id
      where a.id = assignment_questions.assignment_id
        and (
          ac.teacher_id = auth.uid()
          or (
            a.is_published = true
            and exists (
              select 1 from enrollments e
              where e.academic_course_id = ac.id
                and e.student_id = auth.uid()
                and e.status = 'active'
            )
          )
          or public.has_role(auth.uid(), 'admin')
        )
    )
  );

drop policy if exists "assignment_questions: insert teacher or admin" on assignment_questions;
create policy "assignment_questions: insert teacher or admin"
  on assignment_questions for insert
  with check (
    exists (
      select 1
      from assignments a
      join academic_courses ac on ac.id = a.academic_course_id
      where a.id = assignment_questions.assignment_id
        and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

drop policy if exists "assignment_questions: update teacher or admin" on assignment_questions;
create policy "assignment_questions: update teacher or admin"
  on assignment_questions for update
  using (
    exists (
      select 1
      from assignments a
      join academic_courses ac on ac.id = a.academic_course_id
      where a.id = assignment_questions.assignment_id
        and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

drop policy if exists "assignment_questions: delete teacher or admin" on assignment_questions;
create policy "assignment_questions: delete teacher or admin"
  on assignment_questions for delete
  using (
    exists (
      select 1
      from assignments a
      join academic_courses ac on ac.id = a.academic_course_id
      where a.id = assignment_questions.assignment_id
        and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );
