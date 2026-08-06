import type { CoursePresentation } from "../types";

export const programacionCientifica: CoursePresentation = {
  name: "Introducción a la Programación Científica",
  desc: "Optativa 1 de la linea de Ciencias Computacionales. La programacion cientifica es un enfoque de la programación que se centra en el uso de lenguajes de programación y herramientas computacionales para resolver problemas científicos y matemáticos. Este curso proporciona una introducción a los conceptos fundamentales de la programación científica, incluyendo la manipulación de datos, la visualización de resultados y la implementación de algoritmos numéricos.",
  program: "Tecnología en Desarrollo de Software",
  level: "Introductorio",
  credits: 2,
  modality: "Presencial",
  weeklyHours: "2 h/semana presenciales",
  independentHours: "4 h/semana independientes",
  spots: 15,
  prereqs: [],
  tools: ["Google Colab", "GitHub", "Python"],
  syllabus: [
    {
      n: 1,
      week: "Semana 1",
      title: "GitHub y Google Colab",
      topics: [
        "Conociendo Google Colab: interfaz, celdas y ejecución de código",
        "Conociendo GitHub: repositorios de codigo",
        "Autenticación con GitHub mediante Personal Access Token (PAT)",
        "Conectando Google Colab con GitHub: clonación de repositorios y sincronización de cambios",
        "Estructura del repositorio del curso",
      ],
    },
    {
      n: 2,
      week: "Semanas 2-3",
      title: "Programación con Python: fundamentos",
      topics: [
        "Variables, tipado dinámico y operadores",
        "Tipos de datos básicos: int, float, str, bool",
        "Estructuras condicionales: if / elif / else",
        "Bucles for y while, control de flujo",
      ],
    },
    {
      n: 3,
      week: "Semanas 4-5",
      title: "Estructuras de datos y funciones en Python",
      topics: [
        "Listas, tuplas, diccionarios y conjuntos",
        "Comprensión de listas (list comprehensions)",
        "Definición de funciones, parámetros y valores de retorno",
        "Funciones de orden superior: map, filter, lambda",
      ],
    },
    {
      n: 4,
      week: "Semanas 6-7",
      title: "Programación orientada a objetos en Python",
      topics: [
        "Clases y objetos: __init__, self, atributos y métodos",
        "Encapsulamiento y convenciones de nombres",
        "Métodos especiales: __str__, __repr__",
      ],
    },
    {
      n: 5,
      week: "Semanas 8-10",
      title: "NumPy",
      topics: [
        "Creación de arreglos 1D, 2D y n-D",
        "Atributos de un arreglo: shape, dtype, ndim, size",
        "Indexación, slicing y máscaras booleanas",
        "Álgebra lineal introductoria: vectores, matrices y producto matricial",
      ],
    },
    {
      n: 6,
      week: "Semanas 11-13",
      title: "Pandas y arranque del proyecto integrador",
      topics: [
        "Estructuras Series y DataFrame",
        "Carga de datos desde CSV",
        "Inspección inicial: head, info, describe, dtypes",
        "Manejo de valores nulos y limpieza de datos",
        "Selección y filtrado de datos: loc, iloc, condiciones",
      ],
    },
    {
      n: 7,
      week: "Semanas 14-16",
      title: "Visualización de datos: Matplotlib y Seaborn",
      topics: [
        "Matplotlib: gráficos de líneas, barras, dispersión e histogramas",
        "Seaborn: boxplot, heatmap, pairplot",
        "Buenas prácticas de visualización según el tipo de dato",
        "Portafolio de visualizaciones del proyecto integrador",
      ],
    },
  ],
  evaluation: [
    {
      name: "Momento 1: Programación con Python",
      pct: 15,
      week: "Semanas 2-3",
    },
    {
      name: "Momento 2: Estructuras de datos + POO",
      pct: 15,
      week: "Semanas 4-6",
    },
    {
      name: "Momento 3: NumPy",
      pct: 15,
      week: "Semanas 8-10",
    },
    {
      name: "Momento 4: Pandas (proyecto integrador)",
      pct: 15,
      week: "Semanas 11-13",
    },
    {
      name: "Momento 5: Matplotlib y Seaborn (portafolio + presentación final)",
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
    {
      date: "26 oct - 1 nov",
      label: "Segunda evaluación de estudiantes a docentes",
    },
    { date: "1 nov", label: "Registro del 60 %" },
    { date: "22 nov", label: "Límite de cancelación de asignaturas" },
    { date: "23 nov - 29 nov", label: "Registro del 100 %" },
  ],
  bibliography: [],
  documents: [
    {
      title: "01-Compromiso academico",
      url: "/documentos/programacion-cientifica/compromiso.pdf",
      description: "Documento con las políticas y normas académicas del curso.",
    },
    {
      title: "02-Microdiseño curricular",
      url: "/documentos/programacion-cientifica/micro.pdf",
      description:
        "Microdiseño oficial de la asignatura: competencias, contenidos y evaluación.",
    },
  ],
};
