# test-010 — Asistencia por sesión con código

Casos de prueba manuales del spec-010. Solo flujos con UI (los endpoints del MCP
se validan con `TC-MCP-010-*`). Cada caso encodifica un criterio de aceptación y
arranca en estado ⬜ Pendiente.

**Precondiciones globales de datos:**

- Curso de contenido MDX con slug `estructuras-de-datos` (con lecciones) y un
  `academic_course` con `course_slug = "estructuras-de-datos"` creado por `docenteA`.
- Cuentas: `estudianteMatriculado` (matrícula activa), `estudianteSinAcceso`
  (autenticado, sin matrícula), `docenteA` (dueño del `academic_course`), `admin`.
- Las migraciones de `class_sessions`, `attendance_records` y los RPCs están
  aplicadas en el entorno de prueba.

---

## Panel docente — abrir / cerrar sesión

### TC-010-01 — El docente abre una sesión de asistencia
**Precondición:** sesión de `docenteA`; sin sesión abierta en el curso.
**Pasos:**
1. Abrir `/admin/courses/{academicCourseId}`.
2. Ir a la pestaña "Asistencia".
3. Pulsar "Abrir sesión de asistencia".
**Resultado esperado:** se genera y muestra un código de 4–6 dígitos con una cuenta
atrás de expiración; el estado pasa a "sesión abierta"; el conteo de asistentes
arranca en 0.
**Estado:** ⬜ Pendiente

### TC-010-02 — No se pueden abrir dos sesiones simultáneas
**Precondición:** sesión de `docenteA`; con una sesión ya abierta (TC-010-01).
**Pasos:**
1. Con la sesión abierta, intentar abrir otra (recargar / segundo intento).
**Resultado esperado:** el sistema no crea una segunda sesión; muestra un mensaje
"ya hay una sesión de asistencia abierta" y mantiene la existente.
**Estado:** ⬜ Pendiente

### TC-010-03 — El docente cierra la sesión
**Precondición:** sesión de `docenteA`; con una sesión abierta.
**Pasos:**
1. Pulsar "Cerrar sesión".
**Resultado esperado:** la sesión pasa a cerrada (`is_open=false`); desaparece el
código; se habilita abrir una nueva sesión.
**Estado:** ⬜ Pendiente

### TC-010-04 — El conteo de asistentes se actualiza en vivo
**Precondición:** sesión de `docenteA` con sesión abierta; en paralelo,
`estudianteMatriculado` marca asistencia (TC-010-05).
**Pasos:**
1. Mantener abierto el panel de asistencia del docente.
2. Que `estudianteMatriculado` ingrese el código en su lección.
**Resultado esperado:** el conteo del panel docente se incrementa (polling ~5 s) sin
recarga manual.
**Estado:** ⬜ Pendiente

---

## Estudiante — marcar asistencia

### TC-010-05 — El estudiante marca asistencia con el código correcto
**Precondición:** sesión de `estudianteMatriculado`; hay una sesión abierta con
código conocido.
**Pasos:**
1. Abrir cualquier lección del curso (ej. `/estructuras-de-datos/introduccion`).
2. En la sección "Asistencia" del cierre de lección, ingresar el código.
3. Enviar.
**Resultado esperado:** la asistencia queda registrada; la sección muestra la
confirmación con la hora (`marked_at`) sin recarga manual.
**Estado:** ⬜ Pendiente

### TC-010-06 — Código inexistente
**Precondición:** sesión de `estudianteMatriculado`; sesión abierta.
**Pasos:**
1. Ingresar un código que no corresponde a ninguna sesión abierta.
**Resultado esperado:** mensaje "código no encontrado" (o equivalente); no se
registra asistencia.
**Estado:** ⬜ Pendiente

### TC-010-07 — Código expirado
**Precondición:** sesión de `estudianteMatriculado`; sesión cuyo `code_expires_at`
ya pasó (o forzada a expirar).
**Pasos:**
1. Ingresar el código de la sesión expirada.
**Resultado esperado:** mensaje "el código expiró"; no se registra asistencia.
**Estado:** ⬜ Pendiente

### TC-010-08 — Código de sesión cerrada
**Precondición:** sesión de `estudianteMatriculado`; el docente cerró la sesión
(TC-010-03) pero el estudiante intenta con ese código.
**Pasos:**
1. Ingresar el código de la sesión ya cerrada.
**Resultado esperado:** mensaje "la sesión está cerrada"; no se registra asistencia.
**Estado:** ⬜ Pendiente

