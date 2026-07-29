import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate con el código de tu curso para acceder al contenido de inmediato."
    >
      <SignUpForm />
    </AuthShell>
  );
}
