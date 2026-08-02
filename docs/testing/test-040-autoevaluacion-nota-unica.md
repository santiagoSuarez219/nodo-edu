# test-040 — Autoevaluación de intento único y nota acumulada del curso

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|----------------------|---------------|-----------|
| Docente de desarrollo sembrado (dueño del curso académico de pruebas) | ya existe — `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | N/A (cuenta base de desarrollo) |
| Curso del catálogo usado en la ronda | contenido versionado en git, no se crea | `analisis-de-algoritmos` | N/A |
| Lección **L1** | contenido existente | `analisis-de-algoritmos` / `sintaxis-de-python` | N/A |
| Lección **L2** | contenido existente | `analisis-de-algoritmos` / `fundamentos-control-de-versiones-y-flujo-de-trabajo` | N/A |
| Lección **L3** | contenido existente | `analisis-de-algoritmos` / `algoritmos-como-tecnologia` | N/A |
| Lección **L4** | contenido existente | `analisis-de-algoritmos` / `notacion-o-theta-y-omega` | N/A |
| Lección **L5** | contenido existente | `analisis-de-algoritmos` / `analisis-de-algoritmos-y-divide-y-venceras` | N/A |
| Lección **L6** (la "sexta lección" de los criterios 6 y 7) | contenido existente | `analisis-de-algoritmos` / `como-resolver-recurrencias` | N/A |
| Lección **L7** (reserva: pregunta publicada tarde, TC-015) | contenido existente | `analisis-de-algoritmos` / `heaps-y-heapsort` | N/A |
| Lección **L8** (reserva: filtro de spec-039, TC-021) | contenido existente | `analisis-de-algoritmos` / `tablas-hash` | N/A |
| Curso académico **Grupo A** (`course_slug=analisis-de-algoritmos`, docente dueño `dev@nodo.local`) | inserción directa vía `service_role` (no existe MCP/API para crear cursos académicos; autorizado explícitamente por el usuario, 2026-08-02) | `cd8473b6-378a-41e5-8e02-65dce18bcdc7` (código `S040A000`) | ⬜ |
| Curso académico **Grupo B** (mismo `course_slug`, mismo docente) — para TC-022 | inserción directa vía `service_role` (mismo motivo) | `96f2817e-08ff-4fc3-ab4c-6b9c94eacab8` (código `S040B000`) | ⬜ |
| Segundo docente **D2**, dueño de **ningún** curso de la ronda — para TC-017 | Supabase Auth + `user_roles` vía `service_role` (autorizado explícitamente, 2026-08-02) | `955161eb-e191-4e56-9b2f-9ef2f26e8e61` — `test-teacher-spec040@nodo.test` / `TestTeacher040!` | ⬜ |
| Estudiante **E1** (recorrido principal: L1–L6, criterios 5/6/7) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `c0df2ab1-4417-420a-a6f9-6cd3b2de7967` — `test-e1-spec040@nodo.test` / `TestStudent040!`, enrollment `307bc0e8-e152-4db1-bab8-7c55b4899995` | ⬜ |
| Estudiante **E2** (envíos concurrentes TC-007 y "vio sin responder" TC-015) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `ddbffc3a-b08b-4b47-bc1e-5275b7584599` — `test-e2-spec040@nodo.test` / `TestStudent040!`, enrollment `52d0ead1-93e8-4235-9efd-cfa3eb831a5f` | ⬜ |
| Estudiante **E3** (denominador 0 — nunca abre una lección con preguntas) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `e5ef486d-498d-4f17-9191-9c4377c65c80` — `test-e3-spec040@nodo.test` / `TestStudent040!`, enrollment `0502b094-d63b-4069-84b1-40f1b5d4be05` | ⬜ |
| Estudiante **E4** (segundo envío por Server Action TC-006 y recálculo masivo TC-016) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `aa26ed06-0e91-4425-a898-daac2ff3c17e` — `test-e4-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Estudiante **E5**, matriculado activo **a la vez** en Grupo A y Grupo B — para TC-022 | `students-mcp` → `create_student` + dos `enroll_student` | `cc8e091b-f1bf-48db-8218-02dfbb994709` — `test-e5-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Estudiante **E6**, matriculado activo en Grupo A — **se retira durante TC-022, no antes** (necesita ver/responder una lección primero) | `students-mcp` → `create_student` + `enroll_student`; el `unenroll_student` se ejecuta en vivo como parte de TC-022 | `b94edcb1-c766-47bc-847a-63c786351a45` — `test-e6-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Preguntas `multiple_choice` publicadas de L1–L6: **5 por lección, 30 en total** | `question-bank-mcp` → `create_question` + `publish_question` | ver tabla "Preguntas creadas" más abajo | ✅ |
| Preguntas `multiple_choice` publicadas de L7: **5** (necesarias para TC-011, no solo para P32) | `question-bank-mcp` → `create_question` + `publish_question` | ver tabla "Preguntas creadas" más abajo | ✅ |
| Pregunta **P31**, a publicar en L1 **después** de que E1 responda — para TC-015 | **No creada aún**: crear y publicar es el propio paso 1 de TC-015, se ejecuta en vivo con `question-bank-mcp` durante el caso | `{{question_id_P31}}` | ⬜ |
| Pregunta **P32**, a publicar en L7 después de que E2 la vea — para TC-015 | **No creada aún**: ídem, paso 2 de TC-015 | `{{question_id_P32}}` | ⬜ |
| Preguntas de L8 (5), creadas como **borrador sin publicar** — para el filtro de spec-039, TC-021 | `question-bank-mcp` → `create_question` (sin `publish_question`; TC-021 las publica si spec-039 está mergeado, o el caso se marca "No aplica") | ver tabla "Preguntas creadas" más abajo | ✅ (creadas, sin publicar) |
| Intentos duplicados sembrados en `self_assessment_attempts` **antes** de la migración de dedupe — para TC-019 | inserción directa en la base de **desarrollo** (por diseño ya no existe endpoint que los produzca tras la Fase 1) — **requiere tu autorización explícita en el momento de ejecutar ese caso**, no se creó en esta pasada | 3 filas para `(test-e2-spec040@nodo.test, analisis-de-algoritmos, sintaxis-de-python)` | ⬜ |
| Ítem `grade_items` `kind='self_assessment'` creado por el propio RPC | se crea solo (creación perezosa, D5) | `{{grade_item_id}}` (nombre inicial "Autoevaluaciones") | ⬜ |

**Entorno de pruebas:** desarrollo — Supabase local corriendo en `mirp-lab` a través del túnel SSH (ver `CLAUDE.md` → "Base de datos"), con `npm run dev` en esta máquina (puerto **3002**) y `students-mcp` / `question-bank-mcp` en su variante **local**. **Ningún caso de esta ronda se ejecuta contra producción.**
**Fecha de la ronda:** 2026-08-02

### ⚠️ Patrón de respuesta correcta — leer antes de responder cualquier pregunta

Las 40 preguntas de control creadas para esta ronda (L1–L8) tienen **siempre la
misma estructura**: 4 opciones de una sola respuesta correcta, y **la opción
correcta es siempre la tercera ("C")**, con el texto literal
`"Esta es la opción correcta (C)"`. Las otras tres dicen `"Opción incorrecta
A"`, `"Opción incorrecta B"` y `"Opción incorrecta D"`. Esto permite alcanzar
cualquier puntaje exacto (p. ej. "4 de 5 en L1") marcando la opción C en las
preguntas que deben acertarse y cualquier otra en las que deben fallarse — sin
tener que memorizar 40 respuestas distintas.

**Excepción:** la pregunta `[QA-038 A-P3]` de `encapsulamiento`
(`estructuras-de-datos`, ronda de spec-038, no de esta) tiene **dos**
respuestas correctas (B y C) — no forma parte del recorrido numérico de
spec-040, se menciona aquí solo para que no se confunda si aparece en el
mismo entorno.

### Preguntas creadas (bloque MCP de esta pasada)

