import { callAssignmentApi } from "./api.js";
export const tools = [
    {
        name: "list_academic_courses",
        description: "Lista los cursos académicos del docente. Úsala para obtener los IDs de los cursos y evitar tener que adivinarlos.",
        inputSchema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "list_assignment_groups",
        description: "Lista evaluaciones del docente, filtrable por curso y estado de publicación.",
        inputSchema: {
            type: "object",
            properties: {
                academic_course_id: {
                    type: "string",
                    description: "UUID del curso académico (opcional)",
                },
                is_published: {
                    type: "boolean",
                    description: "Filtrar por estado de publicación (opcional)",
                },
            },
            required: [],
        },
    },
    {
        name: "get_assignment_group",
        description: "Obtiene el detalle completo de una evaluación: configuración, las 3 variantes con sus preguntas, puntos y puntuación total.",
        inputSchema: {
            type: "object",
            properties: {
                groupId: {
                    type: "string",
                    description: "UUID de la evaluación",
                },
            },
            required: ["groupId"],
        },
    },
    {
        name: "create_assignment_group",
        description: "Crea una evaluación completa en una sola operación atómica. Si falla algo, no se crea nada. Proporciona la configuración compartida y un array de variantes (cada una con sus preguntas).",
        inputSchema: {
            type: "object",
            properties: {
                academic_course_id: {
                    type: "string",
                    description: "UUID del curso académico",
                },
                title: {
                    type: "string",
                    description: "Título de la evaluación",
                },
                description: {
                    type: "string",
                    description: "Instrucciones comunes (Markdown, opcional)",
                },
                type: {
                    type: "string",
                    enum: ["practice", "quiz", "exam", "homework"],
                    description: "Tipo de evaluación",
                },
                opens_at: {
                    type: "string",
                    description: "ISO timestamp de apertura (opcional, null = desde publicación)",
                },
                closes_at: {
                    type: "string",
                    description: "ISO timestamp de cierre (opcional, null = sin límite)",
                },
                time_limit_minutes: {
                    type: "integer",
                    description: "Límite de tiempo en minutos (opcional, >0)",
                },
                shuffle_questions: {
                    type: "boolean",
                    description: "Mezclar preguntas (default: false)",
                },
                shuffle_choices: {
                    type: "boolean",
                    description: "Mezclar opciones (default: false)",
                },
                show_feedback_on: {
                    type: "string",
                    enum: ["submit", "close", "never"],
                    description: "Cuándo mostrar feedback (default: 'submit')",
                },
                max_attempts: {
                    type: "integer",
                    description: "Máximo de intentos (default: 1, ≥1)",
                },
                grade_item_id: {
                    type: "string",
                    description: "UUID del item de calificación (opcional)",
                },
                variants: {
                    type: "array",
                    description: "Array de variantes (mínimo 2, típicamente 3)",
                    items: {
                        type: "object",
                        properties: {
                            variant_label: {
                                type: "string",
                                enum: ["A", "B", "C"],
                                description: "Etiqueta de la variante",
                            },
                            description: {
                                type: "string",
                                description: "Nota específica de la variante (opcional)",
                            },
                            questions: {
                                type: "array",
                                description: "Preguntas de la variante",
                                items: {
                                    type: "object",
                                    properties: {
                                        question_id: {
                                            type: "string",
                                            description: "UUID de la pregunta",
                                        },
                                        points: {
                                            type: "number",
                                            description: "Puntos (0.01-5.0)",
                                        },
                                        order_index: {
                                            type: "integer",
                                            description: "Orden de la pregunta",
                                        },
                                    },
                                    required: ["question_id", "points", "order_index"],
                                },
                            },
                        },
                        required: ["variant_label", "questions"],
                    },
                },
            },
            required: [
                "academic_course_id",
                "title",
                "type",
                "variants",
            ],
        },
    },
    {
        name: "update_assignment_group",
        description: "Actualiza la configuración compartida de una evaluación (no las variantes ni preguntas).",
        inputSchema: {
            type: "object",
            properties: {
                groupId: {
                    type: "string",
                    description: "UUID de la evaluación",
                },
                title: {
                    type: "string",
                    description: "Título (opcional)",
                },
                description: {
                    type: "string",
                    description: "Descripción / instrucciones (opcional)",
                },
                opens_at: {
                    type: "string",
                    description: "ISO timestamp de apertura (opcional)",
                },
                closes_at: {
                    type: "string",
                    description: "ISO timestamp de cierre (opcional)",
                },
                time_limit_minutes: {
                    type: "integer",
                    description: "Límite de tiempo en minutos (opcional)",
                },
                shuffle_questions: {
                    type: "boolean",
                    description: "Mezclar preguntas (opcional)",
                },
                shuffle_choices: {
                    type: "boolean",
                    description: "Mezclar opciones (opcional)",
                },
                show_feedback_on: {
                    type: "string",
                    enum: ["submit", "close", "never"],
                    description: "Cuándo mostrar feedback (opcional)",
                },
                max_attempts: {
                    type: "integer",
                    description: "Máximo de intentos (opcional)",
                },
                grade_item_id: {
                    type: "string",
                    description: "UUID del item de calificación (opcional)",
                },
            },
            required: ["groupId"],
        },
    },
    {
        name: "replace_variant_questions",
        description: "Reemplaza el conjunto completo de preguntas de una variante específica sin afectar las otras.",
        inputSchema: {
            type: "object",
            properties: {
                groupId: {
                    type: "string",
                    description: "UUID de la evaluación",
                },
                assignmentId: {
                    type: "string",
                    description: "UUID de la variante",
                },
                questions: {
                    type: "array",
                    description: "Array de preguntas con sus puntos y orden",
                    items: {
                        type: "object",
                        properties: {
                            question_id: {
                                type: "string",
                                description: "UUID de la pregunta",
                            },
                            points: {
                                type: "number",
                                description: "Puntos (0.01-5.0)",
                            },
                            order_index: {
                                type: "integer",
                                description: "Orden de la pregunta",
                            },
                        },
                        required: ["question_id", "points", "order_index"],
                    },
                },
            },
            required: ["groupId", "assignmentId", "questions"],
        },
    },
    {
        name: "delete_assignment_group",
        description: "Elimina una evaluación. Falla con 409 si ya tiene respuestas de estudiantes.",
        inputSchema: {
            type: "object",
            properties: {
                groupId: {
                    type: "string",
                    description: "UUID de la evaluación",
                },
            },
            required: ["groupId"],
        },
    },
    {
        name: "publish_assignment_group",
        description: "Publica una evaluación tras validar invariantes: mínimo 2 variantes, ninguna vacía, puntuación total igual en todas.",
        inputSchema: {
            type: "object",
            properties: {
                groupId: {
                    type: "string",
                    description: "UUID de la evaluación",
                },
            },
            required: ["groupId"],
        },
    },
    {
        name: "get_variant_allocations",
        description: "Obtiene el reparto de variantes por estudiante (solo lectura): qué variante le tocó a cada matriculado.",
        inputSchema: {
            type: "object",
            properties: {
                groupId: {
                    type: "string",
                    description: "UUID de la evaluación",
                },
            },
            required: ["groupId"],
        },
    },
];
export async function handleToolCall(toolName, toolInput) {
    switch (toolName) {
        case "list_academic_courses":
            return handleListAcademicCourses();
        case "list_assignment_groups":
            return handleListAssignmentGroups(toolInput);
        case "get_assignment_group":
            return handleGetAssignmentGroup(toolInput);
        case "create_assignment_group":
            return handleCreateAssignmentGroup(toolInput);
        case "update_assignment_group":
            return handleUpdateAssignmentGroup(toolInput);
        case "replace_variant_questions":
            return handleReplaceVariantQuestions(toolInput);
        case "delete_assignment_group":
            return handleDeleteAssignmentGroup(toolInput);
        case "publish_assignment_group":
            return handlePublishAssignmentGroup(toolInput);
        case "get_variant_allocations":
            return handleGetVariantAllocations(toolInput);
        default:
            throw new Error(`Herramienta desconocida: ${toolName}`);
    }
}
async function handleListAcademicCourses() {
    const result = await callAssignmentApi("GET", "/academic-courses");
    return JSON.stringify(result, null, 2);
}
async function handleListAssignmentGroups(input) {
    const params = new URLSearchParams();
    if (input.academic_course_id) {
        params.append("academic_course_id", String(input.academic_course_id));
    }
    if (input.is_published !== undefined) {
        params.append("is_published", String(input.is_published));
    }
    const path = `/groups${params.toString() ? `?${params}` : ""}`;
    const result = await callAssignmentApi("GET", path);
    return JSON.stringify(result, null, 2);
}
async function handleGetAssignmentGroup(input) {
    const groupId = String(input.groupId);
    const result = await callAssignmentApi("GET", `/groups/${groupId}`);
    return JSON.stringify(result, null, 2);
}
async function handleCreateAssignmentGroup(input) {
    const result = await callAssignmentApi("POST", "/groups", input);
    return JSON.stringify(result, null, 2);
}
async function handleUpdateAssignmentGroup(input) {
    const groupId = String(input.groupId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { groupId: _groupId, ...body } = input;
    const result = await callAssignmentApi("PATCH", `/groups/${groupId}`, body);
    return JSON.stringify(result, null, 2);
}
async function handleReplaceVariantQuestions(input) {
    const groupId = String(input.groupId);
    const assignmentId = String(input.assignmentId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { groupId: _groupId, assignmentId: _assignmentId, ...body } = input;
    const result = await callAssignmentApi("PATCH", `/groups/${groupId}/variants/${assignmentId}`, body);
    return JSON.stringify(result, null, 2);
}
async function handleDeleteAssignmentGroup(input) {
    const groupId = String(input.groupId);
    const result = await callAssignmentApi("DELETE", `/groups/${groupId}`);
    return JSON.stringify(result, null, 2);
}
async function handlePublishAssignmentGroup(input) {
    const groupId = String(input.groupId);
    const result = await callAssignmentApi("POST", `/groups/${groupId}/publish`);
    return JSON.stringify(result, null, 2);
}
async function handleGetVariantAllocations(input) {
    const groupId = String(input.groupId);
    const result = await callAssignmentApi("GET", `/groups/${groupId}/allocations`);
    return JSON.stringify(result, null, 2);
}
