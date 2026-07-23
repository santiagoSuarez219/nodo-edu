"use client";

import { useMemo, useState } from "react";
import { parseYouTubeVideoId } from "@/lib/mdx/youtube";

interface YouTubeEmbedProps {
  id?: string;
  url?: string;
  title?: string;
  start?: number;
}

const DEFAULT_TITLE = "Video de YouTube";

export function YouTubeEmbed({ id, url, title, start }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const result = useMemo(() => {
    try {
      return { videoId: parseYouTubeVideoId({ id, url }), error: null as string | null };
    } catch (err) {
      return {
        videoId: null as string | null,
        error: err instanceof Error ? err.message : "No se pudo resolver el video de YouTube.",
      };
    }
  }, [id, url]);

  if (result.error) {
    return (
      <div className="my-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
          No se pudo renderizar el video de YouTube
        </p>
        <p className="mt-1 text-sm text-red-700 dark:text-red-400">{result.error}</p>
      </div>
    );
  }

  const videoId = result.videoId as string;

  const accessibleTitle = title ?? DEFAULT_TITLE;
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1${
    typeof start === "number" ? `&start=${start}` : ""
  }`;

  return (
    <div className="my-6 aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
      {isPlaying ? (
        <iframe
          className="h-full w-full"
          src={embedSrc}
          title={accessibleTitle}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Reproducir: ${accessibleTitle}`}
          className="group relative block h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-lg transition-transform group-hover:scale-105 dark:bg-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
