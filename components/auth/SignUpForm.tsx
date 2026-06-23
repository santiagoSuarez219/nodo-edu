"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth/actions";
import type { AuthResult } from "@/lib/auth/types";

const initial: AuthResult = { ok: true };

const fields = [
  {
    id: "full_name",
    name: "full_name",
    label: "Nombre completo",
    type: "text",
    autoComplete: "name",
    placeholder: "Tu nombre",
  },
  {
    id: "email",
    name: "email",
    label: "Correo electrónico",
    type: "email",
    autoComplete: "email",
    placeholder: "tucorreo@ejemplo.com",
  },
  {
    id: "password",
    name: "password",
    label: "Contraseña",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Mínimo 8 caracteres",
  },
  {
    id: "password_confirmation",
    name: "password_confirmation",
    label: "Confirmar contraseña",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Repite tu contraseña",
  },
] as const;

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, initial);

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

      {fields.map((f) => (
        <div key={f.id} className="flex flex-col gap-1.5">
          <label
            htmlFor={f.id}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {f.label}
          </label>
          <input
            id={f.id}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            required
            placeholder={f.placeholder}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
            aria-describedby={
              !state.ok && state.fieldErrors?.[f.name]
                ? `${f.id}-error`
                : undefined
            }
          />
          {!state.ok && state.fieldErrors?.[f.name] && (
            <p
              id={`${f.id}-error`}
              className="text-xs text-red-600 dark:text-red-400"
            >
              {state.fieldErrors[f.name]![0]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-700 dark:text-blue-400 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
