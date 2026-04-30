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

export async function getLessonArticle(
  courseSlug: string,
  articleSlug: string,
): Promise<LessonArticle | null> {
  const filePath = path.join(CONTENT_ROOT, courseSlug, `${articleSlug}.mdx`);
  try {
    const file = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(file);
    return {
      frontmatter: data as LessonArticleFrontmatter,
      rawSource: content,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}
