# test-019 — Resolución de evaluaciones por el estudiante

> Casos manuales de UI para [spec-019](../specs/spec-019-assignment-solving.md). Cubren el
> flujo del estudiante sobre el **modelo de variantes** de spec-018: una evaluación es un
> **grupo de 3 variantes** (`assignment_variant_groups`) y a cada estudiante se le **sortea
> una** en su primer acceso. Las rutas se indexan por `groupId` (nunca por la variante).
>
> Estos casos se redactan junto con el spec (enfoque test-first) y arrancan en **Pendiente**;
> la implementación los pone en verde.

---

## Datos de prueba

> Montado 2026-07-24 vía la API de servicio (`x-api-key` con `QUESTION_BANK_API_KEY`, misma
> clave para `/api/questions` y `/api/assignments/*`) contra `npm run dev` local apuntando al
> único proyecto Supabase del proyecto (ver `CLAUDE.md`). El docente y el curso se
> **reutilizan** de la infraestructura de QA ya existente (mismo patrón que `test-016`/
> `test-017`/`test-018`) en vez de crear una cuenta/curso nuevos — evita fragmentar aún más el
> banco de preguntas. Las matrículas de A/B/C y la cuenta retirada **ya existían**; D y E son
> nuevas (creadas vía Admin API de Supabase Auth con `email_confirm: true`, ya que el signup
> normal exige confirmación por correo).
>
> **Password de todas las cuentas de estudiante:** `TestPassword123!` (verificado con
> `POST /auth/v1/token?grant_type=password` para las 6 — todas responden `200`).

| Recurso | Endpoint/MCP de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente T = Santiago (cuenta real, reutilizada — **no crear ni borrar**) | preexistente | `587ceede-6e6a-484a-a95d-4d62fcda79eb` | N/A |
| Curso académico C = "Estructuras de datos" (curso real, reutilizado — **no crear ni borrar**) | preexistente | `7bd3f233-c8e0-4e9e-bf2e-634b0a883756` (código `5RSENUWM`) | N/A |
| Estudiante A — `test-student-a@example.com` | preexistente (test-016) | `e8eaf5d1-705c-48e9-9868-8b4895e99222` | N/A (reutilizada) |
| Estudiante B — `test-student-b@example.com` | preexistente (test-016) | `30291805-8cbd-40c1-8d3c-82368ce6d02a` | N/A (reutilizada) |
| Estudiante C — `test-student-c@example.com` | preexistente (test-016/017) | `4c4a4cab-09c6-4cdd-9a9d-0295524f1da0` | N/A (reutilizada) |
| Estudiante D — `test-student-d@example.com` | `POST /auth/v1/admin/users` | `49743269-a082-4840-b5a6-79d1647099fe` | Conservado (fixture reutilizable) |
| Estudiante E — `test-student-e@example.com` | `POST /auth/v1/admin/users` | `803a1569-77d4-40b5-8da6-6b9758d193b9` | Conservado (fixture reutilizable) |
| Matrícula `active` A↔C | preexistente | `52cd45bd-aea7-4fb5-93ec-4e1948233fbd` | N/A (reutilizada) |
| Matrícula `active` B↔C (usada además como "ajena" en TC-004) | preexistente | `86c567a0-7740-4287-b869-dabc5c23fa71` | N/A (reutilizada) |
| Matrícula `active` C↔C | preexistente | `a2bdb7fa-e019-4dd5-af74-455841f1bb3b` | N/A (reutilizada) |
| Matrícula `active` D↔C | `insert enrollments` (sin endpoint de admin; ver nota) | `c81bdb0d-749f-4db9-b61e-736d31fbc42c` | Conservado (fixture reutilizable) |
| Matrícula `active` E↔C | `insert enrollments` | `a72f991b-252c-40c9-a1aa-7d27286952e4` | Conservado (fixture reutilizable) |
| Estudiante retirado — `estudiante.retirado.test@nodo.local` (password reseteada a `TestPassword123!`) | preexistente (password vía Admin API) | `52309301-1719-4136-86e4-1c12e7265614` | N/A (reutilizada) |
| Matrícula `withdrawn` (retirado)↔C — usada para TC-005 | preexistente | `e5946a4d-90fa-45b3-9fd5-6bda70d3c7a5` | N/A (reutilizada) |
| `grade_item` "Taller 1" (reutilizado, sin notas previas para A) | preexistente | `9619aac3-7297-409a-9420-5da67194d01b` | N/A (reutilizado) |
| Pregunta nueva `open_text` | `POST /api/questions` | `7b4a83f4-1f5b-4ffa-800d-a92a1d9822dd` | Conservado (fixture reutilizable) |
| Pregunta nueva `code_snippet` | `POST /api/questions` | `f94454a1-dae2-4251-a30e-f4c185d10b62` | Conservado (fixture reutilizable) |
| Pregunta nueva `code_write` | `POST /api/questions` | `8a014230-4bfa-4413-ad72-2198bd90ae58` | Conservado (fixture reutilizable) |
| **G1** — solo `multiple_choice` (3 variantes con preguntas **distintas**, incl. 1 borrador `c30311dc...` para validar el fix de RLS de spec-019), `grade_item`="Taller 1", `max_attempts=1`, `show_feedback_on=submit`, ventana 07-01→08-15 | `POST /api/assignments/groups` + `/publish` | `87339e5e-9e2d-4e5e-9a25-198eb8650bc3` | Conservado (fixture reutilizable) |
| **G2** — 3 variantes **idénticas** con los 5 tipos (`multiple_choice`+`open_text`+`code_snippet`+`code_write`+`coding_challenge`, todas en borrador salvo la MC), `max_attempts=1`, ventana 07-01→08-15 | `POST .../groups` + `/publish` | `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84` | Conservado (fixture reutilizable) |
| **G3** — `time_limit_minutes=1` (countdown corto), 2 `multiple_choice`, ventana 07-01→08-15 | `POST .../groups` + `/publish` | `c5f33cc8-5e4c-498c-b96f-df9f143f9e69` | Conservado (fixture reutilizable) |
| **G4** — `show_feedback_on=close`, ventana 07-01→08-15 (abierta durante la ronda) | `POST .../groups` + `/publish` | `e0097486-7294-439e-a739-08459dfec6f2` | Conservado (fixture reutilizable) |
| **G5** — `show_feedback_on=never`, ventana 07-01→08-15 | `POST .../groups` + `/publish` | `0ae7a8f3-5a40-42fc-b815-0f6c149e9d5f` | Conservado (fixture reutilizable) |
| **G6** — `max_attempts=2`, ventana 07-01→08-15 | `POST .../groups` + `/publish` | `f855bcab-fffa-4dfa-a27b-3a3c5b7fd2db` | Conservado (fixture reutilizable) |
| **G7** — borrador, `is_published=false` (nunca se publicó) | `POST .../groups` (sin publish) | `7766326b-f320-442a-9f05-48bff5c778cf` | Conservado (fixture reutilizable) |
| **G8** — publicada con `opens_at` futuro (09-01→09-15) | `POST .../groups` + `/publish` | `00f52ff7-8ce6-4ca3-a41b-52418003d227` | Conservado (fixture reutilizable) |
| **G9** — publicada con `closes_at` pasado (06-01→07-10; publicada con cierre futuro temporal y luego movida al pasado vía `PATCH`, porque `/publish` rechaza `closes_at` ya vencido) | `POST .../groups` + `/publish` + `PATCH` | `a8c615e5-9aed-4633-892a-b6fbf5b3d758` | Conservado (fixture reutilizable) |

