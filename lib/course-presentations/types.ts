export interface SyllabusUnit {
  n: number;
  title: string;
  topics: string[];
}

export interface EvaluationItem {
  name: string;
  pct: number;
}

export interface ImportantDate {
  date: string;
  label: string;
}

export interface CoursePresentation {
  name: string;
  desc: string;
  program: string;
  level: string;
  credits: number;
  hours: string;
  classesCount: number;
  spots: number;
  startDate: string;
  enrollDeadline: string;
  prereqs: string[];
  tools: string[];
  syllabus: SyllabusUnit[];
  evaluation: EvaluationItem[];
  dates: ImportantDate[];
  conditions: string[];
}
