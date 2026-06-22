# Curso de Estructuras de Datos

**Programa:** Tecnología en Desarrollo de Software  
**Créditos:** 5 | **Modalidad:** Presencial  
**Horas presenciales:** 96 h (48 sesiones de 2 h) | **Horas independientes:** 144 h  
**Prerrequisito:** Lógica de Programación y Laboratorio

## Datos de contacto del docente**

- **Nombre:** Santiago Suarez Cortes
- **Formación académica:** Ingeniero Electrónico, Candidato a Magíster en Automatización y Control Industrial
- **Facultad/Departamento:** Facultad de Ingenierias / Departamento de Sistemas
- **Grupo de investigación:** Maquinas Inteligentes y Reconocimiento de Patrones (MIRP)
- 📩 **Correo electrónico:** [santiagosuarez9056@correo.itm.edu.co](mailto:santiagosuarez9056@correo.itm.edu.co)
- 🏢 **Oficina:** Campus Fraternidad - Bloque K - Oficina 102

## Condiciones del curso
- **Asistencia:** En cada clase se tomará asistencia en cualquier momento de la sesión. En caso de inasistencia, el estudiante deberá presentar la excusa correspondiente ante Bienestar Institucional, especialmente si requiere la realización de supletorios. De acuerdo con el Reglamento Estudiantil, la asignatura se calificará con **0.0 por inasistencia** cuando el estudiante acumule más del **20 % de inasistencias injustificadas**.
- **Habilitación:** La asignatura **no es habilitable**.
- **Uso de dispositivos móviles:** Se debe minimizar el uso de dispositivos móviles durante la clase. En caso de ser estrictamente necesario utilizarlos, el estudiante deberá salir del aula para evitar interrupciones en el desarrollo de la sesión.
- **Puntualidad y duración de la clase:** Las clases tendrán una duración de mimo **1 hora y 45 minutos**, por lo que se recomienda llegar puntualmente al inicio de cada sesión.
- **Clases virtuales:** En ocasiones se hará uso de la plataforma **Microsoft Teams** para el desarrollo de las clases, en caso de que el docente no pueda asistir de manera presencial. Esta situación será informada con anticipación a los estudiantes por correo electronico (maximo 6 horas antes del incio de la clase). Las sesiones virtuales se realizarán en el mismo horario de las clases presenciales y **se tomará asistencia**.
- **Uso de inteligencia artificial:** No se prohíbe el uso de herramientas de **inteligencia artificial** para la realización de las actividades del curso. No obstante, estas deben ser utilizadas únicamente como **herramientas de apoyo** y no como sustituto del aprendizaje. Se recomienda utilizarlas en ultima instancia, después de haber intentado resolver el problema por cuenta propia, para evitar la dependencia y fomentar el desarrollo de habilidades de resolución de problemas. En cualquier caso, el estudiante debe ser capaz de explicar y justificar el código entregado, independientemente de si se utilizó o no una herramienta de inteligencia artificial para su desarrollo. El docente podra solicitar al estudiante que explique el código entregado en cualquier momento, y la falta de comprensión del mismo se verá reflejada negativamente en la nota, incluso si el código es funcional.
- **Plagio y copia:** Cualquier forma de **plagio o copia** en las actividades del curso será sancionada de acuerdo con el Reglamento Estudiantil vigente. Se espera que cada estudiante entregue trabajo original y demuestre su propio conocimiento y habilidades en las evaluaciones.
- Los eventos evaluativos tendran un componete teorico y otro practico. El componente teorico se evaluara a traves de examenes escritos individuales, mientras que el componente practico se evaluara a traves de la implementacion de funcionalidades en el proyecto de aula. La nota final de cada evento evaluativo se calculara como el promedio ponderado de ambos componentes, con un peso del 50% para cada uno.
- El proyecto de aula se desarrollara en equipos de trabajo, y cada equipo sera responsable de implementar las funcionalidades asignadas para cada evento evaluativo. La nota del componente practico se asignara a todos los integrantes del grupo y estará basada en una rúbrica de **evaluación del código**, en la cual se detallan de manera explícita los criterios y aspectos a evaluar. Dicha rúbrica se aplicará estrictamente durante la calificación. Tenga en cuenta que un código funcional no garantiza una calificación alta si no cumple con los criterios establecidos en la rúbrica.

