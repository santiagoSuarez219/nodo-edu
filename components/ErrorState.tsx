interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  digest?: string;
}

// Presentación pura del estado de error — replica el banner de
// AdminAttendancePanel.tsx (role="alert", border-danger/30 bg-danger/10),
// para que todos los estados de error de la app compartan un mismo look.
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel = "Reintentar",
  digest,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-4"
    >
      <div>
        <p className="text-sm font-medium text-danger dark:text-red-300">{title}</p>
        <p className="text-sm text-danger dark:text-red-300 mt-1">{description}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-danger hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-medium px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:focus-visible:ring-red-700 focus-visible:ring-offset-2"
        >
          {retryLabel}
        </button>
      )}
      {digest && (
        <p className="text-xs text-danger/60 dark:text-red-300/60">
          Código de referencia: {digest}
        </p>
      )}
    </div>
  );
}
