import type { Metadata } from "next";
import { requireAnyRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Contenido del curso — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function CourseContentPage({ params }: Props) {
  await params;
  await requireAnyRole(["teacher", "admin"]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Placeholder */}
      <div className="rounded-[var(--radius-base)] border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 py-16 text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Próximamente
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aquí podrás gestionar el contenido y las lecciones publicadas de este curso.
        </p>
      </div>
    </div>
  );
}
