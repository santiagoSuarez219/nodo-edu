"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import type { Profile } from "@/lib/students/types";
import type { AppRole } from "@/lib/auth/session";
import type { AcademicCourse } from "@/lib/academic-courses/types";
import { signOut } from "@/lib/auth/actions";
import { UserMenu } from "./UserMenu";
import { NavLinkList } from "./NavLinkList";
import { CourseScopeSelect } from "./CourseScopeSelect";
import { getStudentNavLinks, getTeacherNavLinks } from "./navLinks";
import Image from "next/image";

export const Navbar = ({
  profile,
  roles = [],
  teacherCourses = [],
}: {
  profile?: Profile | null;
  roles?: AppRole[];
  teacherCourses?: AcademicCourse[];
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const params = useParams();

  const isTeacher = roles.includes("teacher") || roles.includes("admin");
  const misCursosHref = isTeacher ? "/admin/courses" : "/cuenta/cursos";
  const academicCourseId = params.academicCourseId as string | undefined;

  const toggleMenu = () => setIsMenuOpen((p) => !p);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = isTeacher
    ? getTeacherNavLinks(academicCourseId || null)
    : getStudentNavLinks();

  return (
    <>
      <nav className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur transition-colors duration-300">
        <div className="flex items-center justify-between w-full mx-auto px-4 md:px-6 lg:px-18 py-3 lg:py-4">
          <div className="flex items-center gap-6 flex-1">
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
            <NavLinkList links={navLinks} variant="desktop" />
            {isTeacher && (
              <CourseScopeSelect courses={teacherCourses} />
            )}
          </div>

          <div className="flex gap-3 items-center">
            <div className="hidden lg:block">
              <UserMenu profile={profile!} misCursosHref={misCursosHref} />
            </div>

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
          {isTeacher && (
            <li className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <CourseScopeSelect
                courses={teacherCourses}
                onNavigate={closeMenu}
              />
            </li>
          )}
          <li>
            <NavLinkList
              links={navLinks}
              variant="mobile"
              onNavigate={closeMenu}
            />
          </li>
          <li className="mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
            <p className="px-1 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
              {profile?.full_name}
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
        </ul>
      </div>
    </>
  );
};
