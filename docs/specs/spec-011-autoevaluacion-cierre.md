# spec-011 — Autoevaluación formativa de cierre de lección

> **Estado:** `[TESTING]` — implementación completada, pendiente de pruebas manuales.

Este es el **tercero y último** de los tres specs que descomponen la "estructura
interactiva de la lección" prometida en `spec-006-lecciones-privadas-navbar` y
materializada como contenedor `LessonClosure` en spec-009:

- **spec-009 — Progreso de lección** `[DONE]` — creó el contenedor `LessonClosure`
  con el botón "Completar lección".
- **spec-010 — Asistencia por sesión con código** `[DONE]` — insertó la sección
  `AttendanceSection` dentro de `LessonClosure`.
- **spec-011 (este) — Autoevaluación formativa** — inserta la sección
  `SelfAssessmentSection` dentro del mismo contenedor, **sin reescribirlo**.

---

## Contexto

Al terminar una lección, el estudiante matriculado no tiene forma de comprobar
por sí mismo si asimiló los conceptos. El banco de preguntas de **spec-005**
(tabla `questions` + `question_choices`) ya contiene preguntas `multiple_choice`
publicadas asociadas a `course_slug`/`lesson_slug`, pero hoy solo las consume el
docente (a través de `question-bank-mcp`). Ninguna llega al estudiante.

Este spec reutiliza ese banco **en solo lectura** para ofrecer una autoevaluación
**formativa, sin nota**, al final de la lección: el estudiante responde, recibe
feedback inmediato (correcto/incorrecto por opción) y **no se persiste nada**. La
plataforma es apoyo de una clase síncrona; la autoevaluación es una herramienta de
repaso personal, no un instrumento calificable.

La frontera central que anticipó la nota de continuidad de spec-009 —"preguntas
*formativas sin nota* (reusar el banco de spec-005 en solo lectura) vs.
*calificables* (track assignment)"— se resuelve aquí a favor de lo **formativo**:
el track calificable (spec-006/007/008) **no existe** en `development`, y acoplarse
a él quedaría fuera de alcance.

---

## Alcance

### Incluye

- Sección "Autoevaluación" dentro del contenedor existente
  `components/courses/LessonClosure.tsx`, visible **solo** para estudiantes
  matriculados (`access.reason === "enrolled"`).
- Reutilización **en solo lectura** de las preguntas `multiple_choice`
  **publicadas** de la lección (filtro por `course_slug`/`lesson_slug`).
- **Autocorrección server-side** vía Server Action: recibe las opciones
  seleccionadas y devuelve el veredicto; **nunca** envía
  `question_choices.is_correct` al cliente en la carga inicial.
- Feedback **efímero** en el cliente (correcto/incorrecto por opción), sin
  persistencia. Soporte de `multiple_choice` de una respuesta correcta (radios) y
  de varias (checkboxes).

### No incluye

- **Persistencia** de respuestas, intentos o puntajes → **sin BD, sin migración,
  sin tabla**.
- **Nota / calificación**: no toca `student_grades` ni el track calificable
  (spec-006/007/008).
- **Tipos de pregunta** distintos de `multiple_choice` (`open_text`,
  `code_snippet`, `code_write`, `coding_challenge` de la misma lección **se
  ignoran**).
- **Cambios al pipeline MDX** (`lib/mdx/components.tsx` no se toca); no hay
  preguntas embebidas inline en el contenido.
- **Exposición a agentes / MCP** (ver "Evaluación MCP").
- **Endurecer la RLS del banco** para ocultar `is_correct` a estudiantes (afecta a
  spec-005; se documenta como limitación conocida y en `backlog.md`).

---

## Dependencias

- **spec-002 `[DONE]`** — auth, `getCurrentUser`, roles.
- **spec-003 `[DONE]`** — `academic_courses`, `enrollments`.
- **spec-005 `[DONE]`** — banco de preguntas: tablas `questions` /
  `question_choices` con RLS (`20260715000000_init_questions.sql`,
  `20260715000001_rls_questions.sql`), y su modelo `course_slug`/`lesson_slug`.
- **spec-006-lecciones-privadas-navbar `[DONE]`** — `hasCourseAccess` con
  resultado discriminado `reason` y gate en los Server Components de curso.
- **spec-009 `[DONE]`** — contenedor `LessonClosure` y su punto de montaje en
  `[lessonSlug]/page.tsx`.
- **spec-010 `[DONE]`** — patrón de sección componible `AttendanceSection` +
  dominio `lib/attendance/` que este spec imita.

