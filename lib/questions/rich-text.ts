/**
 * Interpreta la convención de backticks de Markdown dentro de `stem` y
 * `choice.body` de las preguntas del banco (spec-043). Deliberadamente NO es
 * un parser de Markdown genérico: solo reconoce código, todo lo demás queda
 * literal. Sin dependencias — reutilizable tanto en Server como en Client
 * Components.
 */

export type TextSegment =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string; display: "inline" | "block"; lang: string | null };

const TRIPLE_FENCE = /```([\s\S]*?)```/g;
const SINGLE_BACKTICK = /`([^`\n]+)`/g;
const LANG_LINE = /^([a-zA-Z0-9_+-]*)\n([\s\S]*)$/;

/**
 * Tokeniza un texto en segmentos de texto literal y código. Reconoce, en
 * este orden:
 * 1. Cercas de triple backtick ```lang?\n…\n``` — bloque si el contenido
 *    tiene salto de línea, inline si es de una sola línea.
 * 2. Backtick simple `…` — siempre inline.
 * 3. El resto, literal.
 *
 * Un backtick suelto sin cierre se conserva tal cual dentro de un segmento
 * de texto (no lanza, no oculta el resto del contenido).
 */
export function parseQuestionText(text: string | null | undefined): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];

  // Fase A: separar por cercas de triple backtick, dejando el resto como
  // texto crudo para la fase B (que resuelve los backticks simples).
  let lastIndex = 0;
  TRIPLE_FENCE.lastIndex = 0;
  let match: RegExpExecArray | null;
  const rawParts: Array<{ kind: "raw"; value: string } | TextSegment> = [];

  while ((match = TRIPLE_FENCE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      rawParts.push({ kind: "raw", value: text.slice(lastIndex, match.index) });
    }
    const rawContent = match[1];

    if (!rawContent.includes("\n")) {
      // Cerca de triple backtick en una sola línea (```int```): no hay forma
      // de distinguir un "lenguaje" de un cuerpo, así que se trata como
      // código inline con el contenido completo, igual que el backtick simple.
      rawParts.push({ kind: "code", value: rawContent.trim(), display: "inline", lang: null });
    } else {
      // Multilínea: la primera línea es el lenguaje (puede ser vacía) y el
      // resto es el cuerpo del bloque.
      const langLineMatch = LANG_LINE.exec(rawContent);
      const lang = langLineMatch ? langLineMatch[1] || null : null;
      const body = langLineMatch ? langLineMatch[2] : rawContent;
      rawParts.push({ kind: "code", value: body.replace(/\n$/, ""), display: "block", lang });
    }
    lastIndex = TRIPLE_FENCE.lastIndex;
  }
  if (lastIndex < text.length) {
    rawParts.push({ kind: "raw", value: text.slice(lastIndex) });
  }
  if (rawParts.length === 0) {
    rawParts.push({ kind: "raw", value: text });
  }

  // Fase B: dentro de cada tramo "raw" (texto fuera de cercas triples),
  // resolver los backticks simples.
  for (const part of rawParts) {
    if (part.kind !== "raw") {
      segments.push(part);
      continue;
    }
    const raw = part.value;
    if (raw === "") continue;

    let rawLastIndex = 0;
    SINGLE_BACKTICK.lastIndex = 0;
    let inlineMatch: RegExpExecArray | null;
    let producedAny = false;

    while ((inlineMatch = SINGLE_BACKTICK.exec(raw)) !== null) {
      producedAny = true;
      if (inlineMatch.index > rawLastIndex) {
        segments.push({ kind: "text", value: raw.slice(rawLastIndex, inlineMatch.index) });
      }
      segments.push({ kind: "code", value: inlineMatch[1], display: "inline", lang: null });
      rawLastIndex = SINGLE_BACKTICK.lastIndex;
    }
    if (rawLastIndex < raw.length) {
      segments.push({ kind: "text", value: raw.slice(rawLastIndex) });
    } else if (!producedAny) {
      segments.push({ kind: "text", value: raw });
    }
  }

  return segments;
}
