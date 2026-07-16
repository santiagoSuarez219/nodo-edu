# test-011 — Autoevaluación formativa de cierre de lección

Casos manuales de los flujos con UI del spec-011. Solo se cubren flujos con
interfaz; la lógica server-side (corrección, rechazo de no-matriculados) se valida
indirectamente desde la UI y, cuando exista framework, con las pruebas automáticas
`e2e-011-*`.

> **Precondición general de datos:** existe una lección con al menos dos preguntas
> `multiple_choice` **publicadas** asociadas a su `course_slug`/`lesson_slug` en el
> banco (creadas vía `question-bank-mcp` / API): una de **una** respuesta correcta y
> otra de **varias**. Existe además una lección **sin** preguntas publicadas.

## Casos de prueba

### TC-011-01 — El estudiante matriculado ve la sección de autoevaluación
**Precondición:** sesión de un estudiante con matrícula `active` en el curso; la
lección tiene preguntas `multiple_choice` publicadas.
**Pasos:**
1. Iniciar sesión como el estudiante matriculado.
2. Abrir la lección `/[courseSlug]/[lessonSlug]`.
3. Desplazarse al final, al contenedor de cierre (bajo "Finalizar lección" y
   "Asistencia").
**Resultado esperado:** aparece la sección "Autoevaluación" con las preguntas
`multiple_choice` publicadas de la lección y sus opciones seleccionables.
**Estado:** ✅ Aprobado

### TC-011-02 — Feedback correcto al responder bien (una respuesta)
**Precondición:** TC-011-01 visible; pregunta de **una** respuesta correcta.
**Pasos:**
1. En una pregunta de una sola respuesta, seleccionar la opción correcta (radio).
2. Enviar la respuesta.
**Resultado esperado:** feedback inmediato que marca la pregunta como correcta
(token `--color-success`), sin recarga de página.
**Estado:** ✅ Aprobado

### TC-011-03 — Feedback incorrecto y revelado de la(s) correcta(s)
**Precondición:** TC-011-01 visible.
**Pasos:**
1. Seleccionar una opción **incorrecta** en una pregunta.
2. Enviar la respuesta.
**Resultado esperado:** feedback inmediato que marca la respuesta como incorrecta
(token `--color-danger`) y señala cuál(es) era(n) la(s) correcta(s), sin recarga.
**Estado:** ✅ Aprobado

### TC-011-04 — Radios vs checkboxes según número de respuestas correctas
**Precondición:** TC-011-01 visible; la lección tiene una pregunta de una respuesta
y otra de varias.
**Pasos:**
1. Observar el control de la pregunta de **una** respuesta correcta.
2. Observar el control de la pregunta de **varias** respuestas correctas.
**Resultado esperado:** la de una usa **radios** (selección única); la de varias usa
**checkboxes** (selección múltiple). En ningún caso la UI revela cuántas ni cuáles
son correctas antes de responder.
**Estado:** ✅ Aprobado

### TC-011-05 — Lección sin preguntas publicadas no muestra la sección
**Precondición:** sesión del estudiante matriculado; lección **sin** preguntas
`multiple_choice` publicadas.
**Pasos:**
1. Abrir esa lección y desplazarse al contenedor de cierre.
**Resultado esperado:** **no** aparece la sección "Autoevaluación" (sí pueden
aparecer "Finalizar lección" y "Asistencia").
**Estado:** ✅ Aprobado

### TC-011-06 — El owner/admin no ve la autoevaluación
**Precondición:** sesión del docente dueño del curso (o admin), no matriculado como
estudiante.
**Pasos:**
1. Abrir la misma lección de TC-011-01.
2. Desplazarse al final de la lección.
**Resultado esperado:** **no** se muestra la sección "Autoevaluación" (coherente con
que el contenedor de cierre solo se monta para `reason === "enrolled"`).
**Estado:** ✅ Aprobado

### TC-011-07 — El visitante / no-matriculado no accede
**Precondición:** usuario sin matrícula activa en el curso (o sin sesión).
**Pasos:**
1. Intentar abrir la lección.
**Resultado esperado:** el gate de acceso de la lección (spec-006) actúa como
siempre; si por algún camino se llega a ver el contenido, **no** aparece la sección
"Autoevaluación".
**Estado:** ✅ Aprobado

### TC-011-08 — El payload inicial no expone `is_correct`
**Precondición:** TC-011-01 visible; DevTools abierto.
**Pasos:**
1. Abrir la pestaña Network (y/o inspeccionar el HTML/props hidratados).
2. Cargar la lección con autoevaluación.
3. Inspeccionar los datos de las preguntas entregados al cliente **antes** de
   responder.
**Resultado esperado:** ninguna opción incluye el campo `is_correct` (ni la
respuesta correcta) en el payload inicial; solo `id`, `body`, `order_index`.
**Estado:** ✅ Aprobado

### TC-011-09 — El feedback es efímero (no persiste tras recargar)
**Precondición:** TC-011-02 o TC-011-03 ejecutado (ya hay feedback en pantalla).
**Pasos:**
1. Responder una pregunta y ver el feedback.
2. Recargar la página (F5).
3. Volver a la sección "Autoevaluación".
**Resultado esperado:** la autoevaluación aparece **sin** respuestas ni feedback
previos (estado limpio); no se recuerda ninguna respuesta anterior.
**Estado:** ✅ Aprobado

### TC-011-10 — La sección convive con completar lección y asistencia
**Precondición:** estudiante matriculado; lección con preguntas publicadas y con
sesión de asistencia (o no).
**Pasos:**
1. Abrir la lección y revisar el contenedor de cierre completo.
**Resultado esperado:** las tres secciones ("Finalizar lección", "Asistencia" si
aplica, "Autoevaluación") se muestran juntas, ordenadas y sin romper el layout ni el
modo claro/oscuro.
**Estado:** ✅ Aprobado
