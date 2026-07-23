export default function CursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-18">
      {children}
    </div>
  );
}
