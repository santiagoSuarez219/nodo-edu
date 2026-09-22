# spec-056 — [NOT STARTED] Mis notas del estudiante y rematrícula docente
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Dos necesidades independientes que comparten el dominio matrícula/notas:

1. **"Mis notas"**: hoy el estudiante ve sus calificaciones dispersas y siempre
   acotadas a **una** matrícula: `app/cuenta/cursos/[enrollmentId]/page.tsx`
   (tarjeta *Calificaciones* de `components/account/EnrollmentDetail.tsx`,
   alimentada por `getGradesByEnrollment`, más `SelfAssessmentSummaryCard`), y
   el detalle de una evaluación concreta en
   `app/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/resultados/page.tsx`.
   `app/cuenta/cursos/page.tsx` muestra apenas la nota total por curso
   (`EnrolledCourseList`). No existe ninguna vista que responda "¿cómo voy en
   todo?" de un vistazo, ni que liste las notas por evaluación de un curso.

2. **Rematrícula**: incidente en producción del **2026-09-22** — un docente
   retiró por accidente a dos estudiantes de Estructuras de datos y solo se
   pudo revertir con un `UPDATE` SQL directo. Documentado como **DEBT-091**
   en `docs/specs/backlog.md`. Causa exacta: `unenrollServiceStudent()`
   (`lib/students/service.ts:448-464`) hace
   `UPDATE ... status='withdrawn', withdrawn_at=now()` sin borrar la fila,
   pero `enrollServiceStudent()` (`lib/students/service.ts:414-445`) busca
   duplicados con `select("id")` filtrando solo por `student_id` +
   `academic_course_id` **sin mirar `status`** (líneas 429-436), así que
   devuelve `400 "Ya está matriculado en este curso."` en vez de reactivar.
   La UI docente tiene el mismo agujero: `components/admin/EnrollmentTable.tsx`
   pinta la tabla "Retirados" en solo lectura (sin acción), y
   `lib/enrollments/actions.ts` solo expone `withdrawStudentAction`.

## Alcance

**Incluye**
- Vista consolidada de notas del estudiante en una ruta nueva bajo `app/cuenta/`.
- Helpers de lectura agregada (notas por ítem, nota de autoevaluaciones y
  notas por evaluación) para **todas** las matrículas del estudiante en una
  sola página.
- Reactivación de una matrícula `withdrawn` → `active` desde dos superficies:
  panel docente (sesión, RLS) y API de servicio `/api/students/*`
  (service_role, consumida por `students-mcp`).
- Actualización de `students-mcp` y su system prompt.

**No incluye**
- Resolver **DEBT-085** (los resultados de una evaluación cerrada siguen
  inaccesibles: `_getStudentAssignmentForActor` descarta el grupo si
  `closes_at <= now`, `lib/assignments/index.ts:186`). "Mis notas" se diseña
  para **no depender** de ese arreglo (ver Decisión D3).
- Resolver **DEBT-089** (el detalle de matrícula no rechaza `withdrawn`).
  "Mis notas" es una ruta nueva y fija su propio criterio explícito (ver D4);
  no se toca `app/cuenta/cursos/[enrollmentId]/page.tsx`.
- **Autorematrícula del estudiante**: `insertEnrollment`
  (`lib/enrollments/index.ts:69-90`), usado por `enrollByCode` y por el
  registro (`enrollNewUserInCourse`), seguirá rechazando con
  "Ya estás matriculado en este curso." a un retirado que reingrese el
  código. Es intencional: el retiro es una decisión del docente y no debe
  poder deshacerse tecleando el código.
- Cambios de esquema o de RLS. Las políticas actuales ya alcanzan (ver
  "Impacto en el sistema").
- Editar/recalcular notas desde "Mis notas": es solo lectura.

## Impacto en el sistema

