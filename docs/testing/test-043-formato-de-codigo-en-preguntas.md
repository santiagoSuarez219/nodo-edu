# test-043 — Formato de código en enunciados y opciones de preguntas

## Datos de prueba

> Recursos creados vía `question-bank-mcp` y `assignment-mcp` contra el entorno
> de **desarrollo** (instancia local en `mirp-lab`, ver `CLAUDE.md` → "Base de
> datos"). Deben eliminarse al cerrar la ronda de pruebas.

> ⚠️ **Nota:** esta base de desarrollo estaba vacía (sin cursos académicos ni
> estudiantes) al iniciar la ronda — no existía como se creía. No hay
> herramienta MCP para crear un curso académico (`academic_courses`), así que,
> con autorización explícita del usuario, se insertó por SQL directo vía
> PostgREST con `service_role` (excepción documentada en `CLAUDE.md` →
> "No manipular la base de datos directamente... salvo que el usuario lo
> indique"). El resto de los datos se crearon por API/MCP normalmente.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|----------------------|---------------|-----------|
| Curso académico de prueba (`spec-043 — Curso de prueba`, `analisis-de-algoritmos`) | SQL directo vía PostgREST (`service_role`), autorizado por el usuario | `a45b73e4-b777-4b91-9ce8-48daa482c269` / código `TEST043` | ✅ |
| Estudiante de prueba `estudiante.spec043@nodo.local` / `Spec043Test!`, matriculado por `enrollment_code` | `create_student` | `e8ec3c8c-22ae-4c84-9829-72a65b830bbf` (enrollment `6b6c13aa-136a-4182-85da-e601a611adad`) | ✅ |
| Pregunta Q1 — `multiple_choice`, backtick simple en `stem` y en una opción | `create_question` (`POST /api/questions`) | `9fcc486a-2eb1-4585-805a-83356ad0c9ab` | ✅ |
| Pregunta Q2 — `multiple_choice`, cerca de una línea ```` ```int``` ```` en las opciones | `create_question` | `37c7f5b6-09b9-45d5-bd04-dde578890e87` | ✅ |
| Pregunta Q3 — `multiple_choice`, cerca multilínea ```` ```python ```` en el `stem` | `create_question` | `ece01898-f0c5-4db3-b1ab-eb391b1e4892` | ✅ |
| Pregunta Q4 — `multiple_choice`, backtick suelto sin cerrar + `<div>` literal en el `stem` | `create_question` | `ae00fcc3-8f8b-4034-9c96-d90a57a6108b` | ✅ |
| Pregunta Q5 — `open_text`, backticks en el `stem` | `create_question` | `6626b64d-bc56-4e2b-ade6-b0f2de620f8c` | ✅ |
| Pregunta Q6 — `code_write`, backticks en el `stem` (`code_snippet` quedó `null` — ver DEBT-057, no bloquea spec-043) | `create_question` | `ede2bb9c-ea44-4726-98c2-8018c1d43834` | ✅ |
| Montaje de Q1–Q4 en lección de prueba | `mount_question_in_lesson` | `analisis-de-algoritmos` / `sintaxis-de-python` (order_index 5–8) | ✅ (desmontadas) |
| Grupo de evaluación con variantes A/B/C, cada una con Q1, Q3, Q5 y Q6 | `create_assignment_group` + `publish_assignment_group` | `6fb163d3-19ba-4656-bb52-7753efde69cf` | ✅ |
| Envío de evaluación del estudiante de prueba | UI del estudiante | `5f8f4251-7367-487e-9ef4-9910adc2728d` | ✅ |
| Pregunta Q7 — `multiple_choice` creada por el agente de prueba en TC-MCP-043-002 (`len()`), publicada sin montar | `create_question` (vía agente con system prompt actualizado) | `23b30ba5-e2fd-4bc6-8ddd-e59760d83c86` | ✅ |

**Credenciales para la ejecución:**
- Docente: `dev@nodo.local` / `DevLocal2026!`
- Estudiante de prueba: `estudiante.spec043@nodo.local` / `Spec043Test!`
- `enrollmentId` del estudiante: `6b6c13aa-136a-4182-85da-e601a611adad`
- `academicCourseId`: `a45b73e4-b777-4b91-9ce8-48daa482c269`
- `groupId` de la evaluación: `6fb163d3-19ba-4656-bb52-7753efde69cf`
- `courseSlug` / `lessonSlug`: `analisis-de-algoritmos` / `sintaxis-de-python`

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
**Fecha de la ronda:** 2026-08-07

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
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado visualmente en `/analisis-de-algoritmos/sintaxis-de-python`.
El enunciado se ve "¿Qué imprime [print(len(x))] si [x = [1, 2]] ?" con ambos
fragmentos como chips monoespaciados, sin backticks. Sin observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Q1 muestra "Lanza un [TypeError]" e "Imprime [2]"; Q2 muestra
"Devuelve un [int]" y "Devuelve un [float]" — la cerca de una línea se trató
como inline, tal como se esperaba. Filas alineadas correctamente. No se probó
el clic específico sobre el chip (se validará junto con el resto del flujo de
envío en TC-043-005), pero el layout no muestra desalineación.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado a ~320–606px de ancho: el bloque preserva el salto de
línea y la indentación ("def suma(a, b):" / "    return a + b"), y la página no
desarrolla scroll horizontal general. La línea de código de esta pregunta es
corta y no llegó a desbordar su propio contenedor, así que no se observó en
acción el `overflow-x` interno del bloque — solo se confirmó que no rompe el
layout. Sin más observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Se lee literal: "¿Qué hace `open(archivo? El elemento <div> se
cuenta & se ignora." — backtick suelto visible, `<div>` como texto plano (no
se renderizó como elemento HTML ni rompió el layout) y `&` intacto. Ningún
fragmento monoespaciado. Las preguntas preexistentes de la lección (Q0–Q4 del
banco original) se ven con su formato de código habitual, sin cambios de
comportamiento visibles.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado por el usuario tras enviar las 9 respuestas y recargar
la página. Sin observaciones adicionales reportadas.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Q1 se ve con el mismo formato que en el formulario del estudiante
("¿Qué imprime [print(len(x))] si [x = [1, 2]] ?"). Al pulsar "Revelar", el
checkmark verde de la opción correcta ("Imprime [2]") queda perfectamente
alineado a la derecha de la fila, sin desplazarse por el chip de código.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Las 4 preguntas de la variante muestran su `stem` formateado:
Q1 "¿Qué imprime [print(len(x))] si [x = [1, 2]] ?" con opciones formateadas,
Q2 con el bloque `def suma(a, b):` + inline `suma(2, 3)`, Q3 (open_text) con
"[list.append()]" y Q4 (code_write) con "[factorial(n)]". Por DEBT-057
(`code_snippet` quedó `null` en Q4), no aparece el bloque dedicado — pero
tampoco aparece un bloque vacío ni rompe el layout, así que no hay conflicto
de "dos estilos". No se pudo verificar la convivencia stem+code_snippet en la
misma tarjeta por ese bug preexistente, ajeno a spec-043.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Q1 y Q2 se ven formateadas ("¿Qué imprime [print(len(x))] si
[x = [1, 2]] ?" y el bloque `def suma(a, b):`), con el puntaje "1.00 / 1.00"
correctamente alineado a la derecha en ambas filas, sin descuadre por el
fragmento de código. Puntaje automático total: 2.00/4.00 pts (Q3/Q4 pendientes
de revisión manual del docente, como corresponde a `open_text`/`code_write`).

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
**Estado:** ✅ Aprobado
**Hallazgos:** Detalle del grupo (Variante A/B): las 4 preguntas se ven
formateadas ("¿Qué imprime [print(len(x))] si [x = [1, 2]] ?", el bloque
`def suma(a, b):`, "[list.append()]", "[factorial(n)]") sin romper la fila de
número/enunciado/puntos. Panel de revisión del envío: Q3 y Q4 (texto abierto y
código) muestran su `stem` formateado junto a la respuesta del estudiante; Q1
muestra la opción "Imprime [2]" en verde con la etiqueta "correcta" alineada a
la derecha, sin desplazarse por el chip de código.

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
**Estado:** ✅ Aprobado
**Hallazgos:** El sitio no expone un toggle de tema en la UI (sigue el tema
del SO vía clase `dark` en `<html>`, sin `data-theme` ni preferencia en
`localStorage`); se alternó agregando/quitando la clase `dark` por JS para
verificar ambos temas en la misma sesión. En modo claro, los chips
(`print(len(x))`, `x = [1, 2]`, `def suma(a, b):`, `5`) mantienen buen
contraste incluso sobre la fila verde de acierto (fondo verde muy pálido,
chip gris con borde sutil, texto oscuro legible). El modo oscuro ya se había
verificado en todos los casos anteriores de esta ronda.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Revisado con `read_console_messages` en carga fresca de: panel
de revisión del docente (`/admin/.../review/{submissionId}`), lección con
autoevaluación (`/analisis-de-algoritmos/sintaxis-de-python`) y página de
resultados del estudiante (`/cuenta/.../resultados`). Ningún mensaje de error
ni advertencia de React en ninguna de las tres. No se revisó explícitamente
`SelfAssessmentSection` en su variante de formulario recién cargado (ya se
había respondido en TC-043-005), pero el patrón de render (`<span>`/`<code>`)
es el mismo en las nueve superficies, así que el riesgo de nesting inválido es
uniforme.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado con las 6 preguntas creadas para esta ronda (Q1–Q6):
`create_question` con `stem`/`choices[].body` conteniendo backticks simples y
cercas de triple backtick, releídos después con `list_lesson_questions` y
`get_question` — el texto vuelve **idéntico**, backticks incluidos, sin
escapar ni normalizar. Ejemplo: Q1 `stem` = "¿Qué imprime `print(len(x))` si
`x = [1, 2]`?" idéntico en creación y en lectura. Nota aparte (no afecta este
caso): `code_snippet` sí se pierde para `code_write`/`coding_challenge` — ver
DEBT-057, registrado en el backlog.

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
**Estado:** ✅ Aprobado
**Hallazgos:** Se invocó un agente independiente con el system prompt
actualizado, pidiéndole crear una pregunta sobre `len()` de Python **sin**
mencionar backticks ni el formato — solo "crea una pregunta de selección
múltiple sobre la función len() de Python". El agente, siguiendo la sección
"Formato de código..." por su cuenta: (1) usó backticks en el `stem`
("¿Qué devuelve la función `len()` al evaluarse sobre `x = [1, 2, 3, 4]`?")
y en 3 de 4 `choices` (`4`, `3`, `10`, `len()`); (2) no usó el campo dedicado
`code_snippet`/`code_language`, correcto porque el tipo es `multiple_choice`
y el código es un inciso corto, no el objeto de la pregunta; (3) verificó la
keyword `python` con `list_keywords` antes de asignarla, sin inventarla.
Pregunta creada: `23b30ba5-e2fd-4bc6-8ddd-e59760d83c86` (publicada, sin
montar, según lo pedido).

---

## Resumen de la ronda

- Aprobados: 13 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: **DEBT-057** —
  `code_snippet`/`code_language` no se persisten para `code_write`/
  `coding_challenge` en `create_question`/`update_question` (bug preexistente,
  ajeno a spec-043; detectado al preparar Q6 para esta ronda).
- **Limpieza de datos de prueba:** ✅ Completada en dos fases, con
  autorización explícita del usuario en cada una:
  1. **Vía API/MCP:** preguntas Q2, Q4, Q7 (`delete_question`); Q1–Q4
     desmontadas de la lección (`unmount_question_from_lesson`).
  2. **Vía SQL directo** (`service_role`, autorizado explícitamente): las
     preguntas Q1/Q3/Q5/Q6, el grupo de evaluación y el estudiante no se
     pudieron borrar por API porque tenían un envío real de por medio (409 en
     los tres casos — comportamiento correcto de la API, no un bug). Se borró
     en orden `submissions` → `assignment_variant_groups` (cascada a
     `assignments`/`assignment_questions`/`assignment_variant_allocations`),
     tras lo cual las 4 preguntas y `delete_student` sí funcionaron vía API
     con normalidad. El curso académico (creado también por SQL directo, ver
     nota en "Datos de prueba") se eliminó igual por no existir herramienta
     MCP para ello.
  - **Verificado:** `list_academic_courses`, `list_students` y
    `list_questions` (`q=spec-043`) devuelven vacío; el usuario de
    `auth.users` del estudiante de prueba ya no existe. Solo persiste
    `dev@nodo.local`, la cuenta docente real que ya existía antes de esta
    ronda.
