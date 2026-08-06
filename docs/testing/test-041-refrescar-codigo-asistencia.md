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
| Curso del catálogo y lección usadas en la ronda | contenido versionado en git, no se crea | `analisis-de-algoritmos` / `algoritmos-como-tecnologia` | N/A |
| Curso académico **Grupo A** (`course_slug=analisis-de-algoritmos`, dueño `dev@nodo.local`) | ya existente (`S039A`, leftover de la ronda de spec-039) | `00d0f44d-5459-45bc-826d-988428ea3d69` | ⬜ (no crear/borrar — preexistente) |
| Curso académico **Grupo B** (segundo grupo, mismo docente) — solo para TC-011 | ya existente (`S039B`, leftover de la ronda de spec-039) | `9479dc67-6493-46b2-b612-a889d2879bfe` | ⬜ (no crear/borrar — preexistente) |
| Estudiante **E1** (marca antes del refresco) | `students-mcp` → `create_student` (matriculado directo en Grupo A) | `b3bf43a7-06dc-4e11-9483-fbcea91aae4f` — `test-e1-spec041@nodo.test` / `TestStudent041!` | ✅ (`unenroll_student` + `delete_student`, 2026-08-06) |
| Estudiante **E2** (marca después del refresco, conteo en vivo) | `students-mcp` → `create_student` (matriculado directo en Grupo A) | `784bc870-2ed2-4f99-9528-6e137c85f191` — `test-e2-spec041@nodo.test` / `TestStudent041!` | ✅ (`unenroll_student` + `delete_student`, 2026-08-06) |
| Estudiante **E3** (teclea el código viejo tras la rotación) | `students-mcp` → `create_student` (matriculado directo en Grupo A) | `83573e64-b830-4b6c-9f2d-e0d162963396` — `test-e3-spec041@nodo.test` / `TestStudent041!` | ✅ (`unenroll_student` + `delete_student`, 2026-08-06) |
| Sesiones de asistencia abiertas durante la ronda | se abren desde la propia UI (`Abrir sesión de asistencia`) | varias, la última: Grupo A `154be99e-…`, Grupo B `56aef802-…` | ⬜ (cerrar desde la UI — sin endpoint de API, `attendance-mcp` es de solo lectura) |

**Entorno de pruebas:** desarrollo — Supabase local en `mirp-lab` a través del
túnel SSH (ver `CLAUDE.md` → "Base de datos"), `npm run dev` de este proyecto
corriendo en `localhost:3002` (puerto no estándar: hay otros proyectos usando
3000/3001 en esta máquina).
**Ningún caso de esta ronda se ejecuta contra producción.**
**Fecha de la ronda:** 2026-08-05

**Nota de housekeeping (no corregida en esta ronda, fuera de su scope):** Grupo A
y Grupo B ya tenían matriculados `test-student-spec039@nodo.test` y
`test-student2-spec039@nodo.test` respectivamente — datos de prueba de la ronda
de `spec-039` que no se limpiaron entonces. No interfieren con los casos de este
spec (ningún caso depende de que el roster esté vacío) y no se tocan aquí; si el
usuario quiere, se abre una limpieza aparte.

**Precondiciones globales:**

- La sesión del docente se abre y se cierra desde la vista docente de la lección
  `/analisis-de-algoritmos/algoritmos-como-tecnologia`.
- Para los casos que necesitan comprobar la fila en base de datos (TC-006, TC-008)
  Claude verifica por consulta y reporta; el usuario solo opera la UI.
- Conviene tener dos navegadores/perfiles abiertos: uno con el docente y otro con
  el estudiante del caso.

---

## Refrescar: extender

### TC-001 — "Extender 15 min" conserva el código y reinicia la cuenta atrás
**Precondición:** sesión de `dev@nodo.local`; sesión de asistencia **abierta** en
Grupo A, con la cuenta atrás visible.
**Datos de prueba usados:** `00d0f44d-5459-45bc-826d-988428ea3d69`
**Pasos:**
1. Abrir `/analisis-de-algoritmos/algoritmos-como-tecnologia` como docente y localizar el bloque
   "CÓDIGO DE ASISTENCIA".
