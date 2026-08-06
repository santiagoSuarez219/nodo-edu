# spec-042 — [NOT STARTED] Banco de preguntas: desacople pregunta↔lección y catálogo de keywords

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

El banco de preguntas (**spec-005**) modela la relación pregunta↔lección como dos
columnas de texto libre en la propia pregunta: `questions.course_slug` y
`questions.lesson_slug` (`supabase/migrations/20260715000000_init_questions.sql:5-6`,
nullable; `.optional()` en `lib/questions/schemas.ts:4-5`). Ese diseño tiene tres
consecuencias que hoy duelen:

1. **Una pregunta pertenece a lo sumo a una lección.** No hay forma de reutilizar
   una pregunta en la lección de repaso, en el quiz de corte y en el laboratorio
   sin duplicarla. Duplicarla rompe la trazabilidad (dos ids para la misma
   pregunta) y multiplica el mantenimiento.
2. **El vínculo es una referencia débil sin FK ni validación.** Un slug mal
   escrito no falla: deja la pregunta huérfana e invisible para siempre. La
   propia `.claude/skills/lesson-authoring/SKILL.md` (~447-456) lo documenta como
   trampa conocida y le pide al agente "nunca inventar slugs".
3. **`questions.tags text[]` es vocabulario abierto sin catálogo ni índice.** Cada
   agente inventa su propia etiqueta (`recursion`, `recursión`, `recursividad`),
   así que `tags` no sirve ni para filtrar con confianza ni para razonar sobre
   cobertura curricular.

Al mismo tiempo, el proyecto necesita una dimensión que hoy no existe: poder decir
"estas preguntas cubren *lógica*", "estas son de *Python*", "estas corresponden al
*momento de cierre*", de forma consultable y consistente. Ese es el rol de un
**catálogo de keywords con vocabulario controlado**.

Este spec resuelve ambas cosas: extrae la relación pregunta↔lección a una tabla
puente propia (`lesson_questions`) y sustituye `tags` por un catálogo (`keywords`)
con su tabla puente (`question_keywords`), donde **no se pueden inventar términos
al vuelo**.

**El único punto de escritura del banco es la API `/api/questions/*` +
`question-bank-mcp`**: no existe UI de creación/edición de preguntas, y eso es
decisión de producto de spec-005 (líneas 26-30, 79-81), no una omisión. Este spec
no la revierte.

### Restricción crítica — esto toca notas

Desde **spec-040** la autoevaluación de cierre **es una nota**:
`self_assessment_breakdown` cuenta preguntas publicadas por
`course_slug`/`lesson_slug` y alimenta `apply_self_assessment_grade`, que escribe
en `student_grades`. La autoevaluación es el **único consumidor** de esos slugs en
toda la app (`lib/self-assessment/index.ts:53-70, 124-140, 209-217, 273-281,
376-391, 449-450` + el RPC de `20260802000004_self_assessment_grade_rpcs.sql:28-38`).
Los assignments referencian por `question_id`
(`20260724000002_variant_question_content_rpcs.sql:101,133`;
`20260724000004_submission_review_context_rpc.sql:74`) y son **inmunes**.

Un backfill incompleto no rompe la app de forma visible: **corrompe notas en
silencio**, y en la dirección peligrosa — menos preguntas montadas ⇒ menor
denominador ⇒ **nota inflada** para el estudiante que no respondió. De ahí que la
verificación de paridad sea una fase con nombre propio (Fase 2) y no un checkbox
al final.

---

## Alcance

### Incluye

- Tabla puente **`lesson_questions`** (`course_slug`, `lesson_slug`, `question_id`,
  `order_index`): una pregunta se "monta" en 0..N lecciones.
- Catálogo **`keywords`** (vocabulario controlado, con faceta `kind` cerrada) y
  puente **`question_keywords`**. Crear una relación con una keyword inexistente
  **falla con error explícito**; no se autocrea.
- **Orden explícito** de las preguntas dentro de una lección (`order_index`), hoy
  inexistente: la autoevaluación ordena por `questions.created_at`.
- **Backfill idempotente** de los datos reales de producción desde
  `questions.course_slug/lesson_slug` → `lesson_questions`, y desde
  `questions.tags` → `keywords` + `question_keywords`.
- **Reescritura de los 7 puntos de lectura de la autoevaluación** y del RPC
  `self_assessment_breakdown` para resolver vía `lesson_questions`, con
  verificación de paridad de notas antes y después.
- **API nueva**: `/api/keywords/*` (catálogo) y endpoints de montaje / desmontaje /
  reordenamiento de preguntas en lecciones.
- **Cambio de contrato** de `POST`/`PATCH /api/questions/*` y de los filtros de
  `GET /api/questions`.
- Actualización de `question-bank-mcp` (6 herramientas nuevas + 3 modificadas), su
  system prompt y `.claude/skills/lesson-authoring/SKILL.md`.

### No incluye

- **Lecciones MDX, guías de laboratorio y assignments.** El diseño deja `keywords`
  extensible a esos dominios (una tabla puente análoga por dominio), pero aquí
  **solo se implementa `question_keywords`**. No se crean `lesson_keywords` ni
  `assignment_keywords`.
- **UI de administración** del catálogo de keywords ni del montaje de preguntas.
  Se opera vía API + MCP, coherente con spec-005.
- **`DROP COLUMN` de `questions.course_slug`, `lesson_slug` y `tags`.** Ver D1:
  este spec deja de escribirlas y de leerlas, pero no las elimina físicamente.
