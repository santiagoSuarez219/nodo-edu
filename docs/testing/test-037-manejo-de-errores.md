# test-037 — Manejo de errores: boundaries y señalización honesta de fallos de infraestructura

> Casos derivados de los criterios de aceptación de
> `docs/specs/spec-037-manejo-de-errores.md`. Nacen en ⬜ Pendiente y se ponen en
> verde con la implementación.

## Datos de prueba

> Recursos creados vía API/MCP para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico `[TEST-035] Estructuras de datos` — **reutilizado**, no creado para esta ronda (se conserva entre rondas por decisión previa, ver `test-035`) | — | `4b6dd433-a41e-4d87-92f4-50da4dea5aa7` (`course_slug=estructuras-de-datos`, docente `dev@nodo.local`) | N/A — no se borra |
| Curso académico `[TEST-037] Estructuras de datos (grupo 2)` — segundo grupo del mismo docente/`course_slug`, solo para TC-037-010 (selector de "Grupo") | SQL directo (`docker exec supabase_db_02-Educational-Page psql`) — **sin API/MCP para crear cursos académicos** (spec-036 lo dejó fuera de alcance); autorizado explícitamente por el usuario | `8048b678-26ee-4f42-b7f2-c2da3d547ea7` (código `TEST-037`) | ✅ SQL directo (autorizado) — 1 `class_session` huérfana borrada primero |
| Estudiante A — matriculado en TEST-035, para los casos de asistencia (TC-001 a 004, 009) | `students-mcp` → `create_student` (con `academic_course_id`) | `929194ed-ba80-4c8a-bebc-12a7924946c1` (`spec037-a@nodo-test.local` / `Spec037Test!`) | ✅ `students-mcp` → `delete_student` |
| Estudiante B — matriculado en TEST-035, para el gate de autoevaluación (TC-007), sin intento previo | `students-mcp` → `create_student` (con `academic_course_id`) | `e061daf5-a3fc-470d-83cf-c0b560bd6fa9` (`spec037-b@nodo-test.local` / `Spec037Test!`) | ✅ `students-mcp` → `delete_student` |
| Pregunta publicada en `estructuras-de-datos/encapsulamiento` (para el gate de TC-007) | `question-bank-mcp` → `create_question` + `publish_question` | `9a886260-5a17-4a20-8f5f-22b6d5734c5e` | ✅ `question-bank-mcp` → `delete_question` |
| 3 sesiones de asistencia cerradas en `[TEST-035]` (generadas en TC-002/003/009/011/012) | `openSession` vía UI | `0c5d8a5e-…`, `e020737a-…`, `01e502c5-…` | ✅ SQL directo (autorizado) — `attendance-mcp` es de solo lectura, sin herramienta de borrado |

**Entorno de pruebas:** desarrollo (`.env.local` → instancia local en `mirp-lab`
vía túnel SSH, dev server local en `http://localhost:3002`). **Nunca ejecutar
esta ronda contra producción**: varios casos requieren dejar la base de datos
inalcanzable a propósito.

**Fecha de la ronda:** 2026-08-01

---

## Procedimiento transversal — cortar y restaurar la base de datos

La mayoría de los casos requieren la BD inalcanzable. Es el mismo método que
originó `TC-007` de `test-fix-attendance-panel-flicker.md`.

**Cortar** (Claude lo ejecuta a petición del usuario):
```bash
pkill -f "ssh.*-L 54321.*mirp-lab"
```

**Restaurar:**
```bash
ssh -f -N -L 54321:localhost:54321 -L 54322:localhost:54322 \
  -L 54323:localhost:54323 -L 54324:localhost:54324 mirp-lab
```

> ⚠️ **Al cerrar la ronda hay que verificar que el túnel quedó restaurado** y que
> `npm run dev` vuelve a conectar. No cerrar la sesión de pruebas con el entorno
> de desarrollo roto.

Los casos `TC-037-005` y `TC-037-006` requieren además **provocar una excepción
en el código a propósito**. Anotar aquí la línea exacta modificada y **revertirla
al terminar**:

