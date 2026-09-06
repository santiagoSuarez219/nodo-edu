// `class_sessions.session_date` es una columna `date` (sin hora, sin zona
// horaria) que llega al cliente como "YYYY-MM-DD". `new Date("2026-08-12")`
// la interpreta como medianoche UTC, que en zonas con offset negativo (como
// America/Bogota, UTC-5) se muestra como el día anterior. Se construye el
// `Date` con los componentes explícitos para evitar ese desfase.
function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// "12 de agosto de 2026" — para textos y `title`/aria-label completos.
export function formatSessionDateLong(dateStr: string): string {
  return parseDateOnly(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "12" / "ago" — para la cabecera de columna de dos líneas (D10).
export function formatSessionDateShort(dateStr: string): { day: string; month: string } {
  const date = parseDateOnly(dateStr);
  return {
    day: date.toLocaleDateString("es-CO", { day: "numeric" }),
    month: date.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""),
  };
}
