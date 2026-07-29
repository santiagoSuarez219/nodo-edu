import type { ReactNode } from "react";
import type { CoursePresentation } from "@/lib/course-presentations";

interface Props {
  presentation: CoursePresentation;
  cta: ReactNode;
}

export function CoursePresentation({ presentation, cta }: Props) {
  return (
    <div className="min-h-screen text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 px-4 md:px-6 lg:px-16 py-8 lg:py-12 ">
        {/* Left: Main info */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            <span className="inline-block text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full">
              {presentation.program}
            </span>
            <span className="inline-block text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {presentation.level}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
            {presentation.name}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base leading-relaxed max-w-2xl">
            {presentation.desc}
          </p>

          <div className="flex flex-wrap gap-6 lg:gap-8 mt-2 text-sm">
            <MetaItem label="Créditos" value={String(presentation.credits)} />
            <MetaItem label="Modalidad" value={presentation.modality} />
            <MetaItem label="Horas semanales" value={presentation.weeklyHours} />
            <MetaItem
              label="Trabajo independiente"
              value={presentation.independentHours}
            />
          </div>
        </div>

        {/* Right: Enrollment card */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col gap-4 h-fit">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
            Matrícula abierta
          </span>

          {presentation.prereqs.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                Prerrequisito académico
              </p>
              <div className="space-y-2">
                {presentation.prereqs.map((prereq) => (
                  <p
                    key={prereq}
                    className="text-sm text-gray-900 dark:text-gray-100"
                  >
                    {prereq}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>{cta}</div>

        </div>
      </section>

      {/* Main content */}
      <main className="px-4 md:px-6 lg:px-16 py-8 lg:py-12 flex flex-col gap-12">
        {/* Syllabus */}
        <section className="flex flex-col gap-4 pb-8 lg:pb-12 ">
          <h2 className="text-xl lg:text-2xl font-bold">Temario</h2>
          <div className="flex flex-col gap-4">
            {presentation.syllabus.map((unit) => (
              <div
                key={`unit-${unit.n}`}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 lg:p-6"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                    {String(unit.n).padStart(2, "0")}
                  </span>
                  <h3 className="text-base lg:text-lg font-bold">
                    {unit.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {unit.week}
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {unit.topics.map((topic) => (
                    <li key={topic} className="ml-6 list-disc">
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="flex flex-col gap-4 pb-8 lg:pb-12 ">
          <h2 className="text-xl lg:text-2xl font-bold">
            Herramientas y tecnologías
          </h2>
          <div className="flex flex-wrap gap-2">
            {presentation.tools.map((tool) => (
              <span
                key={tool}
                className="text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-semibold px-3 py-2 rounded-lg"
              >
                {tool}
              </span>
            ))}
          </div>
        </section>

        {/* Two columns: Evaluation & Dates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 lg:pb-12 ">
          {/* Evaluation */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl lg:text-2xl font-bold">Evaluación</h2>
            <div className="space-y-4">
              {presentation.evaluation.map((item) => (
                <div key={item.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {item.name}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.week}
                      </p>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-xs lg:text-sm font-semibold flex-shrink-0">
                      {item.pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-700 dark:bg-blue-500 transition-all"
                      style={{ width: `${item.pct}%` }}
                      role="progressbar"
                      aria-valuenow={item.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.name}: ${item.pct}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Important Dates */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl lg:text-2xl font-bold">Fechas importantes</h2>
            <div className="space-y-1">
              {presentation.dates.map((item) => (
                <div
                  key={`${item.date}-${item.label}`}
                  className="flex gap-4 py-3  last:border-b-0 text-sm"
                >
                  <span className="font-bold text-blue-700 dark:text-blue-400 w-32 flex-shrink-0">
                    {item.date}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Conditions */}
        <section className="flex flex-col gap-4 pb-8 lg:pb-12 ">
          <h2 className="text-xl lg:text-2xl font-bold">
            Condiciones del curso
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 text-justify">
            {presentation.conditions.map((condition) => (
              <li key={condition} className="ml-6 list-disc leading-relaxed">
                {condition}
              </li>
            ))}
          </ul>
        </section>

        {/* Bibliography */}
        <section className="flex flex-col gap-4 pb-8 lg:pb-12">
          <h2 className="text-xl lg:text-2xl font-bold">Bibliografía</h2>
          <div className="space-y-3">
            {presentation.bibliography.map((book, idx) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {book.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {book.author}
                </p>
                {book.edition && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {book.edition}
                  </p>
                )}
              </div>
            ))}
          </div>
          <a
            href="https://www.itm.edu.co/biblioteca/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors inline-block mt-2"
          >
            Visita la biblioteca del ITM →
          </a>
        </section>



      </main>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
