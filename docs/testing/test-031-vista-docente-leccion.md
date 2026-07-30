# test-031 — Vista docente en la página de lección

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso        | Endpoint de creación | Identificador | Eliminado |
|----------------|-----------------------|---------------|-----------|
| Curso académico (grupo A) con `course_slug` de prueba | `academic_courses` (vía panel admin o seed) | `{{id}}` | ⬜ |
| Curso académico (grupo B) con el **mismo** `course_slug` que el grupo A | `academic_courses` | `{{id}}` | ⬜ |
| Estudiante matriculado (activo) en el grupo A | `students-mcp` / `POST /api/students` + enrollment | `{{id}}` | ⬜ |
| Docente colaborador o admin de prueba (no dueño del curso) | Supabase Auth + `user_roles` | `{{id}}` | ⬜ |
| Lección con autoevaluación de cierre publicada (≥1 pregunta con múltiples correctas) | `question-bank-mcp` `create_question` + `publish_question` | `{{ids}}` | ⬜ |
| Guía de laboratorio publicada del mismo curso | contenido existente | `{{slug}}` | ⬜ |

**Entorno de pruebas:** desarrollo (único entorno Supabase, ver CLAUDE.md)
**Fecha de la ronda:** {{fecha}}

## Casos de prueba

### TC-001 — Docente dueño ve el panel con la clave oculta
**Precondición:** lección con autoevaluación publicada; usuario autenticado es `teacher_id` del curso académico.
**Pasos:**
1. Iniciar sesión como el docente dueño.
2. Navegar a la lección.
**Resultado esperado:** se ve el artículo, y debajo un panel docente con las preguntas de la autoevaluación; todas las respuestas correctas están ocultas al cargar.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — Toggle por pregunta revela solo esa pregunta
**Pasos:** Con el panel cargado, activar el toggle de una sola pregunta.
**Resultado esperado:** solo esa pregunta muestra su(s) opción(es) correcta(s) resaltada(s); las demás permanecen ocultas.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-003 — Toggle global revela y oculta todas
**Pasos:** Activar "Revelar todas"; luego "Ocultar todas".
**Resultado esperado:** todas las preguntas cambian de estado a la vez, sin quedar ninguna desincronizada.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — Pregunta de respuesta múltiple
**Precondición:** al menos una pregunta con más de una opción correcta.
**Resultado esperado:** se indica explícitamente "admite varias respuestas" y, al revelar, se resaltan todas las correctas, no solo una.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-005 — Orden coincide con el que ve el estudiante
**Pasos:** Abrir la lección en dos sesiones de navegador: una como estudiante matriculado, otra como docente dueño. Comparar el orden de las preguntas.
**Resultado esperado:** el orden es idéntico en ambas vistas.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — Lección sin preguntas publicadas
**Precondición:** lección sin ninguna pregunta `multiple_choice` publicada.
**Resultado esperado:** no se muestra el bloque de clave de respuestas; sí se muestra el bloque de control de asistencia.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-007 — Abrir sesión de asistencia desde la lección
**Pasos:** Como docente dueño, en el bloque de asistencia, dar clic en "Abrir sesión".
**Resultado esperado:** aparece el código generado y la cuenta atrás de expiración (15 min).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — El conteo sube en vivo al marcar asistencia
**Precondición:** sesión abierta desde TC-007.
**Pasos:** Como estudiante, marcar asistencia con el código mostrado. Sin recargar la vista del docente, observar el conteo.
**Resultado esperado:** el conteo de asistentes sube solo, sin recargar la página del docente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-009 — Cerrar la sesión desde la lección
**Pasos:** Como docente, cerrar la sesión abierta.
**Resultado esperado:** el estudiante ya no puede marcar asistencia con ese código.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-010 — Sesión abierta desde otra lección del mismo curso
**Precondición:** sesión abierta desde la Lección A.
**Pasos:** Entrar a la Lección B del mismo curso académico.
**Resultado esperado:** se ve la misma sesión activa (código y conteo), no un botón de "abrir sesión".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-011 — Intentar abrir una segunda sesión
**Precondición:** ya hay una sesión abierta en el curso.
**Pasos:** Intentar abrir otra sesión para el mismo curso académico.
**Resultado esperado:** mensaje "Ya hay una sesión de asistencia abierta en este curso", sin crear una segunda.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-012 — Selector de grupo con `course_slug` duplicado
**Precondición:** el docente es dueño de dos cursos académicos activos (grupo A y grupo B) con el mismo `course_slug`.
**Pasos:** Entrar a la lección de ese curso; observar el bloque de asistencia.
**Resultado esperado:** aparece un selector con ambos grupos; al elegir uno y abrir sesión, la sesión se crea en el grupo elegido (verificar `academic_course_id` de la sesión creada).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-013 — La selección de grupo persiste
**Pasos:** Tras TC-012, recargar la página de la lección.
**Resultado esperado:** el selector conserva el grupo elegido previamente, sin volver al primero por defecto.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-014 — `course_slug` sin curso académico activo
**Precondición:** lección cuyo `course_slug` no tiene ningún `academic_course` activo vinculado.
**Resultado esperado:** mensaje explicativo en el bloque de asistencia (no un panel roto ni un error no controlado).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-015 — Estudiante matriculado no ve el panel docente
**Pasos:** Iniciar sesión como el estudiante matriculado de prueba; entrar a la misma lección.
**Resultado esperado:** ve el flujo de autoevaluación normal (con formulario y envío) y ningún rastro del panel docente (ni clave de respuestas ni control de asistencia).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-016 — Admin no dueño ve el panel completo
**Pasos:** Iniciar sesión como el usuario con rol `admin` de prueba (que no es `teacher_id` del curso); entrar a la lección.
**Resultado esperado:** ve el panel docente completo (clave de respuestas + control de asistencia), igual que el dueño.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-017 — El panel admin clásico sigue funcionando
**Pasos:** Con una sesión abierta desde la lección (TC-007), navegar a `/admin/courses/<id>/attendance`.
**Resultado esperado:** la ruta admin clásica muestra la misma sesión activa, código y conteo, sin cambios de comportamiento.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-018 — Panel docente en una guía de laboratorio
**Pasos:** Como docente dueño, entrar a una guía de laboratorio publicada del curso.
**Resultado esperado:** se ve el control de asistencia; no se ve bloque de clave de respuestas (las guías no tienen autoevaluación).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-019 — Modo claro y oscuro
**Pasos:** Alternar el tema del sitio con el panel docente visible.
**Resultado esperado:** el panel respeta los tokens semánticos de `DESIGN.md` en ambos modos, sin contrastes rotos.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-020 — Vista responsive en móvil
**Pasos:** Abrir la lección con el panel docente en un viewport móvil.
**Resultado esperado:** el código de asistencia es legible, el selector de grupo es usable, y los toggles de la clave de respuestas no rompen el layout.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 20
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente
