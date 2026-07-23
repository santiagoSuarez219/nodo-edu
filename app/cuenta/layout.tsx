export default function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto">
      {children}
    </div>
  );
}
