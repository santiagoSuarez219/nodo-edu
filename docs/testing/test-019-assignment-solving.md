# test-007 — Resolución de evaluaciones por el estudiante

## Precondiciones generales

- Supabase local corriendo (`supabase start`) con las migraciones de specs 003/005/006/007
  aplicadas (`supabase db reset` sin conflictos).
- Cuentas de prueba disponibles:
  - **Docente:** usuario con rol `teacher` en `user_roles`, dueño de al menos un curso académico.
  - **Estudiante A:** cuenta con rol `student`, con matrícula `active` en el curso del docente.
  - **Estudiante B:** segunda cuenta con rol `student`, usada para probar aislamiento.
- El docente (spec-018) ha creado y **publicado** al menos una asignación vinculada al curso,
  con preguntas de los tipos `multiple_choice`, `open_text`, `code_snippet`, `code_write` y
  `coding_challenge` en el banco (spec-005).
- Se dispone de asignaciones configuradas para cubrir los distintos escenarios:
  - Una asignación **solo con `multiple_choice`** (para cierre automático a `graded`).
  - Una asignación **con preguntas abiertas** (`open_text`/`code_write`/`coding_challenge`)
    que quede en `submitted` a la espera de revisión.
  - Una asignación con `time_limit_minutes` definido (para countdown).
  - Una asignación con `show_feedback_on = submit`, otra con `close` y otra con `never`.
  - Una asignación con `max_attempts = 1` y otra con `max_attempts = 2`.
  - Al menos una asignación con `grade_item_id` vinculado.
- Variables de entorno en `.env.local` apuntando al proyecto local.

---

## Casos de prueba

### TC-001 — Acceso al listado de asignaciones sin sesión
**Precondición:** No hay sesión activa.
**Pasos:**
1. Abrir directamente `/cuenta/cursos/[enrollmentId]/asignaciones`.
**Resultado esperado:** Redirige a `/login?redirectTo=/cuenta/cursos/[enrollmentId]/asignaciones`.
**Estado:** ⬜ Pendiente

---

### TC-002 — Estudiante ve las asignaciones publicadas y dentro de ventana de su curso
**Precondición:** Sesión activa como Estudiante A, con matrícula `active`. El docente tiene
asignaciones publicadas y dentro de ventana (`opens_at` en el pasado, `closes_at` en el futuro).
**Pasos:**
1. Navegar a `/cuenta/cursos`.
2. Entrar al detalle del curso y abrir su listado de asignaciones (`.../asignaciones`).
**Resultado esperado:** Se muestran las asignaciones publicadas y activas del curso, cada una con
el estado de su último intento (sin intento aún, en progreso, enviado o calificado).
**Estado:** ⬜ Pendiente

---

### TC-003 — Asignaciones fuera de ventana o no publicadas no aparecen
**Precondición:** Sesión activa como Estudiante A. El docente tiene: (a) una asignación en
borrador/no publicada, (b) una con `opens_at` futuro, y (c) una con `closes_at` ya pasado.
**Pasos:**
1. Navegar al listado de asignaciones de la matrícula (`.../asignaciones`).
**Resultado esperado:** Ninguna de las tres asignaciones (no publicada, aún no abierta, ya cerrada)
aparece como disponible para resolver en el listado activo.
**Estado:** ⬜ Pendiente

---

### TC-004 — Aislamiento: no se ven asignaciones de cursos no matriculados
**Precondición:** Existe un `enrollmentId` de otro estudiante o de un curso donde el Estudiante A
NO está matriculado.
**Pasos:**
1. Sesión activa como Estudiante A.
2. Intentar acceder directamente a `/cuenta/cursos/[enrollmentIdAjeno]/asignaciones`.
**Resultado esperado:** Devuelve `404` (RLS + verificación `enrollment.student_id === user.id`);
el estudiante no ve asignaciones de cursos ajenos.
**Estado:** ⬜ Pendiente

---

### TC-005 — Aislamiento: matrícula retirada no accede al listado
**Precondición:** El Estudiante A tiene una matrícula con `status = withdrawn` en un curso.
**Pasos:**
1. Sesión activa como Estudiante A.
2. Acceder al listado de asignaciones de esa matrícula retirada.
**Resultado esperado:** Devuelve `404` (la ruta exige `enrollment.status === "active"`).
**Estado:** ⬜ Pendiente

