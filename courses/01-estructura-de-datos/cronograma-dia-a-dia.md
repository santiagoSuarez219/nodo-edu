# Cronograma día a día — Estructuras de Datos (2026-2)

**Programa:** Ingeniería de Sistemas — 4.º semestre
**Días de clase:** Martes, Jueves y Viernes
**Desarrollo curricular:** 3 de agosto – 29 de noviembre de 2026
**16 semanas de clase:** 4 de agosto – 20 de noviembre · **Semana de exámenes:** 24–27 de noviembre

**Ritmo semanal:** Martes = Teoría 1 (T1) · Jueves = Teoría 2 (T2) · Viernes = Laboratorio práctico (P)

### Festivos que afectan el curso

Dentro del periodo de clases, el único festivo que cae en un día de clase es el **viernes 7 de agosto de 2026 (Batalla de Boyacá)**. Los demás festivos del semestre (Asunción 17 ago, Día de la Raza 12 oct, Todos los Santos 2 nov, Independencia de Cartagena 16 nov) caen en **lunes** por la Ley Emiliani, así que no afectan las clases de martes/jueves/viernes.

### Momentos evaluativos (resumen)

| Momento | Tema | Fecha de cierre | Peso |
|---|---|---|---|
| M1 | Programación orientada a objetos | Viernes 4 sep | 15% |
| M2 | Listas (listas enlazadas y ordenamiento) | Viernes 9 oct | 15% |
| M3 | Manejo de archivos | Viernes 16 oct | 10% |
| M4 | Pilas y colas | Viernes 30 oct | 15% |
| M5 | Proyecto final (árboles e integración) | Sustentación 24–27 nov | 25% |
| Seguimiento (incluye recursividad) | Continuo | Todo el semestre | 20% |

> Con este calendario, para el corte del **60 % registrado en el SIA (hasta el 1 de noviembre)** ya están cerrados M1 + M2 + M3 + M4 (55 %) más el seguimiento acumulado, lo que cubre el requisito institucional.

---

## Semana 1 — Git y GitHub *(4–7 ago)* · Sprint 1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 4 ago | Martes | T1 | Fundamentos de control de versiones: repositorio, commit, staging, HEAD, historial; `init`, `add`, `commit`, `status`, `log`, `diff`. |
| 6 ago | Jueves | T2 | GitHub y ramas: `push`/`pull`/`fetch`/`clone`; `branch`/`checkout`/`merge`; flujo con feature branch y resolución de conflictos. |
| 7 ago | Viernes | — | **Festivo (Batalla de Boyacá).** El laboratorio de Git se realiza como **trabajo independiente guiado**: crear el repo, secuencia de commits, ramas y un conflicto, y montar la estructura de paquetes del proyecto (`model/domain`, `model/structures`, `service`, `controller`, `view`) con un `Main.java` de bienvenida. |

## Semana 2 — POO parte 1: clases y encapsulamiento *(11–14 ago)* · Sprint 1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 11 ago | Martes | T1 | Diagnóstico (cuestionario de 8 preguntas) y repaso: clase, objeto, atributo, método, constructor; instanciación y ciclo de vida del objeto. |
| 13 ago | Jueves | T2 | Encapsulamiento: modificadores de acceso; getters/setters; validación dentro de setters. |
| 14 ago | Viernes | P | Lab: clase de dominio encapsulada en `model/domain/`; menú en `view/`; stubs de `service/` y `controller/`. |

## Semana 3 — POO parte 1: métodos y UML básico *(18–21 ago)* · Sprint 1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 18 ago | Martes | T1 | Métodos avanzados y utilidades: sobrecarga, `static`, `String` y wrapper classes. |
| 20 ago | Jueves | T2 | Introducción al UML: diagrama de clases, atributos, métodos, visibilidad; lectura de diagramas. |
| 21 ago | Viernes | P | Lab: del diagrama al código; diseñar e implementar el diagrama de arquitectura de las cuatro capas. |