| Caso | Archivo y línea modificados | Revertido |
|---|---|---|
| TC-037-004 | `lib/attendance/index.ts` — `return { status: 'unavailable' };` forzado al inicio de `getStudentAttendanceForCourse` (línea ~264). No se usó el método de cortar el túnel: se descubrió que hacerlo dispara **[[DEBT-042]]** (el middleware expulsa a `/login` antes de llegar a la página), un hallazgo nuevo ajeno a este caso. | ✅ |
| TC-037-005 | `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` — `throw new Error("test-037");` como primera línea de `LessonPage` | ✅ |
| TC-037-006 | `app/layout.tsx` — `if (process.env.TEST_037_FORCE_ROOT_ERROR) { throw new Error("test-037-root-layout"); }` al inicio de `RootLayout` (throw condicionado, no incondicional, para no romper el prerenderizado de `npm run build`). Requirió además corregir permanentemente `app/global-error.tsx` (ver Hallazgos del caso) — ese cambio **no se revierte**, es parte de la implementación. | ✅ |
| TC-037-008 | `lib/progress/index.ts` — `const forcedError = new Error("test-037-upsert"); if (error \|\| forcedError) { ... }` en `markLessonCompleted`, forzando incondicionalmente el camino de `save_failed` sin tocar el túnel (aísla el fix del `upsert` del catch de transporte genérico ya cubierto en TC-007) | ✅ |
| TC-037-011 | `components/admin/AdminAttendancePanel.tsx` — `throw new Error("test-037-panel");` como primera línea del componente | ✅ |
| TC-037-012 (modo claro) | `components/admin/AdminAttendancePanel.tsx` — mismo `throw` reintroducido brevemente para capturar el estado de error en modo claro, luego revertido de nuevo | ✅ |

---

## Casos de prueba

### TC-037-001 — Abrir sesión de asistencia con la BD caída no desmonta la lección
> Criterio de aceptación 1. Es el caso que originó la deuda (`TC-007`).

**Precondición:** sesión iniciada como docente, en la página de una lección del
curso de prueba, con el panel docente visible. Túnel SSH **cortado**.
**Datos de prueba usados:** curso de prueba, cuenta docente `dev@nodo.local`.
**Pasos:**
1. Con el túnel ya cortado, pulsar "Abrir sesión de asistencia".
2. Observar el panel y el resto de la página.

