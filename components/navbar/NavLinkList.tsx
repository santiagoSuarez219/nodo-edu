"use client";

import Link from "next/link";
import type { NavLink } from "./navLinks";

export function NavLinkList({
  links,
  variant = "desktop",
  onNavigate,
}: {
  links: NavLink[];
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const containerClass =
    variant === "desktop"
      ? "hidden lg:flex gap-6 items-center"
      : "flex flex-col gap-0";

  const itemClass =
    variant === "desktop"
      ? "text-sm font-semibold text-body dark:text-gray-300 hover:text-fg-brand dark:hover:text-blue-400 transition-colors"
      : "block py-3 text-body dark:text-gray-300 hover:text-fg-brand dark:hover:text-blue-400 transition-colors";

  const disabledClass =
    variant === "desktop"
      ? "text-sm font-semibold text-fg-disabled dark:text-gray-600 cursor-not-allowed"
      : "block py-3 text-fg-disabled dark:text-gray-600 cursor-not-allowed";

  return (
    <div className={containerClass}>
      {links.map((link) =>
        link.disabled ? (
          <span
            key={link.label}
            className={disabledClass}
            aria-disabled="true"
          >
            {link.label}
            {link.title && <span className="sr-only"> ({link.title})</span>}
          </span>
        ) : (
          <Link
            key={link.label}
            href={link.href || "#"}
            onClick={onNavigate}
            className={itemClass}
          >
            {link.label}
          </Link>
        )
      )}
    </div>
  );
}
