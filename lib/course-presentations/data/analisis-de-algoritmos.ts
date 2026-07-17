import type { CoursePresentation } from "../types";
import { TRANSVERSAL_CONDITIONS } from "./transversal";

export const analisisDeAlgoritmos: CoursePresentation = {
  name: "Análisis de algoritmos",
  desc: "Diseño y análisis riguroso de algoritmos: complejidad computacional, técnicas de diseño y problemas clásicos de optimización.",
  program: "Ingeniería en Sistemas / Ciencia de Datos",
  level: "Avanzado",
  credits: 4,
  // NOTE: datos provisionales, pendientes de microdiseño real — actualizar en spec futuro
  modality: "Presencial",
  weeklyHours: "5 h/semana",
  independentHours: "7 h/semana",
  spots: 10,
  prereqs: ["Estructuras de Datos", "Matemática Discreta"],
  tools: ["Python", "Git", "Visualizadores de algoritmos", "Jupyter", "LaTeX (opcional)"],
  syllabus: [
    {
      n: 1,
      week: "Semanas 1-3",
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
      week: "Semanas 4-6",
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
      week: "Semanas 7-9",
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
      week: "Semanas 10-12",
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
      week: "Semanas 13-15",
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
  conditions: TRANSVERSAL_CONDITIONS,
};
