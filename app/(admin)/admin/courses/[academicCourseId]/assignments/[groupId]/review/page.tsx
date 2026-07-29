import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { getAssignmentGroupById } from "@/lib/assignments";
import { getSubmissionsByGroup } from "@/lib/submissions";
import SubmissionList from "@/components/admin/SubmissionList";

export const metadata: Metadata = { title: "Revisión de envíos — Panel docente" };

interface PageProps {
  params: Promise<{ academicCourseId: string; groupId: string }>;
}

export default async function AssignmentReviewPage({ params }: PageProps) {
  const { academicCourseId, groupId } = await params;

  await requireAnyRole(["teacher", "admin"]);

  const group = await getAssignmentGroupById(groupId);
  if (!group) {
    notFound();
  }

  const submissions = await getSubmissionsByGroup(groupId);
  const pending = submissions.filter((s) => s.status === "submitted");
  const graded = submissions.filter((s) => s.status === "graded");
  const variantLabelByAssignmentId = Object.fromEntries(
    group.variants.map((variant) => [variant.id, variant.variant_label])
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Revisión — {group.title}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Envíos de las 3 variantes de esta evaluación.
          </p>
        </div>
        <Link
          href={`/admin/courses/${academicCourseId}/assignments/${groupId}`}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>
      </div>

      <SubmissionList
        academicCourseId={academicCourseId}
        groupId={groupId}
        pending={pending}
        graded={graded}
        variantLabelByAssignmentId={variantLabelByAssignmentId}
      />
    </div>
  );
}
