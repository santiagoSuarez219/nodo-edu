import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callQuestionBankApi } from "./api.js";

export const tools: Tool[] = [
  {
    name: "list_questions",
    description:
      "Lista preguntas del banco con filtros opcionales. Úsala para explorar el banco antes de crear y evitar duplicados.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["multiple_choice", "open_text", "code_snippet", "code_write", "coding_challenge"],
          description: "Tipo de pregunta",
        },
        course_slug: {
          type: "string",
          description: "Filtrar por slug del curso",
        },
        lesson_slug: {
          type: "string",
          description: "Filtrar por slug de la lección",
        },
        difficulty: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "Dificultad (1-5)",
        },
        is_published: {
          type: "boolean",
          description: "Solo preguntas publicadas",
        },
        tag: {
          type: "string",
          description: "Filtrar por etiqueta",
        },
        q: {
          type: "string",
          description: "Búsqueda de texto en el enunciado",
        },
        limit: {
          type: "integer",
          default: 50,
          maximum: 100,
          description: "Número máximo de resultados",
        },
        offset: {
          type: "integer",
          default: 0,
          description: "Offset para paginación",
        },
      },
    },
  },
  {
    name: "get_question",
    description: "Obtiene una pregunta completa por ID (con choices/rubric/challenge_tests). Úsala antes de actualizar.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "UUID de la pregunta",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "create_question",
    description: "Crea una pregunta nueva. SIEMPRE como borrador (is_published=false).",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["multiple_choice", "open_text", "code_snippet", "code_write", "coding_challenge"],
          description: "Tipo de pregunta",
        },
        stem: {
          type: "string",
          description: "Enunciado de la pregunta (Markdown, KaTeX, código inline)",
        },
        difficulty: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "Dificultad (1-5)",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Etiquetas para filtrar",
        },
        course_slug: {
          type: "string",
          description: "Slug del curso (ej: estructura-de-datos)",
        },
        lesson_slug: {
          type: "string",
          description: "Slug de la lección",
        },
        topic_title: {
          type: "string",
          description: "Título del tema",
        },
        choices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              body: { type: "string", description: "Texto de la opción" },
              is_correct: { type: "boolean", description: "Es correcta?" },
              order_index: { type: "number", description: "Orden" },
            },
            required: ["body", "is_correct", "order_index"],
          },
          description: "Para multiple_choice: mínimo 2, al menos una correcta",
        },
        rubric: {
          type: "object",
          properties: {
            criteria: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  points: { type: "number" },
                  description: { type: "string" },
                },
              },
              description: "Criterios de evaluación",
            },
            max_score: {
              type: "number",
              description: "Puntuación máxima (0.01-5.0), opcional",
            },
          },
          description: "Para open_text/code_write: rúbrica opcional",
        },
        code_snippet: {
          type: "string",
          description: "Para code_snippet/coding_challenge: fragmento de código",
        },
        code_language: {
          type: "string",
          description: "Para code_snippet/code_write/coding_challenge: lenguaje",
        },
        challenge_tests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              input: { type: "string", description: "Entrada/parámetros" },
              expected_output: { type: "string", description: "Output esperado" },
              is_hidden: { type: "boolean", description: "Oculto al estudiante?" },
              order_index: { type: "number", description: "Orden" },
            },
            required: ["input", "expected_output", "is_hidden", "order_index"],
          },
          description: "Para coding_challenge: mínimo 1 test",
        },
      },
      required: ["type", "stem", "difficulty", "tags"],
    },
  },
  {
    name: "update_question",
    description:
      "Actualiza una pregunta (envía campos a cambiar; el MCP relee y compone el payload completo). No cambia el type.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "UUID de la pregunta a actualizar",
        },
        type: {
          type: "string",
          enum: ["multiple_choice", "open_text", "code_snippet", "code_write", "coding_challenge"],
          description: "Tipo (no se puede cambiar, pero requerido para recomposición)",
        },
        stem: { type: "string", description: "Enunciado" },
        difficulty: { type: "integer", minimum: 1, maximum: 5 },
        tags: { type: "array", items: { type: "string" } },
        course_slug: { type: "string" },
        lesson_slug: { type: "string" },
        topic_title: { type: "string" },
        choices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              body: { type: "string" },
              is_correct: { type: "boolean" },
              order_index: { type: "number" },
            },
          },
        },
        rubric: {
          type: "object",
          properties: {
            criteria: { type: "array" },
            max_score: { type: "number" },
          },
        },
        code_snippet: { type: "string" },
        code_language: { type: "string" },
        challenge_tests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              input: { type: "string" },
              expected_output: { type: "string" },
              is_hidden: { type: "boolean" },
              order_index: { type: "number" },
            },
          },
        },
      },
      required: ["id", "type"],
    },
  },
  {
    name: "delete_question",
    description: "Elimina una pregunta permanentemente. Falla (409) si está en uso en una asignación.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "UUID de la pregunta a eliminar",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "publish_question",
    description:
      "Publica una pregunta (is_published=true). La API valida ≥1 opción correcta en multiple_choice.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "UUID de la pregunta a publicar",
        },
      },
      required: ["id"],
    },
  },
];

