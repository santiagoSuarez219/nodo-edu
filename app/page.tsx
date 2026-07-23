import type { Metadata } from "next";
import { CourseGrid } from "@/components/home";
import { LandingFooter } from "@/components/landing";
import { FOOTER_LINKS } from "@/lib/landing";
import { getAllCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Mis cursos — nodo",
  description:
    "Accede a tus cursos de programación e inteligencia artificial en la plataforma nodo.",
};

export default async function Home() {
  const courses = await getAllCourses();

  return (
    <main className="bg-white dark:bg-gray-900 mt-19 pt-6 lg:pt-16 w-full max-w-7xl mx-auto">
      <div className="px-4 md:px-6 lg:px-18 pb-6 lg:pb-16">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Cursos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Explora los cursos disponibles y continúa tu aprendizaje.
          </p>
        </div>

        <div className="mt-8">
          <CourseGrid courses={courses} />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700" />

      <div className="px-4 md:px-6 lg:px-18 py-8">
        <LandingFooter links={FOOTER_LINKS} />
      </div>
    </main>
  );
}
