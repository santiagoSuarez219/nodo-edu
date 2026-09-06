"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  CreateManualSessionFormSchema,
  type CreateManualSessionFormInput,
} from "@/lib/attendance/schemas";
import { createManualSessionAction } from "@/lib/attendance/actions";
import {
  isServerActionTransportError,
  SERVER_ACTION_TRANSPORT_ERROR_MESSAGE,
} from "@/lib/errors/server-action";
import { reportTransportError } from "@/lib/observability/report-transport-error";
import { formatSessionDateLong } from "@/lib/attendance/date-format";

interface Props {
  academicCourseId: string;
  // Fechas (`YYYY-MM-DD`) de las sesiones ya registradas, para el aviso no
  // bloqueante de D13 — el esquema no impide dos sesiones el mismo día
  // (hay cursos con dos bloques diarios).
  existingDates: string[];
}

export function CreateManualSessionForm({ academicCourseId, existingDates }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [collisionConfirmed, setCollisionConfirmed] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateManualSessionFormInput>({
    resolver: zodResolver(CreateManualSessionFormSchema),
    defaultValues: { session_date: "" },
  });

  const dateValue = watch("session_date");
  const hasCollision = Boolean(dateValue) && existingDates.includes(dateValue);

  function onSubmit(values: CreateManualSessionFormInput) {
    if (hasCollision && !collisionConfirmed) {
      setCollisionConfirmed(true);
      return;
    }

    setServerError(null);
    startTransition(async () => {
      let result;
      try {
        result = await createManualSessionAction(academicCourseId, values.session_date);
      } catch (err) {
        if (!isServerActionTransportError(err)) throw err;
        reportTransportError(err, "createManualSessionAction");
        setServerError(SERVER_ACTION_TRANSPORT_ERROR_MESSAGE);
        return;
      }

      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      reset({ session_date: "" });
      setCollisionConfirmed(false);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 rounded-[var(--radius-base)] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
    >
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="manual-session-date"
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Registrar sesión pasada
          </label>
          <input
            id="manual-session-date"
            type="date"
            {...register("session_date", { onChange: () => setCollisionConfirmed(false) })}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 transition-colors"
        >
          {hasCollision && collisionConfirmed ? "Crear de todas formas" : "Crear sesión"}
        </button>
      </div>

      {errors.session_date && (
        <p className="text-sm text-red-700 dark:text-red-400">{errors.session_date.message}</p>
      )}

      {hasCollision && (
        <p className="text-sm text-yellow-700 dark:text-yellow-500">
          Ya existe una sesión registrada el {formatSessionDateLong(dateValue)}. Puedes confirmar
          de todas formas si el curso tiene dos bloques ese día.
        </p>
      )}

      {serverError && <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Se crea sin código y cerrada, para registrar una clase que no se abrió en la plataforma.
        Para abrir una sesión en vivo, hazlo desde la lección durante la clase.
      </p>
    </form>
  );
}
