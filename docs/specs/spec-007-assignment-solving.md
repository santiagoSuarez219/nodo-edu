# spec-007 — Resolución de evaluaciones por el estudiante

> **Estado:** Planificado — pendiente de implementación. La implementación de referencia
> existe en el tag `backup/feat-question-bank` y se portará al implementar este spec.

---

## Contexto

La plataforma ya gestiona el ciclo académico básico (matrículas y calificaciones vía
[spec-003](./spec-003-course-enrollment.md)) y, con [spec-006](./spec-006-assignment-authoring.md),
el docente compone **asignaciones** que toman preguntas del banco (definido en
[spec-005](./spec-005-question-bank.md)) y las vinculan a un curso académico con ventana de
tiempo, configuración de feedback y límite de intentos.

Este spec cubre el otro extremo del flujo: **la resolución de esas asignaciones por el
estudiante matriculado**. Un estudiante activo ve las asignaciones publicadas y dentro de
ventana de sus cursos, abre una y responde pregunta por pregunta. Las respuestas se
persisten de forma incremental (auto-save con debounce de 3 s), de modo que un cierre
accidental de la pestaña no pierde el trabajo. Al enviar (o al vencer el `time_limit`), el
sistema calcula automáticamente el puntaje de las preguntas objetivas (`multiple_choice`),
marca el intento como `submitted` y, si no hay preguntas de revisión manual, lo cierra como
`graded` propagando el resultado a las calificaciones del estudiante.

Las respuestas abiertas (`open_text`, `code_write`, `coding_challenge`) quedan a la espera
de la **revisión manual del docente**, que es responsabilidad de
[spec-008](./spec-008-assignment-review.md); este spec solo crea y persiste esas respuestas
y las columnas que spec-008 consumirá (`answers.manual_score`, `answers.reviewer_notes`,
`answers.reviewed_at`, `submissions.final_score`, `submissions.graded_at`).

El tipo `coding_challenge` se modela en base de datos y se renderiza, pero **no se ejecuta**:
consume el stub `lib/code-runner` (que devuelve `{ status: 'disabled' }`, provisto por
spec-005). La ejecución automatizada de código es una fase futura fuera de este alcance.

---

## Alcance

### Incluye

- **Tablas `submissions` y `answers`** (+ RLS): un intento por `attempt_number` y una fila
  por pregunta respondida dentro del intento.
- **Capa de dominio `lib/submissions/{types,index,actions}.ts`**: creación/recuperación de
  intentos con control de ventana y de `max_attempts`, auto-save de respuestas (upsert),
  cálculo de `auto_score` al enviar y propagación opcional a `student_grades`.
- **Consumo del stub `lib/code-runner`** (de spec-005) para el tipo `coding_challenge`:
  se modela y renderiza, pero la ejecución retorna `disabled`.
- **Rutas del estudiante** bajo `app/cuenta/cursos/[enrollmentId]/asignaciones/`:
  listado, jugador de la asignación y página de resultados.
- **Componentes `components/student/{AssignmentPlayer,QuestionRenderer,SubmissionResult}.tsx`**.
- **API `POST /api/submissions/[submissionId]/submit`**: verifica pertenencia por
  `enrollment`, calcula `auto_score` de preguntas objetivas y propaga a `student_grades`
  cuando la asignación tiene un `grade_item` vinculado y no hay respuestas de revisión manual.
- **Funcionalidad del jugador**: auto-save con debounce de 3 s, countdown con submit
  automático al vencer `time_limit_minutes`, feedback inmediato en `multiple_choice` según
  `show_feedback_on`, y control de `max_attempts` (una fila `submissions` por intento).
- **Aislamiento**: el estudiante solo ve y resuelve asignaciones de cursos donde su
  matrícula está `active` y que están publicadas y dentro de ventana.

### No incluye

- **Revisión y calificación manual del docente** (asignación de `manual_score`,
  `reviewer_notes` y finalización del `final_score`): pertenece a
  [spec-008](./spec-008-assignment-review.md). Aquí solo se crean las columnas y se persisten
  las respuestas abiertas sin calificar.
- **Definición del schema de `assignments` / `assignment_questions`**: pertenece a
  [spec-006](./spec-006-assignment-authoring.md); aquí solo se leen.
