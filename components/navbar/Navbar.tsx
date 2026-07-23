"use client";

import Link from "next/link";
import { useState } from "react";
import type { Profile } from "@/lib/students/types";
import type { AppRole } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { UserMenu } from "./UserMenu";
import Image from 'next/image'


export const Navbar = ({
  profile,
  roles = [],
}: {
  profile?: Profile | null;
  roles?: AppRole[];
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isTeacher = roles.includes("teacher") || roles.includes("admin");
  const misCursosHref = isTeacher ? "/admin/courses" : "/cuenta/cursos";

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 ">
        <div className="flex items-center justify-between w-full mx-auto px-4 md:px-6 lg:px-18 py-3 lg:py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="bg-white rounded-lg py-1 px-2"
              aria-label="Inicio"
              onClick={closeMenu}
            >
              <Image
                src="/logo.png"
                width={150}
                height={70}
                alt="logo"
                className="overflow-hidden"
              />
            </Link>
            <Link
              href="/grupo-investigacion"
              onClick={closeMenu}
              className="hidden lg:inline-flex text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              Grupo de Investigación
            </Link>
          </div>

          <div className="flex gap-3 items-center">
            {profile ? (
              <div className="hidden lg:block">
                <UserMenu profile={profile} misCursosHref={misCursosHref} />
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:inline-flex items-center px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 dark:focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
              >
                Iniciar sesión
              </Link>
            )}

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
                className={`size-7 transition-transform duration-300 ${isMenuOpen ? "rotate-90" : "rotate-0"
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
        className={`lg:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out ${isMenuOpen
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none -translate-y-2"
          }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4 text-base tracking-tight border-t border-gray-200 dark:border-gray-700">
          <li>
            <Link
              href="/grupo-investigacion"
              onClick={closeMenu}
              className="block py-3 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              Grupo de Investigación
            </Link>
          </li>
          {profile ? (
            <>
              <li className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                <p className="px-1 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                  {profile.full_name}
                </p>
              </li>
              <li>
                <Link
                  href="/cuenta"
                  onClick={closeMenu}
                  className="block py-3 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                >
                  Mi cuenta
                </Link>
              </li>
              <li>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="block w-full text-left py-3 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </form>
              </li>
            </>
          ) : (
            <li className="mt-2">
              <Link
                href="/login"
                onClick={closeMenu}
                className="block w-full rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 py-3 text-center text-sm font-bold text-white transition-colors"
              >
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};
