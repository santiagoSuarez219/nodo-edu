export function OtherSeedbedsCta() {
  return (
    <section className="px-4 md:px-6 lg:px-18 py-12 lg:py-16">
      <a
        href="https://www.itm.edu.co/wp-content/uploads/Investigacion/Semilleros-F-Ingenierias_-2025-2.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-between items-center gap-6 p-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
      >
        <div>
          <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-1">
            Explorá otros semilleros de la institución
          </h2>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            Descarga la guía de semilleros de investigación de Ingeniería (PDF).
          </p>
        </div>
        <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
          →
        </span>
      </a>
    </section>
  );
}
