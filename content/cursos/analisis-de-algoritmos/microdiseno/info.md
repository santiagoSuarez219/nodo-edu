# Curso de Introducción al Análisis de Algoritmos

**Programa:** Ingeniería de Sistemas
**Créditos:** 3 | **Modalidad:** Virtual
**Duración:** 17 semanas (4 h sincrónicas/semana)
**Horas sincrónicas:** 68 h (34 sesiones de 2 h) | **Horas independientes:** 80 h
**Prerrequisito:** Ninguno

## **📝 Evaluación del curso**

| Actividad                                                                          | Porcentaje | Momento    |
| -------------------------------------------------------------------------------------- | ---------- | ---------- |
| **Laboratorio 1:** Fundamentos, complejidad y recurrencias                            | 15%        | Semana 6   |
| **Laboratorio 2:** Dividir y vencer                                                    | 15%        | Semana 8   |
| **Laboratorio 3:** Algoritmos de ordenamiento                                          | 15%        | Semana 11  |
| **Laboratorio 4:** Estructuras de datos                                                | 15%        | Semana 13  |
| **Laboratorio 5:** Programación dinámica y algoritmos voraces                          | 20%        | Semana 16  |
| **Seguimiento:** evaluación continua (quices cortos, participación, consistencia de commits, ejercicios de clase) | 20%        | Durante todo el semestre |
| **Total**                                                                                 | **100%**   |            |

> Cada laboratorio se aplica **después** de que su contenido se ha enseñado por completo, y su componente práctico es la sesión evaluativa (★) del tema correspondiente. No existe un sistema de evaluación paralelo: la sesión ★ *es* el laboratorio.

### Formato de los laboratorios (informes en GitHub)

Cada uno de los cinco laboratorios evaluativos se entrega como un **informe de laboratorio en GitHub**: una carpeta dentro del repositorio del curso con un `README.md` que documenta el trabajo, acompañado de código Python bien estructurado que lo respalda. Las guías buscan evaluar tanto la comprensión de los conceptos teóricos como su correcta aplicación sobre problemas ya definidos, y cada una se entrega junto con su rúbrica de calificación.

**Estructura típica de una guía de laboratorio:**

1. **Preguntas de selección múltiple** — verifican comprensión conceptual rápida (notación, definiciones, propiedades de los algoritmos vistos).
2. **Preguntas abiertas** — piden justificar, comparar o argumentar sobre un concepto o una decisión de diseño.
3. **Explicación de un tema** — el estudiante explica con sus propias palabras (apoyado en pseudocódigo o diagramas si aplica) un concepto puntual del módulo.
4. **Parte práctica** — implementación en Python de los algoritmos/problemas definidos en la guía, e incluye:
   - Código estructurado (funciones con responsabilidad única, *docstrings*, nombres claros, casos de prueba)
   - Gráficas del comportamiento del algoritmo (tiempo de ejecución vs. tamaño de entrada, número de comparaciones/operaciones vs. *n*, etc.) generadas con `matplotlib`
   - Un análisis breve que conecte los resultados empíricos con la complejidad teórica esperada

**Rúbrica de calificación (estructura común a las cinco guías):**

| Criterio                                                    | Qué evalúa |
| -------------------------------------------------------------- | ---------- |
| Corrección conceptual                                          | Selección múltiple y preguntas abiertas respondidas correctamente |
| Calidad de la explicación teórica                              | Claridad, precisión y uso adecuado de la terminología del módulo |
| Corrección de la implementación                                | El código resuelve los problemas definidos en la guía y pasa los casos de prueba |
| Calidad del análisis de las gráficas de comportamiento         | Las gráficas están bien construidas y el análisis conecta lo empírico con lo teórico |
| Documentación y organización del informe                       | `README.md` claro, código legible, commits descriptivos y frecuentes |