## **🗓️ Fechas importantes**

| Descripción                                  | Fecha                       |
| -------------------------------------------- | --------------------------- |
| Desarrollo curricular                        | XX de XX - XX de XX |
| Primera evaluación de estudiantes a docentes | XX de XX - XX de XX   |
| Registro del 60%                             | XX de XX - XX de XX     |
| Segunda evaluación de estudiantes a docentes | XX de XX - XX de XX   |
| Fecha límite para cancelación de asignaturas | XX de XX                  |
| Registro del 100%                            | XX de XX                 |

## **📝 Evaluación del curso**

| Actividad                                                    | Porcentaje | Fecha                                 |
| ------------------------------------------------------------ | ---------- | ------------------------------------- |
| **Momento evaluativo 1:** Programación orientada a objetos   | 20%        | Semana 5 (XX de XX - XX de XX)  |
| **Momento evaluativo 2** Listas enlazadas + Archivos         | 20%        | Semana 8 (XX de XX - XX de XX)  |
| **Momento evaluativo 3:** Listas simples, pilas y colas      | 20%        | Semana 11 (XX de XX - XX de XX) |
| **Momento evaluativo 4:** Listas dobles y manejo de archivos | 10%        | Semana 15 (XX de XX - XX de XX)   |
| **Momento evaluativo 5:** Proyecto final                     | 20%        | Semana 17 (XX de XX - XX de XX) |
| **Seguimiento**                                              | 20%        | Durante todo el semestre        

### Estructura semanal

| Sesión | Tipo | Duración |
|--------|------|----------|
| Clase 1 | Teoría | 2 h |
| Clase 2 | Teoría | 2 h |
| Clase 3 | Laboratorio práctico | 2 h |

**Convenciones:** `T1 / T2` sesión teórica · `P` laboratorio · `★` actividad evaluativa

---

## Prererequisitos técnicos
- **Java JDK 21 LTS**: instalación y configuración en el entorno de desarrollo.
- **Visual Studio Code**: instalación y configuración de extensiones para Java.
- **Git y GitHub**: instalación, configuración y uso básico de control de versiones.

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
├── data/                  # archivos de texto para persistencia
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

**P — Laboratorio: Repositorio, ramas y conflictos**
- Crear un repositorio local y vincularlo a GitHub
- Realizar una secuencia de commits con mensajes descriptivos
- Crear y fusionar ramas; identificar y resolver un conflicto de merge
- Crear la estructura de paquetes del proyecto de aula (`model/domain`, `model/structures`, `service`, `controller`, `view`) con un `Main.java` que imprima un mensaje de bienvenida

---

## Módulo 2 — Programación orientada a objetos (parte 1)

### Semana 2 — Clases, objetos y encapsulamiento

**T1 — Diagnóstico y revisión de clases**
- Cuestionario diagnóstico de conocimientos previos (8 preguntas)
- Repaso: clase, objeto, atributo, método, constructor
- Instanciación y ciclo de vida de un objeto en Java

**T2 — Encapsulamiento**
- Modificadores de acceso: `private`, `public`, `protected`, default
- Getters y setters: convenciones y casos de uso
- Buenas prácticas de encapsulamiento; validación dentro de setters

**P — Laboratorio: Clase de dominio encapsulada**
- Modelar una clase con atributos privados y constructores sobrecargados
- Implementar getters y setters con validaciones de negocio
- Verificar el comportamiento con casos de prueba
- *Capas involucradas:* la clase modelada va en `model/domain/`; el menú de consola va en `view/`; se crea un stub vacío en `service/` y en `controller/`

### Semana 3 — Modelado y UML básico

**T1 — Métodos avanzados y clases de utilidad**
- Sobrecarga de métodos (method overloading)
- Métodos y atributos estáticos (`static`)
- Clase `String` y Wrapper classes (`Integer`, `Double`, etc.)

**T2 — Introducción al UML**
- ¿Para qué sirve el UML en el desarrollo de software?
- Diagrama de clases: clase, atributos, métodos, visibilidad
- Lectura e interpretación de un diagrama de clases

**P — Laboratorio: Del diagrama al código**
- Leer un diagrama de clases e implementarlo en Java
- Diseñar el diagrama de la arquitectura del proyecto de aula mostrando las cuatro capas y sus relaciones; luego implementarlo
- Revisión entre pares: ¿el código respeta el diagrama?