---

### TC-006 — Abrir una asignación crea un intento `in_progress`
**Precondición:** Estudiante A con una asignación activa sin intentos previos.
**Pasos:**
1. En el listado de asignaciones, hacer clic en la asignación.
2. Verificar que se monta el `AssignmentPlayer` con las preguntas.
**Resultado esperado:** Se crea un intento `in_progress` (`attempt_number = 1`) y se muestra el
jugador de la asignación con las preguntas renderizadas.
**Estado:** ⬜ Pendiente

---

### TC-007 — Reabrir la asignación recupera el mismo intento en progreso
**Precondición:** Estudiante A con un intento `in_progress` en una asignación (TC-006), con algunas
respuestas ya guardadas.
**Pasos:**
1. Salir del jugador (navegar fuera) y volver a abrir la misma asignación.
**Resultado esperado:** Se recupera el mismo intento `in_progress` (no se crea uno nuevo) con las
respuestas previamente guardadas ya cargadas.
**Estado:** ⬜ Pendiente

---

### TC-008 — Renderizado de pregunta `multiple_choice`
**Precondición:** Jugador abierto con una pregunta `multiple_choice`.
**Pasos:**
1. Observar la pregunta `multiple_choice`.
2. Seleccionar una o varias opciones según corresponda.
**Resultado esperado:** Se muestran las opciones seleccionables; la selección se refleja en la UI.
**Estado:** ⬜ Pendiente

---

### TC-009 — Renderizado y respuesta de pregunta `open_text`
**Precondición:** Jugador abierto con una pregunta `open_text`.
**Pasos:**
1. Escribir una respuesta de texto libre en el campo.
**Resultado esperado:** El campo de texto acepta la respuesta y la conserva mientras se navega
por el jugador.
**Estado:** ⬜ Pendiente

---

### TC-010 — Renderizado y respuesta de pregunta `code_snippet`
**Precondición:** Jugador abierto con una pregunta de tipo `code_snippet`.
**Pasos:**
1. Observar el enunciado con el fragmento de código.
2. Responder según el formato que la pregunta requiera.
**Resultado esperado:** El fragmento de código se muestra correctamente (resaltado) y la respuesta
del estudiante se captura.
**Estado:** ⬜ Pendiente

---

### TC-011 — Renderizado y respuesta de pregunta `code_write`
**Precondición:** Jugador abierto con una pregunta `code_write`.
**Pasos:**
1. Escribir código en el editor/área de respuesta.
**Resultado esperado:** El área de escritura de código acepta el texto y lo conserva como respuesta
abierta.
**Estado:** ⬜ Pendiente

---

### TC-012 — Renderizado de `coding_challenge` sin ejecución (stub deshabilitado)
**Precondición:** Jugador abierto con una pregunta `coding_challenge`.
**Pasos:**
1. Observar el enunciado del reto.
2. Escribir una solución en el área de código.
3. Intentar ejecutar/correr el código si hay control para ello.
**Resultado esperado:** La pregunta se renderiza y la respuesta se guarda como texto abierto. La
ejecución de código está deshabilitada (stub `disabled`): no corre pruebas ni devuelve resultados
de ejecución. Se indica que la ejecución no está disponible.
**Estado:** ⬜ Pendiente

---

### TC-013 — Auto-save con debounce de 3 s
**Precondición:** Jugador abierto con un intento `in_progress`.
**Pasos:**
1. Responder una pregunta (ej. seleccionar opción de `multiple_choice` o escribir en `open_text`).
2. Esperar ~3 segundos sin más interacción.
3. Observar el indicador de guardado en el header sticky.
**Resultado esperado:** Tras el debounce de 3 s la respuesta se guarda automáticamente y el header
muestra el estado "guardado" (sin necesidad de pulsar "Enviar").
**Estado:** ⬜ Pendiente

---

### TC-014 — Persistencia de respuestas al recargar la página
**Precondición:** Estudiante A con respuestas ya auto-guardadas (TC-013) en un intento `in_progress`.
**Pasos:**
1. Recargar la página del jugador (F5) o cerrar y reabrir la pestaña.
**Resultado esperado:** Las respuestas guardadas se recuperan y aparecen precargadas; no se pierde
el trabajo tras el cierre accidental de la pestaña.
**Estado:** ⬜ Pendiente