*Cada guía puede ajustar los pesos relativos de estos criterios según el tema, pero la estructura de la rúbrica se mantiene constante para que los estudiantes sepan qué esperar en cada entrega.*

### Estructura semanal

| Sesión  | Tipo                  | Duración |
| ------- | --------------------- | -------- |
| Clase 1 | Teoría                | 2 h      |
| Clase 2 | Laboratorio práctico  | 2 h      |

**Convenciones:** `T` sesión teórica · `P` laboratorio práctico (no evaluativo) · `P ★` laboratorio evaluativo (informe en GitHub)

---

## Prererequisitos técnicos

- **Python 3.x**: instalación del intérprete (la sintaxis y la configuración del entorno se enseñan formalmente en el Módulo 2, Semana 2 — no se asume conocimiento previo).
- **Visual Studio Code** (u otro IDE equivalente): instalación y configuración de extensiones para Python.
- **Git y GitHub**: instalación, configuración y uso básico de control de versiones — indispensable, ya que **todos los informes de laboratorio se entregan como carpetas versionadas en el repositorio del curso**.
- **Markdown**: sintaxis básica para escribir los `README.md` de cada informe de laboratorio.
- **Librerías de apoyo**: `time` / `timeit` (medición empírica), `matplotlib` (graficar el comportamiento de los algoritmos).

---

## Mapa general del curso (17 semanas)

*El orden de los módulos sigue las Partes I–IV de Cormen et al., **Introduction to Algorithms** (3.ª ed.): Fundamentos → Ordenamiento y estadísticos de orden → Estructuras de datos → Técnicas avanzadas de diseño y análisis. El Módulo 2 (Python) es un añadido previo a esa estructura, necesario porque el curso no exige conocimientos previos de programación.*

| Sem | Módulo                                        | Foco de la semana                                                 | Evaluación        |
| --- | ---------------------------------------------- | -------------------------------------------------------------------- | ------------------ |
| 1   | Git y manejo de repositorios                   | Control de versiones, ramas, estructura del repo del curso           |                     |
| 2   | Introducción a Python                          | Sintaxis del lenguaje; configuración del entorno de trabajo          |                     |
| 3   | Fundamentos (Cormen Cap. 1–2)                  | El rol de los algoritmos; insertion sort                             |                     |
| 4   | Fundamentos (Cormen Cap. 2)                    | Analizar y diseñar algoritmos; introducción a divide y vencer        |                     |
| 5   | Crecimiento de funciones (Cormen Cap. 3)       | Notación asintótica O, Θ, Ω y funciones comunes                      |                     |
| 6   | Recurrencias (Cormen Cap. 4)                   | Sustitución, árbol de recursión y método maestro                     | ★ Laboratorio 1     |
| 7   | Divide y vencer (Cormen Cap. 4)                | Subarreglo máximo y algoritmo de Strassen                            |                     |
| 8   | Divide y vencer (Cormen Cap. 4)                | Consolidación: aplicaciones adicionales de divide y vencer           | ★ Laboratorio 2     |
| 9   | Ordenamiento (Cormen Cap. 6)                   | Heapsort y colas de prioridad                                        |                     |
| 10  | Ordenamiento (Cormen Cap. 7)                   | Quicksort determinista y aleatorizado                                 |                     |
| 11  | Ordenamiento (Cormen Cap. 8)                   | Ordenamiento en tiempo lineal — counting, radix y bucket sort         | ★ Laboratorio 3     |
| 12  | Estructuras de datos (Cormen Cap. 9–10)        | Selección/medianas; pilas, colas, listas enlazadas                    |                     |
| 13  | Estructuras de datos (Cormen Cap. 11)          | Tablas hash: funciones hash y manejo de colisiones                    | ★ Laboratorio 4     |
| 14  | Programación dinámica (Cormen Cap. 15)         | Corte de varillas (rod cutting) y multiplicación de cadenas de matrices |                   |
| 15  | Programación dinámica (Cormen Cap. 15)         | Elementos de la PD; subsecuencia común más larga (LCS)                 |                     |
| 16  | Algoritmos voraces (Cormen Cap. 16)            | Selección de actividades, elementos de la estrategia voraz, Huffman   | ★ Laboratorio 5     |
| 17  | Cierre del curso                               | Repaso general, retroalimentación y taller opcional de grafos         |                     |

