import type { EngagementOpportunity } from "@/lib/grupo-investigacion";

interface EngagementOpportunitiesProps {
  opportunities: EngagementOpportunity[];
}

export function EngagementOpportunities({
  opportunities,
}: EngagementOpportunitiesProps) {
  return (
    <section className="px-4 md:px-6 lg:px-18 py-12 lg:py-16">
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Oportunidades de vinculación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
            >
              <span className="inline-block text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                {opp.tag}
              </span>

              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {opp.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {opp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
