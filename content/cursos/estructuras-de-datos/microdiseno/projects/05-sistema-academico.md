# Proyecto de Aula — Sistema Académico

## Descripción

Aplicación de consola para gestionar estudiantes, profesores, materias, matrículas y calificaciones de un programa académico. Permite registrar notas, calcular promedios, gestionar solicitudes de matrícula y generar reportes de rendimiento.

## Evaluación de viabilidad

**Viabilidad: Alta.**

Es el proyecto con mayor riqueza de relaciones entre entidades (`Estudiante ↔ Materia ↔ Profesor`), lo que lo hace ideal para practicar composición y agregación desde el Sprint 1. El módulo de calificaciones y promedios ofrece casos muy naturales para recursividad y ordenamiento.

| Estructura | Aplicación natural |
|------------|--------------------|
| Clases y herencia | `Persona` → `Estudiante`, `Profesor` |
| Lista simple | Lista de materias por estudiante, notas de una materia |
| Lista doble | Navegación del historial académico de un estudiante |
| Archivos | Persistencia de matrículas y calificaciones |
| Pila | Historial de cambios en una calificación (correcciones) |
| Cola | Cola de solicitudes de matrícula pendientes |
| Recursividad | Cálculo de promedio ponderado acumulado |
| BST | Búsqueda de estudiantes por código, ranking por promedio |

**Riesgo principal:** es el proyecto más complejo en cuanto a relaciones. Si el caso de estudio no está bien acotado (un solo programa, un solo semestre) los estudiantes pueden perderse en el modelado. Definir claramente desde el Sprint 1 que el sistema gestiona **un único programa y semestre activo**.

---

## Entidades del dominio

- `Persona` — identificación, nombre, correo *(clase abstracta)*
- `Estudiante` — código, semestre actual
- `Profesor` — código, departamento
- `Materia` — código, nombre, créditos, profesor asignado
- `Matricula` — estudiante, lista de materias inscritas, semestre
- `Calificacion` — materia, nota parcial 1, nota parcial 2, nota final, observaciones

---

## Sprints acumulativos

### Sprint 1 — POO y arquitectura base *(Semanas 1–4)*

**Entregable:** modelo de dominio con jerarquía de personas, materias y menú funcional.

- Configurar el repositorio Git con la estructura de paquetes
- Modelar `Persona` (abstracta), `Estudiante` y `Profesor` en `model/domain/`
- Modelar `Materia` y `Calificacion`
- Implementar encapsulamiento con validaciones (nota en rango 0.0–5.0, código único)
- Diseñar el diagrama UML de las tres capas con todas las relaciones entre entidades
- Menú de consola para registrar estudiantes, profesores y materias

---

### Sprint 2 — Listas *(Semanas 5–7)*

**Entregable:** matrículas dinámicas con notas registradas, ordenamiento.

- Gestionar estudiantes y materias con `ListaSimple<T>` en el `Service`
- Cada matrícula contiene `ListaSimple<Calificacion>`
- Listar estudiantes ordenados por promedio (`SelectionSort` en el `Service`)
- Reconstruir las listas al iniciar la aplicación

---

### Sprint 3 — Pilas y Colas *(Semanas 8–9)*

**Entregable:** corrección de notas con trazabilidad y gestión de solicitudes de matrícula.

- Implementar `Pila<Calificacion>` por materia para registrar cada versión de la nota (correcciones) y poder revertir a la versión anterior
- Implementar `Cola<Estudiante>` para gestionar las solicitudes de matrícula en orden de llegada
- El `Service` expone `corregirNota()`, `revertirNota()` y `procesarSiguienteSolicitud()`

---

### Sprint 4 — Persistencia y recursividad *(Semanas 10–13)*

**Entregable:** persistencia del sistema en archivos y cálculo recursivo del promedio y búsqueda en historial.

- Persistir estudiantes en `data/estudiantes.txt` y calificaciones en `data/calificaciones.txt`
- Calcular recursivamente el promedio ponderado acumulado de un estudiante (recorriendo su lista de calificaciones)
- Buscar recursivamente si un estudiante ha cursado una materia específica en su historial

---

### Sprint 5 — Árboles e integración final *(Semanas 14–16)*

**Entregable:** ranking de estudiantes y proyecto completo integrado.

- Implementar `BST<Estudiante>` ordenado por promedio para generar el ranking académico en O(n) con recorrido in-order
- Comparar tiempos de búsqueda: `ListaSimple` vs. `BST`
- Revisión de separación de capas y presentación del diagrama UML final actualizado
