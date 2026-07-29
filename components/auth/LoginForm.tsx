"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
import type { AuthResult } from "@/lib/auth/types";

const initial: AuthResult = { ok: true };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(signIn, initial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
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
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
          placeholder="tucorreo@ejemplo.com"
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
          placeholder="••••••••"
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

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-blue-700 dark:text-blue-400 hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
}