- **FK real de `lesson_questions` hacia el catálogo de lecciones.** El catálogo de
  lecciones vive en git (`lib/courses/data/*.ts`), no en Postgres; la referencia
  sigue siendo débil por texto, igual que `disabled_lessons`
  (`20260801000000_init_disabled_lessons.sql`). Validar el slug contra el catálogo
  es responsabilidad de la capa API.
- Resolver el `BLOQUE 039` comentado dentro de `self_assessment_breakdown`
  (DEBT-045). Se preserva **tal cual** al reescribir la función.
- Migrar `topic_title` a keywords. Sigue siendo texto libre; queda como deuda.

---

## Impacto en el sistema

### Base de datos

| Tabla | Acción | Detalle |
|---|---|---|
| `lesson_questions` | **Crear** | PK `(course_slug, lesson_slug, question_id)`; `order_index int not null default 0`; `created_at`; `created_by uuid null`. FK `question_id → questions(id) on delete cascade`. |
| `keywords` | **Crear** | PK `slug text`; `label text not null`; `description text`; `kind text null` con `check` cerrado (D3); `created_at`. |
| `question_keywords` | **Crear** | PK `(question_id, keyword_slug)`; FK a `questions` (`on delete cascade`) y a `keywords` (`on delete restrict`). |
| `questions` | **Deprecar columnas** | `course_slug`, `lesson_slug`, `tags` dejan de escribirse y de leerse. No se eliminan (D1). |
| `self_assessment_attempts` | **Sin cambios** | Sus `course_slug`/`lesson_slug` describen la **lección**, no la pregunta. |
| `assignments` / `assignment_questions` | **Sin cambios** | Referencian por `question_id`. |

### Funciones / RPC

| Objeto | Acción | Detalle |
|---|---|---|
| `self_assessment_breakdown` | **`create or replace`** | Única pieza a cambiar: la subconsulta de conteo (`20260802000004:31-38`) pasa a resolver por `lesson_questions`. Firma y tipo de retorno **idénticos**. |
| `apply_self_assessment_grade` | **No se toca** | Consume `self_assessment_breakdown` por firma; el cambio le es transparente. |
| `recalculate_self_assessment_grade` / `recalculate_course_self_assessment_grades` | **No se tocan** | Ídem. |

### Módulos `lib/`

| Archivo | Acción | Detalle |
|---|---|---|
| `lib/keywords/{types,schemas,index,service}.ts` | **Crear** | Dominio del catálogo, espejo estructural de `lib/questions/*` (contexto `{ supabase, actorId }` + wrappers de servicio). |
| `lib/questions/types.ts` | **Editar** | `Question`: quitar `course_slug`/`lesson_slug`/`tags` del tipo público. `QuestionWithDetails`: añadir `keywords: string[]` y `lessons: LessonMount[]`. `QuestionInput`: `keywords?: string[]`, sin slugs. |
| `lib/questions/schemas.ts` | **Editar** | `QuestionBaseSchema` (3-15): sin slugs ni `tags`, con `keywords`. `ListQuestionsFiltersSchema` (110-120): `tag` → `keyword`; `course_slug`/`lesson_slug` se mantienen como filtros pero cambian de implementación. Nuevos schemas de montaje. |
| `lib/questions/index.ts` | **Editar** | `_getQuestionsByActor` (12-72): filtros de curso/lección vía `lesson_questions`, filtro `keyword` vía `question_keywords`. `_createQuestionForActor` (98-135) y `_updateQuestionForActor` (137-195): escribir `question_keywords` validando contra el catálogo. `mapQuestionRow` (349-376): exponer `keywords`/`lessons`. Funciones nuevas de montaje. |
| `lib/questions/service.ts` | **Editar** | Wrappers de servicio para las funciones nuevas, mismo patrón que las 6 existentes. |
| `lib/self-assessment/index.ts` | **Editar (crítico)** | 7 puntos de cambio enumerados abajo. |
| `lib/progress/index.ts:118` | **No editar** | Consume `getSelfAssessmentStatus` por firma; debe seguir funcionando sin cambios. Es el gate de completar lección. |

### Puntos de cambio exactos en la autoevaluación

