# Proyecto de Aula — Clínica Veterinaria

## Descripción

Aplicación de consola para gestionar mascotas, dueños, veterinarios, consultas y cartilla de vacunación de una clínica veterinaria. Permite registrar fichas de mascotas, agendar consultas, gestionar la sala de espera y llevar el historial de vacunas.

## Evaluación de viabilidad

**Viabilidad: Alta.**

El dominio veterinario añade un nivel de modelado interesante respecto al consultorio médico: la relación `Dueño → Mascota` (un dueño puede tener varias mascotas) obliga a pensar en listas anidadas desde el Sprint 1. La cartilla de vacunación es un hilo conductor natural para listas y recursividad.

| Estructura | Aplicación natural |
|------------|--------------------|
| Clases y herencia | `Animal` → `Perro`, `Gato`, `Ave`; `Persona` → `Dueño`, `Veterinario` |
| Lista simple | Lista de mascotas por dueño, historial de consultas |
| Lista doble | Cartilla de vacunación (navegación cronológica) |
| Archivos | Persistencia de fichas de mascotas y consultas |
| Pila | Historial reciente de consultas de una mascota |
| Cola | Sala de espera de la clínica |
| Recursividad | Búsqueda de vacuna pendiente, cálculo de próxima fecha de vacunación |
| BST | Búsqueda de mascotas por número de ficha o de dueños por identificación |

**Riesgo principal:** la herencia de animales puede volverse excesivamente amplia. Limitar a dos o tres tipos de animales con atributos diferenciadores concretos (ej. `Perro` tiene raza, `Gato` tiene si es indoor/outdoor).

---

## Entidades del dominio

- `Animal` — número de ficha, nombre, especie, fecha de nacimiento *(clase abstracta)*
- `Perro` — raza
- `Gato` — tipo (indoor / outdoor)
- `Dueño` — identificación, nombre, teléfono, lista de mascotas
- `Veterinario` — nombre, especialidad
- `Consulta` — mascota, veterinario, fecha, motivo, diagnóstico, tratamiento
- `Vacuna` — nombre, fecha de aplicación, próxima fecha

---

## Sprints acumulativos

### Sprint 1 — POO y arquitectura base *(Semanas 1–4)*

**Entregable:** fichas de mascotas con jerarquía de animales y relación con dueños.

- Configurar el repositorio Git con la estructura de paquetes
- Modelar `Animal` (abstracta), `Perro`, `Gato` en `model/domain/`
- Modelar `Dueño` y `Veterinario`
- Implementar encapsulamiento con validaciones (número de ficha único, fecha de nacimiento coherente)
- Diseñar el diagrama UML de las tres capas incluyendo la relación `Dueño → Animal`
- Menú de consola para registrar dueños y mascotas

---

### Sprint 2 — Listas *(Semanas 5–7)*

**Entregable:** gestión dinámica de mascotas por dueño, historial de consultas.

- Cada `Dueño` gestiona sus mascotas con `ListaSimple<Animal>`
- Cartilla de vacunas de cada mascota como `ListaSimple<Vacuna>`
- Listar consultas ordenadas por fecha
- Reconstruir las listas al iniciar la aplicación

---

### Sprint 3 — Pilas y Colas *(Semanas 8–9)*

**Entregable:** sala de espera funcional y acceso rápido al historial reciente de una mascota.

- Implementar `Cola<Animal>` para la sala de espera del día
- Implementar `Pila<Consulta>` por mascota para acceder en O(1) a su última consulta
- El `Service` expone `siguienteAnimal()`, `registrarConsulta()` y `ultimaConsulta(fichaId)`

---

### Sprint 4 — Persistencia y recursividad *(Semanas 10–13)*

**Entregable:** persistencia del sistema en archivos y lógica recursiva sobre la cartilla de vacunación.

- Persistir fichas en `data/mascotas.txt` y consultas en `data/consultas.txt`
- Buscar recursivamente en la cartilla si una vacuna específica está pendiente (próxima fecha < hoy)
- Contar recursivamente las consultas de una mascota en un rango de fechas

---

### Sprint 5 — Árboles e integración final *(Semanas 14–16)*

**Entregable:** búsqueda eficiente por número de ficha y proyecto completo integrado.

- Implementar `BST<Animal>` ordenado por número de ficha para búsqueda rápida
- Comparar tiempos de búsqueda: `ListaSimple` vs. `BST`
- Revisión de separación de capas y presentación del diagrama UML final actualizado