---

## Organización del repositorio del curso

A partir del Módulo 1, todo el trabajo del curso vive en un único repositorio. Los cinco laboratorios evaluativos se organizan en carpetas independientes, cada una con su informe (`README.md`), su código y sus gráficas; el resto de sesiones prácticas (no evaluativas) se agrupan aparte.

```
curso-analisis-algoritmos/
├── laboratorios/
│   ├── lab1-fundamentos-complejidad-recurrencias/
│   │   ├── README.md        # informe: preguntas, explicación teórica, análisis de resultados
│   │   ├── src/              # código Python del laboratorio
│   │   └── graficas/         # gráficas de comportamiento generadas
│   ├── lab2-divide-y-vencer/
│   ├── lab3-ordenamiento/
│   ├── lab4-estructuras-datos/
│   └── lab5-pd-voraces/
├── ejercicios-clase/         # código de las sesiones prácticas no evaluativas (incluye los ejercicios del Módulo 2 — Python)
├── benchmarks/                # scripts compartidos de medición de tiempos y graficación
└── README.md
```

---

## Módulo 1 — Git y manejo de repositorios

### Semana 1

**T — Fundamentos de control de versiones y flujo de trabajo**
- ¿Qué es el control de versiones y por qué importa en el desarrollo de software y en la experimentación con algoritmos?
- Conceptos clave: repositorio, commit, staging area, HEAD, historial
- Comandos esenciales: `init`, `add`, `commit`, `status`, `log`, `diff`
- Repositorios remotos: `push`, `pull`, `fetch`, `clone`
- Ramas: `branch`, `checkout`, `merge`; flujo de trabajo básico tipo feature branch

**P — Laboratorio: Repositorio del curso**
- Crear el repositorio local y vincularlo a GitHub
- Definir la estructura de carpetas del curso (`laboratorios/`, `ejercicios-clase/`, `benchmarks/`) con un `README.md` inicial
- Practicar la escritura de un `README.md` en Markdown (encabezados, listas, bloques de código, imágenes), ya que será el formato de todos los informes de laboratorio
- Realizar una secuencia de commits con mensajes descriptivos; crear al menos una rama y fusionarla, resolviendo un conflicto simulado
- *La instalación de Python y la configuración del entorno virtual se abordan en profundidad en la Semana 2*

---

## Módulo 2 — Introducción a Python

### Semana 2 — Sintaxis y configuración del entorno de trabajo

**T — Sintaxis de Python**
- Tipos de datos básicos: `int`, `float`, `str`, `bool`, `None`
- Estructuras de control: `if` / `elif` / `else`, `for`, `while`
- Funciones: definición, parámetros, valores de retorno, *docstrings*
- Estructuras de datos nativas: listas, tuplas, diccionarios, conjuntos
- Comprensión de listas (*list comprehensions*) como preparación para escribir código idiomático
- Manejo básico de excepciones (`try` / `except`) y de módulos (`import`)

**P — Laboratorio: Configuración del entorno de trabajo**
- Entornos virtuales: por qué aislar las dependencias de cada proyecto; creación y activación/desactivación de un entorno con `venv`
- Gestión de dependencias con `requirements.txt`: `pip install`, `pip freeze > requirements.txt`, `pip install -r requirements.txt`
- Buenas prácticas de código en Python: convenciones de estilo (PEP 8), nombrado de variables y funciones, organización de un script (`if __name__ == "__main__":`), *docstrings*, *type hints* básicos
- Instalar y verificar dentro del entorno virtual las librerías que se usarán en el curso (`matplotlib`, entre otras)
- Ejercicio integrador: escribir un script pequeño y bien estructurado (funciones documentadas, nombres claros, punto de entrada `main`) que aplique al menos tres de los conceptos de sintaxis vistos en la sesión teórica

