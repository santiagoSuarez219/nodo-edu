# test-020 — Revisión y calificación manual del docente

## Datos de prueba

> Montado 2026-07-25 vía la API de servicio (`x-api-key` con `QUESTION_BANK_API_KEY`, misma
> clave para `/api/assignments/*`) contra `npm run dev` local apuntando al único proyecto
> Supabase del repo, y vía REST directo con `SUPABASE_SERVICE_ROLE_KEY` para lo que no tiene
> endpoint de servicio (`grade_items`, reseteo de password) — mismo patrón que test-019.
>
> **Reutilizado de test-018/test-019 (no crear ni borrar):** el docente, el curso, los
> estudiantes A–E y sus matrículas, y el fixture **G2** — incluido su envío ya completo de
> Estudiante A (`submitted`, con las 5 respuestas ya cargadas) — se conservaron intactos
> específicamente para esta ronda (ver "Resumen de la ronda" de `test-019-assignment-solving.md`).
> Reutilizarlos evita fragmentar aún más el banco de preguntas y ahorra tener que volver a
> jugar el flujo de estudiante para tener un envío `submitted` con las 3 (ahora 4, ver más abajo)
> respuestas abiertas ya escritas.
>
> **Ajuste de scope aplicado durante esta preparación:** G2 incluye una pregunta `code_snippet`
> que la redacción original de spec-020 no contemplaba como "abierta" — ver la nota de
> "Ajuste de scope" en `docs/specs/spec-020-assignment-review.md` § Contexto. Corregido en
> `lib/submissions/index.ts` y `components/admin/SubmissionReviewPanel.tsx` antes de esta ronda.

| Recurso | Endpoint/API de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente A = Santiago (cuenta real, reutilizada de test-019 — **no crear ni borrar**) | preexistente | `587ceede-6e6a-484a-a95d-4d62fcda79eb` | N/A |
| Curso académico = "Estructuras de datos" (reutilizado — **no crear ni borrar**) | preexistente | `7bd3f233-c8e0-4e9e-bf2e-634b0a883756` | N/A |
| Docente B — `docente-b@nodo.test`, rol `teacher` puro, dueño de "Curso Docente B" (reutilizado de test-003/018) | preexistente | `e20695ec-f060-4cce-8a56-4fbc94b8eba6` | N/A (reutilizada) |
| Password de Docente B reseteada a `TestPassword123!` (no se conocía la anterior) | `PUT /auth/v1/admin/users/{id}` | — | N/A (cuenta conservada) |
| Estudiante A — `test-student-a@example.com` / `TestPassword123!` (reutilizado de test-019) | preexistente | `e8eaf5d1-705c-48e9-9868-8b4895e99222` | N/A (reutilizada) |
| Estudiante B — `test-student-b@example.com` / `TestPassword123!` (reutilizado de test-019) | preexistente | `30291805-8cbd-40c1-8d3c-82368ce6d02a` | N/A (reutilizada) |
| Matrícula `active` A↔"Estructuras de datos" | preexistente | `52cd45bd-aea7-4fb5-93ec-4e1948233fbd` | N/A (reutilizada) |
| Matrícula `active` B↔"Estructuras de datos" | preexistente | `86c567a0-7740-4287-b869-dabc5c23fa71` | N/A (reutilizada) |
| **grade_item** nuevo "spec-020 QA — Revisión manual" | `POST /rest/v1/grade_items` (sin endpoint de servicio) | `699e8996-fcb9-43d3-aad6-319e571ce763` | ✅ (`DELETE /rest/v1/grade_items`, cascade a `student_grades`) |
| **G2** — evaluación con los 5 tipos de pregunta (reutilizado de test-019), ahora con `grade_item_id` vinculado al ítem nuevo (`PATCH`, antes era `null`) | `PATCH /api/assignments/groups/{id}` | `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84` | ✅ Restaurado `grade_item_id=null` (`PATCH /api/assignments/groups/{id}`) — G2 en sí se conserva (reutilizable) |
| Envío de Estudiante A sobre G2 — `submitted`, 5 respuestas ya cargadas (`multiple_choice` incorrecta, `open_text`/`code_snippet`/`code_write`/`coding_challenge` respondidas, ninguna calificada aún) | preexistente (test-019, TC-028) | `4c49e1cd-1e59-4e20-b688-678a57e9f372` | N/A — se conserva `graded` (fixture reutilizable, no se borra) |
| **G-sinGI** — evaluación nueva "spec-020 QA — sin grade_item" (2 variantes idénticas: `multiple_choice` + `open_text`, sin `grade_item_id`), publicada | `POST /api/assignments/groups` + `/publish` | `4e6f62cb-4d4b-49d2-8d61-7852a0864b26` | ✅ (`DELETE /api/assignments/groups/{id}`, cascade a `assignments`/`assignment_questions`) |
| Envío de Estudiante B sobre G-sinGI — `submitted` (enviado por el usuario en el navegador) | preexistente (spec-019, hecho por el usuario) | `cafac39f-0206-41b7-b2cf-2cbea0ae3170` | ✅ (`DELETE /rest/v1/submissions`, cascade a `answers`, previo a borrar G-sinGI) |

