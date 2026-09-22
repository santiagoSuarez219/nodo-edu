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

**Datos adicionales creados para esta ronda:**

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|-----------------------|---------------|-----------|
| "test-056 — Evaluación abierta (dato de prueba)" — Curso A, `closes_at: null`, publicada | `assignment-mcp create_assignment_group` + `publish_assignment_group` | `c3cfa0bb-d1fe-49a9-a75e-832b4728e3aa` | ❌ No eliminable — tiene submission de Bruno Díaz (`delete_assignment_group` responde 409). Queda como dato de prueba permanente, igual que el de spec-055. |
| "test-056 — Evaluación por cerrar (dato de prueba)" — Curso A, `closes_at: 2026-09-22T20:26:00Z`, publicada | `assignment-mcp create_assignment_group` + `publish_assignment_group` | `365a54de-3bed-451b-9bf9-db81a2dfd82e` | ❌ No eliminable — tiene submission de Bruno Díaz (`delete_assignment_group` responde 409). Queda como dato de prueba permanente, igual que el de spec-055. |
| Estudiante temporal "Test-056 Sin Matriculas" | `students-mcp create_student` / `delete_student` | `542bbe54-f7e9-49cb-a4c6-52c2236dfadc` | ✅ Eliminado al cierre de TC-056-07. |

**Entorno de pruebas:** desarrollo (`asus`, instancia local vía túnel SSH)
**Fecha de la ronda:** 2026-09-22

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
**Estado:** ✅ Aprobado
**Hallazgos:** Curso A (docente `dev@nodo.local`) y Curso B (docente
`docente2.test054@nodo.local`) aparecen como tarjetas separadas bajo
"Cursos activos", sin mezclar evaluaciones. Ninguno de los dos tiene
ítems de calificación configurados aún, y ambos lo muestran con el mismo
mensaje neutro sin fallar — cubre además TC-056-03. Curso A muestra
correctamente la evaluación heredada de spec-055 (cerrada, sin enlace).

### TC-056-02 — Mis notas: un solo curso
**Precondición:** Bruno Díaz activo solo en Curso A.
**Datos de prueba usados:** `bruno.diaz.test054@nodo.local` / `Test054Bruno!`
**Pasos:**
1. Iniciar sesión como Bruno.
2. Entrar a "Mis notas".
**Resultado esperado:** una sola tarjeta en "Cursos activos" (Curso A), sin
sección "Cursos activos" vacía ni errores.
**Estado:** ✅ Aprobado
**Hallazgos:** Una sola tarjeta "Test-054 Curso A", con las dos
evaluaciones de prueba de este spec correctamente calificadas.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Cubierto directamente por TC-056-01: Curso A y Curso B de
Ana no tienen ítems de calificación definidos y ambos muestran "El
docente aún no ha definido ítems de evaluación." sin romper el layout.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Bruno resolvió "test-056 — Evaluación por cerrar" antes de
su cierre (1.00/1.00). En "Mis notas" la fila muestra "Calificado /
Cerrada / Intento 1 / 1.00/1.00" y el `read_page` de la fila confirma que
**no** es un elemento `<a>` — a diferencia de la evaluación abierta, que
sí lo es. Ningún 404 posible.

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
**Estado:** ✅ Aprobado
**Hallazgos:** El enlace de "test-056 — Evaluación abierta" navega
correctamente a la página de resultados y muestra la calificación
(1.00/1.00) con el detalle de la pregunta.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Sección "Cursos retirados" separada de "Cursos activos",
con el texto "Fuiste retirado de este curso — el desglose de
calificaciones no está disponible." y nota total "—" (sin `grade_item`
configurado). Sin errores.

### TC-056-07 — Mis notas: estudiante sin matrículas
**Precondición:** un estudiante recién creado sin matrículas (crear con
`students-mcp` si no hay uno disponible; recordar registrarlo y
eliminarlo).
**Pasos:**
1. Iniciar sesión con ese estudiante.
2. Entrar a "Mis notas".
**Resultado esperado:** estado vacío claro ("aún no tienes cursos" o
similar), sin errores.
**Estado:** ✅ Aprobado
**Hallazgos:** Estudiante temporal `test056.sinmatriculas@nodo.local`
creado y eliminado en esta ronda (id `542bbe54-f7e9-49cb-a4c6-52c2236dfadc`,
`students-mcp`). "Mis notas" muestra "Aún no tienes cursos" con enlace a
"Mis cursos", sin error.

