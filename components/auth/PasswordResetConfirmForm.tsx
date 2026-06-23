"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/auth/actions";
import type { AuthResult } from "@/lib/auth/types";

const initial: AuthResult = { ok: true };

export function PasswordResetConfirmForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
          htmlFor="password"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
          aria-describedby={
            !state.ok && state.fieldErrors?.password
              ? "password-error"
              : undefined
          }
        />
        {!state.ok && state.fieldErrors?.password && (
          <p
            id="password-error"
            className="text-xs text-red-600 dark:text-red-400"
          >
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password_confirmation"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Confirmar contraseña
        </label>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Repite tu contraseña"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
          aria-describedby={
            !state.ok && state.fieldErrors?.password_confirmation
              ? "confirm-error"
              : undefined
          }
        />
        {!state.ok && state.fieldErrors?.password_confirmation && (
          <p
            id="confirm-error"
            className="text-xs text-red-600 dark:text-red-400"
          >
            {state.fieldErrors.password_confirmation[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        {isPending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
