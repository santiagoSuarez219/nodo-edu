import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessonBySlug } from "@/lib/courses";
import { hasCourseAccess } from "@/lib/enrollments/access";
import { getTeacherLessonNotes } from "@/lib/courses/teacher-notes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MdxContent } from "@/components/mdx/MdxContent";

interface TeacherLessonNotesPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TeacherLessonNotesPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const ctx = await getLessonBySlug(courseSlug, lessonSlug);
  if (!ctx) return { title: "Apuntes no encontrados" };
  return { title: `Apuntes de clase — ${ctx.lesson.title}` };
}

export default async function TeacherLessonNotesPage({
  params,
}: TeacherLessonNotesPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const ctx = await getLessonBySlug(courseSlug, lessonSlug);
  if (!ctx) notFound();

  const { lesson } = ctx;

  // El layout del segmento [lessonSlug] ya exige acceso al curso
  // (requireCourseAccess: anónimo → login, sin matrícula → /cuenta/cursos).
  // Aquí falta la comprobación específica de esta ruta: es exclusiva de
  // owner/admin — un estudiante matriculado (reason "enrolled") tiene
  // acceso a la lección pero no a esta página, y recibe 404 en vez de un
  // aviso de "sin acceso" que confirmaría que la ruta existe.
  const access = await hasCourseAccess(courseSlug);
  if (!access.ok || (access.reason !== "owner" && access.reason !== "admin")) {
    notFound();
  }

  const notes = lesson.articleSlug
    ? await getTeacherLessonNotes(courseSlug, lesson.articleSlug)
    : null;
  if (notes === null) notFound();

  return (
    <div>
      <Link
        href={`/${courseSlug}/${lessonSlug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand dark:text-blue-300 hover:underline"
      >
        ← Volver a la lección
      </Link>

      <div className="mt-6 mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-softer dark:bg-blue-900/20 text-brand dark:text-blue-300">
          Apuntes de clase
        </span>
        <h1 className="mt-3 text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {lesson.title}
        </h1>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Solo tú ves esta página — los estudiantes no tienen acceso.
        </p>
      </div>

      <ErrorBoundary
        title="Los apuntes de clase no están disponibles"
        description="Ocurrió un error inesperado. Intenta de nuevo."
      >
        <MdxContent source={notes} />
      </ErrorBoundary>
    </div>
  );
}
