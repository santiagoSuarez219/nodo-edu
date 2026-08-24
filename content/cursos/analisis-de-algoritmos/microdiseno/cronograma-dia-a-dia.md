# Calendario día a día — Introducción al Análisis de Algoritmos (2026-2)

**Período de desarrollo curricular:** 3 de agosto – 29 de noviembre de 2026 (calendario institucional).
**Sesiones:** 2 por semana, 2 h cada una — *los días exactos aún no están definidos; usa este calendario reemplazando "Sesión 1 / Sesión 2" por los dos días que te asignen (p. ej. martes y jueves)*.

> **Ajuste frente al `info.md`:** el curso está diseñado para 17 semanas, pero el calendario institucional solo permite **16 semanas de clase** antes de la semana de exámenes finales (23-29 nov, en la que — según indicaste — este curso ya no tiene clase). Para que quepa exactamente, la antigua **Semana 17 (Cierre del curso)** se fusionó con el cierre del **Laboratorio 5** en la Semana 16. Todo lo demás (los 5 laboratorios, sus pesos y el orden de contenidos) queda igual que en `info.md`.

---

## Resumen de hitos institucionales que caen dentro del semestre

| Fecha                          | Hito institucional                                              | ¿Afecta las clases de este curso? |
| ------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| 31 ago – 5 sep                  | Primera evaluación de estudiantes a docentes                       | No — administrativo, no suspende clase |
| 16 – 20 oct                     | Evaluaciones institucionales                                       | No — confirmaste que hay clase normal |
| 26 oct – 1 nov                  | Segunda evaluación de estudiantes a docentes                       | No — administrativo |
| Hasta el 1 nov                  | Registro en el SIA del 60% evaluado                                 | Sí — revisa que Laboratorios 1-3 (45%) estén registrados a tiempo (ver nota más abajo) |
| Hasta el 22 nov                 | Fecha límite de cancelación de asignaturas/matrícula                | Coincide con el fin de la Semana 16 |
| 23 – 29 nov                     | Exámenes finales institucionales                                    | No aplica — el curso ya terminó |
| 23 – 29 nov                     | Fecha límite de registro del 100% evaluado                          | Sí — registrar Laboratorio 4, Laboratorio 5 y Seguimiento en esta ventana |

**Nota sobre el 60% evaluado (plazo: 1 de noviembre):** con el calendario de abajo, para esa fecha ya estarán calificados el Laboratorio 1 (15%), Laboratorio 2 (15%) y Laboratorio 3 (15%) = 45% formal, más el avance de Seguimiento acumulado a esa fecha. Si tu programa exige que el 60% quede *numéricamente* registrado antes del 1 de noviembre, conviene tener ya una nota parcial de Seguimiento calculada a esa altura del semestre (por ejemplo, promediando los quices y ejercicios de clase hechos hasta la Semana 11) para completar el 60% exigido.

---

## Calendario semana a semana

### Semana 1 — 3 al 9 de agosto
**Módulo 1: Git y manejo de repositorios**
- **Sesión 1 (T):** Fundamentos de control de versiones y flujo de trabajo (repositorio, commit, staging, ramas, GitHub)
- **Sesión 2 (P):** Laboratorio — Repositorio del curso (estructura de carpetas, primer README, commits y una rama con merge)

### Semana 2 — 10 al 16 de agosto
**Módulo 2: Introducción a Python**
- **Sesión 1 (T):** Sintaxis de Python (tipos de datos, control de flujo, funciones, estructuras nativas, comprensión de listas, excepciones)
- **Sesión 2 (P):** Laboratorio — Configuración del entorno de trabajo (`venv`, `requirements.txt`, PEP 8, buenas prácticas, ejercicio integrador)

