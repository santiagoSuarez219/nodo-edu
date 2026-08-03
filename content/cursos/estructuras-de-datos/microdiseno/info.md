# Curso de Estructuras de Datos

**Programa:** Ingeniería de Sistemas — 4.º semestre  
**Créditos:** 5 | **Modalidad:** Presencial  
**Duración:** 16 semanas (6 h presenciales/semana)  
**Horas presenciales:** 96 h (48 sesiones de 2 h) | **Horas independientes:** 144 h  
**Prerrequisito:** Lógica de Programación y Laboratorio


## **📝 Evaluación del curso**

| Actividad                                                                 | Porcentaje | Momento                          |
| ------------------------------------------------------------------------- | ---------- | -------------------------------- |
| **Momento evaluativo 1:** Programación orientada a objetos (encapsulamiento, herencia, polimorfismo y UML) | 15%        | Semana 4 (28 de agosto)          |
| **Momento evaluativo 2:** Listas — listas enlazadas y ordenamiento        | 15%        | Semana 7 (18 de septiembre)      |
| **Momento evaluativo 3:** Pilas y colas — **examen institucional**         | 20%        | Semana 9 (2 de octubre)          |
| **Momento evaluativo 4:** Manejo de archivos                              | 10%        | Semana 11 (16 de octubre)        |
| **Momento evaluativo 5:** Proyecto final — árboles e integración          | 20%        | Semana de exámenes (24–27 nov)   |
| **Seguimiento** (incluye recursividad y actividades continuas)           | 20%        | Durante todo el semestre          |
| **Total**                                                                 | **100%**   |                                  |

> Cada momento evaluativo se cierra **después** de que su contenido se ha enseñado por completo, y su componente práctico es el laboratorio evaluativo (★) del tema correspondiente. No existe un sistema de evaluación paralelo: el laboratorio ★ *es* la parte práctica del momento. La recursividad (Semanas 12–13) no es un momento evaluativo independiente: su laboratorio se evalúa como parte del Seguimiento continuo.

> **Momento 3 — excepción.** Pilas y colas se evalúa mediante un **examen institucional del 20 %**, cuyo formato y aplicación define la institución. El laboratorio del viernes 2 de octubre se mantiene, pero **no** constituye el momento evaluativo: se califica dentro del Seguimiento continuo y funciona como preparación para el examen. Es el único momento del curso cuyo componente práctico no es su laboratorio ★.

### Estructura semanal

| Sesión | Tipo | Duración |
|--------|------|----------|
| Clase 1 | Teoría | 2 h |
| Clase 2 | Teoría | 2 h |
| Clase 3 | Laboratorio práctico | 2 h |

**Convenciones:** `T1 / T2` sesión teórica · `P` laboratorio · `★` actividad evaluativa

---

## Prerrequisitos técnicos
- **Java JDK 21 LTS**: instalación y configuración en el entorno de desarrollo.
- **Visual Studio Code**: instalación y configuración de extensiones para Java.
- **Git y GitHub**: instalación, configuración y uso básico de control de versiones.

---

## Mapa general del curso (16 semanas)

| Sem | Módulo | Foco de la semana | Evaluación |
|-----|--------|-------------------|------------|
| 1  | Git y GitHub | Control de versiones, ramas, estructura del proyecto | |
| 2  | POO | Clases, objetos y encapsulamiento | |
| 3  | POO | Herencia y polimorfismo | |
| 4  | POO | Relaciones entre clases, UML y diagramas de paquetes | ★ M1 |
| 5  | Listas | Big O (sesión única) y lista simple enlazada | |
| 6  | Listas | Operaciones, lista doble y circular | |
| 7  | Listas | Ordenamiento sobre listas enlazadas | ★ M2 |
| 8  | Pilas y colas | Pilas (LIFO) | |
| 9  | Pilas y colas | Colas (FIFO) | ★ M3 |
| 10 | Manejo de archivos | Persistencia en archivos de texto | |
| 11 | Manejo de archivos | Archivos binarios y modificación de registros | ★ M4 |
| 12 | Recursividad | Fundamentos y algoritmos recursivos clásicos | |
| 13 | Recursividad | Recursión sobre estructuras y backtracking | |
| 14 | Árboles | Árbol binario y recorridos | |
| 15 | Árboles | Árbol binario de búsqueda (BST) | |
| 16 | Árboles | Integración final y preparación de la sustentación | |
| Exám. | — | Sustentación del proyecto de aula | ★ M5 |