---

## Módulo 3 — Introducción a las estructuras de datos

*Incluye fundamentos de eficiencia algorítmica como criterio central para la selección de estructuras.*

### Semana 4 — Panorama general y tipos abstractos de datos

**T1 — Tipos abstractos de datos (TAD)**
- ¿Qué es un tipo abstracto de datos?
- Separación entre interfaz y representación interna
- Panorama general de estructuras: arreglos, listas, pilas, colas, árboles, grafos, tablas hash

**T2 — Criterios de selección de estructuras**
- Ventajas y desventajas de cada estructura de datos
- Preguntas clave para elegir una estructura: ¿cómo se accede?, ¿con qué frecuencia se inserta o elimina?, ¿importa el orden?
- Relación entre el tipo de problema, los datos y la estructura adecuada

**P — Laboratorio: Selección argumentada de estructuras**
- Dado un conjunto de enunciados de problemas, identificar la estructura más adecuada para cada uno
- Justificar la selección con criterios explícitos
- Discusión grupal de las decisiones tomadas y revisión de alternativas
- *Capas involucradas:* se consolida el entendimiento de que todas las estructuras del semestre vivirán en `model/structures/`

### Semana 5 — Eficiencia algorítmica aplicada a estructuras

**T1 — Notación Big O y análisis de complejidad**
- Complejidad temporal y espacial
- Notación Big O: definición e interpretación
- Casos mejor, promedio y peor
- Reglas básicas: constantes, término dominante, composición de operaciones

**T2 — Comparación de estructuras por eficiencia**
- Tabla comparativa de operaciones clave (acceso, búsqueda, inserción, eliminación) por estructura: O(1), O(log n), O(n), O(n²)
- ¿Cuándo determina la eficiencia la elección de una estructura?
- Conexión entre Big O y las decisiones de diseño que se tomarán en el curso

**P — Laboratorio: Análisis de complejidad en Java**
- Medir tiempos de ejecución con `System.nanoTime()`
- Comparar operaciones de acceso y búsqueda en arreglo, lista enlazada y mapa
- Tabular los resultados y contrastarlos con la teoría Big O
- *Capas involucradas:* el código de medición va en el `Service`; la presentación de resultados va en la `View`

---

## Módulo 4 — Programación orientada a objetos (parte 2)

### Semana 6 — Herencia y polimorfismo

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
- *Capas involucradas:* la jerarquía va en `model/domain/`; las interfaces compartidas pueden definirse en `model/` directamente

### Semana 7 — Relaciones entre clases y UML avanzado

**T1 — Composición, agregación y diagramas de paquetes**
- Asociación, agregación y composición: diferencias conceptuales
- Representación en UML: multiplicidades, roles, flechas de navegación
- Diagramas de paquetes: organización de clases en Java

**T2 — Diseño con TAD y orientación a objetos**
- Diagrama de clases con relaciones: cómo leerlo e implementarlo en Java
- Modelar el TAD de una estructura de datos con clases e interfaces
- Puente entre el diseño OO y la implementación de estructuras de datos

**P — Laboratorio: Diseño OO completo**
- Diseñar el diagrama UML completo del proyecto de aula, mostrando las cuatro capas, sus clases actuales y las relaciones entre ellas; este diagrama será el plano de referencia para el resto del semestre
- Implementar el diseño en Java respetando el diagrama
- Revisión entre pares: ¿el código refleja fielmente el diseño?

---

## Módulo 5 — Listas

### Semana 8 — Lista simple enlazada

**T1 — Nodos y memoria dinámica en Java**
- Gestión de memoria dinámica y referencias en Java
- Estructura de un nodo: atributo dato y referencia al siguiente nodo
- Estructura de la lista: referencia `head` y tamaño; lista vacía

**T2 — Operaciones sobre la lista simple**
- Inserción al inicio, al final y en posición arbitraria
- Búsqueda por valor y por índice
- Análisis de complejidad de cada operación

**P — Laboratorio: Lista simple enlazada en Java**
- Implementar la clase `Nodo<T>` y la clase `ListaSimple<T>` genérica
- Implementar inserción, búsqueda y recorrido completo
- Validar con casos de prueba que cubran listas vacías, de un elemento y con varios elementos
- *Capas involucradas:* `Nodo<T>` y `ListaSimple<T>` van en `model/structures/`; el `Service` las usa para gestionar entidades del dominio; `Controller` y `View` no referencian las estructuras directamente