> **Desviación del diseño original:** solo **G1** tiene variantes con preguntas distintas
> (necesario para TC-006/007/008/009, que verifican sorteo/estabilidad/reparto/aislamiento
> *entre variantes*). G2–G9 usan la **misma** composición de preguntas en sus 3 variantes —
> sus casos no dependen de qué variante le toque a cada estudiante, y con solo 8 preguntas
> nuevas/reutilizables en el banco esto evita agotarlas. Todas cumplen el invariante de
> spec-018 (mismo puntaje total entre variantes) por construcción.
>
> **Nota:** no existe un endpoint de servicio para matricular estudiantes (la matrícula es
> siempre self-service vía código, spec-003) ni para restablecer contraseñas de prueba —
> se usó `insert` directo en `enrollments` y el Admin API de Supabase Auth
> (`/auth/v1/admin/users`) respectivamente, ambos con la clave de servicio, no con la app.

**Entorno de pruebas:** desarrollo (proyecto Supabase único `academy-page`)
**Fecha de la ronda:** 2026-07-24 (34/34 casos ejecutados y aprobados)

---

## Casos de prueba

### TC-001 — Acceso al listado sin sesión
**Precondición:** No hay sesión activa.
**Datos de prueba usados:** `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`
**Pasos:**
1. Abrir directamente `/cuenta/cursos/52cd45bd-aea7-4fb5-93ec-4e1948233fbd/evaluaciones`.
**Resultado esperado:** Redirige a `/login?redirectTo=...` (la ruta resuelve con `requireUser`).
**Estado:** ✅ Aprobado
**Hallazgos:** Redirigió correctamente al login. Sin observaciones.

---

### TC-002 — Estudiante ve las evaluaciones publicadas y dentro de ventana de su curso
**Precondición:** Sesión como Estudiante A, matrícula `active`. G1/G2/G3/G4/G5/G6 publicadas y en ventana.
**Datos de prueba usados:** `test-student-a@example.com`, `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`
**Pasos:**
1. Navegar a `/cuenta/cursos`.
2. Entrar al curso y abrir el listado de evaluaciones (`/cuenta/cursos/52cd45bd-aea7-4fb5-93ec-4e1948233fbd/evaluaciones`).
**Resultado esperado:** Se listan las evaluaciones publicadas y activas, cada una con el estado de
su último intento (sin intento / en progreso / enviado / calificado).
**Estado:** ✅ Aprobado
**Hallazgos:** Se listaron G1–G6 y "Quiz de prueba TC-MCP-006" (debris de test-018, esperado),
todas con estado "Sin intentos". G7/G8/G9 no aparecieron (adelanta TC-003).

---

