import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordResetConfirmForm } from "@/components/auth/PasswordResetConfirmForm";
import { createServerSupabaseClient } from "@/lib/auth/server";
import Link from "next/link";

export const metadata: Metadata = { title: "Nueva contraseña" };

interface Props {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    error?: string;
    error_description?: string;
  }>;
}

export default async function RecuperarPasswordConfirmarPage({
  searchParams,
}: Props) {
  const { token_hash, type, error } = await searchParams;

  if (error) {
    return (
      <AuthShell title="Enlace inválido">
        <div className="flex flex-col gap-5">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            El enlace de recuperación no es válido o ha expirado.
          </div>
          <Link
            href="/recuperar-password"
            className="text-center text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (token_hash && type === "recovery") {
    const supabase = await createServerSupabaseClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: "recovery",
    });

    if (verifyError) {
      return (
        <AuthShell title="Enlace inválido">
          <div className="flex flex-col gap-5">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              El enlace de recuperación no es válido o ha expirado.
            </div>
            <Link
              href="/recuperar-password"
              className="text-center text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </AuthShell>
      );
    }
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura para tu cuenta."
    >
      <PasswordResetConfirmForm />
    </AuthShell>
  );
}
