import { SupabaseClient } from "@supabase/supabase-js";

// spec-042 D3: facetas cerradas. Agregar una nueva requiere migración
// (check de supabase/migrations/20260806000000_init_keywords.sql) — a
// propósito, mantiene el vocabulario legible y consultable.
export type KeywordKind = "tema" | "lenguaje" | "momento" | "ejercicio";

export interface Keyword {
  slug: string;
  label: string;
  description: string | null;
  // null = "sin clasificar" — así entran las keywords sembradas desde
  // questions.tags en el backfill (ver D3), hasta que se curan a mano.
  kind: KeywordKind | null;
  created_at: string;
}

export interface KeywordContext {
  supabase: SupabaseClient;
  actorId: string;
}

export interface KeywordCreateInput {
  // Si no se envía, se deriva de `label` normalizando (minúsculas, sin
  // acentos, espacios → "-"). Si se envía, también se normaliza igual.
  slug?: string;
  label: string;
  description?: string;
  kind?: KeywordKind | null;
}

export interface KeywordUpdateInput {
  label?: string;
  description?: string | null;
  kind?: KeywordKind | null;
}

export interface ListKeywordsFilters {
  q?: string;
  kind?: KeywordKind;
  limit?: number;
  offset?: number;
}
