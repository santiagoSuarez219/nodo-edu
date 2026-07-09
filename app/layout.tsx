import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/navbar/AnnouncementBar";
import { Navbar } from "@/components/navbar/Navbar";
import { getCurrentProfile } from "@/lib/auth/session";

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
    var stored = localStorage.getItem('color-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (_) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <html
      lang="es"
      className={`${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        <div className="sticky top-0 left-0 w-full z-50">
          <AnnouncementBar />
          <Navbar profile={profile} />
        </div>
        {children}
      </body>
    </html>
  );
}
