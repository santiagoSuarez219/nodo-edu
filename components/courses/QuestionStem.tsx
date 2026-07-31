interface QuestionStemProps {
  topicTitle: string | null;
  stem: string;
  codeSnippet: string | null;
}

export function QuestionStem({ topicTitle, stem, codeSnippet }: QuestionStemProps) {
  return (
    <div className="mb-4">
      {topicTitle && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
          {topicTitle}
        </p>
      )}
      <p className="text-sm font-medium text-gray-900 dark:text-white">{stem}</p>
      {codeSnippet && (
        <pre className="mt-2 p-3 rounded bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
            {codeSnippet}
          </code>
        </pre>
      )}
    </div>
  );
}