### Criterios transversales

Dos temas no tienen semana propia y se trabajan distribuidos:

- **Criterios de selección de estructuras (RADE1-1):** cada estructura se presenta respondiendo "¿para qué problema sirve esta?". Semanas 5, 6, 7, 8, 9 y 14.
- **Tipos abstractos de datos (TAD):** cada estructura se introduce primero como contrato (`interface` en Java) y después como implementación — TAD Pila (sem. 8), TAD Cola (sem. 9), TAD Árbol binario (sem. 14). El diseño con TAD y su representación en UML se evalúa en el Momento 1 (sem. 4).

---

## Proyecto de Aula

El proyecto de aula es un sistema de consola en Java que se construye de forma incremental a lo largo del semestre. Cada laboratorio agrega funcionalidades al mismo repositorio, de modo que al final del curso los estudiantes cuentan con una aplicación completa que integra todas las estructuras de datos vistas.

### Arquitectura

El proyecto sigue una arquitectura de cuatro capas inspirada en el patrón **MVC + Service**:

```
View → Controller → Service → Model
```

### Estructura de paquetes

```
proyecto-aula/
├── src/
│   ├── model/
│   │   ├── domain/        # clases de dominio del caso de estudio
│   │   └── structures/    # estructuras de datos genéricas (Nodo, Lista, Pila, Cola, Árbol)
│   ├── service/           # lógica de negocio, algoritmos y persistencia
│   ├── controller/        # recibe el input del usuario y coordina con el service
│   ├── view/              # menús y presentación en consola
│   └── Main.java
├── data/                  # archivos de texto y binarios para persistencia
└── README.md
```

### Regla de distribución de responsabilidades

| Pregunta | Capa |
|----------|------|
| ¿Depende de cómo se muestra al usuario? | `view/` |
| ¿Depende de cómo llega el input? | `controller/` |
| ¿Es lógica de negocio, algoritmo o persistencia? | `service/` |
| ¿Son datos o estructura de datos pura? | `model/` |

### Casos de estudio disponibles

Cada equipo selecciona uno de los siguientes casos de estudio al inicio del semestre. El dominio elegido se mantiene durante los cinco sprints.

| # | Proyecto | Descripción breve |
|---|----------|-------------------|
| 1 | [Sistema Bancario](projects/01-sistema-bancario.md) | Gestión de clientes, cuentas y transacciones de un banco |
| 2 | [Papelería](projects/02-papeleria.md) | Inventario, ventas y pedidos a proveedores de una papelería |
| 3 | [Consultorio Médico](projects/03-consultorio-medico.md) | Pacientes, citas y historias clínicas de un consultorio |
| 4 | [Clínica Veterinaria](projects/04-clinica-veterinaria.md) | Mascotas, dueños, consultas y cartilla de vacunación |
| 5 | [Sistema Académico](projects/05-sistema-academico.md) | Estudiantes, materias, matrículas y calificaciones |
| 6 | [Liga de Fútbol](projects/06-liga-futbol.md) | Equipos, jugadores, fixture y tabla de posiciones |

Cada archivo de proyecto detalla la evaluación de viabilidad, las entidades del dominio y el plan de sprints acumulativos alineado con los módulos del curso.

### Ventanas de sprint

| Sprint | Foco | Semanas |
|--------|------|---------|
| Sprint 1 | POO y arquitectura base | 1–4 |
| Sprint 2 | Listas | 5–7 |
| Sprint 3 | Pilas y colas | 8–9 |
| Sprint 4 | Persistencia y recursividad | 10–13 |
| Sprint 5 | Árboles e integración final | 14–16 |

---

## Módulo 1 — Git y GitHub

### Semana 1

**T1 — Fundamentos de control de versiones**
- ¿Qué es el control de versiones y por qué importa en el desarrollo de software?
- Conceptos clave: repositorio, commit, staging area, HEAD, historial
- Comandos esenciales: `init`, `add`, `commit`, `status`, `log`, `diff`

**T2 — GitHub y flujo de trabajo con ramas**
- Repositorios remotos: `push`, `pull`, `fetch`, `clone`
- Ramas: `branch`, `checkout`, `merge`
- Flujo de trabajo básico: feature branch, resolución de conflictos

