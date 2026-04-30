import type { Course } from "../types";

export const programacionCientifica: Course = {
  slug: "programacion-cientifica",
  title: "Programación científica",
  summary:
    "Herramientas y técnicas de cómputo numérico con Python para problemas de ingeniería: vectorización, álgebra lineal y visualización.",
  audience: [
    "ingenieria-electronica",
    "ingenieria-de-sistemas",
    "ciencia-de-datos",
  ],
  level: "introductorio",
  lessons: [
    {
      id: "entorno-y-numpy",
      slug: "entorno-y-numpy",
      order: 1,
      title: "Entorno de trabajo y NumPy",
      summary: "Configuración de un entorno reproducible y primeros arreglos.",
      topics: [
        { title: "Entornos virtuales y dependencias" },
        { title: "Jupyter y notebooks" },
        { title: "Arreglos NumPy y dtypes" },
        { title: "Indexación y slicing" },
      ],
    },
    {
      id: "vectorizacion",
      slug: "vectorizacion",
      order: 2,
      title: "Vectorización y broadcasting",
      topics: [
        { title: "Operaciones vectorizadas vs. bucles" },
        { title: "Broadcasting" },
        { title: "Funciones universales (ufuncs)" },
      ],
    },
    {
      id: "algebra-lineal",
      slug: "algebra-lineal",
      order: 3,
      title: "Álgebra lineal numérica",
      topics: [
        { title: "Productos matriciales" },
        { title: "Sistemas lineales" },
        { title: "Descomposiciones: LU, QR, SVD" },
        { title: "Estabilidad numérica" },
      ],
    },
    {
      id: "visualizacion",
      slug: "visualizacion",
      order: 4,
      title: "Visualización con Matplotlib",
      topics: [
        { title: "Figuras y ejes" },
        { title: "Gráficos 2D comunes" },
        { title: "Personalización y estilos" },
      ],
    },
    {
      id: "pandas",
      slug: "pandas",
      order: 5,
      title: "Manipulación de datos con Pandas",
      topics: [
        { title: "Series y DataFrames" },
        { title: "Filtrado y agregación" },
        { title: "Lectura de CSV y Parquet" },
        { title: "Limpieza y tipos" },
      ],
    },
  ],
};