**Frontend estudiante (`app/cuenta/`)**
- Ruta nueva `app/cuenta/notas/page.tsx`.
- Componentes nuevos en `components/account/`.
- Enlaces de navegación en `components/navbar/UserMenu.tsx` (hoy solo
  `/cuenta`, línea ~115) y `components/navbar/Navbar.tsx` (menú móvil, línea
  ~141), más un acceso desde `app/cuenta/cursos/page.tsx`.

**Panel docente (`app/(admin)/`)**
- `components/admin/EnrollmentTable.tsx`: columna de acción en la tabla
  "Retirados".
- `app/(admin)/admin/courses/[academicCourseId]/page.tsx`: sin cambios (ya
  pasa `enrollments` y `academicCourseId`).

**Capa de datos (`lib/`)**
- `lib/grades/` — helpers agregados nuevos + tipos.
- `lib/submissions/` — helper nuevo de notas por evaluación en lote.
- `lib/enrollments/index.ts` + `actions.ts` — `reactivateEnrollment` /
  `reactivateStudentAction`.
- `lib/students/service.ts` — `enrollServiceStudent` detecta `withdrawn`.

**API**
- `app/api/students/[studentId]/enrollments/route.ts` (`POST`) cambia de
  contrato en el caso "ya existe pero retirada": pasa de `400` a `200` con
  señal de reactivación.

**Base de datos / RLS — no requiere migración.** Verificado:
- `"enrollments: update teacher or admin"`
  (`supabase/migrations/20260625000004_rls_academic.sql:68`) ya permite al
  docente dueño (y a admin) hacer el `UPDATE` de vuelta a `active` con el
  **cliente de sesión** — no hace falta `service_role` para la acción del
  panel.
- `"student_grades: select"` (misma migración) **no** filtra por `status`:
  un retirado sigue viendo sus puntajes.
- `"grade_items: select"` **sí** exige `e.status = 'active'`: un retirado
  **no** ve los nombres de los ítems.
- `"student_sees_published_groups"`
  (`supabase/migrations/20260718000003_rls_assignment_variants.sql:27`)
  exige `is_published` + matrícula `active`, **sin mirar la ventana** — por
  eso las notas de evaluaciones **cerradas** sí son legibles (es la
  aplicación, no la RLS, la que las esconde; DEBT-085).
- `"student_sees_own_submissions"`
  (`supabase/migrations/20260724000001_rls_submissions.sql:16`) permite al
  estudiante leer sus `submissions` por `enrollment_id`, sin restricción de
  ventana ni de estado de matrícula.

## Decisiones de diseño

**D1 — Ruta propia, no pestaña dentro de la matrícula.** `/cuenta/notas`
como ruta hermana de `/cuenta/cursos`. El valor de la vista es la
*consolidación entre cursos*; una pestaña dentro de `[enrollmentId]`
repetiría lo que `EnrollmentDetail` ya hace. El detalle por matrícula se
conserva sin cambios y "Mis notas" enlaza a él.

**D2 — Consultas en lote, no `getGradesByEnrollment` en bucle.**
`getGradesByEnrollment` (`lib/grades/index.ts:97`) hace 3 consultas por
matrícula (enrollment + grade_items + student_grades). Con N cursos serían
3N idas y vueltas. Se crea un helper agregado que resuelve **todos** los
cursos en 2 consultas (`grade_items` por `academic_course_id in (...)`;
`student_grades` por `enrollment_id in (...)`), reutilizando la lógica de
promedio ya existente (`computeTotalGrade`, duplicada hoy en
`lib/grades/index.ts:11` y `lib/enrollments/index.ts:12` — unificarla en el
helper nuevo sin tocar las copias, para no ampliar scope).

**D3 — Notas de evaluaciones cerradas: sí se muestran; el enlace al
detalle, no.** Como la RLS no bloquea el grupo cerrado, la fila de la
evaluación con su puntaje se puede mostrar íntegra. Lo que **no** se
enlaza es `/cuenta/cursos/[id]/evaluaciones/[groupId]/resultados`, porque
esa página hace `notFound()` con el grupo cerrado (DEBT-085). Regla: la
fila enlaza solo si `closes_at` es `null` o `> now`; si no, se muestra el
puntaje sin enlace y con una nota breve. Así "Mis notas" **mejora** la
situación de DEBT-085 (la nota deja de ser invisible) sin resolverla ni
depender de ella. Al cerrar este spec, anotar en DEBT-085 que, cuando se
resuelva, basta con quitar la condición del enlace.

