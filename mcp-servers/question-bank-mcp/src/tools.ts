import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callQuestionBankApi, callKeywordsApi, callLessonMountApi } from "./api.js";

const KEYWORD_KINDS = ["tema", "lenguaje", "momento", "ejercicio"];

export const tools: Tool[] = [
  {
    name: "list_questions",
    description:
      "Lista preguntas del banco con filtros opcionales. Úsala para explorar el banco antes de crear y evitar duplicados. course_slug/lesson_slug filtran por preguntas MONTADAS en esa lección (ver list_lesson_questions para el orden exacto).",
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
          description: "Filtrar por preguntas montadas en este curso (ver mount_question_in_lesson)",
        },
        lesson_slug: {
          type: "string",
          description: "Filtrar por preguntas montadas en esta lección (requiere course_slug)",
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
        keyword: {
          type: "string",
          description: "Filtrar por slug de una keyword del catálogo (ver list_keywords)",
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
    description:
      "Obtiene una pregunta completa por ID (con choices/rubric/challenge_tests, keywords y las lecciones donde está montada). Úsala antes de actualizar.",
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
    description:
      "Crea una pregunta nueva. SIEMPRE como borrador (is_published=false). Ya no acepta course_slug/lesson_slug/tags: para que aparezca en una autoevaluación hay que publicarla (publish_question) y MONTARLA en la lección (mount_question_in_lesson) — una pregunta publicada sin montar es invisible. Las keywords deben existir en el catálogo antes (ver list_keywords/create_keyword); una inexistente hace fallar la creación completa, listando todas las que faltan.",
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
        keywords: {
          type: "array",
          items: { type: "string" },
          description:
            "Slugs de keywords del catálogo (NUNCA inventar una: listar con list_keywords primero, o proponer create_keyword al usuario).",
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
      required: ["type", "stem", "difficulty", "keywords"],
    },
  },
  {
    name: "update_question",
    description:
      "Actualiza una pregunta (envía campos a cambiar; el MCP relee y compone el payload completo). No cambia el type y NO afecta en qué lecciones está montada (usa mount_question_in_lesson/unmount_question_from_lesson para eso).",
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
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Reemplaza TODAS las keywords de la pregunta (no es un merge). Deben existir en el catálogo.",
        },
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
      "Publica una pregunta (is_published=true). La API valida ≥1 opción correcta en multiple_choice. Publicarla NO la monta en ninguna lección — sigue siendo invisible en autoevaluaciones hasta mount_question_in_lesson.",
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
  // ─── Catálogo de keywords (spec-042) ────────────────────────────────────
  {
    name: "list_keywords",
    description:
      "Lista el catálogo de keywords (vocabulario controlado). Úsala SIEMPRE antes de asignar keywords a una pregunta — nunca inventar un slug sin confirmarlo aquí.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Búsqueda de texto en el label" },
        kind: {
          type: "string",
          enum: KEYWORD_KINDS,
          description: "Filtrar por faceta",
        },
        limit: { type: "integer", default: 50, maximum: 100 },
        offset: { type: "integer", default: 0 },
      },
    },
  },
  {
    name: "create_keyword",
    description:
      "Crea una keyword nueva en el catálogo compartido. Amplía un vocabulario que usan todas las lecciones y cursos: PROPONLA AL USUARIO antes de invocarla, no la crees de forma unilateral solo porque una pregunta la necesita. Falla con 409 si el slug ya existe.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Opcional: si no se envía, se deriva de label (kebab-case, sin acentos)",
        },
        label: { type: "string", description: "Texto legible (ej: 'Listas Enlazadas')" },
        description: { type: "string", description: "Descripción opcional" },
        kind: {
          type: "string",
          enum: KEYWORD_KINDS,
          description: "Faceta: tema | lenguaje | momento | ejercicio. Opcional (queda sin clasificar).",
        },
      },
      required: ["label"],
    },
  },
  // ─── Montaje de preguntas en lecciones (spec-042) ───────────────────────
  {
    name: "mount_question_in_lesson",
    description:
      "Monta una pregunta publicada en una lección: la hace aparecer en la autoevaluación de esa lección. Idempotente (montarla dos veces no la mueve de posición). Una pregunta puede montarse en varias lecciones a la vez.",
    inputSchema: {
      type: "object",
      properties: {
        question_id: { type: "string", description: "UUID de la pregunta" },
        course_slug: { type: "string", description: "Slug del curso" },
        lesson_slug: { type: "string", description: "Slug de la lección" },
      },
      required: ["question_id", "course_slug", "lesson_slug"],
    },
  },
  {
    name: "unmount_question_from_lesson",
    description:
      "Desmonta una pregunta de una lección: deja de aparecer en la autoevaluación de esa lección, sin eliminarla del banco ni afectar sus otros montajes.",
    inputSchema: {
      type: "object",
      properties: {
        question_id: { type: "string", description: "UUID de la pregunta" },
        course_slug: { type: "string", description: "Slug del curso" },
        lesson_slug: { type: "string", description: "Slug de la lección" },
      },
      required: ["question_id", "course_slug", "lesson_slug"],
    },
  },
  {
    name: "list_lesson_questions",
    description:
      "Lista las preguntas montadas en una lección, EN EL ORDEN en que las verá el estudiante en su autoevaluación. Úsala para verificar que una pregunta publicada quedó realmente visible.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: { type: "string", description: "Slug del curso" },
        lesson_slug: { type: "string", description: "Slug de la lección" },
      },
      required: ["course_slug", "lesson_slug"],
    },
  },
  {
    name: "reorder_lesson_questions",
    description:
      "Reordena las preguntas YA MONTADAS en una lección. La lista de question_ids debe incluir EXACTAMENTE las preguntas montadas (ni de más ni de menos) o falla sin cambiar nada — este endpoint nunca monta ni desmonta, solo reordena.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: { type: "string", description: "Slug del curso" },
        lesson_slug: { type: "string", description: "Slug de la lección" },
        question_ids: {
          type: "array",
          items: { type: "string" },
          description: "IDs de TODAS las preguntas montadas, en el orden deseado",
        },
      },
      required: ["course_slug", "lesson_slug", "question_ids"],
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
    case "list_keywords":
      return handleListKeywords(toolInput);
    case "create_keyword":
      return handleCreateKeyword(toolInput);
    case "mount_question_in_lesson":
      return handleMountQuestionInLesson(toolInput);
    case "unmount_question_from_lesson":
      return handleUnmountQuestionFromLesson(toolInput);
    case "list_lesson_questions":
      return handleListLessonQuestions(toolInput);
    case "reorder_lesson_questions":
      return handleReorderLessonQuestions(toolInput);
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
  if (input.keyword) params.append("keyword", String(input.keyword));
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
  // spec-042: course_slug/lesson_slug/tags ya no forman parte del recurso
  // (la API los rechaza con 422 si llegan); `lessons` no se reenvía nunca —
  // el montaje se cambia solo con mount/unmount_question_in_lesson (D6).
  const allowedFields = [
    "type",
    "stem",
    "difficulty",
    "keywords",
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

async function handleListKeywords(input: Record<string, unknown>): Promise<string> {
  const params = new URLSearchParams();

  if (input.q) params.append("q", String(input.q));
  if (input.kind) params.append("kind", String(input.kind));
  if (input.limit) params.append("limit", String(input.limit));
  if (input.offset !== undefined) params.append("offset", String(input.offset));

  const result = await callKeywordsApi("GET", `?${params}`);
  return JSON.stringify(result, null, 2);
}

async function handleCreateKeyword(input: Record<string, unknown>): Promise<string> {
  const result = await callKeywordsApi("POST", "", input);
  return JSON.stringify(result, null, 2);
}

async function handleMountQuestionInLesson(input: Record<string, unknown>): Promise<string> {
  const questionId = String(input.question_id);
  const result = await callLessonMountApi("POST", `/api/questions/${questionId}/lessons`, {
    course_slug: input.course_slug,
    lesson_slug: input.lesson_slug,
  });
  return JSON.stringify(result, null, 2);
}

async function handleUnmountQuestionFromLesson(input: Record<string, unknown>): Promise<string> {
  const questionId = String(input.question_id);
  const params = new URLSearchParams({
    course_slug: String(input.course_slug),
    lesson_slug: String(input.lesson_slug),
  });
  const result = await callLessonMountApi(
    "DELETE",
    `/api/questions/${questionId}/lessons?${params}`
  );
  return JSON.stringify(result, null, 2);
}

async function handleListLessonQuestions(input: Record<string, unknown>): Promise<string> {
  const courseSlug = String(input.course_slug);
  const lessonSlug = String(input.lesson_slug);
  const result = await callLessonMountApi(
    "GET",
    `/api/lessons/${courseSlug}/${lessonSlug}/questions`
  );
  return JSON.stringify(result, null, 2);
}

async function handleReorderLessonQuestions(input: Record<string, unknown>): Promise<string> {
  const courseSlug = String(input.course_slug);
  const lessonSlug = String(input.lesson_slug);
  const result = await callLessonMountApi(
    "PUT",
    `/api/lessons/${courseSlug}/${lessonSlug}/questions`,
    { question_ids: input.question_ids }
  );
  return JSON.stringify(result, null, 2);
}
