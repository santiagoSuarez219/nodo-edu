import type { Metadata } from "next";
import Link from "next/link";
import { requireAnyRole } from "@/lib/auth/session";
import { getAssignmentGroupById } from "@/lib/assignments";
import { notFound } from "next/navigation";
import AssignmentGroupDetail from "@/components/admin/AssignmentGroupDetail";
import PublishAssignmentGroupButton from "@/components/admin/PublishAssignmentGroupButton";
import VariantAllocationTable from "@/components/admin/VariantAllocationTable";

export const metadata: Metadata = { title: "Detalle de evaluación — Panel docente" };

interface PageProps {
  params: Promise<{ academicCourseId: string; groupId: string }>;
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { academicCourseId, groupId } = await params;

  await requireAnyRole(["teacher", "admin"]);
  const group = await getAssignmentGroupById(groupId);

  if (!group) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {group.title}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {group.description || "Sin descripción"}
          </p>
        </div>
        <Link
          href={`/admin/courses/${academicCourseId}/assignments`}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>
      </div>

      <div className="flex gap-4">
        <PublishAssignmentGroupButton groupId={groupId} isPublished={group.is_published} />
        <Link
          href={`/admin/courses/${academicCourseId}/assignments/${groupId}/review`}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Revisar envíos
        </Link>
        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
          {group.is_published ? (
            <>
              <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Publicada
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 112.5 6.5a.75.75 0 001.5 0A7.5 7.5 0 1114.89 13.477l1.414 1.415a.75.75 0 11-1.06 1.06l-1.414-1.414z" clipRule="evenodd" />
              </svg>
              Borrador
            </>
          )}
        </div>
      </div>

      <AssignmentGroupDetail group={group} courseId={academicCourseId} groupId={groupId} />

      <div className="mt-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reparto de variantes</h2>
        <VariantAllocationTable groupId={groupId} />
      </div>
    </div>
  );
}