**P — Laboratorio: Repositorio, ramas y conflictos** *(trabajo independiente guiado — el viernes 7 de agosto es festivo)*
- Crear un repositorio local y vincularlo a GitHub
- Realizar una secuencia de commits con mensajes descriptivos
- Crear y fusionar ramas; identificar y resolver un conflicto de merge
- Crear la estructura de paquetes del proyecto de aula (`model/domain`, `model/structures`, `service`, `controller`, `view`) con un `Main.java` que imprima un mensaje de bienvenida

---

## Módulo 2 — Programación orientada a objetos

### Semana 2 — Clases, objetos y encapsulamiento

**T1 — Diagnóstico y revisión de clases**
- Cuestionario diagnóstico de conocimientos previos (8 preguntas)
- Repaso: clase, objeto, atributo, método, constructor
- Instanciación y ciclo de vida de un objeto en Java

**T2 — Encapsulamiento**
- Modificadores de acceso: `private`, `public`, `protected`, default
- Getters y setters: convenciones y casos de uso
- Buenas prácticas de encapsulamiento; validación dentro de setters
- Constructores sobrecargados

**P — Laboratorio: Clase de dominio encapsulada**
- Modelar una clase con atributos privados y constructores sobrecargados
- Implementar getters y setters con validaciones de negocio
- Verificar el comportamiento con casos de prueba
- *Capas involucradas:* la clase modelada va en `model/domain/`; el menú de consola va en `view/`; se crea un stub vacío en `service/` y en `controller/`

> **Trabajo independiente guiado:** métodos y atributos estáticos (`static`), sobrecarga de métodos, clase `String` y wrapper classes (`Integer`, `Double`). Se revisan en asesoría y se dan por vistos en el laboratorio de la semana 3.

### Semana 3 — Herencia y polimorfismo

**T1 — Herencia**
- Superclase y subclase: keyword `extends`
- Reutilización de código mediante herencia
- Sobreescritura de métodos (`@Override`); uso de `super`

**T2 — Polimorfismo**
- Polimorfismo en tiempo de ejecución (binding dinámico)
- Clases abstractas: keyword `abstract`
- Interfaces en Java: `interface`, `implements`; diferencias con clases abstractas

**P — Laboratorio: Jerarquía de clases**
- Diseñar una jerarquía de al menos tres niveles para un contexto dado
- Implementar polimorfismo a través de una interfaz o clase abstracta común
- Probar el comportamiento polimórfico mediante arreglos de referencias
- Primera lectura e interpretación de un diagrama de clases
- *Capas involucradas:* la jerarquía va en `model/domain/`; las interfaces compartidas pueden definirse en `model/` directamente

### Semana 4 — Relaciones entre clases, UML y diseño con TAD

**T1 — Composición, agregación y UML**
- Asociación, agregación y composición: diferencias conceptuales
- Diagrama de clases: atributos, métodos, visibilidad
- Representación de relaciones en UML: multiplicidades, roles, flechas de navegación

**T2 — Diagramas de paquetes y diseño con TAD**
- Diagramas de paquetes: organización de clases en Java
- Modelar el TAD de una estructura de datos con clases e interfaces
- Puente entre el diseño OO y la implementación de estructuras de datos

**P ★ — Laboratorio evaluativo (Momento 1): Diseño OO completo**
- Diseñar el diagrama UML completo del proyecto de aula, mostrando las cuatro capas, sus clases actuales y las relaciones entre ellas; este diagrama será el plano de referencia para el resto del semestre
- Implementar el diseño en Java respetando el diagrama, aplicando encapsulamiento, herencia y polimorfismo
- Revisión entre pares: ¿el código refleja fielmente el diseño?
- Evaluación con rúbrica socializada previamente con el grupo (cierre del **Momento evaluativo 1 — POO**)

---

## Módulo 3 — Listas

*Incluye la sesión única de eficiencia algorítmica, que se dicta antes de la primera estructura y queda como criterio de decisión para todo el semestre.*

### Semana 5 — Eficiencia algorítmica y lista simple enlazada

**T1 — Notación Big O (sesión única)**
- Complejidad temporal y espacial
- Notación Big O: definición e interpretación; casos mejor, promedio y peor
- Reglas básicas: constantes, término dominante, composición de operaciones
- Tabla comparativa de operaciones clave (acceso, búsqueda, inserción, eliminación) por estructura: O(1), O(log n), O(n), O(n²)
- El análisis de complejidad se retoma dentro de cada estructura del curso

**T2 — Nodos y memoria dinámica en Java**
- Gestión de memoria dinámica y referencias en Java
- Estructura de un nodo: atributo dato y referencia al siguiente nodo
- Estructura de la lista: referencia `head` y tamaño; lista vacía