### Semana 9 — Lista doble y lista circular

**T1 — Eliminación en lista simple y comparación con arreglos**
- Eliminación al inicio, al final y por valor en lista simple
- Ventajas y desventajas frente a arreglos: acceso, inserción, uso de memoria
- ¿Cuándo elegir una lista enlazada sobre un arreglo?

**T2 — Lista doblemente enlazada y lista circular**
- Nodo doble: referencia `prev` y `next`; operaciones de inserción y eliminación
- Recorrido inverso como ventaja de la lista doble
- Lista circular simple y doble: estructura y casos de uso típicos

**P — Laboratorio: Lista doble y circular**
- Implementar `ListaDoble<T>` con inserción y eliminación en ambos extremos
- Implementar una lista circular para un caso de uso concreto (ej. gestión de turnos)
- Comparar el código de la lista simple y la doble: ¿qué cambió estructuralmente?
- *Capas involucradas:* `ListaDoble<T>` y `ListaCircular<T>` van en `model/structures/`; el `Service` decide cuál usar según el caso de estudio

### Semana 10 — Ordenamiento ★

**T1 — Estrategias de ordenamiento sobre listas enlazadas**
- Insertion sort adaptado a lista enlazada: lógica y complejidad
- Selection sort adaptado a lista enlazada: lógica y complejidad
- ¿Por qué ordenar listas enlazadas es más costoso que ordenar arreglos?

**T2 — Síntesis del módulo de listas**
- Comparación entre lista simple, doble y circular
- Tabla de decisión: cuándo usar cada tipo de lista
- Integración con el modelo TAD y los diagramas UML del módulo anterior

**P ★ — Laboratorio evaluativo: Caso de estudio con listas**
- Implementar una solución completa para un caso de estudio dado
- La solución debe incluir diseño UML, código en Java y al menos una estrategia de ordenamiento
- *Capas involucradas:* los algoritmos de ordenamiento van en el `Service`; la `View` recibe la lista ya ordenada y la muestra; el `Controller` coordina la interacción
- Evaluación con rúbrica socializada previamente con el grupo

---

## Módulo 6 — Manejo de archivos

### Semana 11 — Archivos de texto en Java

**T1 — Fundamentos de archivos**
- Archivos de texto vs. archivos binarios: diferencias y casos de uso
- Modelo de flujos (streams) en Java
- Clases `File`, `FileReader`, `FileWriter`

**T2 — Lectura, escritura y modificación**
- `BufferedReader` y `BufferedWriter`: lectura y escritura eficiente línea a línea
- Manejo de excepciones: `IOException`, bloque `try-with-resources`
- Lectura y escritura de datos estructurados (formato CSV-like)

**P — Laboratorio: Persistencia de una lista enlazada**
- Guardar el contenido de una lista enlazada en un archivo de texto
- Leer el archivo y reconstruir la lista en memoria
- Manejar correctamente errores de lectura, escritura y archivo inexistente
- *Capas involucradas:* los métodos `guardar()` y `cargar()` van en el `Service`; los archivos `.txt` se almacenan en `data/`; ninguna otra capa accede directamente al sistema de archivos

---

## Módulo 7 — Pilas y Colas

### Semana 12 — Pilas

**T1 — TAD Pila**
- Concepto LIFO (Last In, First Out)
- Operaciones: `push`, `pop`, `peek`, `isEmpty`, `size`
- Aplicaciones reales: historial de navegación, pila de llamadas, deshacer/rehacer

**T2 — Implementación de pilas en Java**
- Implementación propia con lista enlazada simple
- Clase `Stack<E>` del API de Java: métodos y consideraciones de uso
- Comparación entre la implementación propia y la del API

**P — Laboratorio: Aplicaciones de pilas**
- Verificar el balanceo de paréntesis, corchetes y llaves en una expresión
- Convertir notación infija a postfija (Shunting Yard simplificado)
- Evaluar una expresión en notación postfija usando una pila
- *Capas involucradas:* `Pila<T>` va en `model/structures/`; los algoritmos de verificación y conversión van en el `Service`

### Semana 13 — Colas ★