| # | Ubicación | Cambio | Riesgo |
|---|---|---|---|
| 1 | `lib/self-assessment/index.ts:52-69` `getSelfAssessmentForLesson` | Query parte de `lesson_questions` con embed `questions!inner(...)`, filtrando `type='multiple_choice'` e `is_published`. `.order('order_index')` es nativo. | Medio |
| 2 | `:73-98` (mapeo) | La fila cambia de forma (`row.questions` anidado). **`seededShuffle` de las opciones se conserva intacto** (spec-034) y el `.order('order_index', { referencedTable: 'question_choices' })` sigue siendo obligatorio para fijar la entrada del barajado. | Medio |
| 3 | `:123-140` + `:144-165` `getAnswerKeyForLesson` | Mismo cambio de query y mapeo; **sin** barajar (spec-034 Fase 1). El gate de rol (`:116-118`) no se toca. | Bajo |
| 4 | `:208-216` `checkSelfAssessmentAnswer` | "La pregunta pertenece a esta lección" pasa de dos `.eq()` sobre `questions` a un `exists` sobre `lesson_questions` + inner join a `questions` por `type`/`is_published`. | Medio |
| 5 | `:273-281` `getSelfAssessmentStatus` | `questionCount` pasa a contar filas de `lesson_questions` con inner join. **Mantener el fail-closed de spec-037/D8** (`:323-329`): si la query falla, `status: 'unavailable'`, nunca `requiresAttempt: false`. | **Alto** — alimenta el gate de completar lección |
| 6 | `:376-391` `submitSelfAssessment` | Debe devolver **exactamente el mismo conjunto** que el punto 1: si difiere, `Object.keys(answers).length !== questionCount` (`:394`) devuelve `incomplete` y el estudiante no puede enviar. Su `questionCount` es lo que se congela en `self_assessment_attempts.question_count` (`:449-450`, D6 de spec-040). | **Alto** — congela el denominador de la nota |
| 7 | `:534-551` + `:574-582` `getAttemptReview` | Hoy ordena en TS por `questions.created_at`. Pasa a ordenar por el `order_index` del montaje, **con fallback a `created_at` para preguntas ya desmontadas** de esa lección. Requiere resolver un mapa `question_id → order_index` en una consulta adicional. | Medio |
| 8 | `supabase/migrations/20260802000004_self_assessment_grade_rpcs.sql:28-38` | La subconsulta de conteo pasa a `join lesson_questions lq on lq.question_id = q.id and lq.course_slug = lp.course_slug and lq.lesson_slug = lp.lesson_slug`. Se aplica con **`create or replace` en una migración nueva**; nunca se edita la migración ya aplicada. Preservar el `BLOQUE 039` comentado (`:48-56`) literalmente. | **Crítico** — denominador de la nota |

### Rutas (API)

| Archivo | Métodos | Propósito |
|---|---|---|
| `app/api/keywords/route.ts` | `GET`, `POST` | Listar catálogo (filtros `q`, `kind`, `limit`/`offset`) y crear término. |
| `app/api/keywords/[slug]/route.ts` | `GET`, `PATCH`, `DELETE` | Leer, editar `label`/`description`/`kind`, eliminar (`409` si está en uso). |
| `app/api/questions/[questionId]/lessons/route.ts` | `GET`, `POST`, `DELETE` | Listar montajes de una pregunta; montarla en una lección (idempotente); desmontarla (`?course_slug=&lesson_slug=`). |
| `app/api/lessons/[courseSlug]/[lessonSlug]/questions/route.ts` | `GET`, `PUT` | Listar preguntas montadas en orden; **reordenar** el montaje (D6: solo reordena). |
| `app/api/questions/route.ts` | **Editar** | `POST`: rechaza `course_slug`/`lesson_slug`/`tags` con `422`. `GET`: `course_slug`/`lesson_slug` resuelven vía join; `tag` → `keyword`. |
| `app/api/questions/[questionId]/route.ts` | **Editar** | `PATCH` sigue siendo reemplazo total del recurso pregunta, pero **no toca los montajes**. |

Todas las rutas nuevas: `runtime = "nodejs"`, `dynamic = "force-dynamic"`,
autenticación `x-api-key` con `authenticateServiceRequest` (`lib/api/auth.ts`)
**antes** de tocar el dominio, y formato de error uniforme de `lib/api/errors.ts`.

### Componentes

Ninguno nuevo. `components/courses/SelfAssessmentSection.tsx`,
`LessonClosureFlow.tsx` y `components/admin/SelfAssessmentGradeCell.tsx` consumen
tipos que no cambian de forma. Si algún tipo de componente cambia, es señal de que
el spec se salió de alcance.

### Documentación

`docs/mcps/question-bank-agent.system-prompt.md`, `docs/mcps/README.md`, la tabla
"Inventario de MCPs" de `CLAUDE.md`, y `.claude/skills/lesson-authoring/SKILL.md`
(~447-456 y el checklist de la ~520).

---

## Decisiones de arquitectura

> Las decisiones D1, D6 y D3 fueron resueltas por el usuario el 2026-08-06.

### D1 — `questions.course_slug` / `lesson_slug` / `tags`: se deprecan, no se eliminan

**Resuelto: deprecar en este spec; el `DROP` va a un spec de seguimiento** tras un
ciclo completo en producción.

El argumento decisivo no es la limpieza del esquema sino que **el backfill alimenta
el denominador de una nota**: mientras existan las columnas viejas, la query de
paridad de D5 se puede volver a correr contra producción; después de un `DROP`, no.
Además permite un despliegue en dos pasos (migración+backfill primero, código
después) con ambos caminos vivos en paralelo y rollback del frontend sin rollback
de datos.

Se marcan con `comment on column ... is 'DEPRECADO spec-042: usar
lesson_questions / question_keywords'` y se registra la deuda del `DROP` en
`docs/specs/backlog.md`.

### D2 — `questions.tags`: se migra a `question_keywords` y se deja de usar

Los `tags` se vuelcan al catálogo en el backfill, la API **deja de aceptar y de
devolver** `tags`, y la columna se depreca junto con las de D1.

Coexistir es la peor opción: dos vocabularios sobre el mismo eje divergen en
semanas y ninguna consulta sería confiable. Y como `tags` es abierto por
definición, mantenerlo vivo vacía de sentido la regla de vocabulario controlado,
que es el objetivo del spec. Por eso enviar `tags` en `POST`/`PATCH` **no se ignora
en silencio**: devuelve `422` con un mensaje que apunta a `keywords` — el agente
debe enterarse de que el contrato cambió, no descubrir semanas después que sus
etiquetas se perdían.