- **Definición del schema de `questions` y derivadas** (`question_choices`,
  `question_rubrics`, `coding_challenge_tests`): pertenece a
  [spec-005](./spec-005-question-bank.md); aquí solo se leen a través de la asignación.
- **Ejecución automatizada de código (`coding_challenge`)**: se modela y renderiza, pero no
  se ejecuta (stub `disabled`). Habilitación en fase futura, fuera de este spec.
- **UI de creación/edición de asignaciones o del banco**: fuera de alcance.
- **Notificaciones, recordatorios, reintentos programados o estadísticas por estudiante.**

---

## Dependencias

- **[spec-003](./spec-003-course-enrollment.md) (course-enrollment)** — provee las tablas
  `enrollments` (pertenencia estudiante↔curso, con `status`), `grade_items` y
  `student_grades` (propagación de la nota), el helper `requireUser()` de
  `lib/auth/session.ts` y el dashboard del estudiante en `app/cuenta/`.
- **[spec-006](./spec-006-assignment-authoring.md) (assignment-authoring)** — provee las
  tablas `assignments` y `assignment_questions`, el dominio `lib/assignments/` (incluidas
  `getAssignmentById` y `getActiveAssignmentsByEnrollment`) y la configuración de la
  asignación (`opens_at`/`closes_at`, `time_limit_minutes`, `shuffle_*`, `show_feedback_on`,
  `max_attempts`, vínculo opcional `grade_item_id`) que este spec lee para gobernar la
  resolución.
- **[spec-005](./spec-005-question-bank.md) (question-bank)** — provee las tablas de
  preguntas y el stub `lib/code-runner/index.ts` (`runCode` → `{ status: 'disabled' }`) que
  este spec consume para `coding_challenge`.

> Cadena de dependencias: **spec-003 → spec-005 → spec-006 → spec-007 → spec-008**.
> spec-005/006/007/008 conviven en la rama `feat/question-bank`; la integración a
> `development` se coordina por separado.

---

## Impacto en el sistema

### Base de datos

Dos tablas nuevas en Supabase Postgres, con RLS habilitado. Ver detalle en
"Schema de base de datos". Las tablas de asignaciones y preguntas ya existen (specs 006/005).

| Tabla | Propósito |
|---|---|
| `submissions` | Intento del estudiante en una asignación (una fila por `attempt_number`) |
| `answers` | Respuesta del estudiante a cada pregunta dentro del intento |

Migración de referencia: `supabase/migrations/20260625000007_init_submissions.sql` (crea
ambas tablas). Las políticas RLS de `submissions` y `answers` viven en
`supabase/migrations/20260625000008_rls_questions.sql` (mismo archivo que consolida el RLS
del dominio de evaluaciones).

### Rutas (estudiante)

| Archivo | Propósito |
|---|---|
| `app/cuenta/cursos/[enrollmentId]/asignaciones/page.tsx` | Listado de asignaciones activas de la matrícula, con estado del último intento |
| `app/cuenta/cursos/[enrollmentId]/asignaciones/[assignmentId]/page.tsx` | Abre/recupera el intento `in_progress` y monta el `AssignmentPlayer`; redirige a resultados si ya hay intento cerrado |
| `app/cuenta/cursos/[enrollmentId]/asignaciones/[assignmentId]/resultados/page.tsx` | Muestra el resultado del intento (`SubmissionResult`) |

Todas son Server Components que resuelven la sesión con `requireUser("/login")`, verifican
que `enrollment.student_id === user.id` y que `enrollment.status === "active"` (→ `notFound()`
en caso contrario) antes de leer datos.

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
| `lib/submissions/types.ts` | **Crear** | `Submission`, `Answer`, `SubmissionWithAnswers`, `SubmissionStatus`, y los tipos de revisión (`AnswerForReview`, `SubmissionForReview`) que spec-008 consume |
| `lib/submissions/index.ts` | **Crear** | `createSubmission`, `saveAnswer`, `submitSubmission`, `getSubmissionByStudent`, `getSubmissionsByAssignment` + helper `propagateToGradeItem`. Las funciones de revisión (`getSubmissionForReview`, `gradeAnswer`, `finalizeGrading`) se ubican en este mismo módulo y las consume spec-008 |
| `lib/submissions/actions.ts` | **Crear** | Server Actions envueltas en `requireUser()`: `createSubmissionAction`, `saveAnswerAction` (y las de revisión de spec-008) |

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
> definen en specs 006/005 y aquí solo se referencian.

