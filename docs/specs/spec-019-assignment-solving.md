# spec-019 — Resolución de evaluaciones por el estudiante

> **Estado:** Planificado — pendiente de implementación. La implementación de referencia
> existe en el tag `backup/feat-question-bank` y se portará al implementar este spec.
>
> **Nota de alcance (revisión 2026-07-18):** spec-018 cambió de dirección y este spec se
> actualizó en consecuencia. Una evaluación ya no es una `assignment` suelta, sino un
> **grupo de 3 variantes** (`assignment_variant_groups`) del que a cada estudiante se le
> **sortea una** en su primer acceso. La configuración (ventana, intentos, feedback) vive
> en el grupo; las preguntas viven en la variante. Ver "Modelo de variantes" más abajo.

---

## Contexto

La plataforma ya gestiona el ciclo académico básico (matrículas y calificaciones vía
[spec-003](./spec-003-course-enrollment.md)) y, con [spec-018](./spec-018-assignment-authoring.md),
un agente docente compone —vía MCP— **evaluaciones** formadas por 3 variantes equivalentes,
cada una con preguntas distintas del banco (definido en
[spec-005](./spec-005-question-bank.md)), vinculadas a un curso académico con ventana de
tiempo, configuración de feedback y límite de intentos.

Este spec cubre el otro extremo del flujo: **la resolución de esas evaluaciones por el
estudiante matriculado**. Un estudiante activo ve las evaluaciones publicadas y dentro de
ventana de sus cursos y abre una; el sistema le **sortea una variante** la primera vez y a
partir de ahí siempre resuelve esa misma. Responde pregunta por pregunta y las respuestas se
persisten de forma incremental (auto-save con debounce de 3 s), de modo que un cierre
accidental de la pestaña no pierde el trabajo. Al enviar (o al vencer el `time_limit`), el
sistema calcula automáticamente el puntaje de las preguntas objetivas (`multiple_choice`),
marca el intento como `submitted` y, si no hay preguntas de revisión manual, lo cierra como
`graded` propagando el resultado a las calificaciones del estudiante.

Las respuestas abiertas (`open_text`, `code_write`, `coding_challenge`) quedan a la espera
de la **revisión manual del docente**, que es responsabilidad de
[spec-020](./spec-020-assignment-review.md); este spec solo crea y persiste esas respuestas
y las columnas que spec-020 consumirá (`answers.manual_score`, `answers.reviewer_notes`,
`answers.reviewed_at`, `submissions.final_score`, `submissions.graded_at`).

El tipo `coding_challenge` se modela en base de datos y se renderiza, pero **no se ejecuta**:
consume el stub `lib/code-runner` (que devuelve `{ status: 'disabled' }`, provisto por
spec-005). La ejecución automatizada de código es una fase futura fuera de este alcance.

---

## Modelo de variantes

Tres reglas gobiernan todo lo demás en este spec:

1. **El estudiante navega por evaluación (`groupId`), no por variante.** Las rutas usan el
   `variant_group_id`; qué variante ve es una decisión del servidor, no de la URL.
2. **La variante se resuelve con `getOrAllocateVariant()` (spec-018)** en el primer acceso y
   queda persistida en `assignment_variant_allocations`. Todos los accesos e intentos
   posteriores devuelven la misma. El estudiante nunca la elige ni puede re-sortearla.
3. **`max_attempts` se cuenta contra el grupo, no contra la variante.** Hoy son equivalentes
   (un estudiante tiene una sola variante), pero contarlo por variante dejaría abierta la
   puerta a que cualquier reasignación futura multiplicara los intentos disponibles. Por eso
   `submissions` lleva `variant_group_id` y el `unique` que limita los intentos se define
   sobre él.

La configuración que gobierna la resolución (`opens_at`, `closes_at`, `time_limit_minutes`,
`shuffle_*`, `show_feedback_on`, `max_attempts`, `grade_item_id`) se lee del **grupo**; las
preguntas y sus puntos, de la **variante asignada**.

---

## Alcance

### Incluye

- **Tablas `submissions` y `answers`** (+ RLS): un intento por `attempt_number` y una fila
  por pregunta respondida dentro del intento.
- **Resolución de la variante del estudiante** en las rutas y en el dominio, consumiendo
  `getOrAllocateVariant()` y `getStudentAssignment()` de `lib/assignments/` (spec-018).