### Semana 3 — 17 al 23 de agosto
**Módulo 3: Fundamentos (Cormen Cap. 1-2)**
- **Sesión 1 (T):** El rol de los algoritmos como tecnología; insertion sort y su invariante de ciclo
- **Sesión 2 (P):** Laboratorio — Insertion sort en Python (conteo de operaciones, mejor/peor caso)

### Semana 4 — 24 al 30 de agosto
**Módulo 3: Fundamentos (Cormen Cap. 2)**
- **Sesión 1 (T):** Análisis de algoritmos (peor/mejor/promedio caso); introducción a divide y vencer con merge sort
- **Sesión 2 (P):** Laboratorio — Merge sort y comparación empírica con insertion sort

### Semana 5 — 31 de agosto al 6 de septiembre
*Coincide con la Primera evaluación de estudiantes a docentes (31 ago - 5 sep) — no afecta la clase.*
**Módulo 4: Crecimiento de funciones (Cormen Cap. 3)**
- **Sesión 1 (T):** Notación asintótica O, Θ, Ω; notaciones estándar y funciones comunes
- **Sesión 2:** Sin sesión de laboratorio esta semana. El laboratorio de
  clasificación asintótica y verificación empírica con gráficas que
  ocupaba este espacio se eliminó del curso (decisión del docente,
  2026-08-22) — no se dicta en ninguna otra semana.

### Semana 6 — 7 al 13 de septiembre
**Módulo 5: Recurrencias y divide y vencer (Cormen Cap. 4)**
- **Sesión 1 (T):** Cómo resolver recurrencias — sustitución, árbol de recursión, método maestro
- **Sesión 2 (P ★):** **Laboratorio evaluativo 1 — Fundamentos, complejidad y recurrencias (15%)**
  - Entrega: informe en GitHub (`lab1-fundamentos-complejidad-recurrencias/`)

### Semana 7 — 14 al 20 de septiembre
**Módulo 5: Divide y vencer (Cormen Cap. 4)**
- **Sesión 1 (T):** El problema del subarreglo máximo; algoritmo de Strassen
- **Sesión 2 (P):** Laboratorio — Implementación de subarreglo máximo y Strassen, comparación con fuerza bruta

### Semana 8 — 21 al 27 de septiembre
**Módulo 5: Consolidación de divide y vencer**
- **Sesión 1 (T):** Síntesis del paradigma de divide y vencer; ¿cuándo es la técnica adecuada?
- **Sesión 2 (P ★):** **Laboratorio evaluativo 2 — Dividir y vencer (15%)**
  - Entrega: informe en GitHub (`lab2-divide-y-vencer/`)

### Semana 9 — 28 de septiembre al 4 de octubre
**Módulo 6: Ordenamiento (Cormen Cap. 6)**
- **Sesión 1 (T):** Heaps y heapsort; colas de prioridad
- **Sesión 2 (P):** Laboratorio — Implementación de max-heap, heapsort y cola de prioridad

### Semana 10 — 5 al 11 de octubre
**Módulo 6: Ordenamiento (Cormen Cap. 7)**
- **Sesión 1 (T):** Quicksort determinista y aleatorizado; análisis de desempeño
- **Sesión 2 (P):** Laboratorio — Quicksort (ambas versiones), comparación empírica

### Semana 11 — 12 al 18 de octubre
*Toca parcialmente la semana de Evaluaciones institucionales (16-20 oct) — confirmaste que hay clase normal.*
**Módulo 6: Ordenamiento (Cormen Cap. 8)**
- **Sesión 1 (T):** Ordenamiento en tiempo lineal — counting sort, radix sort, bucket sort
- **Sesión 2 (P ★):** **Laboratorio evaluativo 3 — Algoritmos de ordenamiento (15%)**
  - Entrega: informe en GitHub (`lab3-ordenamiento/`)

