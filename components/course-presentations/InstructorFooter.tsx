import type { Instructor } from "@/lib/course-presentations";

interface Props {
  instructor: Instructor;
}

export function InstructorFooter({ instructor }: Props) {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-16 py-12 lg:py-16">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Docente
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Conoce al profesional responsable de este curso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {instructor.name}
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Formación académica
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
                    {instructor.credentials}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Departamento
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">
                    {instructor.department}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Grupo de investigación
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">
                    {instructor.researchGroup}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Correo de contacto
                  </p>
                  <a
                    href={`mailto:${instructor.email}`}
                    className="text-blue-700 dark:text-blue-400 hover:underline text-sm font-semibold"
                  >
                    {instructor.email}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Oficina
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 text-sm">
                    {instructor.office}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
