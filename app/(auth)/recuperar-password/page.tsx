import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordResetRequestForm } from "@/components/auth/PasswordResetRequestForm";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPasswordPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."
    >
      <PasswordResetRequestForm />
    </AuthShell>
  );
}
