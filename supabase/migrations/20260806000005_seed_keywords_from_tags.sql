-- spec-042 — Siembra el catálogo de keywords desde questions.tags.
--
-- D2/D3: los tags existentes se vuelcan al catálogo con kind = null ("sin
-- clasificar" — se curan después con PATCH /api/keywords/{slug}). D5: idempotente
-- (`on conflict do nothing`), reejecutable.
--
-- La normalización de slug DEBE coincidir literalmente con la de las consultas
-- de verificación de docs/testing/test-042-banco-preguntas-keywords.md — de lo
-- contrario la Verificación 2 (keywords faltantes) da falsos positivos.
-- Sin extensión unaccent (no habilitada en este proyecto): se traducen a mano
-- las vocales acentuadas y la ñ más comunes en el vocabulario existente.
with tag_slug as (
  select distinct
    trim(both '-' from
      regexp_replace(
        translate(lower(trim(t.tag)), 'áéíóúüñ', 'aeiouun'),
        '[^a-z0-9]+', '-', 'g'
      )
    ) as slug,
    -- Se conserva como label la primera forma original vista para ese slug,
    -- por orden alfabético — determinista y reproducible entre reejecuciones.
    min(trim(t.tag)) as label
  from public.questions q
  cross join lateral unnest(q.tags) as t(tag)
  where trim(t.tag) <> ''
  group by 1
)
insert into public.keywords (slug, label, kind)
select ts.slug, ts.label, null
from tag_slug ts
where ts.slug <> ''
on conflict (slug) do nothing;

-- Relaciona cada pregunta con las keywords derivadas de sus tags.
insert into public.question_keywords (question_id, keyword_slug)
select distinct
  q.id,
  trim(both '-' from
    regexp_replace(
      translate(lower(trim(t.tag)), 'áéíóúüñ', 'aeiouun'),
      '[^a-z0-9]+', '-', 'g'
    )
  ) as keyword_slug
from public.questions q
cross join lateral unnest(q.tags) as t(tag)
where trim(t.tag) <> ''
  and trim(both '-' from
        regexp_replace(
          translate(lower(trim(t.tag)), 'áéíóúüñ', 'aeiouun'),
          '[^a-z0-9]+', '-', 'g'
        )
      ) <> ''
on conflict (question_id, keyword_slug) do nothing;