**Entorno de pruebas:** desarrollo (proyecto Supabase único, mismo que test-019)
**Fecha de la ronda:** 2026-07-25

---

## Precondiciones generales

- `npm run dev` levantado, `.env.local` apuntando al único proyecto Supabase del repo.
- Cuentas de prueba (ver tabla "Datos de prueba" arriba):
  - **Docente A** = Santiago — dueño de "Estructuras de datos", de G2 y de G-sinGI.
  - **Docente B** = `docente-b@nodo.test` / `TestPassword123!` — dueño de otro curso, sin
    acceso a los de Docente A.
  - **Estudiante A** = `test-student-a@example.com` / `TestPassword123!` — ya tiene un envío
    `submitted` en G2.
  - **Estudiante B** = `test-student-b@example.com` / `TestPassword123!` — debe enviar G-sinGI
    antes de TC-012 (ver nota arriba).
- G2 (`2fdc3d01-...`) tiene `grade_item_id` vinculado; G-sinGI (`4e6f62cb-...`) no.

---

## Casos de prueba

### TC-001 — Acceso a la ruta de revisión sin sesión
**Precondición:** No hay sesión activa.
**Datos de prueba usados:** `7bd3f233-c8e0-4e9e-bf2e-634b0a883756` (curso), `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84` (G2)
**Pasos:**
1. Abrir directamente `/admin/courses/7bd3f233-c8e0-4e9e-bf2e-634b0a883756/assignments/2fdc3d01-fbfc-4457-9aec-cb1baf38ef84/review`.
**Resultado esperado:** Redirige a `/login?redirectTo=...` (ruta protegida por
`requireAnyRole(["teacher","admin"])`).
**Estado:** ✅ Aprobado
**Hallazgos:** Redirige a login correctamente, sin observaciones.

---

### TC-002 — Acceso a la ruta de revisión con rol estudiante
**Precondición:** Sesión activa con rol `student`.
**Datos de prueba usados:** `test-student-a@example.com` / `TestPassword123!`, misma URL de TC-001
**Pasos:**
1. Iniciar sesión como Estudiante A.
2. Navegar a `/admin/courses/7bd3f233-c8e0-4e9e-bf2e-634b0a883756/assignments/2fdc3d01-fbfc-4457-9aec-cb1baf38ef84/review`.
**Resultado esperado:** No se muestra el panel de revisión; el acceso es rechazado
(redirección a `/` o 404 según la protección de rol de `/admin`).
**Estado:** ✅ Aprobado
**Hallazgos:** Redirige a `/`, sin observaciones.

---

### TC-003 — Listado de envíos separado en pendientes y calificados
**Precondición:** Sesión activa como Docente A. G2 tiene el envío `submitted` de Estudiante A
(`4c49e1cd-...`); todavía no hay ninguno `graded`.
**Datos de prueba usados:** Docente A (`santiago8628@gmail.com`), misma URL de TC-001
**Pasos:**
1. Iniciar sesión como Docente A.
2. Navegar a la revisión de la evaluación.
3. Observar la tabla renderizada por `SubmissionList`.
**Resultado esperado:** Se muestran dos grupos: **pendientes de revisión**
(`status = submitted`, debe listar a Estudiante A) y **calificados** (`status = graded`,
vacío por ahora). Cada fila muestra el estudiante, el estado, las fechas y un enlace al
panel de revisión del envío.
**Estado:** ✅ Aprobado
**Hallazgos:** Tabla "pendientes de revisión" con el registro de Estudiante A; tabla
"calificados" vacía. Sin observaciones.

