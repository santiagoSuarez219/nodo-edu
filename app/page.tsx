import { Metadata } from 'next';
import {
  Hero,
  CourseScroller,
  HowItWorks,
  TeacherBar,
  LandingFooter,
} from '@/components/landing';
import {
  LANDING_COURSES,
  RESUME_STATE,
  ROADMAP_STEPS,
  MAIN_TEACHER,
  FOOTER_LINKS,
} from '@/lib/landing';

export const metadata: Metadata = {
  title: 'nodo — Plataforma educativa de programación e IA',
  description:
    'Aprende programación e inteligencia artificial con cursos diseñados para ingenieros de sistemas, electrónicos y ciencias de datos.',
};

export default function Home() {
  return (
    <main className="bg-white dark:bg-gray-900 pt-6 lg:pt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-13">
        <Hero resumeState={RESUME_STATE} />
        <CourseScroller courses={LANDING_COURSES} />
        <HowItWorks steps={ROADMAP_STEPS} />
        <TeacherBar teacher={MAIN_TEACHER} />
        <LandingFooter links={FOOTER_LINKS} />
      </div>
    </main>
  );
}