2. Anotar el código mostrado y el valor de la cuenta atrás.
3. Pulsar **"Extender 15 min"** y confirmar en el diálogo.
**Resultado esperado:** el código mostrado es **el mismo** que se anotó; la cuenta
atrás vuelve a ~15:00 de inmediato (sin quedarse un segundo en el valor viejo ni
en "expirado"); no aparece ningún banner de error.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

### TC-002 — El código extendido sigue siendo válido para el estudiante
**Precondición:** TC-001 ejecutado; **E1** aún no ha marcado y tiene anotado el
código de **antes** de extender (que es el mismo).
**Datos de prueba usados:** `test-e1-spec041@nodo.test`
**Pasos:**
1. Como **E1**, abrir `/analisis-de-algoritmos/algoritmos-como-tecnologia`.
2. En la sección "Asistencia", ingresar el código anotado y enviar.
**Resultado esperado:** "Asistencia registrada", con la hora de marcado. Extender
no invalidó el código que el estudiante ya tenía.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

---

## Refrescar: rotar

### TC-003 — "Generar código nuevo" muestra un código distinto y reinicia la cuenta atrás
**Precondición:** sesión de `dev@nodo.local`; sesión abierta en Grupo A.
**Datos de prueba usados:** `00d0f44d-5459-45bc-826d-988428ea3d69`
**Pasos:**
1. Anotar el código actual.
2. Pulsar **"Generar código nuevo"** y confirmar en el diálogo.
**Resultado esperado:** el bloque muestra un código **distinto** del anotado, de
4–6 dígitos; la cuenta atrás vuelve a ~15:00; sin banner de error.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

---

## Lo que el refresco NO debe romper

### TC-005 — Las marcas previas sobreviven a extender y a rotar
**Precondición:** **E1** ya marcó asistencia (TC-002); el panel docente muestra el
conteo ≥ 1.
**Datos de prueba usados:** `test-e1-spec041@nodo.test`, `00d0f44d-5459-45bc-826d-988428ea3d69`
**Pasos:**
1. En el panel docente, anotar el número de "ASISTENTES".
2. Pulsar "Extender 15 min" y confirmar. Observar el contador durante ~10 s.
3. Pulsar "Generar código nuevo" y confirmar. Observar el contador durante ~10 s.
4. Como **E1**, recargar la lección.
**Resultado esperado:** el contador **no cambia** en los pasos 2 y 3 (no baja a 0
ni parpadea, ni aparece el aviso "Desactualizado"). En el paso 4, **E1** sigue
viendo "Asistencia marcada" con **la misma hora original**, y no se le pide marcar
de nuevo.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

### TC-006 — Refrescar no crea una segunda sesión del día
**Precondición:** TC-001 y TC-003 ejecutados sobre la misma sesión.
**Datos de prueba usados:** `00d0f44d-5459-45bc-826d-988428ea3d69`
**Pasos:**
1. Pedir a Claude que consulte las `class_sessions` del Grupo A para el día de hoy
   y reporte cuántas filas hay, sus `id` y su `is_open`.
**Resultado esperado:** **una sola fila** para hoy, con el mismo `id` desde que se
abrió la sesión, `is_open = true`, `code_expires_at` empujado y `updated_at`
posterior a `created_at`. Ningún duplicado que infle `total_sessions`.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado vía `attendance-mcp` (`list_sessions`): una sola fila
`id=adb30f39-7810-41c0-a38b-faa3b3a40543`, `is_open=true`, `code_expires_at`
empujado, `attendee_count=2`. El MCP de solo lectura no expone `updated_at`, así
que ese detalle puntual no se verificó por esta vía (el resto del criterio sí).