### TC-003 — Evaluaciones no publicadas o fuera de ventana no aparecen
**Precondición:** Sesión como Estudiante A. Existen G7 (borrador), G8 (`opens_at` futuro) y G9 (`closes_at` pasado).
**Datos de prueba usados:** `7766326b-f320-442a-9f05-48bff5c778cf`, `00f52ff7-8ce6-4ca3-a41b-52418003d227`, `a8c615e5-9aed-4633-892a-b6fbf5b3d758`
**Pasos:**
1. Abrir el listado de evaluaciones de la matrícula.
**Resultado esperado:** Ninguna de G7/G8/G9 aparece como disponible para resolver.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado sobre el mismo listado de TC-002: G7 (borrador), G8 (`opens_at` futuro)
y G9 (`closes_at` pasado) no aparecen. Sin observaciones.

---

### TC-004 — Aislamiento: no se ven evaluaciones de cursos no matriculados
**Precondición:** Existe un `enrollmentId` de un curso donde A NO está matriculado (p. ej. `86c567a0-7740-4287-b869-dabc5c23fa71`).
**Datos de prueba usados:** `test-student-a@example.com`, `86c567a0-7740-4287-b869-dabc5c23fa71`
**Pasos:**
1. Sesión como Estudiante A.
2. Acceder directamente a `/cuenta/cursos/86c567a0-7740-4287-b869-dabc5c23fa71/evaluaciones`.
**Resultado esperado:** `404` (RLS + verificación `enrollment.student_id === user.id`).
**Estado:** ✅ Aprobado
**Hallazgos:** Devolvió 404 al intentar acceder a la matrícula de B. Sin observaciones.

---

### TC-005 — Aislamiento: matrícula retirada no accede al listado
**Precondición:** La cuenta dedicada `estudiante.retirado.test@nodo.local` tiene una matrícula
`status = withdrawn` (`e5946a4d-90fa-45b3-9fd5-6bda70d3c7a5`) — no es una matrícula de A.
**Datos de prueba usados:** `estudiante.retirado.test@nodo.local` / `TestPassword123!`,
`e5946a4d-90fa-45b3-9fd5-6bda70d3c7a5`
**Pasos:**
1. Cerrar sesión de A e iniciar sesión con `estudiante.retirado.test@nodo.local`.
2. Acceder a `/cuenta/cursos/e5946a4d-90fa-45b3-9fd5-6bda70d3c7a5/evaluaciones`.
**Resultado esperado:** `404` (la ruta exige `enrollment.status === "active"`).
**Estado:** ✅ Aprobado
**Hallazgos:** Devolvió 404 correctamente. Se observó un warning de consola sobre `<Script>`
en `app/layout.tsx` — preexistente, no relacionado con este spec (falso positivo conocido del
dev overlay de Next 16 con `strategy="beforeInteractive"`), no afecta el resultado.

---

### TC-006 — Asignación de variante en el primer acceso
**Precondición:** Estudiante A sin intento previo en G1.
**Datos de prueba usados:** `test-student-a@example.com`, `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Abrir `/cuenta/cursos/52cd45bd-aea7-4fb5-93ec-4e1948233fbd/evaluaciones/87339e5e-9e2d-4e5e-9a25-198eb8650bc3` por primera vez.
2. Anotar qué variante (A/B/C) se presenta.
**Resultado esperado:** El servidor **sortea y persiste** una variante para A en
`assignment_variant_allocations`; se monta el `AssignmentPlayer` con las preguntas de **esa**
variante. La URL sigue indexada por `groupId`, no por la variante.
**Estado:** ✅ Aprobado
**Hallazgos:** A quedó asignada a la **variante A** (confirmado por el enunciado mostrado:
"¿Cuál es la diferencia principal entre Git y GitHub?" + "¿Cuál es la diferencia entre
`git reset --soft` y `git reset --hard`?"), incluida la pregunta en **borrador** — valida el
fix de RLS/RPC de spec-019 (DEBT-007). **Bug encontrado y corregido durante la ejecución:**
`createSubmission` validaba `max_attempts` **antes** de buscar un intento `in_progress` para
recuperar; con `max_attempts=1` esto bloqueaba cualquier recarga de un intento ya creado con
"Has alcanzado el número máximo de intentos". Se invirtió el orden en
`lib/submissions/index.ts` (recuperación primero, conteo de `max_attempts` solo al crear un
intento genuinamente nuevo). Tras el fix, la recarga recuperó el intento correctamente.

---

### TC-007 — Estabilidad de la variante entre accesos e intentos
**Precondición:** A ya tiene una variante asignada en G1 (TC-006).
**Datos de prueba usados:** `test-student-a@example.com`, `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Salir del jugador y reabrir la evaluación varias veces.
2. (Si G6/`max_attempts=2`) iniciar un segundo intento y comparar las preguntas.
**Resultado esperado:** Siempre se presenta **la misma variante** que en el primer acceso; el
estudiante nunca la elige ni la re-sortea. En intentos sucesivos, las preguntas son las de esa
misma variante.
**Estado:** ✅ Aprobado
**Hallazgos:** Al reabrir G1, se mostraron las mismas dos preguntas de la variante A (sin
re-sorteo). El paso 2 (segundo intento sobre G6) no aporta señal adicional porque en este
fixture las 3 variantes de G6 son idénticas por diseño (ver nota de "Datos de prueba"); queda
cubierto de todas formas al ejecutar TC-032 más adelante.