**T1 — TAD Cola**
- Concepto FIFO (First In, First Out)
- Operaciones: `enqueue`, `dequeue`, `front`, `isEmpty`, `size`
- Aplicaciones reales: gestión de turnos, impresión, scheduling de procesos

**T2 — Implementación de colas en Java**
- Implementación propia con lista enlazada simple
- Interface `Queue<E>` y clase `LinkedList<E>` del API de Java
- Introducción a la cola de prioridad (`PriorityQueue<E>`)

**P ★ — Laboratorio evaluativo: Caso de estudio con pilas y colas**
- Implementar una solución que combine pila y cola para un caso de estudio dado
- Incluir diseño UML y código en Java
- *Capas involucradas:* `Cola<T>` va en `model/structures/`; la solución debe mostrar `Pila<T>` y `Cola<T>` integradas a través del `Service`; `Controller` y `View` no conocen las estructuras directamente
- Evaluación con rúbrica socializada previamente con el grupo

---

## Módulo 8 — Recursividad ★

### Semana 14 — Algoritmos recursivos

**T1 — Fundamentos de recursividad**
- Concepto de recursividad: caso base y caso recursivo
- Pila de llamadas (call stack): cómo funciona la recursión en memoria
- Prueba de escritorio de un algoritmo recursivo paso a paso

**T2 — Algoritmos recursivos clásicos**
- Factorial y Fibonacci: análisis y comparación con la versión iterativa
- Torres de Hanói: planteamiento, solución recursiva y complejidad
- ¿Cuándo preferir recursión sobre iteración? Ventajas y riesgos

**P ★ — Laboratorio evaluativo: Caso de estudio recursivo**
- Diseñar y documentar un algoritmo recursivo para un problema dado
- Incluir prueba de escritorio para al menos dos casos
- Implementar la solución en Java y validarla con casos de prueba
- *Capas involucradas:* los métodos recursivos van en el `Service` si son lógica de negocio, o dentro de la propia estructura en `model/structures/` si son operaciones de recorrido

---

## Módulo 9 — Árboles ★

### Semana 15 — Árbol binario

**T1 — Conceptos y TAD árbol binario**
- Estructura de árbol: raíz, nodo, hoja, subárbol, nivel, altura
- Árbol binario: definición y propiedades
- TAD Árbol binario: representación con nodos enlazados en Java

**T2 — Inserción y recorridos**
- Inserción de nodos en un árbol binario
- Recorridos recursivos: in-order (izquierda–raíz–derecha), pre-order, post-order
- Aplicaciones de cada tipo de recorrido

**P — Laboratorio: Árbol binario con recorridos**
- Implementar `NodoArbol<T>` y `ArbolBinario<T>` en Java
- Implementar los tres tipos de recorrido de forma recursiva
- Visualizar por consola el resultado de cada recorrido sobre un árbol de prueba
- *Capas involucradas:* `NodoArbol<T>` y `ArbolBinario<T>` van en `model/structures/`; los recorridos se exponen a través del `Service`; la `View` solo imprime los resultados

### Semana 16 — Árbol binario de búsqueda (BST) ★

**T1 — BST: búsqueda e inserción**
- Propiedad de ordenamiento del BST
- Operación `buscar`: implementación recursiva y análisis de complejidad
- Operación `insertar`: mantenimiento de la propiedad BST tras cada inserción

**T2 — Eliminación en BST y síntesis del curso**
- Casos de eliminación: nodo hoja, nodo con un hijo, nodo con dos hijos (sucesor in-order)
- Aplicaciones de los BST: diccionarios, índices, autocompletado
- Síntesis del curso: hilo conductor entre todos los módulos

**P ★ — Laboratorio evaluativo: Caso de estudio final con árboles**
- Implementar un BST completo con inserción, búsqueda, eliminación y recorridos
- Aplicarlo a un caso de estudio que integre al menos dos estructuras vistas en el curso
- *Capas involucradas:* `BST<T>` va en `model/structures/`; el `Service` expone búsqueda, inserción y eliminación; la solución final debe demostrar que las cuatro capas están correctamente separadas
- Evaluación con rúbrica socializada previamente con el grupo

---

## Temas opcionales

*No tienen semana asignada. Se abordan si el avance del curso lo permite, en el orden indicado a continuación.*

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

*Documento elaborado para el programa Tecnología en Desarrollo de Software.*  
*Basado en el microdiseño curricular FDE 058 V5 (30-07-2024).*
