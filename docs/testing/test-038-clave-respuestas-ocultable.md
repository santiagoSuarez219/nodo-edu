# test-038 — Ocultar/mostrar la clave de respuestas en la vista docente

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso        | Endpoint de creación | Identificador | Eliminado |
|----------------|----------------------|---------------|-----------|
| Curso académico **Spec-038 QA — Estructuras A** (`course_slug=estructuras-de-datos`, docente dueño `dev@nodo.local`) | inserción directa vía `service_role` (no existe MCP/API para crear cursos académicos; autorizado explícitamente por el usuario, 2026-08-02) | `c2e3dd17-8128-464b-b22f-56df684597fe` (código `S038A000`) | ⬜ |
| Curso académico **Spec-038 QA — Prog. Científica B** (`course_slug=programacion-cientifica`, docente dueño `dev@nodo.local`) — para TC-006 | inserción directa vía `service_role` (mismo motivo) | `bf31d772-fdca-40c2-9575-f1aa82834115` (código `S038B000`) | ⬜ |
| **Lección A** — con **3 preguntas `multiple_choice` publicadas** (P3 con dos opciones correctas, B y C, para observar el resaltado múltiple) | `question-bank-mcp` → `create_question` + `publish_question` (borrado vía `delete_question`) | `estructuras-de-datos` / `encapsulamiento` — ids de preguntas: pendientes de registrar (ver nota de bloque MCP en curso) | ⬜ |
| **Lección B** — otro curso del mismo docente, con 1 pregunta publicada (para TC-006, navegación entre cursos) | `question-bank-mcp` → `create_question` + `publish_question` | `programacion-cientifica` / `variables-tipos-de-datos-y-operadores` — id: pendiente de registrar | ⬜ |
| **Lección C** — sin ninguna pregunta `multiple_choice` publicada (control negativo) | contenido existente; verificado con `question-bank-mcp` → `list_questions` que no hay publicadas | `estructuras-de-datos` / `metodos-avanzados-y-clases-de-utilidad` | N/A |
| **Lección UML** — con **exactamente 1** pregunta publicada, para TC-014 (singular/plural) | `question-bank-mcp` → `create_question` + `publish_question` | `estructuras-de-datos` / `introduccion-al-uml` — id: pendiente de registrar | ⬜ |
| **Guía de laboratorio** del mismo curso (nodo tipo guía, sin autoevaluación) | contenido existente, no se crea | `estructuras-de-datos` / `lab-00-git-fundamentos` | N/A |
| **Docente dueño** del curso (`access.reason === "owner"`) | usuario sembrado del entorno de desarrollo (`npm run seed:teacher`) | `dev@nodo.local` / `DevLocal2026!` | N/A (no se elimina) |
| **Usuario admin** no dueño del curso (`access.reason === "admin"`) — **compartido con la ronda de spec-039** | Supabase Auth `admin.createUser` + fila en `user_roles` vía `service_role` (autorizado explícitamente, 2026-08-02) | `test-admin-shared@nodo.test` / `TestAdminShared038!` — id `b35310a3-03bd-4bfb-a8bb-fe8df9fb1253` | ⬜ |
| **Estudiante matriculado y activo** en el curso de la Lección A | `students-mcp` → `create_student` + `enroll_student` | `test-student-spec038@nodo.test` / `TestStudent038!` — id `1781b4e0-f310-4d52-a7b4-fbea9b8827a4` | ⬜ |

**Cookie involucrada:** `nodo_teacher_answer_key` (valor `"1"` = desplegado; ausente = plegado).
Para dejar el estado "sin cookie previa" en cualquier momento: DevTools →
`Application` → `Cookies` → seleccionar `nodo_teacher_answer_key` → `Delete`.

**Entorno de pruebas:** desarrollo — instancia local de Supabase en `mirp-lab`
vía túnel SSH (`.env.local`), con `npm run dev` corriendo. Ver CLAUDE.md →
"Base de datos". No ejecutar esta ronda contra producción.
**Fecha de la ronda:** {{pendiente}}

## Casos de prueba

