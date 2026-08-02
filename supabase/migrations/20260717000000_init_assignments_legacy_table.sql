-- Reconstruye la tabla `assignments` tal como existía en producción antes de
-- `20260718000002_init_assignment_variant_groups.sql`.
--
-- Contexto (DEBT-031): `assignments` se creó fuera de git —probablemente a mano
-- en el SQL Editor de Supabase— por lo que ninguna migración la declaraba.
-- `20260718000002` ya la asume existente ("table may already exist from prior
-- integration") y solo le agrega columnas vía ALTER TABLE, así que reconstruir
-- el esquema desde cero con `supabase db reset` fallaba en ese punto.
--
-- El DDL de abajo se extrajo del esquema real de producción
-- (`supabase db dump --linked --schema public`, 2026-07-31), retirando todo lo
-- que aportan las migraciones posteriores para no duplicarlo:
--   * `20260718000002` agrega `variant_group_id`, `variant_label` (+ su CHECK)
--     y la constraint `unique_variant_label`.
--   * `20260718000004` quita el NOT NULL de `academic_course_id`, `title` y
--     `type` — por eso acá se crean NOT NULL, replicando el orden histórico real.
--   * `20260718000005` habilita RLS y crea la política `inherits_group_select`.
--
-- Esta migración NO se aplica en producción (el objeto ya existe ahí): se marca
-- como aplicada con `supabase migration repair --status applied 20260717000000`.
-- Su único efecto real es permitir reconstruir el esquema desde cero.

create table if not exists assignments (
  id                  uuid primary key default gen_random_uuid(),
  academic_course_id  uuid not null references academic_courses(id) on delete restrict,
  grade_item_id       uuid references grade_items(id) on delete set null,
  title               text not null,
  description         text,
  type                text not null,
  opens_at            timestamptz,
  closes_at           timestamptz,
  time_limit_minutes  smallint,
  shuffle_questions   boolean not null default false,
  shuffle_choices     boolean not null default false,
  show_feedback_on    text not null default 'submit',
  max_attempts        smallint not null default 1,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint assignments_type_check
    check (type = any (array['practice', 'quiz', 'exam', 'homework'])),
  constraint assignments_feedback_check
    check (show_feedback_on = any (array['submit', 'close', 'never'])),
  constraint assignments_max_attempts_check check (max_attempts >= 1),
  constraint assignments_time_limit_check
    check (time_limit_minutes is null or time_limit_minutes > 0)
);

create index if not exists assignments_academic_course_id_is_published_idx
  on assignments (academic_course_id, is_published);

-- `set_updated_at()` se define en 20260625000000_init_academic_courses.sql
create or replace trigger set_assignments_updated_at
  before update on assignments
  for each row execute function set_updated_at();

-- Políticas RLS heredadas del diseño original (una evaluación == una fila de
-- `assignments`, antes de que existieran los grupos de variantes). Conviven en
-- producción con `inherits_group_select` de 20260718000005; se reproducen acá
-- para que el esquema reconstruido sea idéntico al real.
alter table assignments enable row level security;

drop policy if exists "assignments: select" on assignments;
create policy "assignments: select"
  on assignments for select
  using (
    exists (
      select 1 from academic_courses ac
      where ac.id = assignments.academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or (
      is_published = true
      and exists (
        select 1 from enrollments e
        where e.academic_course_id = assignments.academic_course_id
          and e.student_id = auth.uid()
          and e.status = 'active'
      )
    )
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "assignments: insert teacher or admin" on assignments;
create policy "assignments: insert teacher or admin"
  on assignments for insert
  with check (
    exists (
      select 1 from academic_courses ac
      where ac.id = assignments.academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "assignments: update teacher or admin" on assignments;
create policy "assignments: update teacher or admin"
  on assignments for update
  using (
    exists (
      select 1 from academic_courses ac
      where ac.id = assignments.academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (
      select 1 from academic_courses ac
      where ac.id = assignments.academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "assignments: delete teacher or admin" on assignments;
create policy "assignments: delete teacher or admin"
  on assignments for delete
  using (
    exists (
      select 1 from academic_courses ac
      where ac.id = assignments.academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );
