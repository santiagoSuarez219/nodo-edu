import { timingSafeEqual } from "crypto";

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export async function authenticateServiceRequest(
  req: Request
): Promise<void> {
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = process.env.QUESTION_BANK_API_KEY;

  if (!expectedKey) {
    throw new Error("QUESTION_BANK_API_KEY no configurada");
  }

  if (!apiKey) {
    throw new AuthenticationError("API key no proporcionada");
  }

  const apiKeyBuffer = Buffer.from(apiKey);
  const expectedKeyBuffer = Buffer.from(expectedKey);

  if (apiKeyBuffer.length !== expectedKeyBuffer.length) {
    const paddedApiKey = Buffer.alloc(expectedKeyBuffer.length, 0);
    const paddedExpectedKey = Buffer.alloc(expectedKeyBuffer.length, 0);
    apiKeyBuffer.copy(paddedApiKey);
    expectedKeyBuffer.copy(paddedExpectedKey);

    try {
      timingSafeEqual(paddedApiKey, paddedExpectedKey);
    } catch {
      // Intencionalmente fallar
    }

    throw new AuthenticationError("API key inválida");
  }

  try {
    timingSafeEqual(apiKeyBuffer, expectedKeyBuffer);
  } catch {
    throw new AuthenticationError("API key inválida");
  }
}