| Lección | P1 | P2 | P3 | P4 | P5 |
|---|---|---|---|---|---|
| L1 `sintaxis-de-python` | `f033ca78-2e38-4cfe-ac96-575022413639` | `e691e7bc-cc66-4944-a9b3-0f335be49934` | `4392f6bb-72e0-4753-8e1c-68041370e386` | `408b8419-1070-425c-9036-2f713753da19` | `a0a65bec-8dba-4aa7-8ee9-11edf4739bd4` |
| L2 `fundamentos-control-de-versiones-y-flujo-de-trabajo` | `b79206d1-ce87-4599-8695-88bb4d551c85` | `f64290fc-ec81-480e-9a3a-af79e41fc5b4` | `aed361e0-b6b7-4116-ac7b-69f60b3e42e2` | `7fb5c3fe-2da5-4911-a5c7-515ca62ffa10` | `6d2df999-ddaa-4de4-9a04-ae222b306f00` |
| L3 `algoritmos-como-tecnologia` | `17cd6f52-d674-41e0-9834-3f4df184d804` | `ddffc759-7700-48ca-bcaf-1e1ecfc04827` | `f052e400-8486-499c-912d-028cd4bdf9dc` | `310fb572-a3fb-4b40-9873-bb1f429bafd2` | `f98f4510-8d2d-4eb2-9b09-c7117441987a` |
| L4 `notacion-o-theta-y-omega` | `4a3837b4-ca5b-4cde-b3e9-c9d422c7ab46` | `87c66082-0171-4270-96b3-03950720d49d` | `ea840db4-751d-46ec-b014-4ca29200709b` | `8c8ce352-ca66-4e87-94ae-4b1573460183` | `9533d935-0959-4ea0-8316-bd1eb99313d3` |
| L5 `analisis-de-algoritmos-y-divide-y-venceras` | `22a99d43-060f-4259-be48-e4890245beb7` | `63fcdd5d-f39d-4bf4-a232-cfe7fb36edb2` | `0b6b05cf-4665-4b5d-9b02-8894bbb9310d` | `b42471c7-4e5c-4cd9-88ea-bb7c6af0c9d3` | `902463a1-b60c-4ef4-ba70-7cf13b8cd417` |
| L6 `como-resolver-recurrencias` | `a4b53a30-733e-4538-b9c5-aa0ec605190c` | `0b41f33b-68c5-4d36-a181-ca0c966217b8` | `386038c7-f1be-4516-aa68-d4f2548bde2e` | `970ef58a-a83b-4040-8c77-a175faa22422` | `b03d0244-696c-4b6c-93dd-c021ece25cd0` |
| L7 `heaps-y-heapsort` | `91700eb4-daa1-43dd-9813-b2653be6be5f` | `d739fe0f-c0e5-404f-90ff-125bfe038b18` | `9a5c76fa-fa3c-404e-884a-390bbd434909` | `35caea0c-d00f-4276-8fb6-04626960ba75` | `beb9c372-f182-4613-969a-ef6f8f32bfc4` |
| L8 `tablas-hash` (**sin publicar**) | `66e61457-ff54-41ac-b1c6-7cab56bd6a1a` | `f9788eae-8c9e-4543-961a-82516deb331a` | `4bf232e8-98ab-4df2-9065-793b524f882a` | `670de360-eef5-403a-8594-10d2ef24cf4f` | `ca45d580-2a6b-4b86-ab07-047e0453ed60` |

---

### ⚠️ Advertencia de irreversibilidad — leer antes de empezar

Este spec convierte la autoevaluación en un **intento único por `(user_id, course_slug, lesson_slug)`**. Consecuencias operativas para esta ronda:

- **Un envío de prueba no se puede repetir.** Una vez que un estudiante envía la autoevaluación de una lección, ese par `(estudiante, lección)` queda **quemado** para el resto de la ronda: no hay botón de reintento, no hay política RLS de `delete` y el spec no incluye una acción de docente para anular intentos.
- Por eso, **cada caso que implique un envío nuevo exige un estudiante nuevo o una lección nueva**. La tabla de arriba asigna deliberadamente seis estudiantes; no reutilizar un par ya usado.
- Si un caso falla a mitad y hay que repetirlo, **crear otro estudiante** con `students-mcp` (`test-eN-spec040@nodo.test`), matricularlo en Grupo A y anotarlo en la tabla de datos de prueba. No intentar "limpiar" el intento borrándolo en base de datos sin autorización explícita del usuario.
- **Orden obligatorio de ejecución**: TC-001 → TC-002 (no consumen envío) → TC-003 en adelante. Ejecutar TC-003 antes que TC-001/TC-002 invalida esos dos casos para E1.

### Preparación previa (antes del primer caso)

1. Confirmar el túnel SSH y que el stack de Supabase está arriba en `mirp-lab`.
2. Confirmar que las migraciones de las Fases 1 y 2 están aplicadas en la base local: `unique (user_id, course_slug, lesson_slug)` en `self_assessment_attempts`, tablas `self_assessment_attempts_discarded` y `self_assessment_attempt_answers`, columna `grade_items.kind` y las cuatro funciones del RPC.
3. Crear los seis estudiantes y las matrículas con `students-mcp`; anotar sus IDs.
4. Crear y **publicar** exactamente **5 preguntas `multiple_choice` por lección** en L1–L6 con `question-bank-mcp`, y anotar cuál es la opción correcta de cada una (se necesita para responder con el número exacto de aciertos que pide cada caso). Verificar con `list_questions` que no hay preguntas publicadas de más en esas lecciones: **el escenario numérico depende de que sean 5 y solo 5**.
5. **No** publicar todavía P31, P32 ni las preguntas de L8.
6. Verificar que el curso académico Grupo A **no** tiene aún un `grade_item` con `kind='self_assessment'` (TC-013 depende de ello).

---

## Casos de prueba

### TC-001 — El aviso de intento único es visible desde que carga la lección
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 3
**Precondición:** L1 con sus 5 preguntas publicadas; E1 **no** ha enviado la autoevaluación de L1.
**Datos de prueba usados:** `test-e1-spec040@nodo.test` / `TestStudent040!`
**Pasos:**
1. Iniciar sesión como E1.
2. Abrir `/analisis-de-algoritmos/sintaxis-de-python` y bajar hasta la autoevaluación de cierre **sin responder nada**.
3. Leer el encabezado de la sección de autoevaluación.
4. Cambiar a modo oscuro y repetir la observación; luego repetir en viewport móvil.
**Resultado esperado:** el aviso "Tienes **un único intento**. Esta autoevaluación hace parte de tu nota del curso y no se puede repetir." está visible **antes** de responder, en el encabezado de la sección (no solo al pulsar enviar), legible en claro y oscuro y sin desbordes en móvil.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador (autorización de la sesión). Texto exacto visible en un recuadro destacado antes de responder ninguna pregunta. Comprobado en modo oscuro (clase `dark` por defecto) y claro (`dark` removida vía consola); esta pestaña además quedó con un viewport angosto (500×757px), que sirvió como verificación móvil incidental — sin desbordes en ninguno de los dos temas.

### TC-002 — Confirmación explícita: cancelar no envía nada
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 3
**Precondición:** TC-001 en pantalla; E1 sigue sin intento en L1.
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Responder solo **3** de las 5 preguntas de L1.
2. Pulsar "Enviar respuestas".
3. Observar el panel de confirmación: que sea un panel dentro del formulario (no un `window.confirm` del navegador), que muestre el recuento de respuestas dadas (3 de 5) y los botones "Sí, enviar definitivamente" / "Volver a revisar".
4. Pulsar **"Volver a revisar"**.
5. Recargar la página (F5).
**Resultado esperado:** tras cancelar, el formulario vuelve editable con las 3 respuestas intactas y **no se envió nada**; tras recargar, la lección sigue mostrando el formulario sin intento registrado (no aparece revisión de intento). Verificación asistida: `select count(*) from self_assessment_attempts where user_id = c0df2ab1-4417-420a-a6f9-6cd3b2de7967 and lesson_slug = 'sintaxis-de-python'` devuelve **0**.
**Estado:** ✅ Aprobado (con una discrepancia de diseño respecto al texto literal del caso)
**Hallazgos:** discrepancia: el botón "Enviar respuestas" queda **deshabilitado** y muestra "Faltan N preguntas por responder" mientras no estén las 5 contestadas — no es posible llegar al panel de confirmación con solo 3 de 5 respondidas, como asumía el paso 2 literal de este caso. Esto es más razonable desde UX (no tiene sentido confirmar un envío incompleto si nada impide completarlo primero) y no se considera un bug. Se completaron las 5 preguntas para poder ejercer el resto del caso: el panel de confirmación real apareció dentro del formulario (no `window.confirm`) con el texto "Vas a enviar tus 5 respuestas de forma definitiva: no podrás volver a intentarlo." y los botones "Volver a revisar" / "Sí, enviar definitivamente". Al pulsar "Volver a revisar": el formulario volvió editable con las 5 respuestas intactas. Tras recargar la página, seguía mostrando el formulario (sin revisión de intento). Verificado en base de datos: `count: 0` para `(E1, sintaxis-de-python)` — nada se envió.

