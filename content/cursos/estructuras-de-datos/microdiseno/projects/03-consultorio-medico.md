# Proyecto de Aula — Consultorio Médico

## Descripción

Aplicación de consola para gestionar pacientes, médicos, citas y historias clínicas de un consultorio médico. Permite agendar citas, registrar consultas, gestionar la sala de espera y consultar el historial de un paciente.

## Evaluación de viabilidad

**Viabilidad: Alta.**

El dominio médico ofrece casos de uso muy naturales para las estructuras del curso, especialmente para pilas (historial de consultas) y colas (sala de espera). La historia clínica como lista enlazada es un ejemplo pedagógico claro de por qué se necesita una estructura dinámica sobre un arreglo fijo.

| Estructura | Aplicación natural |
|------------|--------------------|
| Clases y herencia | `Persona` → `Paciente`, `Medico` |
| Lista simple | Lista de pacientes, lista de citas agendadas |
| Lista doble | Navegación del historial de consultas de un paciente |
| Archivos | Persistencia de pacientes e historias clínicas |
| Pila | Acceso rápido a la última consulta de un paciente |
| Cola | Sala de espera (orden de atención del día) |
| Recursividad | Búsqueda de una consulta por síntoma en el historial |
| BST | Búsqueda de pacientes por número de identificación |

**Riesgo principal:** los estudiantes pueden querer modelar demasiadas especialidades médicas o un sistema de facturación completo. Limitar el alcance a un solo médico o una especialidad durante los primeros sprints.

---

## Entidades del dominio

- `Persona` — identificación, nombre, teléfono *(clase abstracta)*
- `Paciente` — fecha de nacimiento, tipo de sangre
- `Medico` — especialidad, número de registro médico
- `Cita` — paciente, médico, fecha, hora, motivo
- `Consulta` — cita asociada, diagnóstico, tratamiento, medicamentos

---

## Sprints acumulativos

### Sprint 1 — POO y arquitectura base *(Semanas 1–4)*

**Entregable:** modelo de dominio con jerarquía de personas y menú funcional.

- Configurar el repositorio Git con la estructura de paquetes
- Modelar `Persona` (abstracta), `Paciente` y `Medico` en `model/domain/`
- Modelar `Cita` y `Consulta`
- Implementar encapsulamiento con validaciones (identificación única, fecha de cita no en el pasado)
- Diseñar el diagrama UML de las tres capas
- Menú de consola para registrar pacientes y médicos

---

### Sprint 2 — Listas *(Semanas 5–7)*

**Entregable:** agenda de citas dinámica con historial de consultas.

- Gestionar pacientes y médicos con `ListaSimple<T>` en el `Service`
- Historial de consultas de cada paciente como `ListaSimple<Consulta>`
- Listar citas del día ordenadas por hora (`InsertionSort` en el `Service`)
- Reconstruir las listas al iniciar la aplicación

---

### Sprint 3 — Pilas y Colas *(Semanas 8–9)*

**Entregable:** sala de espera funcional y acceso rápido al historial reciente.

- Implementar `Cola<Paciente>` para la sala de espera del día (el médico atiende al siguiente en cola)
- Implementar `Pila<Consulta>` por paciente para acceder en O(1) a su última consulta
- El `Service` expone `siguientePaciente()`, `registrarConsulta()` y `ultimaConsulta(pacienteId)`

---

### Sprint 4 — Persistencia y recursividad *(Semanas 10–13)*

**Entregable:** persistencia del sistema en archivos y búsqueda recursiva en el historial clínico.

- Persistir pacientes en `data/pacientes.txt` y consultas en `data/consultas.txt`
- Buscar recursivamente en el historial de un paciente la primera consulta que contenga un diagnóstico específico
- Contar recursivamente el número de consultas de un paciente en un rango de fechas

---

### Sprint 5 — Árboles e integración final *(Semanas 14–16)*

**Entregable:** búsqueda eficiente de pacientes y proyecto completo integrado.

- Implementar `BST<Paciente>` ordenado por número de identificación
- Comparar tiempos de búsqueda: `ListaSimple` vs. `BST`
- Revisión de separación de capas y presentación del diagrama UML final actualizado
