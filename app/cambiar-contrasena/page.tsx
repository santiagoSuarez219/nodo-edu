import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Cambiar contraseña",
  robots: { index: false, follow: false },
};

// spec-051 (Fase 4): destino del cambio forzado. middleware.ts redirige aquí
// a cualquier usuario autenticado con `app_metadata.must_change_password`
// (D2/D3) — normalmente, alguien cuyo docente restableció su contraseña
// (Fase 3) con una genérica. requireUser() no distingue ese caso: cualquier
// sesión válida puede abrir esta página y cambiar su contraseña aquí, sea o
// no la marca la razón por la que llegó — es el mismo ChangePasswordForm que
// usa /cuenta.
export default async function CambiarContrasenaPage() {
  await requireUser("/cambiar-contrasena");

  return (
    <main className="flex-1 px-4 md:px-6 lg:px-18 pt-6 pb-14 flex flex-col items-center">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Cambia tu contraseña para continuar
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tu docente restableció tu contraseña con una genérica. Antes de
            seguir usando la plataforma, elige una nueva que solo tú
            conozcas.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </main>
  );
}
