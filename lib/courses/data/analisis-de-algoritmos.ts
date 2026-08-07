import type { Course } from "../types";

export const analisisDeAlgoritmos: Course = {
  slug: "analisis-de-algoritmos",
  title: "Análisis de algoritmos",
  summary:
    "Diseño y análisis riguroso de algoritmos: complejidad, técnicas de diseño y problemas clásicos de optimización, siguiendo la estructura de Cormen et al.",
  audience: ["ingenieria-de-sistemas", "ciencia-de-datos"],
  level: "avanzado",
  lessons: [
    {
      id: "fundamentos-control-de-versiones-y-flujo-de-trabajo",
      slug: "fundamentos-control-de-versiones-y-flujo-de-trabajo",
      articleSlug: "fundamentos-control-de-versiones-y-flujo-de-trabajo",
      order: 1,
      title: "Fundamentos de control de versiones y flujo de trabajo",
      topics: [
        { title: "Repositorio, commit, staging area, HEAD, historial" },
        { title: "Comandos esenciales: init, add, commit, status, log, diff" },
        { title: "Repositorios remotos: push, pull, fetch, clone" },
        { title: "Ramas: branch, checkout, merge; flujo tipo feature branch" },
      ],
    },
    {
      id: "lab-01-repositorio-del-curso",
      slug: "lab-01-repositorio-del-curso",
      articleSlug: "lab-01-repositorio-del-curso",
      kind: "guide",
      order: 1.5,
      title: "Laboratorio 01 — Repositorio del curso",
      topics: [],
    },
    {
      id: "sintaxis-de-python",
      slug: "sintaxis-de-python",
      articleSlug: "sintaxis-de-python",
      order: 2,
      title: "Introducción a Python",
      summary:
        "La sintaxis mínima de Python para escribir y medir algoritmos: tipos, control de flujo, funciones, estructuras nativas, comprensión de listas y manejo básico de errores.",
      topics: [
        { title: "Tipos de datos básicos: int, float, str, bool, None" },
        { title: "Estructuras de control: if/elif/else, for, while" },
        { title: "Funciones: definición, parámetros, valores de retorno, docstrings" },
        { title: "Estructuras de datos nativas: listas, tuplas, diccionarios, conjuntos" },
        { title: "Comprensión de listas (*list comprehensions*)" },
        { title: "Manejo básico de excepciones (`try`/`except`) e importación de módulos" },
      ],
    },
    {
      id: "lab-02-configuracion-del-entorno",
      slug: "lab-02-configuracion-del-entorno",
      articleSlug: "lab-02-configuracion-del-entorno",
      kind: "guide",
      order: 2.5,
      title: "Laboratorio 02 — Configuración del entorno de trabajo",
      topics: [],
    },
    {
      id: "algoritmos-como-tecnologia",
      slug: "algoritmos-como-tecnologia",
      articleSlug: "algoritmos-como-tecnologia",
      order: 3,
      title: "Algoritmos como tecnología",
      topics: [
        { title: "Qué es un algoritmo; por qué importa la eficiencia además de la corrección" },
        { title: "Insertion sort: descripción del algoritmo y su invariante de ciclo" },
        {
          title:
            "Prueba de corrección mediante invariantes de ciclo (inicialización, mantenimiento, terminación)",
        },
      ],
    },
    {
      id: "analisis-de-algoritmos-y-divide-y-venceras",
      slug: "analisis-de-algoritmos-y-divide-y-venceras",
      articleSlug: "analisis-de-algoritmos-y-divide-y-venceras",
      order: 4,
      title: "Análisis de algoritmos y divide y vencerás",
      topics: [
        { title: "Análisis del peor caso, mejor caso y caso promedio" },
        { title: "Orden de crecimiento: intuición previa a la notación formal" },
        { title: "Diseño por divide y vencerás: introducción con merge sort" },
      ],
    },
    {
      id: "notacion-o-theta-y-omega",
      slug: "notacion-o-theta-y-omega",
      articleSlug: "notacion-o-theta-y-omega",
      order: 5,
      title: "Notación O, Θ y Ω",
      topics: [
        { title: "Notación asintótica: definiciones formales de O, Θ y Ω" },
        { title: "Notaciones estándar y funciones comunes: polinomios, logaritmos, exponenciales" },
        { title: "Comparación de tasas de crecimiento y jerarquía de funciones" },
      ],
    },
    {
      id: "como-resolver-recurrencias",
      slug: "como-resolver-recurrencias",
      articleSlug: "como-resolver-recurrencias",
      order: 6,
      title: "Cómo resolver recurrencias",
      topics: [
        { title: "Planteamiento de la recurrencia de un algoritmo recursivo" },
        { title: "El método de sustitución" },
        { title: "El método del árbol de recursión" },
        { title: "El método maestro: enunciado y condiciones de aplicación" },
      ],
    },
    {
      id: "subarreglo-maximo-y-strassen",
      slug: "subarreglo-maximo-y-strassen",
      articleSlug: "subarreglo-maximo-y-strassen",
      order: 7,
      title: "Subarreglo máximo y Strassen",
      topics: [
        { title: "El problema del subarreglo máximo resuelto por divide y vencerás" },
        { title: "El algoritmo de Strassen para multiplicación de matrices" },
        { title: "Comparación de ambos contra sus alternativas de fuerza bruta" },
      ],
    },
    {
      id: "sintesis-del-paradigma-de-divide-y-venceras",
      slug: "sintesis-del-paradigma-de-divide-y-venceras",
      articleSlug: "sintesis-del-paradigma-de-divide-y-venceras",
      order: 8,
      title: "Síntesis del paradigma de divide y vencerás",
      topics: [
        { title: "Repaso del esquema general: dividir, conquistar, combinar" },
        { title: "Cuándo divide y vencerás es la técnica adecuada" },
        { title: "Casos límite: cuándo dividir el problema no aporta ninguna mejora" },
      ],
    },
    {
      id: "heaps-y-heapsort",
      slug: "heaps-y-heapsort",
      articleSlug: "heaps-y-heapsort",
      order: 9,
      title: "Heaps y heapsort",
      topics: [
        { title: "La propiedad de heap (max-heap y min-heap)" },
        { title: "Mantener la propiedad de heap; construir un heap desde un arreglo" },
        { title: "El algoritmo heapsort; colas de prioridad como aplicación de los heaps" },
      ],
    },
    {
      id: "quicksort-determinista-y-aleatorizado",
      slug: "quicksort-determinista-y-aleatorizado",
      articleSlug: "quicksort-determinista-y-aleatorizado",
      order: 10,
      title: "Quicksort determinista y aleatorizado",
      topics: [
        { title: "Descripción de quicksort: partición y recursión" },
        { title: "Desempeño: peor caso O(n²) frente a caso promedio O(n log n)" },
        { title: "Versión aleatorizada de quicksort y por qué mejora el comportamiento esperado" },
      ],
    },
    {
      id: "counting-radix-y-bucket-sort",
      slug: "counting-radix-y-bucket-sort",
      articleSlug: "counting-radix-y-bucket-sort",
      order: 11,
      title: "Counting sort, radix sort y bucket sort",
      topics: [
        { title: "Cota inferior para el ordenamiento por comparaciones: Ω(n log n)" },
        { title: "Counting sort: cuándo es aplicable y por qué logra O(n)" },
        { title: "Radix sort y bucket sort: ideas generales y supuestos sobre los datos" },
      ],
    },
    {
      id: "medianas-seleccion-y-estructuras-elementales",
      slug: "medianas-seleccion-y-estructuras-elementales",
      articleSlug: "medianas-seleccion-y-estructuras-elementales",
      order: 12,
      title: "Medianas, selección y estructuras elementales",
      topics: [
        { title: "Mínimo y máximo; selección en tiempo lineal esperado" },
        { title: "Pilas y colas: operaciones e implementación con arreglos" },
        { title: "Listas enlazadas: simple, doble; representación de árboles enraizados" },
      ],
    },
    {
      id: "tablas-hash",
      slug: "tablas-hash",
      articleSlug: "tablas-hash",
      order: 13,
      title: "Tablas hash",
      topics: [
        { title: "Tablas de direccionamiento directo vs. tablas hash" },
        { title: "Funciones hash: método de la división, método de la multiplicación" },
        {
          title:
            "Manejo de colisiones: encadenamiento y direccionamiento abierto (sondeo lineal, cuadrático, doble hashing)",
        },
      ],
    },
    {
      id: "fundamentos-de-programacion-dinamica",
      slug: "fundamentos-de-programacion-dinamica",
      articleSlug: "fundamentos-de-programacion-dinamica",
      order: 14,
      title: "Fundamentos de programación dinámica",
      topics: [
        { title: "Corte de varillas: solución recursiva ingenua vs. memoización vs. tabulación" },
        { title: "Multiplicación de cadenas de matrices: planteamiento y recurrencia" },
        { title: "Reconstrucción de la solución óptima" },
      ],
    },
    {
      id: "elementos-de-la-pd-y-lcs",
      slug: "elementos-de-la-pd-y-lcs",
      articleSlug: "elementos-de-la-pd-y-lcs",
      order: 15,
      title: "Elementos de la programación dinámica y subsecuencia común más larga",
      topics: [
        { title: "Subestructura óptima y subproblemas traslapados: cómo reconocerlos" },
        { title: "Subsecuencia común más larga (LCS): planteamiento, tabla y reconstrucción" },
        { title: "Cuándo memoización, cuándo tabulación: consideraciones prácticas" },
      ],
    },
    {
      id: "estrategia-voraz",
      slug: "estrategia-voraz",
      articleSlug: "estrategia-voraz",
      order: 16,
      title: "Estrategia voraz",
      topics: [
        { title: "El problema de selección de actividades" },
        { title: "Elementos de la estrategia voraz: elección voraz y subestructura óptima" },
        { title: "Códigos de Huffman: construcción del árbol y compresión" },
      ],
    },
    {
      id: "sintesis-del-semestre",
      slug: "sintesis-del-semestre",
      articleSlug: "sintesis-del-semestre",
      order: 17,
      title: "Síntesis del semestre",
      topics: [
        {
          title:
            "Repaso integrador: recurrencias, divide y vencerás, ordenamiento, estructuras de datos, programación dinámica, voraces",
        },
        { title: "Retroalimentación general sobre los cinco informes de laboratorio" },
      ],
    },
  ],
};
