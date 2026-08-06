'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminAttendancePanel } from '@/components/admin/AdminAttendancePanel';
import { attendanceGroupCookieName } from '@/lib/attendance/group-preference';
import type { AcademicCourse } from '@/lib/academic-courses/types';
import type { OpenSessionResult } from '@/lib/attendance/types';

// Solo lo que la UI necesita — evita serializar enrollment_code (dato
// sensible del docente) al cliente sin necesidad.
export type AttendanceGroup = Pick<AcademicCourse, 'id' | 'name' | 'code'>;

interface TeacherAttendanceControlProps {
  courseSlug: string;
  lessonSlug: string;
  courses: AttendanceGroup[];
  initialSessionsByCourseId: Record<string, OpenSessionResult>;
  /** Grupo restaurado desde la cookie por el server component; `null` si no hay. */
  initialSelectedId: string | null;
}

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function TeacherAttendanceControl({
  courseSlug,
  lessonSlug,
  courses,
  initialSessionsByCourseId,
  initialSelectedId,
}: TeacherAttendanceControlProps) {
  // La preferencia vive en una cookie, no en localStorage: el server component
  // la lee y ya renderiza el grupo correcto en el HTML inicial. Con localStorage
  // el primer pintado era siempre `courses[0]` y un efecto post-montaje corregía
  // después, así que el docente veía un instante el código de asistencia de otro
  // grupo — peligroso si la pantalla está proyectada en clase (DEBT-023).
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId ?? courses[0]?.id ?? null
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // `document.cookie` en vez de una server action: es una preferencia de UI
    // sin efecto en datos, y así no hay round-trip ni re-render del server.
    document.cookie = `${attendanceGroupCookieName(courseSlug)}=${id}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
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
        courseSlug={courseSlug}
        lessonSlug={lessonSlug}
        initialSession={
          initialSessionsByCourseId[selectedCourse.id] ?? { status: 'unavailable' }
        }
      />
    </div>
  );
}
