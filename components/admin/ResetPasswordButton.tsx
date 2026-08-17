"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { resetStudentPasswordAction } from "@/lib/students/actions";

interface Props {
  studentId: string;
  studentName: string;
  academicCourseId: string;
}

// spec-051 (Fase 3): cuarta copia del diálogo de confirmación accesible que
// ya existe en AssignmentPlayer, AdminAttendancePanel y CourseLifecycleActions
// (ver DEBT-038). Se decidió NO extraer un ConfirmDialog compartido aquí: esta
// necesidad tiene una segunda fase que las otras tres no tienen (mostrar la
// contraseña generada tras confirmar, D7 de spec-051), y forzar esa forma en
// un componente genérico pensado para las otras tres arriesgaba sobre-ajustar
// la API a este caso sin que las tres migraran en el mismo cambio — un
// refactor amplio no pedido por este spec (ver CLAUDE.md, "cambios
// quirúrgicos"). Con esta van CUATRO copias, no tres: se anota en
// docs/specs/backlog.md → DEBT-038 para que la próxima vez que se toque
// cualquiera de las cuatro se considere la extracción en serio.
type Phase = "idle" | "confirm" | "result";

export function ResetPasswordButton({ studentId, studentName, academicCourseId }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Mismo comportamiento que AdminAttendancePanel/CourseLifecycleActions:
  // Escape cierra, el foco va al botón principal de cada fase al abrirla.
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    (phase === "confirm" ? confirmButtonRef : closeButtonRef).current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [phase]);

  function closeDialog() {
    setPhase("idle");
    // D7: la contraseña se muestra una sola vez — no queda en memoria del
    // componente después de cerrar el diálogo de resultado.
    setGeneratedPassword(null);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await resetStudentPasswordAction(studentId, academicCourseId);
      if (!result.ok || !result.data) {
        setError(!result.ok ? result.error : "No se pudo restablecer la contraseña.");
        setPhase("idle");
        return;
      }
      setGeneratedPassword(result.data.password);
      setPhase("result");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPhase("confirm")}
        className="text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline transition-colors"
      >
        Restablecer contraseña
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {phase !== "idle" && (
        <>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeDialog}
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-black/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            aria-describedby="reset-password-description"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-xl flex flex-col gap-4">
              {phase === "confirm" ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h2
                      id="reset-password-title"
                      className="text-base font-bold text-gray-900 dark:text-white"
                    >
                      ¿Restablecer la contraseña de {studentName}?
                    </h2>
                    <p
                      id="reset-password-description"
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      Se generará una contraseña genérica que deberás dictarle
                      al estudiante. La próxima vez que inicie sesión, la
                      plataforma le exigirá cambiarla antes de continuar.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeDialog}
                      disabled={isPending}
                      className="rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-bold px-4 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      ref={confirmButtonRef}
                      type="button"
                      onClick={handleConfirm}
                      disabled={isPending}
                      aria-busy={isPending}
                      className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                    >
                      {isPending ? "Restableciendo…" : "Restablecer"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h2
                      id="reset-password-title"
                      className="text-base font-bold text-gray-900 dark:text-white"
                    >
                      Contraseña de {studentName}
                    </h2>
                    <p
                      id="reset-password-description"
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      Dictásela ahora — no volverá a mostrarse en ningún lugar
                      de la plataforma.
                    </p>
                  </div>
                  <p className="select-all rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-center font-mono text-lg tracking-widest text-gray-900 dark:text-white">
                    {generatedPassword}
                  </p>
                  <div className="flex justify-end">
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={closeDialog}
                      className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                    >
                      Listo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
