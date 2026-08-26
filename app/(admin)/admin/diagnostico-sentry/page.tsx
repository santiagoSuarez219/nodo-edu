import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";
import { SentryDiagnostics } from "./SentryDiagnostics";

export const metadata: Metadata = { title: "Diagnóstico de Sentry — Panel docente" };

// Página de verificación de la integración de Sentry en producción
// (spec-052, D6). Protegida por el gate de rol del middleware (ADMIN_PREFIXES
// incluye /admin) y, en defensa en profundidad, por requireAnyRole acá.
// Sin enlace en la navegación admin: se llega por URL directa.
export default async function SentryDiagnosticoPage() {
  await requireAnyRole(["teacher", "admin"]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Diagnóstico de Sentry
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Verifica que la integración de Sentry (spec-052) está reportando
          correctamente en producción.
        </p>
      </div>

      <SentryDiagnostics />
    </div>
  );
}
