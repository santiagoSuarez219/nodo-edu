"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth/actions";
import type { AuthResult } from "@/lib/auth/types";

const initial: AuthResult = { ok: true };

export function PasswordResetRequestForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initial
  );

  if (state !== initial && state.ok) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Si el correo está registrado, recibirás un enlace para restablecer tu
          contraseña.
        </div>
        <Link
          href="/login"
          className="text-center text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {!state.ok && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tucorreo@ejemplo.com"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
          aria-describedby={
            !state.ok && state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        {!state.ok && state.fieldErrors?.email && (
          <p id="email-error" className="text-xs text-red-600 dark:text-red-400">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        {isPending ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/login"
          className="font-semibold text-blue-700 dark:text-blue-400 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  );
}
