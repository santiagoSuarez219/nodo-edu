"use client";

import { useEffect } from "react";

function applyTheme(prefersDark: boolean) {
  try {
    document.documentElement.classList.toggle("dark", prefersDark);
  } catch (_) {}
}

export function ThemeInit() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(media.matches);

    const handleChange = (event: MediaQueryListEvent) => applyTheme(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return null;
}
