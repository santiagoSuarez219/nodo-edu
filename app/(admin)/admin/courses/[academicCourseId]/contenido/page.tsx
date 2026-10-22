import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAnyRole } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/auth/server";
import { getAcademicCourseById } from "@/lib/academic-courses/index";
import { getCourseBySlug } from "@/lib/courses";
import { listServiceTaughtLessons } from "@/lib/courses/service";
import { TaughtLessonsTable } from "@/components/admin/TaughtLessonsTable";

export const metadata: Metadata = { title: "Contenido del curso — Panel docente" };

interface Props {
  params: Promise<{ academicCourseId: string }>;
}

export default async function CourseContentPage({ params }: Props) {
  await requireAnyRole(["teacher", "admin"]);
  const { academicCourseId } = await params;

  // El layout ya valida que el grupo exista y sea visible para el usuario
  // (RLS); aquí se repite la lectura (cacheada) para obtener el course_slug.
  const academicCourse = await getAcademicCourseById(academicCourseId);
  if (!academicCourse) notFound();

  const course = academicCourse.course_slug
    ? await getCourseBySlug(academicCourse.course_slug)
    : null;

  if (!course) {
    return (
      <div className="rounded-[var(--radius-base)] border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 py-16 text-center max-w-7xl">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Este curso no tiene contenido asociado
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Asocia un contenido al grupo para marcar las lecciones vistas en clase.{" "}
          <Link
            href={`/admin/courses/${academicCourseId}/edit`}
            className="underline underline-offset-2"
          >
            Editar curso
          </Link>
        </p>
      </div>
    );
  }

  // La autorización ya está dada (layout + RLS de academic_courses); el
  // listado compuesto reutiliza el de la API, que lee con service_role.
  const [listing, { count }] = await Promise.all([
    listServiceTaughtLessons(course, academicCourseId),
    (async () => {
      const supabase = await createServerSupabaseClient();
      return supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("academic_course_id", academicCourseId)
        .eq("status", "active");
    })(),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <TaughtLessonsTable
        academicCourseId={academicCourseId}
        lessons={listing.lessons}
        orphanTaughtSlugs={listing.meta.orphan_taught_slugs}
        activeStudentCount={count ?? 0}
      />
    </div>
  );
}