Consecuencia: **no hace falta índice GIN**. Con `tags` fuera de juego, la búsqueda
por keyword es un join sobre `question_keywords` servido por btree, más rápido y
además `JOIN`able, cosa que un `text[]` no permite.

### D3 — Vocabulario controlado: facetas cerradas y cómo falla

**Resuelto: `keywords.kind` con conjunto cerrado validado por `check`.**

```
kind text null
  check (kind is null or kind in ('tema', 'lenguaje', 'momento', 'ejercicio'))
```

- `tema` — `logica`, `programacion-basica`, `recursion`, `estructuras-de-datos`
- `lenguaje` — `python`, `java`, `sql`
- `momento` — `diagnostico`, `cierre`, `refuerzo`
- `ejercicio` — vínculo con un ejercicio concreto del laboratorio

`kind` es **nullable** a propósito: las keywords sembradas desde `tags` en el
backfill entran con `kind = null` ("sin clasificar") y se curan después con
`PATCH /api/keywords/{slug}`. Inventar un valor `'legacy'` habría contaminado el
conjunto cerrado con un término que no describe nada.

**Cómo falla una keyword inexistente.** `question_keywords.keyword_slug` tiene FK a
`keywords(slug)` con `on delete restrict`, que produce un `23503` de Postgres,
pero **la capa de dominio valida antes** y devuelve `422 validation_error` con
`details.fieldErrors.keywords = ["La keyword 'x' no existe en el catálogo. Créala
con POST /api/keywords."]`, listando **todas** las faltantes de una vez (no la
primera). La FK es la red de seguridad; el mensaje útil lo da el código.

`keywords.slug` se normaliza al crear (minúsculas, sin acentos, espacios → `-`);
`label` conserva la forma legible. Crear un slug ya existente devuelve `409`,
nunca un upsert silencioso.

### D4 — Orden de las preguntas en la lección

`lesson_questions.order_index int not null default 0`, **sin `unique (course_slug,
lesson_slug, order_index)`**: una restricción de unicidad convierte cualquier
reordenamiento en una danza de valores temporales o en un `deferrable`, sin ganar
nada.

Los empates se desempatan de forma determinista por `questions.created_at`, luego
por `question_id`, y ese desempate debe ser **idéntico** en los 4 puntos de lectura
(`getSelfAssessmentForLesson`, `getAnswerKeyForLesson`, `submitSelfAssessment`,
`getAttemptReview`); si divergen, el estudiante ve las preguntas en un orden y la
revisión en otro.

El backfill asigna `order_index` con `row_number() over (partition by course_slug,
lesson_slug order by created_at, id) - 1`, que **reproduce exactamente el orden
actual** (`.order('created_at', { ascending: true })`, líneas 69, 140, 383). Nadie
percibe un cambio de orden el día del despliegue.

Esto es ortogonal a **spec-034**: aquel baraja las *opciones* de cada pregunta por
estudiante; este ordena las *preguntas*, igual para todos. No se baraja el orden de
preguntas (spec-034 lo excluyó explícitamente).

### D5 — El backfill es el riesgo real del spec

Debe ser **idempotente** (`insert ... select ... on conflict do nothing`),
reejecutable, y **verificado por paridad de notas**, no por conteo de filas. La
verificación compara, para cada `(user_id, course_slug, lesson_slug)` con intentos,
el `question_count` que devuelve la fórmula vieja contra la nueva. **El resultado
esperado es cero filas distintas.** Cualquier diferencia se investiga antes de
tocar el RPC: una lección con montaje faltante reduce el denominador y **sube** la
nota de quien no ha respondido.

### D6 — Montajes: solo se cambian con llamadas que dicen que los cambian

**`PATCH /api/questions/{id}`** conserva la semántica de reemplazo total del
recurso pregunta (spec-005:374-379): reemplaza `choices`/`rubric`/
`challenge_tests` **y ahora también `keywords`**. Pero los **montajes en lecciones
no viven en ese payload** y no se ven afectados. Motivo: el MCP compone el payload
completo releyendo la pregunta, y un fallo de composición borraría en silencio los
montajes — es decir, sacaría preguntas de la autoevaluación y **alteraría notas**.

**`PUT /api/lessons/{curso}/{leccion}/questions` — resuelto: solo reordena.** Recibe
la lista ordenada de `question_id` y actualiza sus `order_index`. Si la lista no
coincide **exactamente** con el conjunto montado (falta alguno o sobra alguno),
devuelve `422` sin escribir nada. Montar y desmontar se hace con `POST`/`DELETE`
explícitos en `/api/questions/{id}/lessons`.

La razón es la misma de siempre en este spec: ninguna llamada debe poder vaciar
una autoevaluación de un tirón, porque vaciarla altera notas.

### D7 — RLS de las tablas nuevas

Consistente con `20260715000001_rls_questions.sql`, con una particularidad: **la
autoevaluación lee con la sesión del estudiante** (spec-011/D1), así que
`lesson_questions` debe ser legible por el estudiante o el join devuelve vacío y la
nota se cae a cero.

