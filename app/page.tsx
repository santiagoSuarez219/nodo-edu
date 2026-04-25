export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6 py-24">
      <section className="w-full max-w-3xl rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 shadow-sm">
        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
          Educational Page
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Plataforma educativa de programación e IA
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
          Material académico para ingenieros de sistemas, electrónicos y de
          ciencias de datos. Cursos, artículos y, más adelante, evaluaciones y
          videos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Next.js 15
          </span>
          <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
            Tailwind CSS 4
          </span>
          <span className="inline-flex items-center rounded-md bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            JetBrains Mono
          </span>
        </div>
      </section>
    </main>
  );
}