**P — Laboratorio: Lista simple enlazada en Java**
- Implementar la clase `Nodo<T>` y la clase `ListaSimple<T>` genérica
- Implementar inserción y recorrido completo
- Validar con casos de prueba que cubran listas vacías, de un elemento y con varios elementos
- *Capas involucradas:* `Nodo<T>` y `ListaSimple<T>` van en `model/structures/`; el `Service` las usa para gestionar entidades del dominio; `Controller` y `View` no referencian las estructuras directamente

### Semana 6 — Operaciones, lista doble y circular

**T1 — Operaciones sobre la lista simple y comparación con arreglos**
- Inserción, búsqueda y eliminación al inicio, al final y en posición arbitraria
- Análisis de complejidad de cada operación
- Ventajas y desventajas frente a arreglos: acceso, inserción, uso de memoria
- **¿Cuándo elegir una lista enlazada sobre un arreglo?**

**T2 — Lista doblemente enlazada y lista circular**
- Nodo doble: referencias `prev` y `next`; operaciones de inserción y eliminación
- Recorrido inverso como ventaja de la lista doble
- Lista circular simple y doble: estructura y casos de uso típicos
- **¿Cuándo simple, cuándo doble, cuándo circular?**

**P — Laboratorio: Lista doble y circular**
- Implementar `ListaDoble<T>` con inserción y eliminación en ambos extremos
- Implementar una lista circular para un caso de uso concreto (ej. gestión de turnos)
- Comparar el código de la lista simple y la doble: ¿qué cambió estructuralmente?
- *Capas involucradas:* `ListaDoble<T>` y `ListaCircular<T>` van en `model/structures/`; el `Service` decide cuál usar según el caso de estudio

### Semana 7 — Ordenamiento ★

**T1 — Estrategias de ordenamiento sobre listas enlazadas**
- Insertion sort adaptado a lista enlazada: lógica y complejidad
- Selection sort adaptado a lista enlazada: lógica y complejidad
- ¿Por qué ordenar listas enlazadas es más costoso que ordenar arreglos?

**T2 — Síntesis del módulo de listas**
- Comparación entre lista simple, doble y circular
- Tabla de decisión: cuándo usar cada tipo de lista
- Integración con los diagramas UML del módulo anterior

**P ★ — Laboratorio evaluativo (Momento 2): Caso de estudio con listas**
- Implementar una solución completa para un caso de estudio dado
- La solución debe incluir diseño UML, código en Java y al menos una estrategia de ordenamiento
- *Capas involucradas:* los algoritmos de ordenamiento van en el `Service`; la `View` recibe la lista ya ordenada y la muestra; el `Controller` coordina la interacción
- Evaluación con rúbrica socializada previamente con el grupo (cierre del **Momento evaluativo 2 — Listas**)

---

## Módulo 4 — Pilas y Colas

### Semana 8 — Pilas

**T1 — TAD Pila**
- Concepto LIFO (Last In, First Out)
- Operaciones: `push`, `pop`, `peek`, `isEmpty`, `size`
- Aplicaciones reales: historial de navegación, pila de llamadas, deshacer/rehacer
- **¿Qué problemas piden una pila?**

**T2 — Implementación de pilas en Java**
- Implementación propia con lista enlazada simple
- Clase `Stack<E>` del API de Java: métodos y consideraciones de uso
- Comparación entre la implementación propia y la del API

**P — Laboratorio: Aplicaciones de pilas**
- Verificar el balanceo de paréntesis, corchetes y llaves en una expresión
- Convertir notación infija a postfija (Shunting Yard simplificado)
- Evaluar una expresión en notación postfija usando una pila
- *Capas involucradas:* `Pila<T>` va en `model/structures/`; los algoritmos de verificación y conversión van en el `Service`

### Semana 9 — Colas ★

**T1 — TAD Cola**
- Concepto FIFO (First In, First Out)
- Operaciones: `enqueue`, `dequeue`, `front`, `isEmpty`, `size`
- Aplicaciones reales: gestión de turnos, impresión, scheduling de procesos
- **¿Qué problemas piden una cola y no una pila?**

**T2 — Implementación de colas en Java**
- Implementación propia con lista enlazada simple
- Interface `Queue<E>` y clase `LinkedList<E>` del API de Java
- Introducción a la cola de prioridad (`PriorityQueue<E>`)

