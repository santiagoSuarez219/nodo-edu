import {
  LandingCourse,
  ResumeState,
  RoadmapStep,
  Teacher,
  FooterLink,
} from "./types";

export const LANDING_COURSES: LandingCourse[] = [
  {
    id: "estruc-datos",
    slug: "estructuras-de-datos",
    name: "Estructuras de Datos",
    level: "Intermedio",
    hours: 40,
    description:
      "Aprende las estructuras fundamentales: listas, árboles, grafos y más.",
    progress: 60,
  },
  {
    id: "algoritmos",
    slug: "algoritmos",
    name: "Algorítmica",
    level: "Avanzado",
    hours: 45,
    description:
      "Domina los algoritmos clásicos de ordenamiento, búsqueda y optimización.",
    progress: 35,
  },
  {
    id: "python-fund",
    slug: "python-fundamentals",
    name: "Python Fundamentals",
    level: "Básico",
    hours: 30,
    description:
      "Comienza con Python: sintaxis, tipos de datos y control de flujo.",
    progress: 85,
  },
  {
    id: "ml-basico",
    slug: "machine-learning-basico",
    name: "Machine Learning Básico",
    level: "Avanzado",
    hours: 50,
    description: "Introducción a redes neuronales, clasificación y regresión.",
    progress: 25,
  },
  {
    id: "web-dev",
    slug: "desarrollo-web",
    name: "Desarrollo Web",
    level: "Intermedio",
    hours: 35,
    description: "Construye aplicaciones web modernas con React y Next.js.",
    progress: 70,
  },
];

export const RESUME_STATE: ResumeState = {
  courseName: "Estructuras de Datos",
  lessonName: "Árboles balanceados",
  progress: 72,
  href: "/cursos/estructuras-de-datos/arboles-balanceados",
};

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    number: 1,
    title: "Elige tu curso",
    description:
      "Explora nuestro catálogo y selecciona el curso que se ajuste a tu nivel.",
  },
  {
    number: 2,
    title: "Aprende a tu ritmo",
    description:
      "Accede a las lecciones cuando quieras, desde cualquier dispositivo.",
  },
  {
    number: 3,
    title: "Practica con ejercicios",
    description: "Refuerza lo aprendido con ejercicios y proyectos prácticos.",
  },
  {
    number: 4,
    title: "Obtén reconocimiento",
    description: "Completa el curso y recibe tu certificado de finalización.",
  },
];

export const MAIN_TEACHER: Teacher = {
  name: "Santiago Suarez Cortes - Docente principal",
  role: "Docente de catedra - Instituto Tecnologico Metropolitano",
  bio: "Comprometidos con la excelencia en educación tecnológica para ingenieros del futuro.",
  initial: "S",
};

export const FOOTER_LINKS: FooterLink[] = [
  {
    label: "GitHub",
    href: "https://github.com",
  },
  {
    label: "Documentación",
    href: "/docs",
  },
  {
    label: "Contacto",
    href: "mailto:contact@nodo.edu",
  },
];