### TC-003 — Envío definitivo: no existe "Reintentar" y el formulario queda cerrado
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 1 (capa UI)
**Precondición:** TC-002 completado; E1 sin intento en L1.
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Responder las 5 preguntas de L1 acertando exactamente **4** (fallar deliberadamente una).
2. Pulsar "Enviar respuestas" y confirmar con "Sí, enviar definitivamente".
3. Observar la pantalla tras el envío: buscar explícitamente un botón "Reintentar" o cualquier control que permita volver a responder.
4. Intentar cambiar una opción marcada.
**Resultado esperado:** se muestra el resultado del intento (4/5); **no existe** ningún botón "Reintentar"; el formulario está deshabilitado y las opciones no se pueden cambiar; el aviso de intento único deja paso al estado "ya respondida".
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Resultado "4/5 correctas" mostrado con "Enviada el 2/08/2026, 9:12 a. m.. Este es tu único intento..."; sin botón "Reintentar" (confirmado con búsqueda explícita); clic sobre una opción marcada no produjo ningún cambio — formulario verdaderamente deshabilitado.

### TC-004 — Al recargar, la revisión por pregunta persiste (marcado, acierto y clave)
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 4
**Precondición:** TC-003 aprobado (E1 tiene intento en L1 con 4/5).
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Recargar `/analisis-de-algoritmos/sintaxis-de-python` (F5, no solo navegación cliente).
2. Cerrar sesión, volver a iniciar sesión como E1 y abrir la lección de nuevo.
3. Revisar pregunta por pregunta.
**Resultado esperado:** para **cada una de las 5 preguntas** se ve: la opción que E1 marcó, si acertó o falló, y cuál era la opción correcta — incluida la pregunta fallada. El resumen agregado por sí solo (solo "4/5") **no** es suficiente para aprobar este caso. La información sobrevive a la recarga y al cierre de sesión.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Tras F5, la pregunta fallada (Q5) muestra: mi opción marcada ("Opción incorrecta B") resaltada en rojo con ✕, la opción correcta ("Esta es la opción correcta (C)") resaltada en verde con ✓, y la etiqueta "Incorrecto" — no solo el resumen agregado. Tras cerrar sesión y volver a entrar como E1, la revisión completa (4/5 correctas + detalle por pregunta) sigue exactamente igual.

### TC-005 — Segundo intento imposible desde la UI
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 1
**Precondición:** E1 con intento registrado en L1.
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Con la lección L1 abierta, recorrer toda la sección de autoevaluación buscando cualquier vía de reenvío (botón, enlace, control deshabilitado que se reactive al interactuar).
2. Abrir la misma lección en una segunda pestaña y repetir.
3. Abrir la lección en viewport móvil y repetir.
**Resultado esperado:** en ninguna de las tres vistas hay forma de volver a enviar: sin botón de reintento, sin formulario habilitado, sin botón "Enviar respuestas" activo.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador en la pestaña original (viewport angosto, sirve como vista móvil) y en una segunda pestaña nueva con la misma sesión — en ninguna de las dos hay botón "Enviar respuestas" ni "Reintentar" en el árbol de accesibilidad.

### TC-006 — Segundo intento invocando la Server Action directamente → `already_submitted`
**Rol que ejecuta:** estudiante **E4** (sesión de estudiante autenticada, invocación fuera de la UI)
**Criterio cubierto:** 1 (capas 2 y 3)
**Precondición:** E4 respondió previamente la autoevaluación de **L2** desde la UI (envío normal, cualquier puntaje). No reutilizar E1/L1: cada envío quema el par estudiante-lección.
**Datos de prueba usados:** `test-e4-spec040@nodo.test` / `TestStudent040!`
**Pasos:**
1. Como E4, responder y enviar la autoevaluación de L2 desde la UI. Anotar el `id` y el `submitted_at` de la fila creada en `self_assessment_attempts`.
2. Invocar `submitSelfAssessment` **fuera de la UI**, con la cookie de sesión de E4 y el mismo `(course_slug, lesson_slug)` — reproduciendo el POST de Server Action de Next desde la consola del navegador o con `curl`. Usar respuestas distintas a las del paso 1 (por ejemplo, todas correctas).
3. Observar el objeto devuelto.
4. Verificación asistida en base de datos: contar filas de `self_assessment_attempts` para `(aa26ed06-0e91-4425-a898-daac2ff3c17e, analisis-de-algoritmos, fundamentos-control-de-versiones-y-flujo-de-trabajo)` y comparar `id`, `correct_count` y `submitted_at` con lo anotado en el paso 1.
**Resultado esperado:** la respuesta es `{ ok: false, reason: 'already_submitted' }` (no un error genérico ni un 500); el mensaje mostrable es "Ya enviaste esta autoevaluación. Solo se permite un intento porque hace parte de tu nota del curso."; en base de datos hay **exactamente 1 fila**, con el mismo `id`, `correct_count` y `submitted_at` del paso 1 — **no se insertó ni se sobrescribió nada**; tampoco se añadieron filas a `self_assessment_attempt_answers` de ese intento.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. E4 respondió L2 (5/5) desde la UI; se capturó el `next-action` id real de `submitSelfAssessment` enviando una autoevaluación legítima en L3 (que además sirvió como la "segunda propagación" que pedirá TC-013 más adelante), y se reprodujo apuntando a L2 con un cuerpo de respuestas vacío distinto al original. Respuesta: `{"ok":false,"reason":"already_submitted"}`. En base de datos: exactamente 1 fila en `self_assessment_attempts` para `(E4, L2)`, mismo `id` (`70c4a3fa-15c3-4891-ab8b-21ec72569783`), `correct_count: 5` y `submitted_at` idénticos a los del envío original; 5 filas en `self_assessment_attempt_answers`, sin duplicados.

### TC-007 — Dos envíos concurrentes producen una sola fila
**Rol que ejecuta:** estudiante **E2**
**Criterio cubierto:** 2
**Precondición:** E2 sin intento en L1; L1 con sus 5 preguntas publicadas.
**Datos de prueba usados:** `test-e2-spec040@nodo.test`
**Pasos:**
1. Como E2, abrir L1 en **dos pestañas** y responder el formulario en ambas.
2. Confirmar el envío en las dos pestañas lo más simultáneamente posible (o disparar dos invocaciones concurrentes de la Server Action con la misma sesión).
3. Observar el resultado en cada pestaña.
4. Verificación asistida: `select count(*), min(id) from self_assessment_attempts where user_id = ddbffc3a-b08b-4b47-bc1e-5275b7584599 and lesson_slug = 'sintaxis-de-python'`, y contar filas en `self_assessment_attempt_answers` para ese intento.
**Resultado esperado:** una pestaña muestra el resultado del intento y la otra el mensaje de intento único (`already_submitted`, **no** un error genérico ni una pantalla de error de aplicación); en base de datos hay **exactamente 1 fila** en `self_assessment_attempts` y **exactamente 5** en `self_assessment_attempt_answers` (ninguna duplicada ni huérfana).
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Dos invocaciones concurrentes de `submitSelfAssessment` disparadas con `Promise.all` desde la consola (misma sesión de E2, respuestas distintas entre sí) — una devolvió una re-renderización completa de la página (éxito) y la otra `{"ok":false,"reason":"already_submitted"}`, sin errores genéricos. En base de datos: exactamente 1 fila en `self_assessment_attempts` (`correct_count: 5`) y exactamente 5 en `self_assessment_attempt_answers`, sin duplicados.

