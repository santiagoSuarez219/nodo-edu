-- The `assignments` table pre-existed spec-018's variant-group redesign
-- (see 20260718000002_init_assignment_variant_groups.sql: "table may already
-- exist from prior integration"). In the current model, a row in `assignments`
-- is a *variant* (A/B/C) of an `assignment_variant_groups` row: shared config
-- (academic_course_id, title, type, ...) lives on the group, not the variant.
--
-- The legacy schema still has NOT NULL columns without defaults
-- (academic_course_id, title, type) that createGroupWithVariants() never
-- populates when inserting a variant row, causing every atomic creation to
-- fail with "null value in column academic_course_id violates not-null
-- constraint". Relax them to nullable since they are superseded by the
-- group's columns for any row that has a variant_group_id.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'assignments' and column_name = 'academic_course_id' and is_nullable = 'NO'
  ) then
    alter table assignments alter column academic_course_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'assignments' and column_name = 'title' and is_nullable = 'NO'
  ) then
    alter table assignments alter column title drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_name = 'assignments' and column_name = 'type' and is_nullable = 'NO'
  ) then
    alter table assignments alter column type drop not null;
  end if;
end $$;
