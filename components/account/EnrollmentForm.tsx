"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollByCourseCodeAction } from "@/lib/enrollments/actions";

export function EnrollmentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Ingresa un código de matrícula.");
      return;
    }

    const formData = new FormData();
    formData.set("enrollment_code", trimmed);

    startTransition(async () => {
      const result = await enrollByCourseCodeAction({ ok: true }, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode("");
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Matricularse en un curso
      </h2>

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400"
        >
          ¡Matrícula exitosa! El curso ya aparece en tu lista.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); setSuccess(false); }}
            placeholder="Código de matrícula (ej. AB3C7XYZ)"
            maxLength={8}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm uppercase font-mono text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
            aria-describedby={error ? "enroll-error" : undefined}
          />
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="shrink-0 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            {isPending ? "Verificando…" : "Matricularme"}
          </button>
        </div>
        {error && (
          <p id="enroll-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
