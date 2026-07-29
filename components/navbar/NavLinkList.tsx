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
      ? "text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      : "block py-3 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors";

  const disabledClass =
    variant === "desktop"
      ? "text-sm font-semibold text-gray-400 dark:text-gray-600 cursor-not-allowed"
      : "block py-3 text-gray-400 dark:text-gray-600 cursor-not-allowed";

  return (
    <div className={containerClass}>
      {links.map((link) => (
        <div
          key={link.label}
          className={variant === "mobile" ? undefined : ""}
        >
          {link.disabled ? (
            <span
              className={disabledClass}
              aria-disabled="true"
              title={link.title}
            >
              {link.label}
            </span>
          ) : (
            <Link
              href={link.href || "#"}
              onClick={onNavigate}
              className={itemClass}
            >
              {link.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
