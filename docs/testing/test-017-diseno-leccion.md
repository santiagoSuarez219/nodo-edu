# test-017 — Rediseño del cierre de lección y bloqueo por autoevaluación

> Pruebas manuales del spec `docs/specs/spec-017-diseno-leccion.md`.
> Solo cubren flujos con UI. La validación server-side de `markLessonCompleted`
> eludiendo la interfaz corresponde a la suite automática (ver "Pruebas asociadas"
> del spec).

## Precondiciones generales

- Entorno local levantado con `npm run dev` y sesión de Supabase operativa.
- Migración de `self_assessment_attempts` aplicada en la BD local.
- Existe un curso con al menos:
  - **Lección A** — con artículo MDX que contenga bloques de código y **con**
    preguntas `multiple_choice` publicadas.
  - **Lección B** — **sin** preguntas publicadas.
  - **Lección C** — con `completed_at` ya registrado en `lesson_progress`
    **antes** de aplicar esta regla (simular insertando el registro a mano).
- Un usuario **estudiante matriculado** en ese curso.
- Un usuario **no matriculado** (o navegación anónima) para los casos de acceso.

---

## Casos de prueba

### TC-017-001 — El bloque de código tiene un solo contenedor
**Precondición:** Sesión de estudiante matriculado en la Lección A.
**Pasos:**
1. Abrir la Lección A.
2. Localizar un bloque de código de varias líneas.
3. Inspeccionar el elemento con las devtools.
**Resultado esperado:** Se ve **un único** recuadro con borde y esquinas
redondeadas. No hay un segundo fondo o borde interior rodeando al código. El
`<code>` interno no tiene fondo, padding ni borde propios.
**Estado:** ⬜ Pendiente

### TC-017-002 — Tamaño de fuente del bloque de código
**Precondición:** Lección A abierta en escritorio (viewport ≥ 768 px).
**Pasos:**
1. Comparar el texto del bloque de código con el párrafo que lo precede.
2. Reducir el viewport a 375 px de ancho.
**Resultado esperado:** En escritorio el código se lee a 16 px (`text-base`),
notablemente más grande que antes y sin desbordar la columna. En móvil vuelve a
14 px (`text-sm`) y el bloque sigue siendo legible.
**Estado:** ⬜ Pendiente

### TC-017-003 — Desbordamiento horizontal contenido
**Precondición:** Lección A con un bloque que tenga una línea muy larga.
**Pasos:**
1. Abrir la lección y localizar el bloque de línea larga.
2. Desplazar horizontalmente dentro del bloque.
3. Intentar desplazar horizontalmente la página completa.
**Resultado esperado:** El scroll horizontal ocurre **dentro** del bloque. La
página no se desplaza lateralmente.
**Estado:** ⬜ Pendiente

### TC-017-004 — El código sigue siendo copiable
**Precondición:** Lección A abierta.
**Pasos:**
1. Seleccionar con el ratón varias líneas de un bloque de código y copiar.
2. Pegar en un editor de texto.
3. Repetir la selección usando solo el teclado (Shift + flechas).
**Resultado esperado:** El texto se selecciona, se copia y se pega íntegro en
ambos casos. No hay bloqueo de selección.
**Estado:** ⬜ Pendiente

### TC-017-005 — Orden vertical del cierre de lección
**Precondición:** Sesión de estudiante matriculado en la Lección A.
**Pasos:**
1. Abrir la Lección A y desplazarse hasta el final del contenido.
**Resultado esperado:** El orden de arriba abajo es: contenido de la lección →
**Autoevaluación** → **Asistencia** → **Finalizar lección** → navegación a la
lección siguiente.
**Estado:** ⬜ Pendiente

### TC-017-006 — Usuario no matriculado no ve el cierre
**Precondición:** Navegación anónima o usuario sin matrícula en el curso.
**Pasos:**
1. Abrir una lección pública del curso.
2. Desplazarse hasta el final.
**Resultado esperado:** No aparecen Autoevaluación, Asistencia ni Finalizar
lección. La navegación a la lección siguiente **sí** se muestra.
**Estado:** ⬜ Pendiente

