import type { CoursePresentation } from "../types";
import { TRANSVERSAL_CONDITIONS } from "./transversal";

export const programacionCientifica: CoursePresentation = {
  name: "Programación científica",
  desc: "Herramientas y técnicas de cómputo numérico con Python para problemas de ingeniería: vectorización, álgebra lineal y visualización de datos.",
  program: "Ingeniería de Sistemas / Ciencia de Datos",
  level: "Introductorio",
  credits: 3,
  // NOTE: datos provisionales, pendientes de microdiseño real — actualizar en spec futuro
  modality: "Presencial",
  weeklyHours: "4 h/semana",
  independentHours: "6 h/semana",
  spots: 15,
  prereqs: ["Programación I", "Álgebra lineal básica"],
  tools: ["Python", "NumPy", "Pandas", "Matplotlib", "Jupyter Notebook", "VS Code"],
  syllabus: [
    {
      n: 1,
      week: "Semanas 1-3",
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
      week: "Semanas 4-6",
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
      week: "Semanas 7-9",
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
      week: "Semanas 10-12",
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
  conditions: TRANSVERSAL_CONDITIONS,
};
