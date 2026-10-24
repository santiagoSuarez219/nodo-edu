-- spec-063: duración fija de cada sesión de clase, en horas, para convertir
-- las inasistencias a horas en el resumen mensual. El default puebla los
-- cursos existentes (sin backfill aparte).
alter table academic_courses
  add column hours_per_session numeric(4,2) not null default 2;

alter table academic_courses
  add constraint academic_courses_hours_per_session_range
  check (hours_per_session > 0 and hours_per_session <= 12);

comment on column academic_courses.hours_per_session is
  'Horas que dura cada sesión de clase (spec-063). Cambiarlo recalcula retroactivamente el resumen mensual de inasistencias.';