---

## Módulo 3 — Fundamentos (Cormen, Cap. 1–2)

### Semana 3 — El rol de los algoritmos e insertion sort

**T — Algoritmos como tecnología**
- ¿Qué es un algoritmo? Algoritmos como tecnología: por qué importa la eficiencia además de la corrección
- Insertion sort: descripción del algoritmo y su invariante de ciclo
- Prueba de corrección mediante invariantes de ciclo (inicialización, mantenimiento, terminación)

**P — Laboratorio: Insertion sort en Python**
- Implementar insertion sort y verificar la invariante de ciclo con casos de prueba
- Contar operaciones básicas (comparaciones, desplazamientos) para distintos tamaños de entrada
- Identificar el mejor y el peor caso de entrada para este algoritmo

### Semana 4 — Analizando y diseñando algoritmos

**T — Análisis de algoritmos y divide y vencer**
- Complejidad temporal vs. complejidad espacial: qué mide cada una
- Análisis del peor caso, mejor caso y caso promedio
- Orden de crecimiento: intuición previa a la notación formal
- Diseño de algoritmos por divide y vencer: introducción con merge sort (dividir, conquistar, combinar)

**P — Laboratorio: Merge sort y comparación con insertion sort**
- Implementar merge sort en Python
- Medir tiempos de ejecución de merge sort vs. insertion sort para entradas de distinto tamaño
- Discutir en qué escenarios insertion sort puede seguir siendo preferible (entradas pequeñas o casi ordenadas)

---

## Módulo 4 — Crecimiento de funciones (Cormen, Cap. 3)

### Semana 5 — Notación asintótica

**T — Notación O, Θ y Ω**
- Notación asintótica: definiciones formales de O, Θ y Ω
- Notaciones estándar y funciones comunes: polinomios, logaritmos, exponenciales, factoriales
- Comparación de tasas de crecimiento y jerarquía de funciones

> **Sin sesión P esta semana** (decisión del docente, 2026-08-22): el
> laboratorio de clasificación asintótica que ocupaba este espacio —
> clasificar funciones por su notación más ajustada, graficar con
> `matplotlib` y verificar empíricamente la notación de insertion sort y
> merge sort — se eliminó del curso. No se reubica en ninguna otra semana.

---

## Módulo 5 — Recurrencias y divide y vencer (Cormen, Cap. 4)

### Semana 6 — Recurrencias: sustitución, árbol de recursión y método maestro ★

**T — Cómo resolver recurrencias**
- Planteamiento de la recurrencia de un algoritmo recursivo
- El método de sustitución para resolver recurrencias
- El método del árbol de recursión
- El método maestro: enunciado y condiciones de aplicación

**P ★ — Laboratorio evaluativo 1: Fundamentos, complejidad y recurrencias**
- Preguntas de selección múltiple sobre notación asintótica y propiedades de la complejidad
- Preguntas abiertas: justificar la elección de un caso (mejor/peor/promedio) para un algoritmo dado
- Explicación de un tema: el estudiante explica, con sus palabras, uno de los tres métodos para resolver recurrencias
- Parte práctica: plantear y resolver por sustitución y por árbol de recursión la recurrencia de al menos dos algoritmos ya implementados (insertion sort y merge sort); graficar tiempo de ejecución vs. tamaño de entrada y contrastarlo con la complejidad calculada
- Informe de laboratorio en GitHub (`lab1-fundamentos-complejidad-recurrencias/`) con rúbrica socializada previamente — **cierre de la evaluación Laboratorio 1 (15%)**

### Semana 7 — Aplicaciones de divide y vencer

