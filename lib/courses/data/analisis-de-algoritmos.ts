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
      title: "Sintaxis básica de Python",
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
      id: "buenas-practicas-y-entornos-python",
      slug: "buenas-practicas-y-entornos-python",
      articleSlug: "buenas-practicas-y-entornos-python",
      order: 2.5,
      title: "Buenas prácticas y entornos de trabajo en Python",
      summary:
        "Cómo escribir Python legible (PEP 8, docstrings, type hints) y cómo empaquetar las dependencias de un proyecto con pip, entornos virtuales y requirements.txt.",
      topics: [
        { title: "Buenas prácticas de código: PEP 8, docstrings y type hints" },
        { title: "PIP: instalación de paquetes desde PyPI" },
        { title: "Entornos virtuales y gestión de dependencias (venv, requirements.txt)" },
      ],
    },
    {
      id: "lab-02-configuracion-del-entorno",
      slug: "lab-02-configuracion-del-entorno",
      articleSlug: "lab-02-configuracion-del-entorno",
      kind: "guide",
      order: 2.75,
      title: "Laboratorio 02 — Configuración del entorno de trabajo",
      topics: [],
    },
    {
      id: "algoritmos-como-tecnologia",
      slug: "algoritmos-como-tecnologia",
      articleSlug: "algoritmos-como-tecnologia",
      order: 3,
      title: "Algoritmos como tecnología",
      summary:
        "De una empresa que no alcanza a cerrar la noche a un problema con forma matemática: cómo se modela una situación organizacional, qué es un algoritmo, por qué su eficiencia se mide también en energía y en personas, y cómo insertion sort se demuestra correcto con una invariante de ciclo.",
      topics: [
        {
          title:
            "De un requisito de negocio a un problema computacional: entradas, salidas, restricciones y operación crítica",
        },
        { title: "Qué es un algoritmo; por qué importa la eficiencia además de la corrección" },
        { title: "Impacto de la decisión algorítmica: consumo energético y consecuencias sobre las personas" },
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
      summary:
        "Por qué insertion sort no tiene un solo tiempo de ejecución, cómo se formalizan el peor caso, el mejor caso y el caso promedio, y cómo divide y vencerás —con merge sort como primer ejemplo— ataca el problema de raíz en vez de acelerar el recorrido.",
      topics: [
        { title: "Complejidad temporal vs. complejidad espacial: qué mide cada una" },
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
      summary:
        "El vocabulario formal para comparar el crecimiento de dos funciones de tiempo sin depender de la máquina ni de la constante: O, Θ y Ω aplicadas a insertion sort y a la recurrencia sin resolver de merge sort.",
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
      summary:
        "Tres métodos —sustitución, árbol de recursión y método maestro— para pasar de una recurrencia como T(n) = 2T(n/2) + Θ(n) a una fórmula cerrada, cerrando la promesa pendiente de que merge sort es Θ(n log n).",
      topics: [
        { title: "Planteamiento de la recurrencia de un algoritmo recursivo" },
        { title: "El método de sustitución" },
        { title: "El método del árbol de recursión" },
        { title: "El método maestro: enunciado y condiciones de aplicación" },
      ],
    },
    {
      id: "lab-evaluativo-01-fundamentos-complejidad-recurrencias",
      slug: "lab-evaluativo-01-fundamentos-complejidad-recurrencias",
      articleSlug: "lab-evaluativo-01-fundamentos-complejidad-recurrencias",
      kind: "guide",
      order: 6.5,
      title:
        "Laboratorio evaluativo 01 — Fundamentos, complejidad y recurrencias",
      topics: [],
    },
    {
      id: "subarreglo-maximo-y-strassen",
      slug: "subarreglo-maximo-y-strassen",
      articleSlug: "subarreglo-maximo-y-strassen",
      order: 7,
      title: "Subarreglo máximo y Strassen",
      summary:
        "Dos problemas de divide y vencerás donde dividir a la mitad no basta: el subarreglo máximo, que exige resolver el caso cruzado, y la multiplicación de matrices, donde la partición ingenua no gana nada y el truco de Strassen sí — resueltos con el método maestro de la Semana 6.",
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
      summary:
        "El mismo esquema —dividir, conquistar, combinar— detrás de merge sort, el subarreglo máximo y Strassen, y el criterio que decide cuándo conviene usarlo: por qué dividir un arreglo para hallar su máximo no gana nada frente a recorrerlo una vez.",
      topics: [
        { title: "Repaso del esquema general: dividir, conquistar, combinar" },
        { title: "Cuándo divide y vencerás es la técnica adecuada" },
        { title: "Casos límite: cuándo dividir el problema no aporta ninguna mejora" },
      ],
    },
    {
      id: "lab-evaluativo-02-dividir-y-vencer",
      slug: "lab-evaluativo-02-dividir-y-vencer",
      articleSlug: "lab-evaluativo-02-dividir-y-vencer",
      kind: "guide",
      order: 8.5,
      title: "Laboratorio evaluativo 02 — Dividir y vencer",
      topics: [],
    },
    {
      id: "pilas-colas-y-listas",
      slug: "pilas-colas-y-listas",
      articleSlug: "pilas-colas-y-listas",
      order: 12,
      title: "Pilas, colas y listas enlazadas",
      summary:
        "Las estructuras elementales sobre las que se apoya casi todo lo demás: pilas, colas y listas enlazadas, con su costo por operación y lo que cada representación gana o pierde.",
      topics: [
        { title: "Pilas y colas: operaciones e implementación con arreglos" },
        { title: "Listas enlazadas simples y dobles; árboles enraizados (mención)" },
      ],
    },
    {
      id: "tablas-hash",
      slug: "tablas-hash",
      articleSlug: "tablas-hash",
      order: 13,
      title: "Tablas hash",
      summary:
        "Cómo encontrar un dato sin recorrer la colección: funciones hash, colisiones resueltas con encadenamiento o direccionamiento abierto, y el factor de carga que explica por qué el costo esperado de buscar es Θ(1 + α) y no Θ(n).",
      topics: [
        { title: "Tablas de direccionamiento directo vs. tablas hash" },
        { title: "Funciones hash: método de la división, método de la multiplicación" },
        {
          title:
            "Manejo de colisiones: encadenamiento y direccionamiento abierto (sondeo lineal, cuadrático, doble hashing)",
        },
        { title: "Factor de carga y costo esperado: Θ(1 + α) y redimensionamiento" },
      ],
    },
    {
      id: "lab-evaluativo-03-estructuras-de-datos",
      slug: "lab-evaluativo-03-estructuras-de-datos",
      articleSlug: "lab-evaluativo-03-estructuras-de-datos",
      kind: "guide",
      order: 13.75,
      title: "Laboratorio evaluativo 03 — Estructuras de datos",
      topics: [],
    },
    {
      id: "arboles-de-busqueda-binarios",
      slug: "arboles-de-busqueda-binarios",
      articleSlug: "arboles-de-busqueda-binarios",
      order: 13.5,
      title: "Árboles de búsqueda binarios",
      summary:
        "Un árbol de búsqueda binario cuelga las claves como carpetas en un tablero: buscar e insertar cuestan Θ(h), y la altura h decide si el tablero es un atajo o una fila.",
      topics: [
        { title: "Propiedad del árbol de búsqueda binario y vocabulario (raíz, hijos, hoja, subárbol, altura)" },
        { title: "Búsqueda iterativa en un BST" },
        { title: "Inserción iterativa en un BST" },
        { title: "Recorrido en orden, mínimo y máximo" },
        { title: "Altura y degeneración: Θ(h), Θ(n) frente a Θ(log n)" },
        { title: "BST frente a tabla hash: consultas por rango y orden" },
      ],
    },
    {
      id: "fundamentos-de-programacion-dinamica",
      slug: "fundamentos-de-programacion-dinamica",
      articleSlug: "fundamentos-de-programacion-dinamica",
      order: 14,
      title: "Fundamentos de programación dinámica",
      summary:
        "Cómo dejar de resolver el mismo subproblema una y otra vez: el corte de varillas pasa de Θ(2ⁿ) a Θ(n²) con memoización o tabulación, y un arreglo auxiliar permite recuperar dónde cortar, no solo cuánto se gana.",
      topics: [
        { title: "Corte de varillas: solución recursiva ingenua vs. memoización vs. tabulación" },
        { title: "Subestructura óptima y subproblemas traslapados" },
        { title: "Reconstrucción de la solución óptima" },
      ],
    },
    {
      id: "estrategia-voraz",
      slug: "estrategia-voraz",
      articleSlug: "estrategia-voraz",
      order: 16,
      title: "Estrategia voraz",
      summary:
        "Cómo escoger a ciegas y acertar: en la selección de actividades basta elegir siempre la que termina primero, y la propiedad de elección voraz junto con la subestructura óptima explican por qué otras reglas fallan y por qué esto cuesta Θ(n log n) y no el O(n³) de la programación dinámica.",
      topics: [
        { title: "El problema de selección de actividades" },
        { title: "Elementos de la estrategia voraz: elección voraz y subestructura óptima" },
      ],
    },
    {
      id: "proyecto-final",
      slug: "proyecto-final",
      articleSlug: "proyecto-final",
      order: 17,
      title: "Proyecto final",
      topics: [],
    },
  ],
};