### TC-001 — Sin cookie previa, el bloque llega plegado
**Precondición:** navegador sin la cookie `nodo_teacher_answer_key`; sesión
iniciada como docente dueño; Lección A tiene preguntas publicadas.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`; `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Iniciar sesión en `/ingresar` como `dev@nodo.local`.
2. Abrir DevTools → `Application` → `Cookies` → borrar `nodo_teacher_answer_key`
   si existe.
3. Navegar a `/estructuras-de-datos/encapsulamiento`.
4. Bajar hasta el final del artículo, donde vive el panel docente.
**Resultado esperado:** se ve la cabecera "Clave de respuestas" con el conteo de
preguntas (p. ej. "· 5 preguntas") y un control con etiqueta de texto visible
("Mostrar"). **Ningún** enunciado de pregunta ni opción es visible, y tampoco se
ve el botón "Revelar todas".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — Al desplegar, las preguntas aparecen con las respuestas ocultas
**Precondición:** TC-001 recién ejecutado; bloque plegado en pantalla.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Pulsar el control "Mostrar" de la cabecera de "Clave de respuestas".
2. Revisar una a una las preguntas mostradas.
**Resultado esperado:** el cuerpo se despliega mostrando todos los enunciados y
todas las opciones; **ninguna** opción aparece resaltada como correcta (sin
resaltado verde ni marca de "correcta"). Reaparece el botón "Revelar todas"
dentro del bloque desplegado y la etiqueta del control pasa a "Ocultar".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-003 — Recarga con el bloque desplegado: llega desplegado desde el servidor
**Precondición:** bloque desplegado (TC-002); cookie `nodo_teacher_answer_key=1`
presente.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Verificar en DevTools → `Application` → `Cookies` que existe
   `nodo_teacher_answer_key` con valor `1`.
2. En DevTools → `Network`, activar throttling `Slow 3G` (para hacer observable
   cualquier cambio posterior a la hidratación).
3. Recargar la página (`Cmd+R`) y observar el bloque desde el primer pintado.
4. Adicionalmente, ver el HTML del servidor: DevTools → `Network` → petición del
   documento → pestaña `Response`, y buscar el contenedor del cuerpo de la clave
   de respuestas.
**Resultado esperado:** el bloque se ve desplegado desde el primer instante y no
cambia de estado tras la hidratación. En el `Response` del documento, el
contenedor del cuerpo **no** lleva el atributo `hidden`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — Recarga con el bloque plegado: sin parpadeo del contenido
**Precondición:** bloque plegado; cookie `nodo_teacher_answer_key` ausente.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Plegar el bloque (o borrar la cookie) y confirmar que está plegado.
2. En DevTools → `Network`, mantener throttling `Slow 3G`.
3. Recargar y observar la zona del panel docente durante toda la carga, sin
   parpadear. Si se prefiere una evidencia objetiva: grabar la pantalla (macOS
   `Cmd+Shift+5`) y revisar la grabación fotograma a fotograma.
4. Repetir la recarga con JavaScript deshabilitado (DevTools → `Cmd+Shift+P` →
   "Disable JavaScript") para ver el HTML servido tal cual, sin hidratación.
5. Revisar el `Response` del documento en `Network` y confirmar que el
   contenedor del cuerpo lleva `hidden`.
**Resultado esperado:** en ningún fotograma de la carga (ni con JS deshabilitado)
se ven enunciados u opciones. El bloque nunca aparece desplegado para luego
plegarse.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-005 — La preferencia se conserva al navegar a otra lección del mismo curso
**Precondición:** sesión de docente dueño; bloque desplegado en la Lección A.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento` →
`estructuras-de-datos/introduccion-al-uml` (la lección "UML", con 1 pregunta
publicada)
**Pasos:**
1. Con el bloque desplegado, usar la navegación lateral de lecciones para ir a
   `estructuras-de-datos/introduccion-al-uml`.
2. Bajar al panel docente.
3. Volver a la Lección A por el mismo camino.
**Resultado esperado:** el bloque llega **desplegado** en la segunda lección y
sigue desplegado al volver. No hay que volver a pulsar el control.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — La preferencia se conserva al cambiar de curso (cookie global, D2)
**Precondición:** sesión de docente dueño; Lección B pertenece a **otro curso**
del mismo docente y tiene preguntas publicadas.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento` y `programacion-cientifica/variables-tipos-de-datos-y-operadores`
**Pasos:**
1. En la Lección A, dejar el bloque **plegado**.
2. Navegar a `/programacion-cientifica/variables-tipos-de-datos-y-operadores` y bajar al panel docente:
   comprobar el estado.
