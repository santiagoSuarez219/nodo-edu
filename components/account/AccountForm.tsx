"use client";

import { useActionState } from "react";
import { updateAccountAction } from "@/lib/students/actions";
import type { AuthResult } from "@/lib/auth/types";
import type { Profile, Student } from "@/lib/students/types";
import { withTransportFallback } from "@/lib/errors/server-action";

interface Props {
  profile: Profile;
  student: Student | null;
}

const GITHUB_USERNAME_HELP_ID = "github-username-help";

const initial: AuthResult = { ok: true };

// spec-053: ver LoginForm.tsx para el motivo — mismo patrón en los cuatro
// formularios que usan useActionState.
const updateAccountFormAction = withTransportFallback(
  updateAccountAction,
  "updateAccountAction",
  (error) => ({ ok: false, error })
);

export function AccountForm({ profile, student }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateAccountFormAction,
    initial
  );

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Perfil
      </h2>

      <form action={formAction} className="flex flex-col gap-5">
        {state !== initial && state.ok && (
          <div
            role="status"
            className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400"
          >
            Perfil actualizado correctamente.
          </div>
        )}

        {!state.ok && !state.fieldErrors && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="full_name"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            defaultValue={profile.full_name}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
            aria-describedby={
              !state.ok && state.fieldErrors?.full_name
                ? "full-name-error"
                : undefined
            }
          />
          {!state.ok && state.fieldErrors?.full_name && (
            <p
              id="full-name-error"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {state.fieldErrors.full_name[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="github_username"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Usuario de GitHub{" "}
            <span className="font-normal text-gray-400 dark:text-gray-500">
              (opcional)
            </span>
          </label>
          <input
            id="github_username"
            name="github_username"
            type="text"
            autoComplete="off"
            defaultValue={profile.github_username ?? ""}
            placeholder="Ej. octocat"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
            aria-describedby={GITHUB_USERNAME_HELP_ID}
          />
          <p
            id={GITHUB_USERNAME_HELP_ID}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            Solo el usuario, sin &quot;@&quot; ni URL. No se verifica contra GitHub.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="career"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Carrera{" "}
              <span className="font-normal text-gray-400 dark:text-gray-500">
                (opcional)
              </span>
            </label>
            <input
              id="career"
              name="career"
              type="text"
              autoComplete="off"
              defaultValue={student?.career ?? ""}
              placeholder="Ej. Ingeniería de Sistemas"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="semester"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Semestre{" "}
              <span className="font-normal text-gray-400 dark:text-gray-500">
                (opcional)
              </span>
            </label>
            <input
              id="semester"
              name="semester"
              type="number"
              min={1}
              max={20}
              defaultValue={student?.semester ?? ""}
              placeholder="Ej. 5"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
              aria-describedby={
                !state.ok && state.fieldErrors?.semester
                  ? "semester-error"
                  : undefined
              }
            />
            {!state.ok && state.fieldErrors?.semester && (
              <p
                id="semester-error"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {state.fieldErrors.semester[0]}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