- **Capa de dominio `lib/submissions/{types,index,actions}.ts`**: creación/recuperación de
  intentos con control de ventana y de `max_attempts` **por grupo**, auto-save de respuestas
  (upsert), cálculo de `auto_score` al enviar y propagación opcional a `student_grades`.
- **Consumo del stub `lib/code-runner`** (de spec-005) para el tipo `coding_challenge`:
  se modela y renderiza, pero la ejecución retorna `disabled`.
- **Rutas del estudiante** bajo `app/cuenta/cursos/[enrollmentId]/evaluaciones/`:
  listado, jugador de la evaluación y página de resultados, indexadas por `groupId`.
- **Componentes `components/student/{AssignmentPlayer,QuestionRenderer,SubmissionResult}.tsx`**.
- **API `POST /api/submissions/[submissionId]/submit`**: verifica pertenencia por
  `enrollment`, calcula `auto_score` de preguntas objetivas y propaga a `student_grades`
  cuando el grupo tiene un `grade_item` vinculado y no hay respuestas de revisión manual.
- **Funcionalidad del jugador**: auto-save con debounce de 3 s, countdown con submit
  automático al vencer `time_limit_minutes`, feedback inmediato en `multiple_choice` según
  `show_feedback_on`, y control de `max_attempts` (una fila `submissions` por intento).
- **Aislamiento**: el estudiante solo ve y resuelve evaluaciones de cursos donde su
  matrícula está `active` y que están publicadas y dentro de ventana; y dentro de ellas,
  **solo la variante que le fue asignada** — no puede leer las preguntas de las otras dos ni
  saber qué variante le tocó a otro estudiante.

### No incluye

- **Revisión y calificación manual del docente** (asignación de `manual_score`,
  `reviewer_notes` y finalización del `final_score`): pertenece a
  [spec-020](./spec-020-assignment-review.md). Aquí solo se crean las columnas y se persisten
  las respuestas abiertas sin calificar.
- **Definición del schema de `assignment_variant_groups`, `assignments` (variantes),
  `assignment_questions` y `assignment_variant_allocations`**: pertenece a
  [spec-018](./spec-018-assignment-authoring.md); aquí solo se leen.
- **El algoritmo de sorteo balanceado de variantes**: se define e implementa en spec-018
  (`getOrAllocateVariant`); aquí solo se invoca.
- **Reasignación de variante a un estudiante**: no existe, por diseño (permitirla dejaría al
  estudiante re-sortear hasta obtener la variante que prefiera).
- **Definición del schema de `questions` y derivadas** (`question_choices`,
  `question_rubrics`, `coding_challenge_tests`): pertenece a
  [spec-005](./spec-005-question-bank.md); aquí solo se leen a través de la variante.
- **Ejecución automatizada de código (`coding_challenge`)**: se modela y renderiza, pero no
  se ejecuta (stub `disabled`). Habilitación en fase futura, fuera de este spec.
- **UI de creación/edición de evaluaciones o del banco**: fuera de alcance (y en spec-018 la
  autoría no tiene UI: es vía MCP).
- **Notificaciones, recordatorios, reintentos programados o estadísticas por estudiante.**

---

## Dependencias

- **[spec-003](./spec-003-course-enrollment.md) (course-enrollment)** — provee las tablas
  `enrollments` (pertenencia estudiante↔curso, con `status`), `grade_items` y
  `student_grades` (propagación de la nota), el helper `requireUser()` de
  `lib/auth/session.ts` y el dashboard del estudiante en `app/cuenta/`.
- **[spec-018](./spec-018-assignment-authoring.md) (assignment-authoring)** — provee las
  tablas `assignment_variant_groups`, `assignments` (variantes), `assignment_questions` y
  `assignment_variant_allocations`; el dominio `lib/assignments/` con
  `getActiveAssignmentsByEnrollment()` (devuelve `StudentAssignment[]`: config del grupo +
  variante ya resuelta), `getStudentAssignment()` y **`getOrAllocateVariant()`** (sorteo
  balanceado y persistido); y la configuración compartida del grupo (`opens_at`/`closes_at`,
  `time_limit_minutes`, `shuffle_*`, `show_feedback_on`, `max_attempts`, vínculo opcional
  `grade_item_id`) que este spec lee para gobernar la resolución.
