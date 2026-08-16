"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type ChangePasswordResult } from "@/lib/auth/actions";

const initial: ChangePasswordResult = { ok: true };

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // El formulario no se desmonta al tener éxito (no hay redirect), así que
  // los campos de contraseña quedarían con el valor tecleado a la vista si
  // no se limpian explícitamente — a diferencia de AccountForm, donde
  // dejar el valor anterior en pantalla es aceptable (es el nombre, no un
  // secreto).
  useEffect(() => {
    if (state !== initial && state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Contraseña
      </h2>

      <form ref={formRef} action={formAction} className="flex flex-col gap-5">
        {state !== initial && state.ok && state.data?.flagCleared !== false && (
          <div
            role="status"
            className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400"
          >
            Contraseña actualizada. Cerramos tus demás sesiones abiertas por
            seguridad — esta sigue activa.
          </div>
        )}

        {/* La contraseña sí cambió (updateUser no falló), pero no se pudo
            limpiar la marca de cambio forzado — sin este aviso, un usuario
            que llegó aquí obligado no entendería por qué la plataforma
            vuelve a pedírselo. Si vuelve a pasar, D6 exige elegir una
            TERCERA contraseña distinta a la que acaba de fijar. */}
        {state !== initial && state.ok && state.data?.flagCleared === false && (
          <div
            role="status"
            className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300"
          >
            Tu contraseña se actualizó, pero no pudimos completar la
            operación por un problema técnico. Si la plataforma te vuelve a
            pedir que la cambies, elige una distinta a la que acabas de
            poner.
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
            htmlFor="current_password"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Contraseña actual
          </label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
            aria-describedby={
              !state.ok && state.fieldErrors?.current_password
                ? "current-password-error"
                : undefined
            }
          />
          {!state.ok && state.fieldErrors?.current_password && (
            <p
              id="current-password-error"
              className="text-xs text-red-600 dark:text-red-400"
            >
              {state.fieldErrors.current_password[0]}
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new_password"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Nueva contraseña
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
              aria-describedby={
                !state.ok && state.fieldErrors?.new_password
                  ? "new-password-error"
                  : "new-password-help"
              }
            />
            {!state.ok && state.fieldErrors?.new_password ? (
              <p
                id="new-password-error"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {state.fieldErrors.new_password[0]}
              </p>
            ) : (
              <p
                id="new-password-help"
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                Al menos 8 caracteres.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="new_password_confirmation"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Confirmar nueva contraseña
            </label>
            <input
              id="new_password_confirmation"
              name="new_password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors"
              aria-describedby={
                !state.ok && state.fieldErrors?.new_password_confirmation
                  ? "new-password-confirmation-error"
                  : undefined
              }
            />
            {!state.ok && state.fieldErrors?.new_password_confirmation && (
              <p
                id="new-password-confirmation-error"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {state.fieldErrors.new_password_confirmation[0]}
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
            {isPending ? "Cambiando…" : "Cambiar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}
