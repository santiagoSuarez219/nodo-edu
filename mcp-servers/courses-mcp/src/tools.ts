import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callCoursesApi } from "./api.js";

export const tools: Tool[] = [
  {
    name: "list_course_lessons",
    description:
      "Lista todas las lecciones y guías del catálogo de un curso, en orden, indicando cuáles están deshabilitadas para los estudiantes. Úsala **antes** de abrir o cerrar una lección para confirmar el `lesson_slug` exacto y el estado actual.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: {
          type: "string",
          description:
            "Slug del curso (p. ej. 'estructuras-de-datos'). Debe existir en el catálogo.",
        },
      },
      required: ["course_slug"],
    },
  },
  {
    name: "get_lesson_availability",
    description:
      "Consulta si una lección concreta está disponible para los estudiantes, con la fecha y el motivo por el que se cerró, si aplica.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: { type: "string", description: "Slug del curso." },
        lesson_slug: {
          type: "string",
          description: "Slug de la lección dentro de ese curso.",
        },
      },
      required: ["course_slug", "lesson_slug"],
    },
  },
  {
    name: "set_lesson_availability",
    description:
      "Abre (`enabled: true`) o cierra (`enabled: false`) una lección para los estudiantes. **Afecta a todos los grupos y semestres de ese curso a la vez.** El efecto es inmediato, sin desplegar. Confirma siempre con el docente antes de usarla.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: { type: "string", description: "Slug del curso." },
        lesson_slug: {
          type: "string",
          description: "Slug de la lección dentro de ese curso.",
        },
        enabled: {
          type: "boolean",
          description:
            "true = visible para los estudiantes; false = cerrada. Sin valor por defecto: siempre explícito.",
        },
        reason: {
          type: "string",
          maxLength: 280,
          description:
            "Motivo del cierre, para el registro del docente (no se muestra al estudiante). Solo válido con enabled=false.",
        },
      },
      required: ["course_slug", "lesson_slug", "enabled"],
    },
  },
  {
    name: "list_course_groups",
    description:
      "Lista los grupos (cursos académicos) de un curso del catálogo, con su `academic_course_id`, nombre, código y nº de estudiantes activos. Úsala **antes** de marcar lecciones como vistas en clase: el marcado es por grupo y nunca debes inventar un `academic_course_id`.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: {
          type: "string",
          description: "Slug del curso (p. ej. 'estructuras-de-datos').",
        },
      },
      required: ["course_slug"],
    },
  },
  {
    name: "list_taught_lessons",
    description:
      "Lista las lecciones (no las guías) de un curso con su estado en UN grupo: si el docente la marcó como vista en clase, si está abierta o cerrada, cuántas preguntas de autoevaluación tiene y si `counts_for_grade` (marcada + abierta + con preguntas). Úsala antes de `set_lessons_taught` para confirmar los slugs y el estado actual.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: { type: "string", description: "Slug del curso." },
        academic_course_id: {
          type: "string",
          description: "UUID del grupo (de `list_course_groups`).",
        },
      },
      required: ["course_slug", "academic_course_id"],
    },
  },
  {
    name: "set_lessons_taught",
    description:
      "Marca (`taught: true`) o desmarca (`taught: false`) una o varias lecciones como vistas en clase en UN grupo, en una sola operación atómica (todo o nada) con un único recálculo de notas. **Cambia de inmediato la nota de autoevaluaciones de todos los estudiantes del grupo** (una lección marcada y sin responder cuenta como 0). Alcance: un solo grupo — a diferencia de `set_lesson_availability`, que afecta a todos. Marcar NO abre la lección. Confirma siempre con el docente, nombrando grupo, lecciones y dirección.",
    inputSchema: {
      type: "object",
      properties: {
        course_slug: { type: "string", description: "Slug del curso." },
        academic_course_id: {
          type: "string",
          description: "UUID del grupo (de `list_course_groups`).",
        },
        lesson_slugs: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 50,
          description:
            "Slugs de las lecciones, sin duplicados. Si alguno no es una lección válida (inexistente o guía) la llamada responde 422 y no se marca ninguna.",
        },
        taught: {
          type: "boolean",
          description:
            "true = vista en clase; false = desmarcar. Sin valor por defecto: siempre explícito.",
        },
      },
      required: ["course_slug", "academic_course_id", "lesson_slugs", "taught"],
    },
  },
];

export async function processToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "list_course_lessons": {
      const courseSlug = encodeURIComponent(String(toolInput.course_slug));
      return await callCoursesApi("GET", `/${courseSlug}/lessons`);
    }

    case "get_lesson_availability": {
      const courseSlug = encodeURIComponent(String(toolInput.course_slug));
      const lessonSlug = encodeURIComponent(String(toolInput.lesson_slug));
      return await callCoursesApi("GET", `/${courseSlug}/lessons/${lessonSlug}`);
    }

    case "set_lesson_availability": {
      const courseSlug = encodeURIComponent(String(toolInput.course_slug));
      const lessonSlug = encodeURIComponent(String(toolInput.lesson_slug));

      // `enabled` se reenvia tal cual, sin default: un default convertiria un
      // olvido del agente en una accion sobre estudiantes reales. Si falta o
      // no es booleano, la API responde 422 y el agente se entera.
      const body: Record<string, unknown> = { enabled: toolInput.enabled };
      if (toolInput.reason !== undefined) body.reason = toolInput.reason;

      return await callCoursesApi(
        "PATCH",
        `/${courseSlug}/lessons/${lessonSlug}`,
        body
      );
    }

    case "list_course_groups": {
      const courseSlug = encodeURIComponent(String(toolInput.course_slug));
      return await callCoursesApi("GET", `/${courseSlug}/groups`);
    }

    case "list_taught_lessons": {
      const courseSlug = encodeURIComponent(String(toolInput.course_slug));
      const groupId = encodeURIComponent(String(toolInput.academic_course_id));
      return await callCoursesApi(
        "GET",
        `/${courseSlug}/groups/${groupId}/taught-lessons`
      );
    }

    case "set_lessons_taught": {
      const courseSlug = encodeURIComponent(String(toolInput.course_slug));
      const groupId = encodeURIComponent(String(toolInput.academic_course_id));

      // `taught` y `lesson_slugs` se reenvían tal cual, sin default: un olvido
      // del agente no debe convertirse en una acción sobre notas reales. Si
      // faltan o son inválidos, la API responde 422 y el agente se entera.
      return await callCoursesApi(
        "PATCH",
        `/${courseSlug}/groups/${groupId}/taught-lessons`,
        { lesson_slugs: toolInput.lesson_slugs, taught: toolInput.taught }
      );
    }

    default:
      throw new Error(`Herramienta desconocida: ${toolName}`);
  }
}
