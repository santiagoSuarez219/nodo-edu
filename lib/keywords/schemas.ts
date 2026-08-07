import { z } from "zod";

// spec-042 D3: facetas cerradas — debe coincidir con el `check` de
// supabase/migrations/20260806000000_init_keywords.sql.
export const KEYWORD_KINDS = ["tema", "lenguaje", "momento", "ejercicio"] as const;

export const KeywordSlugSchema = z
  .string()
  .min(1, "El slug es requerido")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "El slug debe ser kebab-case (minúsculas, números y guiones)"
  );

export const KeywordCreateSchema = z.object({
  // Opcional: si no se envía, el dominio lo deriva de `label`. Si se envía,
  // se normaliza igual que uno derivado (ver lib/keywords/index.ts:slugify).
  slug: z.string().min(1).optional(),
  label: z.string().min(1, "El label es requerido"),
  description: z.string().optional(),
  kind: z.enum(KEYWORD_KINDS).nullable().optional(),
});

export type KeywordCreateInput = z.infer<typeof KeywordCreateSchema>;

export const KeywordUpdateSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  kind: z.enum(KEYWORD_KINDS).nullable().optional(),
});

export type KeywordUpdateInput = z.infer<typeof KeywordUpdateSchema>;

export const ListKeywordsFiltersSchema = z.object({
  q: z.string().optional(),
  kind: z.enum(KEYWORD_KINDS).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListKeywordsFilters = z.infer<typeof ListKeywordsFiltersSchema>;
