const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

interface ParseYouTubeVideoIdInput {
  id?: string;
  url?: string;
}

function extractIdFromUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const candidate = parsed.pathname.slice(1);
    return VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      const candidate = parsed.searchParams.get("v");
      return candidate && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
    }
    const embedMatch = parsed.pathname.match(/^\/embed\/([^/]+)$/);
    if (embedMatch) {
      return VIDEO_ID_PATTERN.test(embedMatch[1]) ? embedMatch[1] : null;
    }
  }

  return null;
}

/**
 * Resuelve un ID de video de YouTube válido a partir de un `id` directo o
 * una `url` en los formatos `watch?v=`, `youtu.be/` o `youtube.com/embed/`.
 * Lanza si ninguno de los dos produce un ID válido.
 */
export function parseYouTubeVideoId({ id, url }: ParseYouTubeVideoIdInput): string {
  if (id) {
    if (VIDEO_ID_PATTERN.test(id)) return id;
    throw new Error(`El id de video "${id}" no tiene un formato válido de YouTube.`);
  }

  if (url) {
    const extracted = extractIdFromUrl(url);
    if (extracted) return extracted;
    throw new Error(`La url "${url}" no corresponde a un video de YouTube válido.`);
  }

  throw new Error("YouTubeEmbed requiere la prop \"id\" o \"url\".");
}
