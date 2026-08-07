import { createServiceSupabaseClient } from "@/lib/auth/service";
import {
  _listKeywordsForActor,
  _getKeywordBySlugForActor,
  _createKeywordForActor,
  _updateKeywordForActor,
  _deleteKeywordForActor,
  assertKeywordsExist,
} from "./index";
import type {
  Keyword,
  KeywordContext,
  KeywordCreateInput,
  KeywordUpdateInput,
  ListKeywordsFilters,
} from "./types";

// El catálogo de keywords es compartido (no tiene dueño por fila, a
// diferencia de questions): el actorId aquí solo identifica al agente que
// escribe, no se usa como frontera de propiedad en el dominio.
export function getServiceKeywordsContext(): KeywordContext {
  const supabase = createServiceSupabaseClient();
  const actorId = process.env.QUESTION_BANK_AGENT_TEACHER_ID;

  if (!actorId) {
    throw new Error("QUESTION_BANK_AGENT_TEACHER_ID no configurada");
  }

  return { supabase, actorId };
}

export async function getServiceKeywords(
  filters?: ListKeywordsFilters
): Promise<Keyword[]> {
  const context = getServiceKeywordsContext();
  return _listKeywordsForActor(context, filters);
}

export async function getServiceKeywordBySlug(
  slug: string
): Promise<Keyword | null> {
  const context = getServiceKeywordsContext();
  return _getKeywordBySlugForActor(context, slug);
}

export async function createServiceKeyword(input: KeywordCreateInput) {
  const context = getServiceKeywordsContext();
  return _createKeywordForActor(context, input);
}

export async function updateServiceKeyword(
  slug: string,
  input: KeywordUpdateInput
): Promise<Keyword | null> {
  const context = getServiceKeywordsContext();
  return _updateKeywordForActor(context, slug, input);
}

export async function deleteServiceKeyword(slug: string) {
  const context = getServiceKeywordsContext();
  return _deleteKeywordForActor(context, slug);
}

export async function assertServiceKeywordsExist(slugs: string[]) {
  const context = getServiceKeywordsContext();
  return assertKeywordsExist(context, slugs);
}