---

### TC-008 — Reparto balanceado entre estudiantes (A/B/C)
**Precondición:** Cohorte A, B, C, D, E sin intentos en G1.
**Datos de prueba usados:** `test-student-a@example.com`, `test-student-b@example.com`, `test-student-{c,d,e}@example.com`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Cada estudiante abre G1 por primera vez (una sesión por estudiante).
2. El docente consulta el reparto (`assignment-mcp` / tabla de allocations).
**Resultado esperado:** Las asignaciones se reparten de forma balanceada entre las 3 variantes
(sin que una acapare todos los estudiantes), coherente con `getOrAllocateVariant`.
**Estado:** ✅ Aprobado
**Hallazgos:** Reparto final (verificado por SQL): A=2, B=2, C=1 — balanceado (diferencia
máxima de 1 entre variantes), coherente con el algoritmo de mínimo-conteo.
**Bug encontrado y corregido durante la ejecución:** el primer acceso de B (y presumiblemente
cualquier primer acceso a una variante nunca asignada) devolvía **404** con ~4.5s de
`application-code` y sin stack trace — la escritura (allocation + submission) sí se completaba
en la base, pero algo posterior en la misma petición fallaba silenciosamente. Se refactorizó
`.../evaluaciones/[groupId]/page.tsx` para dejar de releer datos innecesariamente justo después
de escribirlos: usa `created.data` (la fila que `createSubmission` ya devuelve) en vez de
volver a pedir la submission por `variant_group_id + enrollment_id`, y consulta el grupo
directamente en vez de pasar por `getStudentAssignment` (que reresolvía la allocation completa
otra vez). Tras el fix, los 5 estudiantes (A–E) cargaron el jugador en su primer acceso sin
errores.

---

### TC-009 — Aislamiento entre variantes (no leer las otras dos)
**Precondición:** A tiene asignada, p. ej., la variante A de G1; existen las variantes B y C con
otras preguntas.
**Datos de prueba usados:** `test-student-a@example.com`, `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Sesión como Estudiante A en el jugador de G1.
2. Inspeccionar la respuesta del servidor / red: intentar ver si viajan las preguntas de las
   variantes no asignadas.
3. Intentar forzar la apertura de un intento sobre otra variante (manipulando parámetros o el
   `assignment_id`).
**Resultado esperado:** A solo puede leer las preguntas de **su** variante; no se exponen las de
las otras dos ni puede abrir un intento sobre una variante ajena (la RLS de `insert` ata el
`assignment_id` a la variante asignada en `assignment_variant_allocations`).
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado a nivel de servidor (no solo UI): `get_variant_question_details` con
la variante propia de A devuelve sus 2 preguntas; la misma función llamada con el
`assignment_id` de la variante de B pero el `enrollment_id` de A devuelve **0 filas** — el
aislamiento está garantizado dentro de la RPC `security definer`, no solo por lo que la UI
decide mostrar. El paso 3 (forzar apertura de intento sobre otra variante) no tiene vector
desde la UI: la ruta nunca acepta un id de variante del cliente, y la política RLS de `insert`
en `submissions` exige que `assignment_id` coincida con la allocation del `enrollment_id`.

---

### TC-010 — Abrir una evaluación crea un intento `in_progress`
**Precondición:** Estudiante A con G2 activa y sin intentos previos.
**Datos de prueba usados:** `test-student-a@example.com`, `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Abrir la evaluación desde el listado.
2. Verificar que se monta el `AssignmentPlayer`.
**Resultado esperado:** Se crea un intento `in_progress` (`attempt_number = 1`) sobre la variante
asignada; se renderizan las preguntas.
**Estado:** ✅ Aprobado
**Hallazgos:** Cargó con las 5 preguntas (una por tipo). Sin observaciones.

---

### TC-011 — Reabrir la evaluación recupera el mismo intento en progreso
**Precondición:** A con un intento `in_progress` en G2 (TC-010) y algunas respuestas guardadas.
**Datos de prueba usados:** `test-student-a@example.com`, `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Navegar fuera del jugador y volver a abrir la misma evaluación.
**Resultado esperado:** Se recupera el mismo intento `in_progress` (idempotencia; no se crea uno
nuevo) con las respuestas previas ya cargadas.
**Estado:** ✅ Aprobado
**Hallazgos:** Al salir y reabrir G2, el mismo intento se recuperó con las respuestas
previamente escritas ya precargadas.

---

### TC-012 — Renderizado de pregunta `multiple_choice`
**Precondición:** Jugador abierto con una `multiple_choice`.
**Datos de prueba usados:** `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Observar la pregunta y seleccionar una o varias opciones.
**Resultado esperado:** Las opciones son seleccionables y la selección se refleja en la UI.
**Estado:** ✅ Aprobado
**Hallazgos:** Opciones seleccionables correctamente. **Bug encontrado y corregido:** el hover
de la opción usaba la clase inválida `dark:hover:bg-gray-750` (no existe ese tono en Tailwind,
nunca se generaba CSS), así que en modo oscuro el hover caía al `hover:bg-gray-50` claro,
iluminando la opción de forma incorrecta. Corregido a `dark:hover:bg-gray-700` en
`components/student/QuestionRenderer.tsx`, consistente con el resto del proyecto.