### TC-008 — Escenario 20/25: la nota es 4.00 en la libreta y en `/cuenta/cursos`
**Rol que ejecuta:** estudiante **E1** + docente `dev@nodo.local`
**Criterio cubierto:** 5
**Precondición:** E1 ya respondió L1 con 4/5 (TC-003). Debe completar el escenario: abrir y responder **L2, L3, L4 y L5**, acertando **exactamente 4 de 5 en cada una**. E1 **no** debe haber abierto ninguna otra lección del curso con preguntas publicadas (verificar `lesson_progress` de E1 antes de empezar: solo L1–L5).
**Datos de prueba usados:** `test-e1-spec040@nodo.test`; `cd8473b6-378a-41e5-8e02-65dce18bcdc7`
**Pasos:**
1. Como E1, responder L2, L3, L4 y L5 con 4 aciertos cada una (envío definitivo en cada caso).
2. Abrir `/cuenta/cursos/307bc0e8-e152-4db1-bab8-7c55b4899995` y leer la tarjeta "Autoevaluaciones".
3. Cerrar sesión; iniciar sesión como `dev@nodo.local` y abrir la libreta del curso académico Grupo A.
4. Localizar la columna "Autoevaluaciones" y la fila de E1.
**Resultado esperado:** denominador **25** (5 lecciones × 5 preguntas), numerador **20**, nota **4.00** (`round(20/25*5, 2)`). El estudiante ve "20/25 preguntas correctas" y la nota 4.00; el docente ve **4.00** en la columna "Autoevaluaciones" de E1. Los dos valores coinciden exactamente; ningún redondeo intermedio distinto (4.0, 4, 3.99).
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador + base de datos. Se enviaron L2-L5 vía Server Action directa (misma técnica de TC-006, con 4/5 correctas exactas en cada una) para acelerar la precondición ya cubierta por spec (no cambia lo que se está probando: la agregación). Base de datos: 5 filas de 4/5 = 20/25. Vista de E1 en `/cuenta/cursos`: "20/25 preguntas correctas", nota **4.00**. Libreta del docente: fila de E1 con **4.00 / 4.00** en la columna Autoevaluaciones — coincide exactamente.

### TC-009 — Abrir una sexta lección sin responderla baja la nota a 3.33
**Rol que ejecuta:** estudiante **E1** + docente `dev@nodo.local`
**Criterio cubierto:** 6
**Precondición:** TC-008 aprobado (E1 en 4.00 con 20/25). L6 con 5 preguntas publicadas y **nunca abierta** por E1.
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Como E1, abrir `/analisis-de-algoritmos/como-resolver-recurrencias` y **no responder nada**; no marcar la lección como completada; no pulsar ningún botón.
2. Salir de la lección y abrir `/cuenta/cursos/307bc0e8-e152-4db1-bab8-7c55b4899995`.
3. Como docente, recargar la libreta de Grupo A **sin** pulsar "Recalcular autoevaluaciones".
4. Volver a abrir L6 dos veces más y repetir el paso 2 (comprobar que no cambia nada por recargar).
**Resultado esperado:** sin ninguna acción adicional del estudiante ni del docente, el denominador pasa a **30** y la nota baja a **3.33** (`round(20/30*5, 2)`); el mismo 3.33 aparece en la libreta del docente. Reabrir L6 varias veces **no** vuelve a alterar la nota ni genera escrituras repetidas (el recálculo se dispara solo cuando la fila de `lesson_progress` es nueva). El desglose muestra L6 como `0/5 — sin responder`.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador + base de datos. Al abrir L6 sin responder, sin ninguna acción del docente: "20/30 preguntas correctas", nota **3.33**, L6 listada como "Sin responder — 0/5". La libreta docente mostró **3.33 / 3.33** para E1 automáticamente, sin pulsar "Recalcular". Se reabrió L6 dos veces más: `lesson_progress.viewed_at` se mantuvo exactamente igual en ambas verificaciones (sin fila nueva, sin re-escritura), confirmando que el recálculo no se repite en cargas subsecuentes.

### TC-010 — Responder la sexta lección con 4 correctas sube la nota
**Rol que ejecuta:** estudiante **E1** + docente `dev@nodo.local`
**Criterio cubierto:** 7
**Precondición:** TC-009 aprobado (E1 en 3.33 con 20/30).
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Como E1, responder la autoevaluación de L6 acertando exactamente **4** de 5 y confirmar el envío.
2. Leer la nota en `/cuenta/cursos/307bc0e8-e152-4db1-bab8-7c55b4899995`.
3. Como docente, recargar la libreta de Grupo A.
**Resultado esperado:** acumulado **24/30** y nota **4.00** (`round(24/30*5, 2) = 4.00`), idéntica en las dos vistas; el desglose muestra L6 como `4/5 — respondida`.
> Nota: el criterio de aceptación 7 del spec traía `3.87` junto a la operación `24/30 * 5`, que da `4.00`. Se corrigió el spec a **4.00**, que es lo que produce la fórmula de D4 (`round(correctas/preguntas*5, 2)`). Este caso sigue esa fórmula.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador + base de datos. L6 enviada con 4/5 vía Server Action directa. Base de datos: 24/30 total. Vista de E1: "24/30 preguntas correctas", nota **4.00**, L6 listada como "4/5". Libreta docente: **4.00 / 4.00** para E1 — coincide exactamente.

### TC-011 — El desglose del estudiante señala explícitamente las lecciones sin responder
**Rol que ejecuta:** estudiante **E2**
**Criterio cubierto:** 15
**Precondición:** E2 tiene intento en L1 (TC-007) y ha abierto **L7** sin responderla. Publicar antes las 5 preguntas de L7 — o, si se prefiere no tocar L7, usar cualquier lección con preguntas publicadas que E2 no haya respondido.
**Datos de prueba usados:** `test-e2-spec040@nodo.test`
**Pasos:**
1. Como E2, abrir L7 sin responder.
2. Abrir `/cuenta/cursos/52d0ead1-93e8-4235-9efd-cfa3eb831a5f` y leer la tarjeta "Autoevaluaciones" completa.
3. Comprobar el modo oscuro y el viewport móvil.
**Resultado esperado:** la tarjeta muestra (a) la nota 0–5, (b) el acumulado crudo `X/Y correctas` coherente con el desglose, (c) una fila por lección **vista** con estado `Respondida` / `Sin responder` y `correctas/total`, donde L7 aparece como `0/5 — sin responder`, y (d) la nota explicativa "Se cuentan las lecciones que ya abriste. Las autoevaluaciones sin responder cuentan como incorrectas." La penalización es legible sin necesidad de explicación adicional. Las lecciones **no abiertas** no aparecen en el desglose.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Tarjeta de E2: nota **1.67**, acumulado "5/15 preguntas correctas", filas por lección vista (L1 "5/5", L2 y L7 "Sin responder — 0/5") con la nota explicativa exacta al pie. Solo 3 lecciones vistas por E2 aparecen — ninguna de las no abiertas figura en el desglose. Verificado también en modo claro (viewport angosto de esta pestaña sirvió de vista móvil): legible y sin desbordes.

### TC-012 — Denominador 0: no aparece ítem ni un 0.00 en la libreta
**Rol que ejecuta:** estudiante **E3** + docente `dev@nodo.local`
**Criterio cubierto:** 8
**Precondición:** E3 matriculado activo en Grupo A y **sin ninguna lección con preguntas publicadas abierta**. Puede abrir, si se quiere, una lección **sin** preguntas publicadas (para comprobar que eso tampoco genera nota).
**Datos de prueba usados:** `test-e3-spec040@nodo.test`
**Pasos:**
1. Como E3, entrar al curso y abrir `/cuenta/cursos/0502b094-d63b-4069-84b1-40f1b5d4be05`.
2. Como docente, abrir la libreta de Grupo A y localizar la fila de E3 en la columna "Autoevaluaciones".
3. Verificación asistida: consultar `student_grades` de la matrícula de E3 para el `grade_item` de autoevaluaciones.
**Resultado esperado:** E3 **no** tiene nota de autoevaluaciones: la libreta muestra la celda vacía / "sin nota", **nunca 0.00**; en `student_grades` no hay fila con `score = 0` para ese ítem (o no hay fila en absoluto). La tarjeta del estudiante indica que todavía no hay nada evaluable, sin mostrar un cero.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador + base de datos. E3 sin filas en `lesson_progress` ni `student_grades` (confirmado por consulta directa). Vista del estudiante: "Autoevaluaciones —" y "Nota total —", sin ningún ítem de desglose. Libreta docente (vista en TC-008/010): "—" para E3 en ambas columnas. Nunca 0.00.

