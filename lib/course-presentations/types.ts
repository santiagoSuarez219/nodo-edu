export interface SyllabusUnit {
  n: number;
  title: string;
  week: string;
  topics: string[];
}

export interface EvaluationItem {
  name: string;
  pct: number;
  week: string;
}

export interface BibliographyItem {
  title: string;
  author: string;
  edition?: string;
}

export interface ImportantDate {
  date: string;
  label: string;
}

export interface Instructor {
  name: string;
  credentials: string;
  department: string;
  researchGroup: string;
  email: string;
  office: string;
}

export interface CoursePresentation {
  name: string;
  desc: string;
  program: string;
  level: string;
  credits: number;
  modality: string;
  weeklyHours: string;
  independentHours: string;
  spots: number;
  prereqs: string[];
  tools: string[];
  syllabus: SyllabusUnit[];
  evaluation: EvaluationItem[];
  dates: ImportantDate[];
  bibliography: BibliographyItem[];
  conditions: string[];
}
