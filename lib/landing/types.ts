export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado';

export interface LandingCourse {
  id: string;
  slug: string;
  name: string;
  level: CourseLevel;
  hours: number;
  description: string;
  progress: number; // 0-100
}

export interface ResumeState {
  courseName: string;
  lessonName: string;
  progress: number; // 0-100
  href: string;
}

export interface RoadmapStep {
  number: number;
  title: string;
  description: string;
}

export interface Teacher {
  name: string;
  role: string;
  bio: string;
  initial: string;
}

export interface FooterLink {
  label: string;
  href: string;
}
