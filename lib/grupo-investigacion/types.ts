export interface ResearchGroupLeader {
  name: string;
  initial: string;
  email: string;
  phone: string;
}

export interface ResearchLine {
  title: string;
  desc: string;
  leader: string;
  researchers: string[];
  projects: string[];
}

export interface ResearchSeedbed {
  name: string;
  leader: string;
  days: string;
  room: string;
}

export interface EngagementOpportunity {
  tag: string;
  title: string;
  desc: string;
}

export interface ResearchGroup {
  name: string;
  desc: string;
  leader: ResearchGroupLeader;
  lines: ResearchLine[];
  seedbeds: ResearchSeedbed[];
  opportunities: EngagementOpportunity[];
}
