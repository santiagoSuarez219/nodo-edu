"use client";

import { useEffect, useId, useRef, useState } from "react";

interface MermaidDiagramProps {
  source: string;
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function MermaidDiagram({ source }: MermaidDiagramProps) {
  const id = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && isDarkMode()
  );

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDarkMode()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: dark ? "dark" : "default",
          themeVariables: {
            fontFamily: '"JetBrains Mono", monospace',
          },
          securityLevel: "strict",
          suppressErrorRendering: true,
        });
        const { svg } = await mermaid.render(`mermaid-${id}`, source);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al renderizar el diagrama");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [source, dark, id]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
          No se pudo renderizar el diagrama Mermaid
        </p>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
        <pre className="mt-3 overflow-x-auto rounded bg-red-100 dark:bg-red-900/40 p-3 text-xs text-red-800 dark:text-red-300">
          {source}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
