# Proyecto de Aula — Liga de Fútbol

## Descripción

Aplicación de consola para gestionar una liga de fútbol: equipos, jugadores, fixture de partidos, registro de goles, tabla de posiciones y estadísticas individuales. Permite simular el desarrollo de una temporada completa.

## Evaluación de viabilidad

**Viabilidad: Alta.**

Es el proyecto con mayor potencial de motivación para los estudiantes. El dominio es familiar, los casos de uso son concretos y la tabla de posiciones —que debe mantenerse ordenada y actualizada tras cada partido— es un hilo conductor perfecto para listas, ordenamiento y árboles. La cola de partidos pendientes y la pila de goles de un partido son ejemplos muy visuales de FIFO y LIFO.

| Estructura | Aplicación natural |
|------------|--------------------|
| Clases y herencia | `Persona` → `Jugador`, `Arbitro`; `Jugador` → `Portero`, `Jugador de campo` |
| Lista simple | Plantilla de un equipo, fixture de partidos, goles de un partido |
| Lista doble | Navegación del historial de partidos de un equipo |
| Archivos | Persistencia de resultados y estadísticas |
| Pila | Goles de un partido (permite anular el último gol registrado) |
| Cola | Partidos pendientes por jugar en la jornada |
| Recursividad | Cálculo de puntos acumulados, búsqueda de máximo goleador |
| BST | Tabla de posiciones ordenada por puntos; búsqueda de jugadores por nombre |

**Riesgo principal:** los estudiantes pueden querer simular lógica de juego en tiempo real. El alcance debe limitarse al **registro de resultados y estadísticas**, no a la simulación del partido.

---

## Entidades del dominio

- `Persona` — nombre, identificación *(clase abstracta)*
- `Jugador` — número de camiseta, posición, equipo, goles totales *(clase abstracta)*
- `Portero` — partidos sin goles encajados
- `JugadorDeCampo` — asistencias
- `Arbitro` — categoría
- `Equipo` — nombre, ciudad, entrenador, plantilla de jugadores
- `Partido` — equipo local, equipo visitante, fecha, resultado, lista de goles
- `Gol` — jugador que anotó, minuto, tipo (normal / penal / autogol)

---

## Sprints acumulativos

### Sprint 1 — POO y arquitectura base *(Semanas 1–4)*

**Entregable:** modelo de equipos y jugadores con menú funcional.

- Configurar el repositorio Git con la estructura de paquetes
- Modelar `Persona` (abstracta), `Jugador` (abstracta), `Portero`, `JugadorDeCampo` y `Arbitro` en `model/domain/`
- Modelar `Equipo`, `Partido` y `Gol`
- Implementar encapsulamiento con validaciones (número de camiseta único por equipo, minuto de gol en rango 1–120)
- Diseñar el diagrama UML de las tres capas
- Menú de consola para registrar equipos y jugadores

---

### Sprint 2 — Listas *(Semanas 5–7)*

**Entregable:** fixture completo con partidos registrados, tabla de posiciones básica.

- Plantilla de cada equipo como `ListaSimple<Jugador>`
- Fixture de la temporada como `ListaSimple<Partido>`
- Goles de cada partido como `ListaSimple<Gol>`
- Ordenar la tabla de posiciones por puntos (y por diferencia de goles como criterio de desempate) usando `InsertionSort` en el `Service`

---

### Sprint 3 — Pilas y Colas *(Semanas 8–9)*

**Entregable:** registro de goles con opción de anular y gestión del calendario de jornada.

- Implementar `Pila<Gol>` por partido para registrar goles y permitir anular el último gol ingresado (error de digitación)
- Implementar `Cola<Partido>` para gestionar los partidos pendientes de una jornada (se procesan en orden de programación)
- El `Service` expone `registrarGol()`, `anularUltimoGol()` y `jugarSiguientePartido()`

---

### Sprint 4 — Persistencia y recursividad *(Semanas 10–13)*

**Entregable:** persistencia del sistema en archivos y estadísticas calculadas recursivamente.

- Persistir resultados en `data/partidos.txt` y estadísticas en `data/estadisticas.txt`
- Calcular recursivamente los puntos acumulados de un equipo recorriendo su lista de partidos jugados
- Encontrar recursivamente al máximo goleador de un equipo recorriendo su plantilla

---

### Sprint 5 — Árboles e integración final *(Semanas 14–16)*

**Entregable:** tabla de posiciones eficiente con BST y proyecto completo integrado.

- Implementar `BST<Equipo>` ordenado por puntos; el recorrido in-order genera la tabla de posiciones en orden descendente
- Comparar la generación de la tabla con `ListaSimple` + ordenamiento vs. recorrido del `BST`
- Revisión de separación de capas y presentación del diagrama UML final actualizado
