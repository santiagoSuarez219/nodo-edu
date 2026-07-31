export async function callStudentsApi(
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
    const errorMessage =
      apiError?.error && typeof apiError.error === "object"
        ? (apiError.error as Record<string, unknown>).message || "Error desconocido"
        : "Error de API";

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

class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}