---

### TC-004 — Abrir un envío y ver el contexto de cada respuesta
**Precondición:** Envío `submitted` de Estudiante A en G2, con las 5 respuestas ya cargadas.
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. Como Docente A, desde `SubmissionList` hacer clic en el enlace de revisión del envío de
   Estudiante A (o abrir directamente `.../review/4c49e1cd-1e59-4e20-b688-678a57e9f372`).
2. Observar el `SubmissionReviewPanel`.
**Resultado esperado:** Se muestran las 5 respuestas con el contexto de su pregunta
(enunciado, código/lenguaje si aplica, opciones marcadas, rúbrica y puntaje máximo). La
`multiple_choice` aparece **resuelta / en solo lectura** (marcada incorrecta, `auto_score=0`)
y las 4 abiertas (`open_text`, `code_snippet`, `code_write`, `coding_challenge`) exponen los
controles de calificación (`score` y `notes`); `open_text` y `code_write` muestran su
rúbrica, `code_snippet` y `coding_challenge` no (no tienen rúbrica cargada — opcional).
**Estado:** ✅ Aprobado
**Hallazgos:** Coincide con el resultado esperado, sin observaciones.

---

### TC-005 — Asignar `manual_score` y `reviewer_notes` válidos a una respuesta abierta
**Precondición:** Panel de revisión abierto sobre el envío de Estudiante A en G2.
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`, respuesta `open_text`
(`7b4a83f4-...`, `points=2`)
**Pasos:**
1. En la respuesta `open_text` ("Explica la diferencia entre pila y cola..."), ingresar un
   `score` dentro del rango `0..2` (ej. `1.5`).
2. Escribir un texto en `reviewer_notes`.
3. Guardar la calificación de la respuesta.
**Resultado esperado:** El guardado es exitoso (feedback visible de guardado). Se persisten
`manual_score`, `reviewer_notes` y `reviewed_at`. Al recargar la página el `score` y las
notas se mantienen.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

---

### TC-006 — Puntaje por encima del máximo (fuera de rango)
**Precondición:** Panel de revisión abierto; misma respuesta `open_text` de TC-005 (`points=2`).
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. Ingresar un `score` mayor que `2` (ej. `3`).
2. Intentar guardar.
**Resultado esperado:** El sistema rechaza el guardado con un mensaje de error legible
(el rango válido es `0..2`). No se persiste el valor inválido.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

---

### TC-007 — Puntaje negativo (fuera de rango)
**Precondición:** Panel de revisión abierto; misma respuesta `open_text` de TC-005.
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. Ingresar un `score` negativo (ej. `-1`).
2. Intentar guardar.
**Resultado esperado:** El sistema rechaza el guardado con mensaje de error legible; no se
persiste el valor. El `manual_score` previo (`1.5` de TC-005) no se altera.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

---

### TC-008 — Calificar los cuatro tipos de respuesta abierta
**Precondición:** Envío `submitted` de Estudiante A en G2, con `open_text` ya calificada
(TC-005); `code_snippet`, `code_write` y `coding_challenge` pendientes.
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. Asignar `manual_score` válido y notas a la respuesta `code_snippet` ("¿Qué imprime este
   fragmento...", `points=1`).
2. Repetir para la respuesta `code_write` ("Escribe una función que sume una lista...",
   `points=2`).
3. Repetir para la respuesta `coding_challenge` ("Implementa fibonacci(n)...", `points=2`;
   se califica manualmente, el runner está deshabilitado).
**Resultado esperado:** Las tres respuestas se guardan correctamente con su `manual_score`
y `reviewer_notes`. La `coding_challenge` se trata como cualquier respuesta abierta (sin
ejecución automática de código). Junto con `open_text` (TC-005), las 4 respuestas abiertas
del envío quedan calificadas.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

---

### TC-009 — Finalizar la calificación combina auto + manual
**Precondición:** Envío `submitted` de Estudiante A en G2 con las 4 respuestas abiertas ya
calificadas (TC-005/TC-008) y la `multiple_choice` con `auto_score=0` ya calculado.
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. En el `SubmissionReviewPanel`, hacer clic en "Finalizar calificación".
**Resultado esperado:** El `final_score` mostrado equivale a la suma de `auto_score=0`
(`multiple_choice`) más los 4 `manual_score` recién asignados, redondeado a 2 decimales.
El envío pasa a `status = graded` y se fija `graded_at`.
**Estado:** ✅ Aprobado
**Hallazgos:** El botón "Finalizar calificación" desaparece y los campos de calificación
quedan deshabilitados; la calificación final se muestra en la parte superior del panel.

---

### TC-010 — El envío calificado aparece en la sección "calificados"
**Precondición:** Se acaba de finalizar la calificación del envío de Estudiante A (TC-009).
**Datos de prueba usados:** misma URL de listado de TC-003
**Pasos:**
1. Volver a la ruta `.../review` (listado de envíos de G2).
2. Observar en qué grupo aparece el envío recién finalizado.
**Resultado esperado:** El envío de Estudiante A ya no está en "pendientes de revisión";
aparece en el grupo de **calificados** (`graded`) con su `final_score`.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

---

### TC-011 — Propagación de `final_score` a `student_grades` con `grade_item` vinculado
**Precondición:** G2 tiene `grade_item_id` vinculado al ítem nuevo "spec-020 QA — Revisión
manual" (`699e8996-...`). El envío de Estudiante A ya fue finalizado en TC-009.
**Datos de prueba usados:** `699e8996-fcb9-43d3-aad6-319e571ce763` (grade_item),
`52cd45bd-aea7-4fb5-93ec-4e1948233fbd` (matrícula de A)
**Pasos:**
1. (Ya ejecutado en TC-009 — este caso solo verifica el efecto.)
2. Como Docente A, revisar la libreta de calificaciones del curso
   (`/admin/courses/7bd3f233-c8e0-4e9e-bf2e-634b0a883756/grades`), o iniciar sesión como
   Estudiante A y abrir `/cuenta/cursos/52cd45bd-aea7-4fb5-93ec-4e1948233fbd`.
**Resultado esperado:** La nota de "spec-020 QA — Revisión manual" refleja el `final_score`
propagado (upsert por `enrollment_id + grade_item_id`). El valor coincide con el
`final_score` calculado en TC-009.
**Estado:** ✅ Aprobado (tras fix)
**Hallazgos:** Fallo real encontrado en la primera ejecución: `student_grades.score` tiene
un CHECK `0..5` (escala de la libreta), pero `final_score` es la suma cruda de puntos de
la variante (G2 sumó 6, sobre 8 posibles) — el upsert en `propagateFinalScoreToGradeItem`
(`lib/submissions/index.ts`) violaba el constraint y fallaba en silencio (`console.error`,
sin propagar el error a la UI). Corregido: se normaliza el `final_score` a escala 0-5
usando el total de puntos posibles de la variante (`6/8 * 5 = 3.75`), y la función ahora
devuelve `{ ok:false, error }` si la propagación falla en vez de tragarlo. Mismo fix
aplicado al RPC `propagate_submission_grade` de spec-019 (mismo root cause, ver
`supabase/migrations/20260729000001_normalize_grade_propagation_scale.sql`). Envío
reseteado a `submitted` vía REST (sin endpoint para "des-finalizar") y re-finalizado desde
la UI: verificado por API que `student_grades` ahora tiene `score=3.75` para
`enrollment_id=52cd45bd-...` + `grade_item_id=699e8996-...`. La columna no aparecía en la
libreta por scroll horizontal (la columna de prueba quedó al final, `order_index=90`), no
por un bug — confirmado visible tras desplazarse.

---

### TC-012 — Sin propagación cuando la asignación no tiene `grade_item`
**Precondición:** G-sinGI (`4e6f62cb-...`, sin `grade_item_id`) tiene un envío `submitted`
de Estudiante B — **requiere que el usuario lo haya enviado antes** (ver nota en "Datos de
prueba" arriba: abrir `/cuenta/cursos/86c567a0-7740-4287-b869-dabc5c23fa71/evaluaciones/4e6f62cb-4d4b-49d2-8d61-7852a0864b26`
como Estudiante B, responder y enviar).
**Datos de prueba usados:** `4e6f62cb-4d4b-49d2-8d61-7852a0864b26` (G-sinGI)
**Pasos:**
1. Como Docente A, calificar la respuesta `open_text` del envío de Estudiante B en G-sinGI
   y finalizar la calificación.
2. Revisar la libreta de calificaciones del curso (`/admin/courses/7bd3f233-c8e0-4e9e-bf2e-634b0a883756/grades`)
   y el detalle de la matrícula de Estudiante B.
**Resultado esperado:** El envío queda `graded` con su `final_score`, pero **no** se crea
ni modifica ninguna fila en `student_grades`; la libreta no muestra una nota nueva por
esta asignación.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado vía REST: el envío quedó `graded`, `final_score=1.00`,
`graded_at` fijado. Ninguna nota nueva en la libreta, como se esperaba (sin
`grade_item_id` vinculado). Nota: dado el bug de TC-011, no propagar tampoco ocurriría
por la razón equivocada si `finalizeGrading` nunca propaga; no invalida este caso pero
refuerza la necesidad de corregir TC-011 antes de confiar en el comportamiento general de
propagación.

---

### TC-013 — Re-finalización idempotente sobre `student_grades`
**Precondición:** El envío de Estudiante A en G2 ya está `graded` (TC-009/TC-011).
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`, `699e8996-fcb9-43d3-aad6-319e571ce763`
**Pasos:**
1. La UI no expone recalificación de un envío ya `graded` (fuera de scope de spec-020, ver
   "No incluye"): el botón "Finalizar calificación" no aparece y los inputs quedan
   deshabilitados. Verificar esto en pantalla.
2. Revisar en la libreta que existe **una sola** fila para "spec-020 QA — Revisión manual"
   en la matrícula de Estudiante A (no duplicada).
**Resultado esperado:** No se duplican filas en `student_grades` — hay exactamente una fila
por `enrollment_id + grade_item_id`, con el `final_score` de TC-009/TC-011. La UI confirma
que un envío `graded` no admite una segunda finalización.
**Estado:** ✅ Aprobado
**Hallazgos:** Paso 1 (UI: botón "Finalizar calificación" ausente, inputs deshabilitados
para un envío ya `graded`) pasó correctamente. Paso 2, re-verificado tras el fix de
TC-011: existe exactamente una fila en `student_grades` para
`enrollment_id=52cd45bd-...` + `grade_item_id=699e8996-...` (`score=3.75`), sin
duplicados.

---

### TC-014 — Aislamiento: Docente B no lista envíos de un curso ajeno
**Precondición:** Docente B (`docente-b@nodo.test`, teacher puro) no es dueño de
"Estructuras de datos".
**Datos de prueba usados:** `docente-b@nodo.test` / `TestPassword123!`, URL de TC-001
**Pasos:**
1. Iniciar sesión como Docente B.
2. Intentar acceder directamente a
   `/admin/courses/7bd3f233-c8e0-4e9e-bf2e-634b0a883756/assignments/2fdc3d01-fbfc-4457-9aec-cb1baf38ef84/review`.
