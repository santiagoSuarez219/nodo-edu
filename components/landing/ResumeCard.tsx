import Link from 'next/link';
import { ResumeState } from '@/lib/landing/types';
import { ProgressBar } from './ProgressBar';

interface ResumeCardProps {
  resumeState: ResumeState;
}

export function ResumeCard({ resumeState }: ResumeCardProps) {
  return (
    <div className="w-full p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
        Continuar
      </p>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {resumeState.courseName}
      </h3>

      <ProgressBar
        value={resumeState.progress}
        label="Progreso en el curso"
        className="mb-4"
      />

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Última lección: <span className="font-medium">{resumeState.lessonName}</span>
      </p>

      <Link href={resumeState.href}>
        <button className="max-w-max px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 border border-gray-700 text-sm">
          Retomar lección →
        </button>
      </Link>
    </div>
  );
}
