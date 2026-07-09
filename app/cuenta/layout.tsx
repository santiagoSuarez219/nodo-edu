import Link from "next/link";

export default function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="w-full max-w-2xl mx-auto px-4 md:px-6 pt-10 lg:pt-24">
        <nav className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/cuenta"
            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Mi cuenta
          </Link>
          <Link
            href="/cuenta/cursos"
            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Mis cursos
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