## Semana 4 — POO parte 2: herencia y polimorfismo *(25–28 ago)* · Sprint 1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 25 ago | Martes | T1 | Herencia: `extends`, reutilización, `@Override`, `super`. |
| 27 ago | Jueves | T2 | Polimorfismo: binding dinámico; clases abstractas (`abstract`); interfaces (`interface`, `implements`). |
| 28 ago | Viernes | P | Lab: jerarquía de clases de tres niveles; polimorfismo vía interfaz o clase abstracta. |

## Semana 5 — POO parte 2: relaciones y UML avanzado *(1–4 sep)* · Sprint 1 · ★ M1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 1 sep | Martes | T1 | Composición, agregación y diagramas de paquetes; multiplicidades y navegación en UML. |
| 3 sep | Jueves | T2 | Diseño con TAD y OO: del diagrama a la implementación; modelar el TAD de una estructura con clases e interfaces. |
| 4 sep | Viernes | **P ★** | **Lab evaluativo (M1): Diseño OO completo** — diagrama UML de las cuatro capas + implementación con encapsulamiento, herencia y polimorfismo. **Cierre del Momento 1 (15 %).** |

> *Hito institucional:* primera evaluación de estudiantes a docentes (31 ago – 5 sep).

## Semana 6 — Introducción a las estructuras: TAD *(8–11 sep)* · Sprint 2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 8 sep | Martes | T1 | Tipos abstractos de datos: interfaz vs. representación interna; panorama de estructuras. |
| 10 sep | Jueves | T2 | Criterios de selección de estructuras según acceso, inserción/eliminación y orden. |
| 11 sep | Viernes | P | Lab: selección argumentada de la estructura adecuada para un conjunto de problemas. |

## Semana 7 — Eficiencia algorítmica: Big O *(15–18 sep)* · Sprint 2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 15 sep | Martes | T1 | Notación Big O y análisis de complejidad; casos mejor, promedio y peor. |
| 17 sep | Jueves | T2 | Comparación de estructuras por eficiencia: O(1), O(log n), O(n), O(n²). |
| 18 sep | Viernes | P | Lab: análisis de complejidad en Java midiendo tiempos con `System.nanoTime()`. |

## Semana 8 — Listas: lista simple enlazada *(22–25 sep)* · Sprint 2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 22 sep | Martes | T1 | Nodos y memoria dinámica; estructura del nodo y de la lista (`head`, tamaño, lista vacía). |
| 24 sep | Jueves | T2 | Operaciones sobre lista simple: inserción, búsqueda y complejidad de cada una. |
| 25 sep | Viernes | P | Lab: implementar `Nodo<T>` y `ListaSimple<T>` genérica en `model/structures/`. |

## Semana 9 — Listas: doble y circular *(29 sep–2 oct)* · Sprint 2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 29 sep | Martes | T1 | Eliminación en lista simple; comparación con arreglos (acceso, inserción, memoria). |
| 1 oct | Jueves | T2 | Lista doblemente enlazada (`prev`/`next`, recorrido inverso) y lista circular. |
| 2 oct | Viernes | P | Lab: `ListaDoble<T>` y `ListaCircular<T>` para un caso de uso concreto. |

## Semana 10 — Listas: ordenamiento *(6–9 oct)* · Sprint 2 · ★ M2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 6 oct | Martes | T1 | Insertion sort y selection sort adaptados a listas enlazadas; complejidad. |
| 8 oct | Jueves | T2 | Síntesis del módulo de listas: tabla de decisión simple/doble/circular. |
| 9 oct | Viernes | **P ★** | **Lab evaluativo (M2): Caso de estudio con listas** — diseño UML, código y una estrategia de ordenamiento. **Cierre del Momento 2 — Listas (15 %).** |

## Semana 11 — Manejo de archivos *(13–16 oct)* · Sprint 2 · ★ M3

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 13 oct | Martes | T1 | Fundamentos de archivos: texto vs. binario; streams; `File`, `FileReader`, `FileWriter`. |
| 15 oct | Jueves | T2 | Lectura/escritura con `BufferedReader`/`BufferedWriter`; `IOException`; `try-with-resources`. |
| 16 oct | Viernes | **P ★** | **Lab evaluativo (M3): Persistencia de una lista** — guardar/cargar en `data/`. **Cierre del Momento 3 — Manejo de archivos (10 %).** |