### Semana 12 — 19 al 25 de octubre
*Cola de la semana de Evaluaciones institucionales (19-20 oct) — clase normal.*
**Módulo 7: Estructuras de datos (Cormen Cap. 9-10)**
- **Sesión 1 (T):** Medianas y selección en tiempo lineal esperado; pilas, colas, listas enlazadas
- **Sesión 2 (P):** Laboratorio — Selección y estructuras elementales

### Semana 13 — 26 de octubre al 1 de noviembre
*Coincide con la Segunda evaluación de estudiantes a docentes (26 oct - 1 nov) y con el plazo de registro del 60% evaluado (hasta el 1 nov).*
**Módulo 7: Estructuras de datos (Cormen Cap. 11)**
- **Sesión 1 (T):** Tablas hash — funciones hash, encadenamiento, direccionamiento abierto
- **Sesión 2 (P ★):** **Laboratorio evaluativo 4 — Estructuras de datos (15%)**
  - Entrega: informe en GitHub (`lab4-estructuras-datos/`)
  - ⚠️ Registrar en el SIA el acumulado de Laboratorios 1-3 (y el avance de Seguimiento) antes del 1 de noviembre

### Semana 14 — 2 al 8 de noviembre
**Módulo 8: Programación dinámica (Cormen Cap. 15)**
- **Sesión 1 (T):** Corte de varillas (*rod cutting*); multiplicación de cadenas de matrices
- **Sesión 2 (P):** Laboratorio — Rod cutting y matrix-chain (memoización vs. tabulación)

### Semana 15 — 9 al 15 de noviembre
**Módulo 8: Programación dinámica (Cormen Cap. 15)**
- **Sesión 1 (T):** Elementos de la programación dinámica; subsecuencia común más larga (LCS)
- **Sesión 2 (P):** Laboratorio — Implementación de LCS y reconstrucción de la solución óptima

### Semana 16 — 16 al 22 de noviembre — Cierre del curso
*Coincide con la fecha límite de cancelación de asignaturas/matrícula (hasta el 22 nov). Última semana de clase: el curso termina antes de la semana de exámenes finales institucionales (23-29 nov).*
**Módulo 8: Algoritmos voraces (Cormen Cap. 16) + Cierre del curso**
- **Sesión 1 (T):** Estrategia voraz — selección de actividades, elementos de la estrategia voraz, códigos de Huffman
- **Sesión 2 (P ★):** **Laboratorio evaluativo 5 — Programación dinámica y algoritmos voraces (20%)**
  - Entrega: informe en GitHub (`lab5-pd-voraces/`)
  - Cierre del curso: breve repaso integrador de las técnicas vistas, retroalimentación general y, si el tiempo lo permite, mención introductoria a grafos como tema opcional
  - ⚠️ Registrar el 100% evaluado (Laboratorios 4, 5 y nota de Seguimiento) durante la ventana del 23 al 29 de noviembre

---

## Vista rápida de entregas evaluativas

| Semana | Fechas               | Evaluación                                              | % |
| ------ | --------------------- | ---------------------------------------------------------- | -- |
| 6      | 7 – 13 sep             | Laboratorio 1: Fundamentos, complejidad y recurrencias       | 15% |
| 8      | 21 – 27 sep             | Laboratorio 2: Dividir y vencer                               | 15% |
| 11     | 12 – 18 oct             | Laboratorio 3: Algoritmos de ordenamiento                     | 15% |
| 13     | 26 oct – 1 nov          | Laboratorio 4: Estructuras de datos                            | 15% |
| 16     | 16 – 22 nov             | Laboratorio 5: Programación dinámica y algoritmos voraces      | 20% |
| —      | Todo el semestre        | Seguimiento                                                     | 20% |
| **Total** |                      |                                                                  | **100%** |

---

*Documento complementario a `info.md`. Cuando se asignen los días exactos de clase (p. ej. martes y jueves), basta con mapear "Sesión 1" al primer día de la semana y "Sesión 2" al segundo; las fechas de cada semana (lunes-domingo) ya están fijadas por el calendario institucional 2026-2.*