- **[spec-005](./spec-005-question-bank.md) (question-bank)** — provee las tablas de
  preguntas y el stub `lib/code-runner/index.ts` (`runCode` → `{ status: 'disabled' }`) que
  este spec consume para `coding_challenge`.

> Cadena de dependencias: **spec-003 → spec-005 → spec-018 → spec-019 → spec-020**.
> spec-005/006/007/008 conviven en la rama `feat/question-bank`; la integración a
> `development` se coordina por separado.

---

## Impacto en el sistema

### Base de datos

Dos tablas nuevas en Supabase Postgres, con RLS habilitado. Ver detalle en
"Schema de base de datos". Las tablas de evaluaciones/variantes (spec-018) y de preguntas
(spec-005) ya existen y aquí solo se leen.

| Tabla | Propósito |
|---|---|
| `submissions` | Intento del estudiante sobre **su variante** de una evaluación (una fila por `attempt_number`) |
| `answers` | Respuesta del estudiante a cada pregunta dentro del intento |

> La implementación de referencia del backup
> (`20260625000007_init_submissions.sql`) **no incluye `variant_group_id`**: al portarla hay
> que añadir la columna y mover el `unique` de intentos del `assignment_id` al
> `variant_group_id`.

### Rutas (estudiante)

| Archivo | Propósito |
|---|---|
| `app/cuenta/cursos/[enrollmentId]/evaluaciones/page.tsx` | Listado de evaluaciones activas de la matrícula, con estado del último intento |
| `app/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/page.tsx` | Resuelve la variante con `getOrAllocateVariant()`, abre/recupera el intento `in_progress` y monta el `AssignmentPlayer`; redirige a resultados si ya hay intento cerrado |
| `app/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]/resultados/page.tsx` | Muestra el resultado del intento (`SubmissionResult`) |

Todas son Server Components que resuelven la sesión con `requireUser("/login")`, verifican
que `enrollment.student_id === user.id` y que `enrollment.status === "active"` (→ `notFound()`
en caso contrario) antes de leer datos.

> El segmento dinámico es el **`groupId`**, no el id de la variante. Exponer la variante en
> la URL permitiría a un estudiante intentar cargar las otras dos; con `groupId` la variante
> nunca es un parámetro que el cliente controle.

### API

| Archivo | Método | Propósito |
|---|---|---|
| `app/api/submissions/[submissionId]/submit/route.ts` | `POST` | Verifica pertenencia por `enrollment.student_id`, calcula `auto_score` y propaga a `student_grades` |

Verifica sesión (`401` si no hay usuario), que la submission existe (`404`) y que pertenece
al estudiante autenticado vía `enrollment.student_id` (`403` en otro caso). Delega el cálculo
a `submitSubmission`; error de dominio → `400`.

### Módulos `lib/`

| Archivo | Acción | Detalle |
|---|---|---|
| `lib/submissions/types.ts` | **Crear** | `Submission`, `Answer`, `SubmissionWithAnswers`, `SubmissionStatus`, y los tipos de revisión (`AnswerForReview`, `SubmissionForReview`) que spec-020 consume |
| `lib/submissions/index.ts` | **Crear** | `createSubmission`, `saveAnswer`, `submitSubmission`, `getSubmissionByStudent`, `getSubmissionsByAssignment` + helper `propagateToGradeItem`. Las funciones de revisión (`getSubmissionForReview`, `gradeAnswer`, `finalizeGrading`) se ubican en este mismo módulo y las consume spec-020 |
| `lib/submissions/actions.ts` | **Crear** | Server Actions envueltas en `requireUser()`: `createSubmissionAction`, `saveAnswerAction` (y las de revisión de spec-020) |

> `submitSubmission` usa el cliente de servidor por sesión (`createServerSupabaseClient`); RLS
> es la línea de defensa. La API `/submit` verifica además la pertenencia por `enrollment`
> antes de invocarla.

### Componentes (`components/student/`)

| Componente | Rol |
|---|---|
| `AssignmentPlayer.tsx` | Client Component: orquesta el intento — auto-save con debounce 3 s (un timer por pregunta), countdown (`useCountdown`) con submit automático al llegar a 0, header sticky con estado de guardado y tiempo restante (resaltado <60 s), botón "Enviar respuestas" con confirmación |
| `QuestionRenderer.tsx` | Renderiza cada pregunta según `type` (`multiple_choice`, `open_text`, `code_snippet`, `code_write`, `coding_challenge`); admite `disabled` para modo lectura/feedback |
| `SubmissionResult.tsx` | Vista de resultados del intento cerrado (puntaje, estado, feedback por pregunta) |

