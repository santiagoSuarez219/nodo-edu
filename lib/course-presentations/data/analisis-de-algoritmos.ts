import type { CoursePresentation } from "../types";

export const analisisDeAlgoritmos: CoursePresentation = {
  name: "Análisis de algoritmos",
  desc: "Diseño y análisis riguroso de algoritmos: complejidad computacional, técnicas de diseño y problemas clásicos de optimización.",
  program: "Ingeniería en Sistemas / Ciencia de Datos",
  level: "Avanzado",
  credits: 4,
  hours: "20h de contenido",
  classesCount: 26,
  spots: 10,
  startDate: "25 ago 2026",
  enrollDeadline: "18 ago 2026",
  prereqs: ["Estructuras de Datos", "Matemática Discreta"],
  tools: ["Python", "Git", "Visualizadores de algoritmos", "Jupyter", "LaTeX (opcional)"],
  syllabus: [
    {
      n: 1,
      title: "Complejidad computacional",
      topics: [
        "Modelo de cómputo y costo de operaciones",
        "Notaciones asintóticas: O, Ω, Θ",
        "Análisis amortizado y casos promedio",
        "Medición empírica vs. teórica",
      ],
    },
    {
      n: 2,
      title: "Divide y vencerás",
      topics: [
        "Ecuaciones de recurrencia y teorema maestro",
        "Mergesort, Quicksort y análisis",
        "Multiplicación rápida de matrices",
        "Estrategias de partición",
      ],
    },
    {
      n: 3,
      title: "Programación dinámica",
      topics: [
        "Subestructura óptima y solapamiento",
        "Memoización vs. tabulación",
        "Problemas clásicos: mochila, LCS, edit distance",
        "Optimización de espacio",
      ],
    },
    {
      n: 4,
      title: "Algoritmos voraces y grafos",
      topics: [
        "Criterio voraz y demostración de optimalidad",
        "Código de Huffman",
        "Caminos mínimos: Dijkstra, Bellman-Ford",
        "Árbol de expansión mínima: Kruskal y Prim",
      ],
    },
    {
      n: 5,
      title: "Complejidad P, NP y estrategias prácticas",
      topics: [
        "Clases P y NP, verificación polinomial",
        "Reducciones polinomiales",
        "NP-completitud: 3SAT y ejemplos",
        "Aproximación, heurísticas y branch-and-bound",
      ],
    },
  ],
  evaluation: [
    { name: "Tareas analíticas", pct: 20 },
    { name: "Implementación de algoritmos", pct: 30 },
    { name: "Examen parcial", pct: 20 },
    { name: "Proyecto final: resolver problema NP-hard", pct: 30 },
  ],
  dates: [
    { date: "25 ago", label: "Inicio de clases" },
    { date: "22 sep", label: "Examen parcial" },
    { date: "13 oct", label: "Hito 1 del proyecto" },
    { date: "3 nov", label: "Entrega final del proyecto" },
  ],
  conditions: [
    "Asistencia mínima del 80% para optar a evaluación final.",
    "Las pruebas se hacen bajo honor; cualquier violación resulta en descalificación inmediata.",
    "Entregas atrasadas penalizan 12% por día, máximo 3 días.",
    "Se permite discusión conceptual con compañeros, pero el código y análisis deben ser propios.",
    "Uso de recursos externos debe citarse siempre.",
  ],
};
