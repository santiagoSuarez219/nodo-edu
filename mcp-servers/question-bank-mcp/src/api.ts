class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

// spec-042: QUESTION_BANK_API_BASE_URL sigue apuntando a .../api/questions
// (no se renombra la variable de entorno para no romper el wrapper local ni
// la config de Claude Desktop ya documentada en CLAUDE.md). Los recursos
// nuevos (keywords, montaje de preguntas en lecciones) viven bajo el mismo
// origen de la app — se deriva quitando el sufijo /api/questions.
function getApiOrigin(): string {
  const baseUrl = process.env.QUESTION_BANK_API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "QUESTION_BANK_API_BASE_URL y QUESTION_BANK_API_KEY deben estar configuradas"
    );
  }
  return baseUrl.replace(/\/api\/questions\/?$/, "");
}

async function callApi(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const origin = getApiOrigin();
  const apiKey = process.env.QUESTION_BANK_API_KEY;

  if (!apiKey) {
    throw new Error(
      "QUESTION_BANK_API_BASE_URL y QUESTION_BANK_API_KEY deben estar configuradas"
    );
  }

  const url = `${origin}${path}`;
  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      // JSON parsing failed
    }

    const apiError = errorData as Record<string, unknown> | null;
    const errorObj =
      apiError?.error && typeof apiError.error === "object"
        ? (apiError.error as Record<string, unknown>)
        : null;
    const baseMessage = errorObj?.message || "Error unknown";

    // El mensaje de nivel superior de validation_error es genérico
    // ("El cuerpo no cumple el esquema esperado."); el detalle accionable
    // (p. ej. qué keyword falta y por qué) vive en details.fieldErrors. Se
    // relaya completo — sin reformular — para que el agente lo vea tal cual
    // lo dio la API (spec-042 Fase 6).
    const details = errorObj?.details as Record<string, unknown> | undefined;
    const fieldErrors = details?.fieldErrors as Record<string, string[]> | undefined;
    const fieldErrorLines = fieldErrors
      ? Object.entries(fieldErrors)
          .flatMap(([field, msgs]) => msgs.map((m) => `${field}: ${m}`))
          .join("; ")
      : "";

    const errorMessage = fieldErrorLines
      ? `${baseMessage} ${fieldErrorLines}`
      : baseMessage;

    if (response.status >= 400 && response.status < 500) {
      throw new ToolError(String(errorMessage));
    } else {
      throw new Error(`API no disponible (${response.status})`);
    }
  } catch (err) {
    if (err instanceof ToolError) {
      throw err;
    }
    throw new Error("API no disponible");
  }
}

export async function callQuestionBankApi(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  return callApi(method, `/api/questions${path}`, body);
}

// spec-042: catálogo de keywords.
export async function callKeywordsApi(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  return callApi(method, `/api/keywords${path}`, body);
}

// spec-042: montaje de preguntas en lecciones — mismo recurso, dos rutas
// (por pregunta y por lección), ambas bajo /api.
export async function callLessonMountApi(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  return callApi(method, path, body);
}