### Tabla `submissions`

Un intento del estudiante en una asignación (una fila por `attempt_number`).

- `id uuid primary key default gen_random_uuid()`
- `assignment_id uuid not null references assignments(id) on delete restrict`
- `enrollment_id uuid not null references enrollments(id) on delete restrict`
- `attempt_number smallint not null default 1` — con `check (attempt_number >= 1)`.
- `started_at timestamptz not null default now()`
- `submitted_at timestamptz` — null si aún no ha enviado.
- `status text not null default 'in_progress' check (status in ('in_progress','submitted','graded','expired'))`
- `auto_score numeric(5,2)` — calculado al submit (preguntas objetivas).
- `final_score numeric(5,2)` — definitivo, incluye revisión manual (lo escribe spec-008; o el
  propio submit cuando no hay respuestas abiertas).
- `graded_at timestamptz`

Restricción: `unique (assignment_id, enrollment_id, attempt_number)`.
Índices: `(enrollment_id)`, `(assignment_id, status)`.

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
- `manual_score numeric(5,2)` — puntaje del docente en revisión (lo escribe spec-008).
- `reviewer_notes text` — feedback del docente (lo escribe spec-008).
- `reviewed_at timestamptz` — (lo escribe spec-008).

Restricción: `unique (submission_id, question_id)`.
Índice: `(submission_id)`.

### Políticas RLS

- **`submissions`** —
  - `select`: el estudiante ve las suyas (vía `enrollment.student_id = auth.uid()`); el
    docente ve las de sus cursos (vía propiedad del `academic_course` de la asignación).
  - `insert`: solo el propio estudiante, sobre una matrícula suya.
  - `update`: por pertenencia (el estudiante actualiza su intento en progreso; el docente
    en revisión — spec-008).
- **`answers`** — `select`/`insert`/`update` por pertenencia vía la `submission` asociada; el
  docente actualiza `manual_score`/`reviewer_notes` en revisión (spec-008).

---

## Reglas de negocio (dominio)

- **Creación / recuperación de intento (`createSubmission`)**: rechaza si la asignación no
  está publicada, si `opens_at` es futuro o si `closes_at` ya pasó. Cuenta los intentos
  existentes; si `>= max_attempts`, error. Si existe un intento `in_progress`, lo recupera en
  vez de crear uno nuevo (idempotencia); si no, inserta con `attempt_number = usados + 1`.
- **Auto-save (`saveAnswer`)**: upsert sobre `answers` con `onConflict (submission_id,
  question_id)`; persiste `selected_choice_ids` y/o `text_response`. El `AssignmentPlayer`
  agenda un timer por pregunta con debounce de 3 s y lo descarga (flush) al enviar.
- **Envío (`submitSubmission`)**: solo procede si el intento está `in_progress`. Para cada
  respuesta de `multiple_choice` compara el conjunto de `selected_choice_ids` con el conjunto
  de opciones correctas (coincidencia exacta) → `is_correct` y `auto_score = points` o `0`;
  suma y redondea a 2 decimales. Marca la submission como `submitted` con `submitted_at` y
  `auto_score`. Si **no** hay respuestas de tipo `open_text`/`code_write`/`coding_challenge`,
  cierra el intento como `graded` con `final_score = auto_score`, `graded_at`, y propaga a
  `student_grades`. Si las hay, queda `submitted` a la espera de spec-008.
- **Propagación de nota (`propagateToGradeItem`)**: si la asignación tiene `grade_item_id`,
  hace upsert en `student_grades` con `onConflict (enrollment_id, grade_item_id)`.
- **Feedback inmediato**: el `QuestionRenderer`/`SubmissionResult` muestran corrección de
  `multiple_choice` según `show_feedback_on` de la asignación (`submit`/`close`/`never`).
- **Countdown**: si `time_limit_minutes` no es null, el `AssignmentPlayer` cuenta desde
  `started_at + time_limit` y dispara el submit automático al llegar a 0.

---

## Fases de implementación

### Fase 1 — Schema y RLS de `submissions` / `answers`
- [ ] Portar `supabase/migrations/20260625000007_init_submissions.sql` (tablas `submissions`
      y `answers`, con constraints e índices).
- [ ] Portar las políticas RLS de `submissions` y `answers` (en
      `20260625000008_rls_questions.sql`): aislamiento estudiante/docente por
      `enrollment`/curso.
