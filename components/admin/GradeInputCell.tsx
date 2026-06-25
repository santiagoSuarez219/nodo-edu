"use client";

import { useState, useRef } from "react";
import { upsertStudentGradeAction } from "@/lib/grades/actions";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Props {
  enrollmentId: string;
  gradeItemId: string;
  academicCourseId: string;
  initialScore: number | null;
  onSave: (gradeItemId: string, score: number | null) => void;
}

export function GradeInputCell({
  enrollmentId,
  gradeItemId,
  academicCourseId,
  initialScore,
  onSave,
}: Props) {
  const [value, setValue] = useState(
    initialScore !== null ? String(initialScore) : ""
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleBlur() {
    const raw = value.trim();
    const score = raw === "" ? null : Number(raw);

    if (raw !== "" && (isNaN(score!) || score! < 0 || score! > 5)) {
      setStatus("error");
      return;
    }

    if (score === initialScore) return;

    setStatus("saving");
    const result = await upsertStudentGradeAction(
      enrollmentId,
      gradeItemId,
      score,
      academicCourseId
    );

    if (!result.ok) {
      setStatus("error");
      return;
    }

    onSave(gradeItemId, score);
    setStatus("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <div className="relative flex items-center justify-end gap-1.5">
      <input
        type="number"
        min={0}
        max={5}
        step={0.01}
        value={value}
        onChange={(e) => { setValue(e.target.value); setStatus("idle"); }}
        onBlur={handleBlur}
        placeholder="—"
        aria-label="Calificación"
        className={`w-20 rounded border px-2 py-1 text-right text-sm font-mono transition-colors focus:outline-none focus:ring-2
          ${status === "error"
            ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 focus:ring-red-200 dark:focus:ring-red-800"
            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700"
          }`}
      />
      <span className="w-4 shrink-0" aria-live="polite" aria-label={
        status === "saving" ? "Guardando" : status === "saved" ? "Guardado" : status === "error" ? "Error al guardar" : ""
      }>
        {status === "saving" && (
          <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {status === "saved" && (
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === "error" && (
          <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
    </div>
  );
}
