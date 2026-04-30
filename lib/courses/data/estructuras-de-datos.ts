import type { Course } from "../types";

export const estructurasDeDatos: Course = {
  slug: "estructuras-de-datos",
  title: "Estructuras de datos",
  summary:
    "Fundamentos de estructuras lineales y no lineales con énfasis en análisis de complejidad y aplicaciones en problemas reales de ingeniería.",
  audience: ["ingenieria-de-sistemas", "ciencia-de-datos"],
  level: "intermedio",
  lessons: [
    {
      id: "bienvenida-al-curso",
      slug: "bienvenida-al-curso",
      articleSlug: "bienvenida-al-curso",
      order: 1, // o el orden que quieras
      title: "Bienvenidos al curso de Estructura de datos con Java",
      summary:
        "Visión general del curso y motivación desde problemas concretos.",
      topics: [],
    },
    {
      id: "git-github",
      slug: "git-github",
      articleSlug: "git-github",
      order: 2, // o el orden que quieras
      title: "Git y GitHub: Sistemas de control de versiones",
      summary: "",
      topics: [],
    },
    {
      id: "ramas-en-github",
      slug: "ramas-en-github",
      articleSlug: "ramas-en-github",
      order: 2, // o el orden que quieras
      title: "Ramas en Git y GitHub: Flujo de trabajo profesional",
      summary: "",
      topics: [],
    },
    {
      id: "introduccion",
      slug: "introduccion",
      articleSlug: "introduccion",
      order: 3,
      title: "Introducción a las estructuras de datos",
      summary:
        "Visión general del curso y motivación desde problemas concretos.",
      topics: [
        { title: "Qué es una estructura de datos" },
        {
          title: "Costo y complejidad asintótica",
          description: "Notación O, Ω y Θ.",
        },
        { title: "Criterios para elegir una estructura" },
      ],
    },
    {
      id: "arreglos-y-listas",
      slug: "arreglos-y-listas",
      articleSlug: "arreglos-y-listas",
      order: 3,
      title: "Arreglos y listas enlazadas",
      topics: [
        { title: "Arreglos estáticos y dinámicos" },
        { title: "Listas simplemente enlazadas" },
        { title: "Listas doblemente enlazadas" },
        { title: "Comparación de operaciones" },
      ],
    },
    {
      id: "pilas-y-colas",
      slug: "pilas-y-colas",
      order: 4,
      title: "Pilas y colas",
      topics: [
        { title: "Pila (LIFO) e implementaciones" },
        { title: "Cola (FIFO) e implementaciones" },
        { title: "Colas de prioridad" },
        { title: "Aplicaciones: parsing y BFS" },
      ],
    },
    {
      id: "arboles",
      slug: "arboles",
      order: 4,
      title: "Árboles",
      topics: [
        { title: "Árboles binarios" },
        { title: "Recorridos: pre, in, postorden y nivel" },
        { title: "Árboles binarios de búsqueda (BST)" },
        { title: "Balanceo: AVL y rojo-negro" },
      ],
    },
    {
      id: "tablas-hash",
      slug: "tablas-hash",
      order: 5,
      title: "Tablas hash",
      topics: [
        { title: "Funciones hash y colisiones" },
        { title: "Direccionamiento abierto" },
        { title: "Encadenamiento separado" },
        { title: "Factor de carga y rehashing" },
      ],
    },
    {
      id: "grafos",
      slug: "grafos",
      order: 6,
      title: "Grafos",
      topics: [
        { title: "Representaciones: matriz y lista de adyacencia" },
        { title: "Recorridos BFS y DFS" },
        { title: "Caminos mínimos: Dijkstra" },
        { title: "Árbol de expansión mínima" },
      ],
    },
  ],
};
