import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getProfileWithStudent } from "@/lib/students/index";
import { AccountInfoCard } from "@/components/account/AccountInfoCard";
import { AccountForm } from "@/components/account/AccountForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const user = await requireUser("/cuenta");
  const data = await getProfileWithStudent(user.id);

  if (!data) notFound();

  return (
    <main className="flex-1 px-4 md:px-6 lg:px-18 pt-6 pb-14 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Mi cuenta
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestiona tu perfil e información académica.
        </p>
      </div>

      <AccountInfoCard email={user.email!} profile={data} />
      <AccountForm profile={data} student={data.student} />
      <ChangePasswordForm />
    </main>
  );
}
