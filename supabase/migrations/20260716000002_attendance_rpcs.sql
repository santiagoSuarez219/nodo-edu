-- RPCs security definer para asistencia
-- Decisión 2: validación de expiración server-side
-- Decisión 4: validación de matrícula activa sin abrir select general de tablas

create or replace function public.mark_attendance_by_code(p_code text)
returns table (status text, session_id uuid, marked_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_session_id uuid;
  v_course_id uuid;
  v_caller_id uuid;
  v_enrollment_status text;
  v_inserted_at timestamptz;
  v_marked_at timestamptz;
begin
  v_caller_id := auth.uid();

  -- 1. Buscar sesión abierta con este código
  select cs.id, cs.academic_course_id
  into v_session_id, v_course_id
  from class_sessions cs
  where cs.attendance_code = p_code
    and cs.is_open = true
  limit 1;

  if v_session_id is null then
    return query select 'not_found'::text, null::uuid, null::timestamptz;
    return;
  end if;

  -- 2. Validar expiración
  if (select code_expires_at from class_sessions where id = v_session_id) < now() then
    return query select 'expired'::text, v_session_id, null::timestamptz;
    return;
  end if;

  -- 3. Validar matrícula activa
  select e.status
  into v_enrollment_status
  from enrollments e
  where e.student_id = v_caller_id
    and e.academic_course_id = v_course_id
  limit 1;

  if v_enrollment_status is distinct from 'active' then
    return query select 'not_enrolled'::text, v_session_id, null::timestamptz;
    return;
  end if;

  -- 4. Insertar asistencia (idempotente: on conflict do nothing)
  -- v_inserted_at solo se puebla si el insert ocurrió de verdad (no hubo conflicto)
  insert into attendance_records (session_id, student_id)
  values (v_session_id, v_caller_id)
  on conflict (session_id, student_id) do nothing
  returning marked_at into v_inserted_at;

  if v_inserted_at is not null then
    -- 5a. Insert nuevo: ya tenemos el marked_at
    return query select 'marked'::text, v_session_id, v_inserted_at;
  else
    -- 5b. Ya existía: recuperar el marked_at original
    select marked_at into v_marked_at
    from attendance_records
    where session_id = v_session_id and student_id = v_caller_id;

    return query select 'already_marked'::text, v_session_id, v_marked_at;
  end if;
end;
$$;

grant execute on function public.mark_attendance_by_code(text) to authenticated;

-- Get student session status for a course (by slug)
-- Expone solo lo que el estudiante necesita ver, sin abrir select de class_sessions
create or replace function public.get_student_session_status(p_course_slug text)
returns table (session_open boolean, session_id uuid, already_marked boolean, marked_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_course_id uuid;
  v_session_id uuid;
  v_caller_id uuid;
begin
  v_caller_id := auth.uid();

  -- 1. Resolver course por slug
  select id into v_course_id
  from academic_courses
  where course_slug = p_course_slug
  limit 1;

  -- Si no existe curso, retornar estado vacío
  if v_course_id is null then
    return query select false, null::uuid, false, null::timestamptz;
    return;
  end if;

  -- 2. Verificar matrícula activa
  if not exists (
    select 1
    from enrollments e
    where e.student_id = v_caller_id
      and e.academic_course_id = v_course_id
      and e.status = 'active'
  ) then
    return query select false, null::uuid, false, null::timestamptz;
    return;
  end if;

  -- 3. Buscar sesión abierta y no expirada
  select cs.id
  into v_session_id
  from class_sessions cs
  where cs.academic_course_id = v_course_id
    and cs.is_open = true
    and cs.code_expires_at > now()
  order by cs.created_at desc
  limit 1;

  if v_session_id is null then
    -- No hay sesión abierta y vigente
    return query select false, null::uuid, false, null::timestamptz;
    return;
  end if;

  -- 4. Verificar si el estudiante ya marcó
  return query
  select
    true,
    v_session_id,
    exists (
      select 1
      from attendance_records ar
      where ar.session_id = v_session_id
        and ar.student_id = v_caller_id
    ),
    (
      select ar.marked_at
      from attendance_records ar
      where ar.session_id = v_session_id
        and ar.student_id = v_caller_id
      limit 1
    );
end;
$$;

grant execute on function public.get_student_session_status(text) to authenticated;
