-- spec-054: autoriza al docente dueño (o admin) a marcar asistencia a mano
-- desde la planilla, y cierra la mitad de DEBT-046 sobre class_sessions.

-- Decisión D6: attendance_records nunca tuvo insert policy a propósito
-- ("INTENCIONALMENTE: sin insert policy" en 20260716000001_rls_attendance.sql):
-- toda inserción pasaba por el RPC security definer mark_attendance_by_code,
-- que valida matrícula activa y evita que el estudiante se autoinserte
-- asistencia sin código. Esa protección sigue intacta: un JWT de estudiante
-- sigue sin cumplir el predicado de esta policy (no es el docente dueño ni
-- admin) y sigue teniendo cero vías de insert fuera del RPC. Lo que se añade
-- es un actor distinto —el docente— con autoridad distinta, para el caso de
-- corrección manual que la propia migración original anticipaba
-- ("correcciones manuales futuras", ver la delete policy ya existente).
--
-- El with check exige, sobre la fila resultante: (a) el llamador es el
-- docente dueño del curso de la sesión, o admin; (b) el estudiante marcado
-- tiene matrícula activa en ese curso; (c) marked_by = auth.uid(), lo que
-- hace la procedencia no falsificable dentro de RLS (D8).
create policy "attendance_records_insert_teacher_or_admin" on public.attendance_records
  for insert
  with check (
    marked_by = auth.uid()
    and exists (
      select 1
      from public.class_sessions cs
      join public.academic_courses ac on ac.id = cs.academic_course_id
      where cs.id = session_id
        and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
    and exists (
      select 1
      from public.enrollments e
      join public.class_sessions cs on cs.academic_course_id = e.academic_course_id
      where cs.id = session_id
        and e.student_id = attendance_records.student_id
        and e.status = 'active'
    )
  );

-- INTENCIONALMENTE (actualizado, spec-054): sigue sin haber insert policy de
-- estudiante. El estudiante marca su propia asistencia únicamente a través
-- del RPC security definer mark_attendance_by_code, que valida matrícula
-- activa y código vigente sin confiar en la política de tabla. La única
-- insert policy de tabla que existe autoriza al docente dueño (o admin) a
-- marcar manualmente, con marked_by = auth.uid() como firma no falsificable
-- de que fue una corrección manual y no un marcado con código.

-- Decisión D12 — cierra la mitad de DEBT-046: class_sessions_mutate_owner_or_admin
-- era "for update" con solo `using`, sin `with check`, así que la fila
-- *resultante* de un update no se validaba: un docente podía reasignar una
-- sesión (con todos sus attendance_records) al curso de otro docente. Ese
-- argumento se sostenía mientras ninguna Server Action hiciera update sobre
-- class_sessions salvo para el código; este spec introduce la primera que
-- edita la fecha, así que se cierra aquí con el mismo predicado que el using.
-- La segunda mitad de DEBT-046 (auditar el resto de policies "for update" del
-- proyecto con el mismo criterio) queda abierta en el backlog.
alter policy "class_sessions_mutate_owner_or_admin" on public.class_sessions
  with check (
    exists (
      select 1
      from public.academic_courses ac
      where ac.id = academic_course_id
        and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );
