import type { Metadata } from "next";
import { RESEARCH_GROUP } from "@/lib/grupo-investigacion";
import { ResearchGroupPage } from "@/components/grupo-investigacion/ResearchGroupPage";
import { LandingFooter } from "@/components/landing";
import { FOOTER_LINKS } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Grupo de Investigación — Nodo",
  description: RESEARCH_GROUP.desc,
};

export default function Page() {
  return (
    <main className="flex-1 bg-white dark:bg-gray-900">
      <ResearchGroupPage group={RESEARCH_GROUP} />

      <div className="border-t border-gray-200 dark:border-gray-700" />

      <div className="w-full 2xl:max-w-7xl lg:px-18 mx-auto px-6 py-8">
        <LandingFooter links={FOOTER_LINKS} />
      </div>
    </main>
  );
}