**T — Subarreglo máximo y Strassen**
- El problema del subarreglo máximo (*maximum-subarray problem*) resuelto por divide y vencer
- El algoritmo de Strassen para multiplicación de matrices como ejemplo de divide y vencer no trivial
- Comparación de ambos contra sus alternativas de fuerza bruta

**P — Laboratorio: Subarreglo máximo y Strassen**
- Implementar la solución por divide y vencer al problema del subarreglo máximo
- Implementar (o simular con matrices pequeñas) el algoritmo de Strassen
- Medir el desempeño de ambas soluciones frente a su versión de fuerza bruta

### Semana 8 — Consolidación de divide y vencer ★

**T — Síntesis del paradigma de divide y vencer**
- Repaso del esquema general: dividir, conquistar, combinar
- ¿Cuándo divide y vencer es la técnica adecuada? Relación entre la forma de la recurrencia y la eficiencia obtenida
- Casos límite: cuándo dividir el problema no aporta ninguna mejora

**P ★ — Laboratorio evaluativo 2: Dividir y vencer**
- Preguntas de selección múltiple sobre el esquema de divide y vencer y sus recurrencias asociadas
- Preguntas abiertas: comparar dos soluciones (una por divide y vencer, otra de fuerza bruta) para un mismo problema
- Explicación de un tema: el estudiante explica el algoritmo de Strassen o el problema del subarreglo máximo, incluyendo su recurrencia
- Parte práctica: resolver un problema nuevo (no visto en clase) aplicando divide y vencer; incluir gráfica de tiempo de ejecución vs. tamaño de entrada y análisis de la complejidad obtenida frente a la esperada por el método maestro
- Informe de laboratorio en GitHub (`lab2-divide-y-vencer/`) con rúbrica socializada previamente — **cierre de la evaluación Laboratorio 2 (15%)**

---

## Módulo 6 — Ordenamiento (Cormen, Cap. 6–8)

### Semana 9 — Heapsort y colas de prioridad

**T — Heaps y heapsort**
- La propiedad de heap (max-heap y min-heap)
- Mantener la propiedad de heap; construir un heap desde un arreglo
- El algoritmo heapsort; colas de prioridad como aplicación de los heaps

**P — Laboratorio: Heapsort y cola de prioridad**
- Implementar un max-heap con las operaciones `build-max-heap` y `max-heapify`
- Implementar heapsort a partir del heap
- Implementar una cola de prioridad simple usando el heap (inserción y extracción del máximo)

### Semana 10 — Quicksort

**T — Quicksort determinista y aleatorizado**
- Descripción de quicksort: partición y recursión
- Desempeño de quicksort: peor caso O(n²) frente a caso promedio O(n log n)
- Versión aleatorizada de quicksort y por qué mejora el comportamiento esperado

**P — Laboratorio: Quicksort**
- Implementar quicksort determinista (pivote fijo) y aleatorizado (pivote aleatorio)
- Medir el desempeño de ambas versiones frente a entradas ya ordenadas y entradas aleatorias
- Instrumentar el conteo de comparaciones para contrastar con el análisis teórico

### Semana 11 — Ordenamiento en tiempo lineal ★

**T — Counting sort, radix sort y bucket sort**
- Cota inferior para el ordenamiento por comparaciones: Ω(n log n)
- Counting sort: cuándo es aplicable y por qué logra O(n)
- Radix sort y bucket sort: ideas generales y supuestos sobre los datos de entrada

**P ★ — Laboratorio evaluativo 3: Algoritmos de ordenamiento**
- Preguntas de selección múltiple sobre la complejidad y las condiciones de aplicabilidad de cada algoritmo de ordenamiento visto
- Preguntas abiertas: justificar cuál algoritmo de ordenamiento conviene para un conjunto de datos con características dadas
- Explicación de un tema: el estudiante explica por qué counting sort logra O(n) sin violar la cota inferior Ω(n log n) del ordenamiento por comparaciones
- Parte práctica: implementar al menos un algoritmo de ordenamiento por comparación (heapsort o quicksort) y uno de tiempo lineal (counting, radix o bucket); graficar tiempo de ejecución vs. tamaño de entrada para ambos y comparar
- Informe de laboratorio en GitHub (`lab3-ordenamiento/`) con rúbrica socializada previamente — **cierre de la evaluación Laboratorio 3 (15%)**

