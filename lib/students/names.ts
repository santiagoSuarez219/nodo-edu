// spec-062: formato y orden de nombres de estudiante. Módulo puro (sin
// imports de servidor) para poder usarlo también desde Client Components.

export interface StudentNameFields {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}

const COLLATOR = new Intl.Collator("es", { sensitivity: "base" });

// Listas: "Apellidos, Nombres". Sin apellido, solo el nombre; sin ninguna
// parte (perfil previo al backfill), cae a `full_name`.
export function formatStudentListName(p: StudentNameFields): string {
  const first = p.first_name?.trim() ?? "";
  const last = p.last_name?.trim() ?? "";
  if (first && last) return `${last}, ${first}`;
  if (first) return first;
  if (last) return last;
  return p.full_name?.trim() ?? "";
}

// Apellido, luego nombre; "base" para que "Álvarez" quede junto a "Alvarado"
// y no después de "Zapata". Los apellidos vacíos van al final.
export function compareStudentsBySurname(a: StudentNameFields, b: StudentNameFields): number {
  const lastA = a.last_name?.trim() ?? "";
  const lastB = b.last_name?.trim() ?? "";
  if ((lastA === "") !== (lastB === "")) return lastA === "" ? 1 : -1;

  const byLast = COLLATOR.compare(lastA, lastB);
  if (byLast !== 0) return byLast;

  const firstA = a.first_name?.trim() || a.full_name?.trim() || "";
  const firstB = b.first_name?.trim() || b.full_name?.trim() || "";
  return COLLATOR.compare(firstA, firstB);
}
