import { requireAnyRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyRole(["teacher", "admin"]);

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-18 py-8">
        {children}
      </main>
    </div>
  );
}
