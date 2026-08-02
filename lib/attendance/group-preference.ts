/**
 * Preferencia de grupo del docente en el control de asistencia de la lección.
 *
 * Vive en una cookie (no en `localStorage`) para que el server component pueda
 * leerla y renderizar el grupo correcto ya en el HTML inicial — ver DEBT-023.
 * Este módulo no importa `next/headers` a propósito: lo consumen tanto el
 * cliente (para escribir la cookie) como el server (para leerla).
 */

/**
 * `document.cookie` no admite `:` en el nombre (no es un token válido según
 * RFC 6265), así que se usa `_` como separador. `courseSlug` es kebab-case.
 */
export function attendanceGroupCookieName(courseSlug: string): string {
  return `nodo_teacher_attendance_group_${courseSlug.replace(/-/g, "_")}`;
}

/**
 * Resuelve el grupo guardado contra los grupos que el docente realmente tiene
 * hoy. Devuelve `null` si la cookie no existe o apunta a un grupo que ya no
 * está en la lista (curso desactivado, docente removido del grupo), para que
 * la UI caiga al primer grupo disponible.
 */
export function resolveStoredAttendanceGroup(
  storedId: string | undefined,
  courseIds: readonly string[]
): string | null {
  if (!storedId) return null;
  return courseIds.includes(storedId) ? storedId : null;
}