---

## Módulo 7 — Estructuras de datos (Cormen, Cap. 9–11) ★

### Semana 12 — Selección y estructuras elementales

**T — Medianas, selección y estructuras elementales**
- Mínimo y máximo; selección en tiempo lineal esperado
- Pilas y colas: operaciones e implementación con arreglos
- Listas enlazadas: simple, doble; representación de árboles enraizados

**P — Laboratorio: Selección y estructuras elementales**
- Implementar el algoritmo de selección en tiempo lineal esperado (basado en partición tipo quicksort)
- Implementar pila y cola con arreglo, y una lista simplemente enlazada
- Comparar el costo de encontrar el k-ésimo menor elemento por selección vs. por ordenamiento completo

### Semana 13 — Tablas hash ★

**T — Tablas hash**
- Tablas de direccionamiento directo vs. tablas hash
- Funciones hash: método de la división, método de la multiplicación
- Manejo de colisiones: encadenamiento y direccionamiento abierto (sondeo lineal, cuadrático, doble hashing)

**P ★ — Laboratorio evaluativo 4: Estructuras de datos**
- Preguntas de selección múltiple sobre operaciones y complejidades de pilas, colas, listas enlazadas y tablas hash
- Preguntas abiertas: justificar la elección de una estructura de datos para un escenario dado
- Explicación de un tema: el estudiante explica el manejo de colisiones (encadenamiento o direccionamiento abierto) en tablas hash
- Parte práctica: partir de una solución basada en listas enlazadas con tiempos de respuesta deficientes y rediseñarla con una tabla hash propia; graficar y comparar los tiempos de búsqueda antes y después de la optimización
- Informe de laboratorio en GitHub (`lab4-estructuras-datos/`) con rúbrica socializada previamente — **cierre de la evaluación Laboratorio 4 (15%)**

---

## Módulo 8 — Programación dinámica y algoritmos voraces (Cormen, Cap. 15–16) ★

### Semana 14 — Rod cutting y multiplicación de cadenas de matrices

**T — Fundamentos de programación dinámica**
- Corte de varillas (*rod cutting*): solución recursiva ingenua vs. memoización vs. tabulación
- Multiplicación de cadenas de matrices: planteamiento del problema y la recurrencia asociada
- Reconstrucción de la solución óptima (no solo el valor óptimo)

**P — Laboratorio: Rod cutting y matrix-chain**
- Implementar el corte de varillas con memoización (*top-down*) y con tabulación (*bottom-up*)
- Implementar la solución de programación dinámica para la multiplicación de cadenas de matrices
- Comparar el tiempo de ejecución de la versión recursiva ingenua frente a las versiones optimizadas

### Semana 15 — Elementos de la PD y subsecuencia común más larga

**T — Elementos de la programación dinámica y LCS**
- Subestructura óptima y subproblemas traslapados: cómo reconocerlos
- Subsecuencia común más larga (LCS): planteamiento, tabla de subproblemas y reconstrucción de la solución
- Cuándo memoización, cuándo tabulación: consideraciones prácticas

**P — Laboratorio: Subsecuencia común más larga**
- Implementar el cálculo de la LCS con programación dinámica
- Reconstruir la subsecuencia óptima (no solo su longitud)
- Medir el tiempo de ejecución frente al tamaño de las cadenas de entrada

### Semana 16 — Algoritmos voraces ★

**T — Estrategia voraz**
- El problema de selección de actividades (*activity-selection problem*)
- Elementos de la estrategia voraz: elección voraz y subestructura óptima
- Códigos de Huffman: construcción del árbol y compresión