---

## Impacto en el sistema

### Base de datos / RLS

- **Sin migración. Sin cambios de esquema. Sin nuevas políticas.** Verificado en
  `supabase/migrations/20260715000001_rls_questions.sql`: la policy
  `"questions: select own or published"` concede `select` cuando
  `is_published = true` **sin condicionar por rol** (línea 10), y
  `"question_choices: select"` hereda esa condición (línea 55). Un estudiante
  autenticado y matriculado puede, por tanto, leer las preguntas publicadas y sus
  opciones con su **propio cliente de sesión** server-side, respetando RLS y
  mínimo privilegio (no se usa service role). Ver Decisión 1.

### Módulos `lib/` — nuevos

Se crea un dominio propio `lib/self-assessment/`, paralelo a `lib/attendance/`,
para aislar el consumo de solo-lectura del estudiante respecto del CRUD docente de
`lib/questions/`:

- **`lib/self-assessment/types.ts`** — tipo **sanitizado**
  `SelfAssessmentQuestion` (pregunta + opciones **sin** `is_correct`, con
  `allowMultiple`), `SelfAssessmentChoice`, y el veredicto `CheckAnswerResult`.
- **`lib/self-assessment/index.ts`** (`"use server"`, como `lib/attendance/index.ts`):
  - `getSelfAssessmentForLesson(courseSlug, lessonSlug)` → `SelfAssessmentQuestion[]`
    (solo `multiple_choice` publicadas de la lección; opciones sin `is_correct`;
    consumido por el Server Component de la página).
  - `checkSelfAssessmentAnswer(courseSlug, lessonSlug, questionId, selectedChoiceIds)`
    → `CheckAnswerResult` (Server Action de corrección; consumida por el island
    cliente).

### Módulos `lib/` — editados

- **Ninguno.** `lib/questions/{index,types,schemas}.ts` **no se editan**: el nuevo
  lector define su propia consulta y su propio mapeo sanitizado (no reutiliza
  `mapQuestionRow`, que arrastra `is_correct`, `rubric` y `challenge_tests`).
  Ver Decisión 5.

### Rutas / Server Components — editados

- **`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`**: dentro del bloque que ya
  resuelve `access.reason === "enrolled"` (junto a `attendanceState`), invocar
  `getSelfAssessmentForLesson(courseSlug, lessonSlug)` y pasar el resultado a
  `<LessonClosure ... selfAssessment={…} />`.

### Componentes — nuevos / editados

- **`components/courses/SelfAssessmentSection.tsx`** (nuevo, `"use client"`):
  análogo a `AttendanceSection.tsx`. Recibe `courseSlug`, `lessonSlug` y
  `questions: SelfAssessmentQuestion[]`; renderiza cada pregunta con sus opciones
  (radios si `allowMultiple === false`, checkboxes si `true`), usa
  `react-hook-form` + `zod` + `useTransition`, invoca `checkSelfAssessmentAnswer` y
  muestra feedback por opción con tokens semánticos de `DESIGN.md`.
- **`components/courses/LessonClosure.tsx`** (editado): añadir prop opcional
  `selfAssessment?: SelfAssessmentQuestion[]` y montar `<SelfAssessmentSection>`
  cuando esté presente y **no vacío**, junto al bloque de `<AttendanceSection>`.

### Componentes UI

- Radios/checkboxes y botón: Flowbite primero, coherente con los patrones de
  `AttendanceSection`. Iconos de check/cross ya usados en el proyecto. Tokens
  `--color-success` / `--color-danger` / `--color-brand`.

---

## Evaluación MCP

**¿Aplica MCP?** No.

