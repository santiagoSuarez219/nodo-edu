import type { CoursePresentation } from "../types";

export const programacionCientifica: CoursePresentation = {
  name: "Programación científica",
  desc: "Herramientas y técnicas de cómputo numérico con Python para problemas de ingeniería: vectorización, álgebra lineal y visualización de datos.",
  program: "Ingeniería de Sistemas / Ciencia de Datos",
  level: "Introductorio",
  credits: 3,
  hours: "15h de contenido",
  classesCount: 20,
  spots: 15,
  startDate: "18 ago 2026",
  enrollDeadline: "11 ago 2026",
  prereqs: ["Programación I", "Álgebra lineal básica"],
  tools: ["Python", "NumPy", "Pandas", "Matplotlib", "Jupyter Notebook", "VS Code"],
  syllabus: [
    {
      n: 1,
      title: "Entorno de trabajo y NumPy",
      topics: [
        "Entornos virtuales y gestión de dependencias",
        "Jupyter notebooks y reproducibilidad",
        "Arreglos NumPy, dtypes y memoria",
        "Indexación, slicing y broadcasting",
      ],
    },
    {
      n: 2,
      title: "Vectorización y operaciones numéricas",
      topics: [
        "Operaciones vectorizadas vs. bucles",
        "Broadcasting en NumPy",
        "Funciones universales (ufuncs)",
        "Optimización de rendimiento",
      ],
    },
    {
      n: 3,
      title: "Álgebra lineal numérica",
      topics: [
        "Productos matriciales y normas",
        "Resolución de sistemas lineales",
        "Descomposiciones: LU, QR, SVD",
        "Estabilidad numérica en cálculos",
      ],
    },
    {
      n: 4,
      title: "Visualización y análisis de datos",
      topics: [
        "Matplotlib: figuras, ejes y gráficos 2D",
        "Personalización, estilos y exportación",
        "Pandas: Series, DataFrames y operaciones",
        "Lectura de datos: CSV, Parquet y limpieza",
      ],
    },
  ],
  evaluation: [
    { name: "Ejercicios prácticos", pct: 25 },
    { name: "Notebooks con análisis de datos", pct: 35 },
    { name: "Proyecto final de simulación numérica", pct: 40 },
  ],
  dates: [
    { date: "18 ago", label: "Inicio de clases" },
    { date: "8 sep", label: "Primer checkpoint" },
    { date: "29 sep", label: "Segunda entrega" },
    { date: "20 oct", label: "Proyecto final" },
  ],
  conditions: [
    "Se requiere acceso a Python 3.10+ y Jupyter en tu máquina local o en la nube.",
    "Asistencia mínima del 75% para participar en evaluación final.",
    "Las entregas atrasadas pierden 15% de puntuación por día, hasta 3 días.",
    "Colaboración permitida con atribución clara de fuentes y contribuyentes.",
  ],
};
