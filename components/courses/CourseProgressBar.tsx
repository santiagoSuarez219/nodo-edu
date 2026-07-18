interface CourseProgressBarProps {
  completed: number;
  total: number;
}

export function CourseProgressBar({
  completed,
  total,
}: CourseProgressBarProps) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);

  return (
    <div
      className="mt-6 mb-4 px-2"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-labelledby="progress-label"
    >
      <p
        id="progress-label"
        className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
      >
        {completed} de {total} · {percentage}%
      </p>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-700 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
