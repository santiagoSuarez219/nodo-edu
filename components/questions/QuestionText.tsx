import { parseQuestionText } from "@/lib/questions/rich-text";

interface QuestionTextProps {
  text: string | null | undefined;
  className?: string;
}

/**
 * Interpreta backticks de Markdown en `stem` y `choice.body` (spec-043):
 * `código` y ```código``` se muestran monoespaciados, el resto queda literal.
 * Nunca emite `<pre>` ni `<div>` — se usa dentro de elementos inline
 * (`<p>`, `<span>`, `<label>`) en varias superficies, y ese markup sería
 * inválido ahí. Los bloques multilínea usan `<code className="block …">`
 * para lograr el mismo resultado visual sin romper el anidamiento HTML.
 */
export function QuestionText({ text, className }: QuestionTextProps) {
  const segments = parseQuestionText(text);
  if (segments.length === 0) return null;

  return (
    <span className={className}>
      {segments.map((segment, i) => {
        if (segment.kind === "text") {
          return <span key={i}>{segment.value}</span>;
        }
        if (segment.display === "block") {
          return (
            <code
              key={i}
              className="block whitespace-pre overflow-x-auto my-2 rounded-[var(--radius-xs)] border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-[0.9em] font-mono text-gray-800 dark:text-gray-200"
            >
              {segment.value}
            </code>
          );
        }
        return (
          <code
            key={i}
            className="rounded-[var(--radius-xs)] border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.9em] font-mono text-gray-800 dark:text-gray-200"
          >
            {segment.value}
          </code>
        );
      })}
    </span>
  );
}
