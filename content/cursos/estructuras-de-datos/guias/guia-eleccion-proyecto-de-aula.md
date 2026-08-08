---
title: "Guía — Elección del proyecto de aula"
updatedAt: "2026-08-07"
---

# Guía — Elección del proyecto de aula

## Qué es el proyecto de aula

El proyecto de aula es el sistema de consola en Java que su equipo va a
construir de forma incremental durante todo el semestre. Cada laboratorio
agrega funcionalidad al mismo repositorio, de modo que al final del curso
tendrán una aplicación completa que integra todas las estructuras de datos
vistas.

El proyecto sigue una arquitectura de cuatro capas:

```
View -> Controller -> Service -> Model
```

`View` gestiona los menús y la presentación en consola; `Controller` recibe
el input del usuario y coordina con el `Service`; `Service` contiene la
lógica de negocio, los algoritmos y la persistencia; `Model` contiene las
clases de dominio del caso de estudio (`model/domain/`) y las estructuras de
datos genéricas (`model/structures/`) que van a implementar a lo largo del
curso.

El trabajo está organizado en cinco sprints, cada uno alineado con un módulo
del curso:

| Sprint | Foco | Semanas |
|--------|------|---------|
| Sprint 1 | POO y arquitectura base | 1–4 |
| Sprint 2 | Listas | 5–7 |
| Sprint 3 | Pilas y colas | 8–9 |
| Sprint 4 | Persistencia y recursividad | 10–13 |
| Sprint 5 | Árboles e integración final | 14–16 |

El dominio que elija su equipo se mantiene **durante los cinco sprints**: no
se cambia de caso de estudio a mitad de semestre.

## El caso de referencia: Sistema Bancario

Antes de los casos elegibles, una aclaración importante: el **Sistema
Bancario** es el proyecto que el docente desarrolla en clase, sesión a sesión.
Por eso los ejemplos de las lecciones giran alrededor de `Cliente`, `Cuenta` y
`saldo`.

**No es elegible.** Ningún equipo lo toma como su caso de estudio. Su función
es servirles de referencia: cada vez que vean en clase cómo se modela una
entidad, cómo se valida un atributo o cómo se conecta una capa con otra, van a
poder trasladar ese mismo patrón a su propio dominio.

Úsenlo así: si no saben cómo resolver algo en su proyecto, busquen cómo quedó
resuelto en el Sistema Bancario y adapten la estructura — no el contenido.

## Los 5 casos de estudio elegibles

| # | Proyecto | Descripción breve | Dominio |
|---|----------|--------------------|---------|
| 1 | Papelería | Inventario, ventas y pedidos a proveedores | Comercio |
| 2 | Consultorio Médico | Pacientes, citas e historias clínicas | Salud |
| 3 | Clínica Veterinaria | Mascotas, dueños, consultas y vacunación | Salud |
| 4 | Sistema Académico | Estudiantes, materias, matrículas y calificaciones | Educación |
| 5 | Liga de Fútbol | Equipos, jugadores, fixture y tabla de posiciones | Deportivo |

### Papelería

Inventario, ventas y pedidos a proveedores de una papelería: registro de
productos, control de stock, ventas y reportes básicos.

**Entidades principales:** `Producto` (con subtipos `ProductoOficina`,
`ProductoEscolar`, `ProductoArte`), `Venta`, `ItemVenta`, `Proveedor`,
`Pedido`.

**En el Sprint 1** van a modelar la jerarquía de `Producto` con
encapsulamiento y validaciones (precio positivo, stock no negativo), y un
menú de consola para agregar, listar y buscar productos.

### Consultorio Médico

Pacientes, médicos, citas y consultas de un consultorio médico: agendar
citas, registrar consultas y gestionar la sala de espera.

**Entidades principales:** `Persona` (con subtipos `Paciente` y `Medico`),
`Cita`, `Consulta`.

**En el Sprint 1** van a modelar la jerarquía de `Persona` con
encapsulamiento y validaciones (identificación única, fecha de cita no en
el pasado), y un menú de consola para registrar pacientes y médicos.

### Clínica Veterinaria

Mascotas, dueños, veterinarios, consultas y cartilla de vacunación de una
clínica veterinaria.

**Entidades principales:** `Animal` (con subtipos `Perro` y `Gato`),
`Dueño`, `Veterinario`, `Consulta`, `Vacuna`.

**En el Sprint 1** van a modelar la jerarquía de `Animal`, `Dueño` y
`Veterinario` con encapsulamiento y validaciones (número de ficha único,
fecha de nacimiento coherente), y un menú de consola para registrar dueños
y mascotas.

### Sistema Académico

Estudiantes, profesores, materias, matrículas y calificaciones de un
programa académico: registro de notas, promedios y solicitudes de
matrícula.

**Entidades principales:** `Persona` (con subtipos `Estudiante` y
`Profesor`), `Materia`, `Matricula`, `Calificacion`.

**En el Sprint 1** van a modelar la jerarquía de `Persona`, `Materia` y
`Calificacion` con encapsulamiento y validaciones (nota en rango 0.0–5.0,
código único), y un menú de consola para registrar estudiantes, profesores
y materias. El sistema gestiona un único programa y un único semestre
activo.

### Liga de Fútbol

Equipos, jugadores, fixture de partidos, goles, tabla de posiciones y
estadísticas individuales de una liga de fútbol.

**Entidades principales:** `Persona` (con subtipos `Jugador` — a su vez
`Portero` y `JugadorDeCampo` — y `Arbitro`), `Equipo`, `Partido`, `Gol`.

**En el Sprint 1** van a modelar la jerarquía de `Persona`/`Jugador`,
`Equipo`, `Partido` y `Gol` con encapsulamiento y validaciones (número de
camiseta único por equipo, minuto de gol en rango 1–120), y un menú de
consola para registrar equipos y jugadores.

## Cómo se elige el proyecto

Cada equipo marca **3 preferencias en orden de prioridad** entre los 5 casos
de estudio elegibles.

La asignación se hace por preferencia, con un **tope máximo de equipos por
caso de estudio** para balancear la carga entre los 5 proyectos. Si un caso
de estudio queda con más equipos interesados que su tope, o dos equipos
empatan por la misma posición de preferencia sobre el mismo caso, el
desempate se resuelve **por sorteo** entre los equipos empatados.

El plazo para marcar las preferencias es **durante o antes del cierre de la
sesión T3** (14 de agosto). Una vez asignado, el caso de estudio se mantiene
fijo durante los cinco sprints del semestre.
.
