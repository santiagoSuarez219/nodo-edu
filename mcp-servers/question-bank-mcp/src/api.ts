export async function callQuestionBankApi(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const baseUrl = process.env.QUESTION_BANK_API_BASE_URL;
  const apiKey = process.env.QUESTION_BANK_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "QUESTION_BANK_API_BASE_URL y QUESTION_BANK_API_KEY deben estar configuradas"
    );
  }

  const url = `${baseUrl}${path}`;
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
    const errorMessage =
      apiError?.error && typeof apiError.error === "object"
        ? (apiError.error as Record<string, unknown>).message || "Error unknown"
        : "API error";

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