| Tabla | `select` | `insert` / `update` / `delete` |
|---|---|---|
| `keywords` | Cualquier usuario autenticado (el catálogo no es sensible). | `teacher` o `admin` (`public.has_role`). |
| `question_keywords` | Derivado de la pregunta padre, espejo exacto de `question_choices: select` (`20260715000001:49-57`). | Espejo de `question_choices` (autor de la pregunta o admin). |
| `lesson_questions` | Autor de la pregunta, **o pregunta publicada**, o admin — espejo de `questions: select own or published` (`:6-12`). Es lo que permite al estudiante ver su autoevaluación. | Autor de la pregunta o admin. |

El cliente `service_role` de la API **bypasa RLS**: como en spec-005, las funciones
de servicio replican en código la frontera de propiedad (`created_by = actorId`) —
montar una pregunta ajena no publicada devuelve `404`.

### D8 — Índices

| Tabla | Índice | Para qué |
|---|---|---|
| `lesson_questions` | PK `(course_slug, lesson_slug, question_id)` | Sirve por prefijo la consulta caliente "preguntas de esta lección" — la de la autoevaluación y la del RPC de nota. |
| `lesson_questions` | btree `(question_id)` | Reverso: "¿en qué lecciones está montada esta pregunta?". |
| `question_keywords` | PK `(question_id, keyword_slug)` | Keywords de una pregunta. |
| `question_keywords` | btree `(keyword_slug)` | "Todas las preguntas con esta keyword" — el filtro nuevo de `GET /api/questions`. |
| `keywords` | PK `(slug)` + btree `(kind)` | Catálogo y listado por faceta. |

Sin GIN (ver D2).

---

## Evaluación MCP

**¿Aplica MCP?** Sí.

- **MCP existente a modificar:** `question-bank-mcp`.
  - **Herramientas nuevas:** `list_keywords`, `create_keyword`,
    `mount_question_in_lesson`, `unmount_question_from_lesson`,
    `list_lesson_questions`, `reorder_lesson_questions`.
  - **Herramientas modificadas (ruptura de contrato):** `create_question` y
    `update_question` dejan de aceptar `course_slug`, `lesson_slug` y `tags`, y
    aceptan `keywords: string[]`. `list_questions` sustituye el filtro `tag` por
    `keyword` (los filtros `course_slug`/`lesson_slug` **conservan el nombre** y
    siguen funcionando, ahora resueltos vía montaje — el agente no percibe cambio
    ahí).
- **MCP nuevo a crear:** ninguno. El catálogo de keywords es parte del dominio del
  banco; un MCP aparte fragmentaría un flujo que siempre ocurre junto (crear
  pregunta → asignar keywords → montar en lección).
- **System prompt afectado:** `docs/mcps/question-bank-agent.system-prompt.md`
- **Fase de MCP en este spec:** Fase 6.

**Ruptura para el agente docente y cómo se comunica.** Hoy el agente crea una
pregunta de cierre en **una** llamada con `course_slug`/`lesson_slug` embebidos.
Tras este spec son **tres**: `create_question` (con `keywords`) →
`publish_question` → `mount_question_in_lesson`. Una pregunta creada y publicada
pero **no montada no aparece en ninguna autoevaluación**, exactamente igual que hoy
una con el slug mal escrito, pero ahora el fallo es detectable:
`list_lesson_questions` devuelve la lista real.

El system prompt debe (a) describir el flujo de tres pasos como obligatorio,
(b) prohibir inventar keywords y exigir `list_keywords` antes de asignar,
(c) explicar que `create_keyword` amplía un vocabulario compartido y por tanto se
**propone al usuario antes de invocarse**, y (d) advertir que `update_question` ya
no puede mover una pregunta de lección. La misma ruptura se refleja en el checklist
de `.claude/skills/lesson-authoring/SKILL.md` (~520), que hoy dice
"`course_slug`/`lesson_slug` copiados literalmente".

---

## Fases de implementación

### Fase 0 — Snapshot y verificación previa (antes de tocar nada)
- [ ] Confirmar entorno de trabajo: desarrollo (instancia local en `mirp-lab`, ver
      "Base de datos" de `CLAUDE.md`). Reconectar túnel SSH y `supabase status`.
- [ ] Contar en **producción** (solo lectura, sin escribir): total de `questions`;
      cuántas con `course_slug`/`lesson_slug` no nulos; cuántas con `tags` no
      vacío; cuántas `multiple_choice` publicadas por `(course_slug, lesson_slug)`.
- [ ] Exportar el **breakdown de referencia**: por cada `(user_id, course_slug)`
      con filas en `self_assessment_attempts`, el resultado actual de
      `self_assessment_breakdown` y la nota vigente en `student_grades` del
      `grade_item` con `kind='self_assessment'`. Guardar en el scratchpad de la
      sesión, **fuera del repo**.
- [ ] Traer una copia de esos datos a la base de desarrollo (o sembrar un escenario
      equivalente) para que el backfill se pruebe contra datos con la misma forma
      que producción.
- [ ] Registrar los conteos en `docs/testing/test-042-banco-preguntas-keywords.md`.

### Fase 1 — Migraciones de esquema y RLS
- [ ] `supabase/migrations/20260806000000_init_keywords.sql`: tablas `keywords`
      (con el `check` de facetas de D3) y `question_keywords`, con PKs, FKs
      (`restrict` hacia `keywords`, `cascade` hacia `questions`) e índices de D8.
- [ ] `supabase/migrations/20260806000001_init_lesson_questions.sql`: tabla
      `lesson_questions` con PK compuesta, `order_index`, FK a `questions`
      (`cascade`), índice inverso por `question_id`, y `comment on table`
      explicando el rol.
