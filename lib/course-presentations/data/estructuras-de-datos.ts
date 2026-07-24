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
      week: "Semanas 2-3",
      title: "Programación orientada a objetos (parte 1)",
      topics: [
        "Clases, objetos, atributos y métodos",
        "Encapsulamiento y modificadores de acceso",
        "Getters y setters con validación",
        "Sobrecarga de métodos y atributos estáticos",
        "Introducción al UML: diagrama de clases",
      ],
    },
    {
      n: 3,
      week: "Semanas 4-5",
      title: "Programación orientada a objetos (parte 2)",
      topics: [
        "Herencia, sobreescritura de métodos y súper",
        "Polimorfismo y binding dinámico",
        "Clases abstractas e interfaces",
        "Composición, agregación y diseño avanzado",
        "UML avanzado y diagramas de paquetes",
      ],
    },
    {
      n: 4,
      week: "Semanas 6-7",
      title: "Introducción a estructuras de datos",
      topics: [
        "Tipos abstractos de datos (TAD)",
        "Panorama general de estructuras",
        "Criterios de selección de estructuras",
        "Notación Big O y análisis de complejidad",
        "Comparación de estructuras por eficiencia",
      ],
    },
    {
      n: 5,
      week: "Semanas 8-10",
      title: "Listas enlazadas",
      topics: [
        "Nodos y memoria dinámica en Java",
        "Lista simple enlazada: operaciones y complejidad",
        "Lista doblemente enlazada y lista circular",
        "Ordenamiento en listas (insertion sort, selection sort)",
        "Integración con casos de estudio",
      ],
    },
    {
      n: 6,
      week: "Semana 11",
      title: "Manejo de archivos",
      topics: [
        "Archivos de texto vs. binarios",
        "Streams, File, FileReader y FileWriter",
        "BufferedReader y BufferedWriter",
        "Lectura/escritura eficiente línea a línea",
        "Manejo de excepciones con try-with-resources",
        "Persistencia de estructuras de datos",
      ],
    },
    {
      n: 7,
      week: "Semanas 12-13",
      title: "Pilas y colas",
      topics: [
        "TAD Pila: LIFO, operaciones push/pop/peek",
        "Implementación de pilas con lista enlazada",
        "TAD Cola: FIFO, operaciones enqueue/dequeue",
        "Implementación de colas con lista enlazada",
        "Aplicaciones prácticas: turnos, scheduling, evaluación de expresiones",
      ],
    },
    {
      n: 8,
      week: "Semana 14",
      title: "Recursividad",
      topics: [
        "Concepto de recursividad: caso base y recursivo",
        "Pila de llamadas (call stack)",
        "Prueba de escritorio de algoritmos recursivos",
        "Recursivos clásicos: factorial, Fibonacci, Torres de Hanói",
        "Recursión vs. iteración: ventajas y riesgos",
      ],
    },
    {
      n: 9,
      week: "Semanas 15-16",
      title: "Árboles",
      topics: [
        "Conceptos: raíz, nodo, hoja, subárbol, nivel, altura",
        "Árbol binario: representación con nodos enlazados",
        "Inserción y recorridos recursivos: in-order, pre-order, post-order",
        "Árbol binario de búsqueda (BST)",
        "Búsqueda, inserción y eliminación en BST",
        "Aplicaciones: diccionarios, índices, autocompletado",
      ],
    },
  ],
  evaluation: [
    {
      name: "Momento 1: Programación orientada a objetos",
      pct: 15,
      week: "Semana 5",
    },
    {
      name: "Momento 2: Listas",
      pct: 15,
      week: "Semanas 10",
    },
    {
      name: "Momento 3: Manejo de archivos",
      pct: 15,
      week: "Semana 11",
    },
    {
      name: "Momento 4: Pilas y colas",
      pct: 15,
      week: "Semanas 13",
    },
    {
      name: "Momento 5: Proyecto final (árboles e integración)",
      pct: 20,
      week: "Semanas 15-16",
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
  conditions: TRANSVERSAL_CONDITIONS,
};
