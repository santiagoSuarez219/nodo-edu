import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getCoursePresentationBySlug } from "@/lib/course-presentations";
import { CoursePresentation } from "@/components/course-presentations/CoursePresentation";

interface Props {
  params: Promise<{ courseSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params;
  const presentation = await getCoursePresentationBySlug(courseSlug);

  if (!presentation) {
    return { title: "Presentación no encontrada" };
  }

  return {
    title: `${presentation.name} — Presentación`,
    description: presentation.desc,
  };
}

export default async function CoursePresentationPage({ params }: Props) {
  const { courseSlug } = await params;

  await requireUser(`/${courseSlug}/presentacion`);

  const presentation = await getCoursePresentationBySlug(courseSlug);
  if (!presentation) notFound();

  return (
    <main className="flex-1">
      <CoursePresentation
        presentation={presentation}
        cta={
          <Link
            href="/cuenta/cursos"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Matricular este curso
          </Link>
        }
      />
    </main>
  );
}