---

### TC-013 — Renderizado y respuesta de `open_text`
**Precondición:** Jugador abierto con una `open_text`.
**Datos de prueba usados:** `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Escribir una respuesta de texto libre.
**Resultado esperado:** El campo acepta y conserva la respuesta al navegar por el jugador.
**Estado:** ✅ Aprobado
**Hallazgos:** Campo de texto libre funcionando. Sin observaciones.

---

### TC-014 — Renderizado de `code_snippet`
**Precondición:** Jugador abierto con una `code_snippet`.
**Datos de prueba usados:** `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Observar el enunciado con el fragmento de código y responder según su formato.
**Resultado esperado:** El código se muestra en un bloque monoespaciado con fondo oscuro
(distinguible visualmente del resto del contenido) y la respuesta se captura. No usa Shiki —
solo el bloque de MDX lo usa; el jugador usa un `<pre>` simple, consistente con `code_write`.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado: bloque oscuro monoespaciado, sin resaltado de sintaxis (comportamiento
esperado tras corregir la redacción del caso). Respuesta capturada correctamente.

---

### TC-015 — Renderizado y respuesta de `code_write`
**Precondición:** Jugador abierto con una `code_write`.
**Datos de prueba usados:** `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Escribir código en el área de respuesta.
**Resultado esperado:** El área acepta el texto y lo conserva como respuesta abierta.
**Estado:** ✅ Aprobado
**Hallazgos:** Área de escritura de código funcionando (estilo editor, fondo oscuro). Sin
observaciones.

---

### TC-016 — `coding_challenge` sin ejecución (stub deshabilitado)
**Precondición:** Jugador abierto con una `coding_challenge`.
**Datos de prueba usados:** `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Observar el reto y escribir una solución.
2. Intentar ejecutar/correr el código si hay control para ello.
**Resultado esperado:** La pregunta se renderiza y la respuesta se guarda como texto abierto. La
ejecución está deshabilitada (stub `disabled`): no corre pruebas ni devuelve resultados; se indica
que la ejecución no está disponible.
**Estado:** ✅ Aprobado
**Hallazgos:** Se renderizó el reto, se escribió una solución, y al pulsar "Ejecutar" apareció
"La ejecución de código no está disponible en esta versión" — el stub `runCode` funciona como
se esperaba.

---

### TC-017 — Auto-save con debounce de 3 s
**Precondición:** Jugador con intento `in_progress`.
**Datos de prueba usados:** `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Responder una pregunta (opción de `multiple_choice` o texto en `open_text`).
2. Esperar ~3 s sin más interacción y observar el indicador del header sticky.
**Resultado esperado:** Tras el debounce la respuesta se persiste en `answers` y el header muestra
"guardado", sin pulsar "Enviar".
**Estado:** ✅ Aprobado
**Hallazgos:** El indicador pasó de "Sin guardar" a "Guardando…" y luego "✓ Guardado" tras el
debounce de 3 s, sin pulsar "Enviar".

---

### TC-018 — Persistencia de respuestas al recargar
**Precondición:** A con respuestas ya auto-guardadas (TC-017).
**Datos de prueba usados:** `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Recargar el jugador (F5) o cerrar y reabrir la pestaña.
**Resultado esperado:** Las respuestas guardadas se recuperan precargadas; no se pierde el trabajo.
**Estado:** ✅ Aprobado
**Hallazgos:** Confirmado junto con TC-011: al reabrir el jugador, las respuestas seguían
precargadas. Sin observaciones.

---

### TC-019 — Countdown visible con `time_limit_minutes`
**Precondición:** A abre G3 (con `time_limit_minutes`).
**Datos de prueba usados:** `c5f33cc8-5e4c-498c-b96f-df9f143f9e69`
**Pasos:**
1. Abrir la evaluación y observar el header sticky.
**Resultado esperado:** Se muestra un countdown que decrementa desde `started_at + time_limit`; al
bajar de 60 s se resalta.
**Estado:** ✅ Aprobado
**Hallazgos:** Countdown visible y decrementando, resaltado al estar por debajo de 60 s (todo el
límite es de 1 min). Sin observaciones.

---

### TC-020 — Submit automático al vencer el `time_limit`
**Precondición:** G3 con `time_limit_minutes` corto (~1 min).
**Datos de prueba usados:** `c5f33cc8-5e4c-498c-b96f-df9f143f9e69`
**Pasos:**
1. Abrir la evaluación, responder algunas preguntas.
2. Dejar correr el countdown hasta 0 sin enviar manualmente.
**Resultado esperado:** Al llegar a 0 se descargan (flush) las respuestas pendientes y el intento se
envía automáticamente: pasa a `submitted`/`graded` según corresponda y muestra/redirige a resultados.
**Estado:** ✅ Aprobado
**Hallazgos:** Al llegar a 0 el envío ocurrió automáticamente y redirigió a la página de
resultados, sin acción manual del estudiante.

---

