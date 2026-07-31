"use client";

import { useEffect } from "react";

const HEADER_SELECTOR = "[data-site-header]";

export function HeaderHeightObserver() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(HEADER_SELECTOR);
    if (!header) {
      document.documentElement.style.setProperty("--header-height", "0px");
      return;
    }

    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
      );
    };

    setHeight();

    const observer = new ResizeObserver(setHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return null;
}
