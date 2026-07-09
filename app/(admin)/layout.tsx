import Link from "next/link";
import { requireAnyRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["teacher", "admin"]);

  return (
    <div className="flex-1 flex min-h-0">
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pt-6 pb-8 px-3 gap-1">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Panel docente
        </p>
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Mis cursos
        </Link>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile nav strip */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Link
            href="/admin/courses"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Mis cursos
          </Link>
        </div>

        <main className="flex-1 px-4 md:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