- [ ] `supabase/migrations/20260806000002_rls_keywords_and_lesson_questions.sql`:
      `enable row level security` en las tres tablas y las políticas de D7,
      calcadas en estilo de `20260715000001_rls_questions.sql`.
- [ ] `supabase/migrations/20260806000003_deprecate_question_slug_columns.sql`:
      `comment on column` para `questions.course_slug`, `lesson_slug` y `tags`
      marcándolas como deprecadas por spec-042. Sin DDL destructivo (D1).
- [ ] `rsync` de las migraciones a `mirp-lab` y `supabase db reset` allá; verificar
      que reconstruye sin conflictos y que las tres tablas tienen RLS habilitado.
- [ ] Verificar las políticas por rol a mano: un estudiante matriculado **ve** filas
      de `lesson_questions` de preguntas publicadas; **no ve** montajes de
      preguntas en borrador.

### Fase 2 — Backfill idempotente y paridad de datos
- [ ] `supabase/migrations/20260806000004_backfill_lesson_questions.sql`:
      `insert into lesson_questions (...) select q.course_slug, q.lesson_slug,
      q.id, row_number() over (partition by q.course_slug, q.lesson_slug order by
      q.created_at, q.id) - 1 from questions q where q.course_slug is not null and
      q.lesson_slug is not null ... on conflict do nothing`. Reejecutable sin
      efecto (D4/D5).
- [ ] `supabase/migrations/20260806000005_seed_keywords_from_tags.sql`: sembrar
      `keywords` con los `tags` distintos existentes (slug normalizado, `label` =
      texto original, `kind = null` → sin clasificar, D3) y poblar
      `question_keywords` desde `unnest(tags)`. Ambos `on conflict do nothing`.
- [ ] **Detectar colisiones de slugificación** (dos tags distintos que producen el
      mismo slug, p. ej. `recursión` y `recursion`): consulta que las liste.
      `on conflict do nothing` conserva el primer `label`; si hay colisiones,
      **reportarlas al usuario** antes de continuar.
- [ ] Verificación 1: cero preguntas con `course_slug`/`lesson_slug` no nulos sin
      fila en `lesson_questions`.
- [ ] Verificación 2: cero preguntas con `tags` no vacío sin filas en
      `question_keywords` (descontadas las colisiones ya reportadas).
- [ ] **Verificación 3 (la que importa, D5):** consulta que compara, por
      `(user_id, course_slug, lesson_slug)`, el `question_count` de la fórmula
      vieja contra la nueva. **Resultado esperado: cero filas.** Si no lo es,
      detenerse y reportar antes de la Fase 5.
- [ ] Dejar las tres consultas de verificación registradas en el archivo de test
      para poder reejecutarlas contra producción el día del despliegue.

### Fase 3 — Dominio TypeScript
- [ ] Crear `lib/keywords/types.ts` y `lib/keywords/schemas.ts` (Zod: `slug`
      normalizado, `label` requerido, `kind` opcional restringido al enum de D3;
      schema de filtros de listado).
- [ ] Crear `lib/keywords/index.ts` con contexto `{ supabase, actorId }` y
      `lib/keywords/service.ts` con `getServiceKeywordsContext()`, replicando el
      patrón de `lib/questions/service.ts:12-21`.
- [ ] Implementar `assertKeywordsExist(context, slugs)`: devuelve **todas** las
      faltantes (D3), no la primera.
- [ ] Editar `lib/questions/types.ts`: quitar `course_slug`/`lesson_slug`/`tags` de
      `Question` y `QuestionInput`; añadir `keywords: string[]` y
      `lessons: LessonMount[]` a `QuestionWithDetails`; tipo
      `LessonMount { course_slug, lesson_slug, order_index }`.
- [ ] Editar `lib/questions/schemas.ts:3-15` y `:110-120` (`tag` → `keyword`).
- [ ] Editar `lib/questions/index.ts:12-72` (`_getQuestionsByActor`): filtros
      `course_slug`/`lesson_slug` vía `lesson_questions`, filtro `keyword` vía
      `question_keywords`; embeber `keywords` y `lessons` en el `select`.
- [ ] Editar `:98-135` y `:137-195` (create/update): validar keywords contra el
      catálogo **antes** de escribir; escribir `question_keywords`; reemplazo total
      del set de keywords en update; **no tocar `lesson_questions`** (D6).
- [ ] Editar `mapQuestionRow` (`:349-376`): exponer `keywords` y `lessons`, dejar
      de exponer los slugs y `tags`.
- [ ] Añadir funciones de montaje en `lib/questions/index.ts`:
      `_mountQuestionInLesson`, `_unmountQuestionFromLesson`,
      `_getLessonQuestionsForActor`, `_reorderLessonQuestions` — todas con la
      comprobación de propiedad (`created_by = actorId` ⇒ si no, tratar como no
      encontrada).
- [ ] Añadir sus wrappers en `lib/questions/service.ts`.
- [ ] `npx tsc --noEmit`: los errores que aparezcan en `lib/self-assessment/*` son
      **esperados** y los resuelve la Fase 5.

### Fase 4 — API REST
- [ ] Crear `app/api/keywords/route.ts` (`GET` con filtros + paginación, `POST` con
      `409` en slug duplicado).
- [ ] Crear `app/api/keywords/[slug]/route.ts` (`GET`, `PATCH`, `DELETE` con `409`
      si hay filas en `question_keywords`).
