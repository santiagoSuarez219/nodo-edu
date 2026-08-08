import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

interface Props {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  // spec-045: un usuario ya autenticado no debe ver el formulario de login;
  // se redirige siempre a "/" (no a `redirectTo`, por decisión explícita del
  // usuario — ver "No incluye" del spec).
  const user = await getCurrentUser();
  if (user) redirect("/");

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
