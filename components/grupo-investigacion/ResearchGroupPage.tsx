import type { ResearchGroup } from "@/lib/grupo-investigacion";
import { ResearchGroupHero } from "./ResearchGroupHero";
import { ResearchLines } from "./ResearchLines";
import { ResearchSeedbeds } from "./ResearchSeedbeds";
import { EngagementOpportunities } from "./EngagementOpportunities";
import { OtherSeedbedsCta } from "./OtherSeedbedsCta";

interface ResearchGroupPageProps {
  group: ResearchGroup;
}

export function ResearchGroupPage({ group }: ResearchGroupPageProps) {
  return (
    <div className="bg-white dark:bg-gray-900">
      <ResearchGroupHero group={group} />
      <ResearchLines lines={group.lines} />
      <ResearchSeedbeds seedbeds={group.seedbeds} />
      <EngagementOpportunities opportunities={group.opportunities} />
      <OtherSeedbedsCta />
    </div>
  );
}
