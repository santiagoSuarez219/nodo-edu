import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AnnouncementBar } from "@/components/navbar/AnnouncementBar";
import { Navbar } from "@/components/navbar/Navbar";
import { ThemeInit } from "@/components/ThemeInit";
import { HeaderHeightObserver } from "@/components/HeaderHeightObserver";
import { getCurrentProfile, getCurrentRoles } from "@/lib/auth/session";
import { getCoursesByTeacher } from "@/lib/academic-courses";

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
  const profile = await getCurrentProfile();
  const roles = await getCurrentRoles();

  const isTeacher = roles.includes("teacher") || roles.includes("admin");
  const teacherCourses = isTeacher && profile ? await getCoursesByTeacher(profile.id) : [];

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
        {profile && (
          <div data-site-header className="sticky top-0 left-0 w-full z-50">
            <AnnouncementBar />
            <Navbar profile={profile} roles={roles} teacherCourses={teacherCourses} />
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