### TC-021 — Confirmación antes de enviar
**Precondición:** Jugador con intento `in_progress`.
**Datos de prueba usados:** `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Pulsar "Enviar respuestas".
2. En el diálogo, cancelar.
**Resultado esperado:** El envío se cancela y el intento sigue `in_progress`; solo al confirmar se
ejecuta el envío.
**Estado:** ✅ Aprobado
**Hallazgos:** Cancelar deja el intento intacto y editable. **Mejora de UX aplicada durante la
ejecución (pedida por el usuario):** el diálogo de confirmación usaba `window.confirm()`
nativo del navegador, inconsistente con el diseño de la app. Se reemplazó por un modal propio
en `AssignmentPlayer.tsx` (overlay, `role="dialog"`, cierre con Escape/click fuera, foco en el
botón de confirmar, estilos de `DESIGN.md` en claro/oscuro). Confirmado visualmente por el
usuario en ambos modos.

---

### TC-022 — Envío manual y cálculo de `auto_score` de `multiple_choice`
**Precondición:** A con intento en progreso en G1; respondió `multiple_choice` con una selección
conocida (algunas correctas, alguna incorrecta).
**Datos de prueba usados:** `test-student-a@example.com`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Pulsar "Enviar respuestas" y confirmar.
**Resultado esperado:** El intento pasa a `submitted`. Cada `multiple_choice` se puntúa por
**coincidencia exacta** del conjunto de opciones: `is_correct` y `auto_score = points` o `0`. El
`auto_score` total se calcula (redondeado a 2 decimales) y persiste.
**Estado:** ✅ Aprobado
**Hallazgos:** Con 1 respuesta correcta (5 pts) y 1 incorrecta (0 pts) sobre 10 pts totales, el
resultado mostrado fue **5/10** — coincide exactamente con lo esperado.

---

### TC-023 — Feedback inmediato con `show_feedback_on = submit`
**Precondición:** G1 con `show_feedback_on = submit`.
**Datos de prueba usados:** `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Resolver y enviar; observar las `multiple_choice` tras el envío.
**Resultado esperado:** Se muestra la corrección (opciones correctas/incorrectas) de inmediato.
**Estado:** ✅ Aprobado
**Hallazgos:** Tras enviar, se mostró de inmediato cuál respuesta fue correcta y cuál
incorrecta. Confirma que `get_variant_question_details` revela `is_correct` correctamente en
cuanto `status` pasa a `submitted`/`graded` con `show_feedback_on=submit`.

---

### TC-024 — Feedback diferido con `show_feedback_on = close`
**Precondición:** G4 con `show_feedback_on = close` y ventana aún abierta.
**Datos de prueba usados:** `e0097486-7294-439e-a739-08459dfec6f2`
**Pasos:**
1. Resolver y enviar con `closes_at` en el futuro.
2. Revisar la vista de resultados.
**Resultado esperado:** La corrección de las `multiple_choice` **no** se muestra mientras la
evaluación no esté cerrada.
**Estado:** ✅ Aprobado
**Hallazgos:** Se mostró la calificación pero sin revelar qué opciones eran correctas — ventana
de G4 aún abierta (`closes_at` futuro).

---

### TC-025 — Sin feedback con `show_feedback_on = never`
**Precondición:** G5 con `show_feedback_on = never`.
**Datos de prueba usados:** `0ae7a8f3-5a40-42fc-b815-0f6c149e9d5f`
**Pasos:**
1. Resolver y enviar; revisar los resultados.
**Resultado esperado:** No se revela qué opciones eran correctas en ningún momento.
**Estado:** ✅ Aprobado
**Hallazgos:** Se mostró la calificación pero nunca la corrección por opción, consistente con
`show_feedback_on=never`.

---

### TC-026 — Cierre automático a `graded` sin preguntas de revisión manual
**Precondición:** G1 (solo `multiple_choice`) con `grade_item_id` vinculado.
**Datos de prueba usados:** `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`, `9619aac3-7297-409a-9420-5da67194d01b`
**Pasos:**
1. Resolver y enviar; revisar la vista de resultados.
**Resultado esperado:** El intento pasa directamente a `graded` con `final_score = auto_score` y
`graded_at`; `SubmissionResult` muestra el puntaje final.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado en base de datos: `status='graded'`, `final_score=5.00`,
`graded_at` con timestamp — coincide con el 5/10 mostrado inmediatamente tras el envío en
TC-022/023 (sin quedar en `submitted` pendiente).

---

