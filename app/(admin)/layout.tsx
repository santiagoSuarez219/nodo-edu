import Link from "next/link";
import { requireAnyRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["teacher", "admin"]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Mobile nav strip */}
      <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <Link
          href="/admin/courses"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Mis cursos
        </Link>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-18 py-8">
        {children}
      </main>
    </div>
  );
}
