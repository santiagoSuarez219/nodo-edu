# Calendario día a día — Introducción al Análisis de Algoritmos (2026-2)

**Período de desarrollo curricular:** 3 de agosto – 29 de noviembre de 2026 (calendario institucional).
**Sesiones:** hasta la Semana 9, según el plan original (2 por semana, 2 h cada una). **Desde la Semana 10 (reajuste del 2026-10-03)** el curso se dicta **solo los lunes**, en dos bloques de 2 h (Sesión 1 = T, Sesión 2 = P), y **los lunes festivos no hay clase** (12 oct, 2 nov y 16 nov).

> **Ajuste frente al `info.md`:** el curso está diseñado para 17 semanas, pero el calendario institucional solo permite **16 semanas de clase** antes de la semana de exámenes finales (23-29 nov, en la que — según indicaste — este curso ya no tiene clase). Para que quepa exactamente, la antigua **Semana 17 (Cierre del curso)** se fusionó con el cierre del **Laboratorio 5** en la Semana 16. Todo lo demás (los 5 laboratorios, sus pesos y el orden de contenidos) queda igual que en `info.md`.

---

## Resumen de hitos institucionales que caen dentro del semestre

| Fecha                          | Hito institucional                                              | ¿Afecta las clases de este curso? |
| ------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| 31 ago – 5 sep                  | Primera evaluación de estudiantes a docentes                       | No — administrativo, no suspende clase |
| 16 – 20 oct                     | Evaluaciones institucionales                                       | No — el lunes 19 oct hay clase normal |
| 26 oct – 1 nov                  | Segunda evaluación de estudiantes a docentes                       | No — administrativo |
| Hasta el 1 nov                  | Registro en el SIA del 60% evaluado                                 | Sí — revisa que Laboratorios 1-3 (45%) estén registrados a tiempo (ver nota más abajo) |
| Hasta el 22 nov                 | Fecha límite de cancelación de asignaturas/matrícula                | Coincide con la fecha límite de entrega del Laboratorio 4 |
| 23 – 29 nov                     | Exámenes finales institucionales                                    | No aplica — el curso ya terminó |
| 23 – 29 nov                     | Fecha límite de registro del 100% evaluado                          | Sí — registrar Laboratorio 4, Proyecto final y Seguimiento en esta ventana |

**Nota sobre el 60% evaluado (plazo: 1 de noviembre):** con el calendario de abajo, para esa fecha estarán calificados el Laboratorio 1 (15%), Momento 2 (15%) y Laboratorio 3 (15%, entrega el lunes 26 oct) = 45% formal, más el avance de Seguimiento. El Laboratorio 3 deja solo cinco días para calificar antes del plazo: programa esa calificación de inmediato. Si tu programa exige el 60% *numéricamente* registrado, conviene tener una nota parcial de Seguimiento calculada a esa altura.

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
- **Dictado:** el problema del subarreglo máximo. **Strassen no se alcanzó a dictar** y pasa a la Semana 10.

### Semana 8 — 21 al 27 de septiembre
**Reprogramada.** La síntesis del paradigma de divide y vencer y el Laboratorio evaluativo 2 pasan a la Semana 10.

### Semana 9 — 28 de septiembre al 4 de octubre
**Módulo 6 (Ordenamiento) retirado del curso.** No se dictan heapsort, quicksort ni ordenamiento en tiempo lineal, ni el laboratorio evaluativo de ordenamiento (decisión del docente, 2026-10-03). Las lecciones ya publicadas quedan fuera del recorrido.

> **Desde aquí, una sola jornada por semana: lunes, Sesión 1 (T) + Sesión 2 (P), 2 h cada una. Los lunes festivos no hay clase.**

### Semana 10 — lunes 5 de octubre
**Módulo 5: cierre de divide y vencer**
- **Sesión 1 (T):** Algoritmo de Strassen; síntesis del paradigma de divide y vencer (¿cuándo es la técnica adecuada?)
- **Sesión 2 (P ★):** **Momento evaluativo 2 — Dividir y vencer (15%)**, en dos partes:
  - Quiz A/B/C teórico (7,5%): abre el lunes 5 oct y cierra el domingo 11 oct
  - Laboratorio práctico (7,5%): informe en GitHub (`lab2-divide-y-vencer/`), plazo por definir
  - Solo se evalúa lo dictado: subarreglo máximo, Strassen y la síntesis.

