import Link from "next/link";

export default function LessonNotFound() {
  return (
    <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center shadow-sm">
      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Lección no encontrada
      </h1>
      <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
        La lección que buscas no existe en este curso.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 text-sm font-bold text-white transition-colors"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
