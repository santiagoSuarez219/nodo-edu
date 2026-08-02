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
import type { Course, Lesson } from "@/lib/courses";
import {
  getServiceLessonAvailability,
  setServiceLessonAvailability,
} from "@/lib/courses/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireCoursesAdminAuth(req: NextRequest) {
  await authenticateServiceRequest(req, "COURSES_ADMIN_API_KEY");
}

/**
 * `reason` junto a `enabled: true` es 422, no un campo ignorado en silencio:
 * indica que el agente se equivocó de dirección y conviene que lo sepa (M3).
 */
const SetLessonAvailabilitySchema = z
  .object({
    enabled: z.boolean(),
    reason: z
      .string()
      .max(280, "El motivo no puede superar los 280 caracteres")
      .optional(),
  })
  .refine((body) => !(body.enabled === true && body.reason !== undefined), {
    message:
      "`reason` solo es válido al deshabilitar (enabled: false); no se acepta con enabled: true.",
    path: ["reason"],
  });

type AuthFailure = { response: NextResponse };

function handleAuthError(err: unknown): AuthFailure {
  if (err instanceof AuthenticationError) {
    return {
      response: NextResponse.json(unauthorizedError(err.message), {
        status: 401,
      }),
    };
  }
  // Falta COURSES_ADMIN_API_KEY en el entorno: error de configuración del
  // servidor, no de credenciales del llamador — nunca 401.
  console.error("COURSES_ADMIN_API_KEY error de configuración:", err);
  return {
    response: NextResponse.json(configurationError("Servicio mal configurado."), {
      status: 500,
    }),
  };
}

/**
 * Resuelve curso y lección contra el catálogo estático. Se ejecuta ANTES de
 * cualquier consulta a Supabase: un slug mal escrito nunca debe crear una fila
 * ni devolver una falsa sensación de éxito (M3).
 */
async function resolveCatalog(
  courseSlug: string,
  lessonSlug: string
): Promise<
  { ok: true; course: Course; lesson: Lesson } | { ok: false; response: NextResponse }
> {
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

  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) {
    return {
      ok: false,
      response: NextResponse.json(
        notFoundError(`Lección no encontrada en ${course.slug}: ${lessonSlug}`),
        { status: 404 }
      ),
    };
  }

  return { ok: true, course, lesson };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    await requireCoursesAdminAuth(req);
  } catch (err) {
    return handleAuthError(err).response;
  }

  try {
    const { courseSlug, lessonSlug } = await params;
    const resolved = await resolveCatalog(courseSlug, lessonSlug);
    if (!resolved.ok) return resolved.response;

    const availability = await getServiceLessonAvailability(
      resolved.course,
      resolved.lesson
    );
    return NextResponse.json({ data: availability }, { status: 200 });
  } catch (err) {
    console.error(
      "GET /api/courses/[courseSlug]/lessons/[lessonSlug] error:",
      err
    );
    return NextResponse.json(internalError(), { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    await requireCoursesAdminAuth(req);
  } catch (err) {
    return handleAuthError(err).response;
  }

  try {
    const { courseSlug, lessonSlug } = await params;
    const resolved = await resolveCatalog(courseSlug, lessonSlug);
    if (!resolved.ok) return resolved.response;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(apiError("bad_request", "JSON malformado"), {
        status: 400,
      });
    }

    const parsed = SetLessonAvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      return NextResponse.json(validationError(fieldErrors), { status: 422 });
    }

    const result = await setServiceLessonAvailability(
      resolved.course,
      resolved.lesson,
      parsed.data
    );

    return NextResponse.json(
      { data: result.availability, meta: { changed: result.changed } },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "PATCH /api/courses/[courseSlug]/lessons/[lessonSlug] error:",
      err
    );
    return NextResponse.json(internalError(), { status: 500 });
  }
}