**P — Laboratorio: Caso de estudio con pilas y colas**
- Implementar una solución que combine pila y cola para un caso de estudio dado
- Incluir diseño UML y código en Java
- *Capas involucradas:* `Cola<T>` va en `model/structures/`; la solución debe mostrar `Pila<T>` y `Cola<T>` integradas a través del `Service`; `Controller` y `View` no conocen las estructuras directamente
- Se califica dentro del **Seguimiento continuo** y sirve de preparación para el examen institucional

**★ Momento evaluativo 3 — Examen institucional de pilas y colas (20 %)**
- Formato y aplicación definidos por la institución
- Cubre TAD Pila y TAD Cola, sus operaciones, implementación y criterios de uso (semanas 8–9)

---

## Módulo 5 — Manejo de archivos

### Semana 10 — Archivos de texto

**T1 — Fundamentos de archivos**
- Archivos de texto vs. archivos binarios: diferencias, ventajas y desventajas según el contexto de uso
- Modelo de flujos (streams) en Java
- Clases `File`, `FileReader`, `FileWriter`

**T2 — Lectura y escritura**
- `BufferedReader` y `BufferedWriter`: lectura y escritura eficiente línea a línea
- Manejo de excepciones: `IOException`, bloque `try-with-resources`
- Lectura y escritura de datos estructurados (formato CSV-like)

**P — Laboratorio: Persistencia de una lista enlazada**
- Guardar el contenido de una lista enlazada en un archivo de texto
- Leer el archivo y reconstruir la lista en memoria
- Manejar correctamente errores de lectura, escritura y archivo inexistente
- *Capas involucradas:* los métodos `guardar()` y `cargar()` van en el `Service`; los archivos `.txt` se almacenan en `data/`; ninguna otra capa accede directamente al sistema de archivos

### Semana 11 — Archivos binarios y modificación ★

**T1 — Archivos binarios**
- `DataOutputStream` y `DataInputStream`: escritura y lectura de tipos primitivos
- Serialización de objetos: `ObjectOutputStream`, `ObjectInputStream`, interface `Serializable`
- Comparación con archivos de texto: tamaño, velocidad y legibilidad

**T2 — Modificación de registros**
- Actualizar y eliminar registros sin reescribir el archivo completo
- Estrategia de archivo temporal y reemplazo atómico
- Integridad de los datos ante errores a mitad de escritura

**P ★ — Laboratorio evaluativo (Momento 4): Persistencia completa del proyecto**
- Guardar y cargar el estado del caso de estudio en formato de texto y en binario
- Implementar actualización y eliminación de registros
- Manejar correctamente los errores de lectura, escritura y archivo inexistente
- *Capas involucradas:* toda la persistencia vive en el `Service`; los archivos se almacenan en `data/`
- Cierre del **Momento evaluativo 4 — Manejo de archivos**, con rúbrica socializada previamente

---

## Módulo 6 — Recursividad

### Semana 12 — Fundamentos y algoritmos clásicos

**T1 — Fundamentos de recursividad**
- Concepto de recursividad: caso base y caso recursivo
- Pila de llamadas (call stack): cómo funciona la recursión en memoria
- Prueba de escritorio de un algoritmo recursivo paso a paso

**T2 — Algoritmos recursivos clásicos**
- Factorial y Fibonacci: análisis y comparación con la versión iterativa
- Torres de Hanói: planteamiento, solución recursiva y complejidad
- ¿Cuándo preferir recursión sobre iteración? Ventajas y riesgos

**P — Laboratorio: Algoritmos recursivos clásicos**
- Diseñar, documentar e implementar dos algoritmos recursivos
- Incluir prueba de escritorio para al menos dos casos de cada uno
- Validar la implementación con casos de prueba

### Semana 13 — Recursión sobre estructuras

**T1 — Recursión aplicada a estructuras de datos**
- Recorrido, búsqueda y conteo recursivos sobre una lista enlazada
- Versión recursiva vs. iterativa del mismo recorrido: legibilidad y costo

**T2 — Riesgos, límites y backtracking**
- `StackOverflowError`, recursión sin caso base, costo exponencial del Fibonacci ingenuo
- Introducción al backtracking
- Puente hacia los recorridos recursivos de árboles del módulo siguiente