3. Desplegar el bloque en la Lección B.
4. Volver a `/estructuras-de-datos/encapsulamiento` y bajar al panel docente.
**Resultado esperado:** en el paso 2 el bloque está plegado; en el paso 4 está
desplegado. El estado es el mismo en ambos cursos: no hay una preferencia por
curso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-007 — Plegar y volver a desplegar oculta de nuevo las respuestas reveladas
**Precondición:** Lección A, bloque desplegado.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Pulsar "Revelar todas" (o revelar al menos dos preguntas individualmente) y
   confirmar que las opciones correctas quedan resaltadas.
2. Pulsar el control de la cabecera para **plegar** el bloque.
3. Pulsar de nuevo el control para **desplegarlo**.
**Resultado esperado:** al desplegar, ninguna pregunta muestra su respuesta
correcta resaltada; el estado de revelado quedó completamente limpio (el botón
vuelve a decir "Revelar todas", no "Ocultar todas").
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — El control de asistencia funciona con el bloque plegado y desplegado
**Precondición:** Lección A; docente dueño; el bloque de asistencia se renderiza
bajo la clave de respuestas.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Con la clave de respuestas **plegada**, comprobar que el bloque de asistencia
   sigue visible debajo e interactuar con él (seleccionar el grupo académico,
   abrir/consultar la sesión de asistencia según el flujo habitual).
2. Desplegar la clave de respuestas y repetir la misma interacción con el
   control de asistencia.
3. Plegar de nuevo y confirmar que el estado del control de asistencia no se
   perdió ni se reinició.
**Resultado esperado:** el control de asistencia es visible e interactivo en
ambos estados; alternar el plegado de la clave no lo desmonta, no lo reinicia ni
provoca errores en consola.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-009 — El control de plegado es accesible por teclado y expone ARIA correcto
**Precondición:** Lección A; docente dueño; bloque en cualquiera de los dos
estados.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Sin usar el ratón, tabular (`Tab`) hasta llegar al control de plegado de
   "Clave de respuestas" y comprobar que tiene indicador de foco visible.
2. Activarlo con `Enter`; luego volver a activarlo con `Espacio`.
3. Tras cada activación, comprobar que el foco **sigue** en ese mismo control
   (DevTools → Console → `document.activeElement`).
4. Inspeccionar el elemento (DevTools → `Elements`) en ambos estados y verificar
   `aria-expanded` (`true` desplegado / `false` plegado) y que el valor de
   `aria-controls` corresponde al `id` de un elemento **existente** en el DOM en
   los dos estados.
5. Con el bloque plegado, usar buscar-en-página (`Cmd+F`) con un fragmento de un
   enunciado de pregunta.
**Resultado esperado:** el control se alcanza y se opera solo con teclado; el
foco no se pierde al alternar; `aria-expanded` refleja el estado real;
`aria-controls` resuelve siempre a un elemento existente; el buscador de la
página no encuentra el enunciado mientras el bloque está plegado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-010 — Un admin no dueño obtiene el mismo comportamiento
**Precondición:** usuario con rol `admin` que **no** es dueño del curso;
navegador sin la cookie `nodo_teacher_answer_key` (usar ventana privada o
borrarla).
**Datos de prueba usados:** `test-admin-shared@nodo.test` / `TestAdminShared038!`;
`estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Iniciar sesión como el admin de prueba en una ventana privada.
2. Navegar a `/estructuras-de-datos/encapsulamiento` y bajar al panel docente.
3. Desplegar el bloque, recargar la página y volver a bajar.
4. Plegarlo y recargar de nuevo.
**Resultado esperado:** el bloque llega plegado la primera vez; despliega,
persiste tras recargar y vuelve a persistir plegado. Comportamiento idéntico al
del docente dueño (TC-001 a TC-004).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-011 — Un estudiante matriculado no ve el panel docente (no regresión)
**Precondición:** estudiante matriculado y activo en el curso de la Lección A;
sesión distinta de la del docente (ventana privada u otro navegador).
**Datos de prueba usados:** `test-student-spec038@nodo.test` / `TestStudent038!`;
`estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Iniciar sesión como el estudiante de prueba.
2. Navegar a `/estructuras-de-datos/encapsulamiento` y bajar hasta el final del
   artículo.