- [ ] Crear `app/api/questions/[questionId]/lessons/route.ts` (`GET`, `POST`
      idempotente, `DELETE` por query params; `404` si la pregunta no es del actor;
      `422` si falta un slug).
- [ ] Crear `app/api/lessons/[courseSlug]/[lessonSlug]/questions/route.ts` (`GET`
      en orden, `PUT` que **solo reordena** y devuelve `422` si la lista no coincide
      exactamente con lo montado — D6).
- [ ] Editar `app/api/questions/route.ts`: `POST` rechaza
      `course_slug`/`lesson_slug`/`tags` con `422` y mensaje que apunta a los
      endpoints nuevos (D2); `GET` (`:32-48`) sustituye `tag` por `keyword`.
- [ ] Editar `app/api/questions/[questionId]/route.ts`: `PATCH` con el mismo rechazo
      `422`; confirmar que no toca montajes.
- [ ] Cada ruta nueva: `runtime`/`dynamic`, `authenticateServiceRequest` primero,
      errores con `lib/api/errors.ts`.
- [ ] Verificar que ninguna ruta nueva importa `SUPABASE_SERVICE_ROLE_KEY` fuera de
      `lib/auth/service.ts`.

### Fase 5 — Reescritura de la autoevaluación (la fase de riesgo)
- [ ] Punto 1 — `lib/self-assessment/index.ts:52-69`: query desde
      `lesson_questions` con `questions!inner`, `.order('order_index')` +
      desempate en TS por `created_at`, `id`.
- [ ] Punto 2 — `:73-98`: adaptar el mapeo a la fila anidada. **Conservar
      `seededShuffle` y el `.order` sobre `question_choices`** (spec-034).
- [ ] Punto 3 — `:123-140` y `:144-165` (`getAnswerKeyForLesson`): mismo cambio,
      sin barajar; gate de rol intacto.
- [ ] Punto 4 — `:208-216` (`checkSelfAssessmentAnswer`): pertenencia vía
      `lesson_questions`.
- [ ] Punto 5 — `:273-281` (`getSelfAssessmentStatus`): conteo vía montaje,
      **manteniendo el fail-closed de spec-037/D8** (`:323-329`).
- [ ] Punto 6 — `:376-391` (`submitSelfAssessment`): mismo conjunto y mismo orden
      que el punto 1; sin cambios en el insert de `:445-456`.
- [ ] Punto 7 — `:534-551` y `:574-582` (`getAttemptReview`): ordenar por
      `order_index` del montaje con fallback a `created_at` para preguntas
      desmontadas.
- [ ] Punto 8 —
      `supabase/migrations/20260806000006_self_assessment_breakdown_via_lesson_questions.sql`:
      `create or replace function public.self_assessment_breakdown(...)` con firma
      **idéntica**, cambiando solo la subconsulta de conteo. Preservar literalmente
      el `BLOQUE 039` comentado. No tocar `apply_self_assessment_grade` ni las dos
      RPC de recálculo.
- [ ] Reejecutar la **verificación 3 de la Fase 2** contra la función ya
      reemplazada: cero diferencias.
- [ ] Escenario de regresión completo en desarrollo: estudiante con intento previo
      (nota congelada, spec-040/D6) y estudiante sin intento (denominador vivo) →
      ninguna de las dos notas cambia tras la migración.
- [ ] `npm run lint` y `npx tsc --noEmit` sin errores.

### Fase 6 — MCP: actualizar `question-bank-mcp`
- [ ] Añadir a `mcp-servers/question-bank-mcp/src/tools.ts`: `list_keywords`,
      `create_keyword`, `mount_question_in_lesson`, `unmount_question_from_lesson`,
      `list_lesson_questions`, `reorder_lesson_questions`.
- [ ] Modificar `create_question` / `update_question` (quitar `course_slug`,
      `lesson_slug`, `tags`; añadir `keywords`) y `list_questions`
      (`tag` → `keyword`).
- [ ] Verificar que el error `422` de keyword inexistente se relaya al agente **con
      el mensaje original de la API**, sin reformular (regla de spec-005).
- [ ] `npm run build` en `mcp-servers/question-bank-mcp/`.
- [ ] Reescribir `docs/mcps/question-bank-agent.system-prompt.md`: flujo obligatorio
      de tres pasos, prohibición de inventar keywords, `list_keywords` antes de
      asignar, `create_keyword` se propone al usuario antes de invocarse,
      `update_question` ya no mueve preguntas de lección, y la advertencia de que
      una pregunta publicada sin montar es invisible.
- [ ] Actualizar `docs/mcps/README.md` y la tabla "Inventario de MCPs" de
      `CLAUDE.md`.
- [ ] Actualizar `.claude/skills/lesson-authoring/SKILL.md` (~447-456: el bloque de
      restricciones de `course_slug`/`lesson_slug`/`tags`; ~520: el checklist de
      cierre) con el flujo nuevo.
- [ ] Verificar el servidor de forma aislada:
      `./mcp-servers/run-local-mcp.sh question-bank-mcp </dev/null` con
      `npm run dev` corriendo.

### Fase 7 — Pruebas
- [ ] Ejecutar los casos manuales de
      `docs/testing/test-042-banco-preguntas-keywords.md` con el usuario (protocolo
      de "Pruebas manuales asistidas por Claude"): preparación de datos vía API, un
      caso a la vez, registro de hallazgos caso por caso.