**P — Laboratorio: Caso de estudio recursivo**
- Diseñar y documentar un algoritmo recursivo para el proyecto de aula
- Implementar la solución en Java y validarla con casos de prueba
- *Capas involucradas:* los métodos recursivos van en el `Service` si son lógica de negocio, o dentro de la propia estructura en `model/structures/` si son operaciones de recorrido
- Evaluación con rúbrica socializada previamente con el grupo, computada como parte del **Seguimiento continuo** (no es un momento evaluativo independiente)

---

## Módulo 7 — Árboles e integración final ★

### Semana 14 — Árbol binario

**T1 — Conceptos y TAD árbol binario**
- Estructura de árbol: raíz, nodo, hoja, subárbol, nivel, altura
- Árbol binario: definición y propiedades
- TAD Árbol binario: representación con nodos enlazados en Java
- **¿Qué problemas piden una estructura jerárquica?**

**T2 — Inserción y recorridos**
- Inserción de nodos en un árbol binario
- Recorridos recursivos: in-order (izquierda–raíz–derecha), pre-order, post-order
- Aplicaciones de cada tipo de recorrido

**P — Laboratorio: Árbol binario con recorridos**
- Implementar `NodoArbol<T>` y `ArbolBinario<T>` en Java
- Implementar los tres tipos de recorrido de forma recursiva
- Visualizar por consola el resultado de cada recorrido sobre un árbol de prueba
- *Capas involucradas:* `NodoArbol<T>` y `ArbolBinario<T>` van en `model/structures/`; los recorridos se exponen a través del `Service`; la `View` solo imprime los resultados

### Semana 15 — Árbol binario de búsqueda (BST)

**T1 — BST: búsqueda e inserción**
- Propiedad de ordenamiento del BST
- Operación `buscar`: implementación recursiva y análisis de complejidad
- Operación `insertar`: mantenimiento de la propiedad BST tras cada inserción
- Efecto de un árbol degenerado sobre la complejidad

**T2 — Eliminación en BST**
- Casos de eliminación: nodo hoja, nodo con un hijo, nodo con dos hijos (sucesor in-order)
- Verificación de que la propiedad BST se mantiene tras cada eliminación

**P — Laboratorio: BST completo**
- Implementar un `BST<T>` con inserción, búsqueda, eliminación y recorridos
- Validar con casos de prueba que cubran los tres casos de eliminación
- *Capas involucradas:* `BST<T>` va en `model/structures/`; el `Service` expone búsqueda, inserción y eliminación

### Semana 16 — Integración final y preparación de la sustentación

**T1 — Aplicaciones de BST y síntesis del curso**
- Aplicaciones de los BST: diccionarios, índices, autocompletado
- Síntesis del curso: hilo conductor entre todos los módulos

**T2 — Integración y criterios de sustentación**
- Revisión de la separación de las cuatro capas en el proyecto de aula
- Criterios y rúbrica de la sustentación, socializados con el grupo

**P — Laboratorio: Integración final**
- El proyecto debe articular al menos tres estructuras vistas en el curso sobre el caso de estudio elegido
- Verificar que las cuatro capas están correctamente separadas
- Ensayo de sustentación y retroalimentación entre pares

### Semana de exámenes ★ — Sustentación del proyecto final

- Sustentación del proyecto de aula completo ante el grupo
- Evaluación con rúbrica socializada previamente (cierre del **Momento evaluativo 5 — Proyecto final**)

---

## Temas opcionales

*No tienen semana asignada. Se abordan como trabajo independiente o si el avance del curso lo permite, en el orden indicado a continuación.*

### Tablas Hash

- Concepto de tabla hash y función de dispersión (hash function)
- Manejo de colisiones: encadenamiento (chaining) y direccionamiento abierto (open addressing)
- Implementación en Java: `HashMap<K,V>` y `Hashtable<K,V>`
- Análisis de complejidad: caso promedio O(1) para búsqueda e inserción
- Aplicaciones: índices, cachés, detección de duplicados, conjuntos

### Grafos

- Conceptos básicos: vértice, arista, grafo dirigido y no dirigido, grafo ponderado
- Representaciones: matriz de adyacencia y lista de adyacencia
- Recorridos: BFS (Breadth-First Search) y DFS (Depth-First Search)
- Introducción a algoritmos sobre grafos: Dijkstra, detección de ciclos
- Aplicaciones: redes de transporte, dependencias entre tareas, redes sociales

---

*Documento elaborado para el programa Ingeniería de Sistemas (4.º semestre).*  
*Basado en el microdiseño curricular FDE 058 V5 (30-07-2024).*