**D4 — Matrículas retiradas: sección aparte, solo total.** Con
`status='withdrawn'` la RLS deja ver `student_grades` pero **no**
`grade_items` ni `assignment_variant_groups`: renderizar el desglose daría
una tarjeta vacía engañosa. Los cursos retirados van a una sección "Cursos
retirados", con la nota total que ya calcula `getEnrollmentsByStudent()`
(`lib/enrollments/index.ts:137`, embed `student_grades(score)`) y una
leyenda de que el desglose no está disponible. La página **no** hace
`notFound()` por estar retirado — es una vista propia con criterio propio,
deliberadamente distinta del detalle de matrícula, y por eso no toca
DEBT-089.

**D5 — Degradación, patrón spec-055.** La consulta de notas por evaluación
devuelve `{ status: "ok" | "unavailable" }` (mismo contrato que
`OpenAssignmentGroupsResult` en `lib/assignments/types.ts:111` y que
`DisabledLessonsResult`), nunca lanza. Si falla, la sección de evaluaciones
de ese curso se reemplaza por `ErrorState` con `INFRA_ERROR_COPY`
(`components/ErrorState.tsx`) y el resto de la página sigue renderizando.

**D6 — Rematrícula en el panel: cliente de sesión, no `service_role`.** La
política `"enrollments: update teacher or admin"` ya autoriza el cambio, y
es el mismo camino que usa hoy `withdrawStudent`
(`lib/enrollments/index.ts:234`). Simétrico con "Retirar" y sin bypass de
RLS.

**D7 — En la API de servicio: extender `enrollServiceStudent`, no crear un
verbo nuevo.** El incidente real fue exactamente "reintentar la matrícula y
que falle". Se hace que `enrollServiceStudent` reconozca la fila
`withdrawn` y la reactive (`status='active'`, `withdrawn_at=null`),
reservando el `400 "Ya está matriculado en este curso."` **solo** para
`status='active'`. La respuesta distingue los dos caminos (`201` insert
nuevo / `200` reactivación, con una marca `reactivated: true` en el cuerpo)
para que el agente pueda decirle al docente qué pasó realmente. Alternativa
descartada: `PATCH /api/students/[studentId]/enrollments` como endpoint
aparte — añade superficie y un tool más para el mismo efecto.

**D8 — MCP: se actualiza `enroll_student`, no se agrega
`reactivate_enrollment`.** Un tool nuevo duplicaría el camino para la misma
operación y obligaría al agente a elegir bien de antemano (justo lo que
falló en el incidente). Se cambia la descripción del tool y se documenta el
flujo de recuperación en el system prompt.

## Evaluación MCP

**¿Aplica MCP?** Sí, parcialmente.

- **MCP existente a modificar:** `students-mcp`
  (`mcp-servers/students-mcp/src/tools.ts`). No se agregan tools; cambia el
  **comportamiento y la descripción** de `enroll_student` (catálogo y
  `case "enroll_student"` de `processToolCall`, que ya hace
  `POST /${id}/enrollments` y no necesita cambios de transporte).
  `mcp-servers/students-mcp/src/api.ts` no cambia.
- **MCP nuevo a crear:** ninguno.
- **System prompt afectado:** `docs/mcps/students-agent.system-prompt.md`
  (secciones "MCP(s) disponibles", "Capacidades" y el bloque de flujos).
- **Índice:** `docs/mcps/README.md`.
- **Fase de MCP en este spec:** Fase 5.

Criterio de la tabla de CLAUDE.md: la funcionalidad **permite una acción
que el agente docente debe poder ejecutar** (revertir un retiro accidental)
y **ya existe un MCP del dominio** (`students-mcp`) → se extiende, no se
crea uno nuevo.

