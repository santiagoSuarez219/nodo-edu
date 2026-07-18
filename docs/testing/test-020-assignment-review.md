# test-008 — Revisión y calificación manual del docente

## Precondiciones generales

- Supabase local corriendo (`supabase start`).
- Cuentas de prueba disponibles:
  - **Docente A:** usuario con rol `teacher` (dueño del curso académico bajo prueba).
  - **Docente B:** usuario con rol `teacher` puro (dueño de otro curso, sin acceso al de A).
  - **Estudiante:** usuario con rol `student`, matriculado en el curso del Docente A.
- Datos base (spec-003/006/007):
  - Un curso académico del Docente A con al menos un estudiante matriculado (`enrollment` activo).
  - Una asignación (`assignment`) publicada con al menos:
    - Una pregunta objetiva `multiple_choice`.
    - Al menos una pregunta abierta de cada tipo relevante: `open_text`, `code_write`,
      `coding_challenge`, cada una con `points` definido y `rubric` opcional.
  - Al menos un envío del estudiante en estado `submitted` (con `auto_score` ya calculado
    para las objetivas al enviar en spec-019).
  - Para los casos de propagación: una asignación con `grade_item_id` vinculado y otra sin él.
- Variables de entorno en `.env.local` apuntando al proyecto local.

---

## Casos de prueba

### TC-001 — Acceso a la ruta de revisión sin sesión
**Precondición:** No hay sesión activa.
**Pasos:**
1. Abrir directamente `/admin/courses/[academicCourseId]/assignments/[assignmentId]/review`.
**Resultado esperado:** Redirige a `/login?redirectTo=...` (ruta protegida por
`requireAnyRole(["teacher","admin"])`).
**Estado:** ⬜ Pendiente

---

### TC-002 — Acceso a la ruta de revisión con rol estudiante
**Precondición:** Sesión activa con rol `student`.
**Pasos:**
1. Iniciar sesión como estudiante.
2. Navegar a `/admin/courses/[academicCourseId]/assignments/[assignmentId]/review`.
**Resultado esperado:** No se muestra el panel de revisión; el acceso es rechazado
(redirección a `/` o 404 según la protección de rol de `/admin`).
**Estado:** ⬜ Pendiente

---

### TC-003 — Listado de envíos separado en pendientes y calificados
**Precondición:** Sesión activa como Docente A. La asignación tiene al menos un envío
`submitted` y (si es posible) uno `graded`.
**Pasos:**
1. Iniciar sesión como Docente A.
2. Navegar a la revisión de la asignación (`.../assignments/[assignmentId]/review`).
3. Observar la tabla renderizada por `SubmissionList`.
**Resultado esperado:** Se muestran dos grupos: **pendientes de revisión**
(`status = submitted`) y **calificados** (`status = graded`). Cada fila muestra el
estudiante, el estado, las fechas y un enlace al panel de revisión del envío.
**Estado:** ⬜ Pendiente

---

### TC-004 — Abrir un envío y ver el contexto de cada respuesta
**Precondición:** Existe un envío `submitted` con respuestas objetivas y abiertas.
**Pasos:**
1. Como Docente A, desde `SubmissionList` hacer clic en el enlace de revisión de un envío.
2. Observar el `SubmissionReviewPanel`.
**Resultado esperado:** Por cada respuesta se muestra el contexto de su pregunta
(enunciado, código/lenguaje si aplica, opciones marcadas, rúbrica y puntaje máximo).
Las respuestas objetivas (`multiple_choice`) aparecen **resueltas / en solo lectura** y
las abiertas (`open_text`, `code_write`, `coding_challenge`) exponen los controles de
calificación (`score` y `notes`) con la rúbrica visible como guía.
**Estado:** ⬜ Pendiente

---

### TC-005 — Asignar `manual_score` y `reviewer_notes` válidos a una respuesta abierta
**Precondición:** Panel de revisión abierto sobre un envío `submitted`.
**Pasos:**
1. En una respuesta abierta con `points = P`, ingresar un `score` dentro del rango `0..P`
   (ej. un valor intermedio válido).
2. Escribir un texto en `reviewer_notes`.
3. Guardar la calificación de la respuesta.
**Resultado esperado:** El guardado es exitoso (feedback visible de guardado). Se persisten
`manual_score`, `reviewer_notes` y `reviewed_at`. Al recargar la página el `score` y las
notas se mantienen.
**Estado:** ⬜ Pendiente

---

### TC-006 — Puntaje por encima del máximo (fuera de rango)
**Precondición:** Panel de revisión abierto; respuesta abierta con `points = P`.
**Pasos:**
1. Ingresar un `score` mayor que `P` (ej. `P + 1`).
2. Intentar guardar.
**Resultado esperado:** El sistema rechaza el guardado con un mensaje de error legible
(el rango válido es `0..P`). No se persiste el valor inválido.
**Estado:** ⬜ Pendiente

---

### TC-007 — Puntaje negativo (fuera de rango)
**Precondición:** Panel de revisión abierto; respuesta abierta con `points = P`.
**Pasos:**
1. Ingresar un `score` negativo (ej. `-1`).
2. Intentar guardar.
**Resultado esperado:** El sistema rechaza el guardado con mensaje de error legible; no se
persiste el valor. El `manual_score` previo (si existía) no se altera.
**Estado:** ⬜ Pendiente

---

### TC-008 — Calificar los tres tipos de respuesta abierta
**Precondición:** Envío `submitted` con respuestas `open_text`, `code_write` y
`coding_challenge` pendientes.
**Pasos:**
1. Asignar `manual_score` válido y notas a la respuesta `open_text`.
2. Repetir para la respuesta `code_write`.
3. Repetir para la respuesta `coding_challenge` (se califica manualmente; el runner está
   deshabilitado).