### Semana 11 — lunes 12 de octubre
**Sin clase (festivo: Día de la Raza).**

### Semana 12 — lunes 19 de octubre
*Coincide con las Evaluaciones institucionales (16-20 oct) — clase normal.*
**Módulo 7: Estructuras de datos (Cormen Cap. 9-10)**
- **Sesión 1 (T):** Medianas y selección en tiempo lineal esperado; pilas, colas, listas enlazadas
- **Sesión 2 (P):** Laboratorio — Selección y estructuras elementales
  - La selección en tiempo lineal esperado usa una partición tipo quicksort; como Ordenamiento ya no se dicta, la partición se explica dentro de esta sesión.

### Semana 13 — lunes 26 de octubre
**Módulo 7: Estructuras de datos (Cormen Cap. 11)**
- **Sesión 1 (T):** Tablas hash — funciones hash, encadenamiento, direccionamiento abierto
- **Sesión 2 (P ★):** **Laboratorio evaluativo 3 — Estructuras de datos (15%)** *(antes Laboratorio 4)*
  - Entrega: informe en GitHub (`lab3-estructuras-datos/`)
  - ⚠️ Registrar en el SIA el acumulado de Laboratorios 1-3 (y el avance de Seguimiento) antes del 1 de noviembre

### Semana 14 — lunes 2 de noviembre
**Sin clase (festivo: Todos los Santos).**

### Semana 15 — lunes 9 de noviembre
**Módulo 8: Programación dinámica y algoritmos voraces (Cormen Cap. 15-16)**
- **Sesión 1 (T):** Fundamentos de programación dinámica — corte de varillas (*rod cutting*): recursión ingenua, memoización, tabulación; subestructura óptima y subproblemas traslapados
- **Sesión 2 (P):** Estrategia voraz — selección de actividades y elementos de la estrategia voraz
- **Lectura autónoma** (con las lecciones ya publicadas, sin sesión de clase): multiplicación de cadenas de matrices, subsecuencia común más larga (LCS) y códigos de Huffman.

### Semana 16 — lunes 16 de noviembre
**Sin clase (festivo: Independencia de Cartagena).** Última semana del curso.
- **Laboratorio evaluativo 4 — Programación dinámica y algoritmos voraces (15%)** *(antes Laboratorio 5, que valía 20%)*
  - Entrega asincrónica: informe en GitHub (`lab4-pd-voraces/`), plazo hasta el **22 de noviembre**
  - ⚠️ Registrar el 100% evaluado (Laboratorio 4, Proyecto final y Seguimiento) durante la ventana del 23 al 29 de noviembre
- **Proyecto final (20%):** por definir en un paso aparte (ver `info.md`). Su fecha de entrega queda pendiente.

---

## Vista rápida de entregas evaluativas

| Semana | Fecha                  | Evaluación                                                  | %    |
| ------ | ---------------------- | ----------------------------------------------------------- | ---- |
| 6      | 7 – 13 sep             | Laboratorio 1: Fundamentos, complejidad y recurrencias       | 15%  |
| 10     | quiz 5–11 oct          | Momento 2: Dividir y vencer (quiz 7,5% + laboratorio 7,5%)   | 15%  |
| 13     | lunes 26 oct           | Laboratorio 3: Estructuras de datos                          | 15%  |
| 16     | hasta el 22 nov        | Laboratorio 4: Programación dinámica y algoritmos voraces    | 15%  |
| —      | Por definir            | Proyecto final                                               | 20%  |
| —      | Todo el semestre       | Seguimiento                                                  | 20%  |
| **Total** |                     |                                                              | **100%** |

---

*Documento complementario a `info.md`. Desde la Semana 10 el curso se dicta solo los lunes (Sesión 1 y Sesión 2 el mismo día); los lunes festivos no hay clase.*