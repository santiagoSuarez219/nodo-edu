import type { ReactNode } from "react";

type CalloutTipo = "nota" | "advertencia" | "peligro" | "exito";

interface CalloutProps {
  tipo?: CalloutTipo;
  children: ReactNode;
}

const estilosPorTipo: Record<CalloutTipo, string> = {
  nota: "border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
  advertencia:
    "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300",
  peligro:
    "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300",
  exito:
    "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300",
};

const etiquetaPorTipo: Record<CalloutTipo, string> = {
  nota: "Nota",
  advertencia: "Advertencia",
  peligro: "Peligro",
  exito: "Éxito",
};

export function Callout({ tipo = "nota", children }: CalloutProps) {
  return (
    <div
      role="note"
      className={`my-6 rounded-lg border-l-4 px-4 py-3 ${estilosPorTipo[tipo]}`}
    >
      <p className="mb-1 text-sm font-semibold">{etiquetaPorTipo[tipo]}</p>
      <div className="text-sm leading-6 [&>p]:my-0">{children}</div>
    </div>
  );
}