**Resultado esperado:** Las tres respuestas se guardan correctamente con su `manual_score`
y `reviewer_notes`. La `coding_challenge` se trata como cualquier respuesta abierta (sin
ejecución automática de código).
**Estado:** ⬜ Pendiente

---

### TC-009 — Finalizar la calificación combina auto + manual
**Precondición:** Envío `submitted` con todas las respuestas abiertas ya calificadas
(`manual_score` asignado) y las objetivas con `auto_score` calculado.
**Pasos:**
1. En el `SubmissionReviewPanel`, hacer clic en "Finalizar calificación".
**Resultado esperado:** El `final_score` mostrado equivale a la suma, por respuesta, del
`auto_score` (objetivas) más el `manual_score` (abiertas), redondeado a 2 decimales. El
envío pasa a `status = graded` y se fija `graded_at`.
**Estado:** ⬜ Pendiente

---

### TC-010 — El envío calificado aparece en la sección "calificados"
**Precondición:** Se acaba de finalizar la calificación de un envío (TC-009).
**Pasos:**
1. Volver a la ruta `.../review` (listado de envíos).
2. Observar en qué grupo aparece el envío recién finalizado.
**Resultado esperado:** El envío ya no está en "pendientes de revisión"; aparece en el
grupo de **calificados** (`graded`) con su `final_score`.
**Estado:** ⬜ Pendiente

---

### TC-011 — Propagación de `final_score` a `student_grades` con `grade_item` vinculado
**Precondición:** La asignación finalizada tiene `grade_item_id` vinculado. El estudiante
está matriculado (`enrollment_id` conocido).
**Pasos:**
1. Finalizar la calificación de un envío de esa asignación.
2. Iniciar sesión como el estudiante y abrir el detalle de su matrícula
   (`/cuenta/cursos/[enrollmentId]`), o como Docente A revisar la libreta
   (`/admin/courses/[id]/grades`).
**Resultado esperado:** La nota del `grade_item` vinculado refleja el `final_score`
propagado (upsert por `enrollment_id + grade_item_id`). El valor coincide con el
`final_score` calculado en TC-009.
**Estado:** ⬜ Pendiente

---

### TC-012 — Sin propagación cuando la asignación no tiene `grade_item`
**Precondición:** Una asignación finalizada **sin** `grade_item_id` vinculado.
**Pasos:**
1. Finalizar la calificación de un envío de esa asignación.
2. Revisar la libreta de calificaciones del curso (`/admin/courses/[id]/grades`) y el
   detalle de la matrícula del estudiante.
**Resultado esperado:** El envío queda `graded` con su `final_score`, pero **no** se crea
ni modifica ninguna fila en `student_grades`; la libreta no muestra una nota nueva por
esta asignación.
**Estado:** ⬜ Pendiente

---

### TC-013 — Re-finalización idempotente sobre `student_grades`
**Precondición:** Un envío ya `graded` de una asignación con `grade_item_id`.
**Pasos:**
1. (Si la UI lo permite) Ajustar un `manual_score` y volver a finalizar, o simplemente
   verificar el estado tras una finalización.
2. Revisar la nota en `student_grades`.
**Resultado esperado:** No se duplican filas en `student_grades`; el upsert por
`enrollment_id + grade_item_id` actualiza la fila existente con el `final_score` vigente.
**Estado:** ⬜ Pendiente

---

### TC-014 — Aislamiento: Docente B no lista envíos de un curso ajeno
**Precondición:** Docente B (teacher puro) no es dueño del curso del Docente A.
**Pasos:**
1. Iniciar sesión como Docente B.
2. Intentar acceder directamente a
   `/admin/courses/[academicCourseId de A]/assignments/[assignmentId]/review`.
**Resultado esperado:** No se muestran los envíos del curso ajeno; el acceso devuelve 404
(RLS de `submissions`/`answers` filtra y `requireAnyRole` protege la ruta).
**Estado:** ⬜ Pendiente

---

### TC-015 — Aislamiento: Docente B no abre ni califica un envío ajeno
**Precondición:** Docente B conoce el `submissionId` de un envío del curso del Docente A.
**Pasos:**
1. Como Docente B, acceder directamente a
   `/admin/courses/[academicCourseId de A]/assignments/[assignmentId]/review/[submissionId]`.
2. Intentar guardar un `manual_score` o finalizar la calificación.
**Resultado esperado:** El panel no carga el envío ajeno (404) y cualquier intento de
calificar/finalizar es rechazado por RLS. No se altera ningún dato del envío del Docente A.
**Estado:** ⬜ Pendiente

---

### TC-016 — Respuestas objetivas en solo lectura
**Precondición:** Panel de revisión abierto sobre un envío con una respuesta
`multiple_choice`.
**Pasos:**
1. Observar la sección de la respuesta objetiva.
2. Intentar editar su puntaje.
**Resultado esperado:** La respuesta objetiva se muestra ya resuelta (opción marcada,
correcta/incorrecta, `auto_score`) sin controles editables de `manual_score`.
**Estado:** ⬜ Pendiente

---

### TC-017 — Modo oscuro y consistencia visual en las rutas de revisión
**Precondición:** Modo oscuro activado (toggle en navbar).
**Pasos:**
1. Revisar visualmente `.../assignments/[assignmentId]/review` (listado).
2. Revisar `.../review/[submissionId]` (panel de revisión con respuestas abiertas y
   objetivas).
**Resultado esperado:** Fondos, textos, bordes, inputs y bloques de código respetan la
paleta oscura de `DESIGN.md` y usan JetBrains Mono. Sin textos ilegibles ni fondos blancos
en modo oscuro; sin valores crudos de paleta.
**Estado:** ⬜ Pendiente
