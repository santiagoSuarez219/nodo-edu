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
| Curso académico **Grupo A** (`course_slug=analisis-de-algoritmos`, docente dueño `dev@nodo.local`) | UI de admin `/admin/courses` (spec-036) | `{{academic_course_id_A}}` | ⬜ |
| Curso académico **Grupo B** (mismo `course_slug`, mismo docente) — para TC-022 | UI de admin `/admin/courses` | `{{academic_course_id_B}}` | ⬜ |
| Segundo docente **D2**, dueño de **ningún** curso de la ronda — para TC-017 | Supabase Auth + `user_roles` (inserción directa; requiere autorización explícita del usuario) | `{{teacher_id_D2}}` — `test-teacher-spec040@nodo.test` / `TestTeacher040!` | ⬜ |
| Estudiante **E1** (recorrido principal: L1–L6, criterios 5/6/7) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `{{student_id_E1}}` — `test-e1-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Estudiante **E2** (envíos concurrentes TC-007 y "vio sin responder" TC-015) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `{{student_id_E2}}` — `test-e2-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Estudiante **E3** (denominador 0 — nunca abre una lección con preguntas) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `{{student_id_E3}}` — `test-e3-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Estudiante **E4** (segundo envío por Server Action TC-006 y recálculo masivo TC-016) | `students-mcp` → `create_student` + `enroll_student` (Grupo A) | `{{student_id_E4}}` — `test-e4-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Estudiante **E5**, matriculado activo **a la vez** en Grupo A y Grupo B — para TC-022 | `students-mcp` → `create_student` + dos `enroll_student` | `{{student_id_E5}}` — `test-e5-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Estudiante **E6**, matrícula `withdrawn` en Grupo A — para TC-022 | `students-mcp` → `create_student` + `enroll_student` + `unenroll_student` | `{{student_id_E6}}` — `test-e6-spec040@nodo.test` / `TestStudent040!` | ⬜ |
| Preguntas `multiple_choice` publicadas de L1–L6: **5 por lección, 30 en total** | `question-bank-mcp` → `create_question` + `publish_question` | `{{ids de las 30 preguntas}}` | ⬜ |
| Pregunta **P31**, publicada en L1 **después** de que E1 respondiera — para TC-015 | `question-bank-mcp` → `create_question` + `publish_question` | `{{question_id_P31}}` | ⬜ |
| Pregunta **P32**, publicada en L7 después de que E2 la viera — para TC-015 | `question-bank-mcp` → `create_question` + `publish_question` | `{{question_id_P32}}` | ⬜ |
| Preguntas de L8 (5) — para el filtro de spec-039, TC-021 | `question-bank-mcp` → `create_question` + `publish_question` | `{{ids de las 5 preguntas de L8}}` | ⬜ |
| Intentos duplicados sembrados en `self_assessment_attempts` **antes** de la migración de dedupe — para TC-019 | inserción directa en la base de **desarrollo** (por diseño ya no existe endpoint que los produzca tras la Fase 1; requiere autorización explícita del usuario) | 3 filas para `({{student_id_E2}}, analisis-de-algoritmos, sintaxis-de-python)` | ⬜ |
| Ítem `grade_items` `kind='self_assessment'` creado por el propio RPC | se crea solo (creación perezosa, D5) | `{{grade_item_id}}` (nombre inicial "Autoevaluaciones") | ⬜ |

**Entorno de pruebas:** desarrollo — Supabase local corriendo en `mirp-lab` a través del túnel SSH (ver `CLAUDE.md` → "Base de datos"), con `npm run dev` en esta máquina y `students-mcp` / `question-bank-mcp` en su variante **local**. **Ningún caso de esta ronda se ejecuta contra producción.**
**Fecha de la ronda:** {{fecha}}

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Resultado esperado:** tras cancelar, el formulario vuelve editable con las 3 respuestas intactas y **no se envió nada**; tras recargar, la lección sigue mostrando el formulario sin intento registrado (no aparece revisión de intento). Verificación asistida: `select count(*) from self_assessment_attempts where user_id = {{student_id_E1}} and lesson_slug = 'sintaxis-de-python'` devuelve **0**.
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — Segundo intento invocando la Server Action directamente → `already_submitted`
**Rol que ejecuta:** estudiante **E4** (sesión de estudiante autenticada, invocación fuera de la UI)
**Criterio cubierto:** 1 (capas 2 y 3)
**Precondición:** E4 respondió previamente la autoevaluación de **L2** desde la UI (envío normal, cualquier puntaje). No reutilizar E1/L1: cada envío quema el par estudiante-lección.
**Datos de prueba usados:** `test-e4-spec040@nodo.test` / `TestStudent040!`
**Pasos:**
1. Como E4, responder y enviar la autoevaluación de L2 desde la UI. Anotar el `id` y el `submitted_at` de la fila creada en `self_assessment_attempts`.
2. Invocar `submitSelfAssessment` **fuera de la UI**, con la cookie de sesión de E4 y el mismo `(course_slug, lesson_slug)` — reproduciendo el POST de Server Action de Next desde la consola del navegador o con `curl`. Usar respuestas distintas a las del paso 1 (por ejemplo, todas correctas).
3. Observar el objeto devuelto.
4. Verificación asistida en base de datos: contar filas de `self_assessment_attempts` para `({{student_id_E4}}, analisis-de-algoritmos, fundamentos-control-de-versiones-y-flujo-de-trabajo)` y comparar `id`, `correct_count` y `submitted_at` con lo anotado en el paso 1.
**Resultado esperado:** la respuesta es `{ ok: false, reason: 'already_submitted' }` (no un error genérico ni un 500); el mensaje mostrable es "Ya enviaste esta autoevaluación. Solo se permite un intento porque hace parte de tu nota del curso."; en base de datos hay **exactamente 1 fila**, con el mismo `id`, `correct_count` y `submitted_at` del paso 1 — **no se insertó ni se sobrescribió nada**; tampoco se añadieron filas a `self_assessment_attempt_answers` de ese intento.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-007 — Dos envíos concurrentes producen una sola fila
**Rol que ejecuta:** estudiante **E2**
**Criterio cubierto:** 2
**Precondición:** E2 sin intento en L1; L1 con sus 5 preguntas publicadas.
**Datos de prueba usados:** `test-e2-spec040@nodo.test`
**Pasos:**
1. Como E2, abrir L1 en **dos pestañas** y responder el formulario en ambas.
2. Confirmar el envío en las dos pestañas lo más simultáneamente posible (o disparar dos invocaciones concurrentes de la Server Action con la misma sesión).
3. Observar el resultado en cada pestaña.
4. Verificación asistida: `select count(*), min(id) from self_assessment_attempts where user_id = {{student_id_E2}} and lesson_slug = 'sintaxis-de-python'`, y contar filas en `self_assessment_attempt_answers` para ese intento.
**Resultado esperado:** una pestaña muestra el resultado del intento y la otra el mensaje de intento único (`already_submitted`, **no** un error genérico ni una pantalla de error de aplicación); en base de datos hay **exactamente 1 fila** en `self_assessment_attempts` y **exactamente 5** en `self_assessment_attempt_answers` (ninguna duplicada ni huérfana).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — Escenario 20/25: la nota es 4.00 en la libreta y en `/cuenta/cursos`
**Rol que ejecuta:** estudiante **E1** + docente `dev@nodo.local`
**Criterio cubierto:** 5
**Precondición:** E1 ya respondió L1 con 4/5 (TC-003). Debe completar el escenario: abrir y responder **L2, L3, L4 y L5**, acertando **exactamente 4 de 5 en cada una**. E1 **no** debe haber abierto ninguna otra lección del curso con preguntas publicadas (verificar `lesson_progress` de E1 antes de empezar: solo L1–L5).
**Datos de prueba usados:** `test-e1-spec040@nodo.test`; `{{academic_course_id_A}}`
**Pasos:**
1. Como E1, responder L2, L3, L4 y L5 con 4 aciertos cada una (envío definitivo en cada caso).
2. Abrir `/cuenta/cursos/{{enrollment_id_E1}}` y leer la tarjeta "Autoevaluaciones".
3. Cerrar sesión; iniciar sesión como `dev@nodo.local` y abrir la libreta del curso académico Grupo A.
4. Localizar la columna "Autoevaluaciones" y la fila de E1.
**Resultado esperado:** denominador **25** (5 lecciones × 5 preguntas), numerador **20**, nota **4.00** (`round(20/25*5, 2)`). El estudiante ve "20/25 preguntas correctas" y la nota 4.00; el docente ve **4.00** en la columna "Autoevaluaciones" de E1. Los dos valores coinciden exactamente; ningún redondeo intermedio distinto (4.0, 4, 3.99).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-009 — Abrir una sexta lección sin responderla baja la nota a 3.33
**Rol que ejecuta:** estudiante **E1** + docente `dev@nodo.local`
**Criterio cubierto:** 6
**Precondición:** TC-008 aprobado (E1 en 4.00 con 20/25). L6 con 5 preguntas publicadas y **nunca abierta** por E1.
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Como E1, abrir `/analisis-de-algoritmos/como-resolver-recurrencias` y **no responder nada**; no marcar la lección como completada; no pulsar ningún botón.
2. Salir de la lección y abrir `/cuenta/cursos/{{enrollment_id_E1}}`.
3. Como docente, recargar la libreta de Grupo A **sin** pulsar "Recalcular autoevaluaciones".
4. Volver a abrir L6 dos veces más y repetir el paso 2 (comprobar que no cambia nada por recargar).
**Resultado esperado:** sin ninguna acción adicional del estudiante ni del docente, el denominador pasa a **30** y la nota baja a **3.33** (`round(20/30*5, 2)`); el mismo 3.33 aparece en la libreta del docente. Reabrir L6 varias veces **no** vuelve a alterar la nota ni genera escrituras repetidas (el recálculo se dispara solo cuando la fila de `lesson_progress` es nueva). El desglose muestra L6 como `0/5 — sin responder`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-010 — Responder la sexta lección con 4 correctas sube la nota
**Rol que ejecuta:** estudiante **E1** + docente `dev@nodo.local`
**Criterio cubierto:** 7
**Precondición:** TC-009 aprobado (E1 en 3.33 con 20/30).
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Como E1, responder la autoevaluación de L6 acertando exactamente **4** de 5 y confirmar el envío.
2. Leer la nota en `/cuenta/cursos/{{enrollment_id_E1}}`.
3. Como docente, recargar la libreta de Grupo A.
**Resultado esperado:** acumulado **24/30** y nota **4.00** (`round(24/30*5, 2) = 4.00`), idéntica en las dos vistas; el desglose muestra L6 como `4/5 — respondida`.
> Nota: el criterio de aceptación 7 del spec traía `3.87` junto a la operación `24/30 * 5`, que da `4.00`. Se corrigió el spec a **4.00**, que es lo que produce la fórmula de D4 (`round(correctas/preguntas*5, 2)`). Este caso sigue esa fórmula.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-011 — El desglose del estudiante señala explícitamente las lecciones sin responder
**Rol que ejecuta:** estudiante **E2**
**Criterio cubierto:** 15
**Precondición:** E2 tiene intento en L1 (TC-007) y ha abierto **L7** sin responderla. Publicar antes las 5 preguntas de L7 — o, si se prefiere no tocar L7, usar cualquier lección con preguntas publicadas que E2 no haya respondido.
**Datos de prueba usados:** `test-e2-spec040@nodo.test`
**Pasos:**
1. Como E2, abrir L7 sin responder.
2. Abrir `/cuenta/cursos/{{enrollment_id_E2}}` y leer la tarjeta "Autoevaluaciones" completa.
3. Comprobar el modo oscuro y el viewport móvil.
**Resultado esperado:** la tarjeta muestra (a) la nota 0–5, (b) el acumulado crudo `X/Y correctas` coherente con el desglose, (c) una fila por lección **vista** con estado `Respondida` / `Sin responder` y `correctas/total`, donde L7 aparece como `0/5 — sin responder`, y (d) la nota explicativa "Se cuentan las lecciones que ya abriste. Las autoevaluaciones sin responder cuentan como incorrectas." La penalización es legible sin necesidad de explicación adicional. Las lecciones **no abiertas** no aparecen en el desglose.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-012 — Denominador 0: no aparece ítem ni un 0.00 en la libreta
**Rol que ejecuta:** estudiante **E3** + docente `dev@nodo.local`
**Criterio cubierto:** 8
**Precondición:** E3 matriculado activo en Grupo A y **sin ninguna lección con preguntas publicadas abierta**. Puede abrir, si se quiere, una lección **sin** preguntas publicadas (para comprobar que eso tampoco genera nota).
**Datos de prueba usados:** `test-e3-spec040@nodo.test`
**Pasos:**
1. Como E3, entrar al curso y abrir `/cuenta/cursos/{{enrollment_id_E3}}`.
2. Como docente, abrir la libreta de Grupo A y localizar la fila de E3 en la columna "Autoevaluaciones".
3. Verificación asistida: consultar `student_grades` de la matrícula de E3 para el `grade_item` de autoevaluaciones.
**Resultado esperado:** E3 **no** tiene nota de autoevaluaciones: la libreta muestra la celda vacía / "sin nota", **nunca 0.00**; en `student_grades` no hay fila con `score = 0` para ese ítem (o no hay fila en absoluto). La tarjeta del estudiante indica que todavía no hay nada evaluable, sin mostrar un cero.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-013 — El ítem "Autoevaluaciones" se crea una sola vez y no se duplica (ni tras renombrarlo)
**Rol que ejecuta:** docente `dev@nodo.local`
**Criterio cubierto:** 9
**Precondición:** Grupo A no tenía ítem `kind='self_assessment'` antes de TC-003 (verificado en la preparación). E1 ya generó al menos una propagación.
**Datos de prueba usados:** `{{academic_course_id_A}}`; `{{grade_item_id}}`
**Pasos:**
1. Como docente, abrir la libreta de Grupo A y comprobar que existe una columna llamada **"Autoevaluaciones"** creada automáticamente (nadie la creó a mano).
2. Renombrarla a "Quices de lección" desde la UI de la libreta.
3. Provocar una segunda propagación: como E4, responder la autoevaluación de otra lección (una que E4 no haya respondido).
4. Recargar la libreta de Grupo A y contar las columnas de autoevaluaciones.
5. Verificación asistida: `select id, name, kind, order_index from grade_items where academic_course_id = '{{academic_course_id_A}}' and kind = 'self_assessment'`.
**Resultado esperado:** existe **exactamente un** ítem con `kind='self_assessment'` antes y después del renombrado; la segunda propagación escribe sobre el ítem renombrado ("Quices de lección") y **no crea** un segundo ítem; la consulta devuelve **una sola fila**, con el mismo `id` que antes del renombrado y su `order_index` sin cambios. Las notas ya escritas siguen ahí.
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-016 — "Recalcular autoevaluaciones" actualiza todo el curso y reporta cuántas matrículas tocó
**Rol que ejecuta:** docente `dev@nodo.local`
**Criterio cubierto:** soporte de 6, 11 y de la Fase 5 (retroactivo)
**Precondición:** Grupo A con E1, E2, E3 y E4 matriculados activos y E6 `withdrawn`. Anotar las notas de todos antes de recalcular.
**Datos de prueba usados:** `{{academic_course_id_A}}`
**Pasos:**
1. Como docente, abrir la libreta de Grupo A y pulsar "Recalcular autoevaluaciones".
2. Observar el paso de confirmación previo.
3. Confirmar y leer el reporte devuelto.
4. Recargar la libreta y comparar todas las notas con las anotadas antes.
5. Pulsar el botón **una segunda vez** y volver a comparar.
6. Leer el texto de ayuda de la regla de cálculo que acompaña al botón.
**Resultado esperado:** hay confirmación antes de ejecutar; el reporte indica cuántas **matrículas activas** se actualizaron (E1, E2, E3, E4 — **no** E6, retirada); las notas resultantes coinciden con las que ya se veían (la operación es **idempotente**: la segunda ejecución no cambia ningún valor); E3 (denominador 0) sigue **sin nota**, no aparece con 0.00; el texto de ayuda explica la regla y advierte del efecto de publicar preguntas nuevas (D6).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-017 — Un docente que no es dueño del curso no altera ninguna nota
**Rol que ejecuta:** docente **D2** (no dueño de Grupo A)
**Criterio cubierto:** 14
**Precondición:** D2 creado con rol docente y **sin** ser `teacher_id` de Grupo A ni admin. Anotar todas las notas de autoevaluación de Grupo A antes del caso.
**Datos de prueba usados:** `test-teacher-spec040@nodo.test` / `TestTeacher040!`; `{{academic_course_id_A}}`
**Pasos:**
1. Iniciar sesión como D2 y comprobar que la libreta de Grupo A **no** es accesible desde su navegación.
2. Navegar directamente a la URL de la libreta de Grupo A.
3. Invocar `recalculate_course_self_assessment_grades('{{academic_course_id_A}}')` con la sesión de D2 (RPC vía REST de Supabase), fuera de la UI.
4. Comparar todas las notas de Grupo A con las anotadas.
**Resultado esperado:** D2 no accede a la libreta ajena por UI; la invocación directa del RPC devuelve **`0`** (no un error de permisos que revele información, y desde luego no un recálculo); **ninguna** nota de Grupo A cambia.
> Caso sin UI en el paso 3: se ejecuta como verificación asistida junto al usuario, ya que el criterio 14 no tiene camino por interfaz.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-018 — Un estudiante no puede escribir la nota de otro por la API REST
**Rol que ejecuta:** estudiante **E4**
**Criterio cubierto:** 13
**Precondición:** E1 con nota conocida (la de TC-010). Anotarla.
**Datos de prueba usados:** `test-e4-spec040@nodo.test`; `{{student_id_E1}}`, `{{enrollment_id_E1}}`
**Pasos:**
1. Con la sesión de E4, invocar `recalculate_self_assessment_grade` por REST pasando parámetros adicionales que intenten suplantar a E1 (`p_user_id`, `user_id`, `p_enrollment_id`).
2. Con la sesión de E4, invocar directamente `apply_self_assessment_grade({{student_id_E1}}, {{enrollment_id_E1}}, 'analisis-de-algoritmos')`.
3. Con la sesión de E4, intentar un `upsert` directo en `student_grades` sobre la matrícula de E1.
4. Comparar la nota de E1 con la anotada.
**Resultado esperado:** el paso 1 falla o ignora los parámetros extra (la firma solo acepta `p_course_slug`; el usuario sale de `auth.uid()`); el paso 2 falla por **falta de permiso de ejecución** (`apply_self_assessment_grade` no tiene `execute` para `authenticated`); el paso 3 lo bloquea RLS. La nota de E1 **no cambia** en ningún momento, ni se crea una fila nueva en `student_grades`.
> Caso sin UI: verificación asistida por API, ejecutada junto al usuario. El criterio 13 es de seguridad y no tiene camino por interfaz.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-019 — Deduplicación: sin duplicados tras la migración y con copia archivada
**Rol que ejecuta:** verificación asistida (usuario + Claude) sobre la base de **desarrollo**
**Criterio cubierto:** 12
**Precondición:** base de desarrollo **antes** de aplicar la migración de dedupe, con al menos **3 intentos duplicados** sembrados para `({{student_id_E2}}, analisis-de-algoritmos, sintaxis-de-python)` con `submitted_at` y `correct_count` distintos (por ejemplo 1/5, 3/5 y 5/5, en ese orden temporal). Anotar los tres `id`.
**Datos de prueba usados:** las 3 filas sembradas
**Pasos:**
1. Antes de migrar: `select user_id, course_slug, lesson_slug, count(*) from self_assessment_attempts group by 1,2,3 having count(*) > 1;` — confirmar que el grupo sembrado aparece con 3.
2. Aplicar la migración de dedupe en la base local.
3. Repetir la consulta del paso 1.
4. Consultar `self_assessment_attempts_discarded` y contar/verificar las filas archivadas.
5. Intentar insertar a mano una segunda fila para ese mismo `(user_id, course_slug, lesson_slug)`.
**Resultado esperado:** tras migrar, la consulta del paso 1 devuelve **cero filas**; sobrevive el intento **más antiguo** (el de 1/5, según el criterio confirmado en la Fase 0) y las **2** filas descartadas están íntegras en `self_assessment_attempts_discarded` con `discarded_at` y `discarded_reason`, conservando sus `id` originales; el paso 5 falla con violación de la restricción única (`23505`).
> Caso sin UI: verificación asistida en base de datos. Requiere autorización explícita del usuario para sembrar las filas duplicadas (inserción directa) y **se ejecuta solo en desarrollo**. El mismo chequeo debe repetirse en producción, en modo **solo lectura**, como parte de la Fase 6.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-020 — "Descompletar" una lección no la saca del denominador
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** ninguno explícito — verifica el riesgo documentado en "Riesgos y deuda derivada"
**Precondición:** E1 con una lección respondida y marcada como completada; nota anotada.
**Datos de prueba usados:** `test-e1-spec040@nodo.test`
**Pasos:**
1. Como E1, desmarcar "lección completada" en una lección ya respondida.
2. Recargar `/cuenta/cursos/{{enrollment_id_E1}}`.
3. Como docente, recargar la libreta.
**Resultado esperado:** la nota **no cambia** (la lección sigue vista y sigue contando en el denominador y en el numerador); el desglose la sigue listando como respondida. Comportamiento esperado, no un bug — pero debe estar explicado en el texto de ayuda del docente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Casos de prueba MCP

> Fase 7 del spec: `students-mcp` incorpora `get_student_self_assessment_summary`,
> de **solo lectura**. Ejecutar con la variante **local** del MCP
> (`./mcp-servers/run-local-mcp.sh students-mcp`), con `npm run dev` levantado.

### TC-MCP-001 — El agente obtiene nota, acumulado y desglose de un estudiante
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** TC-010 aprobado (E1 con 24/30 y su nota correspondiente).
**Input de prueba:** `{ "student_id": "{{student_id_E1}}", "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** respuesta de solo lectura con (a) la **nota** 0–5 idéntica a la que muestra la libreta, (b) el **acumulado** `24/30`, y (c) el **desglose por lección** con una entrada por lección vista, cada una con `lesson_slug`, estado respondida / sin responder y `correctas/total`. Los números coinciden exactamente con los de la UI del estudiante y del docente en TC-010/TC-011. Ninguna llamada de escritura acompaña a la lectura.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-002 — El agente puede explicar una nota penalizada por lecciones sin responder
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** E2 con al menos una lección vista y no respondida (TC-011 / TC-015).
**Input de prueba:** `{ "student_id": "{{student_id_E2}}", "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** el desglose marca explícitamente las lecciones **sin responder** con `0/N`, de forma que el agente pueda responder "¿por qué tengo esta nota?" citando lección por lección, sin consultar la base de datos.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-003 — Estudiante sin nada evaluable: nota nula, no 0
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** E3 sin lecciones con preguntas publicadas abiertas (TC-012).
**Input de prueba:** `{ "student_id": "{{student_id_E3}}", "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** nota **nula** (`null` / "sin nota"), acumulado `0/0` y desglose vacío. **No** devuelve `0` ni `0.00` como nota. La herramienta no falla ni devuelve error por ausencia de datos.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-004 — El agente no dispone de ninguna herramienta que modifique la nota
**Herramienta probada:** inventario completo de `students-mcp`
**Precondición:** MCP actualizado con la Fase 7.
**Input de prueba:** listado de herramientas del servidor (`./mcp-servers/run-local-mcp.sh students-mcp </dev/null` y/o el panel de MCPs del cliente) + lectura de `docs/mcps/students-agent.system-prompt.md`.
**Output esperado:** entre las herramientas expuestas **no** hay ninguna que escriba, fije, corrija o recalcule la nota de autoevaluaciones; la única incorporación es de lectura. El system prompt del agente docente declara explícitamente la capacidad nueva **y** la restricción de que esa nota **no es editable** por el agente, ni siquiera vía `student_grades`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-005 — Entradas inválidas devuelven un error claro
**Herramienta probada:** `get_student_self_assessment_summary` en `students-mcp`
**Precondición:** MCP activo y `npm run dev` corriendo.
**Input de prueba:** (a) `student_id` inexistente; (b) `course_slug` inexistente; (c) `student_id` de un estudiante **no matriculado** en ningún curso académico con ese `course_slug`.
**Output esperado:** en los tres casos, un mensaje de error o una respuesta vacía **explícita y comprensible** (no un stack trace, no un 500, no datos de otro estudiante). El caso (c) deja claro que el estudiante no tiene matrícula para ese curso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 27
- Casos dependientes de spec-039: TC-021 (marcar **No aplica** si spec-039 no está mergeado, y confirmar que la deuda quedó registrada en `docs/specs/backlog.md`).
- Casos sin UI, ejecutados como verificación asistida por API/base de datos: TC-017 (paso 3), TC-018, TC-019. Se incluyen porque los criterios 12, 13 y 14 no tienen camino por interfaz y no existe todavía framework de pruebas automáticas (`CLAUDE.md` → "Testing").
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
  - Orden inverso sugerido: preguntas (`question-bank-mcp` → `delete_question`, incluidas P31, P32 y las de L8) → matrículas (`unenroll_student`) → estudiantes E1–E6 (`delete_student`) → docente D2 → cursos académicos Grupo A y Grupo B.
  - ⚠️ **Los intentos de `self_assessment_attempts`, sus respuestas y las filas de `self_assessment_attempts_discarded` no tienen endpoint de borrado** (intento único, sin política RLS de `delete`). Se eliminan en cascada al borrar el usuario de Auth; si algo sobrevive, reportar los identificadores exactos al usuario en lugar de borrarlos a mano en base de datos.
  - Verificar que el `grade_item` `kind='self_assessment'` de cada curso académico desaparece al eliminar el curso: **no es borrable** por la propia regla del spec (TC-014), así que no puede limpiarse por separado.
