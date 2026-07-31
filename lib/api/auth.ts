import { timingSafeEqual } from "crypto";

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function authenticateServiceRequest(
  req: Request,
  envVarName: string = "QUESTION_BANK_API_KEY"
): Promise<void> {
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env[envVarName];

  if (!expectedKey) {
    throw new Error(`${envVarName} no configurada`);
  }

  if (!apiKey) {
    throw new AuthenticationError("API key no proporcionada");
  }

  const apiKeyBuffer = Buffer.from(apiKey);
  const expectedKeyBuffer = Buffer.from(expectedKey);

  // Comparar SIEMPRE con timingSafeEqual sobre buffers de la MISMA longitud
  // (rellenando con ceros si difieren) para no filtrar la longitud real de
  // la clave por early-return, y comprobar el resultado booleano: antes se
  // descartaba, lo que autenticaba cualquier clave de longitud coincidente.
  const length = Math.max(apiKeyBuffer.length, expectedKeyBuffer.length);
  const paddedApiKey = Buffer.alloc(length, 0);
  const paddedExpectedKey = Buffer.alloc(length, 0);
  apiKeyBuffer.copy(paddedApiKey);
  expectedKeyBuffer.copy(paddedExpectedKey);

  const lengthsMatch = apiKeyBuffer.length === expectedKeyBuffer.length;
  const bytesMatch = timingSafeEqual(paddedApiKey, paddedExpectedKey);

  if (!lengthsMatch || !bytesMatch) {
    throw new AuthenticationError("API key inválida");
  }
}
