import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getStudentGradesOverview } from "@/lib/grades/overview";
import { GradesOverview } from "@/components/account/GradesOverview";

export const metadata: Metadata = { title: "Mis notas — Mi cuenta" };

export default async function MisNotasPage() {
  await requireUser("/cuenta/notas");
  const overview = await getStudentGradesOverview();

  return (
    <main className="flex-1 pt-6 pb-14 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Mis notas
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Consulta tus calificaciones de todos tus cursos en un solo lugar.
        </p>
      </div>

      <GradesOverview overview={overview} />
    </main>
  );
}
