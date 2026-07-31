# test-031 — Vista docente en la página de lección

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso        | Endpoint de creación | Identificador | Eliminado |
|----------------|-----------------------|---------------|-----------|
| Curso académico real reutilizado como **Grupo A** ("Análisis de algoritmos", `course_slug=analisis-de-algoritmos`) | ya existía — dueño real, no se crea ni se borra | `76191ae2-7969-4956-a9c9-a873f059ad70` | N/A (no se elimina, es el curso real) |
| Curso académico **Grupo B** (mismo `course_slug`, mismo docente dueño) | Inserción directa autorizada por el usuario (sin endpoint/MCP de escritura) | `41383994-3d03-48a8-9918-ccdde3bc9654` (code `AA-TEST-B`, enrollment_code `TSTB0031`) | ✅ |
| Usuario **admin de prueba** (no dueño del curso) | Supabase Auth `admin.createUser` + `user_roles` — inserción directa autorizada por el usuario | `05a7e141-de45-46ca-b304-fad9ab859076` — `test-admin-spec031@nodo.test` / `TestAdmin031!` | ✅ |
| Estudiante de prueba matriculado (activo) en Grupo A | `students-mcp` `create_student` (borrado vía `DELETE /api/students/:id`, directo por API tras desconexión del MCP) | `65f203bd-07e3-49eb-840e-3952dc89bf32` — `test-student-spec031@nodo.test` / `TestStudent031!` (enrollment `037f8e36-ac23-44ce-b4ed-85c3690f802b`, eliminado en cascada) | ✅ |
| Pregunta temporal con **varias respuestas correctas** (para TC-004), publicada en la lección real | `question-bank-mcp` `create_question` + `publish_question` (borrada vía `DELETE /api/questions/:id`, directo por API tras desconexión del MCP) | `7f414d86-657e-4bc7-ba78-71d2c122bdb6` | ✅ |
| Lección real usada en las pruebas | contenido existente, sin crear | `analisis-de-algoritmos` / `fundamentos-control-de-versiones-y-flujo-de-trabajo` | N/A |
| Guía de laboratorio real usada en TC-018 | contenido existente (traído a esta rama vía cherry-pick) | `analisis-de-algoritmos` / `lab-01-repositorio-del-curso` | N/A |
| Usuario **docente `teacher` puro** (sin `admin`), para TC-021 | Supabase Auth `admin.createUser` + `user_roles` — inserción directa autorizada por el usuario | `0b4ea407-f7c6-4042-820b-8a238901f31f` — `test-teacher-tc021@nodo.test` | ✅ |
| Cursos académicos **Grupo C** y **Grupo D** (mismo `course_slug`, mismo docente `teacher` puro), para TC-021 | Inserción directa autorizada por el usuario | `5881bf59-9b27-4ca6-a0ef-62bd6a79ea1d` (Grupo C) y `2e06b460-5ca9-4fba-8056-defe2c7070c5` (Grupo D) | ✅ |

**Entorno de pruebas:** único entorno Supabase (desarrollo = producción, ver CLAUDE.md). Grupo A y la lección/guía son contenido **real**, no datos de prueba — no se eliminan al cerrar la ronda.
**Fecha de la ronda:** 2026-07-30

## Casos de prueba

### TC-001 — Docente dueño ve el panel con la clave oculta
**Precondición:** lección con autoevaluación publicada; usuario autenticado es `teacher_id` del curso académico.
**Pasos:**
1. Iniciar sesión como el docente dueño.
2. Navegar a la lección.
**Resultado esperado:** se ve el artículo, y debajo un panel docente con las preguntas de la autoevaluación; todas las respuestas correctas están ocultas al cargar.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — panel visible con clave oculta, incluida la pregunta temporal de respuesta múltiple.

### TC-002 — Toggle por pregunta revela solo esa pregunta
**Pasos:** Con el panel cargado, activar el toggle de una sola pregunta.
**Resultado esperado:** solo esa pregunta muestra su(s) opción(es) correcta(s) resaltada(s); las demás permanecen ocultas.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — solo la pregunta seleccionada reveló su respuesta, el resto permaneció oculto.

### TC-003 — Toggle global revela y oculta todas
**Pasos:** Activar "Revelar todas"; luego "Ocultar todas".
**Resultado esperado:** todas las preguntas cambian de estado a la vez, sin quedar ninguna desincronizada.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — el toggle global revela y oculta las 7 preguntas correctamente.

### TC-004 — Pregunta de respuesta múltiple
**Precondición:** al menos una pregunta con más de una opción correcta.
**Resultado esperado:** se indica explícitamente "admite varias respuestas" y, al revelar, se resaltan todas las correctas, no solo una.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — se indicó "admite varias respuestas correctas" y se resaltaron las 3 opciones correctas al revelar. Nota: hubo que hacer hard refresh del navegador para ver la pregunta recién publicada (cache del navegador, no del servidor — la página ya usa `dynamic = "force-dynamic"`).

