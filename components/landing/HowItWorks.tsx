import { RoadmapStep } from '@/lib/landing/types';

interface HowItWorksProps {
  steps: RoadmapStep[];
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <>
      <section className="py-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Cómo funciona
      </h2>

      <ol className="space-y-8" role="list">
        {steps.map((step) => (
          <li key={step.number} className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 dark:bg-blue-600 text-white font-bold">
                {String(step.number).padStart(2, '0')}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      </section>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-8" />
    </>
  );
}