La parte de "Mis notas" **no** aplica MCP: es una vista de lectura para el
estudiante sobre datos que el agente docente ya consulta por otras vías
(`get_student_self_assessment_summary` en `students-mcp`,
`get_variant_allocations` en `assignment-mcp`, la libreta en el panel). No
expone una acción ni un dato nuevo que un agente necesite.

## Fases de implementación

### Fase 1 — Helpers y consultas de "Mis notas"
- [ ] Crear `lib/grades/overview.ts` con `getStudentGradesOverview()`:
      parte de `getEnrollmentsByStudent()` (`lib/enrollments/index.ts`),
      separa activas de retiradas y resuelve en lote los ítems y puntajes de
      las activas (2 consultas: `grade_items` por
      `academic_course_id in (...)` ordenado por `order_index`;
      `student_grades` por `enrollment_id in (...)`).
- [ ] Añadir a `lib/grades/types.ts` los tipos `CourseGradesSummary`
      (matrícula + curso + `items: GradeItemWithScore[]` + `total_grade` +
      `self_assessment` + `assignments`) y `StudentGradesOverview`
      (`{ active: CourseGradesSummary[]; withdrawn: WithdrawnCourseSummary[] }`),
      reutilizando `GradeItemWithScore` ya existente.
- [ ] Crear en `lib/submissions/index.ts` el helper
      `getAssignmentScoresByEnrollments(enrollmentIds)`: consulta
      `submissions` con embed a
      `assignment_variant_groups (id, academic_course_id, title, closes_at, grade_item_id, max_attempts)`
      filtrando `enrollment_id in (...)`, y se queda con el intento de
      mayor `attempt_number` por `(enrollment_id, variant_group_id)`.
      Devuelve `{ status: "ok" | "unavailable" }` (D5). Tipo
      `AssignmentScoreRow` en `lib/submissions/types.ts` con
      `final_score ?? auto_score`, `status` (`SubmissionStatus`, ya
      existente), `attempt_number`, `submitted_at` e `is_closed` (derivado
      de `closes_at`).
- [ ] Reutilizar tal cual `getSelfAssessmentCourseSummary(courseSlug)`
      (`lib/self-assessment/index.ts:749`) — una llamada por curso con
      `course_slug`, en `Promise.all`, ya degrada a `null` por sí sola.
- [ ] No tocar `getGradesByEnrollment` ni `EnrollmentDetail`: el detalle
      por matrícula sigue igual.

### Fase 2 — UI de "Mis notas"
- [ ] `app/cuenta/notas/page.tsx` (Server Component, `requireUser("/cuenta/notas")`,
      `metadata.title = "Mis notas — Mi cuenta"`), con la estructura
      `<main className="flex-1 pt-6 pb-14 flex flex-col gap-6">` de las
      demás páginas de `/cuenta/cursos`.
- [ ] `components/account/GradesOverview.tsx` — orquesta las secciones
      "Cursos activos" y "Cursos retirados"; estado vacío cuando no hay
      matrículas.
- [ ] `components/account/CourseGradesCard.tsx` — por curso: nombre +
      código + docente, tabla de ítems con puntaje, nota total (mismo
      formato y semáforo ≥3 que `EnrollmentDetail`), nota de
      autoevaluaciones y enlace "Ver curso" a `/cuenta/cursos/[enrollmentId]`.
- [ ] `components/account/AssignmentScoreList.tsx` — filas por evaluación:
      título, estado (extraer el mapa `STATUS_LABELS` de
      `app/cuenta/cursos/[enrollmentId]/evaluaciones/page.tsx` a un módulo
      compartido para no duplicar etiquetas), puntaje sobre total, e
      intento; enlace a `resultados` **solo si la evaluación sigue abierta**
      (D3).
- [ ] Navegación: entrada "Mis notas" en `components/navbar/UserMenu.tsx` y
      en el menú móvil de `components/navbar/Navbar.tsx`; enlace desde el
      encabezado de `app/cuenta/cursos/page.tsx`.