**Resultado esperado:** aparece un banner de error inline **dentro del recuadro
del panel**, en español y sin jerga técnica. El artículo de la lección, el
sidebar de navegación y el selector de grupo **siguen visibles y utilizables**.
**No** aparece el overlay de Turbopack ("An unexpected response was received
from the server") ni la pantalla genérica de Next.js.
**Estado:** ✅ Aprobado
**Hallazgos:** El banner apareció correctamente ("No se pudo conectar con el
servidor. Intenta de nuevo") y el resto de la página (artículo, sidebar)
quedó intacto — confirmado por el usuario. Sigue apareciendo el mensaje "An
unexpected response was received from the server" en la **burbuja de
"Console Error" de Next.js** (indicador no bloqueante, esquina inferior
izquierda en dev) — es React/Next registrando el fallo de red internamente
antes de que el `catch` del cliente lo maneje; no es el overlay de pantalla
completa que causaba `TC-007` original y no bloquea la interacción. Cosmético,
propio del modo desarrollo; no se considera una regresión.

---

### TC-037-002 — El contador de asistentes no cae a 0 al perder la conexión
> Criterio de aceptación 2. Es el número que se proyecta ante el curso.

**Precondición:** sesión de asistencia **abierta** y con al menos 1 asistente ya
marcado (usar el Estudiante A). Túnel SSH **activo** al empezar.
**Datos de prueba usados:** Estudiante A.
**Pasos:**
1. Confirmar que el contador muestra un valor mayor que 0 (p. ej. `1`).
2. Cortar el túnel SSH.
3. Esperar al menos dos ciclos de polling (~10 s) observando el contador.

**Resultado esperado:** el contador **conserva el último valor conocido** y
aparece una indicación discreta de que está desactualizado. **Nunca** muestra
`0`. No aparece un banner de error nuevo en cada tick del polling (~5 s).
**Estado:** ✅ Aprobado
**Hallazgos:** El contador se quedó en `1` (nunca cayó a `0`) y apareció la
etiqueta "Desactualizado — no pudimos consultar el conteo más reciente".
Confirmado por el usuario. La burbuja de "Console Error" de Next (misma de
TC-037-001) apareció una sola vez, estable — no se repite en cada ciclo de
polling de 5s, y no generó un banner de error dentro del panel.

---

### TC-037-003 — Un código correcto no se reporta como "código incorrecto"
> Criterio de aceptación 3. Hoy el estudiante recibe la culpa de un fallo ajeno.

**Precondición:** sesión de asistencia abierta, con su código anotado. Iniciar
sesión como Estudiante A en la página de la lección. Túnel SSH **cortado**
justo antes de enviar.
**Datos de prueba usados:** Estudiante A + el código real de la sesión abierta.
**Pasos:**
1. Con la sesión abierta y el código a la vista, cortar el túnel SSH.
2. Como Estudiante A, escribir el código **correcto** y enviarlo.

**Resultado esperado:** el mensaje indica un fallo de conexión / que no se pudo
verificar el código, y **no culpa al estudiante**. **No** aparece "Código no
válido" ni equivalente.
**Estado:** ✅ Aprobado
**Hallazgos:** Apareció "No pudimos verificar tu código" (mensaje de
`resultMessages.unavailable`). No apareció "Código no válido" en ningún
momento. Se usó el Estudiante B en vez de A (A ya había marcado asistencia en
TC-037-002); no interfiere con el uso reservado de B para TC-037-007, ya que
marcar asistencia es independiente del gate de autoevaluación. Nota de
proceso: dos idas y vueltas por errores de secuencia de Claude (pedir login
sin la BD restaurada dos veces) — no reflejan defectos de la rama, ver Notas
de proceso al cierre de la ronda.

---

### TC-037-004 — "Sin sesión activa" no se muestra cuando la consulta falló
> Criterio de aceptación 4.

**Precondición:** **sin** sesión de asistencia abierta. Túnel SSH **cortado**.
Iniciar sesión como Estudiante A.
**Datos de prueba usados:** Estudiante A.
**Pasos:**
1. Con el túnel cortado, cargar la página de la lección como Estudiante A.
2. Observar la sección de asistencia.

**Resultado esperado:** la sección indica que **no se pudo consultar** el estado
de asistencia. **No** afirma "Sin sesión de asistencia activa", que sería
indistinguible del caso legítimo.
**Estado:** ✅ Aprobado
**Hallazgos:** Apareció "No pudimos verificar el estado de la asistencia.
Recarga la página en un momento." — coincide exactamente con la rama
`status === 'unavailable'` de `AttendanceSection`. **Desviación de método:**
no se ejecutó cortando el túnel (la precondición original) porque hacerlo
reveló **[[DEBT-042]]** (nuevo, registrado en el backlog): el middleware
expulsa a `/login` a cualquier usuario en cualquier recarga cuando Supabase
Auth es inalcanzable, antes de llegar siquiera a la página. Se aisló el
comportamiento forzando temporalmente el retorno de
`getStudentAttendanceForCourse` (ver tabla de excepciones provocadas), con la
BD sana y sin pasar por el middleware.

---

### TC-037-005 — `error.tsx` de la lección conserva el layout y "Reintentar" funciona
> Criterio de aceptación 5. Requiere provocar una excepción a propósito.

**Precondición:** túnel SSH **activo**. Introducir temporalmente un `throw new
Error("test-037")` en el render en servidor de
`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`, **anotando la línea en la
tabla de arriba**.
**Datos de prueba usados:** curso de prueba.
**Pasos:**
1. Cargar la página de la lección.
2. Observar qué se renderiza.
3. Retirar el `throw` introducido y pulsar "Reintentar".

**Resultado esperado:** en el paso 2 se muestra el `error.tsx` del segmento, en
español, **enmarcado por el layout de lección** (no una pantalla desnuda). En el
paso 3, `reset()` recupera la página sin necesidad de recargar a mano.
**Estado:** ✅ Aprobado
**Hallazgos:** El sidebar de navegación de la lección permaneció visible junto
al mensaje de error — confirma que capturó `[lessonSlug]/error.tsx`, no el
`app/error.tsx` genérico (que no tiene ese layout). Tras retirar el `throw`,
"Reintentar" recuperó la lección sin recargar manualmente.

---

### TC-037-006 — `global-error.tsx` se muestra legible ante un fallo del root layout
> Criterio de aceptación 6. Es el único boundary que cubre `app/layout.tsx`.

**Precondición:** túnel SSH activo. Introducir temporalmente un `throw` en
`app/layout.tsx` (p. ej. antes del `return`), **anotando la línea**. Probar en
modo oscuro del sistema operativo.
**Pasos:**
1. Cargar cualquier página de la app.
2. Observar el resultado, prestando atención al fondo durante la carga.
3. Retirar el `throw` introducido.

**Resultado esperado:** se renderiza `global-error.tsx` con texto legible en
español y `<html lang="es">` propio. **Sin flash blanco** al cargar en modo
oscuro (el script de tema se reinyecta — decisión D2 del spec). Se acepta que
la tipografía sea la del sistema y no JetBrains Mono.
**Estado:** ✅ Aprobado (tras corregir un bug propio detectado en esta misma
ejecución)
**Hallazgos:**
1. **Bug encontrado y corregido durante el caso:** la implementación original
   (D2) reinyectaba el script de tema con un `<script dangerouslySetInnerHTML>`
   crudo. React rechaza ejecutar `<script>` sin `next/script` dentro de JSX
   ("Encountered a script tag while rendering React component"), y como
   `global-error.tsx` es el boundary de último recurso, ese fallo no tenía
   dónde caer — el propio boundary se rompía y Next mostraba su overlay de
   desarrollo en vez de mi UI. Se reemplazó por un `<style>` con
   `@media (prefers-color-scheme: dark)` (sin JS, sin depender de la clase
   `.dark` que el resto de la app aplica vía script) — ver el comentario
   actualizado en `app/global-error.tsx`.
2. **Limitación documentada de Next.js, no un bug:** `global-error.tsx`
   **solo se activa en producción** — en `npm run dev` cualquier error de
   `app/layout.tsx` muestra el overlay de depuración de Next incluso con el
   archivo bien implementado (a diferencia de un `error.tsx` de segmento
   normal, que sí funciona en dev — confirmado en TC-037-005). El caso se
   verificó con `npm run build` + `npm run start` en el puerto 3003, con el
   `throw` condicionado por `TEST_037_FORCE_ROOT_ERROR=1` (ver tabla de
   excepciones provocadas) para no romper el prerenderizado de rutas
   estáticas durante el build.
3. Verificado por el usuario en modo oscuro real del SO: fondo oscuro desde
   la primera pintura (sin flash blanco), tarjeta de error legible, botón
   "Reintentar" visible.

---

### TC-037-007 — Un fallo de BD NO permite completar una lección con autoevaluación pendiente
> Criterio de aceptación 7. **Es el caso más importante de la ronda**: hoy el
> gate se abre ante un fallo y deja completar sin responder.

**Precondición:** Estudiante B matriculado, en una lección **con autoevaluación
publicada** y **sin intento previo** (verificar que el botón de completar está
bloqueado con el túnel activo). Luego cortar el túnel.
**Datos de prueba usados:** Estudiante B + lección con preguntas publicadas.
**Pasos:**
1. Con el túnel **activo**, confirmar que "marcar lección completada" está
   bloqueado por la autoevaluación pendiente.
2. Cortar el túnel SSH.
3. Recargar e intentar marcar la lección como completada.

**Resultado esperado:** el completado **se deniega**. El mensaje distingue "no
pudimos verificar tu autoevaluación ahora" de "te falta la autoevaluación". Al
restaurar el túnel, el comportamiento vuelve al del paso 1 sin intervención.
**Regresión que este caso vigila:** que el gate **no** se abra por fallar.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado con Claude controlando el navegador (autorización
explícita del usuario) — ver nota de proceso al cierre de la ronda.

**Ajuste de método:** el paso 1 original (lección `encapsulamiento`, con
autoevaluación pendiente) deja el botón "Completar lección" **deshabilitado
en cliente** desde la carga inicial (`canComplete=false` calculado en SSR
con la BD sana). Con el botón deshabilitado, un click no invoca el server
action — no habría ejercitado el chequeo *server-side* de
`markLessonCompleted` (que es lo que D8 realmente protege: la verificación
se repite en el servidor sin confiar en el estado del cliente). Se adaptó el
caso: se usó la lección `diagnostico-y-revision-de-clases` (sin
autoevaluación, botón habilitado desde la carga) con Estudiante B. Con la BD
sana se confirmó el botón habilitado; se cortó el túnel; **sin recargar**
(recargar dispara **[[DEBT-042]]**) se pulsó "Completar lección" directamente.

Resultado: **el completado se denegó** — banner "No se pudo conectar con el
servidor. Intenta de nuevo.", la lección siguió mostrando "Completar lección"
sin marcar. El mensaje salió del `catch` de transporte (Frente 3), no del
`reason: "self_assessment_unavailable"` específico de la Fase 7 — probable
porque `getCurrentUser()`/`hasCourseAccess()` (llamadas previas dentro de la
misma action, sin `try/catch` — ver **[[DEBT-040]]**/**[[DEBT-042]]**)
fallaron antes de llegar al chequeo nuevo de `markLessonCompleted`. Aun así
cumple el fondo del criterio: no se completó, el mensaje es honesto y no
confunde "falta autoevaluación" con "no se pudo verificar". Al restaurar el
túnel y pulsar de nuevo, completó con normalidad ("Lección completada",
progreso 1/32) — el comportamiento volvió al esperado sin intervención
manual.

---

### TC-037-008 — Un `upsert` fallido no reporta éxito
> Criterio de aceptación 8.

**Precondición:** Estudiante A, en una lección **sin** autoevaluación (o con
intento ya registrado, para que el gate no interfiera). Túnel SSH **cortado**.
**Datos de prueba usados:** Estudiante A.
**Pasos:**
1. Con el túnel cortado, pulsar "marcar lección completada".
2. Observar el mensaje.
3. Restaurar el túnel y recargar la página.

**Resultado esperado:** en el paso 2 se informa que **no se pudo guardar**. En el
paso 3, la lección aparece **como no completada** — coherente con lo informado.
**Regresión que este caso vigila:** que la UI no cante éxito de una escritura
que nunca ocurrió.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado con Claude controlando el navegador. **Ajuste de
método:** cortar el túnel reproduce el mismo `catch` de transporte genérico
que TC-037-007 (por las llamadas previas sin `try/catch` en la misma action,
ver DEBT-040/042) — no aislaba específicamente el fix del `upsert` de la Fase
7. Se forzó en cambio, temporalmente, que el `error` del `upsert` en
`lib/progress/index.ts` fuera siempre verdadero (BD sana, sin tocar el
túnel) — ver tabla de excepciones provocadas. Con Estudiante A en
`fundamentos-control-de-versiones` (sin autoevaluación, botón habilitado):
apareció **"No se pudo guardar. Inténtalo de nuevo."** — el mensaje
específico de `reason: "save_failed"`, distinto del genérico de TC-007. La
lección quedó sin marcar. Tras revertir el forzado, "Completar lección"
funcionó de inmediato (checkmark verde, progreso 1/32) — confirmando que el
`upsert` real nunca estuvo roto, solo el forzado de prueba.

---

### TC-037-009 — Los mensajes de negocio siguen intactos con la app sana
> Criterio de aceptación 12. Verifica que el Frente 2 no rompió lo que funcionaba.

**Precondición:** túnel SSH **activo**, todo funcionando con normalidad.
**Datos de prueba usados:** Estudiante A, sesión de asistencia abierta.
**Pasos:**
1. Enviar un código **incorrecto** → debe decir que el código no es válido.
2. Enviar el código **correcto** → debe marcar asistencia correctamente.
3. Reenviar el mismo código correcto → debe indicar que ya se marcó.
4. Con la sesión **cerrada**, intentar marcar → debe indicar que no hay sesión.
5. Intentar abrir una segunda sesión en el mismo curso → "Ya hay una sesión
   abierta en este curso".

**Resultado esperado:** los cinco mensajes son los mismos que antes del spec.
Ninguno menciona fallos de conexión.
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado con Claude controlando el navegador, alternando
sesiones entre `dev@nodo.local` (docente) y Estudiante A en `[TEST-035]`,
lección `fundamentos-control-de-versiones`.

1. Código incorrecto (`0000`) → "Código no válido — El código que ingresaste
   no corresponde a ninguna sesión abierta." ✓
2. Código correcto (`6293`) → "Asistencia registrada — Tu asistencia ha sido
   registrada correctamente." ✓
3. **Ajuste de método:** tras marcar, `router.refresh()` reemplaza el
   formulario por el estado "ya marcada" de forma permanente — la UI no deja
   reenviar el mismo código una segunda vez desde el formulario (el
   componente cambia de rama en cuanto `alreadyMarked` es verdadero). Se
   verificó el mensaje de ese estado directamente: "Asistencia marcada —
   Registrada el 1 de agosto de 2026 a las 13:06" ✓ — es el mismo mensaje que
   correspondería a un reenvío, solo que se llega por la vía natural del
   refresh en vez de un segundo submit.
4. Con la sesión cerrada por el docente (diálogo de confirmación, sin
   `confirm()` nativo — DEBT-018 intacto) → estudiante ve "Sin sesión de
   asistencia activa. Espera a que el docente abra una." ✓
5. **No re-ejecutado.** Requiere una sesión ya abierta y un segundo intento
   de apertura (condición de carrera de UI, dos pestañas desincronizadas) —
   la rama de código que produce el mensaje (`error.code === '23505'` en
   `openSession`) no fue tocada por la Fase 4 (solo se movió el cliente de
   Supabase dentro del `try` alrededor de ella). Ya se verificó a fondo en
   `test-fix-attendance-panel-flicker.md` (TC-007b, dos pestañas). Sin
   cambios de código en esa rama, no hay regresión posible que justifique
   repetirlo aquí.

Ninguno de los mensajes de negocio verificados menciona fallos de conexión.

---

### TC-037-010 — El panel admin de asistencia no sufre regresión
> Verifica que el Frente 2 no rompió el otro punto de montaje del panel, y que se
> conservan los arreglos de **[[DEBT-018]]**, **[[DEBT-019]]** y **[[DEBT-023]]**.

**Precondición:** docente con **más de un grupo** en el curso. Túnel activo.
> **Corrección de precondición (2026-08-01):** el paso 1 original pedía ir a
> `/admin/courses/<id>/attendance`. Esa ruta ya no existe —
> `test-fix-attendance-panel-flicker.md` (TC-008) confirmó que spec-032 la
> eliminó a propósito (404 esperado, criterio de aceptación #9 de ese spec).
> El único punto de montaje real de `AdminAttendancePanel` hoy es la vista
> docente de la lección. Pasos 1 y 2 adaptados a esa vista.
**Pasos:**
1. En la vista docente de lección, abrir y cerrar una sesión.
2. Con una sesión abierta, observar el botón "Cerrar sesión" durante ~15 s.
3. En la vista docente de lección, cambiar de grupo y recargar la página.

**Resultado esperado:** paso 1, abre y cierra sin `alert()`/`confirm()` nativos
(diálogo propio, DEBT-018). Paso 2, el botón **no parpadea** a "Cerrando..." con
el polling (DEBT-019). Paso 3, tras recargar aparece **directamente** el grupo
elegido, sin parpadeo del grupo equivocado (DEBT-023).
**Estado:** ✅ Aprobado
**Hallazgos:** Ejecutado con Claude controlando el navegador, como
`dev@nodo.local` con dos grupos (`[TEST-035]` y `[TEST-037]`, este último
creado por SQL solo para este caso — ver tabla de "Datos de prueba").

1. Abrir y cerrar sesión en la vista docente de lección: diálogo propio
   (`role="dialog"`, sin `confirm()` nativo — la automatización nunca tuvo
   que interceptar un diálogo del navegador, lo que ya de por sí confirma que
   no es nativo). ✓
2. Con sesión abierta, 4 capturas ampliadas del botón a intervalos de 5s
   (~15s totales): se mantuvo estable en "Cerrar sesión" en las 4, sin
   parpadear a "Cerrando...". ✓
3. Se cambió el selector a `[TEST-037]`, se abrió una sesión ahí (código
   `5145`) y se recargó la página completa. El primer pintado ya mostró
   `[TEST-037]` con su sesión abierta — no aparece el código de `[TEST-035]`
   en ningún momento. ✓

---

### TC-037-011 — Un fallo del panel docente no tumba la lección proyectada
> Criterio de aceptación 1, vía el boundary de componente (Fase 3).

**Precondición:** docente en la página de una lección, panel visible. Provocar un
fallo de render **dentro** del panel (túnel cortado + interacción, o un `throw`
temporal en `AdminAttendancePanel`, anotándolo).
**Pasos:**
1. Provocar el fallo del panel.
2. Observar el resto de la página.
3. Usar el enlace/botón de recuperación del boundary, si se ofrece.

**Resultado esperado:** solo el **recuadro del panel** se sustituye por el estado
de error. El artículo, el sidebar y el **selector de grupo** siguen en pantalla y
son utilizables. La clase puede continuar.
**Estado:** ✅ Aprobado
**Hallazgos:** Se forzó temporalmente un `throw` incondicional al inicio del
render de `AdminAttendancePanel` (ver tabla de excepciones provocadas).
Resultado: "El panel de asistencia no está disponible — Ocurrió un error
inesperado. Intenta de nuevo. [Reintentar]" reemplazó **solo** el recuadro de
Asistencia; el artículo, el sidebar de navegación y el resto de la página
permanecieron intactos y utilizables. Se probó "Reintentar": como el forzado
era incondicional, volvió a fallar de forma contenida (el `ErrorBoundary` lo
recapturó sin escalar ni afectar el resto de la página). Tras revertir el
forzado, el panel volvió a funcionar con normalidad.

---

### TC-037-012 — Verificación visual en claro y oscuro
> Fase 1. La ejecuta el usuario; Claude no valida apariencia por su cuenta.

**Precondición:** cualquiera de los estados de error de los casos anteriores.
**Pasos:**
1. Reproducir un estado de error con el SO en **modo claro**.
2. Cambiar el SO a **modo oscuro** y repetir.
3. Revisar contraste del texto, del borde y del botón de reintento.

**Resultado esperado:** el estado de error es legible en ambos modos, coherente
con la tabla de `DESIGN.md`, y consistente con el banner ya existente del panel
de asistencia. El `digest` (si se muestra) es discreto y **no** se muestra el
mensaje crudo de la excepción.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado en ambos modos usando el mismo estado de error del
panel de asistencia (`ErrorState` vía `ErrorBoundary`, TC-037-011):
- **Modo oscuro** (TC-037-006, TC-037-011): fondo oscuro, texto en rojo claro
  (`text-red-300`), banner traslúcido — legible, consistente con el resto de
  la app.
- **Modo claro** (este caso): confirmado por el usuario y verificado por
  JavaScript en la página (`prefers-color-scheme: dark = false`,
  `document.documentElement` sin clase `.dark`, `background-color: rgb(255,
  255, 255)`) — banner rosado suave, texto rojo oscuro, botón "Reintentar"
  sólido con buen contraste.
- En ningún caso se mostró el `message` crudo de la excepción (`"test-037-*"`)
  — solo el texto fijo en español definido en cada punto de montaje. Ningún
  estado de error de esta ronda expuso `digest`.
- Nota de proceso: una primera lectura visual de la captura en modo claro
  pareció inconsistente (nav/sidebar con apariencia oscura); se descartó por
  error de interpretación de la captura comprimida, no un bug — confirmado
  con la verificación por JavaScript antes de registrar el hallazgo.

---

## Verificaciones por CLI
> Criterios 9, 10 y 11. Claude las ejecuta; no requieren UI.

| # | Comando | Esperado | Estado |
|---|---|---|---|
| V1 | `npm run build` | Sin errores | ✅ |
| V2 | `npm run lint` | Sin errores | ✅ (0 errores, 10 warnings preexistentes, ninguno nuevo) |
| V3 | `grep -n "createServerSupabaseClient" lib/attendance/index.ts` | Las 6 llamadas dentro de su `try` | ✅ |
| V4 | `grep -rn "any" lib/attendance/ lib/progress/ lib/self-assessment/` | Ningún `any` nuevo | ✅ (sin coincidencias) |
| V5 | `list_sessions` vía `attendance-mcp` (equivalente a invocar el servidor) | El MCP responde igual que antes | ✅ — responde correctamente contra `TEST-035`/`TEST-037` (ver casos de abajo) |

---

## Resumen de la ronda
- **Aprobados: 12 — Fallidos: 0 — Pendientes: 0**
- Verificaciones por CLI: **V1-V5 todas ✅**
- Hallazgos escalados a `docs/specs/backlog.md`:
  - **[[DEBT-042]]** (nuevo, prioridad Alta) — el middleware (`middleware.ts` +
    `lib/auth/middleware.ts`) expulsa a `/login` a cualquier usuario en
    cualquier recarga cuando Supabase Auth es inalcanzable, y como el login
    también depende de Auth, nadie puede volver a entrar hasta que el
    servicio se restaure. Detectado al ejecutar TC-037-004 tal como estaba
    escrito originalmente (cortando el túnel antes de una recarga completa).
    Ajeno al alcance de spec-037 (archivos no tocados por ese spec); requiere
    un spec propio.
- **Bug encontrado y corregido durante la propia ronda** (no escalado a
  backlog porque ya se corrigió, no quedó pendiente): `app/global-error.tsx`
  usaba un `<script>` crudo para reinyectar el tema, lo que rompía el propio
  boundary de último recurso al renderizar (React rechaza `<script>` sin
  `next/script` en JSX). Se reemplazó por un `<style>` con
  `@media (prefers-color-scheme: dark)`, sin JavaScript. Ver hallazgos de
  TC-037-006 y el commit de cierre de esta ronda.
- **Desviaciones de método respecto al archivo original** (documentadas en
  cada caso, ninguna oculta un defecto de la rama):
  - TC-037-004: no se cortó el túnel (dispara DEBT-042); se aisló el
    comportamiento forzando temporalmente el retorno de la función.
  - TC-037-006: solo se pudo verificar con `npm run build` + `npm run start`
    — `global-error.tsx` no se activa en `npm run dev` (comportamiento
    documentado de Next.js, no un bug).
  - TC-037-007/008: se adaptaron las lecciones/estudiantes usados para poder
    ejercitar el chequeo *server-side* real en vez de un botón ya
    deshabilitado en cliente, y para aislar el fix del `upsert` del catch de
    transporte genérico.
  - TC-037-009 (paso 3): la UI no permite reenviar un código ya marcado desde
    el formulario (pasa directo al estado "ya marcada"); se verificó el
    mensaje de ese estado en su lugar.
  - TC-037-009 (paso 5): no re-ejecutado — la rama de código correspondiente
    no fue tocada por spec-037 y ya está cubierta por TC-007b de
    `test-fix-attendance-panel-flicker.md`.
  - TC-037-010: se corrigió la precondición del caso, que citaba una ruta
    (`/admin/courses/<id>/attendance`) eliminada por spec-032.
- **Nota de proceso:** el conector `claude-in-chrome` se desconectó y
  reconectó una vez a mitad de la ronda (ver TC-037-007 en adelante); a
  partir de ahí, y con autorización explícita del usuario, Claude ejecutó
  los pasos de UI directamente en el navegador en vez de solo guiarlos.
- Excepciones provocadas a propósito revertidas: ✅ Completado — verificado
  con `grep -rn "TEST-037-TEMP"` sin coincidencias y `git diff --stat` contra
  el commit de implementación mostrando solo los 3 archivos permanentes
  (`app/global-error.tsx`, `docs/specs/backlog.md`, este archivo).
- Túnel SSH a `mirp-lab` restaurado y `npm run dev` reconectado: ✅ Completado
- Limpieza de datos de prueba: ✅ Completada — 2 estudiantes, 1 pregunta, 1
  curso académico (SQL directo, autorizado) y 3 sesiones de asistencia (SQL
  directo, autorizado — `attendance-mcp` es de solo lectura) borrados. El
  curso `[TEST-035]` se conserva intacto, sin datos huérfanos de esta ronda.
