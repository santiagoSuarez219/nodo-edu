import type { CoursePresentation } from "../types";

export const estructurasDatos: CoursePresentation = {
  name: "Estructuras de Datos",
  desc: "Estudio de las estructuras fundamentales para organizar y manipular información de forma eficiente: pilas, colas, listas enlazadas, árboles y grafos, con implementación práctica en Python.",
  program: "Ingeniería en Sistemas",
  level: "Intermedio",
  credits: 4,
  hours: "18h de contenido",
  classesCount: 24,
  spots: 12,
  startDate: "11 ago 2026",
  enrollDeadline: "4 ago 2026",
  prereqs: ["Programación I", "Matemática Discreta"],
  tools: ["Python", "Git", "Jupyter Notebook", "VS Code", "GitHub Classroom"],
  syllabus: [
    {
      n: 1,
      title: "Estructuras lineales",
      topics: [
        "Pilas y colas",
        "Listas enlazadas simples y dobles",
        "Análisis de complejidad temporal",
      ],
    },
    {
      n: 2,
      title: "Árboles",
      topics: [
        "Árboles binarios de búsqueda",
        "Balanceo: AVL y Rojo-Negro",
        "Recorridos y aplicaciones",
      ],
    },
    {
      n: 3,
      title: "Grafos",
      topics: [
        "Representación y recorridos (BFS/DFS)",
        "Caminos mínimos",
        "Árboles de expansión mínima",
      ],
    },
    {
      n: 4,
      title: "Estructuras avanzadas",
      topics: ["Tablas hash", "Heaps y colas de prioridad", "Tries"],
    },
  ],
  evaluation: [
    { name: "Tareas y ejercicios", pct: 30 },
    { name: "Proyecto final", pct: 30 },
    { name: "Examen parcial", pct: 20 },
    { name: "Examen final", pct: 20 },
  ],
  dates: [
    { date: "11 ago", label: "Inicio de clases" },
    { date: "15 sep", label: "Examen parcial" },
    { date: "10 oct", label: "Entrega proyecto final" },
    { date: "24 oct", label: "Examen final" },
  ],
  conditions: [
    "Asistencia mínima del 80% para optar a evaluación final.",
    "Entregas fuera de plazo penalizan 10% por día, hasta 3 días.",
    "Se permite un máximo de 2 reprogramaciones de clase por estudiante.",
    "El uso de asistentes de IA en entregas debe declararse explícitamente.",
  ],
};
