-- spec-042 — Deprecar (sin eliminar) questions.course_slug/lesson_slug/tags.
--
-- D1: se dejan de escribir y de leer desde este spec en adelante, pero NO se
-- eliminan físicamente. Motivo: el backfill de la Fase 2 alimenta el
-- denominador de la nota de autoevaluación (spec-040); mientras existan estas
-- columnas, la consulta de paridad se puede volver a correr contra producción
-- si algo no cuadra. El DROP queda para un spec de seguimiento tras un ciclo
-- completo en producción (ver docs/specs/backlog.md).

comment on column public.questions.course_slug is
  'DEPRECADO spec-042: usar lesson_questions. No se escribe ni se lee desde la '
  'Fase 3 de spec-042 en adelante. Pendiente DROP en spec de seguimiento.';

comment on column public.questions.lesson_slug is
  'DEPRECADO spec-042: usar lesson_questions. No se escribe ni se lee desde la '
  'Fase 3 de spec-042 en adelante. Pendiente DROP en spec de seguimiento.';

comment on column public.questions.tags is
  'DEPRECADO spec-042: usar question_keywords + keywords (vocabulario '
  'controlado). No se escribe ni se lee desde la Fase 3 de spec-042 en '
  'adelante. Pendiente DROP en spec de seguimiento.';