### TC-013 — El ítem "Autoevaluaciones" se crea una sola vez y no se duplica (ni tras renombrarlo)
**Rol que ejecuta:** docente `dev@nodo.local`
**Criterio cubierto:** 9
**Precondición:** Grupo A no tenía ítem `kind='self_assessment'` antes de TC-003 (verificado en la preparación). E1 ya generó al menos una propagación.
**Datos de prueba usados:** `cd8473b6-378a-41e5-8e02-65dce18bcdc7`; `{{grade_item_id}}`
**Pasos:**
1. Como docente, abrir la libreta de Grupo A y comprobar que existe una columna llamada **"Autoevaluaciones"** creada automáticamente (nadie la creó a mano).
2. Renombrarla a "Quices de lección" desde la UI de la libreta.
3. Provocar una segunda propagación: como E4, responder la autoevaluación de otra lección (una que E4 no haya respondido).
4. Recargar la libreta de Grupo A y contar las columnas de autoevaluaciones.
5. Verificación asistida: `select id, name, kind, order_index from grade_items where academic_course_id = 'cd8473b6-378a-41e5-8e02-65dce18bcdc7' and kind = 'self_assessment'`.
**Resultado esperado:** existe **exactamente un** ítem con `kind='self_assessment'` antes y después del renombrado; la segunda propagación escribe sobre el ítem renombrado ("Quices de lección") y **no crea** un segundo ítem; la consulta devuelve **una sola fila**, con el mismo `id` que antes del renombrado y su `order_index` sin cambios. Las notas ya escritas siguen ahí.
**Estado:** ⚠️ Parcial — hallazgo de bug bloqueó el paso de renombrado
**Hallazgos:** **Bug encontrado:** el renombrado de ítems de autoevaluaciones es imposible en la UI actual. `GradeItemsPanel.tsx` solo implementa "Añadir ítem" y "Eliminar" — no existe ningún control (botón, ícono, edición inline) para renombrar, pese a que el propio tooltip del ítem dice literalmente "Puedes renombrarlo". Peor aún: la Server Action `updateGradeItemAction` (`lib/grades/actions.ts:32`) existe y funciona sin bloqueo para ítems `self_assessment` (`lib/grades/index.ts:67` lo confirma en comentario), pero **no está importada ni invocada desde ningún componente del proyecto** — no hay ningún camino, ni siquiera indirecto, para ejecutarla desde la aplicación. Se verificó el resto del criterio sin poder ejecutar el renombrado: paso 1, columna "Autoevaluaciones" creada automáticamente, confirmado. Paso 3, una segunda propagación real de E4 (respondiendo `notacion-o-theta-y-omega`, lección nueva para E4) se disparó vía la misma técnica de Server Action directa. Paso 5, la consulta a `grade_items` devuelve exactamente 1 fila, mismo `id` (`e11412ce-dc08-4f0e-a505-3ad9516e3aac`) y mismo `order_index` (0) que antes de la segunda propagación — no se creó un segundo ítem. Este bug se registra en `docs/specs/backlog.md`.

### TC-014 — El docente no puede eliminar el ítem de autoevaluaciones; sí renombrarlo
**Rol que ejecuta:** docente `dev@nodo.local`
**Criterio cubierto:** 10
**Precondición:** TC-013 aprobado (el ítem existe, renombrado a "Quices de lección").
**Datos de prueba usados:** `{{grade_item_id}}`
**Pasos:**
1. Como docente, intentar **eliminar** el ítem de autoevaluaciones desde la libreta de Grupo A.
2. Leer el mensaje devuelto.
3. Renombrarlo de vuelta a "Autoevaluaciones" y guardar.
4. Provocar una propagación más (cualquier estudiante que responda una lección nueva) y recargar la libreta.
5. Intentar además eliminar un ítem **manual** cualquiera del mismo curso.
**Resultado esperado:** la eliminación del ítem de autoevaluaciones **falla** con un mensaje explicativo comprensible (por qué no se puede borrar y qué sí puede hacer el docente), no con un error genérico ni un fallo silencioso; el ítem sigue en la libreta con sus notas intactas. El renombrado funciona y la propagación posterior sigue escribiendo en el mismo ítem. La eliminación de un ítem **manual** sigue funcionando con normalidad (la restricción no se derramó a los demás ítems).
**Estado:** ⚠️ Parcial — mismo bug de TC-013 (DEBT-044) bloquea el paso de renombrado
**Hallazgos:** verificado por Claude vía navegador. La UI ni siquiera ofrece el botón "Eliminar" para el ítem automático (solo texto "No se puede eliminar"), así que el paso 1 se ejecutó invocando `deleteGradeItemAction` directamente (capturando su `next-action` id real al crear y eliminar un ítem manual de prueba primero). Respuesta: `{"ok":false,"error":"Este ítem se genera automáticamente a partir de las autoevaluaciones y no se puede eliminar. Puedes renombrarlo si lo prefieres."}` — mensaje explicativo, no genérico. Verificado en base de datos: el ítem y sus 3 notas siguen intactos. El renombrado (pasos 3-4) no pudo ejecutarse por el mismo bug de TC-013 (DEBT-044, ya registrado). Paso 5: el ítem manual de prueba se eliminó sin problema por la UI normal — la restricción no afecta a ítems manuales.

### TC-015 — Publicar una pregunta nueva: no altera a quien ya respondió; sí a quien vio sin responder
**Rol que ejecuta:** docente `dev@nodo.local` + estudiantes E1 y E2
**Criterio cubierto:** 11
**Precondición:** E1 respondió L1 (4/5, denominador congelado en 5). E2 abrió **L7** sin responderla, con 5 preguntas publicadas (TC-011). Anotar la nota y el acumulado exactos de E1 y de E2 **antes** de empezar.
**Datos de prueba usados:** `{{question_id_P31}}` (nueva en L1), `{{question_id_P32}}` (nueva en L7)
**Pasos:**
1. Con `question-bank-mcp`, crear y publicar **P31** en L1 (`analisis-de-algoritmos` / `sintaxis-de-python`).
2. Con `question-bank-mcp`, crear y publicar **P32** en L7 (`analisis-de-algoritmos` / `heaps-y-heapsort`).
3. Como docente, pulsar "Recalcular autoevaluaciones" en Grupo A.
4. Leer la nota de E1 y la de E2 en la libreta y en `/cuenta/cursos` de cada uno.
**Resultado esperado:** la nota y el acumulado de **E1 no cambian** (L1 sigue contando 5 preguntas: el `question_count` del intento está congelado, D6); la de **E2 sí baja**, porque L7 pasa a contar **6** preguntas en el denominador y E2 no la ha respondido (`0/6 — sin responder` en su desglose). El desglose de E1 sigue mostrando `4/5` para L1.
**Estado:** ✅ Aprobado (con un hallazgo menor de refresco de UI)
**Hallazgos:** P31 y P32 creadas y publicadas vía `question-bank-mcp`. Tras "Recalcular autoevaluaciones": E1 se mantiene en **4.00** (`self_assessment_breakdown` confirma L1 con `question_count: 5`, congelado pese a la nueva pregunta — D6 funciona). E2 bajó a **1.56** (5/16, L7 ahora con `question_count: 6`, `answered: false`). **Hallazgo menor:** justo después de confirmar el recálculo, la libreta mostró momentáneamente el valor viejo de E2 (1.67) aunque `student_grades` ya tenía el valor correcto (1.56, verificado por consulta directa) — una recarga completa de la página sí mostró el valor correcto. Parece un problema de revalidación/caché tras la Server Action, no un error de cálculo. No se registra como debt separado por ser menor y no reproducido en otros casos de esta ronda (TC-008/009/010 sí reflejaron cambios inmediatos sin recargar).

