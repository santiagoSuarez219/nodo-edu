import { MdxContent } from '@/components/mdx/MdxContent';

interface TeacherClassNotesProps {
  source: string;
}

// spec-044: bloque de apuntes docente — solo se monta cuando ya se resolvió
// contenido (el llamador filtra null/ausencia). Server component: el
// Markdown se compila en el servidor, igual que el artículo público.
export function TeacherClassNotes({ source }: TeacherClassNotesProps) {
  return (
    <details
      open
      className="group border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="cursor-pointer select-none list-none border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Apuntes de clase
        </h3>
        <svg
          className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 py-6">
        <MdxContent source={source} />
      </div>
    </details>
  );
}