### TC-017-007 — La autoevaluación es un solo contenedor a ancho completo
**Precondición:** Lección A con varias preguntas publicadas.
**Pasos:**
1. Abrir la Lección A y localizar la sección Autoevaluación.
2. Comparar su ancho con el del texto del artículo.
**Resultado esperado:** La autoevaluación se ve como **un** contenedor con
bordes redondeados que ocupa **todo el ancho** de la columna de contenido. Cada
pregunta es una división interna, sin tarjeta con borde propio.
**Estado:** ⬜ Pendiente

### TC-017-008 — Anchos coherentes entre las tres secciones de cierre
**Precondición:** Lección A, con sesión de asistencia abierta por el docente.
**Pasos:**
1. Observar los contenedores de Autoevaluación, Asistencia y Finalizar lección.
**Resultado esperado:** Los tres comparten el mismo ancho y el mismo tratamiento
visual (borde, radio, fondo). Ninguno queda visiblemente más estrecho.
**Estado:** ⬜ Pendiente

### TC-017-009 — Envío bloqueado hasta responder todas las preguntas
**Precondición:** Lección A con al menos 3 preguntas, autoevaluación sin enviar.
**Pasos:**
1. Dejar todas las preguntas sin responder y observar el botón "Enviar respuestas".
2. Responder solo la primera pregunta.
3. Responder el resto.
**Resultado esperado:** El botón está deshabilitado en los pasos 1 y 2, e indica
cuántas preguntas faltan. Se habilita únicamente cuando todas están respondidas.
**Estado:** ⬜ Pendiente

### TC-017-010 — Feedback tras enviar la autoevaluación
**Precondición:** Lección A con todas las preguntas respondidas.
**Pasos:**
1. Pulsar "Enviar respuestas".
**Resultado esperado:** Se muestra el feedback por pregunta (correcto/incorrecto
y la respuesta correcta cuando falla). El intento queda registrado.
**Estado:** ⬜ Pendiente

### TC-017-011 — El intento sobrevive a la recarga
**Precondición:** Autoevaluación de la Lección A ya enviada (TC-017-010).
**Pasos:**
1. Recargar la página con F5.
2. Observar la sección Autoevaluación.
**Resultado esperado:** La autoevaluación se muestra como **ya enviada** y ofrece
reintentar. No vuelve al estado inicial sin responder.
**Estado:** ⬜ Pendiente

### TC-017-012 — Reintento de la autoevaluación
**Precondición:** Autoevaluación de la Lección A ya enviada.
**Pasos:**
1. Pulsar la opción de reintentar.
2. Responder de nuevo todas las preguntas y enviar.
**Resultado esperado:** El formulario se reactiva, admite nuevas respuestas y el
nuevo envío muestra feedback actualizado. La lección permanece desbloqueada
durante todo el proceso.
**Estado:** ⬜ Pendiente

### TC-017-013 — Completar lección bloqueado sin autoevaluación
**Precondición:** Lección A **sin** autoevaluación enviada por este usuario.
**Pasos:**
1. Desplazarse hasta "Finalizar lección".
2. Observar el botón "Completar lección" e intentar pulsarlo.
**Resultado esperado:** El botón está deshabilitado y acompañado de una
explicación clara de que primero hay que completar la autoevaluación. La lección
no se marca como completada.
**Estado:** ⬜ Pendiente

### TC-017-014 — Desbloqueo inmediato tras enviar
**Precondición:** Situación de TC-017-013.
**Pasos:**
1. Responder todas las preguntas y enviar la autoevaluación.
2. Observar el botón "Completar lección" **sin** recargar la página.
**Resultado esperado:** El botón queda habilitado automáticamente. Al pulsarlo,
la lección se marca como completada.
**Estado:** ⬜ Pendiente

### TC-017-015 — El desbloqueo no depende de los aciertos
**Precondición:** Lección A, autoevaluación sin enviar, usuario limpio.
**Pasos:**
1. Responder **todas** las preguntas eligiendo a propósito opciones incorrectas.
2. Enviar.
3. Observar el botón "Completar lección".
**Resultado esperado:** El feedback marca las respuestas como incorrectas, pero
el botón "Completar lección" se habilita igualmente.
**Estado:** ⬜ Pendiente

### TC-017-016 — Lección sin preguntas se completa sin fricción
**Precondición:** Lección B, sin preguntas publicadas.
**Pasos:**
1. Abrir la Lección B y desplazarse al final.
2. Pulsar "Completar lección".
**Resultado esperado:** No se muestra sección de Autoevaluación. El botón está
habilitado desde el inicio y la lección se marca como completada.
**Estado:** ⬜ Pendiente

