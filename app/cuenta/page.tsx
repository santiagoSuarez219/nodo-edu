import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getProfileWithStudent } from "@/lib/students/index";
import { AccountInfoCard } from "@/components/account/AccountInfoCard";
import { AccountForm } from "@/components/account/AccountForm";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const user = await requireUser("/cuenta");
  const data = await getProfileWithStudent(user.id);

  if (!data) notFound();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-6 py-10 lg:pt-24 lg:pb-14 flex flex-col gap-6">
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
    </main>
  );
}