- [ ] Verificar tokens semánticos y la tabla claro/oscuro de `DESIGN.md`;
      Flowbite primero.

### Fase 3 — Acción y endpoint de rematrícula
- [ ] `lib/enrollments/index.ts`: `reactivateEnrollment(enrollmentId)` —
      `UPDATE enrollments SET status='active', withdrawn_at=null` con el
      cliente de sesión, simétrico a `withdrawStudent` (línea 234). A
      diferencia de aquella, **sí** comprobar el error del `update` y
      devolver un resultado (`{ok:true} | {ok:false; error}`) en vez de
      ignorarlo en silencio.
- [ ] `lib/enrollments/actions.ts`:
      `reactivateStudentAction(enrollmentId, academicCourseId)` con
      `"use server"`, `requireUser()`, `revalidatePath("/admin/courses/[id]")`
      y `revalidatePath("/admin/courses")` — mismo patrón que
      `withdrawStudentAction`.
- [ ] `lib/students/service.ts`: en `enrollServiceStudent` cambiar el
      `select("id")` por `select("id, status")` y bifurcar:
      `status === 'active'` → error actual; `status === 'withdrawn'` →
      `UPDATE` a `active` con `withdrawn_at = null`, devolviendo
      `{ ok: true, enrollment, reactivated: true }` con las mismas
      columnas que ya selecciona (`id, academic_course_id, status,
      enrolled_at, withdrawn_at`).
- [ ] `app/api/students/[studentId]/enrollments/route.ts` (`POST`):
      responder `200` con `{ data, meta: { reactivated: true } }` cuando
      hubo reactivación y conservar `201` para la inserción. No tocar `GET`
      ni `DELETE`; `EnrollStudentSchema` (`lib/students/schemas.ts`) no
      cambia.
- [ ] Añadir un comentario `// spec-056` en `enrollServiceStudent`
      explicando *por qué* el duplicado retirado se reactiva (incidente del
      2026-09-22).

### Fase 4 — UI docente de rematrícula
- [ ] `components/admin/EnrollmentTable.tsx`: agregar columna "Acción" a la
      tabla "Retirados" con un botón "Reactivar" dentro de un
      `<form action={reactivateAction}>`, igual que el "Retirar" de la
      tabla de activos, en tono neutro/positivo.
- [ ] Revisar si el `opacity-60` de la fila retirada estorba la
      legibilidad del botón nuevo; ajustar si hace falta.
- [ ] `app/(admin)/admin/courses/[academicCourseId]/page.tsx` no requiere
      cambios.

### Fase 5 — MCP: actualizar `students-mcp`
- [ ] `mcp-servers/students-mcp/src/tools.ts`: reescribir la `description`
      de `enroll_student` — matricula a un estudiante; si ya existía una
      matrícula `withdrawn`, la reactiva en vez de rechazarla (es el
      camino para revertir un retiro accidental); solo devuelve error si
      la matrícula ya está activa. Ajustar también la descripción de
      `unenroll_student` para que apunte a `enroll_student` como forma de
      deshacer.
- [ ] Verificar que `processToolCall` devuelve el cuerpo íntegro (incluida
      la marca `reactivated`) — `callStudentsApi` ya retorna el JSON
      completo.
- [ ] Registrar o actualizar entrada en `docs/mcps/README.md`.
- [ ] Actualizar `docs/mcps/students-agent.system-prompt.md`: sección
      "Capacidades" (matricular **o reactivar**) y un apartado nuevo
      "Revertir un retiro accidental" en el bloque de flujos, con la
      instrucción de **confirmar identidad de estudiante y curso antes de
      reactivar** y de reportar al docente si la operación fue alta nueva
      o reactivación.
- [ ] Verificar que el MCP responde correctamente a las herramientas
      declaradas: recompilar (`cd mcp-servers/students-mcp && npm run build`)
      y comprobar el servidor aislado con
      `./mcp-servers/run-local-mcp.sh students-mcp </dev/null` (requiere
      `npm run dev` corriendo).

