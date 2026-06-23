import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResendConfirmationForm } from "@/components/auth/ResendConfirmationForm";

export const metadata: Metadata = { title: "Confirma tu correo" };

export default function RegistroConfirmarPage() {
  return (
    <AuthShell
      title="Revisa tu correo"
      subtitle="Te enviamos un enlace de confirmación. Haz clic en él para activar tu cuenta."
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
          Si no ves el correo, revisa tu carpeta de spam.
        </div>
        <ResendConfirmationForm />
      </div>
    </AuthShell>
  );
}
