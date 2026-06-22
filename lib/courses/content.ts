import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Frontera única para resolver el cuerpo del artículo de una lección.
// Fase 1: lee MDX desde el filesystem. Fase 2: consultará Payload.
// Cambia la implementación, no la firma.

export interface LessonArticleFrontmatter {
  title?: string;
  summary?: string;
  updatedAt?: string;
  cover?: string;
}

export interface LessonArticle {
  frontmatter: LessonArticleFrontmatter;
  rawSource: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "cursos");

const WELCOME_SLUG = "bienvenida-al-curso";

export async function getCourseWelcome(
  courseSlug: string,
): Promise<LessonArticle | null> {
  return getLessonArticle(courseSlug, WELCOME_SLUG);
}

export async function getLessonArticle(
  courseSlug: string,
  articleSlug: string,
): Promise<LessonArticle | null> {
  const filePath = path.join(CONTENT_ROOT, courseSlug, `${articleSlug}.mdx`);
  try {
    const file = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(file);
    return {
      frontmatter: normalizeFrontmatter(data),
      rawSource: content,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

function normalizeFrontmatter(data: Record<string, unknown>): LessonArticleFrontmatter {
  const out: LessonArticleFrontmatter = {};
  if (typeof data.title === "string") out.title = data.title;
  if (typeof data.summary === "string") out.summary = data.summary;
  if (typeof data.cover === "string") out.cover = data.cover;
  if (data.updatedAt instanceof Date) {
    out.updatedAt = data.updatedAt.toISOString().slice(0, 10);
  } else if (typeof data.updatedAt === "string") {
    out.updatedAt = data.updatedAt;
  }
  return out;
}
