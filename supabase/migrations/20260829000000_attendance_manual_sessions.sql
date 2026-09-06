-- spec-054: permite registrar sesiones de clase que nunca tuvieron código de
-- asistencia (sesiones "manuales", creadas por el docente desde la planilla
-- para clases pasadas que no se abrieron en la plataforma) y distingue quién
-- marcó cada registro.
--
-- Decisión D7: attendance_code y code_expires_at pasan a nullable.
-- NULL en ambas columnas significa "esta sesión nunca tuvo código" (nació
-- manual). Una sesión abierta con código real sigue teniendo ambas pobladas
-- (openSession las escribe siempre). Verificado contra los dos RPCs de
-- 20260716000002_attendance_rpcs.sql: los dos filtran primero por
-- is_open = true, y una sesión manual nace con is_open = false (D13), así que
-- es inalcanzable por mark_attendance_by_code y nunca se ofrece en
-- get_student_session_status, sin importar la nulabilidad.

alter table public.class_sessions
  alter column attendance_code drop not null,
  alter column code_expires_at drop not null;

comment on column public.class_sessions.attendance_code is
  'Código efímero de asistencia. NULL = sesión registrada manualmente por el docente, sin código (spec-054).';

comment on column public.class_sessions.code_expires_at is
  'Expiración del código de asistencia. NULL = sesión registrada manualmente por el docente, sin código (spec-054).';

-- Decisión D8: marked_by distingue el marcado del propio estudiante (con
-- código, vía el RPC security definer) del marcado hecho a mano por el
-- docente desde la planilla. NULL = el propio estudiante; un uuid = el
-- docente que lo marcó. No hay backfill: todos los registros existentes son
-- NULL por default, que es la clasificación correcta para ellos (todos
-- vinieron del RPC de código).

alter table public.attendance_records
  add column marked_by uuid references auth.users(id) on delete set null;

comment on column public.attendance_records.marked_by is
  'NULL = el propio estudiante marcó con el código de asistencia. uuid = el docente que marcó manualmente desde la planilla (spec-054).';