**P ★ — Laboratorio evaluativo 5: Programación dinámica y algoritmos voraces**
- Preguntas de selección múltiple sobre subestructura óptima, subproblemas traslapados y la propiedad de elección voraz
- Preguntas abiertas: dado un problema, argumentar si un enfoque voraz produce la solución óptima o si se requiere programación dinámica
- Explicación de un tema: el estudiante explica, con sus palabras, por qué la propiedad de subestructura óptima es necesaria (pero no suficiente) para que un enfoque voraz funcione
- Parte práctica: implementar un problema de programación dinámica (mochila 0/1 o LCS) y un problema voraz (selección de actividades o Huffman); graficar el comportamiento de ambos y comparar sus complejidades
- Informe de laboratorio en GitHub (`lab5-pd-voraces/`) con rúbrica socializada previamente — **cierre de la evaluación Laboratorio 5 (20%)**

---

## Módulo 9 — Cierre del curso

### Semana 17 — Repaso, retroalimentación y enriquecimiento

**T — Síntesis del semestre**
- Repaso integrador de las técnicas de diseño vistas (recurrencias, divide y vencer, ordenamiento, estructuras de datos, programación dinámica, voraces)
- Retroalimentación general sobre los cinco informes de laboratorio entregados
- Espacio para resolver dudas pendientes antes del cierre del semestre

**P — Taller opcional: introducción a grafos**
- Representaciones de grafos (matriz y lista de adyacencia) y recorrido BFS/DFS a manera de cierre motivador
- No es una sesión evaluativa; su desempeño alimenta la nota de **seguimiento**
- Espacio para que cada estudiante complete o pula los `README.md` de sus cinco informes de laboratorio antes del cierre del repositorio

---

## Temas opcionales

*No tienen semana asignada. Se abordan como trabajo independiente, en el taller de la Semana 17, o si el avance del curso lo permite, en el orden indicado a continuación (todos corresponden a partes posteriores de Cormen et al.).*

### Grafos (Cormen, Cap. 22–24)

- Representaciones de grafos: matriz de adyacencia y lista de adyacencia
- Recorridos: BFS (*Breadth-First Search*) y DFS (*Depth-First Search*); ordenamiento topológico
- Árboles de expansión mínima: algoritmos de Kruskal y Prim
- Caminos más cortos desde un único origen: Bellman-Ford y Dijkstra

### Análisis amortizado (Cormen, Cap. 17)

- Análisis agregado, método contable y método del potencial
- Tablas dinámicas como ejemplo de análisis amortizado

### Introducción a NP-completitud (Cormen, Cap. 34)

- Problemas P vs. NP: intuición y ejemplos
- Reducciones entre problemas: idea general
- Por qué algunos problemas no tienen (hasta ahora) solución eficiente conocida, y cómo eso motiva el uso de algoritmos voraces o de aproximación

---

## Bibliografía

- Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). *Introduction to algorithms* (3rd ed.). The MIT Press.
- Sedgewick, R., & Wayne, K. (2011). *Algorithms* (4th ed.). Addison-Wesley.
- Kleinberg, J., & Tardos, É. (2005). *Algorithm design*. Pearson.

---

*Documento elaborado para el programa Ingeniería de Sistemas (modalidad virtual).*
*Basado en el microdiseño curricular FDE 058 V1 (16/05/2025) — Análisis de algoritmos — reorganizado según la tabla de contenido de Cormen et al., Introduction to Algorithms (3.ª ed.), Partes I–IV. El módulo de criptografía del microdiseño original fue eliminado; se añadió un módulo introductorio de Python (sintaxis y configuración del entorno); y el esquema de evaluación se reemplazó por cinco laboratorios teórico-prácticos (informes en GitHub con rúbrica) más una nota de seguimiento continuo — todo por solicitud explícita.*