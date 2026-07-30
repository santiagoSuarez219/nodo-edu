'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminAttendancePanel } from '@/components/admin/AdminAttendancePanel';
import type { AcademicCourse } from '@/lib/academic-courses/types';
import type { OpenSessionSummary } from '@/lib/attendance/types';

interface TeacherAttendanceControlProps {
  courseSlug: string;
  courses: AcademicCourse[];
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
  // Lazy initializer (no efecto): la sesión pertenece al curso académico, no
  // a esta lección, así que si el docente ya eligió un grupo en otra clase,
  // se respeta esa elección al montar.
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return courses[0]?.id ?? null;
    const stored = window.localStorage.getItem(storageKey(courseSlug));
    if (stored && courses.some((c) => c.id === stored)) return stored;
    return courses[0]?.id ?? null;
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    window.localStorage.setItem(storageKey(courseSlug), id);
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
