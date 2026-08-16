import { callStudentsApi } from "./api.js";
export const tools = [
    {
        name: "list_students",
        description: "Lista estudiantes registrados, opcionalmente filtrados por curso o por texto (nombre/correo). No incluye enrollment_code ni contraseñas.",
        inputSchema: {
            type: "object",
            properties: {
                academic_course_id: {
                    type: "string",
                    description: "UUID del curso académico; si se indica, solo lista matriculados activos en ese curso",
                },
                q: {
                    type: "string",
                    description: "Búsqueda de texto en nombre o correo",
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
        name: "get_student",
        description: "Obtiene el detalle de un estudiante: perfil, datos académicos y todas sus matrículas.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "UUID del estudiante" },
            },
            required: ["id"],
        },
    },
    {
        name: "create_student",
        description: "Crea manualmente un estudiante (para quien no pudo registrarse en clase). La contraseña la decide el docente y se le entrega directamente al estudiante; esta herramienta nunca la devuelve. Opcionalmente matricula al curso indicado.",
        inputSchema: {
            type: "object",
            properties: {
                full_name: { type: "string", description: "Nombre completo" },
                email: { type: "string", description: "Correo electrónico" },
                password: {
                    type: "string",
                    description: "Contraseña inicial (mínimo 8 caracteres) — decidida por el docente, nunca se devuelve en la respuesta",
                },
                career: { type: "string", description: "Carrera (opcional)" },
                semester: { type: "integer", minimum: 1, maximum: 20, description: "Semestre (opcional)" },
                github_username: {
                    type: "string",
                    description: "Usuario de GitHub (opcional, sin '@'). No se verifica contra GitHub: es un dato declarado por el docente/estudiante, no una identidad confirmada.",
                },
                enrollment_code: {
                    type: "string",
                    description: "Código de matrícula del curso (alternativa a academic_course_id)",
                },
                academic_course_id: {
                    type: "string",
                    description: "UUID del curso a matricular (alternativa a enrollment_code)",
                },
            },
            required: ["full_name", "email", "password"],
        },
    },
    {
        name: "update_student",
        description: "Corrige nombre, correo, carrera, semestre o usuario de GitHub de un estudiante existente. Nota: para borrar el usuario de GitHub ya guardado, esta herramienta no admite enviar null — usa la API directamente con {\"github_username\": null} si hace falta limpiarlo.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "UUID del estudiante" },
                full_name: { type: "string" },
                email: { type: "string" },
                career: { type: "string" },
                semester: { type: "integer", minimum: 1, maximum: 20 },
                github_username: {
                    type: "string",
                    description: "Usuario de GitHub (sin '@'). No se verifica contra GitHub: es un dato declarado, no una identidad confirmada.",
                },
            },
            required: ["id"],
        },
    },
    {
        name: "delete_student",
        description: "ELIMINA PERMANENTEMENTE a un estudiante: su perfil, matrículas, asistencia y calificaciones. Acción destructiva e irreversible: requiere confirmación explícita del docente antes de invocarla, nunca en lote. Si el estudiante tiene entregas reales en alguna evaluación, la API responde 409 y NO borra nada — en ese caso usa unenroll_student para retirarlo del curso sin perder las entregas.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "UUID del estudiante a eliminar" },
            },
            required: ["id"],
        },
    },
    {
        name: "enroll_student",
        description: "Matricula a un estudiante existente en un curso, por UUID o por enrollment_code.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "UUID del estudiante" },
                academic_course_id: { type: "string", description: "UUID del curso" },
                enrollment_code: { type: "string", description: "Código de matrícula del curso" },
            },
            required: ["id"],
        },
    },
    {
        name: "unenroll_student",
        description: "Retira a un estudiante de un curso (deja la matrícula en estado 'withdrawn', no la borra).",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "UUID del estudiante" },
                academic_course_id: { type: "string", description: "UUID del curso" },
            },
            required: ["id", "academic_course_id"],
        },
    },
    {
        name: "reset_student_password",
        description: "Restablece la contraseña de un estudiante y lo marca para que deba cambiarla en su próximo inicio de sesión — el mismo circuito que usa un docente cuando un estudiante olvidó la suya (spec-051). Sin `password`, se genera una legible para dictar en voz alta (sin caracteres ambiguos: l/1/I, O/0). La respuesta devuelve la contraseña UNA sola vez — no vuelve a consultarse por ningún otro medio, así que hay que entregarla al docente en la misma respuesta y no reintentar 'por si acaso' (cada reintento genera/fija una contraseña nueva y descarta la anterior). No usar en lote sin que el docente lo pida explícitamente por cada estudiante.",
        inputSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "UUID del estudiante" },
                password: {
                    type: "string",
                    description: "Contraseña específica a fijar (mínimo 8 caracteres) — opcional, útil solo si el docente quiere dictar la MISMA contraseña a varios estudiantes en la misma sesión de clase. Si se omite, se genera una aleatoria.",
                },
            },
            required: ["id"],
        },
    },
    {
        name: "get_student_self_assessment_summary",
        description: "Consulta la nota de autoevaluaciones de un estudiante en un curso: nota 0-5 (null si aún no hay preguntas evaluables, nunca 0.00), acumulado de preguntas correctas sobre el total y desglose por lección (respondida o no, correctas/total). Sirve para explicar de dónde sale la nota. Es una herramienta de SOLO LECTURA: la nota se calcula automáticamente a partir de las lecciones vistas y respondidas, y no se puede modificar desde aquí.",
        inputSchema: {
            type: "object",
            properties: {
                student_id: { type: "string", description: "UUID del estudiante" },
                course_slug: {
                    type: "string",
                    description: "Slug del curso publicado (ej. 'estructura-de-datos')",
                },
            },
            required: ["student_id", "course_slug"],
        },
    },
];
export async function processToolCall(toolName, toolInput) {
    switch (toolName) {
        case "list_students": {
            const params = new URLSearchParams();
            if (toolInput.academic_course_id)
                params.append("academic_course_id", String(toolInput.academic_course_id));
            if (toolInput.q)
                params.append("q", String(toolInput.q));
            if (toolInput.limit)
                params.append("limit", String(toolInput.limit));
            if (toolInput.offset !== undefined)
                params.append("offset", String(toolInput.offset));
            return await callStudentsApi("GET", `?${params}`);
        }
        case "get_student":
            return await callStudentsApi("GET", `/${toolInput.id}`);
        case "create_student":
            return await callStudentsApi("POST", "", toolInput);
        case "update_student": {
            const { id, ...body } = toolInput;
            return await callStudentsApi("PATCH", `/${id}`, body);
        }
        case "delete_student":
            return await callStudentsApi("DELETE", `/${toolInput.id}`);
        case "enroll_student": {
            const { id, ...body } = toolInput;
            return await callStudentsApi("POST", `/${id}/enrollments`, body);
        }
        case "unenroll_student": {
            const params = new URLSearchParams({
                academic_course_id: String(toolInput.academic_course_id),
            });
            return await callStudentsApi("DELETE", `/${toolInput.id}/enrollments?${params}`);
        }
        case "reset_student_password": {
            const body = toolInput.password ? { password: toolInput.password } : {};
            return await callStudentsApi("POST", `/${toolInput.id}/reset-password`, body);
        }
        case "get_student_self_assessment_summary": {
            const params = new URLSearchParams({
                course_slug: String(toolInput.course_slug),
            });
            return await callStudentsApi("GET", `/${toolInput.student_id}/self-assessment?${params}`);
        }
        default:
            throw new Error(`Herramienta desconocida: ${toolName}`);
    }
}
