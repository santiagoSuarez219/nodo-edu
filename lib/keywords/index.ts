import type {
  Keyword,
  KeywordContext,
  KeywordCreateInput,
  KeywordUpdateInput,
  ListKeywordsFilters,
} from "./types";

// Deriva un slug kebab-case desde texto libre. No necesita coincidir con la
// normalización SQL del backfill (supabase/migrations/20260806000005_seed_keywords_from_tags.sql):
// esa migración corrió una única vez sobre los tags heredados; esta función
// rige las keywords creadas desde ahora en adelante vía API/MCP, con
// normalización Unicode más robusta (NFD) que la tabla de traducción manual
// usada en SQL.
export function slugifyKeyword(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos (acentos, diéresis)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function _listKeywordsForActor(
  context: KeywordContext,
  filters?: ListKeywordsFilters
): Promise<Keyword[]> {
  const { supabase } = context;

  let query = supabase.from("keywords").select("*");

  if (filters?.q) {
    query = query.ilike("label", `%${filters.q}%`);
  }
  if (filters?.kind) {
    query = query.eq("kind", filters.kind);
  }

  query = query.order("slug", { ascending: true });

  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []) as Keyword[];
}

async function _getKeywordBySlugForActor(
  context: KeywordContext,
  slug: string
): Promise<Keyword | null> {
  const { supabase } = context;

  const { data, error } = await supabase
    .from("keywords")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Keyword | null) ?? null;
}

async function _createKeywordForActor(
  context: KeywordContext,
  input: KeywordCreateInput
): Promise<{ ok: true; keyword: Keyword } | { ok: false; error: string; code: "conflict" | "error" }> {
  const { supabase } = context;

  const slug = slugifyKeyword(input.slug ?? input.label);
  if (!slug) {
    return { ok: false, code: "error", error: "El slug resultante está vacío." };
  }

  const existing = await _getKeywordBySlugForActor(context, slug);
  if (existing) {
    return {
      ok: false,
      code: "conflict",
      error: `Ya existe una keyword con el slug '${slug}'.`,
    };
  }

  const { data, error } = await supabase
    .from("keywords")
    .insert({
      slug,
      label: input.label,
      description: input.description ?? null,
      kind: input.kind ?? null,
    })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation (carrera con otra creación concurrente del
    // mismo slug) — se reporta igual que el conflicto detectado arriba.
    if (error.code === "23505") {
      return {
        ok: false,
        code: "conflict",
        error: `Ya existe una keyword con el slug '${slug}'.`,
      };
    }
    return { ok: false, code: "error", error: error.message };
  }

  return { ok: true, keyword: data as Keyword };
}

async function _updateKeywordForActor(
  context: KeywordContext,
  slug: string,
  input: KeywordUpdateInput
): Promise<Keyword | null> {
  const { supabase } = context;

  const fields: Record<string, unknown> = {};
  if (input.label !== undefined) fields.label = input.label;
  if (input.description !== undefined) fields.description = input.description;
  if (input.kind !== undefined) fields.kind = input.kind;

  if (Object.keys(fields).length === 0) {
    return _getKeywordBySlugForActor(context, slug);
  }

  const { data, error } = await supabase
    .from("keywords")
    .update(fields)
    .eq("slug", slug)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Keyword | null) ?? null;
}

async function _deleteKeywordForActor(
  context: KeywordContext,
  slug: string
): Promise<{ ok: true } | { ok: false; error: string; code: "not_found" | "conflict" | "error" }> {
  const { supabase } = context;

  const existing = await _getKeywordBySlugForActor(context, slug);
  if (!existing) {
    return { ok: false, code: "not_found", error: "Keyword no encontrada." };
  }

  const { count } = await supabase
    .from("question_keywords")
    .select("question_id", { count: "exact", head: true })
    .eq("keyword_slug", slug);

  if (count && count > 0) {
    return {
      ok: false,
      code: "conflict",
      error: `La keyword '${slug}' está en uso por ${count} pregunta(s) y no se puede eliminar.`,
    };
  }

  const { error } = await supabase.from("keywords").delete().eq("slug", slug);
  if (error) {
    // 23503 = foreign_key_violation — red de seguridad si el conteo de
    // arriba quedó desactualizado por una relación creada entre medio.
    if (error.code === "23503") {
      return {
        ok: false,
        code: "conflict",
        error: `La keyword '${slug}' está en uso y no se puede eliminar.`,
      };
    }
    return { ok: false, code: "error", error: error.message };
  }

  return { ok: true };
}

// D3: valida un conjunto de slugs de keywords contra el catálogo antes de
// escribir question_keywords. Devuelve TODOS los faltantes de una vez (no el
// primero) — la FK de question_keywords.keyword_slug es la red de seguridad,
// este chequeo es el mensaje útil.
async function assertKeywordsExist(
  context: KeywordContext,
  slugs: string[]
): Promise<{ ok: true } | { ok: false; missing: string[] }> {
  const { supabase } = context;

  const uniqueSlugs = Array.from(new Set(slugs));
  if (uniqueSlugs.length === 0) return { ok: true };

  const { data, error } = await supabase
    .from("keywords")
    .select("slug")
    .in("slug", uniqueSlugs);

  if (error) throw new Error(error.message);

  const found = new Set((data ?? []).map((row: { slug: string }) => row.slug));
  const missing = uniqueSlugs.filter((slug) => !found.has(slug));

  if (missing.length > 0) {
    return { ok: false, missing };
  }
  return { ok: true };
}

export {
  _listKeywordsForActor,
  _getKeywordBySlugForActor,
  _createKeywordForActor,
  _updateKeywordForActor,
  _deleteKeywordForActor,
  assertKeywordsExist,
};