export async function handleToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case "list_questions":
      return handleListQuestions(toolInput);
    case "get_question":
      return handleGetQuestion(toolInput);
    case "create_question":
      return handleCreateQuestion(toolInput);
    case "update_question":
      return handleUpdateQuestion(toolInput);
    case "delete_question":
      return handleDeleteQuestion(toolInput);
    case "publish_question":
      return handlePublishQuestion(toolInput);
    default:
      throw new Error(`Herramienta desconocida: ${toolName}`);
  }
}

async function handleListQuestions(input: Record<string, unknown>): Promise<string> {
  const params = new URLSearchParams();

  if (input.course_slug) params.append("course_slug", String(input.course_slug));
  if (input.lesson_slug) params.append("lesson_slug", String(input.lesson_slug));
  if (input.type) params.append("type", String(input.type));
  if (input.difficulty) params.append("difficulty", String(input.difficulty));
  if (input.is_published !== undefined)
    params.append("is_published", String(input.is_published));
  if (input.tag) params.append("tag", String(input.tag));
  if (input.q) params.append("q", String(input.q));
  if (input.limit) params.append("limit", String(input.limit));
  if (input.offset !== undefined) params.append("offset", String(input.offset));

  const result = await callQuestionBankApi("GET", `?${params}`);
  return JSON.stringify(result, null, 2);
}

async function handleGetQuestion(input: Record<string, unknown>): Promise<string> {
  const id = String(input.id);
  const result = await callQuestionBankApi("GET", `/${id}`);
  return JSON.stringify(result, null, 2);
}

async function handleCreateQuestion(input: Record<string, unknown>): Promise<string> {
  const result = await callQuestionBankApi("POST", "", input);
  return JSON.stringify(result, null, 2);
}

async function handleUpdateQuestion(input: Record<string, unknown>): Promise<string> {
  const id = String(input.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...body } = input;

  const current = (await callQuestionBankApi("GET", `/${id}`)) as {
    data: Record<string, unknown>;
  };

  // Filtrar solo los campos que la API acepta en PATCH.
  // Los campos opcionales llegan como `null` desde la base de datos, pero el
  // esquema Zod de la API espera `string` o `undefined` (no `null`), así que
  // se omiten para no disparar un 422 de validación.
  const allowedFields = [
    "type",
    "stem",
    "difficulty",
    "tags",
    "course_slug",
    "lesson_slug",
    "topic_title",
    "choices",
    "rubric",
    "code_snippet",
    "code_language",
    "challenge_tests",
  ];

  const filtered = Object.fromEntries(
    Object.entries(current.data).filter(
      ([key, value]) => allowedFields.includes(key) && value !== null
    )
  );

  const merged = {
    ...filtered,
    ...body,
  };

  const result = await callQuestionBankApi("PATCH", `/${id}`, merged);
  return JSON.stringify(result, null, 2);
}

async function handleDeleteQuestion(input: Record<string, unknown>): Promise<string> {
  const id = String(input.id);
  const result = await callQuestionBankApi("DELETE", `/${id}`);
  return JSON.stringify(result, null, 2);
}

async function handlePublishQuestion(input: Record<string, unknown>): Promise<string> {
  const id = String(input.id);
  const result = await callQuestionBankApi("POST", `/${id}/publish`);
  return JSON.stringify(result, null, 2);
}
