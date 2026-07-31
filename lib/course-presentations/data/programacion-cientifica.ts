import type { CoursePresentation } from "../types";
import { TRANSVERSAL_CONDITIONS } from "./transversal";

export const programacionCientifica: CoursePresentation = {
  name: "Introducción a la Programación Científica",
  desc: "Optativa 1 de la linea de Ciencias Computacionales. La programacion cientifica es un enfoque de la programación que se centra en el uso de lenguajes de programación y herramientas computacionales para resolver problemas científicos y matemáticos. Este curso proporciona una introducción a los conceptos fundamentales de la programación científica, incluyendo la manipulación de datos, la visualización de resultados y la implementación de algoritmos numéricos. El curso se dicta en modalidad presencial con apoyo virtual, con 2 horas presenciales y 4 horas independientes por semana",
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
      title: "Git, GitHub, Google Colab y diagnóstico inicial",
      topics: [
        "Diagnóstico inicial de nivel (cuestionario + reto breve)",
        "Control de versiones con Git desde Colab: commit, historial, push, pull",
        "Autenticación con GitHub mediante Personal Access Token (PAT)",
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
      week: "Semanas 5-6",
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
      week: "Semana 7",
      title: "Programación orientada a objetos en Python",
      topics: [
        "Clases y objetos: __init__, self, atributos y métodos",
        "Encapsulamiento y convenciones de nombres",
        "Métodos especiales: __str__, __repr__",
      ],
    },
    {
      n: 5,
      week: "Semanas 9-10",
      title: "NumPy",
      topics: [
        "Creación de arreglos 1D, 2D y n-D",
        "Atributos de un arreglo: shape, dtype, ndim, size",
        "Indexación, slicing y máscaras booleanas",
        "Operaciones vectorizadas, broadcasting y funciones universales",
        "Álgebra lineal introductoria: vectores, matrices y producto matricial",
      ],
    },
    {
      n: 6,
      week: "Semanas 12-13",
      title: "Pandas y arranque del proyecto integrador",
      topics: [
        "Estructuras Series y DataFrame",
        "Carga de datos desde CSV, Excel, APIs o repositorios abiertos",
        "Inspección inicial: head, info, describe, dtypes",
        "Filtrado, agregación (groupby) y limpieza de datos",
        "Selección del dataset y diseño del proyecto integrador",
      ],
    },
    {
      n: 7,
      week: "Semana 15",
      title: "Visualización de datos: Matplotlib y Seaborn",
      topics: [
        "Matplotlib: gráficos de líneas, barras, dispersión e histogramas",
        "Seaborn: boxplot, heatmap, pairplot",
        "Buenas prácticas de visualización según el tipo de dato",
        "Portafolio de visualizaciones del proyecto integrador",
      ],
    },
    {
      n: 8,
      week: "Opcional",
      title: "Temas opcionales",
      topics: [
        "Consumo de APIs de datos abiertos con la librería requests",
        "Parseo de respuestas JSON y carga directa a DataFrame",
        "Introducción a scikit-learn: preparación de datos y modelo básico",
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
      week: "Semanas 5-7",
    },
    {
      name: "Momento 3: NumPy",
      pct: 15,
      week: "Semanas 9-10",
    },
    {
      name: "Momento 4: Pandas (proyecto integrador)",
      pct: 15,
      week: "Semanas 12-13",
    },
    {
      name: "Momento 5: Matplotlib y Seaborn (portafolio + presentación final)",
      pct: 20,
      week: "Semana 15",
    },
    {
      name: "Seguimiento continuo",
      pct: 20,
      week: "A lo largo del curso",
    },
  ],
  dates: [
    { date: "6 ago", label: "Inicio de clases" },
    { date: "27 ago", label: "Cierre Momento 1 (Programación con Python)" },
    { date: "24 sep", label: "Cierre Momento 2 (Estructuras de datos + POO)" },
    { date: "15 oct", label: "Cierre Momento 3 (NumPy)" },
    { date: "5 nov", label: "Cierre Momento 4 (Pandas)" },
    {
      date: "19 nov",
      label: "Cierre Momento 5 (Portafolio y presentación final)",
    },
    { date: "26 nov", label: "Exámenes finales" },
  ],
  bibliography: [
    {
      title: "Python for Data Analysis",
      author: "Wes McKinney",
      edition: "3rd Edition",
    },
    {
      title: "Computational Physics with Python",
      author: "Paul Gessler, Jeffrey Karp",
    },
  ],
  documents: [
    {
      title: "Guía para el informe de laboratorio",
      url: "/documentos/programacion-cientifica/guia-informe-laboratorio.pdf",
      description: "Estructura y formato esperado de los informes de laboratorio.",
    },
  ],
  conditions: TRANSVERSAL_CONDITIONS,
};
