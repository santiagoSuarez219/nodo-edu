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
| M1 | Programación orientada a objetos | Viernes 28 ago | 15% |
| M2 | Listas (listas enlazadas y ordenamiento) | Viernes 18 sep | 15% |
| M3 | Pilas y colas — **examen institucional** | Semana 9 (2 oct) | 20% |
| M4 | Manejo de archivos | Viernes 16 oct | 10% |
| M5 | Proyecto final (árboles e integración) | Sustentación 24–27 nov | 20% |
| Seguimiento (incluye recursividad y el laboratorio de pilas y colas) | Continuo | Todo el semestre | 20% |

> Con este calendario, para el corte del **60 % registrado en el SIA (hasta el 1 de noviembre)** ya están cerrados M1 + M2 + M3 + M4 (60 %) desde el 16 de octubre, más el seguimiento acumulado, lo que cubre el requisito institucional con dos semanas de margen.

> **Momento 3 — excepción.** Pilas y colas se evalúa mediante un **examen institucional del 20 %**, cuyo formato y aplicación define la institución. El laboratorio del 2 de octubre se mantiene, pero se califica dentro del Seguimiento continuo y funciona como preparación para el examen: es el único momento del curso cuyo componente práctico no es su laboratorio ★.

### Criterios de selección de estructuras

No tienen sesión propia: se trabajan dentro de la sesión de cada estructura, respondiendo "¿para qué problema sirve esta?" (RADE1-1 del microdiseño). Ver semanas 5 T1, 6 T1, 6 T2, 7 T2, 8 T1, 9 T1 y 14 T1.

### Tipos abstractos de datos (TAD)

Tampoco tienen sesión propia. Cada estructura se introduce primero como contrato (`interface` en Java) y después como implementación: TAD Pila (semana 8), TAD Cola (semana 9), TAD Árbol binario (semana 14). El diseño con TAD y su representación en UML se cierra en el momento evaluativo 1 (semana 4).

---

## Semana 1 — Git y GitHub *(4–7 ago)* · Sprint 1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 4 ago | Martes | T1 | Fundamentos de control de versiones: repositorio, commit, staging, HEAD, historial; `init`, `add`, `commit`, `status`, `log`, `diff`. |
| 6 ago | Jueves | T2 | GitHub y ramas: `push`/`pull`/`fetch`/`clone`; `branch`/`checkout`/`merge`; flujo con feature branch y resolución de conflictos. |
| 7 ago | Viernes | — | **Festivo (Batalla de Boyacá).** El laboratorio de Git se realiza como **trabajo independiente guiado**: crear el repo, secuencia de commits, ramas y un conflicto, y montar la estructura de paquetes del proyecto (`model/domain`, `model/structures`, `service`, `view`) con un `Main.java` de bienvenida. |

## Semana 2 — POO: clases, objetos y encapsulamiento *(11–14 ago)* · Sprint 1

> *Excepción de estructura semanal: esta semana usa T1/T2/T3/T4/T5 (cinco
> sesiones teóricas) en vez de T1/T2/P. Los tres días de clase habituales
> (martes/jueves/viernes) solo alcanzan para T1–T3; T4 y T5 son sesiones
> formales de la semana con **fecha por definir**, igual que el laboratorio,
> porque requieren un día adicional fuera del ritmo martes/jueves/viernes.
> Se agendan una vez redactadas T1–T5 y la guía de elección de proyecto de
> aula.*

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 11 ago | Martes | T1 | Diagnóstico (cuestionario de 8 preguntas) + repaso de sintaxis de Java: variables/tipos/operadores, condicionales (`if`/`else`, `switch`) y bucles (`for`, `while`, `do-while`). |
| 13 ago | Jueves | T2 | Repaso: clase, objeto, atributo, método, constructor; instanciación y ciclo de vida del objeto. |
| 14 ago | Viernes | T3 | Encapsulamiento: modificadores de acceso (`private`, `public`, `protected`, default); getters/setters; validación dentro de setters; constructores sobrecargados. Cierre de sesión: presentación de la guía de elección de proyecto de aula (5 casos elegibles; el Sistema Bancario queda como caso de referencia del docente). |
| — | Fecha por definir | T4 | Métodos avanzados y clases de utilidad: sobrecarga de métodos (*method overloading*), métodos y atributos estáticos (`static`), clase `String` y wrapper classes (`Integer`, `Double`). |
| — | Fecha por definir | T5 | Introducción al UML: para qué sirve el UML en el desarrollo de software; diagrama de clases (clase, atributos, métodos, visibilidad); lectura e interpretación de un diagrama de clases. |