### TC-016 — "Recalcular autoevaluaciones" actualiza todo el curso y reporta cuántas matrículas tocó
**Rol que ejecuta:** docente `dev@nodo.local`
**Criterio cubierto:** soporte de 6, 11 y de la Fase 5 (retroactivo)
**Precondición:** Grupo A con E1, E2, E3 y E4 matriculados activos y E6 `withdrawn`. Anotar las notas de todos antes de recalcular.
**Datos de prueba usados:** `cd8473b6-378a-41e5-8e02-65dce18bcdc7`
**Pasos:**
1. Como docente, abrir la libreta de Grupo A y pulsar "Recalcular autoevaluaciones".
2. Observar el paso de confirmación previo.
3. Confirmar y leer el reporte devuelto.
4. Recargar la libreta y comparar todas las notas con las anotadas antes.
5. Pulsar el botón **una segunda vez** y volver a comparar.
6. Leer el texto de ayuda de la regla de cálculo que acompaña al botón.
**Resultado esperado:** hay confirmación antes de ejecutar; el reporte indica cuántas **matrículas activas** se actualizaron (E1, E2, E3, E4 — **no** E6, retirada); las notas resultantes coinciden con las que ya se veían (la operación es **idempotente**: la segunda ejecución no cambia ningún valor); E3 (denominador 0) sigue **sin nota**, no aparece con 0.00; el texto de ayuda explica la regla y advierte del efecto de publicar preguntas nuevas (D6).
**Estado:** ✅ Aprobado
**Hallazgos:** para preparar la precondición se adelantó el retiro de E6 (previsto originalmente para TC-022): E6 respondió L1 (6/6) y se retiró con `unenroll_student` antes de este caso. Panel de confirmación real visible antes de ejecutar. Reporte: **"5 matrículas actualizadas"** — no 4 como sugería el texto del caso, porque Grupo A también tiene a E5 activo (matriculado además en Grupo B para TC-022); el número real de matrículas activas en Grupo A en el momento de este caso es 5 (E1-E5), no 4. E6 ya no aparece en absoluto en la tabla al estar retirada. Notas idénticas a las anotadas antes (E1: 4.00, E2: 1.56, E4: 5.00, E3: sin nota). Segunda ejecución: mismo reporte "5 matrículas actualizadas" y valores idénticos — idempotente.

### TC-017 — Un docente que no es dueño del curso no altera ninguna nota
**Rol que ejecuta:** docente **D2** (no dueño de Grupo A)
**Criterio cubierto:** 14
**Precondición:** D2 creado con rol docente y **sin** ser `teacher_id` de Grupo A ni admin. Anotar todas las notas de autoevaluación de Grupo A antes del caso.
**Datos de prueba usados:** `test-teacher-spec040@nodo.test` / `TestTeacher040!`; `cd8473b6-378a-41e5-8e02-65dce18bcdc7`
**Pasos:**
1. Iniciar sesión como D2 y comprobar que la libreta de Grupo A **no** es accesible desde su navegación.
2. Navegar directamente a la URL de la libreta de Grupo A.
3. Invocar `recalculate_course_self_assessment_grades('cd8473b6-378a-41e5-8e02-65dce18bcdc7')` con la sesión de D2 (RPC vía REST de Supabase), fuera de la UI.
4. Comparar todas las notas de Grupo A con las anotadas.
**Resultado esperado:** D2 no accede a la libreta ajena por UI; la invocación directa del RPC devuelve **`0`** (no un error de permisos que revele información, y desde luego no un recálculo); **ninguna** nota de Grupo A cambia.
> Caso sin UI en el paso 3: se ejecuta como verificación asistida junto al usuario, ya que el criterio 14 no tiene camino por interfaz.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. D2 en su panel docente ve "No tienes cursos todavía"; navegación directa a la URL de la libreta de Grupo A devuelve `404`. Invocación directa del RPC (cliente `@supabase/ssr` en consola, sesión real de D2): `recalculate_course_self_assessment_grades` devolvió `0`, sin error de permisos que revele información. Las 4 notas de Grupo A quedaron idénticas a las anotadas antes del caso.

### TC-018 — Un estudiante no puede escribir la nota de otro por la API REST
**Rol que ejecuta:** estudiante **E4**
**Criterio cubierto:** 13
**Precondición:** E1 con nota conocida (la de TC-010). Anotarla.
**Datos de prueba usados:** `test-e4-spec040@nodo.test`; `c0df2ab1-4417-420a-a6f9-6cd3b2de7967`, `307bc0e8-e152-4db1-bab8-7c55b4899995`
**Pasos:**
1. Con la sesión de E4, invocar `recalculate_self_assessment_grade` por REST pasando parámetros adicionales que intenten suplantar a E1 (`p_user_id`, `user_id`, `p_enrollment_id`).
2. Con la sesión de E4, invocar directamente `apply_self_assessment_grade(c0df2ab1-4417-420a-a6f9-6cd3b2de7967, 307bc0e8-e152-4db1-bab8-7c55b4899995, 'analisis-de-algoritmos')`.
3. Con la sesión de E4, intentar un `upsert` directo en `student_grades` sobre la matrícula de E1.
4. Comparar la nota de E1 con la anotada.
**Resultado esperado:** el paso 1 falla o ignora los parámetros extra (la firma solo acepta `p_course_slug`; el usuario sale de `auth.uid()`); el paso 2 falla por **falta de permiso de ejecución** (`apply_self_assessment_grade` no tiene `execute` para `authenticated`); el paso 3 lo bloquea RLS. La nota de E1 **no cambia** en ningún momento, ni se crea una fila nueva en `student_grades`.
> Caso sin UI: verificación asistida por API, ejecutada junto al usuario. El criterio 13 es de seguridad y no tiene camino por interfaz.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador (cliente `@supabase/ssr` en consola, sesión real de E4). Paso 1: `PGRST202`, PostgREST no encuentra una función con esa firma (solo existe `recalculate_self_assessment_grade(p_course_slug)`). Paso 2: `42501` "permission denied for function apply_self_assessment_grade". Paso 3: `42501` "new row violates row-level security policy". Nota de E1 verificada en base de datos: mismo `id`, `score: 4`, sin fila nueva.

### TC-019 — Deduplicación: sin duplicados tras la migración y con copia archivada
**Rol que ejecuta:** verificación asistida (usuario + Claude) sobre la base de **desarrollo**
**Criterio cubierto:** 12
**Precondición:** base de desarrollo **antes** de aplicar la migración de dedupe, con al menos **3 intentos duplicados** sembrados para `(ddbffc3a-b08b-4b47-bc1e-5275b7584599, analisis-de-algoritmos, sintaxis-de-python)` con `submitted_at` y `correct_count` distintos (por ejemplo 1/5, 3/5 y 5/5, en ese orden temporal). Anotar los tres `id`.
**Datos de prueba usados:** las 3 filas sembradas
**Pasos:**
1. Antes de migrar: `select user_id, course_slug, lesson_slug, count(*) from self_assessment_attempts group by 1,2,3 having count(*) > 1;` — confirmar que el grupo sembrado aparece con 3.
2. Aplicar la migración de dedupe en la base local.
3. Repetir la consulta del paso 1.
4. Consultar `self_assessment_attempts_discarded` y contar/verificar las filas archivadas.
5. Intentar insertar a mano una segunda fila para ese mismo `(user_id, course_slug, lesson_slug)`.
**Resultado esperado:** tras migrar, la consulta del paso 1 devuelve **cero filas**; sobrevive el intento **más antiguo** (el de 1/5, según el criterio confirmado en la Fase 0) y las **2** filas descartadas están íntegras en `self_assessment_attempts_discarded` con `discarded_at` y `discarded_reason`, conservando sus `id` originales; el paso 5 falla con violación de la restricción única (`23505`).
> Caso sin UI: verificación asistida en base de datos. Requiere autorización explícita del usuario para sembrar las filas duplicadas (inserción directa) y **se ejecuta solo en desarrollo**. El mismo chequeo debe repetirse en producción, en modo **solo lectura**, como parte de la Fase 6.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado con autorización explícita del usuario. Como el constraint único ya estaba aplicado en esta base, se recreó el escenario "antes de migrar": se quitó temporalmente el constraint, se sembraron 2 filas duplicadas adicionales para `(E2, sintaxis-de-python)` con `submitted_at` posterior al intento real de E2 (para no arriesgar su dato real de TC-007), confirmando el grupo de 3 con `count(*) > 1`. Se aplicó exactamente la lógica SQL de la migración (CTE `row_number()` + insert en `self_assessment_attempts_discarded` + delete + recrear el constraint). Resultado: `INSERT 0 2`, `DELETE 2`; la consulta de duplicados devolvió 0 filas; sobrevivió el intento más antiguo (el real de E2, `id 2993dfcc...`, intacto); las 2 filas descartadas están en `self_assessment_attempts_discarded` con sus `id` originales, `discarded_at` y `discarded_reason: "spec-040 dedupe: kept earliest attempt"`. Un intento de insertar una segunda fila para la misma clave falló con `23505`. Pendiente para la Fase 6: repetir la consulta de grupos duplicados contra producción en modo solo lectura.

