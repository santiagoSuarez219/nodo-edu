# test-041 — Refrescar el código de una sesión de asistencia abierta

Casos manuales de `spec-041`. Solo flujos con UI. Cada caso encodifica uno o más
criterios de aceptación del spec y arranca en ⬜ Pendiente.

**El único punto de montaje del panel es la vista docente de la lección**
(`TeacherLessonPanel` → `TeacherAttendanceControl` → `AdminAttendancePanel`): la
subruta `/admin/courses/[academicCourseId]/attendance` de spec-010 ya no existe.
Todos los casos del docente se ejecutan sobre una lección del curso.

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|----------------------|---------------|-----------|
| Docente de desarrollo (dueño del curso académico de pruebas) | ya existe — `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | N/A (cuenta base de desarrollo) |
| Curso del catálogo y lección usadas en la ronda | contenido versionado en git, no se crea | `{{course_slug}}` / `{{lesson_slug}}` | N/A |
| Curso académico **Grupo A** (`course_slug={{course_slug}}`, dueño `dev@nodo.local`) | ya existente o creado para la ronda (registrar cuál) | `{{academic_course_id_A}}` | ⬜ |
| Curso académico **Grupo B** (segundo grupo, mismo docente) — solo para TC-011 | ídem | `{{academic_course_id_B}}` | ⬜ |
| Estudiante **E1** (marca antes del refresco) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `{{e1_id}}` — `test-e1-spec041@nodo.test` / `TestStudent041!` | ⬜ |
| Estudiante **E2** (marca después del refresco, conteo en vivo) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `{{e2_id}}` — `test-e2-spec041@nodo.test` / `TestStudent041!` | ⬜ |
| Estudiante **E3** (teclea el código viejo tras la rotación) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `{{e3_id}}` — `test-e3-spec041@nodo.test` / `TestStudent041!` | ⬜ |
| Sesiones de asistencia abiertas durante la ronda | se abren desde la propia UI (`Abrir sesión de asistencia`) | `{{session_ids}}` — cerrar todas al terminar | ⬜ |

**Entorno de pruebas:** desarrollo — Supabase local en `mirp-lab` a través del
túnel SSH (ver `CLAUDE.md` → "Base de datos"), con `npm run dev` en esta máquina.
**Ningún caso de esta ronda se ejecuta contra producción.**
**Fecha de la ronda:** {{pendiente}}

**Precondiciones globales:**

- La sesión del docente se abre y se cierra desde la vista docente de la lección
  `/{{course_slug}}/{{lesson_slug}}`.
- Para los casos que necesitan comprobar la fila en base de datos (TC-006, TC-008)
  Claude verifica por consulta y reporta; el usuario solo opera la UI.
- Conviene tener dos navegadores/perfiles abiertos: uno con el docente y otro con
  el estudiante del caso.

---

## Refrescar: extender

### TC-001 — "Extender 15 min" conserva el código y reinicia la cuenta atrás
**Precondición:** sesión de `dev@nodo.local`; sesión de asistencia **abierta** en
Grupo A, con la cuenta atrás visible.
**Datos de prueba usados:** `{{academic_course_id_A}}`
**Pasos:**
1. Abrir `/{{course_slug}}/{{lesson_slug}}` como docente y localizar el bloque
   "CÓDIGO DE ASISTENCIA".
2. Anotar el código mostrado y el valor de la cuenta atrás.
3. Pulsar **"Extender 15 min"** y confirmar en el diálogo.
**Resultado esperado:** el código mostrado es **el mismo** que se anotó; la cuenta
atrás vuelve a ~15:00 de inmediato (sin quedarse un segundo en el valor viejo ni
en "expirado"); no aparece ningún banner de error.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — El código extendido sigue siendo válido para el estudiante
**Precondición:** TC-001 ejecutado; **E1** aún no ha marcado y tiene anotado el
código de **antes** de extender (que es el mismo).
**Datos de prueba usados:** `test-e1-spec041@nodo.test`
**Pasos:**
1. Como **E1**, abrir `/{{course_slug}}/{{lesson_slug}}`.
2. En la sección "Asistencia", ingresar el código anotado y enviar.
**Resultado esperado:** "Asistencia registrada", con la hora de marcado. Extender
no invalidó el código que el estudiante ya tenía.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Refrescar: rotar

### TC-003 — "Generar código nuevo" muestra un código distinto y reinicia la cuenta atrás
**Precondición:** sesión de `dev@nodo.local`; sesión abierta en Grupo A.
**Datos de prueba usados:** `{{academic_course_id_A}}`
**Pasos:**
1. Anotar el código actual.
2. Pulsar **"Generar código nuevo"** y confirmar en el diálogo.
**Resultado esperado:** el bloque muestra un código **distinto** del anotado, de
4–6 dígitos; la cuenta atrás vuelve a ~15:00; sin banner de error.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — El código viejo deja de funcionar tras la rotación
**Precondición:** TC-003 ejecutado; **E3** tiene la lección abierta **desde antes**
de la rotación (no recargar) y conoce el código viejo.
**Datos de prueba usados:** `test-e3-spec041@nodo.test`
**Pasos:**
1. Como **E3**, sin recargar la página, ingresar el **código viejo** y enviar.
2. Recargar la página, ingresar el **código nuevo** y enviar.
**Resultado esperado:** en el paso 1, mensaje de código no válido cuyo texto
**menciona que el docente pudo generar uno nuevo e invita a recargar** (no un
simple "código no válido" sin salida); no se registra asistencia. En el paso 2,
"Asistencia registrada".
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Lo que el refresco NO debe romper

### TC-005 — Las marcas previas sobreviven a extender y a rotar
**Precondición:** **E1** ya marcó asistencia (TC-002); el panel docente muestra el
conteo ≥ 1.
**Datos de prueba usados:** `test-e1-spec041@nodo.test`, `{{academic_course_id_A}}`
**Pasos:**
1. En el panel docente, anotar el número de "ASISTENTES".
2. Pulsar "Extender 15 min" y confirmar. Observar el contador durante ~10 s.
3. Pulsar "Generar código nuevo" y confirmar. Observar el contador durante ~10 s.
4. Como **E1**, recargar la lección.
**Resultado esperado:** el contador **no cambia** en los pasos 2 y 3 (no baja a 0
ni parpadea, ni aparece el aviso "Desactualizado"). En el paso 4, **E1** sigue
viendo "Asistencia marcada" con **la misma hora original**, y no se le pide marcar
de nuevo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — Refrescar no crea una segunda sesión del día
**Precondición:** TC-001 y TC-003 ejecutados sobre la misma sesión.
**Datos de prueba usados:** `{{academic_course_id_A}}`
**Pasos:**
1. Pedir a Claude que consulte las `class_sessions` del Grupo A para el día de hoy
   y reporte cuántas filas hay, sus `id` y su `is_open`.
**Resultado esperado:** **una sola fila** para hoy, con el mismo `id` desde que se
abrió la sesión, `is_open = true`, `code_expires_at` empujado y `updated_at`
posterior a `created_at`. Ningún duplicado que infle `total_sessions`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Confirmación y cancelación

### TC-007 — Cancelar en cada diálogo no cambia nada
**Precondición:** sesión abierta en Grupo A.
**Datos de prueba usados:** `{{academic_course_id_A}}`
**Pasos:**
1. Anotar el código y el valor de la cuenta atrás.
2. Pulsar "Extender 15 min" y **cancelar** (botón Cancelar).
3. Volver a pulsar "Extender 15 min" y cerrar el diálogo con **Escape**.
4. Pulsar "Generar código nuevo" y **cancelar**.
5. Volver a pulsar "Generar código nuevo" y cerrar con **Escape**.
**Resultado esperado:** en los cuatro casos el diálogo se cierra sin ejecutar
nada: el código sigue siendo el anotado y la cuenta atrás **sigue descendiendo
desde donde iba** (no se reinicia). Al abrir cada diálogo el foco cae en el botón
de confirmar y el fondo queda bloqueado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — Sesión cerrada desde otra pestaña: refrescar no la revive
**Precondición:** sesión abierta en Grupo A y **dos pestañas** del docente con la
misma lección abierta (pestaña A y pestaña B).
**Datos de prueba usados:** `{{academic_course_id_A}}`
**Pasos:**
1. En la **pestaña A**, cerrar la sesión de asistencia (confirmar el diálogo).
2. Sin recargar la **pestaña B** (que todavía muestra la sesión como abierta),
   pulsar "Extender 15 min" y confirmar.
3. Repetir el paso 2 con "Generar código nuevo" (recargar B primero si el paso 2
   ya la dejó sin sesión, volviendo a montar el escenario).
4. Pedir a Claude que consulte la fila de esa sesión.
**Resultado esperado:** la pestaña B muestra un aviso informativo del tipo "la
sesión ya fue cerrada" y pasa al estado "sin sesión de asistencia abierta"; **no**
aparece un código vigente. En la base de datos la fila conserva `is_open = false`
y su `code_expires_at` y `attendance_code` **originales** (el cierre no se
deshizo).
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Comportamiento en vivo del panel

### TC-009 — El conteo en vivo sigue funcionando después de refrescar
**Precondición:** sesión abierta en Grupo A, ya refrescada al menos una vez;
**E2** no ha marcado.
**Datos de prueba usados:** `test-e2-spec041@nodo.test`, `{{academic_course_id_A}}`
**Pasos:**
1. Con el panel docente a la vista, anotar el conteo actual.
2. Como **E2**, marcar asistencia con el código vigente.
3. Volver al panel docente **sin recargar** y esperar hasta ~10 s.
**Resultado esperado:** el conteo se incrementa en 1 solo (polling ~5 s), sin
recarga manual y sin el aviso "Desactualizado".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-010 — El estado de carga es independiente por acción
**Precondición:** sesión abierta en Grupo A.
**Datos de prueba usados:** `{{academic_course_id_A}}`
**Pasos:**
1. Pulsar "Extender 15 min" y confirmar; observar **los otros botones** durante la
   operación ("Generar código nuevo" y "Cerrar sesión").
2. Repetir con "Generar código nuevo", observando "Extender 15 min" y "Cerrar
   sesión".
3. Dejar el panel quieto ~30 s (mientras el polling corre cada 5 s) y observar el
   botón "Cerrar sesión".
**Resultado esperado:** en 1 y 2, **solo el botón pulsado** cambia su texto
("Extendiendo…" / "Generando…"); los demás se ven deshabilitados pero **no cambian
de etiqueta**. En el paso 3 ningún botón parpadea ni cambia de texto (no reaparece
DEBT-019).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-011 — Refrescar afecta solo al grupo seleccionado
**Precondición:** el docente tiene **dos grupos** (A y B) para `{{course_slug}}`,
con una sesión abierta en **cada uno**.
**Datos de prueba usados:** `{{academic_course_id_A}}`, `{{academic_course_id_B}}`
**Pasos:**
1. En el selector "Grupo" de la vista docente, elegir **Grupo A** y anotar su
   código.
2. Cambiar a **Grupo B**, anotar su código y pulsar "Generar código nuevo",
   confirmando.
3. Volver a **Grupo A**.
**Resultado esperado:** el código de Grupo A es **el mismo** del paso 1 y su cuenta
atrás no se reinició; solo el de Grupo B cambió. Ningún instante en que se muestre
el código del grupo equivocado (regresión de DEBT-023).
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 11
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
  - Cerrar todas las sesiones de asistencia abiertas durante la ronda.
  - Desmatricular y eliminar E1, E2 y E3 vía `students-mcp`
    (`unenroll_student` → `delete_student`), en orden inverso a su creación.
  - Eliminar los cursos académicos creados solo para esta ronda (si aplica).
