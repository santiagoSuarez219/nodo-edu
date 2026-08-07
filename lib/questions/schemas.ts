import { z } from "zod";

// spec-042 D2: sustituyeron a course_slug/lesson_slug/tags en el contrato de
// creación/edición. Si el cliente los envía igual, la API responde 422 (ver
// LEGACY_QUESTION_FIELDS más abajo) — no se ignoran en silencio.
const QuestionBaseSchema = z.object({
  topic_title: z.string().optional(),
  stem: z.string().min(1, "El enunciado de la pregunta es requerido"),
  difficulty: z.coerce
    .number()
    .int()
    .min(1, "Dificultad mínima: 1")
    .max(5, "Dificultad máxima: 5")
    .default(1),
  keywords: z.array(z.string()).default([]),
});

const ChoiceSchema = z.object({
  body: z.string().min(1, "El texto de la opción es requerido"),
  is_correct: z.boolean().default(false),
  order_index: z.number().int().min(0),
});

export const MultipleChoiceSchema = QuestionBaseSchema.extend({
  type: z.literal("multiple_choice"),
  choices: z
    .array(ChoiceSchema)
    .min(2, "Se requieren al menos 2 opciones")
    .refine(
      (choices) => choices.some((c) => c.is_correct),
      "Al menos una opción debe ser correcta"
    ),
});

const RubricMaxScoreSchema = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().min(0.01).max(5, "La puntuación máxima es 5.0").optional()
);

export const OpenTextSchema = QuestionBaseSchema.extend({
  type: z.literal("open_text"),
  rubric: z
    .object({
      max_score: RubricMaxScoreSchema,
      criteria: z
        .array(
          z.object({
            label: z.string().min(1),
            points: z.number().min(0),
            description: z.string(),
          })
        )
        .default([]),
    })
    .nullable()
    .optional(),
});

export const CodeSnippetSchema = QuestionBaseSchema.extend({
  type: z.literal("code_snippet"),
  code_snippet: z.string().min(1, "El fragmento de código es requerido"),
  code_language: z.string().min(1, "El lenguaje del código es requerido"),
});

export const CodeWriteSchema = QuestionBaseSchema.extend({
  type: z.literal("code_write"),
  code_language: z.string().optional(),
  rubric: z
    .object({
      max_score: RubricMaxScoreSchema,
      criteria: z
        .array(
          z.object({
            label: z.string().min(1),
            points: z.number().min(0),
            description: z.string(),
          })
        )
        .default([]),
    })
    .nullable()
    .optional(),
});

export const CodingChallengeSchema = QuestionBaseSchema.extend({
  type: z.literal("coding_challenge"),
  code_snippet: z.string().optional(),
  code_language: z.string().min(1, "El lenguaje es requerido"),
  challenge_tests: z
    .array(
      z.object({
        input: z.string(),
        expected_output: z.string().min(1, "El output esperado es requerido"),
        is_hidden: z.boolean().default(false),
        order_index: z.number().int().min(0),
      })
    )
    .min(1, "Se requiere al menos un caso de prueba"),
});

export const QuestionSchema = z.discriminatedUnion("type", [
  MultipleChoiceSchema,
  OpenTextSchema,
  CodeSnippetSchema,
  CodeWriteSchema,
  CodingChallengeSchema,
]);

export type QuestionFormInput = z.infer<typeof QuestionSchema>;

// spec-042 D2: campos del contrato anterior. Si el body de
// POST/PATCH /api/questions incluye alguno, la ruta responde 422 con un
// mensaje que apunta al endpoint correcto, en vez de ignorarlos en silencio.
export const LEGACY_QUESTION_FIELDS = ["course_slug", "lesson_slug", "tags"] as const;

export function findLegacyQuestionFields(body: unknown): string[] {
  if (typeof body !== "object" || body === null) return [];
  return LEGACY_QUESTION_FIELDS.filter((field) =>
    Object.prototype.hasOwnProperty.call(body, field)
  );
}

export const ListQuestionsFiltersSchema = z.object({
  // Se mantienen con el mismo nombre (D6): antes filtraban directamente sobre
  // questions.course_slug/lesson_slug, ahora resuelven vía lesson_questions.
  course_slug: z.string().optional(),
  lesson_slug: z.string().optional(),
  type: z.enum(["multiple_choice", "open_text", "code_snippet", "code_write", "coding_challenge"]).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  // spec-042: sustituye a `tag` (vocabulario controlado).
  keyword: z.string().optional(),
  is_published: z.enum(["true", "false"]).transform(v => v === "true").optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListQuestionsFilters = z.infer<typeof ListQuestionsFiltersSchema>;

// ─── Montaje de preguntas en lecciones (spec-042) ─────────────────────────

export const MountQuestionSchema = z.object({
  course_slug: z.string().min(1, "course_slug es requerido"),
  lesson_slug: z.string().min(1, "lesson_slug es requerido"),
});

export type MountQuestionInput = z.infer<typeof MountQuestionSchema>;

// D6: PUT /api/lessons/{curso}/{leccion}/questions SOLO reordena — la lista
// debe coincidir exactamente con lo montado, o 422 sin escribir nada.
export const ReorderLessonQuestionsSchema = z.object({
  question_ids: z
    .array(z.string().uuid("Cada elemento debe ser un UUID válido"))
    .min(1, "Se requiere al menos una pregunta"),
});

export type ReorderLessonQuestionsInput = z.infer<typeof ReorderLessonQuestionsSchema>;
