import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getLessonBySlug, isGuide, buildCourseOutline } from "@/lib/courses";
import { getLessonArticle } from "@/lib/courses/content";
import { hasTeacherLessonNotes } from "@/lib/courses/teacher-notes";
import { isLessonDisabled } from "@/lib/courses/availability";
import { requireCourseAccess } from "@/lib/enrollments";
import { hasCourseAccess } from "@/lib/enrollments/access";
import { markLessonViewed, getLessonProgress } from "@/lib/progress";
import { getStudentAttendanceForCourse, getOpenSessionForCourse } from "@/lib/attendance";
import {
  attendanceGroupCookieName,
  resolveStoredAttendanceGroup,
} from "@/lib/attendance/group-preference";
import {
  getSelfAssessmentForLesson,
  getSelfAssessmentStatus,
  getAnswerKeyForLesson,
  getAttemptReview,
} from "@/lib/self-assessment";
import {
  ANSWER_KEY_COOKIE_NAME,
  resolveStoredAnswerKeyExpanded,
} from "@/lib/self-assessment/answer-key-preference";
import type {
  SelfAssessmentQuestion,
  AnswerKeyQuestion,
  SelfAssessmentStatus,
  AttemptReview,
} from "@/lib/self-assessment/types";
import { resolveAcademicCoursesBySlug } from "@/lib/academic-courses";
import type { OpenSessionResult, StudentAttendanceState } from "@/lib/attendance/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LessonArticle } from "@/components/courses/LessonArticle";
import { LessonPagination } from "@/components/courses/LessonPagination";
import { LessonClosureFlow } from "@/components/courses/LessonClosureFlow";
import type { AttendanceGroup } from "@/components/courses/TeacherAttendanceControl";
import { AttendanceSection } from "@/components/courses/AttendanceSection";
import { TeacherLessonPanel } from "@/components/courses/TeacherLessonPanel";
import { LessonUnavailable } from "@/components/courses/LessonUnavailable";
import { MdxContent } from "@/components/mdx/MdxContent";
import { TopicList } from "@/components/courses/TopicList";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const ctx = await getLessonBySlug(courseSlug, lessonSlug);
  if (!ctx) return { title: "Lección no encontrada" };
  const prefix = isGuide(ctx.lesson) ? "Guía — " : "";
  return {
    title: `${prefix}${ctx.lesson.title} — ${ctx.course.title}`,
    description: ctx.lesson.summary ?? ctx.course.summary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const ctx = await getLessonBySlug(courseSlug, lessonSlug);
  if (!ctx) notFound();

  await requireCourseAccess(courseSlug, `/${courseSlug}/${lessonSlug}`);

  const { course, lesson, prev, next } = ctx;
  const isGuideNode = isGuide(lesson);

  // Calcular classIndex para mostrar número de clase
  const outline = buildCourseOutline(course);
  const nodeOutline = outline.find((n) => n.slug === lesson.slug);
  const classIndex = nodeOutline?.classIndex ?? null;

  const access = await hasCourseAccess(courseSlug);

  // spec-039: la disponibilidad se compone contra Supabase (D1) y se aplica
  // solo al estudiante matriculado (D4) — owner y admin nunca son bloqueados.
  // Cubre lecciones y guías por igual (el contexto del spec cita explícitamente
  // el caso de una guía cuyo enunciado no debe verse antes de la sesión).
  const availability = await isLessonDisabled(courseSlug, lessonSlug);
  const isBlockedForStudent =
    access.ok &&
    access.reason === "enrolled" &&
    (availability.status === "unavailable" || availability.disabled);
  // D6: el owner/admin solo ve el aviso cuando el estado se pudo verificar
  // y es efectivamente "deshabilitada" — nunca ante un fallo de verificación.
  const showDisabledNoticeToTeacher =
    access.ok &&
    (access.reason === "owner" || access.reason === "admin") &&
    availability.status === "ok" &&
    availability.disabled;

  // Omitir tracking de progreso para guías y para lecciones bloqueadas.
  if (!isGuideNode && !isBlockedForStudent) {
    await markLessonViewed(courseSlug, lessonSlug);
  }
  const progress = !isGuideNode ? await getLessonProgress(courseSlug, lessonSlug) : null;

  // El artículo MDX no se carga cuando el gate bloquea (D3): el contenido
  // nunca viaja al cliente, no es solo un ocultamiento visual.
  const article =
    !isBlockedForStudent && lesson.articleSlug
      ? await getLessonArticle(course.slug, lesson.articleSlug, lesson.kind)
      : null;

  let attendanceState: StudentAttendanceState | null = null;
  let selfAssessment: SelfAssessmentQuestion[] = [];
  let selfAssessmentStatus: SelfAssessmentStatus = {
    status: "ok",
    questionCount: 0,
    hasAttempt: false,
    requiresAttempt: false,
    lastAttempt: null,
  };
  let attemptReview: AttemptReview | null = null;

  if (access.ok && access.reason === "enrolled" && !isGuideNode && !isBlockedForStudent) {
    attendanceState = await getStudentAttendanceForCourse(courseSlug);
    selfAssessment = await getSelfAssessmentForLesson(courseSlug, lessonSlug);
    selfAssessmentStatus = await getSelfAssessmentStatus(courseSlug, lessonSlug);
    // spec-040: revisión persistente del intento único (reemplaza el
    // resumen agregado de spec-033).
    attemptReview = await getAttemptReview(courseSlug, lessonSlug);
  }

  // Fallar cerrado (D8 de spec-037): un fallo de infraestructura al verificar
  // la autoevaluación NUNCA debe abrir el gate de "completar lección".
  const selfAssessmentCanComplete =
    selfAssessmentStatus.status === "ok"
      ? !selfAssessmentStatus.requiresAttempt || selfAssessmentStatus.hasAttempt
      : false;
  const selfAssessmentBlockedReason =
    selfAssessmentStatus.status === "unavailable"
      ? "self_assessment_unavailable"
      : selfAssessmentStatus.requiresAttempt && !selfAssessmentStatus.hasAttempt
        ? "self_assessment_pending"
        : undefined;
  // El estudiante ya envió su intento (según el gate, que sí falla cerrado),
  // pero `getAttemptReview` no pudo reconstruir la revisión: no es lo mismo
  // que "todavía no respondió", y mostrar el formulario en ese caso invitaría
  // a un reenvío que la base rechazaría de todos modos, sin explicar por qué.
  const selfAssessmentReviewUnavailable =
    selfAssessmentStatus.status === "ok" &&
    selfAssessmentStatus.hasAttempt &&
    attemptReview === null;
  // Vista docente (spec-031): rama independiente de la de "enrolled" — un
  // owner/admin nunca tiene reason "enrolled", así que ambos bloques son
  // mutuamente excluyentes por construcción.
  let teacherAnswerKey: AnswerKeyQuestion[] = [];
  let teacherCourses: AttendanceGroup[] = [];
  let teacherSessionsByCourseId: Record<string, OpenSessionResult> = {};
  let teacherAttendanceGroupId: string | null = null;
  let teacherAnswerKeyExpanded = false;
  let teacherNotesHref: string | null = null;

  if (access.ok && (access.reason === "owner" || access.reason === "admin")) {
    const [answerKey, academicCourses, hasNotes] = await Promise.all([
      isGuideNode
        ? Promise.resolve([] as AnswerKeyQuestion[])
        : getAnswerKeyForLesson(courseSlug, lessonSlug),
      resolveAcademicCoursesBySlug(courseSlug, access),
      // spec-044: apuntes docente — aplica a lecciones y guías por igual.
      // Solo comprueba existencia (sin leer el Markdown): el contenido se
      // resuelve bajo demanda en la ruta dedicada `/apuntes`, para no
      // engordar el payload de cada lección con texto que no se muestra ahí.
      lesson.articleSlug
        ? hasTeacherLessonNotes(courseSlug, lesson.articleSlug)
        : Promise.resolve(false),
    ]);
    teacherAnswerKey = answerKey;
    teacherNotesHref = hasNotes ? `/${courseSlug}/${lessonSlug}/apuntes` : null;
    // Solo id/name/code viajan al cliente — evita serializar enrollment_code
    // (dato sensible del docente) en el payload RSC sin necesidad.
    teacherCourses = academicCourses.map((academicCourse) => ({
      id: academicCourse.id,
      name: academicCourse.name,
      code: academicCourse.code,
    }));

    const sessions = await Promise.all(
      academicCourses.map((academicCourse) => getOpenSessionForCourse(academicCourse.id))
    );
    teacherSessionsByCourseId = Object.fromEntries(
      academicCourses.map((academicCourse, i) => [academicCourse.id, sessions[i]])
    );

    // Grupo elegido la última vez, leído en el server para que el HTML inicial
    // ya traiga el código de asistencia correcto (DEBT-023).
    const cookieStore = await cookies();
    teacherAttendanceGroupId = resolveStoredAttendanceGroup(
      cookieStore.get(attendanceGroupCookieName(courseSlug))?.value,
      teacherCourses.map((group) => group.id)
    );
    teacherAnswerKeyExpanded = resolveStoredAnswerKeyExpanded(
      cookieStore.get(ANSWER_KEY_COOKIE_NAME)?.value
    );
  }

  return (
    <>
      <LessonArticle
        course={course}
        lesson={lesson}
        classIndex={classIndex}
        updatedAt={article?.frontmatter.updatedAt}
        teacherNotesHref={teacherNotesHref}
      >
        {isBlockedForStudent ? (
          <LessonUnavailable
            reason={availability.status === "unavailable" ? "unavailable" : "disabled"}
            hasTopics={lesson.topics.length > 0}
            topics={lesson.topics}
          />
        ) : article ? (
          <MdxContent source={article.rawSource} />
        ) : (
          <PreparationPlaceholder
            hasTopics={lesson.topics.length > 0}
            topics={lesson.topics}
            kind={lesson.kind}
          />
        )}
      </LessonArticle>

      {showDisabledNoticeToTeacher && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300"
        >
          Lección deshabilitada — los estudiantes no pueden abrirla.
        </div>
      )}

      {access.ok && access.reason === "enrolled" && !isGuideNode && !isBlockedForStudent && (
        <LessonClosureFlow
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          questions={selfAssessment}
          initialCompletedAt={progress?.completed_at ?? null}
          canComplete={selfAssessmentCanComplete}
          blockedReason={selfAssessmentBlockedReason}
          attemptReview={attemptReview}
          attemptReviewUnavailable={selfAssessmentReviewUnavailable}
          attendance={
            attendanceState && (
              <ErrorBoundary
                title="La sección de asistencia no está disponible"
                description="Ocurrió un error inesperado. Intenta de nuevo."
              >
                <AttendanceSection
                  courseSlug={courseSlug}
                  lessonSlug={lessonSlug}
                  attendanceState={attendanceState}
                />
              </ErrorBoundary>
            )
          }
        />
      )}

      {access.ok && (access.reason === "owner" || access.reason === "admin") && (
        <TeacherLessonPanel
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          answerKey={teacherAnswerKey}
          academicCourses={teacherCourses}
          initialSessionsByCourseId={teacherSessionsByCourseId}
          initialAttendanceGroupId={teacherAttendanceGroupId}
          initialAnswerKeyExpanded={teacherAnswerKeyExpanded}
        />
      )}

      <LessonPagination courseSlug={course.slug} prev={prev} next={next} />
    </>
  );
}

function PreparationPlaceholder({
  hasTopics,
  topics,
  kind = "lesson",
}: {
  hasTopics: boolean;
  topics: import("@/lib/courses/types").Topic[];
  kind?: "lesson" | "guide";
}) {
  const isGuide = kind === "guide";
  return (
    <div>
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {isGuide ? "Guía en preparación" : "Apuntes en preparación"}
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isGuide
            ? "La guía de esta práctica aún no está publicada. Vuelve pronto."
            : "Los apuntes de esta clase aún no están publicados. Vuelve pronto."}
        </p>
      </div>
      {hasTopics && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Temas previstos
          </h2>
          <TopicList topics={topics} />
        </section>
      )}
    </div>
  );
}
