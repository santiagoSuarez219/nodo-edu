import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { callAttendanceApi } from "./api.js";

export const tools: Tool[] = [
  {
    name: "list_sessions",
    description:
      "Lista sesiones de asistencia de un curso con filtros opcionales. Útil para revisar el histórico de sesiones abiertas.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: {
          type: "string",
          description: "UUID del curso (requerido)",
        },
        from_date: {
          type: "string",
          description: "Filtrar desde fecha (YYYY-MM-DD)",
        },
        to_date: {
          type: "string",
          description: "Filtrar hasta fecha (YYYY-MM-DD)",
        },
        is_open: {
          type: "boolean",
          description: "Filtrar solo sesiones abiertas",
        },
        limit: {
          type: "integer",
          default: 100,
          maximum: 100,
          description: "Número máximo de resultados",
        },
        offset: {
          type: "integer",
          default: 0,
          description: "Offset para paginación",
        },
      },
      required: ["course_id"],
    },
  },
  {
    name: "get_session_attendance",
    description:
      "Obtiene el roster de asistencia completo de una sesión específica con nombres de estudiantes y horas de marcado.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: {
          type: "string",
          description: "UUID de la sesión (requerido)",
        },
      },
      required: ["session_id"],
    },
  },
  {
    name: "get_course_attendance_summary",
    description:
      "Obtiene un resumen de asistencia por estudiante para un curso con porcentajes de asistencia y sesiones asistidas.",
    inputSchema: {
      type: "object",
      properties: {
        course_id: {
          type: "string",
          description: "UUID del curso (requerido)",
        },
        from_date: {
          type: "string",
          description: "Filtrar desde fecha (YYYY-MM-DD)",
        },
        to_date: {
          type: "string",
          description: "Filtrar hasta fecha (YYYY-MM-DD)",
        },
      },
      required: ["course_id"],
    },
  },
];

export async function processToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "list_sessions":
      return await callAttendanceApi("GET", "/attendance/sessions", {
        courseId: String(toolInput.course_id),
        ...(toolInput.from_date ? { fromDate: String(toolInput.from_date) } : {}),
        ...(toolInput.to_date ? { toDate: String(toolInput.to_date) } : {}),
        ...(toolInput.is_open !== undefined ? { isOpen: String(toolInput.is_open) } : {}),
        ...(toolInput.limit ? { limit: Number(toolInput.limit) } : {}),
        ...(toolInput.offset ? { offset: Number(toolInput.offset) } : {}),
      });

    case "get_session_attendance":
      return await callAttendanceApi(
        "GET",
        `/attendance/sessions/${toolInput.session_id}/records`
      );

    case "get_course_attendance_summary":
      return await callAttendanceApi(
        "GET",
        `/attendance/courses/${toolInput.course_id}/summary`,
        {
          ...(toolInput.from_date ? { fromDate: String(toolInput.from_date) } : {}),
          ...(toolInput.to_date ? { toDate: String(toolInput.to_date) } : {}),
        }
      );

    default:
      throw new Error(`Herramienta desconocida: ${toolName}`);
  }
}
