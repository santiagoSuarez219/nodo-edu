# test-043 — Formato de código en enunciados y opciones de preguntas

## Datos de prueba

> Recursos creados vía `question-bank-mcp` y `assignment-mcp` contra el entorno
> de **desarrollo** (instancia local en `mirp-lab`, ver `CLAUDE.md` → "Base de
> datos"). Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|----------------------|---------------|-----------|
| Pregunta Q1 — `multiple_choice`, backtick simple en `stem` y en una opción | `create_question` (`POST /api/questions`) | `{{id}}` | ⬜ |
| Pregunta Q2 — `multiple_choice`, cerca de una línea ```` ```int``` ```` en las opciones | `create_question` | `{{id}}` | ⬜ |
| Pregunta Q3 — `multiple_choice`, cerca multilínea ```` ```python ```` en el `stem` | `create_question` | `{{id}}` | ⬜ |
| Pregunta Q4 — `multiple_choice`, backtick suelto sin cerrar + `<div>` literal en el `stem` | `create_question` | `{{id}}` | ⬜ |
| Pregunta Q5 — `open_text`, backticks en el `stem` | `create_question` | `{{id}}` | ⬜ |
| Pregunta Q6 — `code_write`, backticks en el `stem` + campo `code_snippet` poblado | `create_question` | `{{id}}` | ⬜ |
| Montaje de Q1–Q4 en una lección de prueba | `mount_question_in_lesson` | `{{lessonSlug}}` | ⬜ |
| Grupo de evaluación con variantes A/B/C que incluyen Q1, Q3, Q5 y Q6 | `create_assignment_group` + `replace_variant_questions` | `{{groupId}}` | ⬜ |
| Envío de evaluación de un estudiante de prueba | UI del estudiante | `{{submissionId}}` | ⬜ |

**Textos exactos a usar al crear las preguntas** (copiar literal, los backticks
son parte del dato):

- Q1 `stem`: ``¿Qué imprime `print(len(x))` si `x = [1, 2]`?``
  Opción A: ``Imprime `2` ``  · Opción B: ``Lanza un `TypeError` ``
- Q2 opciones: ```` Devuelve un ```int``` ```` / ```` Devuelve un ```float``` ````
- Q3 `stem`:
  ```
  Observa el siguiente fragmento:

  ```python
  def suma(a, b):
      return a + b
  ```

  ¿Cuál es el valor de `suma(2, 3)`?
  ```
- Q4 `stem`: ``¿Qué hace `open(archivo? El elemento <div> se cuenta & se ignora.``
- Q5 `stem`: ``Explica con tus palabras qué hace el método `list.append()`.``
- Q6 `stem`: ``Implementa la función `factorial(n)` de forma recursiva.``

**Entorno de pruebas:** desarrollo (`mirp-lab`, `npm run dev` en el puerto 3002)
**Fecha de la ronda:** {{pendiente}}

---

## Casos de prueba

### TC-043-001 — Código inline en el enunciado de la autoevaluación
**Precondición:** Q1 montada en la lección de prueba; sesión iniciada como
estudiante matriculado; la lección aún sin autoevaluación respondida.
**Datos de prueba usados:** Q1
**Pasos:**
1. Navegar a `/{{courseSlug}}/{{lessonSlug}}`.
2. Bajar hasta la sección de autoevaluación de cierre.
3. Observar el enunciado de Q1.

**Resultado esperado:** El enunciado se lee "¿Qué imprime `print(len(x))` si
`x = [1, 2]`?" con `print(len(x))` y `x = [1, 2]` en fragmentos monoespaciados
con fondo y borde sutil. **No se ve ningún backtick.** El resto de la frase
conserva la tipografía normal del enunciado.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-002 — Código inline en las opciones de selección múltiple
**Precondición:** la de TC-043-001.
**Datos de prueba usados:** Q1, Q2
**Pasos:**
1. En la misma autoevaluación, observar las opciones de Q1 y de Q2.
2. Verificar que el área clicable de cada opción sigue funcionando: hacer clic
   sobre el fragmento de código de una opción.

**Resultado esperado:** En Q1 se ven `2` y `TypeError` como fragmentos
monoespaciados. En Q2 se ven `int` y `float` (la cerca de triple backtick de una
sola línea se trata como inline). Sin backticks visibles. El clic sobre el
fragmento de código selecciona la opción igual que el clic sobre el texto, y la
fila no se desalinea verticalmente.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-003 — Bloque de código multilínea en el enunciado
**Precondición:** Q3 montada en la lección de prueba.
**Datos de prueba usados:** Q3
**Pasos:**
1. Observar el enunciado de Q3 en la autoevaluación.
2. Reducir el ancho de la ventana hasta ~380 px.

**Resultado esperado:** El fragmento `def suma(a, b): / return a + b` aparece
como bloque monoespaciado con el salto de línea y la indentación de 4 espacios
preservados. El texto anterior y posterior al bloque se muestra como párrafo
normal, y `suma(2, 3)` aparece como fragmento inline. Al angostar la ventana el
bloque hace scroll horizontal propio: la página **no** se desborda ni aparece
scroll horizontal en el `body`.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-004 — Texto sin backticks y backtick suelto (no regresión)
**Precondición:** Q4 montada en la lección de prueba.
**Datos de prueba usados:** Q4
**Pasos:**
1. Observar el enunciado de Q4.
2. Observar cualquier pregunta preexistente de la lección, escrita antes de este
   spec y sin backticks.

**Resultado esperado:** Q4 se muestra literal: se ve el backtick suelto de
``open(archivo``, el texto `<div>` se lee como texto (no se interpreta como
HTML) y el `&` aparece tal cual. No hay ningún fragmento monoespaciado, ni
asteriscos, guiones o almohadillas convertidos en formato. Las preguntas
preexistentes se ven exactamente igual que antes del cambio.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-005 — Revisión de la autoevaluación ya respondida
**Precondición:** el estudiante responde y envía la autoevaluación de la
lección de prueba (intento único, spec-040).
**Datos de prueba usados:** Q1–Q4
**Pasos:**
1. Enviar la autoevaluación.
2. Observar la vista de revisión con las respuestas marcadas.
3. Recargar la página y volver a observarla.

**Resultado esperado:** En la vista de revisión, enunciados y opciones mantienen
el mismo formato de código que en el formulario. Los colores de acierto/error
(verde/rojo) siguen aplicándose sobre la fila completa y el fragmento de código
sigue siendo legible sobre ese fondo, en claro y en oscuro. Tras recargar, todo
se ve igual.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-006 — Clave de respuestas del docente
**Precondición:** sesión iniciada como docente (`dev@nodo.local`) con acceso a
la lección de prueba; clave de respuestas visible (spec-038).
**Datos de prueba usados:** Q1–Q4
**Pasos:**
1. Navegar a la lección de prueba como docente.
2. Abrir el panel de la lección y mostrar la clave de respuestas.

**Resultado esperado:** Enunciados y opciones se muestran con el mismo formato de
código que ve el estudiante. La marca de opción correcta ("correcta") sigue
alineada a la derecha y no se ve empujada por el fragmento de código.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-007 — Enunciado en la evaluación calificable A/B/C
**Precondición:** grupo de evaluación de prueba publicado y asignado; sesión
iniciada como estudiante de prueba.
**Datos de prueba usados:** Q1, Q3, Q5, Q6
**Pasos:**
1. Navegar a `/cuenta/cursos/{{enrollmentId}}/evaluaciones/{{groupId}}`.
2. Recorrer todas las preguntas de la variante asignada.

**Resultado esperado:** Los enunciados muestran el código formateado en los
cuatro tipos presentes (`multiple_choice`, `open_text`, `code_write`). En Q6, el
`stem` con `factorial(n)` formateado convive con el bloque dedicado
`code_snippet` sin que se vean dos estilos de código distintos en la misma
tarjeta. Las opciones de Q1 se ven formateadas.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-008 — Página de resultados del estudiante
**Precondición:** el estudiante envía la evaluación del caso anterior.
**Datos de prueba usados:** el envío `{{submissionId}}`
**Pasos:**
1. Enviar la evaluación.
2. Navegar a `/cuenta/cursos/{{enrollmentId}}/evaluaciones/{{groupId}}/resultados`.

**Resultado esperado:** Los enunciados de la lista de resultados muestran el
código formateado. El puntaje de la derecha (`x.xx / y.yy`) mantiene su
alineación y no se descuadra por la altura del fragmento de código.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-009 — Panel de revisión y detalle de grupo del docente
**Precondición:** sesión como docente; existe el envío del caso anterior.
**Datos de prueba usados:** `{{groupId}}`, `{{submissionId}}`
**Pasos:**
1. Navegar a `/admin/courses/{{academicCourseId}}/assignments/{{groupId}}` y
   observar la lista de preguntas de cada variante.
2. Entrar a `.../review/{{submissionId}}` y observar las opciones de la pregunta
   de selección múltiple respondida.

**Resultado esperado:** En el detalle del grupo, los enunciados con código se ven
formateados sin romper la fila de tres columnas (número · enunciado · puntos). En
el panel de revisión, las opciones muestran el código formateado y los colores de
acierto/error se conservan.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-010 — Modo claro y modo oscuro
**Precondición:** cualquiera de las vistas anteriores abierta.
**Datos de prueba usados:** Q1–Q3
**Pasos:**
1. Con el tema en claro, observar un fragmento inline y un bloque.
2. Cambiar a modo oscuro y volver a observarlos.
3. Repetir en la autoevaluación y en la evaluación A/B/C.

**Resultado esperado:** En ambos temas el fragmento de código tiene contraste
suficiente contra su fondo y contra la tarjeta que lo contiene, incluso sobre las
filas coloreadas de acierto (verde) y error (rojo). No aparece texto oscuro sobre
fondo oscuro ni claro sobre claro.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-043-011 — Consola sin advertencias de hidratación
**Precondición:** las nueve superficies visitadas en los casos anteriores.
**Datos de prueba usados:** Q1–Q6
**Pasos:**
1. Abrir las DevTools del navegador en la pestaña Console.
2. Recorrer de nuevo: lección con autoevaluación (formulario y revisión), clave
   de respuestas del docente, evaluación A/B/C, resultados, detalle de grupo y
   panel de revisión.

**Resultado esperado:** Ningún error ni advertencia de React sobre hidratación
(`hydration mismatch`) ni sobre anidamiento inválido de HTML
(`<div> cannot appear as a descendant of <p>`, `validateDOMNesting`).
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-MCP-043-001 — El texto con backticks se guarda sin alteración
**Herramienta probada:** `create_question` y `get_question` en `question-bank-mcp`
**Precondición:** `npm run dev` corriendo; MCP conectado al entorno de desarrollo.
**Input de prueba:** `create_question` con
`stem = "¿Qué imprime `print(len(x))` si `x = [1, 2]`?"` y una opción con
`body = "Imprime `2`"`.
**Output esperado:** La creación responde OK. `get_question` con el `id`
devuelto retorna el `stem` y el `body` **byte a byte idénticos** al input, con
sus backticks. El MCP no escapa, normaliza ni elimina los backticks: la
interpretación ocurre solo en la UI.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

### TC-MCP-043-002 — El system prompt documenta la convención
**Herramienta probada:** `docs/mcps/question-bank-agent.system-prompt.md`
(no es una herramienta del servidor; se valida el documento)
**Precondición:** Fase 4 completada.
**Input de prueba:** Pedirle al agente del banco de preguntas, con su system
prompt actualizado, que cree una pregunta sobre la función `len()` de Python.
**Output esperado:** El agente usa backticks alrededor de los identificadores y
llamadas en el `stem` y en las opciones, y reserva el campo `code_snippet` para
los fragmentos que son el objeto de la pregunta. La pregunta resultante se ve
formateada en la UI sin retoques manuales.
**Estado:** ⬜ Pendiente
**Hallazgos:** {{pendiente}}

---

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 13
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Limpieza de datos de prueba: ⬜ Pendiente
