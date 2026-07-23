import type { ResearchSeedbed } from "@/lib/grupo-investigacion";

interface ResearchSeedbedProps {
  seedbeds: ResearchSeedbed[];
}

export function ResearchSeedbeds({ seedbeds }: ResearchSeedbedProps) {
  return (
    <section className="px-6 lg:px-18 py-12 lg:py-16 border-b border-gray-200 dark:border-gray-700">
      <div className="w-full 2xl:max-w-7xl mx-auto flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Semilleros de investigación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seedbeds.map((seedbed, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {seedbed.name}
              </h3>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Líder
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {seedbed.leader}
                  </span>
                </div>

                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Días
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {seedbed.days}
                  </span>
                </div>

                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aula
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {seedbed.room}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