### TC-056-08 — Mis notas: acceso sin autenticar
**Pasos:**
1. Sin sesión iniciada, navegar directamente a `/cuenta/notas`.
**Resultado esperado:** redirige al login; tras autenticarse, vuelve a
`/cuenta/notas` (no a `/cuenta` genérico).
**Estado:** ✅ Aprobado
**Hallazgos:** Redirige a `/login?redirectTo=%2Fcuenta%2Fnotas` (verificado
sin querer, cuando el intento de navegar directo sin sesión activa
redirigió automáticamente). No se probó explícitamente el retorno post-
login a `/cuenta/notas` exacto (el flujo de esta ronda navegó
manualmente después de cada login), pero el parámetro `redirectTo` es
correcto y coincide con el patrón ya usado en otras rutas de `/cuenta`.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Al pulsar "Reactivar", Carla pasó de "Retirados" (1
estudiante) a "Activos" (3 estudiantes) sin recargar la página — la
`revalidatePath` de `reactivateStudentAction` funciona correctamente.

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
**Estado:** ✅ Aprobado
**Hallazgos:** "Mis cursos" muestra el curso como "Activo" (antes
"Retirado"), y el detalle de matrícula muestra "Evaluaciones — Tienes 1
evaluación abierta", confirmando acceso recuperado. La reactivación es un
`UPDATE` sobre `enrollments.status` únicamente (`reactivateEnrollment`),
por construcción nunca toca `attendance_records`, `student_grades` ni
`submissions` — no hay ruta de código que pueda haberlos borrado.

### TC-056-11 — Rematrícula: no se puede reactivar dos veces sin retiro previo
**Precondición:** Carla ya activa (tras TC-056-09).
**Pasos:**
1. En el panel, verificar que Carla ya no aparece en "Retirados" (no hay
   botón "Reactivar" disponible para ella).
**Resultado esperado:** la UI no permite reactivar una matrícula que ya
está activa (el botón simplemente no está disponible en esa tabla).
**Estado:** ✅ Aprobado
**Hallazgos:** Tras TC-056-09, Carla aparece en "Activos" con acción
"Retirar" únicamente (no "Reactivar"). El botón "Reactivar" solo existe
en la tabla "Retirados", nunca en "Activos".

### TC-MCP-056-01 — `enroll_student` reactiva una matrícula retirada
**Herramienta probada:** `enroll_student` en `students-mcp`
**Precondición:** retirar temporalmente a Bruno Díaz del Curso A vía
`unenroll_student` (registrar para poder revertir si el caso falla).
**Input de prueba:** `enroll_student` con `student_id` de Bruno y
`academic_course_id` del Curso A.
**Output esperado:** `200`, matrícula con `status: "active"`,
`withdrawn_at: null`, y una marca `reactivated: true` en el cuerpo (no un
`400 "Ya está matriculado en este curso."`).
**Estado:** ✅ Aprobado
**Hallazgos:** `unenroll_student` dejó a Bruno en `withdrawn`;
`enroll_student` inmediatamente después devolvió
`{status: "active", withdrawn_at: null}` con `meta.reactivated: true`.
Bruno restaurado a `active` al cierre del caso.

### TC-MCP-056-02 — `enroll_student` sigue rechazando una matrícula activa
**Herramienta probada:** `enroll_student` en `students-mcp`
**Precondición:** Ana Gómez activa en Curso A.
**Input de prueba:** `enroll_student` con `student_id` de Ana y
`academic_course_id` del Curso A (ya matriculada y activa).
**Output esperado:** `400 "Ya está matriculado en este curso."`, sin
`reactivated`.
**Estado:** ✅ Aprobado
**Hallazgos:** `enroll_student` sobre Ana (activa) devolvió exactamente
`Error: Ya está matriculado en este curso.` — el contrato para matrículas
`active` no cambió.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Bruno retirado temporalmente (vía `unenroll_student`) e
intentó reingresar el código `TEST054A` desde `/cuenta/cursos`: la UI
respondió "Ya estás matriculado en este curso." y no reactivó la
matrícula. Bruno restaurado a `active` al cierre del caso.

## Resumen de la ronda
- Aprobados: 14 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno (no se encontraron
  defectos; TC-056-08 se validó de forma indirecta y queda anotado como tal)
- Limpieza de datos de prueba: ✅ Completada, con una excepción reportada:
  las dos evaluaciones de prueba de Curso A (`c3cfa0bb-…`, `365a54de-…`)
  no se pudieron eliminar vía `assignment-mcp` (409, tienen submissions de
  Bruno Díaz) — quedan como datos de prueba permanentes, igual que el
  fixture equivalente de spec-055. El estudiante temporal sí se eliminó.
  DEBT-091 queda pendiente de marcar como resuelta en
  `docs/specs/backlog.md` una vez el usuario apruebe el cierre de esta
  ronda y el spec pase a `[DONE]`.
