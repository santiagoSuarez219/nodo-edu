import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateServiceRequest, AuthenticationError } from "@/lib/api/auth";
import {
  apiError,
  unauthorizedError,
  validationError,
  notFoundError,
  configurationError,
  internalError,
} from "@/lib/api/errors";
import { getCourseBySlug } from "@/lib/courses";
import type { Course } from "@/lib/courses";
import {
  findInvalidTaughtSlugs,
  getServiceGroup,
  listServiceTaughtLessons,
  setServiceLessonsTaught,
} from "@/lib/courses/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// D14: `taught` sin default (igual que `enabled` en spec-039); sin duplicados.
const SetLessonsTaughtSchema = z.object({
  lesson_slugs: z
    .array(z.string().min(1))
    .min(1, "lesson_slugs no puede estar vacío")
    .max(50, "lesson_slugs admite como máximo 50 lecciones")
    .refine((slugs) => new Set(slugs).size === slugs.length, {
      message: "lesson_slugs no admite duplicados",
    }),
  taught: z.boolean(),
});

function handleAuthError(err: unknown): NextResponse {
  if (err instanceof AuthenticationError) {
    return NextResponse.json(unauthorizedError(err.message), { status: 401 });
  }
  console.error("COURSES_ADMIN_API_KEY error de configuración:", err);
  return NextResponse.json(configurationError("Servicio mal configurado."), {
    status: 500,
  });
}

/** Curso del catálogo + grupo, con 404 si el grupo no existe o es de otro curso. */
async function resolveGroup(
  courseSlug: string,
  academicCourseId: string
): Promise<{ ok: true; course: Course } | { ok: false; response: NextResponse }> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    return {
      ok: false,
      response: NextResponse.json(
        notFoundError(`Curso no encontrado: ${courseSlug}`),
        { status: 404 }
      ),
    };
  }

  const group = UUID_RE.test(academicCourseId)
    ? await getServiceGroup(academicCourseId)
    : null;
  if (!group || group.course_slug !== course.slug) {
    return {
      ok: false,
      response: NextResponse.json(
        notFoundError(
          `El grupo ${academicCourseId} no existe o no pertenece a ${course.slug}`
        ),
        { status: 404 }
      ),
    };
  }

  return { ok: true, course };
}

type Ctx = { params: Promise<{ courseSlug: string; academicCourseId: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await authenticateServiceRequest(req, "COURSES_ADMIN_API_KEY");
  } catch (err) {
    return handleAuthError(err);
  }

  try {
    const { courseSlug, academicCourseId } = await params;
    const resolved = await resolveGroup(courseSlug, academicCourseId);
    if (!resolved.ok) return resolved.response;

    const listing = await listServiceTaughtLessons(
      resolved.course,
      academicCourseId
    );
    return NextResponse.json(
      {
        data: {
          course_slug: resolved.course.slug,
          academic_course_id: academicCourseId,
          lessons: listing.lessons,
        },
        meta: listing.meta,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET taught-lessons error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await authenticateServiceRequest(req, "COURSES_ADMIN_API_KEY");
  } catch (err) {
    return handleAuthError(err);
  }

  try {
    const { courseSlug, academicCourseId } = await params;
    const resolved = await resolveGroup(courseSlug, academicCourseId);
    if (!resolved.ok) return resolved.response;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(apiError("bad_request", "JSON malformado"), {
        status: 400,
      });
    }

    const parsed = SetLessonsTaughtSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      return NextResponse.json(validationError(fieldErrors), { status: 422 });
    }

    // D14: se validan TODOS los slugs antes de escribir; si uno falla no se
    // escribe nada.
    const invalid = await findInvalidTaughtSlugs(
      resolved.course,
      academicCourseId,
      parsed.data.lesson_slugs,
      parsed.data.taught
    );
    if (invalid.length > 0) {
      return NextResponse.json(
        apiError(
          "validation_error",
          "Algunos slugs no son lecciones válidas; no se marcó ninguna.",
          { invalid_slugs: invalid }
        ),
        { status: 422 }
      );
    }

    const result = await setServiceLessonsTaught(
      resolved.course,
      academicCourseId,
      parsed.data.lesson_slugs,
      parsed.data.taught
    );

    return NextResponse.json(
      { data: { lessons: result.lessons }, meta: result.meta },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH taught-lessons error:", err);
    return NextResponse.json(internalError(), { status: 500 });
  }
}
