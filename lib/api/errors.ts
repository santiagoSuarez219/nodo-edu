export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function apiError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

export function errorCodeToStatus(code: string): number {
  const statusMap: Record<string, number> = {
    bad_request: 400,
    unauthorized: 401,
    not_found: 404,
    method_not_allowed: 405,
    conflict: 409,
    validation_error: 422,
    configuration_error: 500,
    internal_error: 500,
  };

  return statusMap[code] ?? 500;
}

export function validationError(fieldErrors: Record<string, string[]>) {
  return apiError(
    "validation_error",
    "El cuerpo no cumple el esquema esperado.",
    { fieldErrors }
  );
}

export function notFoundError(message = "Recurso no encontrado") {
  return apiError("not_found", message);
}

export function conflictError(message: string) {
  return apiError("conflict", message);
}

export function unauthorizedError(message = "No autorizado") {
  return apiError("unauthorized", message);
}

export function badRequestError(message = "Solicitud malformada") {
  return apiError("bad_request", message);
}

export function configurationError(message: string) {
  return apiError("configuration_error", message);
}

export function internalError(message = "Error interno del servidor") {
  return apiError("internal_error", message);
}
