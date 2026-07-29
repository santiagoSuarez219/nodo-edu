import type { ResearchLine } from "@/lib/grupo-investigacion";

interface ResearchLinesProps {
  lines: ResearchLine[];
}

export function ResearchLines({ lines }: ResearchLinesProps) {
  return (
    <section className="px-4 md:px-6 lg:px-18 py-12 lg:py-16 ">
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Líneas de investigación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {line.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {line.desc}
              </p>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Líder
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {line.leader}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Investigadores
                </span>
                <div className="flex flex-wrap gap-2">
                  {line.researchers.map((researcher, ridx) => (
                    <span
                      key={ridx}
                      className="text-xs px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {researcher}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Proyectos
                </span>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                  {line.projects.map((project, pidx) => (
                    <li key={pidx}>{project}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
