-- spec-060: la nota de autoevaluaciones se calcula sobre las lecciones que el
-- docente marcó como vistas en clase en el grupo de la matrícula (taught_lessons),
-- no sobre las que el estudiante abrió (lesson_progress).
--
-- NO se toca self_assessment_breakdown(uuid, text): el código viejo la usa
-- durante la ventana entre `db push` y el deploy; se retira después (DEBT-097).

-- D2/D5: nueva firma por grupo, con el filtro de lecciones cerradas (spec-039).
-- security definer (desvío del boceto "invoker" del spec): el estudiante no
-- puede leer academic_courses por RLS, y sin esa fila no hay course_slug. Por
-- eso lleva una guarda propia: solo el propio estudiante, el docente dueño del
-- grupo, un admin, o una llamada sin JWT (service_role / otras funciones
-- definer) obtienen filas.
create or replace function public.self_assessment_breakdown(
  p_user_id            uuid,
  p_academic_course_id uuid
)
returns table (
  lesson_slug    text,
  question_count int,
  correct_count  int,
  answered       boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    tl.lesson_slug,
    -- spec-040 D6: congelado si ya respondió; vivo si no.
    coalesce(
      a.question_count,
      (select count(*)::int
         from lesson_questions lq
         join questions q on q.id = lq.question_id
        where lq.course_slug = ac.course_slug
          and lq.lesson_slug = tl.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as question_count,
    coalesce(a.correct_count, 0) as correct_count,
    (a.id is not null)           as answered
  from taught_lessons tl
  join academic_courses ac on ac.id = tl.academic_course_id
  left join self_assessment_attempts a
    on  a.user_id     = p_user_id
    and a.course_slug = ac.course_slug
    and a.lesson_slug = tl.lesson_slug
  where tl.academic_course_id = p_academic_course_id
    and ac.course_slug is not null
    and (
      auth.uid() is null
      or auth.uid() = p_user_id
      or ac.teacher_id = auth.uid()
      or public.has_role(auth.uid(), 'admin')
    )
    and not exists (
      select 1 from disabled_lessons d
       where d.course_slug = ac.course_slug
         and d.lesson_slug = tl.lesson_slug
    );
$$;

revoke all on function public.self_assessment_breakdown(uuid, uuid) from public, anon;
grant execute on function public.self_assessment_breakdown(uuid, uuid) to authenticated, service_role;


-- La firma vieja (uuid, uuid, text) queda reemplazada: es interna y solo la
-- llaman las RPC de recálculo, que se redefinen abajo.
drop function if exists public.apply_self_assessment_grade(uuid, uuid, text);

-- Escribe la nota de UNA matrícula contra el grupo de esa matrícula.
create or replace function public.apply_self_assessment_grade(
  p_user_id       uuid,
  p_enrollment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_academic_course_id uuid;
  v_questions int;
  v_correct   int;
  v_score     numeric;
  v_grade_item_id uuid;
begin
  select e.academic_course_id into v_academic_course_id
  from enrollments e
  where e.id = p_enrollment_id and e.student_id = p_user_id and e.status = 'active';

  if v_academic_course_id is null then
    return;
  end if;

  select coalesce(sum(b.question_count), 0), coalesce(sum(b.correct_count), 0)
    into v_questions, v_correct
  from public.self_assessment_breakdown(p_user_id, v_academic_course_id) b;

  select gi.id into v_grade_item_id
  from grade_items gi
  where gi.academic_course_id = v_academic_course_id
    and gi.kind = 'self_assessment';

  -- D4: sin nada evaluable la nota existente pasa a NULL (no queda rancia).
  -- Si el ítem no existe no se crea: no aparece una columna vacía.
  if v_questions = 0 then
    if v_grade_item_id is not null then
      update student_grades
         set score = null
       where enrollment_id = p_enrollment_id
         and grade_item_id = v_grade_item_id;
    end if;
    return;
  end if;

  v_score := round((v_correct::numeric / v_questions) * 5, 2);

  if v_grade_item_id is null then
    insert into grade_items (academic_course_id, name, order_index, kind)
    values (
      v_academic_course_id,
      'Autoevaluaciones',
      coalesce((select max(order_index) + 1 from grade_items
                 where academic_course_id = v_academic_course_id), 0),
      'self_assessment'
    )
    on conflict do nothing
    returning id into v_grade_item_id;

    if v_grade_item_id is null then
      select gi.id into v_grade_item_id
      from grade_items gi
      where gi.academic_course_id = v_academic_course_id
        and gi.kind = 'self_assessment';
    end if;
  end if;

  insert into student_grades (enrollment_id, grade_item_id, score)
  values (p_enrollment_id, v_grade_item_id, v_score)
  on conflict (enrollment_id, grade_item_id)
  do update set score = excluded.score;
end;
$$;


-- Camino del ESTUDIANTE: recalcula cada matrícula activa con ese course_slug,
-- cada una contra su grupo. Firma intacta.
create or replace function public.recalculate_self_assessment_grade(
  p_course_slug text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  r record;
begin
  if v_user_id is null then
    return;
  end if;

  for r in
    select e.id
    from enrollments e
    join academic_courses ac on ac.id = e.academic_course_id
    where e.student_id = v_user_id
      and e.status = 'active'
      and ac.course_slug = p_course_slug
  loop
    perform public.apply_self_assessment_grade(v_user_id, r.id);
  end loop;
end;
$$;


-- D8: recálculo del grupo sin autorización (service_role y RPC de marcado).
create or replace function public.recalculate_course_self_assessment_grades_internal(
  p_academic_course_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  r record;
begin
  for r in
    select e.id, e.student_id
    from enrollments e
    where e.academic_course_id = p_academic_course_id
      and e.status = 'active'
  loop
    perform public.apply_self_assessment_grade(r.student_id, r.id);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;


-- Camino del DOCENTE: recálculo masivo de un grupo. Firma intacta.
create or replace function public.recalculate_course_self_assessment_grades(
  p_academic_course_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from academic_courses ac
    where ac.id = p_academic_course_id
      and ac.course_slug is not null
      and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  ) then
    return 0;  -- sin permiso, o curso académico sin contenido asociado
  end if;

  return public.recalculate_course_self_assessment_grades_internal(p_academic_course_id);
end;
$$;


-- D8/D14: marcado/desmarcado en lote + UN recálculo del grupo, misma transacción.
-- p_actor es null para las escrituras de la API de servicio.
create or replace function public.set_lessons_taught_internal(
  p_academic_course_id uuid,
  p_lesson_slugs       text[],
  p_taught             boolean,
  p_actor              uuid
)
returns table (
  changed_slugs      text[],
  unchanged_slugs    text[],
  recalculated_count int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_changed   text[];
  v_unchanged text[];
  v_count     int := 0;
begin
  if not exists (select 1 from academic_courses where id = p_academic_course_id) then
    raise exception 'academic_course_not_found' using errcode = 'P0002';
  end if;

  if p_taught then
    with ins as (
      insert into taught_lessons (academic_course_id, lesson_slug, marked_by)
      select p_academic_course_id, s, p_actor from unnest(p_lesson_slugs) s
      on conflict do nothing
      returning lesson_slug
    )
    select coalesce(array_agg(u.s order by u.i), '{}') into v_changed
    from unnest(p_lesson_slugs) with ordinality u(s, i)
    where u.s in (select lesson_slug from ins);
  else
    with del as (
      delete from taught_lessons
       where academic_course_id = p_academic_course_id
         and lesson_slug = any(p_lesson_slugs)
      returning lesson_slug
    )
    select coalesce(array_agg(u.s order by u.i), '{}') into v_changed
    from unnest(p_lesson_slugs) with ordinality u(s, i)
    where u.s in (select lesson_slug from del);
  end if;

  select coalesce(array_agg(u.s order by u.i), '{}') into v_unchanged
  from unnest(p_lesson_slugs) with ordinality u(s, i)
  where u.s <> all(v_changed);

  if cardinality(v_changed) > 0 then
    v_count := public.recalculate_course_self_assessment_grades_internal(p_academic_course_id);
  end if;

  return query select v_changed, v_unchanged, v_count;
end;
$$;


-- Camino del DOCENTE: valida dueño/admin y delega.
create or replace function public.set_lessons_taught(
  p_academic_course_id uuid,
  p_lesson_slugs       text[],
  p_taught             boolean
)
returns table (
  changed_slugs      text[],
  unchanged_slugs    text[],
  recalculated_count int
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from academic_courses ac
    where ac.id = p_academic_course_id
      and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  ) then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  return query
    select * from public.set_lessons_taught_internal(
      p_academic_course_id, p_lesson_slugs, p_taught, auth.uid()
    );
end;
$$;


-- Permisos: lo que recibe un actor o se salta la autorización no se expone a
-- authenticated. Verificar con has_function_privilege tras aplicar (D8).
revoke all on function public.apply_self_assessment_grade(uuid, uuid) from public, anon, authenticated;
revoke all on function public.recalculate_course_self_assessment_grades_internal(uuid) from public, anon, authenticated;
revoke all on function public.set_lessons_taught_internal(uuid, text[], boolean, uuid) from public, anon, authenticated;
revoke all on function public.set_lessons_taught(uuid, text[], boolean) from public, anon;

grant execute on function public.recalculate_course_self_assessment_grades_internal(uuid) to service_role;
grant execute on function public.set_lessons_taught_internal(uuid, text[], boolean, uuid) to service_role;
grant execute on function public.set_lessons_taught(uuid, text[], boolean) to authenticated;
grant execute on function public.recalculate_self_assessment_grade(text) to authenticated;
grant execute on function public.recalculate_course_self_assessment_grades(uuid) to authenticated;