> *Hito institucional:* evaluaciones institucionales (16–20 oct).

## Semana 12 — Pilas *(20–23 oct)* · Sprint 3

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 20 oct | Martes | T1 | TAD Pila (LIFO): `push`, `pop`, `peek`, `isEmpty`, `size`; aplicaciones reales. |
| 22 oct | Jueves | T2 | Implementación propia con lista enlazada vs. `Stack<E>` del API. |
| 23 oct | Viernes | P | Lab: aplicaciones de pilas — balanceo de símbolos, infija→postfija, evaluación postfija. |

## Semana 13 — Colas *(27–30 oct)* · Sprint 3 · ★ M4

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 27 oct | Martes | T1 | TAD Cola (FIFO): `enqueue`, `dequeue`, `front`; aplicaciones reales. |
| 29 oct | Jueves | T2 | Implementación propia vs. `Queue<E>`/`LinkedList<E>`; introducción a `PriorityQueue<E>`. |
| 30 oct | Viernes | **P ★** | **Lab evaluativo (M4): Caso de estudio con pilas y colas** integradas vía `Service`. **Cierre del Momento 4 — Pilas y colas (15 %).** |

> *Hito institucional:* segunda evaluación de estudiantes a docentes (26 oct – 1 nov); registro del 60 % en el SIA (hasta 1 nov).

## Semana 14 — Recursividad *(3–6 nov)* · Sprint 4

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 3 nov | Martes | T1 | Fundamentos: caso base y recursivo; call stack; prueba de escritorio paso a paso. |
| 5 nov | Jueves | T2 | Recursivos clásicos: factorial, Fibonacci, Torres de Hanói; recursión vs. iteración. |
| 6 nov | Viernes | **P** | **Lab: Caso de estudio recursivo** con prueba de escritorio y validación. Se evalúa como parte del **Seguimiento continuo** (ya no es un momento evaluativo independiente). |

## Semana 15 — Árboles: árbol binario *(10–13 nov)* · Sprint 5

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 10 nov | Martes | T1 | Conceptos y TAD árbol binario: raíz, hoja, subárbol, nivel, altura. |
| 12 nov | Jueves | T2 | Inserción y recorridos recursivos: in-order, pre-order, post-order. |
| 13 nov | Viernes | P | Lab: `NodoArbol<T>` y `ArbolBinario<T>` con los tres recorridos. |

## Semana 16 — Árboles: BST e integración *(17–20 nov)* · Sprint 5

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 17 nov | Martes | T1 | BST: búsqueda e inserción recursivas; análisis de complejidad. |
| 19 nov | Jueves | T2 | Eliminación en BST (hoja, un hijo, dos hijos) y síntesis del curso. |
| 20 nov | Viernes | **P ★** | **Lab: Proyecto final con árboles** — `BST<T>` completo integrado al caso de estudio; preparación de la sustentación. |

> *Hito institucional:* fecha límite de cancelación de asignaturas y matrícula (hasta 22 nov).

## Semana de exámenes — Sustentación del proyecto final *(24–27 nov)* · ★ M5

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 24 nov | Martes | Examen | Sustentaciones del proyecto de aula (primer bloque de equipos). |
| 26 nov | Jueves | Examen | Sustentaciones del proyecto de aula (segundo bloque de equipos). |
| 27 nov | Viernes | Examen | Sustentaciones finales, retroalimentación y cierre del curso. **Cierre del Momento 5 (25 %).** |

> *Hito institucional:* exámenes finales y registro del 100 % evaluado (23–29 nov).

---

## Resumen de sesiones

- **48 sesiones planeadas** (16 semanas × 3) + 3 días de sustentación en la semana de exámenes.
- **1 sesión afectada por festivo:** viernes 7 de agosto (laboratorio de Git → trabajo independiente guiado).
- Cada laboratorio evaluativo (★) es el componente práctico de su momento evaluativo; no hay evaluaciones paralelas.

*Fechas sujetas al calendario académico institucional 2026-2.*