- [ ] `supabase db reset` local sin conflictos; verificar RLS por rol de forma manual.

### Fase 2 — Capa de dominio `lib/submissions/`
- [ ] Crear `lib/submissions/types.ts` (`Submission`, `Answer`, `SubmissionWithAnswers`,
      `SubmissionStatus`; y `AnswerForReview`/`SubmissionForReview` que consume spec-008).
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
- [ ] Ruta listado `.../asignaciones/page.tsx`: valida matrícula activa, lista con
      `getActiveAssignmentsByEnrollment` y el estado del último intento por asignación.
- [ ] Ruta jugador `.../asignaciones/[assignmentId]/page.tsx`: redirige a resultados si ya
      hay intento cerrado; si no, crea/recupera intento `in_progress` y monta el
      `AssignmentPlayer`; maneja el caso "sin intentos disponibles".
- [ ] Ruta resultados `.../asignaciones/[assignmentId]/resultados/page.tsx`: monta
      `SubmissionResult`.
- [ ] `components/student/QuestionRenderer.tsx` (5 tipos, prop `disabled`),
      `AssignmentPlayer.tsx` (auto-save debounce 3 s, `useCountdown` con submit automático,
      header sticky con estado de guardado y tiempo, confirmación de envío) y
      `SubmissionResult.tsx` (puntaje, estado y feedback según `show_feedback_on`).

### Fase 5 — Pulido, accesibilidad y pruebas
- [ ] Tokens semánticos de `DESIGN.md`, JetBrains Mono, modo claro/oscuro; a11y de
      `AssignmentPlayer`/`QuestionRenderer` (foco, roles, teclado).
- [ ] `npm run lint` y `tsc --noEmit` sin errores nuevos.
- [ ] Crear `docs/testing/test-007-assignment-solving.md` y ejecutar los casos manuales de UI.

---

## Criterios de aceptación

- Un estudiante con matrícula `active` ve, en `.../asignaciones`, las asignaciones publicadas
  y dentro de ventana de su curso, con el estado de su último intento.
- Al abrir una asignación se crea (o recupera) un intento `in_progress`; un intento ya cerrado
  redirige a la página de resultados.
- Las respuestas se guardan automáticamente con debounce de 3 s (persisten en `answers` sin
  necesidad de enviar).
- Si la asignación tiene `time_limit_minutes`, el countdown se muestra y **el envío ocurre
  automáticamente** al llegar a 0.
- Al enviar, las preguntas `multiple_choice` se puntúan automáticamente (coincidencia exacta
  de opciones) y el `auto_score` se calcula y persiste.
- El feedback inmediato de `multiple_choice` se muestra según `show_feedback_on`
  (`submit`/`close`/`never`).
- Si la asignación no tiene respuestas de revisión manual, el intento pasa a `graded` y, si
  hay `grade_item_id`, la nota se propaga a `student_grades`; si las tiene, queda `submitted`
  a la espera de la revisión del docente ([spec-008](./spec-008-assignment-review.md)).
- Se respeta `max_attempts`: agotados los intentos, no se crea uno nuevo.
- **Aislamiento**: un estudiante no accede a asignaciones ni intentos de cursos no
  matriculados o de otros estudiantes (`404`/`403` según corresponda); RLS lo garantiza y la
  API `/submit` lo verifica.
- `coding_challenge` se renderiza y se guarda como respuesta abierta, sin ejecución (stub
  `disabled`).
- Lint y typecheck sin errores nuevos; modo claro/oscuro y tipografía consistentes con
  `DESIGN.md`.

---

## Pruebas asociadas

- **Manuales:** `docs/testing/test-007-assignment-solving.md` — casos `TC-*` de los flujos
  con UI del estudiante: listado de asignaciones activas, apertura/recuperación de intento,
  auto-save, countdown con submit automático, cálculo de `auto_score` y feedback inmediato,
  control de `max_attempts`, redirección a resultados y aislamiento entre estudiantes/cursos.
  (El archivo de test lo crea el orquestador, no este spec.)
- **Automáticas (e2e/unit) — fuera de ciclo:** los criterios se automatizarán cuando el
  proyecto adopte un framework de testing (hoy "por definir" en `CLAUDE.md`); su ausencia no
  bloquea el `[DONE]` de este spec.