### Fase 6 — Pruebas
- [ ] Ejecutar los casos manuales de `docs/testing/test-056-mis-notas-y-rematricula.md`
      con el usuario sobre el entorno de desarrollo (`asus`).
- [ ] Ejecutar los casos `TC-MCP-056` contra `students-mcp` local.
- [ ] Invocar `@tester` para las automáticas
      (`e2e-056-mis-notas-y-rematricula.spec.ts`) cuando exista framework.
- [ ] Marcar **DEBT-091 como resuelta** en `docs/specs/backlog.md` citando
      spec-056; añadir en **DEBT-085** la nota de que "Mis notas" ya
      expone el puntaje de evaluaciones cerradas y que al resolverla solo
      hay que habilitar el enlace de `AssignmentScoreList`.

## Criterios de aceptación

**Mis notas**
- El estudiante autenticado entra a `/cuenta/notas` desde el menú de
  usuario y ve, en una sola pantalla, cada uno de sus cursos activos con
  sus ítems de calificación, el puntaje de cada uno, la nota total y la
  nota de autoevaluaciones.
- Para cada curso, las evaluaciones con intento enviado aparecen con su
  puntaje y estado, **incluidas las de ventana cerrada**.
- Una evaluación abierta enlaza a su página de resultados; una cerrada
  muestra el puntaje **sin enlace** (y ese enlace nunca lleva a un 404).
- Un curso del que el estudiante fue retirado aparece en "Cursos
  retirados" con su nota total y sin desglose, y la página no falla por
  ello.
- Si la consulta de notas por evaluación falla, la página sigue mostrando
  ítems y totales, y esa sección muestra el mensaje de infraestructura
  estándar.
- Un visitante no autenticado en `/cuenta/notas` es redirigido al login y
  vuelve a `/cuenta/notas` tras autenticarse.

**Rematrícula**
- El docente dueño del curso ve un botón "Reactivar" junto a cada
  estudiante de la tabla "Retirados" y, al pulsarlo, el estudiante vuelve
  a la tabla "Activos" con `withdrawn_at` vacío, sin recargar manualmente.
- El estudiante reactivado recupera el acceso a
  `/cuenta/cursos/[enrollmentId]/evaluaciones` y a sus lecciones, y
  conserva asistencia, notas y entregas previas.
- `POST /api/students/{studentId}/enrollments` sobre una matrícula
  `withdrawn` responde `200` con la matrícula en `active` y la marca de
  reactivación, en vez del antiguo `400 "Ya está matriculado en este
  curso."`.
- El mismo endpoint sobre una matrícula **`active`** sigue respondiendo
  `400 "Ya está matriculado en este curso."`.
- (MCP) El agente invoca `enroll_student` sobre un estudiante retirado y
  obtiene la matrícula reactivada, informando al docente que fue una
  reactivación y no una alta nueva.
- Un estudiante retirado que reingresa el código de matrícula en
  `/cuenta/cursos` sigue sin poder reactivarse a sí mismo.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-056-mis-notas-y-rematricula.md` — casos
  `TC-056` y `TC-MCP-056`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-056-mis-notas-y-rematricula.spec.ts`
  — un caso por criterio de aceptación, cuando exista framework de testing.

## Nota de secuenciación para quien implemente

Las fases 1-2 (Mis notas) y 3-5 (rematrícula) son independientes entre sí:
comparten el spec por dominio, no por dependencia técnica. Si hace falta
desplegar la rematrícula con urgencia (es una corrección de un incidente
real en producción), las fases 3-4-5 pueden completarse y probarse primero,
y las 1-2 después, sin reordenar nada. **El usuario decide ese orden al
aprobar el spec.**

**Riesgo a vigilar:** la Fase 3 cambia el contrato de un endpoint ya en uso
por `students-mcp`. Si algún flujo del agente dependía del `400` como señal
de "ya existe" (revisar `docs/mcps/students-agent.system-prompt.md`), hay
que actualizarlo en la Fase 5 y no antes del despliegue conjunto.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** _pendiente_
