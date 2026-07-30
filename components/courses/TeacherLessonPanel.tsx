import { TeacherAnswerKey } from '@/components/courses/TeacherAnswerKey';
import { TeacherAttendanceControl } from '@/components/courses/TeacherAttendanceControl';
import type { AttendanceGroup } from '@/components/courses/TeacherAttendanceControl';
import type { AnswerKeyQuestion } from '@/lib/self-assessment/types';
import type { OpenSessionSummary } from '@/lib/attendance/types';

interface TeacherLessonPanelProps {
  courseSlug: string;
  answerKey: AnswerKeyQuestion[];
  academicCourses: AttendanceGroup[];
  initialSessionsByCourseId: Record<string, OpenSessionSummary | null>;
}

export function TeacherLessonPanel({
  courseSlug,
  answerKey,
  academicCourses,
  initialSessionsByCourseId,
}: TeacherLessonPanelProps) {
  return (
    <section className="mt-12 pt-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-softer dark:bg-blue-900/20 text-brand dark:text-blue-300">
          Vista docente
        </span>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Solo tú ves este bloque — los estudiantes no lo ven.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {answerKey.length > 0 && <TeacherAnswerKey questions={answerKey} />}

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Asistencia
            </h3>
          </div>
          <div className="px-6 py-6">
            <TeacherAttendanceControl
              courseSlug={courseSlug}
              courses={academicCourses}
              initialSessionsByCourseId={initialSessionsByCourseId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
