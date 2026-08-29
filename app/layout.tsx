import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AnnouncementBar } from "@/components/navbar/AnnouncementBar";
import { Navbar } from "@/components/navbar/Navbar";
import { ThemeInit } from "@/components/ThemeInit";
import { HeaderHeightObserver } from "@/components/HeaderHeightObserver";
import { getCurrentProfile, getCurrentRoles, getAuthDegradedReason } from "@/lib/auth/session";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Educational Page",
  description:
    "Plataforma educativa para cursos de programación e inteligencia artificial.",
};

const themeInitScript = `
(function () {
  try {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  } catch (_) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // spec-054 (D-F, y hallazgo de TC-054-005): las tres llamadas comparten
  // `getAuthCheck()` (cache()-ada, se resuelve una sola vez), pero cada una
  // hace su propia consulta adicional a Postgres (`profiles`, `user_roles`)
  // — independientes entre sí. Antes iban en serie: con el timeout de datos
  // de la Fase 2 (6s, DEBT-070) aplicado a cada una, una consulta colgada
  // hacía que el layout completo tardara 12s (2 × 6s) en vez de 6s, porque
  // `await` secuencial paga cada timeout por separado. `!profile` es
  // ambiguo — puede ser un visitante realmente anónimo o una sesión válida
  // que no se pudo verificar a tiempo. Sin `degradedReason`, el segundo caso
  // es indistinguible del primero para el usuario: la navbar desaparece y
  // parece que se cerró la sesión.
  const [profile, roles, degradedReason] = await Promise.all([
    getCurrentProfile(),
    getCurrentRoles(),
    getAuthDegradedReason(),
  ]);

  return (
    <html
      lang="es"
      className={`${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="relative min-h-full flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        <div className="fixed inset-0 -z-10 h-screen w-screen [background:radial-gradient(125%_125%_at_50%_10%,var(--color-neutral-primary)_40%,var(--color-brand-medium)_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,var(--color-gray-900)_40%,var(--color-brand-strong)_100%)]" />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <ThemeInit />
        <HeaderHeightObserver />
        {degradedReason && (
          <div
            role="status"
            className="bg-amber-600 dark:bg-amber-700 text-white text-sm py-2 px-4 text-center"
          >
            Estamos con problemas de conexión con el servidor. Tu sesión no se
            ha cerrado — intenta de nuevo en unos segundos.
          </div>
        )}
        {profile && (
          <div data-site-header className="sticky top-0 left-0 w-full z-50">
            <AnnouncementBar />
            <Navbar profile={profile} roles={roles} />
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
