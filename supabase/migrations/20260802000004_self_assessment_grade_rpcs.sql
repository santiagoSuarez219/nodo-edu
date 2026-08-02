-- Cálculo canónico. Devuelve una fila por lección habilitada y vista.
-- SIN security definer: es la pieza pura de cálculo, la invocan las funciones
-- de abajo, que sí son las que escriben en la libreta.
--
-- BLOQUE 039 (spec-039, estado habilitado/deshabilitado de lecciones) no
-- está mergeado a development todavía cuando se implementa esta migración
-- (ver DEBT-043 en docs/specs/backlog.md): el filtro queda comentado a
-- propósito. Referenciar aquí una tabla que no existe rompería en tiempo de
-- ejecución (no de creación) y tumbaría el envío de autoevaluaciones en
-- producción. Cuando spec-039 esté mergeado, se agrega el filtro con un
-- `create or replace function` de una línea + un recálculo masivo por curso
-- (ya provisto por la Fase 5 de este spec).
create or replace function public.self_assessment_breakdown(
  p_user_id     uuid,
  p_course_slug text
)
returns table (
  lesson_slug    text,
  question_count int,
  correct_count  int,
  answered       boolean
)
language sql
stable
set search_path = public
as $$
  select
    lp.lesson_slug,
    -- D6: congelado si ya respondió; vivo si no.
    coalesce(
      a.question_count,
      (select count(*)::int
         from questions q
        where q.course_slug = lp.course_slug
          and q.lesson_slug = lp.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as question_count,
    coalesce(a.correct_count, 0) as correct_count,
    (a.id is not null)           as answered
  from lesson_progress lp
  left join self_assessment_attempts a
    on  a.user_id     = lp.user_id
    and a.course_slug = lp.course_slug
    and a.lesson_slug = lp.lesson_slug
  where lp.user_id     = p_user_id
    and lp.course_slug = p_course_slug
    -- ▼▼▼ BLOQUE 039 — incluir SOLO si spec-039 ya está mergeado; ajustar
    --     el nombre real de la tabla/columna leyendo su migración.
    -- and not exists (
    --   select 1 from lesson_visibility lv
    --    where lv.course_slug = lp.course_slug
    --      and lv.lesson_slug = lp.lesson_slug
    --      and lv.is_disabled
    -- )
    -- ▲▲▲ BLOQUE 039
  ;
$$;


-- Escribe la nota de UNA matrícula. Interna: la llaman las dos RPC públicas.
create or replace function public.apply_self_assessment_grade(
  p_user_id       uuid,
  p_enrollment_id uuid,
  p_course_slug   text
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
  from public.self_assessment_breakdown(p_user_id, p_course_slug) b;

  -- D4: sin nada evaluable la nota es NULL, no 0 (un 0 se lee como reprobado).
  if v_questions = 0 then
    v_score := null;
  else
    v_score := round((v_correct::numeric / v_questions) * 5, 2);
  end if;

  -- Creación perezosa: no existe columna en la libreta hasta la primera
  -- propagación real.
  if v_score is null then
    return;
  end if;

  select gi.id into v_grade_item_id
  from grade_items gi
  where gi.academic_course_id = v_academic_course_id
    and gi.kind = 'self_assessment';

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


-- Camino del ESTUDIANTE. No recibe user_id: lo toma de auth.uid(), para que no
-- sea posible escribir la nota de otro invocando el RPC por la API REST.
-- Recalcula desde las tablas; no acepta el puntaje como parámetro (mismo
-- criterio que propagate_submission_grade, 20260729000001).
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

  -- Un estudiante puede tener varias matrículas activas con el mismo
  -- course_slug (distintos grupos); se escriben todas. Un .maybeSingle()
  -- aquí reproduciría el PGRST116 ya corregido en lib/enrollments/access.ts.
  for r in
    select e.id
    from enrollments e
    join academic_courses ac on ac.id = e.academic_course_id
    where e.student_id = v_user_id
      and e.status = 'active'
      and ac.course_slug = p_course_slug
  loop
    perform public.apply_self_assessment_grade(v_user_id, r.id, p_course_slug);
  end loop;
end;
$$;


-- Camino del DOCENTE: recálculo masivo de un curso académico.
create or replace function public.recalculate_course_self_assessment_grades(
  p_academic_course_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_slug text;
  v_count int := 0;
  r record;
begin
  select ac.course_slug into v_course_slug
  from academic_courses ac
  where ac.id = p_academic_course_id
    and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

  if v_course_slug is null then
    return 0;  -- sin permiso, o curso académico sin contenido asociado
  end if;

  for r in
    select e.id, e.student_id
    from enrollments e
    where e.academic_course_id = p_academic_course_id
      and e.status = 'active'
  loop
    perform public.apply_self_assessment_grade(r.student_id, r.id, v_course_slug);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.apply_self_assessment_grade(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.recalculate_self_assessment_grade(text) to authenticated;
grant execute on function public.recalculate_course_self_assessment_grades(uuid) to authenticated;
