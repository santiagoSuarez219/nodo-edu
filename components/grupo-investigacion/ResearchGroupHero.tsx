import type { ResearchGroup } from "@/lib/grupo-investigacion";

interface ResearchGroupHeroProps {
  group: ResearchGroup;
}

export function ResearchGroupHero({ group }: ResearchGroupHeroProps) {
  return (
    <section className="px-4 md:px-6 lg:px-18 py-12 lg:py-16 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-6">
        <span className="inline-flex px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wide w-fit">
          Grupo de Investigación
        </span>

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {group.name}
        </h1>

        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
          {group.desc}
        </p>

        <div className="mt-4 flex gap-4 p-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold text-lg">
              {group.leader.initial}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Líder del grupo
            </span>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {group.leader.name}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1 whitespace-nowrap">
                {group.leader.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