---

## Confirmación y cancelación

### TC-007 — Cancelar en cada diálogo no cambia nada
**Precondición:** sesión abierta en Grupo A.
**Datos de prueba usados:** `00d0f44d-5459-45bc-826d-988428ea3d69`
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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

### TC-008 — Sesión cerrada desde otra pestaña: refrescar no la revive
**Precondición:** sesión abierta en Grupo A y **dos pestañas** del docente con la
misma lección abierta (pestaña A y pestaña B).
**Datos de prueba usados:** `00d0f44d-5459-45bc-826d-988428ea3d69`
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
**Estado:** ✅ Aprobado
**Hallazgos:** en ambos intentos (extender y rotar desde la pestaña cerrada) la
pestaña B mostró el aviso "sesión ya fue cerrada" correctamente. Verificado en BD
vía `attendance-mcp`: la sesión de la prueba de rotar (`faf9cbcd-…`) quedó
`is_open=false` con `code_expires_at` sin modificar (15 min desde su
`created_at`, no desde el intento de rotación). `attendance_code` no verificable
por este MCP (excluido deliberadamente del `select`, por diseño). **Hallazgo
colateral (no bloqueante):** al abrir la segunda pestaña ocurrió un error de
hidratación de React recuperable en el contador "Expira en: mm:ss" (desajuste de
1s entre el render de servidor y cliente); Next.js regeneró el árbol
automáticamente y la pestaña siguió usable. Preexistente al spec, no introducido
por los cambios de refrescar código. Registrado como **DEBT-053** en
`docs/specs/backlog.md`.

---

## Comportamiento en vivo del panel

### TC-009 — El conteo en vivo sigue funcionando después de refrescar
**Precondición:** sesión abierta en Grupo A, ya refrescada al menos una vez;
**E2** no ha marcado.
**Datos de prueba usados:** `test-e2-spec041@nodo.test`, `00d0f44d-5459-45bc-826d-988428ea3d69`
**Pasos:**
1. Con el panel docente a la vista, anotar el conteo actual.
2. Como **E2**, marcar asistencia con el código vigente.
3. Volver al panel docente **sin recargar** y esperar hasta ~10 s.
**Resultado esperado:** el conteo se incrementa en 1 solo (polling ~5 s), sin
recarga manual y sin el aviso "Desactualizado".
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

### TC-010 — El estado de carga es independiente por acción
**Precondición:** sesión abierta en Grupo A.
**Datos de prueba usados:** `00d0f44d-5459-45bc-826d-988428ea3d69`
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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

### TC-011 — Refrescar afecta solo al grupo seleccionado
**Precondición:** el docente tiene **dos grupos** (A y B) para `analisis-de-algoritmos`,
con una sesión abierta en **cada uno**.
**Datos de prueba usados:** `00d0f44d-5459-45bc-826d-988428ea3d69`, `9479dc67-6493-46b2-b612-a889d2879bfe`
**Pasos:**
1. En el selector "Grupo" de la vista docente, elegir **Grupo A** y anotar su
   código.
2. Cambiar a **Grupo B**, anotar su código y pulsar "Generar código nuevo",
   confirmando.
3. Volver a **Grupo A**.
**Resultado esperado:** el código de Grupo A es **el mismo** del paso 1 y su cuenta
atrás no se reinició; solo el de Grupo B cambió. Ningún instante en que se muestre
el código del grupo equivocado (regresión de DEBT-023).
**Estado:** ✅ Aprobado (tercer intento, tras ampliar el fix a las 4 acciones)
**Hallazgos:** **Primer intento (2026-08-06) — ❌ Fallido.** Tras rotar el
código de Grupo B (paso 3) y volver a Grupo A (paso 4), al volver a cambiar a
**Grupo B** el panel mostraba **"sin sesión de asistencia abierta"** en vez del
código recién rotado — como si la sesión no existiera. Verificado por API
(`attendance-mcp` → `list_sessions`) que la sesión de Grupo B (`f3e5d243-…`)
seguía **abierta y con `code_expires_at` vigente** en el servidor en el momento
del fallo: era un problema de **estado en el cliente** al cambiar de grupo tras
un refresco, no de datos. Recargar la página en Grupo B lo resolvía. El código
de Grupo A no se vio afectado en este intento.