- [ ] Ejecutar los `TC-MCP-042-*` contra la API local.
- [ ] Eliminar vía API todos los datos de prueba, en orden inverso, y marcar la
      limpieza en el archivo de test.
- [ ] Invocar `@tester` para las pruebas automáticas (cuando exista framework; hoy
      "por definir" en `CLAUDE.md` — su ausencia no bloquea el `[DONE]`).
- [ ] Invocar `@reviewer` antes de marcar `[DONE]`.

> **Orden de despliegue a producción** (no forma parte de este spec; requiere
> confirmación explícita en su momento): migraciones de las Fases 1 y 2
> **primero**, verificar paridad en producción con las tres consultas, y solo
> entonces desplegar el código de las Fases 3-6. Esto es viable precisamente porque
> D1 conserva las columnas viejas.

---

## Criterios de aceptación

### Modelo de datos y migración
- Existen `lesson_questions`, `keywords` y `question_keywords` con RLS habilitado y
  las políticas de D7.
- Toda pregunta que antes tenía `course_slug` y `lesson_slug` tiene su fila
  equivalente en `lesson_questions`, con `order_index` que reproduce el orden
  anterior por `created_at`.
- Todo `tag` existente tiene su entrada en `keywords` y su relación en
  `question_keywords`; las colisiones de slugificación fueron reportadas al usuario.
- Reejecutar el backfill completo no produce filas duplicadas ni cambia ningún
  `order_index`.
- `keywords` rechaza un `kind` fuera de `('tema','lenguaje','momento','ejercicio')`.

### Notas (spec-040) — el criterio bloqueante
- Para toda combinación `(user_id, course_slug)` con intentos previos, el
  `question_count` de `self_assessment_breakdown` es **idéntico** antes y después
  del cambio.
- Ninguna fila de `student_grades` del `grade_item` con `kind='self_assessment'`
  cambia de valor como efecto de la migración.
- Un estudiante con intento previo ve la misma nota y la misma revisión que antes.

### Funcional
- Una misma pregunta puede montarse en 2+ lecciones y aparece en la autoevaluación
  de todas ellas.
- Desmontar una pregunta de una lección la retira de esa autoevaluación **sin**
  eliminarla del banco ni afectar sus otros montajes.
- Reordenar el montaje cambia el orden en que el estudiante ve las preguntas, y
  `getAttemptReview` respeta ese mismo orden.
- Las opciones de cada pregunta se siguen barajando por estudiante (spec-034), y la
  clave del docente sigue en orden canónico.
- Completar una lección sigue exigiendo haber respondido la autoevaluación
  (spec-033/spec-037 D8); si la consulta de estado falla, se falla cerrado.

### Vocabulario controlado
- `POST /api/questions` con una keyword inexistente devuelve `422` listando
  **todas** las faltantes, y **no crea la pregunta**.
- `POST /api/keywords` con un slug existente devuelve `409`.
- `DELETE /api/keywords/{slug}` de una keyword en uso devuelve `409`.
- `GET /api/questions?keyword=X` devuelve exactamente las preguntas relacionadas
  con `X`.

### Compatibilidad y contrato
- `POST`/`PATCH /api/questions` con `course_slug`, `lesson_slug` o `tags` devuelve
  `422` con un mensaje que indica el endpoint correcto (no se ignoran en silencio).
- `PATCH /api/questions/{id}` no altera los montajes de la pregunta.
- `PUT /api/lessons/{curso}/{leccion}/questions` con una lista que no coincide
  exactamente con lo montado devuelve `422` y no escribe nada.
- Los filtros `course_slug`/`lesson_slug` de `GET /api/questions` siguen
  funcionando con el mismo nombre.

### MCP
- El agente puede invocar `list_keywords`, `create_keyword`,
  `mount_question_in_lesson`, `unmount_question_from_lesson`,
  `list_lesson_questions` y `reorder_lesson_questions` con los resultados
  esperados.
- Un `422` de keyword inexistente llega al agente con el mensaje original de la API.
- El system prompt y `SKILL.md` describen el flujo de tres pasos y ya no mencionan
  `tags` ni slugs en la pregunta.

### Calidad
- `npm run lint` y `npx tsc --noEmit` sin errores nuevos.
- Ningún archivo bajo `app/` o `components/` importa `SUPABASE_SERVICE_ROLE_KEY`.
- Las migraciones nuevas reconstruyen el esquema desde cero con
  `supabase db reset` en `mirp-lab`.

---

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec"
> en `CLAUDE.md`).

- **Manuales:** `docs/testing/test-042-banco-preguntas-keywords.md` — casos
  `TC-042-*` (flujos con UI: autoevaluación del estudiante con pregunta montada /
  desmontada / reordenada, revisión del intento, clave del docente, nota en la
  libreta antes y después de la migración) y `TC-MCP-042-*` (las 6 herramientas
  nuevas + las 3 modificadas). Incluye, en "Datos de prueba", las tres consultas de
  verificación de la Fase 2 para poder reejecutarlas.
- **Automáticas (e2e/unit):**
  `{{ubicación e2e por definir}}/e2e-042-banco-preguntas-keywords.spec.ts` — un
  caso por criterio de aceptación, en rojo desde el inicio. Se crea cuando el
  proyecto adopte framework de testing (hoy "por definir" en `CLAUDE.md`); su
  ausencia no bloquea el `[DONE]`.

---

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
