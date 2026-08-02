/**
 * Preferencia del docente de plegar/desplegar la clave de respuestas en la
 * vista docente de la lección (spec-038).
 *
 * Vive en una cookie (no en `localStorage`) para que el server component pueda
 * leerla y renderizar el bloque ya plegado en el HTML inicial, sin parpadeo
 * frente a un grupo proyectado. Este módulo no importa `next/headers` a
 * propósito: lo consumen tanto el cliente (para escribir la cookie) como el
 * server (para leerla).
 */

export const ANSWER_KEY_COOKIE_NAME = "nodo_teacher_answer_key";

/**
 * A diferencia de `attendanceGroupCookieName` (un año: el valor guardado ahí
 * es inocuo), aquí el estado persistido es el riesgoso — "desplegado". Un
 * `max-age` corto asegura que decaiga solo hacia el estado seguro y que una
 * máquina de aula compartida no amanezca con la clave de respuestas
 * desplegada por lo que hizo otra persona el día anterior.
 */
export const ANSWER_KEY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

/**
 * El único valor que la cookie llega a tener es `"1"` (desplegado): al plegar
 * se expira la cookie en vez de escribir `"0"`, así que ausencia y "plegado"
 * son el mismo estado. Cualquier valor que no sea exactamente `"1"` — ausente,
 * `"0"`, basura — resuelve al estado seguro.
 */
export function resolveStoredAnswerKeyExpanded(
  storedValue: string | undefined
): boolean {
  return storedValue === "1";
}