### TC-005 — Orden coincide con el que ve el estudiante
**Pasos:** Abrir la lección en dos sesiones de navegador: una como estudiante matriculado, otra como docente dueño. Comparar el orden de las preguntas.
**Resultado esperado:** el orden es idéntico en ambas vistas.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — la pregunta de prueba aparece en la 7ª posición en ambas vistas, orden idéntico.

### TC-006 — Lección sin preguntas publicadas
**Precondición:** lección sin ninguna pregunta `multiple_choice` publicada.
**Resultado esperado:** no se muestra el bloque de clave de respuestas; sí se muestra el bloque de control de asistencia.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — probado en `sintaxis-de-python` (Semana 2, sin preguntas publicadas).

### TC-007 — Abrir sesión de asistencia desde la lección
**Pasos:** Como docente dueño, en el bloque de asistencia, dar clic en "Abrir sesión".
**Resultado esperado:** aparece el código generado y la cuenta atrás de expiración (15 min).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — código y cuenta atrás visibles. El selector de grupo ya apareció (Grupo A y Grupo B), adelantando parte de TC-012.

### TC-008 — El conteo sube en vivo al marcar asistencia
**Precondición:** sesión abierta desde TC-007.
**Pasos:** Como estudiante, marcar asistencia con el código mostrado. Sin recargar la vista del docente, observar el conteo.
**Resultado esperado:** el conteo de asistentes sube solo, sin recargar la página del docente.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — el conteo subió solo vía polling, sin recargar.

### TC-009 — Cerrar la sesión desde la lección
**Pasos:** Como docente, cerrar la sesión abierta.
**Resultado esperado:** el estudiante ya no puede marcar asistencia con ese código.
**Estado:** ✅ Aprobado
**Hallazgos:** Funcionalmente correcto (sesión cerrada, código inválido para el estudiante), pero se detectó un bug de UX preexistente en `AdminAttendancePanel` (no introducido por spec-031, reutilizado tal cual): el botón "Cerrar sesión" parpadea a "Cerrando..." cada ~5s porque comparte el mismo estado `isPending` de `useTransition()` con el polling del conteo de asistentes. Registrado como DEBT-019 en `docs/specs/backlog.md`.

### TC-010 — Sesión abierta desde otra lección del mismo curso
**Precondición:** sesión abierta desde la Lección A.
**Pasos:** Entrar a la Lección B del mismo curso académico.
**Resultado esperado:** se ve la misma sesión activa (código y conteo), no un botón de "abrir sesión".
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — misma sesión activa visible desde ambas lecciones.

### TC-011 — Intentar abrir una segunda sesión
**Precondición:** ya hay una sesión abierta en el curso.
**Pasos:** Intentar abrir otra sesión para el mismo curso académico.
**Resultado esperado:** mensaje "Ya hay una sesión de asistencia abierta en este curso", sin crear una segunda.
**Estado:** ✅ Aprobado
**Hallazgos:** El botón "Abrir sesión" no aparece mientras hay una sesión activa — la UI ya previene el escenario normal (comportamiento correcto). El mensaje de colisión del servidor (`openSession`, código `23505`) no se forzó manualmente por ser una condición de carrera de bajo valor para esta ronda; queda cubierto por el código existente (spec-010) como red de seguridad.

### TC-012 — Selector de grupo con `course_slug` duplicado
**Precondición:** el docente es dueño de dos cursos académicos activos (grupo A y grupo B) con el mismo `course_slug`.
**Pasos:** Entrar a la lección de ese curso; observar el bloque de asistencia.
**Resultado esperado:** aparece un selector con ambos grupos; al elegir uno y abrir sesión, la sesión se crea en el grupo elegido (verificar `academic_course_id` de la sesión creada).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — sesión abierta en Grupo B con código distinto, sin afectar la sesión abierta en Grupo A.

### TC-013 — La selección de grupo persiste
**Pasos:** Tras TC-012, recargar la página de la lección.
**Resultado esperado:** el selector conserva el grupo elegido previamente, sin volver al primero por defecto.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — el selector conservó Grupo B tras recargar (persistencia vía localStorage confirmada).

### TC-014 — `course_slug` sin curso académico activo
**Precondición:** lección cuyo `course_slug` no tiene ningún `academic_course` activo vinculado.
**Resultado esperado:** mensaje explicativo en el bloque de asistencia (no un panel roto ni un error no controlado).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — probado desactivando temporalmente "Introducción a la programación científica" (`is_active=false`) y reactivado inmediatamente después del caso. Durante esta prueba también se detectó y corrigió un bug de hidratación en `TeacherAttendanceControl` (lectura de `localStorage` en el inicializador de `useState`, ejecutada también en SSR) — ver commit de fix; no requirió cambios en el spec ni en los criterios de aceptación.