> **P — Laboratorio (pendiente de fecha):** clase de dominio encapsulada en
> `model/domain/`; menú en `view/`; stubs de `service/`.

## Semana 3 — POO: herencia y polimorfismo *(18–21 ago)* · Sprint 1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 18 ago | Martes | T1 | Herencia: `extends`, reutilización de código, sobreescritura (`@Override`), uso de `super`. |
| 20 ago | Jueves | T2 | Polimorfismo: binding dinámico; clases abstractas (`abstract`); interfaces (`interface`, `implements`) y diferencias con clases abstractas. |
| 21 ago | Viernes | P | Lab: jerarquía de clases de tres niveles; polimorfismo vía interfaz o clase abstracta; prueba con arreglos de referencias. Primera lectura e interpretación de un diagrama de clases. |

## Semana 4 — POO: relaciones, UML y diagramas de paquetes *(25–28 ago)* · Sprint 1 · ★ M1

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 25 ago | Martes | T1 | Asociación, agregación y composición: diferencias conceptuales. UML: diagrama de clases, visibilidad, multiplicidades y flechas de navegación. |
| 27 ago | Jueves | T2 | Diagramas de paquetes y organización de clases en Java. Del diagrama al código: modelar un TAD con clases e interfaces y llevarlo a la implementación. |
| 28 ago | Viernes | **P ★** | **Lab evaluativo (M1): Diseño OO completo** — diagrama UML de las tres capas del proyecto + implementación con encapsulamiento, herencia y polimorfismo. Revisión entre pares. **Cierre del Momento 1 — POO (15 %).** |

> *Hito institucional:* primera evaluación de estudiantes a docentes (31 ago – 5 sep).

## Semana 5 — Eficiencia algorítmica y lista simple enlazada *(1–4 sep)* · Sprint 2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 1 sep | Martes | T1 | **Big O (sesión única):** complejidad temporal y espacial; casos mejor, promedio y peor; O(1), O(log n), O(n), O(n²); tabla comparativa de acceso, búsqueda, inserción y eliminación por estructura. Queda como criterio de decisión para el resto del semestre. |
| 3 sep | Jueves | T2 | Nodos y memoria dinámica en Java: atributo dato y referencia al siguiente; estructura de la lista (`head`, tamaño, lista vacía). |
| 4 sep | Viernes | P | Lab: implementar `Nodo<T>` y `ListaSimple<T>` genérica en `model/structures/`, con inserción y recorrido completo. |

## Semana 6 — Listas: operaciones, doble y circular *(8–11 sep)* · Sprint 2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 8 sep | Martes | T1 | Inserción, búsqueda y eliminación en lista simple (inicio, final, posición arbitraria); complejidad de cada operación. Comparación con arreglos: acceso, inserción, memoria. **¿Cuándo elegir una lista enlazada sobre un arreglo?** |
| 10 sep | Jueves | T2 | Lista doblemente enlazada (`prev`/`next`, recorrido inverso); lista circular simple y doble; casos de uso típicos. **¿Cuándo simple, doble o circular?** |
| 11 sep | Viernes | P | Lab: `ListaDoble<T>` con inserción y eliminación en ambos extremos, y `ListaCircular<T>` para un caso concreto (gestión de turnos). |

## Semana 7 — Listas: ordenamiento y síntesis *(15–18 sep)* · Sprint 2 · ★ M2

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 15 sep | Martes | T1 | Insertion sort y selection sort adaptados a listas enlazadas: lógica y complejidad. ¿Por qué ordenar listas enlazadas cuesta más que ordenar arreglos? |
| 17 sep | Jueves | T2 | Síntesis del módulo: tabla de decisión simple/doble/circular e integración con los diagramas UML del proyecto. |
| 18 sep | Viernes | **P ★** | **Lab evaluativo (M2): Caso de estudio con listas** — diseño UML, código en Java y al menos una estrategia de ordenamiento. Los algoritmos van en el `Service`; la `View` recibe la lista ya ordenada. **Cierre del Momento 2 — Listas (15 %).** |

