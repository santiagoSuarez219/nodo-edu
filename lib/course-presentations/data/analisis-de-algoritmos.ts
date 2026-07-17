import type { CoursePresentation } from "../types";
import { TRANSVERSAL_CONDITIONS } from "./transversal";

export const analisisDeAlgoritmos: CoursePresentation = {
  name: "Introducción al Análisis de Algoritmos",
  desc: "Estudio de la complejidad computacional y las técnicas fundamentales de diseño de algoritmos siguiendo a Cormen et al.: recurrencias, divide y vencer, ordenamiento, estructuras de datos, programación dinámica y algoritmos voraces. Cinco laboratorios evaluativos documentados como informes en GitHub, con implementación práctica en Python.",
  program: "Ingeniería de Sistemas",
  level: "Intermedio",
  credits: 3,
  modality: "Virtual",
  weeklyHours: "4 h/semana sincrónicas",
  independentHours: "5 h/semana independientes",
  spots: 10,
  prereqs: [],
  tools: ["Python 3.x", "Visual Studio Code", "Git y GitHub", "Markdown"],
  syllabus: [
    {
      n: 1,
      week: "Semana 1",
      title: "Git y manejo de repositorios",
      topics: [
        "Control de versiones y flujo de trabajo con Git",
        "Repositorios remotos, ramas y GitHub",
        "Estructura del repositorio del curso (laboratorios, ejercicios, benchmarks)",
        "Escritura de README.md en Markdown",
      ],
    },
    {
      n: 2,
      week: "Semana 2",
      title: "Introducción a Python",
      topics: [
        "Sintaxis: tipos de datos, control de flujo, funciones",
        "Estructuras nativas: listas, tuplas, diccionarios, conjuntos",
        "Entornos virtuales y gestión de dependencias (venv, requirements.txt)",
        "Buenas prácticas de código: PEP 8, docstrings, type hints",
      ],
    },
    {
      n: 3,
      week: "Semanas 3-4",
      title: "Fundamentos del análisis de algoritmos",
      topics: [
        "Algoritmos como tecnología: por qué importa la eficiencia",
        "Insertion sort y prueba de corrección por invariante de ciclo",
        "Análisis del peor caso, mejor caso y caso promedio",
        "Introducción a divide y vencer con merge sort",
      ],
    },
    {
      n: 4,
      week: "Semana 5",
      title: "Crecimiento de funciones",
      topics: [
        "Notación asintótica: O, Θ y Ω",
        "Funciones comunes: polinomios, logaritmos, exponenciales, factoriales",
        "Comparación de tasas de crecimiento y jerarquía de funciones",
      ],
    },
    {
      n: 5,
      week: "Semanas 6-8",
      title: "Recurrencias y divide y vencer",
      topics: [
        "Resolución de recurrencias: sustitución, árbol de recursión, método maestro",
        "El problema del subarreglo máximo",
        "Algoritmo de Strassen para multiplicación de matrices",
        "Síntesis del paradigma divide y vencer",
      ],
    },
    {
      n: 6,
      week: "Semanas 9-11",
      title: "Ordenamiento",
      topics: [
        "Heaps, heapsort y colas de prioridad",
        "Quicksort determinista y aleatorizado",
        "Cota inferior Ω(n log n) del ordenamiento por comparaciones",
        "Ordenamiento en tiempo lineal: counting, radix y bucket sort",
      ],
    },
    {
      n: 7,
      week: "Semanas 12-13",
      title: "Estructuras de datos",
      topics: [
        "Selección y medianas en tiempo lineal esperado",
        "Pilas, colas y listas enlazadas",
        "Tablas hash: funciones hash y manejo de colisiones",
      ],
    },
    {
      n: 8,
      week: "Semanas 14-16",
      title: "Programación dinámica y algoritmos voraces",
      topics: [
        "Corte de varillas (rod cutting) y multiplicación de cadenas de matrices",
        "Subestructura óptima y subproblemas traslapados",
        "Subsecuencia común más larga (LCS)",
        "Estrategia voraz: selección de actividades y códigos de Huffman",
      ],
    },
    {
      n: 9,
      week: "Opcional",
      title: "Temas opcionales",
      topics: [
        "Grafos: representaciones, recorridos BFS/DFS y ordenamiento topológico",
        "Árboles de expansión mínima: Kruskal y Prim",
        "Caminos más cortos: Bellman-Ford y Dijkstra",
        "Análisis amortizado e introducción a NP-completitud",
      ],
    },
  ],
  evaluation: [
    {
      name: "Laboratorio 1: Fundamentos, complejidad y recurrencias",
      pct: 15,
    },
    {
      name: "Laboratorio 2: Dividir y vencer",
      pct: 15,
    },
    {
      name: "Laboratorio 3: Algoritmos de ordenamiento",
      pct: 15,
    },
    {
      name: "Laboratorio 4: Estructuras de datos",
      pct: 15,
    },
    {
      name: "Laboratorio 5: Programación dinámica y algoritmos voraces",
      pct: 20,
    },
    {
      name: "Seguimiento continuo",
      pct: 20,
    },
  ],
  dates: [
    { date: "3 ago", label: "Inicio de clases" },
    {
      date: "7-13 sep",
      label: "Cierre Laboratorio 1 (Fundamentos, complejidad y recurrencias)",
    },
    { date: "21-27 sep", label: "Cierre Laboratorio 2 (Dividir y vencer)" },
    {
      date: "12-18 oct",
      label: "Cierre Laboratorio 3 (Algoritmos de ordenamiento)",
    },
    {
      date: "26 oct-1 nov",
      label: "Cierre Laboratorio 4 (Estructuras de datos) / Registro del 60 %",
    },
    {
      date: "16-22 nov",
      label:
        "Cierre Laboratorio 5 y cierre del curso / Límite de cancelación de asignaturas",
    },
    { date: "23-29 nov", label: "Registro del 100 % evaluado" },
  ],
  conditions: TRANSVERSAL_CONDITIONS,
};