Justificación por criterio (`CLAUDE.md` → "Criterios para evaluar si una
funcionalidad requiere MCP"):

1. **¿Expone datos nuevos que un agente consultaría?** No. La autoevaluación **no
   crea dato persistente**: las respuestas son efímeras (viven solo en el cliente)
   y la corrección ocurre server-side sin escribir en BD. No hay "progreso de
   autoevaluación" que un agente pueda listar o auditar.
2. **¿Permite acciones que un agente ejecutaría?** No. La única acción es
   autocorregir una respuesta `multiple_choice` dentro del flujo de la lección para
   un estudiante; no es una operación que un agente docente dispararía.
3. **¿Existe un MCP relacionado a extender?** `question-bank-mcp` existe pero **no
   requiere cambios**: spec-011 consume el banco en solo lectura y desde el lado
   servidor de la app (no del agente). La asociación pregunta↔lección ya la cura el
   agente con `create_question`/`update_question` (`lesson_slug`); no hay
   herramienta nueva que aportar.
4. **¿Algún agente en `docs/mcps/` se beneficia?** No. El Question Bank Agent sigue
   operando igual; `attendance-mcp` es ajeno.

No se añade fase de MCP. Si en el futuro se decide **persistir** resultados de
autoevaluación (p. ej. seguimiento docente), esa lectura sí sería candidata a MCP y
se evaluará en el spec que introduzca esa persistencia.

---

## Decisiones de arquitectura

### Decisión 1 — Lectura RLS del estudiante, sin migración (Problema A)

Verificado en `20260715000001_rls_questions.sql`: `is_published = true` en las
policies de `select` de `questions` (línea 10) y `question_choices` (línea 55)
**no está condicionado por rol**, así que un estudiante autenticado ya puede
leerlas. Se lee server-side con el **cliente de sesión del propio estudiante**
(`createServerSupabaseClient`), no con service role, para mantenernos dentro de RLS
y mínimo privilegio. No se añade policy. El comentario de la migración
("Estudiantes no tienen acceso directo; reciben preguntas solo via Server Actions")
describe una intención que la policy real **no** impone; no se modifica en este spec
para no alterar el comportamiento de spec-005 (ver Limitación conocida).

### Decisión 2 — Tipo sanitizado: el cliente nunca recibe `is_correct` (Problema B)

Se define `SelfAssessmentQuestion = { id, stem, code_snippet, code_language,
topic_title, allowMultiple, choices: SelfAssessmentChoice[] }` con
`SelfAssessmentChoice = { id, body, order_index }` — **sin** `is_correct`. Defensa
en profundidad: el `select` del lector pide explícitamente
`question_choices(id, body, order_index)`, de modo que `is_correct` **ni siquiera se
trae** de la BD hacia el server para el payload del cliente; el mapeo sanitizado es
la segunda barrera.

### Decisión 3 — Server Action de corrección: firma y ubicación (Problema B)

Ubicación: `lib/self-assessment/index.ts` (`"use server"`), replicando que
`lib/attendance/index.ts` colocaliza lector y acciones. Firma:

```ts
checkSelfAssessmentAnswer(
  courseSlug: string,
  lessonSlug: string,
  questionId: string,
  selectedChoiceIds: string[]
): Promise<CheckAnswerResult>
```

La acción: (a) valida input con `zod`; (b) reverifica `hasCourseAccess(courseSlug)`
y que `reason === "enrolled"` (rechaza si no); (c) confirma que la pregunta es
`multiple_choice`, publicada y pertenece a `courseSlug/lessonSlug`; (d) resuelve
server-side las `question_choices` con `is_correct`; (e) devuelve el veredicto.

```ts
type CheckAnswerResult =
  | { ok: true; correct: boolean; correctChoiceIds: string[]; selectedCorrectIds: string[] }
  | { ok: false; error: string };
```

`correctChoiceIds` se devuelve **solo tras responder** (feedback formativo), nunca
en el lector inicial.

### Decisión 4 — Dominio propio `lib/self-assessment/`, no dentro de `lib/questions/`

`lib/questions/` es CRUD orientado al docente (create/update/publish/delete, con
joins de `rubric` y `challenge_tests`) y su `index.ts` ya ronda las ~377 líneas. Un
módulo propio, en paralelo a `lib/attendance/`, aísla el consumo de solo-lectura del
estudiante, evita acoplar el feature formativo al CRUD, y mantiene el patrón "un
dominio = una carpeta con `index.ts` (`"use server"`) + `types.ts`" que ya sigue
attendance.

### Decisión 5 — No reutilizar `mapQuestionRow` ni `_getQuestionsByActor`

`mapQuestionRow` mapea `choices` **con** `is_correct` y arrastra
`rubric`/`challenge_tests`; `_getQuestionsByActor` ordena por `created_at` y trae
joins innecesarios. El lector define su propio `select` mínimo
(`.eq("type","multiple_choice").eq("is_published", true)` filtrado por
curso/lección, opciones sin `is_correct`, ordenadas por `order_index`) y su propio
mapeo sanitizado.

### Decisión 6 — Lección sin preguntas publicadas → no renderizar la sección

Si `getSelfAssessmentForLesson` devuelve `[]`, la página pasa el array vacío/
`undefined` y `LessonClosure` **no monta** `<SelfAssessmentSection>` (mismo criterio
que `attendance`, que solo se monta si está presente).

### Decisión 7 — Preguntas no-`multiple_choice` de la misma lección → se ignoran

El lector filtra `type = 'multiple_choice'` en la consulta; los demás tipos de la
misma lección simplemente no aparecen. La corrección solo aplica a
`multiple_choice`.

### Decisión 8 — `multiple_choice` de una o varias respuestas correctas

El lector incluye `allowMultiple: boolean`, derivado server-side de cuántas opciones
tienen `is_correct = true`, **sin revelar cuáles**. El cliente usa radios cuando
`allowMultiple === false` y checkboxes cuando es `true`. Enviar solo la categoría
(una vs varias) no filtra la respuesta.

### Decisión 9 — Persistencia efímera, sin `router.refresh()`

A diferencia de `AttendanceSection`, tras corregir **no** se llama
`router.refresh()` (no hay estado server que refrescar): el feedback vive en el
estado local del componente y se pierde al recargar. Sin cookies, sin BD.

### Decisión 10 — Reverificación de matrícula en la acción

Aunque la sección solo se renderiza para `enrolled`, la Server Action es un endpoint
invocable directamente, por lo que revalida `hasCourseAccess` server-side antes de
devolver veredicto (defensa análoga a las acciones de attendance).

---

## Fases de implementación

### Fase 1 — Dominio `lib/self-assessment/` (tipos + lector)

- [ ] Crear `lib/self-assessment/types.ts` con `SelfAssessmentChoice`,
      `SelfAssessmentQuestion` (sin `is_correct`, con `allowMultiple`) y
      `CheckAnswerResult`.
- [ ] Crear `lib/self-assessment/index.ts` (`"use server"`) con
      `getSelfAssessmentForLesson(courseSlug, lessonSlug)`: consulta con el cliente
      de sesión del estudiante, `select` mínimo `question_choices(id, body,
      order_index)`, filtros `type = 'multiple_choice'` + `is_published = true` +
      curso/lección, orden por `order_index`, `allowMultiple` derivado server-side
      **sin** propagar `is_correct` al tipo de salida.

**Verificación:** con la sesión de un estudiante matriculado,
`getSelfAssessmentForLesson` devuelve solo `multiple_choice` publicadas de la
lección y ningún objeto del array expone `is_correct`; una lección sin esas
preguntas devuelve `[]`.

### Fase 2 — Server Action de corrección

- [ ] Añadir `checkSelfAssessmentAnswer(courseSlug, lessonSlug, questionId,
      selectedChoiceIds)` en `lib/self-assessment/index.ts`: validación `zod`,
      reverificación de matrícula (`hasCourseAccess` → `reason === "enrolled"`),
      verificación de que la pregunta es `multiple_choice` publicada de esa lección,
      resolución server-side de correctas y retorno de `CheckAnswerResult`.

**Verificación:** con opciones correctas devuelve `correct: true`; con incorrectas
`correct: false` + `correctChoiceIds`; invocada por un usuario no matriculado o con
`questionId` ajeno a la lección devuelve `{ ok: false }` sin filtrar respuestas.

### Fase 3 — Componente `SelfAssessmentSection`

- [ ] Crear `components/courses/SelfAssessmentSection.tsx` (`"use client"`)
      siguiendo el patrón de `AttendanceSection.tsx`: props `{ courseSlug,
      lessonSlug, questions }`, `react-hook-form` + `zod`, `useTransition`,
      radios/checkboxes según `allowMultiple`, invocación de
      `checkSelfAssessmentAnswer` y feedback por opción con tokens de `DESIGN.md`.
- [ ] Aplicar las skills `frontend-design` / `tailwind-css-patterns` y `DESIGN.md`
      antes de escribir la UI (modo claro/oscuro, JetBrains Mono, a11y).

**Verificación:** en una lección con preguntas, el estudiante selecciona opciones,
envía y ve feedback correcto/incorrecto por opción; el payload inicial no contiene
`is_correct` (verificable en la pestaña Network de DevTools).

### Fase 4 — Integración en página y `LessonClosure`

- [ ] Editar `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`: dentro del bloque
      `access.reason === "enrolled"`, obtener
      `selfAssessment = await getSelfAssessmentForLesson(courseSlug, lessonSlug)` y
      pasarlo a `<LessonClosure ... selfAssessment={selfAssessment} />`.
- [ ] Editar `components/courses/LessonClosure.tsx`: añadir prop opcional
      `selfAssessment?: SelfAssessmentQuestion[]` y montar `<SelfAssessmentSection>`
      cuando esté presente y no vacío, junto al bloque de asistencia.

**Verificación:** un estudiante matriculado ve la sección al final de una lección
con preguntas publicadas; un visitante / no-matriculado / owner / admin no la ve;
una lección sin preguntas no muestra la sección.

### Fase 5 — Verificación final y pruebas

- [ ] `npm run build` y `npm run lint` sin errores.
- [ ] Cambiar el estado del spec a `[TESTING]` y recorrer las pruebas manuales
      `docs/testing/test-011-autoevaluacion-cierre.md`.
- [ ] (Cuando exista framework) invocar `@tester` para las pruebas automáticas.

> Las pruebas manuales (`test-011`) se redactan junto con este spec (test-first).
> El framework e2e está "por definir" en `CLAUDE.md`: las pruebas automáticas se
> describen aquí pero su archivo se crea cuando exista el framework.

---

## Criterios de aceptación

- Un estudiante matriculado (`reason === "enrolled"`) ve la sección
  "Autoevaluación" al final de una lección que tiene preguntas `multiple_choice`
  publicadas.
- Un visitante, un no-matriculado, el owner/admin, o una lección **sin** preguntas
  `multiple_choice` publicadas **no** muestran la sección.
- El estudiante puede seleccionar opciones y, al enviar, recibe feedback inmediato
  (correcto/incorrecto por opción) **sin recargar**.
- El payload que llega al cliente en la carga inicial **no** contiene `is_correct`
  en ninguna opción.
- La corrección se resuelve server-side vía `checkSelfAssessmentAnswer`, que
  reverifica matrícula y que la pregunta pertenece a la lección; un no-matriculado
  o un `questionId` ajeno reciben rechazo sin filtrar la respuesta.
- `multiple_choice` de una respuesta correcta se responde con radios; de varias, con
  checkboxes.
- Las preguntas de tipos distintos de `multiple_choice` de la misma lección se
  ignoran (no se muestran).
- **No se crea ni modifica ninguna fila en BD** como consecuencia de responder
  (persistencia efímera).
- `npm run build` y `npm run lint` pasan sin errores.

---

## Pruebas asociadas

> Estos archivos se crean junto con el spec (enfoque test-first).

- **Manuales:** `docs/testing/test-011-autoevaluacion-cierre.md` — casos `TC-011-*`
  (visibilidad por rol, feedback correcto/incorrecto, radios vs checkboxes, lección
  sin preguntas, ausencia de `is_correct` en el payload de Network). **Sin casos
  `TC-MCP`** (no aplica MCP).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-011-autoevaluacion-cierre.spec.ts`
  — un caso por criterio de aceptación, en rojo, cuando exista framework.

---

## Riesgos y mitigaciones

- **Filtración de la respuesta correcta.** Mitigación en dos capas: el lector no
  trae `is_correct` (select mínimo) y el tipo de salida no lo modela; la corrección
  es server-side. Ver Decisión 2 y 3.
- **Endpoint invocable directamente.** La Server Action reverifica matrícula y
  pertenencia de la pregunta a la lección (Decisión 10).
- **Contenedor extensible.** Se reutiliza `LessonClosure` tal cual, añadiendo una
  prop opcional; no se reescribe (coherente con spec-009/010).
- **Deuda de tokens en componentes vecinos.** Las piezas *nuevas* usan tokens de
  `DESIGN.md`; no se refactoriza lo existente.

### Limitación conocida (fuera de alcance)

La RLS de spec-005 ya permite a **cualquier autenticado** leer
`question_choices.is_correct` de preguntas publicadas (el select de choices hereda
`is_published = true` sin condición de rol). Un estudiante decidido podría consultar
la respuesta directamente contra Supabase con la anon key. Como la autoevaluación es
**formativa y sin nota**, no es un vector relevante (solo se engañaría a sí mismo).
Endurecer esa RLS (ocultar `is_correct` a estudiantes) sería un spec aparte que
también afectaría a spec-005; se registra en `docs/specs/backlog.md` y **no** se
aborda aquí.

---

## Cierre del arco de la lección interactiva

Con spec-011 se completa la "estructura interactiva de la lección" iniciada en
spec-006 y descompuesta en spec-009 (progreso) → spec-010 (asistencia) → spec-011
(autoevaluación). El contenedor `LessonClosure` queda con sus tres secciones
componibles (completar / asistencia / autoevaluación) sin haberse reescrito en
ninguna iteración, validando la Decisión 4 de spec-009 (contenedor extensible).
