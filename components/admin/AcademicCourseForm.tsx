"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AcademicCourseSchema, type AcademicCourseSchemaInput } from "@/lib/academic-courses/schemas";
import { createCourseAction, updateCourseAction } from "@/lib/academic-courses/actions";
import type { AcademicCourse } from "@/lib/academic-courses/types";

const CLASS_DAYS = [
  { value: "lunes", label: "Lunes" },
  { value: "martes", label: "Martes" },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves", label: "Jueves" },
  { value: "viernes", label: "Viernes" },
  { value: "sabado", label: "Sábado" },
] as const;

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

interface Props {
  course?: AcademicCourse;
}

export function AcademicCourseForm({ course }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEdit = !!course;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AcademicCourseSchemaInput>({
    resolver: zodResolver(AcademicCourseSchema),
    defaultValues: {
      name: course?.name ?? "",
      code: course?.code ?? "",
      class_days: (course?.class_days as AcademicCourseSchemaInput["class_days"]) ?? [],
      class_time_start: course?.class_time_start?.slice(0, 5) ?? "",
      class_time_end: course?.class_time_end?.slice(0, 5) ?? "",
      enrollment_code: course?.enrollment_code ?? "",
      course_slug: course?.course_slug ?? "",
    },
  });

  function handleGenerate() {
    setValue("enrollment_code", generateCode(), { shouldValidate: true });
  }

  const onSubmit = (data: AcademicCourseSchemaInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateCourseAction(course.id, data)
        : await createCourseAction(data);

      if (!result.ok) {
        setServerError(result.error);
        return;
      }

      if (!isEdit && result.data?.id) {
        router.push(`/admin/courses/${result.data.id}`);
      } else {
        router.push(`/admin/courses/${course!.id}`);
      }
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:border-blue-700 dark:focus:border-blue-500 transition-colors";
  const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300";
  const errorClass = "text-xs text-red-600 dark:text-red-400 mt-1";

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {serverError && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          >
            {serverError}
          </div>
        )}

        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Nombre del curso
          </label>
          <input
            id="name"
            type="text"
            placeholder="Ej. Estructuras de Datos"
            className={inputClass}
            {...register("name")}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        {/* Código */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code" className={labelClass}>
            Código académico
          </label>
          <input
            id="code"
            type="text"
            placeholder="Ej. EDS-2025-1"
            className={inputClass}
            {...register("code")}
          />
          {errors.code && <p className={errorClass}>{errors.code.message}</p>}
        </div>

        {/* Días de clase */}
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Días de clase</span>
          <div className="flex flex-wrap gap-3">
            {CLASS_DAYS.map((day) => (
              <label
                key={day.value}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  value={day.value}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-700 focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700"
                  {...register("class_days")}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {day.label}
                </span>
              </label>
            ))}
          </div>
          {errors.class_days && (
            <p className={errorClass}>{errors.class_days.message}</p>
          )}
        </div>

        {/* Horario */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="class_time_start" className={labelClass}>
              Hora de inicio
            </label>
            <input
              id="class_time_start"
              type="time"
              className={inputClass}
              {...register("class_time_start")}
            />
            {errors.class_time_start && (
              <p className={errorClass}>{errors.class_time_start.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="class_time_end" className={labelClass}>
              Hora de fin
            </label>
            <input
              id="class_time_end"
              type="time"
              className={inputClass}
              {...register("class_time_end")}
            />
            {errors.class_time_end && (
              <p className={errorClass}>{errors.class_time_end.message}</p>
            )}
          </div>
        </div>

        {/* Código de matrícula */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="enrollment_code" className={labelClass}>
            Código de matrícula
            <span className="ml-1.5 font-normal text-gray-400 dark:text-gray-500">
              (8 caracteres, A-Z 0-9)
            </span>
          </label>
          <div className="flex gap-2">
            <input
              id="enrollment_code"
              type="text"
              maxLength={8}
              placeholder="Ej. AB3C7XYZ"
              className={`${inputClass} uppercase`}
              {...register("enrollment_code")}
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              Generar
            </button>
          </div>
          {errors.enrollment_code && (
            <p className={errorClass}>{errors.enrollment_code.message}</p>
          )}
        </div>

        {/* Slug de contenido (opcional) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="course_slug" className={labelClass}>
            Slug de contenido{" "}
            <span className="font-normal text-gray-400 dark:text-gray-500">
              (opcional)
            </span>
          </label>
          <input
            id="course_slug"
            type="text"
            placeholder="Ej. estructuras-de-datos"
            className={inputClass}
            {...register("course_slug")}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Vincula este curso al material MDX publicado en la plataforma.
          </p>
          {errors.course_slug && (
            <p className={errorClass}>{errors.course_slug.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-1 border-t border-gray-100 dark:border-gray-700 mt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear curso"}
          </button>
        </div>
      </form>
    </div>
  );
}