3. Forzar el otro estado: en DevTools → `Application` → `Cookies`, crear
   manualmente `nodo_teacher_answer_key=1` para este dominio y recargar.
4. Con la cookie puesta, revisar además el HTML servido (DevTools → `Network` →
   documento → `Response`) buscando el texto "Clave de respuestas".
**Resultado esperado:** en ninguno de los dos estados aparece el panel docente:
ni cabecera "Clave de respuestas", ni control de plegado, ni control de
asistencia. El HTML servido tampoco contiene los enunciados de la clave. La
autoevaluación del estudiante se comporta como siempre.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-012 — Lección sin preguntas publicadas: el bloque no se renderiza (no regresión)
**Precondición:** docente dueño; Lección C sin preguntas `multiple_choice`
publicadas.
**Datos de prueba usados:** `estructuras-de-datos/metodos-avanzados-y-clases-de-utilidad`
**Pasos:**
1. Como docente dueño, con la cookie `nodo_teacher_answer_key=1` presente
   (estado desplegado), navegar a `/estructuras-de-datos/metodos-avanzados-y-clases-de-utilidad`.
2. Bajar al final del artículo.
3. Borrar la cookie, recargar y volver a mirar.
**Resultado esperado:** en ambos casos **no** aparece el bloque "Clave de
respuestas" ni su control de plegado — no una cabecera vacía, sino ausencia
total. El bloque de control de asistencia sí se muestra.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-013 — Guía de laboratorio: el bloque no se renderiza (no regresión)
**Precondición:** docente dueño; nodo de tipo guía de laboratorio, sin
autoevaluación.
**Datos de prueba usados:** `estructuras-de-datos/lab-00-git-fundamentos`
**Pasos:**
1. Como docente dueño y con la cookie `nodo_teacher_answer_key=1` presente,
   navegar a `/estructuras-de-datos/lab-00-git-fundamentos`.
2. Recorrer la página hasta el final.
**Resultado esperado:** no aparece el bloque "Clave de respuestas" ni su control
de plegado. El resto de la vista docente de la guía se comporta como antes del
spec.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-014 — Conteo de preguntas en la cabecera plegada (singular/plural)
**Precondición:** docente dueño; una lección con **varias** preguntas publicadas
y, si es posible, otra con **exactamente una** (se puede lograr despublicando
temporalmente con `question-bank-mcp` o creando una pregunta única en una
lección sin preguntas).
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento` y la lección con una
sola pregunta
**Pasos:**
1. Con el bloque plegado en la lección con varias preguntas, leer el conteo de
   la cabecera y contrastarlo con el número real de preguntas al desplegar.
2. Repetir en la lección con una sola pregunta publicada.
**Resultado esperado:** el conteo coincide exactamente con las preguntas del
bloque y la concordancia es correcta: "1 pregunta" en singular, "N preguntas" en
plural.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-015 — Caducidad de la preferencia desplegada (12 h, D5)
**Precondición:** docente dueño; bloque desplegado.
**Datos de prueba usados:** `estructuras-de-datos/encapsulamiento`
**Pasos:**
1. Con el bloque desplegado, abrir DevTools → `Application` → `Cookies` y
   localizar `nodo_teacher_answer_key`.
2. Leer la columna `Expires / Max-Age`.
3. Plegar el bloque y volver a mirar la lista de cookies.
**Resultado esperado:** al desplegar, la cookie vale `1` y caduca ~12 horas
después del momento actual (no un año, no "Session"). Al plegar, la cookie
**desaparece** de la lista (no queda con valor `0`).
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 15
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