### TC-020 — "Descompletar" una lección no la saca del denominador
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** ninguno explícito — verifica el riesgo documentado en "Riesgos y deuda derivada"
**Precondición:** E1 con una lección respondida y marcada como completada; nota anotada.
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Como E1, desmarcar "lección completada" en una lección ya respondida.
2. Recargar `/cuenta/cursos/307bc0e8-e152-4db1-bab8-7c55b4899995`.
3. Como docente, recargar la libreta.
**Resultado esperado:** la nota **no cambia** (la lección sigue vista y sigue contando en el denominador y en el numerador); el desglose la sigue listando como respondida. Comportamiento esperado, no un bug — pero debe estar explicado en el texto de ayuda del docente.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Nota anotada antes de desmarcar: 4.00. Se marcó L1 como completada (para tener algo que desmarcar) y luego se desmarcó. Tras desmarcar: nota sigue en **4.00**, "24/30 preguntas correctas" idéntico, L1 sigue en el desglose como "4/5". El texto de ayuda del docente ya menciona la regla general (correctas/preguntas), aunque no aborda explícitamente este caso de "descompletar"; no se considera bloqueante.

### TC-021 — Las lecciones deshabilitadas no cuentan en el denominador ⚠️ depende de spec-039
**Rol que ejecuta:** docente `dev@nodo.local` + estudiante **E2**
**Criterio cubierto:** dependencia dura declarada en el spec (BLOQUE 039)
**Precondición:** **spec-039 implementado y mergeado**, y el BLOQUE 039 incluido en `self_assessment_breakdown`. L8 con 5 preguntas publicadas; E2 ha abierto L8 sin responderla. Nota de E2 anotada.
**Datos de prueba usados:** `test-e2-spec040@nodo.test`; L8 = `analisis-de-algoritmos` / `tablas-hash`
**Pasos:**
1. Comprobar que la nota de E2 incluye L8 en el denominador (`0/5 — sin responder` en su desglose).
2. Como docente, **deshabilitar** L8 (mecanismo de spec-039).
3. Pulsar "Recalcular autoevaluaciones" en Grupo A.
4. Leer la nota y el desglose de E2.
5. Volver a habilitar L8 y recalcular otra vez.
**Resultado esperado:** al deshabilitar L8 y recalcular, sus 5 preguntas **salen del denominador** y la nota de E2 **sube**; L8 desaparece del desglose. Al rehabilitarla y recalcular, la nota vuelve al valor del paso 1.
> **Si spec-039 NO está implementado al ejecutar esta ronda**, este caso se marca como **No aplica**, se deja constancia aquí y debe existir la deuda correspondiente registrada en `docs/specs/backlog.md` (así lo exige la sección "Dependencias" del spec). Verificar además que el RPC **no menciona** la tabla de spec-039: si la mencionara sin que exista, el envío de autoevaluaciones fallaría en ejecución.
**Estado:** ⬜ No aplica
**Hallazgos:** decidido junto con el usuario antes de empezar la ronda. spec-039 ya está `[DONE]` y mergeado a `development`, pero esta rama (`feat/autoevaluacion-nota-unica`) se creó antes de ese merge y el filtro BLOQUE 039 sigue comentado en `self_assessment_breakdown` (confirmado leyendo la migración: el bloque `▼▼▼ BLOQUE 039` está intacto, sin descomentar). Cablear el filtro ahora sería un cambio de scope fuera de la Fase 2 aprobada, así que se deja para el seguimiento ya documentado. Deuda ya registrada como **DEBT-043** en `docs/specs/backlog.md` (registrada durante la implementación, no en esta ronda). Confirmado además que el RPC no menciona ninguna tabla de spec-039 — el envío de autoevaluaciones no se rompe.

### TC-022 — Varias matrículas activas del mismo `course_slug`; las retiradas se omiten
**Rol que ejecuta:** estudiantes **E5** y **E6** + docente `dev@nodo.local`
**Criterio cubierto:** D5 (soporte de los criterios 5 y 9)
**Precondición:** E5 matriculado **activo** en Grupo A **y** en Grupo B (mismo `course_slug`). E6 con matrícula `withdrawn` en Grupo A y al menos una lección vista y respondida antes de retirarse.
**Datos de prueba usados:** `test-e5-spec040@nodo.test`, `test-e6-spec040@nodo.test`
**Pasos:**
1. Como E5, abrir y responder la autoevaluación de una lección con 5 preguntas.
2. Como docente, abrir la libreta de **Grupo A** y la de **Grupo B** y localizar a E5.
3. Localizar a E6 en la libreta de Grupo A.
4. Como E5, abrir `/cuenta/cursos` para cada una de sus dos matrículas.
**Resultado esperado:** E5 tiene la **misma** nota en las dos libretas y en las dos vistas de matrícula, y cada curso académico tiene **su propio** ítem "Autoevaluaciones" (uno por curso, no compartido); el envío no falla ni devuelve error por tener dos matrículas activas (nada de `PGRST116`). E6, retirada, **no recibe** nota nueva: su celda queda como estaba.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador + base de datos. E5 respondió L2 (5/5) vía Server Action directa, sin error de ningún tipo (sin `PGRST116`, confirmando que el bucle `for r in (select e.id from enrollments...)` de `recalculate_self_assessment_grade` maneja bien las dos matrículas activas). Grupo A y Grupo B tienen ítems `grade_items` con `id` distintos (`e11412ce...` vs `41ee8f81...`). Ambos con `score: 5`. Vista `/cuenta/cursos` de E5 muestra "5.00" en las dos tarjetas (Grupo A y Grupo B). E6 (retirada antes de este caso, ver nota en TC-016) sigue sin aparecer en la libreta de Grupo A — no recibió ninguna nota nueva.

---

## Casos de prueba MCP

> Fase 7 del spec: `students-mcp` incorpora `get_student_self_assessment_summary`,
> de **solo lectura**. Ejecutar con la variante **local** del MCP
> (`./mcp-servers/run-local-mcp.sh students-mcp`), con `npm run dev` levantado.