### TC-017-017 — Lección completada antes de la regla no se rompe
**Precondición:** Lección C, con `completed_at` previo a esta regla y sin intento
de autoevaluación registrado.
**Pasos:**
1. Abrir la Lección C.
2. Observar el estado de "Finalizar lección".
**Resultado esperado:** Se muestra como **completada**, con su fecha. No se
desmarca ni muestra error.
**Estado:** ⬜ Pendiente

### TC-017-018 — Desmarcar conserva el intento
**Precondición:** Lección A completada y con autoevaluación enviada.
**Pasos:**
1. Pulsar "Desmarcar".
2. Observar la sección Autoevaluación y el botón "Completar lección".
**Resultado esperado:** La lección vuelve a estado no completada, la
autoevaluación sigue registrada como enviada, y "Completar lección" permanece
**habilitado** (no exige repetir la autoevaluación).
**Estado:** ⬜ Pendiente

### TC-017-019 — Barra de progreso en escritorio
**Precondición:** Sesión de estudiante matriculado, viewport ≥ 1024 px.
**Pasos:**
1. Abrir cualquier lección del curso.
2. Observar la parte superior del sidebar.
**Resultado esperado:** Se ve una barra de progreso con el texto `X de N · NN%`,
coherente con las lecciones efectivamente completadas.
**Estado:** ⬜ Pendiente

### TC-017-020 — Barra de progreso en el drawer móvil
**Precondición:** Viewport de 375 px.
**Pasos:**
1. Abrir una lección y desplegar el menú de lecciones.
**Resultado esperado:** El drawer muestra la misma barra con el mismo porcentaje
que en escritorio.
**Estado:** ⬜ Pendiente

### TC-017-021 — El progreso se actualiza al completar
**Precondición:** Curso con al menos una lección pendiente; anotar el porcentaje
actual.
**Pasos:**
1. Completar una lección pendiente.
2. Observar la barra del sidebar **sin** recargar.
**Resultado esperado:** El porcentaje y el contador `X de N` suben en
consecuencia, sin recarga manual.
**Estado:** ⬜ Pendiente

### TC-017-022 — El porcentaje nunca supera el 100 %
**Precondición:** Curso donde exista un registro de `lesson_progress` completado
para una lección ya retirada o sin artículo publicado.
**Pasos:**
1. Abrir una lección del curso y observar la barra.
2. Completar todas las lecciones con artículo publicado.
**Resultado esperado:** El denominador cuenta solo lecciones con artículo. Al
completarlas todas se muestra exactamente `100%`, nunca un valor superior.
**Estado:** ⬜ Pendiente

### TC-017-023 — Recorrido por teclado del cierre de lección
**Precondición:** Lección A abierta, sin usar el ratón.
**Pasos:**
1. Tabular desde el final del artículo hasta la navegación de la lección siguiente.
2. Responder una pregunta con Espacio/flechas y enviar con Enter.
**Resultado esperado:** El foco recorre en orden Autoevaluación → Asistencia →
Finalizar lección → siguiente lección, siempre visible. Las opciones se pueden
marcar y el formulario enviar sin ratón. El botón deshabilitado no captura el
foco de forma confusa.
**Estado:** ⬜ Pendiente

### TC-017-024 — Barra de progreso accesible
**Precondición:** Lección abierta con sesión de estudiante.
**Pasos:**
1. Inspeccionar la barra de progreso en las devtools.
**Resultado esperado:** Expone `role="progressbar"` con `aria-valuenow`,
`aria-valuemin`, `aria-valuemax` y una etiqueta accesible que describe el avance.
**Estado:** ⬜ Pendiente

### TC-017-025 — Aislamiento entre estudiantes
**Precondición:** Dos estudiantes matriculados, A y B. A ya envió la
autoevaluación de la Lección A; B no.
**Pasos:**
1. Iniciar sesión como B y abrir la Lección A.
**Resultado esperado:** B ve la autoevaluación **sin enviar** y el botón
"Completar lección" deshabilitado. El intento de A no le afecta.
**Estado:** ⬜ Pendiente

---

## Casos MCP

No aplican. La sección "Evaluación MCP" del spec-017 concluye **diferir** la
exposición de `self_assessment_attempts` a un spec propio; este spec no crea ni
modifica ningún MCP.