### TC-027 — Propagación de nota a `student_grades`
**Precondición:** TC-026 ejecutado (G1 con `grade_item_id`).
**Datos de prueba usados:** `test-student-a@example.com`, `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `9619aac3-7297-409a-9420-5da67194d01b`
**Pasos:**
1. Tras el cierre a `graded`, navegar al detalle de la matrícula (`/cuenta/cursos/52cd45bd-aea7-4fb5-93ec-4e1948233fbd`).
2. Verificar la nota del ítem vinculado.
**Resultado esperado:** La nota se propaga a `student_grades` (upsert por `enrollment_id +
grade_item_id`) y aparece en el boletín del estudiante.
**Estado:** ✅ Aprobado (tras corrección)
**Hallazgos:** **Bug real encontrado:** la propagación fallaba silenciosamente — "Taller 1" no
mostraba ninguna nota. Causa: `propagateToGradeItem` escribía en `student_grades` con el
cliente de **sesión del estudiante**, pero la RLS de esa tabla solo permite `insert`/`update`
al docente dueño del curso; el `upsert` se rechazaba y el código nunca revisaba el error de esa
llamada. Corregido con otra RPC `security definer` acotada
(`propagate_submission_grade(p_submission_id)`, migración
`20260724000003_propagate_submission_grade_rpc.sql`): verifica que el `enrollment` de la
submission pertenezca al llamador y lee el puntaje de `submissions.auto_score` (ya persistido
antes de llamarla) en vez de aceptarlo como parámetro, para que no sea posible propagar un
puntaje arbitrario invocando la función directo por la API REST. Se hizo backfill manual de la
nota de A para este caso ya cerrado (el flujo corregido aplica automáticamente a los envíos
siguientes). Tras el fix, "Taller 1" mostró **5.00**.

---

### TC-028 — Intento con preguntas abiertas queda `submitted`
**Precondición:** G2 con al menos una abierta (`open_text`/`code_write`/`coding_challenge`).
**Datos de prueba usados:** `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Resolver todas las preguntas y enviar; revisar resultados.
**Resultado esperado:** El intento queda `submitted` (no `graded`): las `multiple_choice` muestran
su `auto_score` y las abiertas figuran pendientes de revisión del docente (spec-020). La nota final
aún no se propaga.
**Estado:** ✅ Aprobado
**Hallazgos:** El intento quedó como "Enviado — pendiente de revisión" (no calificado), tal
como se espera al haber preguntas abiertas sin calificación manual.

---

### TC-029 — Vista de resultados (`SubmissionResult`)
**Precondición:** A con un intento ya enviado/calificado.
**Datos de prueba usados:** `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Navegar a `/cuenta/cursos/52cd45bd-aea7-4fb5-93ec-4e1948233fbd/evaluaciones/87339e5e-9e2d-4e5e-9a25-198eb8650bc3/resultados` (o dejar que el
   jugador redirija tras el envío).
**Resultado esperado:** Se muestra el estado del intento, el puntaje (`auto_score`/`final_score`
según corresponda) y el feedback por pregunta acorde a `show_feedback_on`.
**Estado:** ✅ Aprobado
**Hallazgos:** Ya verificado repetidamente en TC-022/023 (G1, calificado, feedback visible),
TC-024/025 (G4/G5, calificación sin feedback) y TC-028 (G2, pendiente de revisión) — la vista
de resultados muestra correctamente estado, puntaje y feedback según `show_feedback_on` en
todos los casos.

---

### TC-030 — Intento cerrado redirige a resultados
**Precondición:** A con un intento `submitted`/`graded` en G1 (`max_attempts = 1`).
**Datos de prueba usados:** `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Volver a abrir la evaluación desde el listado (`.../evaluaciones/87339e5e-9e2d-4e5e-9a25-198eb8650bc3`).
**Resultado esperado:** En vez de montar el jugador, redirige a la página de resultados del intento
cerrado.
**Estado:** ✅ Aprobado
**Hallazgos:** Al reabrir G1 (ya `graded`), redirige directo a resultados sin montar el
jugador.

---

### TC-031 — `max_attempts` agotados (contado por evaluación)
**Precondición:** G1 con `max_attempts = 1` ya resuelta y cerrada por A.
**Datos de prueba usados:** `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Intentar iniciar un nuevo intento sobre G1.
**Resultado esperado:** No se crea un intento nuevo (se respeta `max_attempts` **por grupo**); se
muestra el resultado previo o "sin intentos disponibles", sin reabrir.
**Estado:** ✅ Aprobado
**Hallazgos:** En resultados de G1, el botón "Iniciar nuevo intento" no aparece
(`attempt_number(1) < max_attempts(1)` es falso) — no hay forma de reabrir desde la UI.

---

### TC-032 — Segundo intento permitido con `max_attempts = 2`
**Precondición:** G6 con `max_attempts = 2`; A ya cerró el intento 1.
**Datos de prueba usados:** `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `f855bcab-fffa-4dfa-a27b-3a3c5b7fd2db`
**Pasos:**
1. Iniciar un nuevo intento sobre G6.
**Resultado esperado:** Se crea `attempt_number = 2` **sobre la misma variante** asignada; el jugador
se monta limpio para responder de nuevo.
**Estado:** ✅ Aprobado
**Hallazgos:** El botón "Iniciar nuevo intento" permitió abrir un segundo intento limpio sobre
G6, respetando `max_attempts=2` contado por grupo.

---

