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

    default:
      throw new Error(`Herramienta desconocida: ${toolName}`);
  }
}
