-- spec-058 (D9) — reserva atómica de una ejecución de código.
--
-- Contar, comprobar el intervalo e insertar desde la aplicación no es atómico:
-- N llamadas simultáneas a la Server Action leían todas `count < límite` y todas
-- pasaban. Esta función lo hace en una sola transacción, serializada por intento
-- con un advisory lock, de modo que el límite no se salta en paralelo.
--
-- Solo la invoca service_role desde lib/code-runner; el gate de pertenencia del
-- intento ya se verificó antes en la aplicación.

create or replace function public.claim_code_run(
  p_submission_id uuid,
  p_question_id   uuid,
  p_language      text,
  p_cases_count   smallint,
  p_max_runs      integer,
  p_min_interval_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count   integer;
  v_last    timestamptz;
  v_elapsed numeric;
  v_run_id  uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_submission_id::text, 0));

  select count(*) into v_count
    from public.code_runs
   where submission_id = p_submission_id
     and question_id = p_question_id;

  if v_count >= p_max_runs then
    return jsonb_build_object('status', 'limit', 'count', v_count);
  end if;

  select max(created_at) into v_last
    from public.code_runs
   where submission_id = p_submission_id;

  if v_last is not null then
    v_elapsed := extract(epoch from (now() - v_last));
    if v_elapsed < p_min_interval_seconds then
      return jsonb_build_object(
        'status', 'interval',
        'count', v_count,
        'retry_after', ceil(p_min_interval_seconds - v_elapsed)
      );
    end if;
  end if;

  insert into public.code_runs (submission_id, question_id, language, cases_count)
  values (p_submission_id, p_question_id, p_language, p_cases_count)
  returning id into v_run_id;

  return jsonb_build_object('status', 'ok', 'count', v_count + 1, 'run_id', v_run_id);
end;
$$;

revoke all on function public.claim_code_run(uuid, uuid, text, smallint, integer, integer)
  from public, anon, authenticated;
grant execute on function public.claim_code_run(uuid, uuid, text, smallint, integer, integer)
  to service_role;