### Variables de entorno

Ninguna nueva. Reutiliza la configuración de Supabase existente.

---

## Schema de base de datos

> Las tablas de este spec. `assignments`, `assignment_questions`, `questions` y derivadas se
> definen en spec-018/spec-005 y aquí solo se referencian.

### Tabla `submissions`

Un intento del estudiante sobre su variante de una evaluación (una fila por `attempt_number`).

- `id uuid primary key default gen_random_uuid()`
- `assignment_id uuid not null references assignments(id) on delete restrict` — la
  **variante** que el estudiante resolvió. Se conserva para saber exactamente qué preguntas
  se le presentaron.
- `variant_group_id uuid not null references assignment_variant_groups(id) on delete restrict`
  — la evaluación. Redundante respecto de `assignments.variant_group_id`, pero necesaria para
  que el `unique` de intentos se pueda enforcar en DB (ver "Modelo de variantes").
- `enrollment_id uuid not null references enrollments(id) on delete restrict`
- `attempt_number smallint not null default 1` — con `check (attempt_number >= 1)`.
- `started_at timestamptz not null default now()`
- `submitted_at timestamptz` — null si aún no ha enviado.
- `status text not null default 'in_progress' check (status in ('in_progress','submitted','graded','expired'))`
- `auto_score numeric(5,2)` — calculado al submit (preguntas objetivas).
- `final_score numeric(5,2)` — definitivo, incluye revisión manual (lo escribe spec-020; o el
  propio submit cuando no hay respuestas abiertas).
- `graded_at timestamptz`

Restricción: `unique (variant_group_id, enrollment_id, attempt_number)` — **sobre el grupo**,
no sobre la variante: así los intentos se limitan por evaluación aunque la variante cambiara.
Índices: `(enrollment_id)`, `(variant_group_id, status)`, `(assignment_id)`.

### Tabla `answers`

Respuesta a una pregunta dentro de un intento (existe desde el inicio por el auto-save).

- `id uuid primary key default gen_random_uuid()`
- `submission_id uuid not null references submissions(id) on delete cascade`
- `question_id uuid not null references questions(id) on delete restrict`
- `assignment_question_id uuid not null references assignment_questions(id) on delete restrict`
- `selected_choice_ids uuid[] not null default '{}'` — para `multiple_choice`.
- `text_response text` — para `open_text`, `code_write` y `coding_challenge`.
- `is_correct boolean` — calculado para `multiple_choice` al submit; null mientras espera revisión.
- `auto_score numeric(5,2)` — puntaje automático.
- `manual_score numeric(5,2)` — puntaje del docente en revisión (lo escribe spec-020).
- `reviewer_notes text` — feedback del docente (lo escribe spec-020).
- `reviewed_at timestamptz` — (lo escribe spec-020).

Restricción: `unique (submission_id, question_id)`.
Índice: `(submission_id)`.

### Políticas RLS

- **`submissions`** —
  - `select`: el estudiante ve las suyas (vía `enrollment.student_id = auth.uid()`); el
    docente ve las de sus cursos (vía propiedad del `academic_course` del **grupo**).
  - `insert`: solo el propio estudiante, sobre una matrícula suya, **y solo si el
    `assignment_id` coincide con la variante que tiene asignada** en
    `assignment_variant_allocations`. Sin esta condición un estudiante podría abrir un
    intento sobre una variante ajena y leer sus preguntas a través de la submission.
  - `update`: por pertenencia (el estudiante actualiza su intento en progreso; el docente
    en revisión — spec-020).
- **`answers`** — `select`/`insert`/`update` por pertenencia vía la `submission` asociada; el
  docente actualiza `manual_score`/`reviewer_notes` en revisión (spec-020).

---

## Reglas de negocio (dominio)

- **Resolución de variante (previo a todo)**: la ruta del jugador llama a
  `getOrAllocateVariant(enrollmentId, groupId)` (spec-018). Devuelve la variante ya asignada
  o sortea una si es el primer acceso. Todo lo demás opera sobre esa variante.