---

### TC-015 — Countdown visible con `time_limit_minutes`
**Precondición:** Estudiante A abre una asignación con `time_limit_minutes` definido.
**Pasos:**
1. Abrir la asignación con límite de tiempo.
2. Observar el header sticky.
**Resultado esperado:** Se muestra un countdown de tiempo restante que decrementa; al bajar de
60 s se resalta (cambio de color/énfasis).
**Estado:** ⬜ Pendiente

---

### TC-016 — Submit automático al vencer el `time_limit`
**Precondición:** Asignación con `time_limit_minutes` corto (ej. 1 min) para observar el vencimiento.
**Pasos:**
1. Abrir la asignación, responder algunas preguntas.
2. Dejar correr el countdown hasta llegar a 0 sin enviar manualmente.
**Resultado esperado:** Al llegar a 0 el intento se envía automáticamente: se descargan (flush) las
respuestas pendientes, la submission pasa a `submitted`/`graded` según corresponda y se redirige o
muestra el resultado.
**Estado:** ⬜ Pendiente

---

### TC-017 — Envío manual y cálculo de `auto_score` de `multiple_choice`
**Precondición:** Estudiante A con un intento en progreso; respondió `multiple_choice` (algunas
correctas y alguna incorrecta) con selección conocida.
**Pasos:**
1. Pulsar "Enviar respuestas".
2. Confirmar en el diálogo de confirmación.
**Resultado esperado:** El intento pasa a `submitted`. Las preguntas `multiple_choice` se puntúan
automáticamente por coincidencia exacta del conjunto de opciones; el `auto_score` se calcula
(redondeado a 2 decimales) y persiste. Solo las respuestas con conjunto exacto correcto suman puntos.
**Estado:** ⬜ Pendiente

---

### TC-018 — Confirmación antes de enviar
**Precondición:** Jugador con intento en progreso.
**Pasos:**
1. Pulsar "Enviar respuestas".
2. En el diálogo, cancelar.
**Resultado esperado:** El envío se cancela y el intento permanece `in_progress`; se puede seguir
editando. Solo al confirmar se ejecuta el envío.
**Estado:** ⬜ Pendiente

---

### TC-019 — Feedback inmediato con `show_feedback_on = submit`
**Precondición:** Asignación con `show_feedback_on = submit` y preguntas `multiple_choice`.
**Pasos:**
1. Resolver y enviar la asignación.
2. Observar las preguntas `multiple_choice` tras el envío.
**Resultado esperado:** Tras enviar se muestra la corrección de las `multiple_choice` (opciones
correctas/incorrectas) de forma inmediata.
**Estado:** ⬜ Pendiente

---

### TC-020 — Sin feedback con `show_feedback_on = never`
**Precondición:** Asignación con `show_feedback_on = never` y preguntas `multiple_choice`.
**Pasos:**
1. Resolver y enviar la asignación.
2. Revisar la vista de resultados.
**Resultado esperado:** No se muestra la corrección por opción de las `multiple_choice`; el
estudiante no ve qué opciones eran correctas.
**Estado:** ⬜ Pendiente

---

### TC-021 — Feedback diferido con `show_feedback_on = close`
**Precondición:** Asignación con `show_feedback_on = close` y preguntas `multiple_choice`.
**Pasos:**
1. Resolver y enviar la asignación con la ventana aún abierta (`closes_at` en el futuro).
2. Revisar la vista de resultados.
**Resultado esperado:** La corrección de las `multiple_choice` no se muestra mientras la asignación
no esté cerrada; solo se revela cuando corresponde según `close`.
**Estado:** ⬜ Pendiente

---

### TC-022 — Cierre automático a `graded` sin preguntas de revisión manual
**Precondición:** Asignación compuesta **solo** por preguntas `multiple_choice`, con `grade_item_id`
vinculado.
**Pasos:**
1. Resolver y enviar la asignación.
2. Revisar la vista de resultados.
**Resultado esperado:** El intento pasa directamente a `graded` con `final_score = auto_score`; se
muestra el puntaje final en `SubmissionResult`.
**Estado:** ⬜ Pendiente

---

