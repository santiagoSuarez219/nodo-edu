import { reportTransportError } from "@/lib/observability/report-transport-error";

// spec-053: distingue un fallo de *transporte* (la respuesta a un Server
// Action nunca llegó, o llegó pero no como el payload RSC esperado) de un
// fallo de negocio o de render real.
//
// Next.js no exporta ningún tipo ni código para estos errores — el runtime
// cliente lanza un `Error` genérico con un mensaje fijo. La detección es por
// coincidencia de mensaje, deliberadamente centralizada en este único módulo
// (D2): si un cambio de wording en una versión mayor de Next la rompe, solo
// hay un lugar que corregir. Mitigación adicional: quien llama a esta función
// debe re-lanzar cuando devuelve `false`, así que un falso negativo aquí
// degrada al comportamiento de hoy (escala al error boundary), nunca a un
// error tragado en silencio.
//
// Los dos mensajes cubiertos son los observados en producción esta semana
// (issues de Sentry NODO-EDU-3, NODO-EDU-4, NODO-EDU-5):
// - "An unexpected response was received from the server." — llegó una
//   respuesta HTTP que Next no pudo parsear como RSC (el caso de este spec:
//   el gate de Auth devuelve 503 text/html sobre el POST del Server Action).
// - "Failed to fetch" / "Load failed" — no llegó ninguna respuesta (caída de
//   red, Chrome y Safari respectivamente).
const TRANSPORT_ERROR_MESSAGES = [
  "An unexpected response was received from the server",
  "Failed to fetch",
  "Load failed",
];

export function isServerActionTransportError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return TRANSPORT_ERROR_MESSAGES.some((message) =>
    error.message.includes(message)
  );
}

// Copy compartido en español — evita que cada uno de los call sites
// blindados invente su propio texto para el mismo fallo.
export const SERVER_ACTION_TRANSPORT_ERROR_MESSAGE =
  "No pudimos comunicarnos con el servidor. Revisa tu conexión e inténtalo de nuevo en un momento.";

// spec-053 (D5): adaptador para las Server Actions consumidas con
// `useActionState`. Esa API no admite un `try/catch` en el call site —
// `formAction` es el propio action, no una llamada que el componente pueda
// envolver a mano — así que el `catch` se mueve aquí, alrededor de la acción
// original, conservando su firma de dos argumentos (`prevState`, `formData`)
// y su tipo de retorno. `redirect()` de Next lanza un error interno con
// `digest` que empieza por "NEXT_REDIRECT": no coincide con ningún mensaje de
// `isServerActionTransportError`, así que sigue propagándose sin tocar (lo
// verifica `TC-053-011`).
export function withTransportFallback<State extends { ok: boolean }>(
  action: (prevState: State, formData: FormData) => Promise<State>,
  actionName: string,
  toTransportErrorState: (message: string) => State
) {
  return async (prevState: State, formData: FormData): Promise<State> => {
    try {
      return await action(prevState, formData);
    } catch (error) {
      if (!isServerActionTransportError(error)) throw error;
      reportTransportError(error, actionName);
      return toTransportErrorState(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
    }
  };
}
