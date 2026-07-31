import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonBySlug, isGuide, buildCourseOutline } from "@/lib/courses";
import { getLessonArticle } from "@/lib/courses/content";
import { requireCourseAccess } from "@/lib/enrollments";
import { hasCourseAccess } from "@/lib/enrollments/access";
import { markLessonViewed, getLessonProgress } from "@/lib/progress";
import { getStudentAttendanceForCourse, getOpenSessionForCourse } from "@/lib/attendance";
import {
  getSelfAssessmentForLesson,
  getSelfAssessmentStatus,
  getAnswerKeyForLesson,
} from "@/lib/self-assessment";
import type { SelfAssessmentQuestion, AnswerKeyQuestion, SelfAssessmentStatus } from "@/lib/self-assessment/types";
import { resolveAcademicCoursesBySlug } from "@/lib/academic-courses";
import type { OpenSessionSummary } from "@/lib/attendance/types";
import { LessonArticle } from "@/components/courses/LessonArticle";
import { LessonPagination } from "@/components/courses/LessonPagination";
import { LessonClosureFlow } from "@/components/courses/LessonClosureFlow";
import type { AttendanceGroup } from "@/components/courses/TeacherAttendanceControl";
import { AttendanceSection } from "@/components/courses/AttendanceSection";
import { TeacherLessonPanel } from "@/components/courses/TeacherLessonPanel";
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

  // Omitir tracking de progreso para guías
  if (!isGuideNode) {
    await markLessonViewed(courseSlug, lessonSlug);
  }
  const access = await hasCourseAccess(courseSlug);
  const progress = !isGuideNode ? await getLessonProgress(courseSlug, lessonSlug) : null;

  const article = lesson.articleSlug
    ? await getLessonArticle(course.slug, lesson.articleSlug, lesson.kind)
    : null;

  let attendanceState = null;
  let selfAssessment: SelfAssessmentQuestion[] = [];
  let selfAssessmentStatus: SelfAssessmentStatus = {
    questionCount: 0,
    hasAttempt: false,
    requiresAttempt: false,
    lastAttempt: null,
  };

  if (access.ok && access.reason === "enrolled" && !isGuideNode) {
    attendanceState = await getStudentAttendanceForCourse(courseSlug);
    selfAssessment = await getSelfAssessmentForLesson(courseSlug, lessonSlug);
    selfAssessmentStatus = await getSelfAssessmentStatus(courseSlug, lessonSlug);
  }

  // Vista docente (spec-031): rama independiente de la de "enrolled" — un
  // owner/admin nunca tiene reason "enrolled", así que ambos bloques son
  // mutuamente excluyentes por construcción.
  let teacherAnswerKey: AnswerKeyQuestion[] = [];
  let teacherCourses: AttendanceGroup[] = [];
  let teacherSessionsByCourseId: Record<string, OpenSessionSummary | null> = {};

  if (access.ok && (access.reason === "owner" || access.reason === "admin")) {
    const [answerKey, academicCourses] = await Promise.all([
      isGuideNode
        ? Promise.resolve([] as AnswerKeyQuestion[])
        : getAnswerKeyForLesson(courseSlug, lessonSlug),
      resolveAcademicCoursesBySlug(courseSlug, access),
    ]);
    teacherAnswerKey = answerKey;
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
  }

  return (
    <>
      <LessonArticle
        course={course}
        lesson={lesson}
        classIndex={classIndex}
        updatedAt={article?.frontmatter.updatedAt}
      >
        {article ? (
          <MdxContent source={article.rawSource} />
        ) : (
          <PreparationPlaceholder
            hasTopics={lesson.topics.length > 0}
            topics={lesson.topics}
            kind={lesson.kind}
          />
        )}
      </LessonArticle>

      {access.ok && access.reason === "enrolled" && !isGuideNode && (
        <LessonClosureFlow
          courseSlug={courseSlug}
          lessonSlug={lessonSlug}
          questions={selfAssessment}
          initialCompletedAt={progress?.completed_at ?? null}
          canComplete={!selfAssessmentStatus.requiresAttempt || selfAssessmentStatus.hasAttempt}
          blockedReason={
            selfAssessmentStatus.requiresAttempt && !selfAssessmentStatus.hasAttempt
              ? "self_assessment_pending"
              : undefined
          }
          lastAttempt={selfAssessmentStatus.lastAttempt}
          attendance={
            attendanceState && (
              <AttendanceSection
                courseSlug={courseSlug}
                lessonSlug={lessonSlug}
                attendanceState={attendanceState}
              />
            )
          }
        />
      )}

      {access.ok && (access.reason === "owner" || access.reason === "admin") && (
        <TeacherLessonPanel
          courseSlug={courseSlug}
          answerKey={teacherAnswerKey}
          academicCourses={teacherCourses}
          initialSessionsByCourseId={teacherSessionsByCourseId}
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