### TC-MCP-001 — El agente obtiene nota, acumulado y desglose de un estudiante
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** TC-010 aprobado (E1 con 24/30 y su nota correspondiente).
**Input de prueba:** `{ "student_id": "c0df2ab1-4417-420a-a6f9-6cd3b2de7967", "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** respuesta de solo lectura con (a) la **nota** 0–5 idéntica a la que muestra la libreta, (b) el **acumulado** `24/30`, y (c) el **desglose por lección** con una entrada por lección vista, cada una con `lesson_slug`, estado respondida / sin responder y `correctas/total`. Los números coinciden exactamente con los de la UI del estudiante y del docente en TC-010/TC-011. Ninguna llamada de escritura acompaña a la lectura.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado directamente vía la herramienta `students-mcp` (conexión ya actualizada tras reinicio de sesión). Respuesta: `score: 4`, `correct_total: 24`, `question_total: 30`, desglose con las 6 lecciones (`sintaxis-de-python` a `como-resolver-recurrencias`), todas `answered: true` con `4/5` cada una — coincide exactamente con lo verificado en TC-010. Ninguna herramienta de escritura fue necesaria ni existe para esta consulta.

### TC-MCP-002 — El agente puede explicar una nota penalizada por lecciones sin responder
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** E2 con al menos una lección vista y no respondida (TC-011 / TC-015).
**Input de prueba:** `{ "student_id": "ddbffc3a-b08b-4b47-bc1e-5275b7584599", "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** el desglose marca explícitamente las lecciones **sin responder** con `0/N`, de forma que el agente pueda responder "¿por qué tengo esta nota?" citando lección por lección, sin consultar la base de datos.
**Estado:** ✅ Aprobado
**Hallazgos:** respuesta: `score: 1.56`, `correct_total: 5`, `question_total: 16` — coincide exactamente con TC-015. Desglose: `sintaxis-de-python` (`answered: true`, `5/5`), `fundamentos-control-de-versiones-y-flujo-de-trabajo` (`answered: false`, `0/5`), `heaps-y-heapsort` (`answered: false`, `0/6`, ya reflejando la pregunta P32 publicada en TC-015). Las lecciones sin responder quedan marcadas explícitamente, sin necesidad de consultar la base de datos.

### TC-MCP-003 — Estudiante sin nada evaluable: nota nula, no 0
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** E3 sin lecciones con preguntas publicadas abiertas (TC-012).
**Input de prueba:** `{ "student_id": "e5ef486d-498d-4f17-9191-9c4377c65c80", "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** nota **nula** (`null` / "sin nota"), acumulado `0/0` y desglose vacío. **No** devuelve `0` ni `0.00` como nota. La herramienta no falla ni devuelve error por ausencia de datos.
**Estado:** ✅ Aprobado
**Hallazgos:** respuesta: `score: null`, `correct_total: 0`, `question_total: 0`, `lessons: []` — sin error, sin 0.00. Coincide con el comportamiento verificado en TC-012 para el mismo estudiante.

### TC-MCP-004 — El agente no dispone de ninguna herramienta que modifique la nota
**Herramienta probada:** inventario completo de `students-mcp`
**Precondición:** MCP actualizado con la Fase 7.
**Input de prueba:** listado de herramientas del servidor (`./mcp-servers/run-local-mcp.sh students-mcp </dev/null` y/o el panel de MCPs del cliente) + lectura de `docs/mcps/students-agent.system-prompt.md`.
**Output esperado:** entre las herramientas expuestas **no** hay ninguna que escriba, fije, corrija o recalcule la nota de autoevaluaciones; la única incorporación es de lectura. El system prompt del agente docente declara explícitamente la capacidad nueva **y** la restricción de que esa nota **no es editable** por el agente, ni siquiera vía `student_grades`.
**Estado:** ✅ Aprobado
**Hallazgos:** inventario confirmado vía el listado de herramientas conectadas de esta sesión: `list_students`, `get_student`, `create_student`, `update_student`, `delete_student`, `enroll_student`, `unenroll_student`, `get_student_self_assessment_summary` — ninguna escribe, fija, corrige ni recalcula notas. `docs/mcps/students-agent.system-prompt.md` declara la capacidad nueva en "Capacidades" (línea 45-48) y la restricción explícita en "Restricciones": *"La nota de autoevaluaciones no es editable por ti... no intentes alterarla, ni siquiera mediante un `upsert` de `student_grades` desde otro MCP"* (líneas 81-88), incluyendo la instrucción de no reportar `null` como 0.

### TC-MCP-005 — Entradas inválidas devuelven un error claro
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** MCP activo y `npm run dev` corriendo.
**Input de prueba:** (a) `student_id` inexistente; (b) `course_slug` inexistente; (c) `student_id` de un estudiante **no matriculado** en ningún curso académico con ese `course_slug`.
**Output esperado:** en los tres casos, un mensaje de error o una respuesta vacía **explícita y comprensible** (no un stack trace, no un 500, no datos de otro estudiante). El caso (c) deja claro que el estudiante no tiene matrícula para ese curso.
**Estado:** ✅ Aprobado (con un hallazgo menor)
**Hallazgos:** (a) `student_id` inexistente (UUID nulo `00000000-0000-0000-0000-000000000000`): error claro `"Estudiante no encontrado"`, sin stack trace ni 500. (b) `course_slug` inexistente (`curso-inexistente-spec040`) con un `student_id` real (E1): respuesta vacía explícita (`score: null`, `0/0`, `lessons: []`), sin error genérico. (c) `student_id` real pero sin matrícula en `analisis-de-algoritmos` (`test-student-spec038@nodo.test`, matriculado solo en `estructura-de-datos`): devuelve **la misma forma** que (b) y que TC-MCP-003 (`null`/`0/0`/`[]`) — no distingue "sin matrícula en este curso" de "matriculado pero sin preguntas evaluables aún". **Hallazgo menor, no bloqueante:** no hay fuga de datos ni fallo, pero el criterio pedía que el caso (c) "deje claro" la falta de matrícula, y la respuesta actual es indistinguible de un estudiante sí matriculado sin datos. No se registra como debt separado por ser una ambigüedad de mensaje, no un defecto funcional — el agente puede seguir resolviéndolo cruzando con `get_student` si necesita confirmar la matrícula.

---

## Resumen de la ronda
- Aprobados: 26 — Fallidos: 0 — No aplica: 1 (TC-021, spec-039 no cableado en esta rama)
- Dos casos UI aprobados con reservas: TC-013/TC-014 (renombrado imposible por bug real, DEBT-044); TC-015 (hallazgo menor de refresco de UI tras recalcular, no bloqueante).
- Un caso MCP aprobado con reserva: TC-MCP-005 (caso (c) no distingue "sin matrícula en el curso" de "matriculado sin datos aún" — ambigüedad de mensaje, no defecto funcional; no se registra como debt separado).
- Casos MCP (TC-MCP-001 a TC-MCP-005) ejecutados en una sesión posterior, tras reiniciar Claude Code para que `students-mcp` expusiera `get_student_self_assessment_summary` — los 5 resultados coinciden con lo verificado por UI/base de datos en las fases anteriores de la ronda (TC-010, TC-011, TC-012, TC-015).
- Casos dependientes de spec-039: TC-021 marcado **No aplica** — spec-039 está `[DONE]` y mergeado a `development`, pero esta rama no incluye el cableado del filtro BLOQUE 039 (creada antes del merge). Deuda ya registrada como DEBT-043.
- Casos sin UI, ejecutados como verificación asistida por API/base de datos: TC-017 (paso 3), TC-018, TC-019.
- Hallazgos escalados a `docs/specs/backlog.md`: **DEBT-044** (no existe forma de renombrar un ítem de calificación — bug real, `GradeItemsPanel.tsx` sin control de renombrado pese a que la UI lo promete, y la Server Action correspondiente no está cableada a ningún componente).
- Limpieza de datos de prueba: ⬜ Pendiente
  - Orden inverso sugerido: preguntas (`question-bank-mcp` → `delete_question`, incluidas P31, P32 y las de L8) → matrículas (`unenroll_student`) → estudiantes E1–E6 (`delete_student`) → docente D2 → cursos académicos Grupo A y Grupo B.
  - ⚠️ **Los intentos de `self_assessment_attempts`, sus respuestas y las filas de `self_assessment_attempts_discarded` no tienen endpoint de borrado** (intento único, sin política RLS de `delete`). Se eliminan en cascada al borrar el usuario de Auth; si algo sobrevive, reportar los identificadores exactos al usuario en lugar de borrarlos a mano en base de datos.
  - Verificar que el `grade_item` `kind='self_assessment'` de cada curso académico desaparece al eliminar el curso: **no es borrable** por la propia regla del spec (TC-014), así que no puede limpiarse por separado.
  - Nota operativa de esta ronda: TC-019 quitó y volvió a crear el constraint único `self_assessment_attempts_one_per_lesson` en la base de desarrollo — verificado restaurado y funcionando (bloqueó un insert de prueba con `23505`). Sembró además 2 filas en `self_assessment_attempts_discarded` para `(E2, sintaxis-de-python)` que no tienen endpoint de borrado — quedan ahí permanentemente por diseño, documentadas aquí para que no se confundan con datos de producción.
