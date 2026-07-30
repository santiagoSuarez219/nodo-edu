'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAttendancePanel } from '@/components/admin/AdminAttendancePanel';
import type { AcademicCourse } from '@/lib/academic-courses/types';
import type { OpenSessionSummary } from '@/lib/attendance/types';

// Solo lo que la UI necesita — evita serializar enrollment_code (dato
// sensible del docente) al cliente sin necesidad.
export type AttendanceGroup = Pick<AcademicCourse, 'id' | 'name' | 'code'>;

interface TeacherAttendanceControlProps {
  courseSlug: string;
  courses: AttendanceGroup[];
  initialSessionsByCourseId: Record<string, OpenSessionSummary | null>;
}

function storageKey(courseSlug: string) {
  return `nodo:teacher-attendance-group:${courseSlug}`;
}

export function TeacherAttendanceControl({
  courseSlug,
  courses,
  initialSessionsByCourseId,
}: TeacherAttendanceControlProps) {
  // Inicializar siempre con el mismo valor en servidor y cliente (courses[0]):
  // localStorage no existe durante SSR, así que leerlo en el inicializador de
  // useState produce un árbol distinto entre servidor y la primera hidratación
  // (el server ve "sin sesión" y el cliente "con sesión" del grupo restaurado,
  // o viceversa) — un mismatch de hidratación real, no solo un warning.
  const [selectedId, setSelectedId] = useState<string | null>(
    courses[0]?.id ?? null
  );

  // Restaurar la elección de grupo guardada DESPUÉS de montar (post-hidratación):
  // en este punto un cambio de estado ya no compara contra el HTML del server,
  // así que no hay riesgo de mismatch — solo un re-render normal del cliente.
  useEffect(() => {
    if (courses.length <= 1) return;
    try {
      const stored = window.localStorage.getItem(storageKey(courseSlug));
      if (stored && stored !== courses[0]?.id && courses.some((c) => c.id === stored)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage, no disponible durante SSR; corre una sola vez al montar.
        setSelectedId(stored);
      }
    } catch {
      // localStorage bloqueado (Safari/modo privado, políticas corporativas):
      // se queda con courses[0], ya elegido por el estado inicial.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo se restaura una vez al montar; no reaccionar a cambios de `courses`.
  }, [courseSlug]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    try {
      window.localStorage.setItem(storageKey(courseSlug), id);
    } catch {
      // localStorage bloqueado: la selección sigue funcionando en esta
      // sesión, solo no persiste entre recargas.
    }
  };

  if (courses.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este curso no tiene un curso académico activo vinculado a{' '}
          <code className="text-xs">{courseSlug}</code>. Vincúlalo desde{' '}
          <Link
            href="/admin/courses"
            className="text-brand dark:text-blue-300 underline"
          >
            el panel de cursos
          </Link>{' '}
          para poder abrir sesiones de asistencia desde esta lección.
        </p>
      </div>
    );
  }

  const selectedCourse = courses.find((c) => c.id === selectedId) ?? courses[0];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        La sesión de asistencia pertenece al curso académico y al día, no a esta
        lección: si ya hay una sesión abierta hoy, es la misma en cualquier
        clase de este curso.
      </p>

      {courses.length > 1 && (
        <div>
          <label
            htmlFor="teacher-attendance-group"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Grupo
          </label>
          <select
            id="teacher-attendance-group"
            value={selectedCourse.id}
            onChange={(e) => handleSelect(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
      )}

      <AdminAttendancePanel
        key={selectedCourse.id}
        academicCourseId={selectedCourse.id}
        initialSession={initialSessionsByCourseId[selectedCourse.id] ?? null}
      />
    </div>
  );
}
