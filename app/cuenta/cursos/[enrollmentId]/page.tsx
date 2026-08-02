import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getEnrollmentById } from "@/lib/enrollments/index";
import { getGradesByEnrollment } from "@/lib/grades/index";
import { getCourseBySlug, countProgressibleLessons } from "@/lib/courses";
import { getDisabledLessonSlugs } from "@/lib/courses/availability";
import { getCourseProgress } from "@/lib/progress";
import { getSelfAssessmentCourseSummary } from "@/lib/self-assessment";
import { EnrollmentDetail } from "@/components/account/EnrollmentDetail";
import { SelfAssessmentSummaryCard } from "@/components/account/SelfAssessmentSummaryCard";

export const metadata: Metadata = { title: "Detalle de matrícula — Mis cursos" };

interface Props {
  params: Promise<{ enrollmentId: string }>;
}

export default async function EnrollmentDetailPage({ params }: Props) {
  const { enrollmentId } = await params;
  const user = await requireUser("/cuenta/cursos");

  const [enrollment, gradesData] = await Promise.all([
    getEnrollmentById(enrollmentId),
    getGradesByEnrollment(enrollmentId),
  ]);

  if (!enrollment || enrollment.student_id !== user.id) notFound();

  const course = enrollment.academic_course.course_slug
    ? await getCourseBySlug(enrollment.academic_course.course_slug)
    : null;

  const [progressData, disabledResult] = await Promise.all([
    course ? getCourseProgress(enrollment.academic_course.course_slug!) : Promise.resolve([]),
    course
      ? getDisabledLessonSlugs(enrollment.academic_course.course_slug!)
      : Promise.resolve({ status: "ok" as const, slugs: new Set<string>() }),
  ]);
  // spec-039 (D5, D6): excluir lecciones deshabilitadas de ambos lados del
  // conteo; ante un fallo de infraestructura, degrada a "ninguna
  // deshabilitada" (esta pantalla es de lectura, no el gate real).
  const disabledLessonSlugs =
    disabledResult.status === "ok" ? disabledResult.slugs : new Set<string>();
  const progressibleLessons = course
    ? countProgressibleLessons(course, disabledLessonSlugs)
    : [];
  const progressibleSlugs = new Set(progressibleLessons.map((l) => l.slug));

  // También corrige que `totalCount` usaba `course.lessons.length`, que
  // incluía guías (sin autoevaluación ni progreso rastreado) en el
  // denominador — entra en scope porque el conteo se toca de todos modos.
  const completedCount = progressData.filter(
    (p) => p.completed_at !== null && progressibleSlugs.has(p.lesson_slug)
  ).length;
  const totalCount = progressibleLessons.length;

  const selfAssessmentSummary = course
    ? await getSelfAssessmentCourseSummary(enrollment.academic_course.course_slug!)
    : null;

  return (
    <main className="flex-1 pt-6 pb-14 flex flex-col gap-6">
      <div>
        <Link
          href="/cuenta/cursos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mis cursos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {enrollment.academic_course.name}
        </h1>
        {totalCount > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {completedCount} de {totalCount} lecciones completadas
          </p>
        )}
      </div>

      <EnrollmentDetail enrollment={enrollment} gradesData={gradesData} />

      {selfAssessmentSummary && (
        <SelfAssessmentSummaryCard summary={selfAssessmentSummary} />
      )}
    </main>
  );
}
