import type { CoursePresentation } from "../types";

export const analisisDeAlgoritmos: CoursePresentation = {
  name: "Análisis de Algoritmos",
  desc: "Estudio de la complejidad computacional y las técnicas fundamentales de diseño de algoritmos: recurrencias, dividir y vencer, ordenamiento, estructuras de datos, programación dinámica y algoritmos voraces.",
  program: "Ingeniería de Sistemas",
  level: "Intermedio - Avanzado",
  credits: 3,
  modality: "Virtual",
  weeklyHours: "4 h/semana sincrónicas",
  independentHours: "5 h/semana independientes",
  spots: 10,
  prereqs: [],
  tools: ["Python 3.13", "Visual Studio Code", "Git y GitHub", "Markdown"],
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
      week: "Semana 2-3",
      title: "Introducción a Python",
      topics: [
        "Sintaxis: tipos de datos, control de flujo, funciones",
        "Estructuras nativas: listas, tuplas, diccionarios, conjuntos",
        "POO: clases, objetos, atributos y métodos",
        "Entornos virtuales y gestión de dependencias (venv, requirements.txt)",
        "Buenas prácticas de código: PEP 8, docstrings, type hints",
      ],
    },
    {
      n: 3,
      week: "Semanas 4",
      title: "Fundamentos del análisis de algoritmos",
      topics: [
        "Algoritmos como tecnología: por qué importa la eficiencia",
        "Insertion sort y prueba de corrección por invariante de ciclo",
        "Análisis del peor caso, mejor caso y caso promedio",
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
        "Merge sort",
      ],
    },
    {
      n: 6,
      week: "Semanas 9-11",
      title: "Ordenamiento",
      topics: ["Heaps, heapsort y colas de prioridad", "Quicksort"],
    },
    {
      n: 7,
      week: "Semanas 12-13",
      title: "Estructuras de datos",
      topics: [
        "Pilas, colas y listas enlazadas",
        "Tablas hash: funciones hash y manejo de colisiones",
        "Árboles binarios de búsqueda y recorridos",
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
  ],
  evaluation: [
    {
      name: "Momento evaluativo 1: Fundamentos del análisis de algoritmos",
      pct: 15,
      week: "Semanas 5",
    },
    {
      name: "Momento evaluativo 2: Dividir y vencer",
      pct: 15,
      week: "Semanas 7",
    },
    {
      name: "Momento evaluativo 3: Algoritmos de ordenamiento",
      pct: 15,
      week: "Semanas 9-11",
    },
    {
      name: "Momento evaluativo 4: Estructuras de datos",
      pct: 15,
      week: "Semanas 12-13",
    },
    {
      name: "Momento evaluativo 5: Programación dinámica y algoritmos voraces",
      pct: 20,
      week: "Semanas 14-16",
    },
    {
      name: "Seguimiento continuo",
      pct: 20,
      week: "A lo largo del curso",
    },
  ],
  dates: [
    { date: "3 ago - 29 nov", label: "Desarrollo curricular" },
    {
      date: "31 ago - 5 sep",
      label: "Primera evaluación de estudiantes a docentes",
    },
    { date: "1 nov", label: "Registro del 60 %" },
    {
      date: "26 oct -  1 nov",
      label: "Segunda evaluación de estudiantes a docentes",
    },
    { date: "23 nov - 29 nov", label: "Registro del 100 %" },
    { date: "22 nov", label: "Límite de cancelación de asignaturas" },
  ],
  bibliography: [
    {
      title: "Introduction to Algorithms",
      author:
        "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
      edition: "3rd Edition",
    },
  ],
  documents: [
    {
      title: "01-Compromiso academico",
      url: "/documentos/analisis-de-algoritmos/compromiso.pdf",
      description: "Documento con las políticas y normas académicas del curso.",
    },
    {
      title: "02-Microdiseño curricular",
      url: "/documentos/analisis-de-algoritmos/micro.pdf",
      description:
        "Microdiseño oficial de la asignatura: competencias, contenidos y evaluación.",
    },
  ],
};
