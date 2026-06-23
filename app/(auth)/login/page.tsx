import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

interface Props {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirectTo, error } = await searchParams;

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresa con tu cuenta para acceder al contenido."
    >
      {error === "auth_callback_failed" && (
        <div
          role="alert"
          className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          El enlace de confirmación no es válido o ha expirado.
        </div>
      )}
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