### TC-010-09 — Marcar dos veces es idempotente
**Precondición:** sesión de `estudianteMatriculado`; ya marcó asistencia (TC-010-05).
**Pasos:**
1. Volver a la sección de asistencia (o reabrir la lección) e intentar marcar de nuevo.
**Resultado esperado:** no se crea una segunda fila; se muestra la confirmación
existente con la hora original; sin error.
**Estado:** ⬜ Pendiente

### TC-010-10 — Sin sesión abierta, la sección es pasiva
**Precondición:** sesión de `estudianteMatriculado`; no hay sesión de asistencia
abierta en el curso.
**Pasos:**
1. Abrir una lección del curso.
**Resultado esperado:** la sección de asistencia informa "sin sesión de asistencia
activa" y no muestra input de código.
**Estado:** ⬜ Pendiente

---

## Visibilidad por rol y seguridad

### TC-010-11 — Estudiante no matriculado no puede marcar
**Precondición:** sesión de `estudianteSinAcceso`; hay una sesión abierta con código
conocido (obtenido fuera de banda).
**Pasos:**
1. Intentar acceder a la lección / ingresar el código.
**Resultado esperado:** el gate de acceso impide ver el cierre de estudiante; si por
API se fuerza el RPC, responde `not_enrolled` y no registra asistencia.
**Estado:** ⬜ Pendiente

### TC-010-12 — Owner/admin no ven la sección de marcado
**Precondición:** sesión de `docenteA` (owner) y luego `admin`.
**Pasos:**
1. Abrir una lección del curso como owner y como admin.
**Resultado esperado:** se muestra la lección, pero **no** la sección de marcado de
asistencia del estudiante (owner/admin gestionan asistencia solo desde el panel).
**Estado:** ⬜ Pendiente

### TC-010-13 — Persistencia tras cerrar y reabrir sesión
**Precondición:** sesión de `estudianteMatriculado`, con asistencia ya marcada.
**Pasos:**
1. Cerrar sesión del navegador.
2. Iniciar sesión de nuevo con la misma cuenta.
3. Abrir la lección (mientras la sesión de asistencia sigue abierta).
**Resultado esperado:** la asistencia sigue mostrándose como registrada; no se
duplica.
**Estado:** ⬜ Pendiente

---

## MCP `attendance-mcp` (solo lectura)

### TC-MCP-010-01 — Listar sesiones de un curso
**Herramienta probada:** `list_sessions` en `attendance-mcp`.
**Precondición:** API key de servicio válida; el curso tiene ≥1 sesión.
**Input de prueba:** `{ "course_id": "<uuid del curso>" }`.
**Output esperado:** lista de sesiones con `session_date`, `is_open`,
`attendee_count`, sin campo `attendance_code`.
**Estado:** ⬜ Pendiente

### TC-MCP-010-02 — Roster de una sesión
**Herramienta probada:** `get_session_attendance` en `attendance-mcp`.
**Precondición:** sesión con al menos un asistente.
**Input de prueba:** `{ "session_id": "<uuid de la sesión>" }`.
**Output esperado:** objeto con `session`, `records[]` (`student_id`,
`student_name`, `marked_at`) y `attendee_count`; sin `attendance_code`.
**Estado:** ⬜ Pendiente

### TC-MCP-010-03 — Resumen de asistencia por curso
**Herramienta probada:** `get_course_attendance_summary` en `attendance-mcp`.
**Precondición:** curso con varias sesiones y estudiantes.
**Input de prueba:** `{ "course_id": "<uuid del curso>" }`.
**Output esperado:** `total_sessions` y por estudiante `sessions_attended` +
`attendance_pct`.
**Estado:** ⬜ Pendiente

### TC-MCP-010-04 — El MCP no expone acciones de mutación ni el código
**Herramienta probada:** superficie de `attendance-mcp`.
**Precondición:** MCP registrado.
**Pasos:**
1. Listar las herramientas disponibles del MCP.
2. Inspeccionar los outputs de las 3 herramientas de lectura.
**Resultado esperado:** no existen `open_session`, `close_session` ni
`mark_attendance`; ningún output incluye `attendance_code`.
**Estado:** ⬜ Pendiente

### TC-MCP-010-05 — Input inválido / recurso inexistente
**Herramienta probada:** `get_session_attendance` en `attendance-mcp`.
**Precondición:** MCP registrado.
**Input de prueba:** `{ "session_id": "00000000-0000-0000-0000-000000000000" }`.
**Output esperado:** error claro (no encontrado / validación) sin filtrar datos de
otras sesiones.
**Estado:** ⬜ Pendiente
