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
      "Obtiene el roster de asistencia completo de una sesión específica con nombres de estudiantes (student_name, first_name = nombres, last_name = apellidos) y horas de marcado. Viene en orden de llegada (marked_at), no por apellido: si el docente quiere el listado por apellido, reordénalo tú y preséntalo como \"Apellidos, Nombres\".",
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
      "Obtiene un resumen de asistencia por estudiante para un curso con porcentajes de asistencia y sesiones asistidas. Ordenado por apellido; cada estudiante trae student_name (orden natural), first_name (nombres) y last_name (apellidos).",
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
  {
    name: "get_monthly_absence_summary",
    description:
      "Inasistencias por estudiante y mes calendario, en horas y en clases, solo de matrículas activas. No cuenta las sesiones anteriores a la matrícula de cada estudiante ni la sesión en curso. Úsala para reportar a la institución; para el % de asistencia usa get_course_attendance_summary. Un mes con sessions_counted = 0 significa 'no aplica' (el estudiante aún no estaba matriculado), distinto de 0 inasistencias. Ordenado por apellido. Con `month` no se devuelve `total` (solo el mes pedido).",
    inputSchema: {
      type: "object",
      properties: {
        course_id: {
          type: "string",
          description: "UUID del curso (requerido)",
        },
        month: {
          type: "string",
          description: "Restringe a un mes (YYYY-MM). Si se omite, todos los meses con clases cerradas.",
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

    case "get_monthly_absence_summary":
      return await callAttendanceApi(
        "GET",
        `/attendance/courses/${toolInput.course_id}/monthly-absences`,
        toolInput.month ? { month: String(toolInput.month) } : undefined
      );

    default:
      throw new Error(`Herramienta desconocida: ${toolName}`);
  }
}
