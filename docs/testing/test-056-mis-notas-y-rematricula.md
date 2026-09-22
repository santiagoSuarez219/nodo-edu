# test-056 — Mis notas del estudiante y rematrícula docente

## Datos de prueba
> Se reutilizan los fixtures de spec-054 documentados en CLAUDE.md
> ("Datos de prueba reutilizables en desarrollo"), ya montados en el
> entorno de desarrollo (`asus`). No requieren creación ni limpieza para
> este spec salvo lo anotado abajo.

| Recurso | Identificador | Notas |
|---------|---------------|-------|
| Curso "Test-054 Curso A" | `65a0bad9-16a8-4c27-bec6-3e097f6055fc` | Docente `dev@nodo.local`. `course_slug: analisis-de-algoritmos`. |
| Curso "Test-054 Curso B" | `98e1d74e-8bc9-426d-9a3c-ce8b8d846c2c` | Docente `docente2.test054@nodo.local`. `course_slug: analisis-de-algoritmos`. |
| Curso "Test-054 Curso Vacío" | `bdf3ca64-adbe-4c6b-915e-91e7e9c575d0` | Docente `dev@nodo.local`. Sin `course_slug`, sin estudiantes activos. |
| Estudiante "Ana Gómez" | `ana.gomez.test054@nodo.local` / `Test054Ana!` | Activa en Curso A y Curso B — sirve para validar consolidación entre cursos y docentes. |
| Estudiante "Bruno Díaz" | `bruno.diaz.test054@nodo.local` / `Test054Bruno!` | Activo solo en Curso A — caso de un solo curso. |
| Estudiante "Carla Ruiz" | `carla.ruiz.test054@nodo.local` / `Test054Carla!` | **Retirada** del Curso A — precondición exacta para los casos de rematrícula y de "Cursos retirados". |

**Datos adicionales a crear para esta ronda** (registrar aquí al crearlos):

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|-----------------------|---------------|-----------|
| Evaluación con `closes_at` en el pasado, publicada, con envío de Ana o Bruno | `assignment-mcp` / panel admin | _pendiente_ | ⬜ |
| Evaluación con `closes_at` futuro, publicada, con envío de Ana o Bruno | `assignment-mcp` / panel admin | _pendiente_ | ⬜ |

**Entorno de pruebas:** desarrollo (`asus`, instancia local vía túnel SSH)
**Fecha de la ronda:** _pendiente_

## Casos de prueba

### TC-056-01 — Mis notas: consolidación entre cursos y docentes
**Precondición:** Ana Gómez activa en Curso A y Curso B.
**Datos de prueba usados:** `ana.gomez.test054@nodo.local` / `Test054Ana!`
**Pasos:**
1. Iniciar sesión como Ana.
2. Entrar a "Mis notas" desde el menú de usuario.
**Resultado esperado:** la página `/cuenta/notas` muestra dos tarjetas en
"Cursos activos" (Curso A y Curso B), cada una con sus ítems de
calificación, nota total y nota de autoevaluaciones, sin mezclar datos
entre cursos.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-02 — Mis notas: un solo curso
**Precondición:** Bruno Díaz activo solo en Curso A.
**Datos de prueba usados:** `bruno.diaz.test054@nodo.local` / `Test054Bruno!`
**Pasos:**
1. Iniciar sesión como Bruno.
2. Entrar a "Mis notas".
**Resultado esperado:** una sola tarjeta en "Cursos activos" (Curso A), sin
sección "Cursos activos" vacía ni errores.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-03 — Mis notas: curso sin ítems de calificación
**Precondición:** Curso Vacío sin estudiantes activos y sin `course_slug`.
**Datos de prueba usados:** matricular temporalmente a Bruno en Curso Vacío
si hace falta forzar el caso, o verificar con un curso real sin ítems
creados aún.
**Pasos:**
1. Ver "Mis notas" de un estudiante matriculado en un curso sin ítems de
   calificación configurados.
**Resultado esperado:** la tarjeta del curso se muestra sin errores, con un
estado vacío claro para la tabla de ítems (no una tabla rota ni un
`undefined`).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-04 — Mis notas: evaluación cerrada visible sin enlace
**Precondición:** evaluación publicada con `closes_at` en el pasado y con
envío de Ana o Bruno (crear si no existe, ver "Datos de prueba").
**Datos de prueba usados:** evaluación cerrada de "Datos adicionales".
**Pasos:**
1. Entrar a "Mis notas" con el estudiante que tiene el envío.
2. Ubicar la fila de esa evaluación en la sección de evaluaciones del
   curso correspondiente.
