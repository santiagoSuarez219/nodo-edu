import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getEnrollmentById } from "@/lib/enrollments/index";
import { getStudentAssignment } from "@/lib/assignments";
import { getSubmissionByStudent, getVariantQuestionDetails } from "@/lib/submissions";
import { startNewAttemptAction } from "@/lib/submissions/actions";
import { SubmissionResult } from "@/components/student/SubmissionResult";

export const metadata: Metadata = { title: "Resultados — Mis cursos" };

interface Props {
  params: Promise<{ enrollmentId: string; groupId: string }>;
}

export default async function EvaluacionResultadosPage({ params }: Props) {
  const { enrollmentId, groupId } = await params;
  const user = await requireUser(
    `/cuenta/cursos/${enrollmentId}/evaluaciones/${groupId}/resultados`
  );

  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.student_id !== user.id || enrollment.status !== "active") {
    notFound();
  }

  const assignment = await getStudentAssignment(groupId, enrollmentId);
  if (!assignment) notFound();

  const submission = await getSubmissionByStudent(groupId, enrollmentId);
  if (!submission) notFound();

  if (submission.status === "in_progress") {
    redirect(`/cuenta/cursos/${enrollmentId}/evaluaciones/${groupId}`);
  }

  const questions = await getVariantQuestionDetails(assignment.variant.id, enrollmentId, groupId);
  const canRetry = submission.attempt_number < assignment.group.max_attempts;

  return (
    <main className="flex-1 pt-6 pb-14 flex flex-col gap-6">
      <div>
        <Link
          href={`/cuenta/cursos/${enrollmentId}/evaluaciones`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Evaluaciones
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {assignment.group.title}
        </h1>
      </div>

      <SubmissionResult
        submission={submission}
        questions={questions}
        totalPoints={assignment.total_points}
      />

      {canRetry && (
        <form action={startNewAttemptAction.bind(null, groupId, enrollmentId)}>
          <button
            type="submit"
            className="self-start rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 transition-colors"
          >
            Iniciar nuevo intento
          </button>
        </form>
      )}
    </main>
  );
}
