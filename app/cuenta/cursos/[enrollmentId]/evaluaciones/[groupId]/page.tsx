import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getEnrollmentById } from "@/lib/enrollments/index";
import { getOrAllocateVariant } from "@/lib/assignments";
import {
  createSubmission,
  getAnswersBySubmission,
  getSubmissionByStudent,
  getVariantQuestionDetails,
} from "@/lib/submissions";
import { AssignmentPlayer } from "@/components/student/AssignmentPlayer";

export const metadata: Metadata = { title: "Resolviendo evaluación — Mis cursos" };

interface Props {
  params: Promise<{ enrollmentId: string; groupId: string }>;
}

export default async function EvaluacionPlayerPage({ params }: Props) {
  const { enrollmentId, groupId } = await params;
  const user = await requireUser(`/cuenta/cursos/${enrollmentId}/evaluaciones/${groupId}`);

  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.student_id !== user.id || enrollment.status !== "active") {
    notFound();
  }

  // Sortea (o recupera) la variante asignada — nunca es una decisión del cliente.
  const allocation = await getOrAllocateVariant(enrollmentId, groupId);
  if (!allocation) notFound();

  const lastSubmission = await getSubmissionByStudent(groupId, enrollmentId);
  if (lastSubmission && lastSubmission.status !== "in_progress") {
    redirect(`/cuenta/cursos/${enrollmentId}/evaluaciones/${groupId}/resultados`);
  }

  // Config del grupo (título, descripción, límite de tiempo): consulta directa,
  // no getStudentAssignment — evita releer la allocation que getOrAllocateVariant
  // ya resolvió arriba (variant/questions de ese resultado no se usan aquí).
  const supabase = await createServerSupabaseClient();
  const { data: group } = await supabase
    .from("assignment_variant_groups")
    .select("title, description, time_limit_minutes")
    .eq("id", groupId)
    .single();
  if (!group) notFound();

  const created = await createSubmission(allocation.variant.id, groupId, enrollmentId);
  if (!created.ok) {
    return (
      <main className="flex-1 pt-6 pb-14">
        <p className="text-sm text-gray-500 dark:text-gray-400">{created.error}</p>
      </main>
    );
  }

  // Usa la fila devuelta por createSubmission directamente (nueva o recuperada)
  // en vez de releerla por variant_group_id + enrollment_id: ese segundo lookup
  // justo después del insert es innecesario y es el punto más propenso a una
  // carrera de lectura-tras-escritura.
  const submission = created.data;
  const answers = await getAnswersBySubmission(submission.id);
  const questions = await getVariantQuestionDetails(allocation.variant.id, enrollmentId, groupId);

  return (
    <main className="flex-1 pt-6 pb-14 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {group.title}
        </h1>
        {group.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
        )}
      </div>

      <AssignmentPlayer
        questions={questions}
        submission={submission}
        initialAnswers={answers}
        enrollmentId={enrollmentId}
        groupId={groupId}
        timeLimitMinutes={group.time_limit_minutes}
      />
    </main>
  );
}