**Resultado esperado:** No se muestran los envíos del curso ajeno; el acceso devuelve 404
(RLS de `assignment_variant_groups`/`submissions` filtra y `requireAnyRole` protege la ruta).
**Estado:** ✅ Aprobado
**Hallazgos:** Devuelve 404, sin observaciones.

---

### TC-015 — Aislamiento: Docente B no abre ni califica un envío ajeno
**Precondición:** Docente B conoce el `submissionId` del envío de Estudiante A en G2.
**Datos de prueba usados:** `docente-b@nodo.test` / `TestPassword123!`,
`4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. Como Docente B, acceder directamente a
   `/admin/courses/7bd3f233-c8e0-4e9e-bf2e-634b0a883756/assignments/2fdc3d01-fbfc-4457-9aec-cb1baf38ef84/review/4c49e1cd-1e59-4e20-b688-678a57e9f372`.
2. Intentar guardar un `manual_score` o finalizar la calificación (p. ej. reenviando la
   Server Action con curl/DevTools si la UI ya bloqueó la carga).
**Resultado esperado:** El panel no carga el envío ajeno (404) y cualquier intento de
calificar/finalizar es rechazado por RLS (`gradeAnswer`/`finalizeGrading` devuelven
`"No tienes acceso..."`, ver Fase 4 del spec). No se altera ningún dato del envío de A.
**Estado:** ✅ Aprobado
**Hallazgos:** Devuelve 404, el panel no carga el envío ajeno. Sin observaciones.

---

### TC-016 — Respuestas objetivas en solo lectura
**Precondición:** Panel de revisión abierto sobre el envío de Estudiante A en G2 (tiene una
respuesta `multiple_choice`).
**Datos de prueba usados:** `4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. Observar la sección de la respuesta `multiple_choice` ("¿Cuál es la diferencia principal
   entre Git y GitHub?").
2. Intentar editar su puntaje.
**Resultado esperado:** La respuesta objetiva se muestra ya resuelta (opción marcada,
incorrecta, `auto_score=0`) sin controles editables de `manual_score`.
**Estado:** ✅ Aprobado
**Hallazgos:** No aparece la opción de editar puntaje, sin observaciones.

---

### TC-017 — Modo oscuro y consistencia visual en las rutas de revisión
**Precondición:** Modo oscuro activado (no hay toggle manual — depende de
`prefers-color-scheme`, ver `ThemeInit.tsx`; cambiarlo desde DevTools o la configuración del
sistema operativo).
**Datos de prueba usados:** URL de listado de TC-003, `4c49e1cd-1e59-4e20-b688-678a57e9f372`
**Pasos:**
1. Revisar visualmente `.../assignments/2fdc3d01-fbfc-4457-9aec-cb1baf38ef84/review` (listado).
2. Revisar `.../review/4c49e1cd-1e59-4e20-b688-678a57e9f372` (panel de revisión con
   respuestas abiertas y objetivas).
**Resultado esperado:** Fondos, textos, bordes, inputs y bloques de código respetan la
paleta oscura de `DESIGN.md` y usan JetBrains Mono. Sin textos ilegibles ni fondos blancos
en modo oscuro; sin valores crudos de paleta.
**Estado:** ✅ Aprobado
**Hallazgos:** Todo se ve correctamente, sin observaciones.

---

## Resumen de la ronda

- Aprobados: 17/17 — Fallidos: 0 — Pendientes: 0
- **Bug real encontrado y corregido durante la ronda (TC-011):** `finalizeGrading` no
  propagaba el `final_score` a `student_grades` cuando la asignación tenía
  `grade_item_id` vinculado, porque `student_grades.score` exige escala 0-5 y
  `final_score` es la suma cruda de puntos de la variante (podía superar 5). El upsert
  violaba el CHECK constraint y fallaba en silencio (`console.error`, sin propagar el
  error). Corregido en `lib/submissions/index.ts` (normalización a escala 0-5 +
  propagación explícita de errores) y en el RPC `propagate_submission_grade` de
  spec-019 (mismo root cause — `supabase/migrations/20260729000001_normalize_grade_propagation_scale.sql`,
  aplicada vía `supabase db push`). TC-011 y el paso 2 de TC-013 re-ejecutados y
  aprobados tras el fix.
- Hallazgos escalados a `docs/specs/backlog.md`:
  - DEBT-009 — redirigir al listado de envíos tras finalizar calificación (mejora de
    UX fuera del scope aprobado, reportada por el usuario durante TC-009/TC-010).
  - DEBT-010 — error de consola "script tag while rendering" en `app/layout.tsx`
    (init de tema, Next 16), ajeno al scope de spec-020.
- Limpieza de datos de prueba: ✅ Completada (2026-07-29) — eliminados el `grade_item`
  de prueba (cascade a su fila en `student_grades`), G-sinGI y sus 2 variantes/preguntas
  (cascade), y el envío de Estudiante B sobre G-sinGI (cascade a sus respuestas);
  restaurado `grade_item_id=null` en G2. Se conservan (reutilizables para futuras
  rondas): docente A/B, curso, estudiantes A/B, matrículas, G2 y el envío `graded` de
  Estudiante A sobre G2. Verificado por API que todos los recursos eliminados devuelven
  `[]` y que G2 quedó con `grade_item_id=null`.
