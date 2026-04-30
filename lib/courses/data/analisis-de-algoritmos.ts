import type { Course } from "../types";

export const analisisDeAlgoritmos: Course = {
  slug: "analisis-de-algoritmos",
  title: "Análisis de algoritmos",
  summary:
    "Diseño y análisis riguroso de algoritmos: complejidad, técnicas de diseño y problemas clásicos de optimización.",
  audience: ["ingenieria-de-sistemas", "ciencia-de-datos"],
  level: "avanzado",
  lessons: [
    {
      id: "complejidad",
      order: 1,
      title: "Complejidad computacional",
      topics: [
        { title: "Modelo de cómputo y costo" },
        { title: "Notaciones O, Ω, Θ" },
        { title: "Análisis amortizado" },
      ],
    },
    {
      id: "divide-y-venceras",
      order: 2,
      title: "Divide y vencerás",
      topics: [
        { title: "Recurrencias y teorema maestro" },
        { title: "Mergesort y quicksort" },
        { title: "Multiplicación rápida" },
      ],
    },
    {
      id: "programacion-dinamica",
      order: 3,
      title: "Programación dinámica",
      topics: [
        { title: "Subestructura óptima y solapamiento" },
        { title: "Memoización vs. tabulación" },
        { title: "Problemas clásicos: mochila, LCS, edit distance" },
      ],
    },
    {
      id: "algoritmos-voraces",
      order: 4,
      title: "Algoritmos voraces",
      topics: [
        { title: "Criterio voraz y demostración de optimalidad" },
        { title: "Huffman" },
        { title: "Caminos mínimos: Dijkstra" },
        { title: "Árbol de expansión mínima: Kruskal y Prim" },
      ],
    },
    {
      id: "complejidad-np",
      order: 5,
      title: "P, NP y reducciones",
      topics: [
        { title: "Clases P y NP" },
        { title: "Reducciones polinomiales" },
        { title: "NP-completitud" },
        { title: "Estrategias prácticas: aproximación y heurísticas" },
      ],
    },
  ],
};