## Semana 8 — Pilas *(22–25 sep)* · Sprint 3

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 22 sep | Martes | T1 | TAD Pila (LIFO): `push`, `pop`, `peek`, `isEmpty`, `size`. Aplicaciones reales: historial de navegación, pila de llamadas, deshacer/rehacer. **¿Qué problemas piden una pila?** |
| 24 sep | Jueves | T2 | Implementación propia con lista enlazada simple vs. clase `Stack<E>` del API de Java: métodos, consideraciones y comparación. |
| 25 sep | Viernes | P | Lab: aplicaciones de pilas — balanceo de paréntesis, corchetes y llaves; conversión infija→postfija (Shunting Yard simplificado); evaluación de expresiones postfijas. |

## Semana 9 — Colas *(29 sep–2 oct)* · Sprint 3 · ★ M3

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 29 sep | Martes | T1 | TAD Cola (FIFO): `enqueue`, `dequeue`, `front`, `isEmpty`, `size`. Aplicaciones reales: turnos, impresión, scheduling. **¿Qué problemas piden una cola y no una pila?** |
| 1 oct | Jueves | T2 | Implementación propia con lista enlazada vs. interface `Queue<E>` y `LinkedList<E>` del API; introducción a `PriorityQueue<E>`. |
| 2 oct | Viernes | **P** | **Lab: Caso de estudio con pilas y colas** — solución que combine `Pila<T>` y `Cola<T>` integradas a través del `Service`, con diseño UML y código. Se califica dentro del **Seguimiento continuo** y prepara para el examen institucional. |

> **★ Momento evaluativo 3 — Examen institucional de pilas y colas (20 %).** Cubre TAD Pila y TAD Cola, sus operaciones, implementación y criterios de uso (semanas 8–9). Formato y fecha de aplicación definidos por la institución; la semana 9 es la referencia de cierre del contenido.

## Semana 10 — Manejo de archivos: texto *(6–9 oct)* · Sprint 4

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 6 oct | Martes | T1 | Fundamentos: archivos de texto vs. binarios, ventajas y desventajas según el contexto de uso; modelo de flujos (streams); clases `File`, `FileReader`, `FileWriter`. |
| 8 oct | Jueves | T2 | Lectura y escritura eficiente con `BufferedReader`/`BufferedWriter`; manejo de excepciones (`IOException`, `try-with-resources`); datos estructurados en formato CSV-like. |
| 9 oct | Viernes | P | Lab: guardar el contenido de una lista enlazada en un archivo de texto y reconstruirla en memoria; manejo de archivo inexistente. Los métodos `guardar()` y `cargar()` van en el `Service`; los `.txt` en `data/`. |

## Semana 11 — Manejo de archivos: binarios y modificación *(13–16 oct)* · Sprint 4 · ★ M4

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 13 oct | Martes | T1 | Archivos binarios: `DataOutputStream`/`DataInputStream`; serialización de objetos con `ObjectOutputStream`/`ObjectInputStream`; comparación de tamaño y velocidad frente a texto. |
| 15 oct | Jueves | T2 | Modificación de registros: actualizar y eliminar sin reescribir todo el archivo; estrategia de archivo temporal; integridad de los datos ante errores a mitad de escritura. |
| 16 oct | Viernes | **P ★** | **Lab evaluativo (M4): Persistencia completa del proyecto** — guardar y cargar el estado del caso de estudio en texto y en binario, con actualización y eliminación de registros y manejo correcto de errores. **Cierre del Momento 4 — Manejo de archivos (10 %).** |

> *Hito institucional:* evaluaciones institucionales (16–20 oct).

## Semana 12 — Recursividad: fundamentos *(20–23 oct)* · Sprint 4

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 20 oct | Martes | T1 | Concepto de recursividad: caso base y caso recursivo; pila de llamadas (call stack) y cómo vive la recursión en memoria; prueba de escritorio paso a paso. |
| 22 oct | Jueves | T2 | Algoritmos recursivos clásicos: factorial, Fibonacci y Torres de Hanói; comparación con la versión iterativa; ¿cuándo preferir recursión sobre iteración? |
| 23 oct | Viernes | P | Lab: diseñar, documentar e implementar dos algoritmos recursivos con prueba de escritorio para al menos dos casos cada uno. |

