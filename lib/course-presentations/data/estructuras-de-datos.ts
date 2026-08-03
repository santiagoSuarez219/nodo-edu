import type { CoursePresentation } from "../types";
import { TRANSVERSAL_CONDITIONS } from "./transversal";

export const estructurasDatos: CoursePresentation = {
  name: "Estructuras de Datos",
  desc: "Estudio sistemático de estructuras fundamentales para organizar y manipular información: pilas, colas, listas enlazadas y árboles. Implementación práctica en Java con análisis de complejidad algorítmica. Proyecto de aula incremental que integra todas las estructuras en una aplicación completa.",
  program: "Tecnología en Desarrollo de Software",
  level: "Intermedio",
  credits: 5,
  modality: "Presencial",
  weeklyHours: "6 h/semana presenciales",
  independentHours: "9 h/semana independientes",
  spots: 30,
  prereqs: ["Lógica de Programación y Laboratorio"],
  tools: ["Java JDK 21", "Visual Studio Code", "Git y GitHub"],
  syllabus: [
    {
      n: 1,
      week: "Semana 1",
      title: "Git y GitHub",
      topics: [
        "Control de versiones y repositorios",
        "Commits, ramas y flujo de trabajo con Git",
        "GitHub, push, pull y resolución de conflictos",
        "Estructura de paquetes del proyecto de aula",
      ],
    },
    {
      n: 2,
      week: "Semanas 2-4",
      title: "Programación orientada a objetos",
      topics: [
        "Clases, objetos, atributos y métodos",
        "Encapsulamiento, modificadores de acceso y validación",
        "Herencia, sobreescritura de métodos y super",
        "Polimorfismo, clases abstractas e interfaces",
        "Asociación, agregación y composición",
        "UML: diagrama de clases y diagramas de paquetes",
      ],
    },
    {
      n: 3,
      week: "Semanas 5-7",
      title: "Eficiencia algorítmica y listas enlazadas",
      topics: [
        "Notación Big O y análisis de complejidad",
        "Comparación de estructuras por eficiencia",
        "Nodos y memoria dinámica en Java",
        "Lista simple enlazada: operaciones y complejidad",
        "Comparación con arreglos: cuándo elegir cada uno",
        "Lista doblemente enlazada y lista circular",
        "Ordenamiento en listas (insertion sort, selection sort)",
      ],
    },
    {
      n: 4,
      week: "Semanas 8-9",
      title: "Pilas y colas",
      topics: [
        "TAD Pila: LIFO, operaciones push/pop/peek",
        "Implementación de pilas con lista enlazada y clase Stack<E>",
        "TAD Cola: FIFO, operaciones enqueue/dequeue/front",
        "Interface Queue<E>, LinkedList<E> y PriorityQueue<E>",
      ],
    },
    {
      n: 5,
      week: "Semanas 10-11",
      title: "Manejo de archivos",
      topics: [
        "Archivos de texto vs. binarios: ventajas y desventajas",
        "Streams, File, FileReader y FileWriter",
        "BufferedReader y BufferedWriter; try-with-resources",
        "Serialización de objetos con ObjectOutputStream",
        "Modificación y eliminación de registros",
        "Persistencia de estructuras de datos",
      ],
    },
    {
      n: 6,
      week: "Semanas 12-13",
      title: "Recursividad",
      topics: [
        "Concepto de recursividad: caso base y recursivo",
        "Pila de llamadas (call stack) y prueba de escritorio",
        "Recursivos clásicos: factorial, Fibonacci, Torres de Hanói",
        "Recorrido y búsqueda recursiva sobre listas enlazadas",
        "Riesgos y límites: StackOverflowError, costo exponencial",
        "Introducción al backtracking",
      ],
    },
    {
      n: 7,
      week: "Semanas 14-16",
      title: "Árboles e integración final",
      topics: [
        "Conceptos: raíz, nodo, hoja, subárbol, nivel, altura",
        "Árbol binario: representación con nodos enlazados",
        "Recorridos recursivos: in-order, pre-order, post-order",
        "Árbol binario de búsqueda (BST): búsqueda e inserción",
        "Eliminación en BST y análisis de complejidad",
        "Aplicaciones: diccionarios, índices, autocompletado",
        "Integración final del proyecto de aula y sustentación",
      ],
    },
  ],
  evaluation: [
    {
      name: "Momento evaluativo 1: Programación orientada a objetos",
      pct: 15,
      week: "Semana 4",
    },
    {
      name: "Momento evaluativo 2: Listas enlazadas",
      pct: 15,
      week: "Semana 7",
    },
    {
      name: "Momento evaluativo 3: Pilas y colas (examen institucional)",
      pct: 20,
      week: "Semana 9",
    },
    {
      name: "Momento evaluativo 4: Manejo de archivos",
      pct: 10,
      week: "Semana 11",
    },
    {
      name: "Momento evaluativo 5: Arboles de búsqueda binarios y recursividad",
      pct: 20,
      week: "Semana de exámenes",
    },
    {
      name: "Seguimiento continuo (incluye recursividad y laboratorios)",
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
    { date: "Semana 10-11", label: "Examen institucional de pilas y colas" },
    {
      date: "26 oct - 1 nov",
      label: "Segunda evaluación de estudiantes a docentes",
    },
    { date: "1 nov", label: "Registro del 60 %" },
    { date: "22 nov", label: "Límite de cancelación de asignaturas" },
    { date: "23 nov - 29 nov", label: "Registro del 100 %" },
  ],
  bibliography: [
    {
      title: "Estructura de Datos en Java",
      author: "Luis J. Aguilar, Ignacio Z. Martínez",
      edition: "3rd Edition",
    },
    {
      title: "Introduction to Algorithms",
      author:
        "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
      edition: "3rd Edition",
    },
  ],
  documents: [
    {
      title: "Guía para el informe de laboratorio",
      url: "/documentos/estructuras-de-datos/guia-informe-laboratorio.pdf",
      description:
        "Estructura y formato esperado de los informes de laboratorio.",
    },
  ],
  conditions: TRANSVERSAL_CONDITIONS,
};