**Causa raíz investigada y corregida (spec-041, Decisión 11):**
`extendSessionCode`/`rotateSessionCode` revalidaban `/admin/courses` — ruta
muerta desde spec-031 — en vez de la ruta real del panel
(`/${courseSlug}/${lessonSlug}`), así que el snapshot que arma `page.tsx` para
`initialSessionsByCourseId` nunca se refrescaba, y `AdminAttendancePanel`
(que remonta con `key={selectedCourse.id}` al cambiar de grupo) leía ese
snapshot viejo. Corregido pasando `courseSlug`/`lessonSlug` a ambas acciones.

**Segundo intento (mismo día):** al recrear la precondición reabriendo sesión
en ambos grupos tras reconectar el túnel a `mirp-lab`, apareció el mismo
síntoma ("sin sesión abierta" al cambiar de grupo) **sin haber rotado ni
extendido nada** — esta vez vía `openSession`, que compartía la misma causa
raíz y originalmente había quedado fuera de este spec (DEBT-052). Se amplió el
fix a `openSession` y `closeSession` en la misma sesión; DEBT-052 quedó
marcado como resuelto. Pendiente re-ejecutar TC-011 por tercera vez, ahora con
el fix completo.

**Tercer intento — ✅ Aprobado.** Con las 4 acciones corregidas, los 5 pasos
funcionaron correctamente sin necesidad de recargar la página entre cambios de
grupo: Grupo A conservó su código a través de dos idas y vueltas, y Grupo B
mostró el código rotado correctamente al volver a él.

---

## Resumen de la ronda
- Aprobados: 11 — Fallidos: 0 — Pendientes: 0
- **TC-011 falló dos veces antes de aprobar.** Primer intento: el panel
  mostraba "sin sesión abierta" para un grupo con sesión realmente abierta, al
  remontar tras cambiar de grupo, después de rotar su código. Causa raíz
  investigada y corregida en spec-041 (Decisión 11): `extendSessionCode`/
  `rotateSessionCode` revalidaban `/admin/courses` (ruta muerta desde
  spec-031) en vez de la ruta real del panel. Segundo intento: el mismo
  síntoma reapareció vía `openSession` (sin rotar/extender nada), causa raíz
  compartida — el fix se amplió a las 4 Server Actions del módulo
  (`openSession`, `closeSession`, `extendSessionCode`, `rotateSessionCode`).
  **DEBT-052** quedó registrado y marcado **resuelto** en
  `docs/specs/backlog.md`. Tercer intento: ✅ aprobado.
- Hallazgo colateral en TC-008 (no bloqueante, sin corregir): error de
  hidratación recuperable en el contador "Expira en: mm:ss" al abrir una
  segunda pestaña. Registrado como **DEBT-053** en `docs/specs/backlog.md`.
- Limpieza de datos de prueba: 🟡 Parcial — E1/E2/E3 desmatriculados y
  eliminados vía `students-mcp` (verificado: ya no aparecen en el roster de
  Grupo A). **Pendiente:** cerrar las sesiones de asistencia abiertas en
  Grupo A y Grupo B desde la UI — `attendance-mcp` es de solo lectura, no hay
  endpoint de API para `closeSession`.
  - Cerrar todas las sesiones de asistencia abiertas durante la ronda.
  - Desmatricular y eliminar E1, E2 y E3 vía `students-mcp`
    (`unenroll_student` → `delete_student`), en orden inverso a su creación.
  - Eliminar los cursos académicos creados solo para esta ronda (si aplica).