### TC-023 — Propagación de nota a `student_grades`
**Precondición:** TC-022 ejecutado sobre una asignación con `grade_item_id` vinculado.
**Pasos:**
1. Tras el cierre a `graded`, iniciar sesión (o continuar) como Estudiante A y navegar al detalle
   de la matrícula (`/cuenta/cursos/[enrollmentId]`).
2. Verificar la nota del ítem de calificación vinculado.
**Resultado esperado:** La nota del intento se propaga a `student_grades` y aparece reflejada en el
ítem correspondiente del boletín del estudiante.
**Estado:** ⬜ Pendiente

---

### TC-024 — Intento con preguntas abiertas queda `submitted` a la espera de revisión
**Precondición:** Asignación con al menos una pregunta abierta (`open_text`/`code_write`/
`coding_challenge`) además de `multiple_choice`.
**Pasos:**
1. Resolver todas las preguntas y enviar.
2. Revisar la vista de resultados.
**Resultado esperado:** El intento queda en estado `submitted` (no `graded`): las `multiple_choice`
muestran su `auto_score`, mientras las respuestas abiertas figuran pendientes de revisión del
docente (spec-020). La nota final aún no se propaga.
**Estado:** ⬜ Pendiente

---

### TC-025 — Vista de resultados (`SubmissionResult`) tras cerrar el intento
**Precondición:** Estudiante A con un intento ya enviado/calificado.
**Pasos:**
1. Navegar a `.../asignaciones/[assignmentId]/resultados` (o dejar que el jugador redirija tras el
   envío).
**Resultado esperado:** Se muestra el `SubmissionResult` con el estado del intento, el puntaje
(`auto_score`/`final_score` según corresponda) y el feedback por pregunta acorde a `show_feedback_on`.
**Estado:** ⬜ Pendiente

---

### TC-026 — Intento cerrado redirige a resultados
**Precondición:** Estudiante A con un intento ya `submitted`/`graded` en una asignación de un solo
intento (`max_attempts = 1`).
**Pasos:**
1. Volver a abrir la asignación desde el listado (`.../asignaciones/[assignmentId]`).
**Resultado esperado:** En lugar de montar el jugador, la ruta redirige a la página de resultados
del intento cerrado.
**Estado:** ⬜ Pendiente

---

### TC-027 — Control de `max_attempts` agotados
**Precondición:** Asignación con `max_attempts = 1` ya resuelta y cerrada por el Estudiante A.
**Pasos:**
1. Intentar iniciar un nuevo intento sobre esa asignación.
**Resultado esperado:** No se crea un intento nuevo (se respeta `max_attempts`); se muestra el
resultado del intento previo o el mensaje de "sin intentos disponibles", sin permitir reabrir.
**Estado:** ⬜ Pendiente

---

### TC-028 — Segundo intento permitido con `max_attempts = 2`
**Precondición:** Asignación con `max_attempts = 2`; el Estudiante A ya cerró el intento 1.
**Pasos:**
1. Iniciar un nuevo intento sobre la asignación.
**Resultado esperado:** Se crea un intento nuevo con `attempt_number = 2`; el jugador se monta
limpio para responder de nuevo.
**Estado:** ⬜ Pendiente

---

### TC-029 — Aislamiento: no acceder al intento de otro estudiante
**Precondición:** El Estudiante B tiene un intento propio en una asignación; se conoce su
`submissionId` o la URL de resultados/jugador correspondiente.
**Pasos:**
1. Sesión activa como Estudiante A.
2. Intentar acceder al intento del Estudiante B (jugador o resultados).
**Resultado esperado:** Devuelve `404`/`403` según corresponda; el Estudiante A no ve ni resuelve
el intento de otro estudiante (RLS + verificación por `enrollment.student_id`).
**Estado:** ⬜ Pendiente

---

### TC-030 — Modo claro/oscuro y tipografía en las rutas del jugador
**Precondición:** Toggle de modo oscuro disponible en el navbar.
**Pasos:**
1. Recorrer en modo claro y oscuro: `.../asignaciones` (listado),
   `.../asignaciones/[assignmentId]` (jugador) y `.../asignaciones/[assignmentId]/resultados`.
**Resultado esperado:** Fondos, textos, bordes y bloques de código respetan la paleta de `DESIGN.md`
en ambos modos; tipografía JetBrains Mono consistente. Sin textos ilegibles ni fondos fuera de paleta.
**Estado:** ⬜ Pendiente
