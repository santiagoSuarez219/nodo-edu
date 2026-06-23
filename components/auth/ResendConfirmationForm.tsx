"use client";

import { useActionState } from "react";
import { resendConfirmation } from "@/lib/auth/actions";
import type { AuthResult } from "@/lib/auth/types";

const initial: AuthResult = { ok: true };

export function ResendConfirmationForm() {
  const [state, formAction, isPending] = useActionState(
    resendConfirmation,
    initial
  );

  if (state !== initial && state.ok) {
    return (
      <p className="text-sm text-center text-green-700 dark:text-green-400">
        Correo reenviado. Revisa tu bandeja de entrada.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!state.ok && (
        <p
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="resend-email"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Correo electrónico
        </label>
        <input
          id="resend-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tucorreo@ejemplo.com"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 text-sm font-semibold py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
      >
        {isPending ? "Enviando…" : "Reenviar correo de confirmación"}
      </button>
    </form>
  );
}
