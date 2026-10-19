// spec-058 (D8) — comparación de salida de programas.
//
// ATENCIÓN: el spec B calificará con `outputsMatch`. Cambiar estas reglas
// cambia notas futuras: no tocar sin pasar por un spec.
//
// Se conservan a propósito: espacios iniciales, líneas vacías intermedias,
// mayúsculas y formato numérico (`3.0` ≠ `3`).

export function normalizeOutput(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export function outputsMatch(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}
