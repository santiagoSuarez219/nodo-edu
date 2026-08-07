-- spec-042 — Catálogo de keywords con vocabulario controlado.
-- Sustituye a questions.tags (texto libre, sin catálogo): una keyword se crea
-- explícitamente antes de poder asignarse a una pregunta. Ver D2/D3 del spec.

-- ─── keywords ────────────────────────────────────────────────────────────────
create table public.keywords (
  slug         text        primary key,
  label        text        not null,
  description  text,
  -- Facetas cerradas (spec-042 D3): agregar una faceta nueva requiere
  -- migración, a propósito — mantiene el vocabulario legible y consultable.
  -- null = "sin clasificar" (estado de las keywords sembradas desde tags).
  kind         text
    check (kind is null or kind in ('tema', 'lenguaje', 'momento', 'ejercicio')),
  created_at   timestamptz not null default now()
);

create index on public.keywords (kind);

comment on table public.keywords is
  'spec-042: catálogo controlado de keywords para clasificar preguntas del banco.';

-- ─── question_keywords ───────────────────────────────────────────────────────
create table public.question_keywords (
  question_id  uuid not null references public.questions(id) on delete cascade,
  keyword_slug text not null references public.keywords(slug) on delete restrict,

  primary key (question_id, keyword_slug)
);

create index on public.question_keywords (keyword_slug);

comment on table public.question_keywords is
  'spec-042: relación pregunta↔keyword. keyword_slug con on delete restrict — '
  'una keyword en uso no se puede borrar del catálogo (ver D3, API 409).';
