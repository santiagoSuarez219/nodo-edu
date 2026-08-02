export async function callCoursesApi(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const baseUrl = process.env.API_BASE_URL;
  const apiKey = process.env.API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("API_BASE_URL y API_KEY deben estar configuradas");
  }

  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  const options: RequestInit = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);

    if (response.ok) {
      return await response.json();
    }

    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      // JSON parsing failed
    }

    const apiError = errorData as Record<string, unknown> | null;
    const errorBody =
      apiError?.error && typeof apiError.error === "object"
        ? (apiError.error as Record<string, unknown>)
        : null;
    const errorMessage = errorBody?.message || "Error de API";

    // Los 422 llevan el detalle util en details.fieldErrors; sin el, el agente
    // solo veria "El cuerpo no cumple el esquema esperado" y no sabria que
    // corregir.
    const details = errorBody?.details;
    const detailSuffix =
      details && typeof details === "object"
        ? ` ${JSON.stringify(details)}`
        : "";

    if (response.status >= 400 && response.status < 500) {
      throw new ToolError(
        `${errorMessage} (HTTP ${response.status})${detailSuffix}`
      );
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

class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}