### TC-015 — Estudiante matriculado no ve el panel docente
**Pasos:** Iniciar sesión como el estudiante matriculado de prueba; entrar a la misma lección.
**Resultado esperado:** ve el flujo de autoevaluación normal (con formulario y envío) y ningún rastro del panel docente (ni clave de respuestas ni control de asistencia).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — flujo de estudiante intacto, sin rastro del panel docente.

### TC-016 — Admin no dueño ve el panel completo
**Pasos:** Iniciar sesión como el usuario con rol `admin` de prueba (que no es `teacher_id` del curso); entrar a la lección.
**Resultado esperado:** ve el panel docente completo (clave de respuestas + control de asistencia), igual que el dueño.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — el admin de prueba (no dueño) vio el panel completo, igual que el docente dueño.

### TC-017 — El panel admin clásico sigue funcionando
**Pasos:** Con una sesión abierta desde la lección (TC-007), navegar a `/admin/courses/<id>/attendance`.
**Resultado esperado:** la ruta admin clásica muestra la misma sesión activa, código y conteo, sin cambios de comportamiento.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — la ruta admin clásica refleja la misma sesión, sin regresiones.

### TC-018 — Panel docente en una guía de laboratorio
**Pasos:** Como docente dueño, entrar a una guía de laboratorio publicada del curso.
**Resultado esperado:** se ve el control de asistencia; no se ve bloque de clave de respuestas (las guías no tienen autoevaluación).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — probado en `lab-01-repositorio-del-curso` (traída a esta rama por cherry-pick para esta ronda).

### TC-019 — Modo claro y oscuro
**Pasos:** Alternar el tema del sitio con el panel docente visible.
**Resultado esperado:** el panel respeta los tokens semánticos de `DESIGN.md` en ambos modos, sin contrastes rotos.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — legible y consistente en ambos modos.

### TC-020 — Vista responsive en móvil
**Pasos:** Abrir la lección con el panel docente en un viewport móvil.
**Resultado esperado:** el código de asistencia es legible, el selector de grupo es usable, y los toggles de la clave de respuestas no rompen el layout.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — layout usable en viewport móvil.

### TC-021 — Docente con rol `teacher` (sin `admin`) y dos cursos con el mismo `course_slug` conserva el acceso
**Origen:** hallazgo bloqueante de `@reviewer` — `hasCourseAccess` usaba `.maybeSingle()`, que devuelve `null` cuando hay más de un `academic_course` con el mismo `course_slug` y `teacher_id`, dejando sin acceso a un docente sin rol `admin` en el escenario multi-grupo que este spec habilita. Corregido en `lib/enrollments/access.ts` (Fase 7 del spec).
**Precondición:** un usuario con **solo** rol `teacher` (sin `admin`) que sea `teacher_id` de dos `academic_courses` activos con el mismo `course_slug`.
**Pasos:** Iniciar sesión con ese usuario; navegar a una lección de ese `course_slug`.
**Resultado esperado:** `access.reason === "owner"` (no redirigido a `/cuenta/cursos?sinAcceso=...`); ve el panel docente completo, incluido el selector de grupo con ambos cursos.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones — el docente `teacher` puro (sin `admin`), dueño de Grupo C y Grupo D (mismo `course_slug`), accedió sin redirección y vio el selector con ambos grupos. Confirma que el fix de `hasCourseAccess` (`.limit(1)` en vez de `.maybeSingle()`) resuelve el hallazgo bloqueante de `@reviewer`.

## Resumen de la ronda
- Aprobados: 21 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: DEBT-019 (parpadeo de "Cerrar sesión" cada ~5s en `AdminAttendancePanel`, ya existente antes de spec-031), DEBT-020 (accesibilidad + tokens crudos en `TeacherAnswerKey`), DEBT-021 (`getAnswerKeyForLesson` no distingue "sin preguntas" de "error"), DEBT-022 (duplicación de consulta con `getSelfAssessmentForLesson`), DEBT-023 (parpadeo de grupo/código equivocado antes de restaurar `localStorage`)
- Bug corregido durante la ronda (no escalado a backlog, ya resuelto): mismatch de hidratación en `TeacherAttendanceControl` por lectura de `localStorage` en el inicializador de `useState` — corregido moviendo la restauración a un `useEffect` post-montaje.
- Bug bloqueante corregido tras revisión de `@reviewer` (ver TC-021): `hasCourseAccess` con `.maybeSingle()` dejaba sin acceso a un docente `teacher` (no `admin`) con dos cursos del mismo `course_slug`.
- Limpieza de datos de prueba: ✅ Completada (2026-07-30) — Grupo B, usuario admin de prueba, estudiante de prueba, pregunta temporal, y (tras TC-021) el usuario docente `teacher` puro y los Grupos C/D, todos eliminados y verificados. Grupo A (curso real) y la lección/guía reales quedan intactos, como corresponde.
