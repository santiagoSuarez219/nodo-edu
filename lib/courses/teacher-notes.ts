import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { hasCourseAccess } from "@/lib/enrollments/access";

// spec-044: apuntes docente por sección (lección o guía) — referencia en vivo
// de ejercicios/código para la clase, sin minutado ni objetivos de sesión.
// Distinto y separado del material de planificación completo que vive en
// content/cursos/<curso>/microdiseno/ (ese sigue sin publicarse; este módulo
// es el único punto del runtime que lee de apuntes/, nunca de microdiseno/).
//
// Resolución implícita por convención de nombre sobre `articleSlug` (sin
// campo nuevo en `Lesson`), igual que `getLessonArticle` en `content.ts`.

const CONTENT_ROOT = path.join(process.cwd(), "content", "cursos");

// Evita que un segmento de ruta (courseSlug o articleSlug) escape de
// CONTENT_ROOT (path traversal). Los slugs válidos del catálogo nunca
// contienen separadores; esto es una defensa, no una validación de negocio.
function isSafePathSegment(segment: string): boolean {
  return !segment.includes("/") && !segment.includes("\\") && !segment.includes("..");
}

export function resolveTeacherNotesPath(courseSlug: string, articleSlug: string): string {
  return path.join(CONTENT_ROOT, courseSlug, "apuntes", `${articleSlug}.md`);
}

/**
 * Gate compartido: `owner`/`admin` del curso y segmentos de ruta seguros.
 * Ambas funciones públicas de este módulo lo evalúan antes de tocar el
 * filesystem, para que invocar cualquiera directamente (ej. como Server
 * Action) nunca filtre contenido ni señal de existencia a un estudiante.
 */
async function canReadTeacherNotes(courseSlug: string, articleSlug: string): Promise<boolean> {
  const access = await hasCourseAccess(courseSlug);
  if (!access.ok || (access.reason !== "owner" && access.reason !== "admin")) {
    return false;
  }
  return isSafePathSegment(courseSlug) && isSafePathSegment(articleSlug);
}

/**
 * Devuelve el cuerpo Markdown de los apuntes docente de una sección, o
 * `null` si no hay apuntes para ella, si el usuario actual no es owner/admin
 * del curso, o si ocurre cualquier error de lectura/parseo.
 */
export async function getTeacherLessonNotes(
  courseSlug: string,
  articleSlug: string
): Promise<string | null> {
  if (!(await canReadTeacherNotes(courseSlug, articleSlug))) return null;

  const filePath = resolveTeacherNotesPath(courseSlug, articleSlug);
  try {
    const file = await fs.readFile(filePath, "utf8");
    const { content } = matter(file);
    return content;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    console.error("[getTeacherLessonNotes] fallo al leer apuntes docente:", err);
    return null;
  }
}

/**
 * Comprobación liviana de existencia, para decidir si mostrar el botón
 * "Apuntes de clase" en el header de la lección sin leer ni parsear el
 * Markdown completo (eso lo hace la ruta dedicada `/apuntes` bajo demanda).
 * Mismo gate y mismo tratamiento de errores que `getTeacherLessonNotes`.
 */
export async function hasTeacherLessonNotes(
  courseSlug: string,
  articleSlug: string
): Promise<boolean> {
  if (!(await canReadTeacherNotes(courseSlug, articleSlug))) return false;

  const filePath = resolveTeacherNotesPath(courseSlug, articleSlug);
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    console.error("[hasTeacherLessonNotes] fallo al comprobar apuntes docente:", err);
    return false;
  }
}