- **Creación / recuperación de intento (`createSubmission`)**: rechaza si el **grupo** no
  está publicado, si `opens_at` es futuro o si `closes_at` ya pasó. Cuenta los intentos
  existentes **del grupo** (`variant_group_id` + `enrollment_id`); si `>= max_attempts`,
  error. Si existe un intento `in_progress`, lo recupera en vez de crear uno nuevo
  (idempotencia); si no, inserta con `attempt_number = usados + 1`, `assignment_id` = la
  variante asignada y `variant_group_id` = el grupo.
- **Auto-save (`saveAnswer`)**: upsert sobre `answers` con `onConflict (submission_id,
  question_id)`; persiste `selected_choice_ids` y/o `text_response`. El `AssignmentPlayer`
  agenda un timer por pregunta con debounce de 3 s y lo descarga (flush) al enviar.
- **Envío (`submitSubmission`)**: solo procede si el intento está `in_progress`. Para cada
  respuesta de `multiple_choice` compara el conjunto de `selected_choice_ids` con el conjunto
  de opciones correctas (coincidencia exacta) → `is_correct` y `auto_score = points` o `0`;
  suma y redondea a 2 decimales. Marca la submission como `submitted` con `submitted_at` y
  `auto_score`. Si **no** hay respuestas de tipo `open_text`/`code_write`/`coding_challenge`,
  cierra el intento como `graded` con `final_score = auto_score`, `graded_at`, y propaga a
  `student_grades`. Si las hay, queda `submitted` a la espera de spec-020.
- **Propagación de nota (`propagateToGradeItem`)**: si el **grupo** tiene `grade_item_id`,
  hace upsert en `student_grades` con `onConflict (enrollment_id, grade_item_id)`. Como
  spec-018 exige que las 3 variantes sumen el mismo puntaje total, las notas de estudiantes
  con variantes distintas son comparables sin normalización.
- **Feedback inmediato**: el `QuestionRenderer`/`SubmissionResult` muestran corrección de
  `multiple_choice` según `show_feedback_on` **del grupo** (`submit`/`close`/`never`).
- **Countdown**: si `time_limit_minutes` no es null, el `AssignmentPlayer` cuenta desde
  `started_at + time_limit` y dispara el submit automático al llegar a 0.

---

## Fases de implementación

### Fase 1 — Schema y RLS de `submissions` / `answers`
- [ ] Migración de las tablas `submissions` y `answers` con constraints e índices, incluida
      la columna `variant_group_id` y el `unique (variant_group_id, enrollment_id,
      attempt_number)`.
- [ ] Políticas RLS de `submissions` y `answers`: aislamiento estudiante/docente por
      `enrollment`/curso, más la condición de `insert` que ata el `assignment_id` a la
      variante asignada en `assignment_variant_allocations`.
- [ ] Verificar RLS por rol de forma manual, incluido el intento de abrir una submission
      sobre una variante no asignada.

### Fase 2 — Capa de dominio `lib/submissions/`
- [ ] Crear `lib/submissions/types.ts` (`Submission`, `Answer`, `SubmissionWithAnswers`,
      `SubmissionStatus`; y `AnswerForReview`/`SubmissionForReview` que consume spec-020).
- [ ] Crear `lib/submissions/index.ts`: `createSubmission` (ventana + `max_attempts` +
      recuperación de intento en progreso), `saveAnswer` (upsert), `submitSubmission`
      (cálculo de `auto_score`, cierre condicional a `graded`, propagación), lecturas
      `getSubmissionByStudent`/`getSubmissionsByAssignment` y el helper
      `propagateToGradeItem`. Consumir el stub `lib/code-runner` para `coding_challenge`.
- [ ] Crear `lib/submissions/actions.ts`: `createSubmissionAction`, `saveAnswerAction`
      envueltas en `requireUser()`.

### Fase 3 — API de envío
- [ ] Crear `app/api/submissions/[submissionId]/submit/route.ts` (`POST`): `401` sin sesión,
      `404` si no existe, `403` si la submission no es del estudiante autenticado (vía
      `enrollment.student_id`), delega a `submitSubmission` y responde `auto_score`; error de
      dominio → `400`.

### Fase 4 — Rutas y componentes del estudiante
- [ ] Ruta listado `.../evaluaciones/page.tsx`: valida matrícula activa, lista con
      `getActiveAssignmentsByEnrollment` y el estado del último intento por evaluación.
