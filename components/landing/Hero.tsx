import Link from 'next/link';
import { ResumeState } from '@/lib/landing/types';
import { ResumeCard } from './ResumeCard';

interface HeroProps {
  resumeState: ResumeState;
}

export function Hero({ resumeState }: HeroProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
      <div>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Hola de nuevo 👋
        </p>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Seguí donde lo dejaste.
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Continúa aprendiendo con nuestros cursos de programación e inteligencia artificial,
          diseñados para ingeniero de sistemas, electrónicos y ciencias de datos.
        </p>

        <Link href={resumeState.href}>
          <button className="px-8 py-3 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
            Continuar cursando
          </button>
        </Link>
      </div>

      <div className="flex justify-center lg:justify-end ">
        <ResumeCard resumeState={resumeState} />
      </div>
    </section>
  );
}