## Semana 13 — Recursividad sobre estructuras *(27–30 oct)* · Sprint 4

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 27 oct | Martes | T1 | Recursión aplicada a estructuras: recorrido, búsqueda y conteo recursivos sobre una lista enlazada; versión recursiva vs. iterativa del mismo recorrido. |
| 29 oct | Jueves | T2 | Riesgos y límites: `StackOverflowError`, recursión sin caso base, costo exponencial del Fibonacci ingenuo. Introducción al backtracking. Puente hacia los recorridos de árboles. |
| 30 oct | Viernes | **P** | **Lab: Caso de estudio recursivo** aplicado al proyecto de aula. Los métodos recursivos van en el `Service` si son lógica de negocio, o dentro de la estructura en `model/structures/` si son operaciones de recorrido. Se evalúa como parte del **Seguimiento continuo**. |

> *Hito institucional:* segunda evaluación de estudiantes a docentes (26 oct – 1 nov); registro del 60 % en el SIA (hasta 1 nov).

## Semana 14 — Árboles: árbol binario *(3–6 nov)* · Sprint 5

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 3 nov | Martes | T1 | TAD Árbol binario: raíz, nodo, hoja, subárbol, nivel, altura; definición y propiedades. **¿Qué problemas piden una estructura jerárquica?** |
| 5 nov | Jueves | T2 | Inserción de nodos y recorridos recursivos: in-order, pre-order, post-order; para qué sirve cada recorrido. |
| 6 nov | Viernes | P | Lab: implementar `NodoArbol<T>` y `ArbolBinario<T>` con los tres recorridos; visualizar por consola el resultado sobre un árbol de prueba. |

## Semana 15 — Árboles: árbol binario de búsqueda *(10–13 nov)* · Sprint 5

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 10 nov | Martes | T1 | BST: propiedad de ordenamiento; `buscar` e `insertar` recursivos; análisis de complejidad y efecto de un árbol degenerado. |
| 12 nov | Jueves | T2 | Eliminación en BST: nodo hoja, nodo con un hijo, nodo con dos hijos (sucesor in-order). |
| 13 nov | Viernes | P | Lab: `BST<T>` completo con inserción, búsqueda, eliminación y recorridos, expuesto a través del `Service`. |

## Semana 16 — Integración final y preparación de la sustentación *(17–20 nov)* · Sprint 5

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 17 nov | Martes | T1 | Aplicaciones de los BST: diccionarios, índices, autocompletado. Síntesis del curso: hilo conductor entre todos los módulos. |
| 19 nov | Jueves | T2 | Integración: revisión de la separación de las tres capas en el proyecto; criterios y rúbrica de la sustentación, socializados con el grupo. |
| 20 nov | Viernes | P | Lab: integración final — el proyecto debe articular al menos tres estructuras vistas en el curso sobre el caso de estudio elegido; ensayo de sustentación y retroalimentación entre pares. |

> *Hito institucional:* fecha límite de cancelación de asignaturas y matrícula (hasta 22 nov).

## Semana de exámenes — Sustentación del proyecto final *(24–27 nov)* · ★ M5

| Fecha | Día | Sesión | Contenido |
|---|---|---|---|
| 24 nov | Martes | Examen | Sustentaciones del proyecto de aula (primer bloque de equipos). |
| 26 nov | Jueves | Examen | Sustentaciones del proyecto de aula (segundo bloque de equipos). |
| 27 nov | Viernes | Examen | Sustentaciones finales, retroalimentación y cierre del curso. **Cierre del Momento 5 (20 %).** |

> *Hito institucional:* exámenes finales y registro del 100 % evaluado (23–29 nov).

---

## Resumen de sesiones

- **48 sesiones planeadas** (16 semanas × 3) + 3 días de sustentación en la semana de exámenes.
- **1 sesión afectada por festivo:** viernes 7 de agosto (laboratorio de Git → trabajo independiente guiado).
- Cada laboratorio evaluativo (★) es el componente práctico de su momento evaluativo; no hay evaluaciones paralelas.
- **Pilas y colas quedan cerradas el 2 de octubre**, al final de la semana 9.

*Fechas sujetas al calendario académico institucional 2026-2.*