- [ ] Ruta jugador `.../evaluaciones/[groupId]/page.tsx`: resuelve la variante con
      `getOrAllocateVariant()`; redirige a resultados si ya hay intento cerrado; si no,
      crea/recupera intento `in_progress` y monta el `AssignmentPlayer`; maneja el caso
      "sin intentos disponibles".
- [ ] Ruta resultados `.../evaluaciones/[groupId]/resultados/page.tsx`: monta
      `SubmissionResult`.
- [ ] `components/student/QuestionRenderer.tsx` (5 tipos, prop `disabled`),
      `AssignmentPlayer.tsx` (auto-save debounce 3 s, `useCountdown` con submit automático,
      header sticky con estado de guardado y tiempo, confirmación de envío) y
      `SubmissionResult.tsx` (puntaje, estado y feedback según `show_feedback_on`).

### Fase 5 — Pulido, accesibilidad y pruebas
- [ ] Tokens semánticos de `DESIGN.md`, JetBrains Mono, modo claro/oscuro; a11y de
      `AssignmentPlayer`/`QuestionRenderer` (foco, roles, teclado).
- [ ] `npm run lint` y `tsc --noEmit` sin errores nuevos.
- [ ] Crear `docs/testing/test-019-assignment-solving.md` y ejecutar los casos manuales de UI.

---

## Criterios de aceptación

- Un estudiante con matrícula `active` ve, en `.../evaluaciones`, las evaluaciones publicadas
  y dentro de ventana de su curso, con el estado de su último intento.
- **Al abrir una evaluación por primera vez se le asigna una variante**, que queda persistida;
  todos los accesos e intentos posteriores le muestran **la misma variante**.
- Un estudiante **no puede acceder a las variantes que no le tocaron** ni averiguar la
  variante de otro estudiante.
- Al abrir una evaluación se crea (o recupera) un intento `in_progress` sobre su variante; un
  intento ya cerrado redirige a la página de resultados.
- Las respuestas se guardan automáticamente con debounce de 3 s (persisten en `answers` sin
  necesidad de enviar).
- Si el grupo tiene `time_limit_minutes`, el countdown se muestra y **el envío ocurre
  automáticamente** al llegar a 0.
- Al enviar, las preguntas `multiple_choice` se puntúan automáticamente (coincidencia exacta
  de opciones) y el `auto_score` se calcula y persiste.
- El feedback inmediato de `multiple_choice` se muestra según `show_feedback_on`
  (`submit`/`close`/`never`).
- Si el intento no tiene respuestas de revisión manual, pasa a `graded` y, si el grupo tiene
  `grade_item_id`, la nota se propaga a `student_grades`; si las tiene, queda `submitted`
  a la espera de la revisión del docente ([spec-020](./spec-020-assignment-review.md)).
- Se respeta `max_attempts` **contado por evaluación** (no por variante): agotados los
  intentos, no se crea uno nuevo.
- **Aislamiento**: un estudiante no accede a evaluaciones ni intentos de cursos no
  matriculados o de otros estudiantes (`404`/`403` según corresponda); RLS lo garantiza y la
  API `/submit` lo verifica.
- `coding_challenge` se renderiza y se guarda como respuesta abierta, sin ejecución (stub
  `disabled`).
- Lint y typecheck sin errores nuevos; modo claro/oscuro y tipografía consistentes con
  `DESIGN.md`.

---

## Pruebas asociadas

- **Manuales:** `docs/testing/test-019-assignment-solving.md` — casos `TC-*` de los flujos
  con UI del estudiante: listado de evaluaciones activas, asignación de variante en el primer
  acceso y su estabilidad entre accesos e intentos, apertura/recuperación de intento,
  auto-save, countdown con submit automático, cálculo de `auto_score` y feedback inmediato,
  control de `max_attempts` por evaluación, redirección a resultados y aislamiento entre
  estudiantes/cursos **y entre variantes**.
  > Ese archivo debe **actualizarse** con los casos de variantes al implementar este spec:
  > su versión actual asume una asignación única sin variantes.
- **Automáticas (e2e/unit) — fuera de ciclo:** los criterios se automatizarán cuando el
  proyecto adopte un framework de testing (hoy "por definir" en `CLAUDE.md`); su ausencia no
  bloquea el `[DONE]` de este spec.