### TC-033 — Aislamiento: no acceder al intento de otro estudiante
**Precondición:** El Estudiante B tiene un intento propio en G1; se conoce su `submissionId` o su URL.
**Datos de prueba usados:** `test-student-a@example.com`, `test-student-b@example.com`, `87339e5e-9e2d-4e5e-9a25-198eb8650bc3`
**Pasos:**
1. Sesión como Estudiante A.
2. Intentar acceder al intento de B (jugador o resultados) y/o `POST /api/submissions/{submissionIdDeB}/submit`.
**Resultado esperado:** `404`/`403` según corresponda; A no ve, resuelve ni envía el intento de B
(RLS + verificación por `enrollment.student_id` en la API `/submit`).
**Estado:** ✅ Aprobado
**Hallazgos:** `POST /api/submissions/{submissionIdDeB}/submit` con la sesión de A devolvió
**404** (no 403): la política RLS de `submissions` ya filtra la fila de B como invisible para
A antes de llegar a la comprobación explícita de `enrollment.student_id` en el route handler,
así que esa rama de "403" nunca se alcanza para este caso (queda como código muerto salvo,
p. ej., que algún día un docente llame este endpoint sobre una submission que sí puede leer
pero no le pertenece). El resultado de aislamiento es el correcto de todas formas: A no puede
leer ni enviar el intento de B.

---

### TC-034 — Modo claro/oscuro, tipografía y accesibilidad del jugador
**Precondición:** El proyecto no tiene toggle manual de tema — el modo oscuro depende
únicamente de `prefers-color-scheme` del sistema operativo/navegador (`ThemeInit.tsx`).
Cambiarlo desde DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme", o
desde la configuración de apariencia del sistema operativo.
**Datos de prueba usados:** `52cd45bd-aea7-4fb5-93ec-4e1948233fbd`, `2fdc3d01-fbfc-4457-9aec-cb1baf38ef84`
**Pasos:**
1. Recorrer en claro y oscuro (cambiando la preferencia del sistema/DevTools, no un toggle en
   la app): listado, jugador y resultados.
2. Navegar el jugador solo con teclado (foco visible, envío accesible).
**Resultado esperado:** Fondos, textos, bordes y bloques de código respetan la paleta de `DESIGN.md`
en ambos modos; tipografía JetBrains Mono consistente; el jugador es operable por teclado con foco y
roles correctos.
**Estado:** ✅ Aprobado
**Hallazgos:** Listado, jugador y resultados se ven correctamente en ambos modos; navegación
completa por teclado hasta el envío, incluido el modal de confirmación. Durante la
investigación surgió una falsa alarma (el tema de Chrome —`chrome://settings/appearance`—
estaba forzado a "Oscuro", independiente del SO; no era un bug de la app). Se registró en
`docs/specs/backlog.md` un hallazgo real pero **fuera de alcance de spec-019**: "saltos
perceptibles" entre modo claro/oscuro en algunos casos — es comportamiento de
`ThemeInit.tsx`/`app/layout.tsx`, compartido por toda la app, no introducido por este spec.

---

## Resumen de la ronda

- **Aprobados: 34 — Fallidos: 0 — Pendientes: 0**
- **Bugs reales encontrados y corregidos durante la ronda:**
  1. `createSubmission` validaba `max_attempts` **antes** de buscar un intento `in_progress`
     para recuperar — bloqueaba cualquier recarga de un intento ya creado cuando
     `max_attempts=1` (TC-006).
  2. Primer acceso a una variante nunca asignada devolvía **404** (~4.5s, sin stack trace) por
     relecturas innecesarias justo después de escribir (allocation + submission); refactorizado
     `.../evaluaciones/[groupId]/page.tsx` para usar los valores ya devueltos por
     `createSubmission` en vez de releerlos (TC-008).
  3. Hover de `multiple_choice` usaba la clase inválida `dark:hover:bg-gray-750` (no existe ese
     tono), iluminando la opción incorrectamente en modo oscuro (TC-012).
  4. `propagateToGradeItem` escribía en `student_grades` con el cliente de **sesión del
     estudiante**; la RLS de esa tabla solo permite escritura al docente, así que la
     propagación de nota fallaba silenciosamente (TC-027) — resuelto con la RPC
     `propagate_submission_grade` (`security definer`, lee `auto_score` de la propia
     submission, no confía en un valor del cliente).
  - Además, dos hallazgos estructurales resueltos **antes** de arrancar la ronda (durante la
    implementación): RLS de `questions`/`question_choices` bloqueaba preguntas en borrador para
    el estudiante (RPCs `get_variant_question_details`/`get_variant_answer_key`), y datos
    legacy pre-variantes en Supabase remoto (`submissions`/`answers` sin rastro de migración,
    limpiados con `DROP ... CASCADE`).
- **Mejora de UX aplicada (pedida por el usuario):** el diálogo de confirmación de envío usaba
  `window.confirm()` nativo; se reemplazó por un modal propio con el estilo de `DESIGN.md`
  (TC-021).
- Hallazgos escalados a `docs/specs/backlog.md`: **DEBT-008** — saltos perceptibles entre modo
  claro/oscuro en algunos casos (comportamiento global de la app, fuera del alcance de
  spec-019).
- Limpieza de datos de prueba: **conservados intencionalmente** (decisión del usuario) — G1–G9,
  sus submissions/answers, las 3 preguntas nuevas y las cuentas D/E quedan como fixture
  reutilizable para futuras rondas (spec-020 necesitará submissions con preguntas abiertas
  pendientes de revisión, como la de G2, ya lista). No se eliminó ningún dato preexistente
  (Santiago, "Estructuras de datos", A/B/C, la cuenta retirada, "Taller 1").
