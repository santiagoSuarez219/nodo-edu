"use client";

import Link from "next/link";
import { useState } from "react";

const sectionLinks = [
  { href: "/estructuras-de-datos", label: "Estructuras de datos" },
  { href: "/programacion-cientifica", label: "Programación científica" },
  { href: "/analisis-de-algoritmos", label: "Análisis de algoritmos" },
] as const;

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between w-full mx-auto px-4 md:px-6 lg:px-8 py-3 lg:py-4">
          <Link
            href="/"
            className="flex gap-3 items-center text-gray-900 dark:text-white transition-colors duration-300"
            aria-label="Inicio — Semillero SITAIM"
            onClick={closeMenu}
          >
            <span className="text-lg lg:text-xl font-bold tracking-tight">
              Semillero SITAIM
            </span>
          </Link>

          <ul className="hidden lg:flex gap-7 text-sm tracking-tight font-semibold text-gray-600 dark:text-gray-300">
            {sectionLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors hover:text-blue-700 dark:hover:text-blue-400"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex gap-3 items-center">
            <Link
              href="/login"
              className="hidden lg:inline-flex items-center px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            >
              Iniciar sesión
            </Link>

            <button
              type="button"
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`size-7 transition-transform duration-300 ${
                  isMenuOpen ? "rotate-90" : "rotate-0"
                }`}
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
        className={`lg:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4 text-base tracking-tight border-t border-gray-200 dark:border-gray-700">
          {sectionLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={closeMenu}
                className="block py-3 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-2">
            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 py-3 text-center text-sm font-bold text-white transition-colors"
            >
              Iniciar sesión
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};