**Resultado esperado:** la fila muestra el puntaje y el estado del envío,
**sin** enlace a la página de resultados (o con el enlace deshabilitado);
no debe existir forma de llegar a un 404 desde esta pantalla.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-05 — Mis notas: evaluación abierta con enlace a resultados
**Precondición:** evaluación publicada con `closes_at` futuro (o `null`) y
con envío del estudiante.
**Datos de prueba usados:** evaluación abierta de "Datos adicionales".
**Pasos:**
1. Entrar a "Mis notas".
2. Hacer clic en la fila/enlace de esa evaluación.
**Resultado esperado:** navega correctamente a
`/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/resultados` y
muestra el detalle del intento.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-06 — Mis notas: curso retirado en sección aparte
**Precondición:** Carla Ruiz retirada del Curso A (estado actual del
fixture, antes de ejecutar la rematrícula de TC-056-08).
**Datos de prueba usados:** `carla.ruiz.test054@nodo.local` / `Test054Carla!`
**Pasos:**
1. Iniciar sesión como Carla.
2. Entrar a "Mis notas".
**Resultado esperado:** Curso A aparece en una sección "Cursos retirados"
separada, con su nota total y una indicación de que el desglose no está
disponible; la página no falla ni muestra un `notFound()`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-07 — Mis notas: estudiante sin matrículas
**Precondición:** un estudiante recién creado sin matrículas (crear con
`students-mcp` si no hay uno disponible; recordar registrarlo y
eliminarlo).
**Pasos:**
1. Iniciar sesión con ese estudiante.
2. Entrar a "Mis notas".
**Resultado esperado:** estado vacío claro ("aún no tienes cursos" o
similar), sin errores.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-08 — Mis notas: acceso sin autenticar
**Pasos:**
1. Sin sesión iniciada, navegar directamente a `/cuenta/notas`.
**Resultado esperado:** redirige al login; tras autenticarse, vuelve a
`/cuenta/notas` (no a `/cuenta` genérico).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-09 — Rematrícula desde el panel docente
**Precondición:** Carla Ruiz retirada del Curso A.
**Datos de prueba usados:** docente `dev@nodo.local` / `DevLocal2026!`,
estudiante Carla Ruiz.
**Pasos:**
1. Iniciar sesión como `dev@nodo.local`.
2. Entrar al detalle de Curso A en el panel admin, tabla "Retirados".
3. Pulsar "Reactivar" junto a Carla Ruiz.
**Resultado esperado:** Carla pasa a la tabla "Activos" sin recargar
manualmente, con `withdrawn_at` vacío.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-10 — Verificación post-rematrícula: acceso y datos intactos
**Precondición:** TC-056-09 aprobado.
**Datos de prueba usados:** Carla Ruiz.
**Pasos:**
1. Iniciar sesión como Carla.
2. Entrar a `/cuenta/cursos/[enrollmentId]/evaluaciones` del Curso A.
3. Revisar "Mis notas" → Curso A debe volver a "Cursos activos" con
   desglose completo.
**Resultado esperado:** acceso recuperado a evaluaciones y lecciones; la
asistencia, notas y entregas previas de Carla siguen presentes (no se
perdió nada durante el retiro ni la reactivación).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-11 — Rematrícula: no se puede reactivar dos veces sin retiro previo
**Precondición:** Carla ya activa (tras TC-056-09).
**Pasos:**
1. En el panel, verificar que Carla ya no aparece en "Retirados" (no hay
   botón "Reactivar" disponible para ella).
**Resultado esperado:** la UI no permite reactivar una matrícula que ya
está activa (el botón simplemente no está disponible en esa tabla).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-056-01 — `enroll_student` reactiva una matrícula retirada
**Herramienta probada:** `enroll_student` en `students-mcp`
**Precondición:** retirar temporalmente a Bruno Díaz del Curso A vía
`unenroll_student` (registrar para poder revertir si el caso falla).
**Input de prueba:** `enroll_student` con `student_id` de Bruno y
`academic_course_id` del Curso A.
**Output esperado:** `200`, matrícula con `status: "active"`,
`withdrawn_at: null`, y una marca `reactivated: true` en el cuerpo (no un
`400 "Ya está matriculado en este curso."`).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-056-02 — `enroll_student` sigue rechazando una matrícula activa
**Herramienta probada:** `enroll_student` en `students-mcp`
**Precondición:** Ana Gómez activa en Curso A.
**Input de prueba:** `enroll_student` con `student_id` de Ana y
`academic_course_id` del Curso A (ya matriculada y activa).
**Output esperado:** `400 "Ya está matriculado en este curso."`, sin
`reactivated`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-056-12 — Autorematrícula por código sigue bloqueada
**Precondición:** un estudiante retirado de un curso con código de
matrícula activo.
**Pasos:**
1. Iniciar sesión como el estudiante retirado.
2. Intentar reingresar el código de matrícula del curso del que fue
   retirado, desde `/cuenta/cursos`.
**Resultado esperado:** sigue rechazando con
"Ya estás matriculado en este curso." — la reactivación es exclusiva del
docente/agente, no autoservicio del estudiante.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: {{n}}
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
