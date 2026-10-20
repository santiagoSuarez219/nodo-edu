# spec-060 — [NOT STARTED] Nota de autoevaluaciones calculada sobre las lecciones dictadas por el docente

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

spec-040 convirtió la autoevaluación de cierre de lección en una nota del curso
(ítem `grade_items.kind = 'self_assessment'`), con esta regla (D4 de spec-040):

```
denominador = Σ preguntas de cada lección VISTA por el estudiante
numerador   = Σ correctas del intento de esa lección (0 si no hay intento)
nota        = round(numerador / denominador * 5, 2)
```

"Vista" significa que existe una fila en `lesson_progress` para el estudiante:
la crea `markLessonViewed` ([lib/progress/index.ts:47](../../lib/progress/index.ts#L47))
la primera vez que **el estudiante** abre la lección. El denominador lo decide,
por tanto, la curiosidad o la disciplina de cada estudiante, no el avance real
del curso:

- Un estudiante que **no abre** una lección ya dictada no se penaliza por no
  responderla: queda fuera de su denominador. Quien no entra a la plataforma
  conserva una nota alta construida sobre pocas lecciones.
- Un estudiante que **se adelanta** y abre una lección que aún no se ha dado en
  clase ve bajar su nota de inmediato (lección vista sin responder = 0), por un
  contenido que todavía no le correspondía.
- Dos estudiantes del mismo grupo con el mismo desempeño real tienen notas
  distintas según cuántas lecciones hayan abierto.

La necesidad del usuario, literal:

> "la autoevaluacion se calcula con las lecciones abiertas por el estudiante,
> este comportamiento debe cambiar a las lecciones que defina el docente, el
> docente puede marcar la leccion como vista o algo asi y de esta manera
> calcular las notas de las autoevaluaciones."

Decisiones ya tomadas por el usuario (no se re-discuten en este spec):

1. **Por grupo.** El docente marca las lecciones "vistas en clase" **por curso
   académico** (`academic_courses.id`), no de forma global por `course_slug`.
   Dos grupos del mismo curso pueden ir a ritmos distintos.
2. **Sin responder cuenta como 0.** Una lección marcada cuyas preguntas el
   estudiante no respondió entra al denominador con 0 aciertos. Si responde
   después, la nota sube. No hay fecha límite.

## Alcance

### Incluye

1. **Tabla nueva `taught_lessons`**: qué lecciones dio el docente en clase, por
   grupo, con fecha de marcado y autor.
2. **Nueva regla de cálculo**: el denominador pasa a ser las lecciones
   **marcadas como dictadas en el grupo de la matrícula**, que además estén
   **abiertas** (no deshabilitadas por spec-039) y tengan preguntas. El
   `lesson_progress` del estudiante deja de intervenir.
3. **Cálculo por grupo**: `self_assessment_breakdown` pasa a recibir el curso
   académico en vez del `course_slug`; la nota de cada matrícula se calcula
   contra las lecciones de **su** grupo.
4. **Corrección del bug latente de nota rancia**: si el denominador queda en 0
   (por ejemplo, al desmarcar todas las lecciones), la nota existente pasa a
   `null` en vez de quedar con el último valor.
5. **Filtro de lecciones cerradas (BLOQUE 039)**: una lección marcada pero
   deshabilitada no cuenta. Resuelve **DEBT-045**.
6. **Disparadores del recálculo**: marcar/desmarcar una lección recalcula el
   grupo entero; enviar un intento sigue recalculando al estudiante; **ver una
   lección deja de recalcular**.
7. **UI docente** en la pestaña **Contenido** del curso académico
   (`/admin/courses/[academicCourseId]/contenido`, hoy un placeholder
   "Próximamente" y sin enlace en `CourseTabs`): lista de lecciones del
   catálogo con el interruptor "Vista en clase".
8. **UI del estudiante**: la tarjeta "Autoevaluaciones" de
   `/cuenta/cursos/[enrollmentId]` muestra solo las lecciones dictadas del
   grupo, con las no respondidas como "Sin responder — 0/N" y un aviso de que
   aún puede responderlas.
9. **Fase MCP**: `courses-mcp` gana herramientas por grupo para listar y
   marcar/desmarcar lecciones dictadas; `students-mcp` ajusta
   `get_student_self_assessment_summary` al cálculo por grupo.
10. **Plan de despliegue** con el paso operativo de marcar las lecciones ya
    dictadas en cada grupo antes de que la nota se vuelva a mostrar.

### No incluye

- **Ponderación de la nota** de autoevaluaciones dentro del total del curso:
  la aborda **spec-059** (ponderación por ítem con peso 0–1 y cortes
  institucionales), redactado en paralelo. Este spec no depende de él; el ítem
  `kind = 'self_assessment'` sigue siendo uno solo por curso académico y
  spec-059 le asignará un peso como a cualquier otro ítem. Ver "Relación con
  spec-059".
- Cambiar el intento único, la revisión por pregunta, la deduplicación o la
  resolución del `grade_item` de spec-040 (D1, D2, D3, D5 se conservan).
- Cambiar la congelación de `question_count` de spec-040 (D6) — se preserva
  tal cual.
- Que marcar una lección como dictada la **abra** automáticamente a los
  estudiantes (o que abrirla la marque). Son dos decisiones distintas; ver D6.
- Hacer la disponibilidad de spec-039 granular por grupo: `disabled_lessons`
  sigue siendo global por `course_slug`.
- Marcar guías de laboratorio (`kind: "guide"`): no tienen autoevaluación ni
  progreso rastreado.
- Fecha límite de respuesta o cierre de la autoevaluación.
- Cambiar `lesson_progress` o el progreso/completado de lecciones: la tabla
  sigue existiendo y alimentando la barra de progreso; solo deja de alimentar
  la nota.
- Marcado automático a partir del cronograma del microdiseño (ver "Preguntas
  abiertas", P1).
- Escritura en lote ("marcar las semanas 1 a 6") en una sola llamada de API o
  MCP (ver P3).

## Relación con otros specs y deuda

| Referencia | Relación |
|---|---|
| **spec-040** | Spec que este modifica. Se reemplaza su D4 ("vista" = `lesson_progress`) y la fila "Ver una lección nueva" de su tabla de disparadores. D1–D3, D5 y D6 se conservan. |
| **spec-039** | Aporta `disabled_lessons`. Este spec aplica por fin el BLOQUE 039 que spec-040 dejó comentado. |
| **spec-042** | El conteo vivo de preguntas sale de `lesson_questions` (`20260806000006_...`); se conserva. |
| **spec-056** | "Mis notas" (`lib/grades/overview.ts`) consume el resumen por curso; debe pasar a consumirlo por matrícula. |
| **spec-059** (en redacción) | Relacionado, sin dependencia. El ítem de autoevaluaciones tendrá peso allí. Ver "Relación con spec-059". |
| **DEBT-045** | Se resuelve en este spec (D5). |
| **DEBT-093** | Mitigación parcial: el denominador ya no sale de `lesson_progress` (filas huérfanas por renombre de slug dejan de contar) y la UI/API reportan marcas huérfanas (D9). El renombre de `lesson_questions` sigue fuera de alcance. |

### Relación con spec-059

spec-059 introduce peso 0–1 por ítem de calificación. Puntos de contacto, sin
dependencia de orden de merge:

- Este spec **no cambia la escala** (0–5) ni la cardinalidad del ítem (uno por
  curso académico, `kind = 'self_assessment'`).
- Este spec hace que la nota pueda pasar de un valor a `null` (D4). spec-059
  debe tratar un `score = null` como "sin nota" en el promedio ponderado (no
  como 0), igual que hoy hace `computeTotalGrade`. Si spec-059 se implementa
  primero, verificar esa regla al implementar este; si es al revés, que
  spec-059 lo tenga presente.
- El paso de despliegue de este spec (marcar lecciones dictadas) cambia las
  notas de autoevaluaciones de todos los grupos; conviene no desplegar ambos
  specs el mismo día para poder atribuir cualquier cambio de nota a uno solo.

## Impacto en el sistema

### Base de datos

| Objeto | Cambio |
|---|---|
| `taught_lessons` | **Nueva** tabla `(academic_course_id, lesson_slug)` + RLS de solo lectura |
| `self_assessment_breakdown(uuid, uuid)` | **Nueva** firma `(p_user_id, p_academic_course_id)` que parte de `taught_lessons`, filtra `disabled_lessons` y conserva D6 |
| `self_assessment_breakdown(uuid, text)` | Se **conserva** durante el despliegue (callers viejos) y se elimina después — ver D3 y DEBT-097 |
| `apply_self_assessment_grade` | Nueva firma `(p_user_id, p_enrollment_id)`: deriva el grupo de la matrícula; con 0 preguntas **pone la nota existente en `null`** (D4). Se elimina la firma `(uuid, uuid, text)` |
| `recalculate_self_assessment_grade(text)` | Firma intacta (la usa `submitSelfAssessment`); internamente llama a la nueva `apply` |
| `recalculate_course_self_assessment_grades(uuid)` | Firma intacta; delega en una variante interna para que la API de servicio pueda reutilizarla (D8) |
| `recalculate_course_self_assessment_grades_internal(uuid)` | **Nueva**, solo `service_role` |
| `set_lesson_taught(uuid, text, boolean)` | **Nueva** RPC `security definer` para la sesión del docente: valida dueño/admin, marca/desmarca y recalcula el grupo en la misma transacción |
| `set_lesson_taught_internal(uuid, text, boolean, uuid)` | **Nueva**, solo `service_role` (la usa `/api/courses/*`) |

### Backend

| Archivo | Cambio |
|---|---|
| `lib/progress/index.ts` | `markLessonViewed`: **eliminar** la llamada a `recalculate_self_assessment_grade` (se conserva el `upsert` con `ignoreDuplicates`) |
| `lib/self-assessment/index.ts` | `getSelfAssessmentCourseSummary` pasa a recibir el **`enrollmentId`** (resuelve `academic_course_id` y `course_slug` de la matrícula propia); `getSelfAssessmentBreakdownForEnrollment` llama a la nueva firma con el `academicCourseId` que ya recibe; `submitSelfAssessment` sin cambios |
| `lib/self-assessment/types.ts` | `SelfAssessmentCourseSummary` gana `taughtLessonCount` (lecciones dictadas que cuentan) para la UI del estudiante; comentario de D4 actualizado |
| `lib/courses/taught-lessons.ts` | **Nuevo** módulo: lectura del listado del grupo (catálogo × `taught_lessons` × `disabled_lessons` × conteo de `lesson_questions`) y Server Action `setLessonTaught(academicCourseId, lessonSlug, taught)` que valida el slug contra el catálogo y llama a `set_lesson_taught` |
| `lib/courses/service.ts` | Funciones de servicio para `/api/courses/[courseSlug]/groups/*` (listado de grupos, listado de lecciones dictadas, escritura vía `set_lesson_taught_internal`) |
| `lib/students/service.ts` | `getServiceStudentSelfAssessmentSummary` pasa a recibir `academicCourseId`; resolución desde `course_slug` solo si es inequívoca (D10) |
| `lib/grades/overview.ts` | Llamar al resumen por matrícula, no por `course_slug` |
| `lib/grades/actions.ts` | Sin cambios de firma; la acción sigue llamando al RPC público |

### API

| Ruta | Cambio |
|---|---|
| `GET /api/courses/[courseSlug]/groups` | **Nueva** — grupos (cursos académicos) de ese `course_slug` |
| `GET /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons` | **Nueva** — catálogo de lecciones del grupo con estado dictada/abierta y preguntas |
| `PATCH /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons/[lessonSlug]` | **Nueva** — marcar/desmarcar `{ taught: boolean }` |
| `GET /api/students/[studentId]/self-assessment` | Acepta `academic_course_id` (preferido); `course_slug` solo como atajo inequívoco (D10) |

Todas las rutas nuevas de `/api/courses/*` autentican con
`COURSES_ADMIN_API_KEY` (mismo `requireCoursesAdminAuth` de spec-039; falta de
la variable → `500 configuration_error`, nunca `401`).

### Frontend

| Archivo | Cambio |
|---|---|
| `components/admin/CourseTabs.tsx` | Nueva pestaña **"Contenido"** (la ruta existe, el enlace no) |
| `app/(admin)/admin/courses/[academicCourseId]/contenido/page.tsx` | Reemplazar el placeholder por la lista de lecciones del grupo |
| `components/admin/TaughtLessonsTable.tsx` | **Nuevo** — tabla con el interruptor "Vista en clase" por lección |
| `components/account/SelfAssessmentSummaryCard.tsx` | Copia de la regla nueva, estado "Sin responder — 0/N", aviso "aún puedes responderla", estado vacío "tu docente aún no ha marcado lecciones" |
| `app/cuenta/cursos/[enrollmentId]/page.tsx` | Pasar `enrollmentId` al resumen |
| `components/admin/RecalculateSelfAssessmentButton.tsx` | Texto de ayuda: "según las lecciones marcadas como vistas en clase" en vez de "que ya vio" |
| `components/courses/SelfAssessmentSection.tsx` | Sin cambio funcional. Copia opcional (ver D11) |

### MCP

| Archivo | Cambio |
|---|---|
| `mcp-servers/courses-mcp/src/tools.ts` | Tres herramientas nuevas (ver "Evaluación MCP") |
| `mcp-servers/students-mcp/src/tools.ts` | `get_student_self_assessment_summary`: nuevo input `academic_course_id` |
| `docs/mcps/courses-agent.system-prompt.md` | Nuevas capacidades y restricciones (alcance por grupo, efecto en la nota) |
| `docs/mcps/students-agent.system-prompt.md` | Regla de cálculo nueva: "lecciones dictadas del grupo", no "que abrió" |
| `docs/mcps/README.md` | Entradas de `courses-mcp` y `students-mcp` |

## Decisiones de diseño

### D1 — Tabla `taught_lessons`, por grupo, con la fila como señal

```
taught_lessons
  academic_course_id  uuid        not null  fk academic_courses(id) on delete cascade
  lesson_slug         text        not null
  marked_at           timestamptz not null default now()
  marked_by           uuid        null      fk auth.users(id) on delete set null
  primary key (academic_course_id, lesson_slug)
```

- **Por qué la existencia de la fila es la señal** (y no una columna booleana):
  mismo modelo que `disabled_lessons` (spec-039). El estado es binario;
  "desmarcar" es un `delete`. No hay `update`.
- **Por qué no se guarda `course_slug`**: se deriva de
  `academic_courses.course_slug`. Guardarlo duplicaría un dato que puede
  quedar inconsistente si el docente cambia el `course_slug` del grupo
  (spec-036 lo permite). Si cambia el slug, las marcas viejas quedan huérfanas
  y se reportan (D9) — es el comportamiento correcto: las lecciones del curso
  nuevo no se dictaron.
- **Por qué no hay FK hacia el catálogo**: el catálogo vive en git
  (`lib/courses/data/*.ts`), igual que en `disabled_lessons` y
  `lesson_questions`. La validación del slug ocurre en TypeScript **antes** de
  escribir (UI y API).
- **Por qué solo `kind: "lesson"`**: las guías no tienen autoevaluación ni
  progreso rastreado (`countProgressibleLessons` ya las excluye). La UI no las
  muestra y la API responde `422` si se intenta marcar una guía.
- `marked_by` es nullable: las escrituras de la API de servicio (MCP) no
  tienen `auth.uid()` (mismo criterio que `disabled_lessons.disabled_by`).
- `on delete cascade` desde `academic_courses`: borrar un grupo borra sus
  marcas (spec-036 ya permite eliminar cursos académicos).

**RLS** (desvío deliberado de la propuesta inicial "escritura docente
dueño/admin"):

| Operación | Quién | Por qué |
|---|---|---|
| `select` | docente dueño del grupo, admin, **estudiante con matrícula activa en ese grupo** | El estudiante debe poder saber qué lecciones cuentan para su nota; además `self_assessment_breakdown` es `security invoker` y lo invoca la sesión del estudiante en su tarjeta |
| `insert` / `delete` | **nadie** vía RLS; solo las RPC `security definer` | Marcar sin recalcular dejaría la nota del grupo desactualizada. Obligar a escribir por `set_lesson_taught` garantiza que marca y recálculo ocurren en la **misma transacción**. Un `insert` directo por PostgREST con el JWT del docente simplemente se rechaza |
| `update` | nadie | El estado es presencia/ausencia de fila |

### D2 — Nueva regla de cálculo

```
lecciones que cuentan (por matrícula) =
    taught_lessons del grupo de la matrícula
  − lecciones deshabilitadas (disabled_lessons del course_slug del grupo)

preguntas de la lección = si hay intento → attempts.question_count       (D6 de spec-040, congelado)
                          si no hay intento → count(lesson_questions ⋈ questions
                                                   multiple_choice publicadas) (vivo)
correctas de la lección = attempts.correct_count, o 0 sin intento
nota = round(Σ correctas / Σ preguntas * 5, 2); null si Σ preguntas = 0
```

Consecuencias explícitas:

- **Lección dictada y no respondida = 0/N**, se haya abierto o no (decisión 2
  del usuario). Responder después sube la nota; no hay fecha límite.
- **Lección no dictada pero respondida = no cuenta.** El intento queda
  guardado (no se borra ni se descarta) y empieza a contar el día que el
  docente la marque. Responder por adelantado no penaliza ni premia hasta
  entonces.
- **El intento es por `(user_id, course_slug, lesson_slug)`** (spec-040, D1),
  no por grupo. Un estudiante matriculado en dos grupos del mismo curso tiene
  **un solo intento** por lección, que cuenta en cada grupo donde esa lección
  esté marcada. Las dos matrículas pueden tener notas distintas (spec-040
  escribía la misma nota en ambas).
- Lecciones dictadas con 0 preguntas no suman al denominador y no aparecen en
  el desglose del estudiante (comportamiento actual de
  `buildCourseSummaryFromBreakdown`, que se conserva).

Boceto de la consulta (diseño — el SQL definitivo se escribe en la Fase 1):

```sql
-- self_assessment_breakdown(p_user_id uuid, p_academic_course_id uuid)
-- language sql, stable, security invoker (igual que la versión actual)
select tl.lesson_slug,
       coalesce(a.question_count, <conteo vivo vía lesson_questions>) as question_count,
       coalesce(a.correct_count, 0)                                   as correct_count,
       (a.id is not null)                                             as answered
from taught_lessons tl
join academic_courses ac on ac.id = tl.academic_course_id
left join self_assessment_attempts a
  on a.user_id = p_user_id
 and a.course_slug = ac.course_slug
 and a.lesson_slug = tl.lesson_slug
where tl.academic_course_id = p_academic_course_id
  and ac.course_slug is not null
  and not exists (select 1 from disabled_lessons d          -- BLOQUE 039 (D5)
                   where d.course_slug = ac.course_slug
                     and d.lesson_slug = tl.lesson_slug);
```

Mismo tipo de retorno que hoy (`lesson_slug, question_count, correct_count,
answered`), para que `buildCourseSummaryFromBreakdown` y el servicio de
`students-mcp` no cambien de forma.

### D3 — Nueva firma del breakdown; la vieja se retira después del despliegue

Inventario de callers de `self_assessment_breakdown(uuid, text)`:

| Caller | Pasa a |
|---|---|
| `apply_self_assessment_grade` (SQL) | nueva firma (misma migración) |
| `getSelfAssessmentCourseSummary` (`lib/self-assessment/index.ts:758`) | nueva firma, con el grupo de la matrícula |
| `getSelfAssessmentBreakdownForEnrollment` (`:818`) | nueva firma, con el `academicCourseId` que ya recibe |
| `getServiceStudentSelfAssessmentSummary` (`lib/students/service.ts:610`) | nueva firma |

Después del spec **no queda ningún caller** de la vieja. Aun así **no se
elimina en la misma migración**: `CLAUDE.md` aplica las migraciones en
producción **antes** del merge a `main`, así que durante la ventana entre
`db push` y el deploy de Vercel el código viejo seguiría llamando a la firma
`(uuid, text)` y fallaría. Se conserva intacta (comportamiento viejo, solo la
usa código viejo) y se elimina en una migración posterior al despliegue,
registrada como **DEBT-097**. Postgres admite la sobrecarga sin ambigüedad
porque el segundo parámetro difiere de tipo (`uuid` vs `text`).

`apply_self_assessment_grade(uuid, uuid, text)` **sí** se reemplaza en la misma
migración por `apply_self_assessment_grade(uuid, uuid)`: es interna (sin
`execute` para `authenticated`), solo la llaman las RPC de recálculo, que se
redefinen en la misma migración.

### D4 — Denominador 0: la nota pasa a `null` (corrige el bug latente)

Hoy `apply_self_assessment_grade` hace `return` si `v_questions = 0` **sin
tocar** `student_grades`. Con la regla de spec-040 era casi inalcanzable (el
denominador solo crecía), pero con este spec es el caso normal: desmarcar
todas las lecciones, o el estado justo después de desplegar, dejaría la última
nota calculada intacta — rancia.

Regla nueva:

- `Σ preguntas = 0` y **existe** el ítem `kind = 'self_assessment'` del grupo →
  `update student_grades set score = null` para esa matrícula (si la fila
  existe). No se borra la fila: `null` ya se renderiza como "sin nota".
- `Σ preguntas = 0` y **no existe** el ítem → no se crea (se conserva la
  creación perezosa de spec-040 D5: no aparece una columna vacía).
- `Σ preguntas > 0` → cálculo y `upsert` como hoy.

### D5 — Lección marcada pero cerrada: no cuenta (resuelve DEBT-045)

Si una lección está en `taught_lessons` **y** en `disabled_lessons`, no entra
al denominador.

- **Por qué**: el estudiante no puede abrir una lección cerrada, así que no
  puede responder su autoevaluación. Contarla sería penalizarlo por algo que
  no puede hacer — la misma injusticia que motivó D6 de spec-040.
- **Marcar no abre** la lección ni **abrir la marca** (ver D6): la UI docente
  muestra la combinación "Vista en clase" + "Cerrada" con una advertencia
  explícita: *"Esta lección está cerrada a los estudiantes: no cuenta para la
  nota hasta que la abras."*
- Abrir o cerrar una lección (spec-039, global por `course_slug`) cambia el
  denominador de **todos** los grupos que la tengan marcada. spec-039 no
  dispara recálculo hoy. Este spec **añade** un recálculo de todos los grupos
  con ese `course_slug` tras `set_lesson_availability` (API) y su equivalente
  de UI si existe, porque sin él la regla D5 tendría el mismo problema de nota
  rancia que D4. El costo es acotado (pocos grupos por curso, pocas decenas de
  estudiantes por grupo).
- Filtro aplicado en la consulta, no en TypeScript: así la nota escrita en la
  libreta, el desglose del estudiante y el de `students-mcp` salen de la misma
  fuente.

### D6 — "Vista en clase" y "Abierta" son interruptores independientes

No se acoplan:

- El docente puede **abrir** una lección antes de darla (lectura previa del
  aula invertida, metodología de ambos cursos) sin que cuente todavía.
- Puede **marcarla** como dictada y mantenerla cerrada (raro, pero válido:
  por ejemplo, se dio en clase y se cerró por un error de contenido). D5 la
  excluye y la UI lo advierte.
- El flujo `class-material-prep` abre lecciones cada semana con
  `set_lesson_availability`; marcar como dictada es un paso **distinto y
  posterior** (después de la clase). Se documenta en el system prompt de
  `courses-mcp` y se propone añadirlo a la skill como paso opcional (P4).

### D7 — Disparadores del recálculo

| Evento | Efecto | Dónde |
|---|---|---|
| Marcar una lección como dictada | Sube el denominador de **todo el grupo** (y el numerador de quien ya la respondió) | `set_lesson_taught` / `set_lesson_taught_internal` → recálculo del grupo, misma transacción |
| Desmarcar una lección | Baja numerador y denominador del grupo | ídem |
| Enviar un intento | Sube el numerador (y el denominador si la lección ya estaba marcada) | `submitSelfAssessment` → `recalculate_self_assessment_grade` (sin cambios); recalcula cada matrícula activa del estudiante con ese `course_slug`, cada una contra su grupo |
| Abrir/cerrar una lección (spec-039) | Cambia el denominador de los grupos que la tengan marcada | Nuevo: recálculo de todos los grupos del `course_slug` (D5) |
| Publicar/despublicar/montar preguntas | Cambia el conteo vivo de las lecciones no respondidas | Recálculo masivo manual (botón de spec-040), sin cambios |
| **Ver una lección** | **Ninguno** | Se **elimina** el recálculo de `markLessonViewed` |

`markLessonViewed` conserva el `upsert` con `ignoreDuplicates: true`: sigue
siendo correcto no pisar `viewed_at` en cada render, aunque ya no haya
recálculo detrás.

Marcar es **idempotente**: marcar una lección ya marcada no cambia
`marked_at` ni dispara recálculo (`changed: false`), igual que la semántica de
`meta.changed` de spec-039.

### D8 — RPC de escritura en dos capas (sesión del docente y servicio)

`recalculate_course_self_assessment_grades` valida
`teacher_id = auth.uid() or has_role(auth.uid(), 'admin')`. Con el cliente de
`service_role` de la API (`/api/courses/*`), `auth.uid()` es `null` y la
función **devolvería 0 sin recalcular nada**. Por eso:

```
set_lesson_taught(p_academic_course_id, p_lesson_slug, p_taught)       ← authenticated
   valida dueño/admin con auth.uid()  →  set_lesson_taught_internal(..., auth.uid())

set_lesson_taught_internal(p_academic_course_id, p_lesson_slug,
                           p_taught, p_actor uuid)                    ← solo service_role
   insert ... on conflict do nothing  /  delete
   si hubo cambio → recalculate_course_self_assessment_grades_internal(p_academic_course_id)
   devuelve (changed boolean, recalculated_count int)

recalculate_course_self_assessment_grades(p_academic_course_id)       ← authenticated (sin cambios de firma)
   valida dueño/admin  →  recalculate_course_self_assessment_grades_internal(...)
```

- Mismo patrón que spec-040 con `apply_self_assessment_grade`: lo que recibe
  un identificador de actor o se salta la autorización **no se expone** a
  `authenticated` (`revoke ... from public, anon, authenticated`;
  `grant execute ... to service_role`).
- **Verificación obligatoria tras aplicar la migración** (lección aprendida en
  spec-040, Fase 2): comprobar `has_function_privilege('authenticated', ...,
  'execute') = false` para las tres funciones internas, porque un `GRANT ALL ON
  ALL FUNCTIONS` posterior anula los `revoke`.
- La validación del `lesson_slug` contra el catálogo (existe, es `kind:
  "lesson"`, pertenece al `course_slug` del grupo) ocurre en TypeScript antes
  de invocar la RPC, en la Server Action y en la ruta API. La RPC no puede
  hacerlo (el catálogo no está en Postgres).
- **Desmarcar** no exige que el slug exista en el catálogo: debe poder
  limpiarse una marca huérfana (D9).

### D9 — Marcas huérfanas

Una fila de `taught_lessons` cuyo `lesson_slug` ya no existe en el catálogo
del `course_slug` del grupo (renombre de slug, DEBT-093; o cambio del
`course_slug` del grupo) sigue contando si tiene preguntas montadas en ese
slug viejo.

- La UI de Contenido muestra una sección de advertencia "Marcas sin lección en
  el catálogo" con el slug y un botón **Desmarcar**.
- La API devuelve `meta.orphan_taught_slugs` (espejo de
  `meta.orphan_disabled_slugs` de spec-039) y el `PATCH` con
  `taught: false` acepta un slug huérfano.
- No se filtran en SQL: la base no conoce el catálogo. Se reportan y el
  docente decide.

### D10 — `students-mcp`: resumen por grupo, con atajo inequívoco por `course_slug`

`GET /api/students/[studentId]/self-assessment`:

- `academic_course_id` (preferido): calcula contra ese grupo. `404` si el
  estudiante no tiene matrícula (activa o retirada) en él.
- `course_slug` (compatibilidad con el contrato de spec-040): si el estudiante
  tiene **exactamente una** matrícula activa con ese slug, se resuelve a su
  grupo. Si tiene **varias**, `409` con la lista de
  `{ academic_course_id, name }` para que el agente pregunte. Si no tiene
  ninguna, `404`.
- Ambos a la vez → `422`. Ninguno → `422`.
- La respuesta gana `academic_course_id` y, por lección, `is_taught` implícito
  (todas las del desglose lo son) — no se añade un campo redundante.

### D11 — Mensajes al estudiante

Tarjeta "Autoevaluaciones" (`SelfAssessmentSummaryCard`):

- Regla, reemplazando "Se cuentan las lecciones que ya abriste…":
  > "Cuentan las lecciones que tu docente ya marcó como vistas en clase. Si aún
  > no respondiste la autoevaluación de una de ellas, cuenta como 0, pero
  > todavía puedes responderla y tu nota se actualizará."
- Fila no respondida: `Sin responder — 0/N` + enlace "Responder" a la lección
  (si está abierta).
- Estado vacío (ninguna lección dictada con preguntas): *"Tu docente aún no ha
  marcado lecciones como vistas en clase. Tu nota de autoevaluaciones
  aparecerá cuando lo haga."* — nota mostrada como "Sin nota", nunca 0.00.

`SelfAssessmentSection` (encabezado de la autoevaluación en la lección): el
aviso "hace parte de tu nota del curso" sigue siendo cierto. Se propone
añadir, solo si la lección **no** está marcada en ninguno de los grupos activos
del estudiante, una línea sutil: *"Contará para tu nota cuando tu docente
marque esta lección como vista en clase."* Es opcional y de bajo costo; si
complica la carga de la lección se omite (no afecta la regla).

### D12 — UI docente: pestaña "Contenido"

En `/admin/courses/[academicCourseId]/contenido`, protegida por el layout
existente (`requireAnyRole(["teacher","admin"])` + `getAcademicCourseById`):

- Si el grupo no tiene `course_slug`: estado vacío "Este curso no tiene
  contenido asociado" con enlace a editar el curso.
- Tabla (Flowbite `Table`, tokens semánticos de `DESIGN.md`, modo
  claro/oscuro) con una fila por lección `kind: "lesson"` del catálogo, en
  orden:

| Columna | Contenido |
|---|---|
| # | `order` |
| Lección | título; slug en texto sutil |
| Estado | badge "Abierta" (éxito) / "Cerrada" (advertencia) — de `disabled_lessons` |
| Preguntas | nº de preguntas `multiple_choice` publicadas montadas (conteo vivo); "Sin autoevaluación" si 0 |
| Vista en clase | `Toggle` de Flowbite (o checkbox) con `aria-label="Marcar <título> como vista en clase"`; debajo, "Marcada el <fecha>" |

- Cabecera de resumen: *"N lecciones marcadas · M cuentan para la nota"*
  (M excluye cerradas y sin preguntas).
- Advertencia inline en filas marcadas + cerradas (D5) y en filas marcadas sin
  preguntas ("no suma a la nota").
- Al cambiar el interruptor: estado optimista deshabilitado mientras corre la
  Server Action; al terminar, aviso no intrusivo *"Se recalcularon las notas
  de N estudiantes"*; ante error, revertir el interruptor y mostrar el mensaje.
  Sin `window.confirm` (DEBT-018). **Desmarcar** pide confirmación inline
  porque baja o cambia notas visibles: *"Al desmarcarla, deja de contar para
  la nota de los N estudiantes del grupo."*
- Sección de marcas huérfanas (D9) solo si existen.
- Ayuda bajo la tabla: "Marcar una lección no la abre a los estudiantes;
  ábrela o ciérrala desde courses-mcp" (spec-039 no tiene UI propia).

## Evaluación MCP

> Diseño hecho con los criterios de `.claude/agents/mcp-builder.md` (modo
> evaluación/diseño).

**¿Aplica MCP?** **Sí.**

| Pregunta | Respuesta |
|---|---|
| ¿Expone datos que un agente podría consultar? | **Sí.** "¿Qué lecciones lleva marcadas el grupo 2?", "¿cuántas cuentan para la nota?" |
| ¿Permite acciones que un agente debería ejecutar? | **Sí.** Marcar/desmarcar lecciones dictadas: el flujo `class-material-prep` ya opera semana a semana con `courses-mcp`, y el paso de despliegue de este spec exige marcar en bloque las lecciones ya dictadas de cada grupo |
| ¿Existe un MCP de dominio relacionado? | **Sí, `courses-mcp`** (catálogo y disponibilidad de lecciones, `COURSES_ADMIN_API_KEY`). Se extiende; no se crea uno nuevo. Y **`students-mcp`**, cuya lectura `get_student_self_assessment_summary` cambia de regla |
| ¿Hay un agente que se beneficie? | **Sí**: `courses-agent.system-prompt.md` (nuevas capacidades) y `students-agent.system-prompt.md` (la regla que describe deja de ser cierta) |

**Decisión:** extender `courses-mcp` (3 herramientas nuevas) y ajustar
`students-mcp` (1 herramienta modificada, retrocompatible).

### Herramientas propuestas — `courses-mcp`

| Herramienta | Tipo | Input | Output |
|---|---|---|---|
| `list_course_groups` | lectura | `course_slug` (string, requerido) | `data.groups[]`: `{ academic_course_id, name, code, is_active, active_student_count }`; `404` si el curso no está en el catálogo |
| `list_taught_lessons` | lectura | `course_slug`, `academic_course_id` (uuid) — ambos requeridos | `data.lessons[]` (solo `kind: "lesson"`): `{ lesson_slug, title, order, is_taught, taught_at, is_disabled, question_count, counts_for_grade }`; `meta`: `{ taught_count, counted_count, orphan_taught_slugs[] }`. `404` si el grupo no existe o su `course_slug` no coincide |
| `set_lesson_taught` | escritura | `course_slug`, `academic_course_id`, `lesson_slug`, `taught` (boolean, **sin default**) | la lección con su estado resultante; `meta`: `{ changed, recalculated_count, warning? }` (`warning: "lesson_disabled"` si quedó marcada pero cerrada). `404` slug inexistente al marcar; `422` si es guía o `taught` falta/no es booleano |

Rutas API (todas con `COURSES_ADMIN_API_KEY`, cliente `service_role`):

- `GET /api/courses/[courseSlug]/groups`
- `GET /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons`
- `PATCH /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons/[lessonSlug]`
  con cuerpo `{ "taught": boolean }` → `set_lesson_taught_internal(..., p_actor = null)`

Por qué se piden `course_slug` **y** `academic_course_id`: el agente razona en
slugs (es como habla el docente y como trabaja `class-material-prep`) y el
`course_slug` permite validar el slug de lección contra el catálogo antes de
tocar Supabase; el `academic_course_id` fija el grupo. Una discrepancia entre
ambos es un `404` explícito, no una escritura en el grupo equivocado. Se
anidan bajo `/[courseSlug]/` para reutilizar la validación de catálogo y
evitar un segmento estático que compita con `[courseSlug]`.

`set_lesson_availability` (existente) no cambia de contrato; su respuesta
gana `meta.recalculated_groups` por el recálculo de D5.

### Herramienta modificada — `students-mcp`

| Herramienta | Cambio |
|---|---|
| `get_student_self_assessment_summary` | Nuevo input opcional `academic_course_id`; `course_slug` pasa a opcional. Exactamente uno de los dos. Con `course_slug` ambiguo (varios grupos activos) → `409` con la lista de grupos (D10). Descripción: "calculada sobre las lecciones que el docente marcó como vistas en clase en ese grupo" |

### System prompts afectados

- `docs/mcps/courses-agent.system-prompt.md`:
  - Rol ampliado: además de abrir/cerrar (global), registra qué lecciones se
    dieron en clase **en cada grupo**.
  - Restricción nueva: **marcar/desmarcar cambia de inmediato la nota de
    autoevaluaciones de todo el grupo**; confirmar con el docente nombrando
    grupo, lección y dirección, igual que con la disponibilidad.
  - Contraste explícito de alcances: `set_lesson_availability` = todos los
    grupos del curso; `set_lesson_taught` = un solo grupo.
  - Marcar no abre la lección; advertir si `meta.warning = "lesson_disabled"`.
  - Llamar a `list_course_groups` y `list_taught_lessons` antes de escribir;
    no inventar `academic_course_id`.
  - Flujo de despliegue de spec-060 (marcar en bloque las lecciones ya
    dictadas, repasando la lista con el docente ítem por ítem).
- `docs/mcps/students-agent.system-prompt.md`: la capacidad "incluyendo qué
  lecciones abrió y no respondió" pasa a "qué lecciones dictadas en su grupo no
  ha respondido"; instrucción de preferir `academic_course_id` y de preguntar
  ante un `409`.
- `docs/mcps/README.md`: entradas de `courses-mcp` y `students-mcp`.

### Para `@tester`

Casos `TC-MCP-060-01` a `TC-MCP-060-07` en
`docs/testing/test-060-autoevaluacion-por-lecciones-dictadas.md`.

## Fases de implementación

### Fase 0 — Diagnóstico previo (solo lectura)
- [ ] En **producción** (consulta de solo lectura, con autorización explícita
      del usuario): por grupo activo, nº de estudiantes, nota actual de
      autoevaluaciones y lecciones con `lesson_progress`, para poder comparar
      antes/después del paso de despliegue.
- [ ] Inventariar los grupos activos y sus `course_slug` (lista con la que el
      docente marcará lecciones en la Fase 7).
- [ ] Confirmar con el usuario las respuestas a P1–P4.

### Fase 1 — Esquema
- [ ] Migración `..._init_taught_lessons.sql` (tabla, comentario) — timestamp
      `20261020*` o posterior; ajustar si colisiona con spec-059
- [ ] Migración `..._rls_taught_lessons.sql`: RLS habilitado, solo política de
      `select` (D1)
- [ ] Migración `..._self_assessment_by_taught_lessons.sql`:
      - nueva `self_assessment_breakdown(uuid, uuid)` (D2, D5)
      - `drop` de `apply_self_assessment_grade(uuid, uuid, text)` y nueva
        `apply_self_assessment_grade(uuid, uuid)` con la regla de D4
      - `recalculate_self_assessment_grade(text)` y
        `recalculate_course_self_assessment_grades(uuid)` redefinidas sobre la
        nueva `apply`
      - nuevas `recalculate_course_self_assessment_grades_internal`,
        `set_lesson_taught`, `set_lesson_taught_internal` (D8)
      - `revoke`/`grant` explícitos
      - **sin** tocar `self_assessment_breakdown(uuid, text)` (D3)
- [ ] `supabase db push --db-url "$DEV_DB_URL" --dry-run` → mostrar salida al
      usuario → aplicar en `nodo-dev`
- [ ] Verificar `has_function_privilege` de las tres funciones internas (D8)
- [ ] Verificar los casos SQL de "Pruebas automáticas" con datos desechables
      en `nodo-dev`

### Fase 2 — Backend
- [ ] `markLessonViewed`: quitar el recálculo
- [ ] `lib/courses/taught-lessons.ts`: listado del grupo + Server Action
      `setLessonTaught` (validación de catálogo, `kind: "lesson"`,
      `revalidatePath` de contenido, libreta y `/cuenta/cursos`)
- [ ] `getSelfAssessmentCourseSummary(enrollmentId)` y
      `getSelfAssessmentBreakdownForEnrollment` sobre la nueva firma
- [ ] `lib/grades/overview.ts` y `app/cuenta/cursos/[enrollmentId]/page.tsx`
      por matrícula
- [ ] Recálculo de grupos del `course_slug` tras `setServiceLessonAvailability`
      (D5)

### Fase 3 — UI docente
- [ ] Pestaña "Contenido" en `CourseTabs`
- [ ] Página de contenido + `TaughtLessonsTable` (D12)
- [ ] Texto de ayuda de `RecalculateSelfAssessmentButton`

### Fase 4 — UI del estudiante
- [ ] `SelfAssessmentSummaryCard`: regla, "Sin responder — 0/N", enlace
      "Responder", estado vacío (D11)
- [ ] (Opcional) línea en `SelfAssessmentSection` para lecciones no marcadas

### Fase 5 — API
- [ ] `GET /api/courses/[courseSlug]/groups`
- [ ] `GET` y `PATCH` de `taught-lessons` (D8, D9)
- [ ] `GET /api/students/[studentId]/self-assessment` con `academic_course_id`
      y atajo `course_slug` (D10)
- [ ] Verificación por HTTP: `401` sin clave, `500` sin variable, `404` grupo
      ajeno al curso, `422` guía, `409` ambigüedad

### Fase 6 — MCP: actualizar `courses-mcp` y `students-mcp`
- [ ] Agregar `list_course_groups`, `list_taught_lessons`, `set_lesson_taught`
      a `mcp-servers/courses-mcp/src/tools.ts` (`taught` reenviado sin
      default, como `enabled`)
- [ ] Ajustar `get_student_self_assessment_summary` en
      `mcp-servers/students-mcp/src/tools.ts`
- [ ] Actualizar `docs/mcps/README.md`
- [ ] Actualizar `docs/mcps/courses-agent.system-prompt.md` y
      `docs/mcps/students-agent.system-prompt.md`
- [ ] Compilar y verificar de forma aislada
      (`./mcp-servers/run-local-mcp.sh courses-mcp </dev/null`, ídem
      `students-mcp`)

### Fase 7 — Despliegue y marcado inicial (operativo)
> Al desplegar, **ninguna lección está marcada en ningún grupo**. Las notas
> existentes en `student_grades` no cambian solas (la migración no recalcula),
> pero el primer envío de autoevaluación de cada estudiante la pasaría a
> `null` (D4). Por eso el marcado inicial debe ocurrir **inmediatamente**
> después del deploy, idealmente fuera del horario de clase.
- [ ] Comunicar a los estudiantes el cambio de regla **antes** del deploy
      (su nota puede bajar: las lecciones dictadas que no abrieron empiezan a
      contar como 0)
- [ ] Migraciones en producción (dry-run + confirmación explícita del usuario)
- [ ] Deploy del código
- [ ] Por cada grupo activo: el docente (vía `courses-mcp-prod` o la pestaña
      Contenido) marca las lecciones ya dictadas, repasando la lista ítem por
      ítem; cada marca recalcula el grupo
- [ ] Revisar las notas de un grupo contra el diagnóstico de la Fase 0 antes
      de seguir con el resto
- [ ] Tras confirmar el deploy: migración de limpieza de DEBT-097 (en otro
      ciclo)

### Fase 8 — Pruebas
- [ ] Ejecutar `docs/testing/test-060-autoevaluacion-por-lecciones-dictadas.md`
      con el usuario
- [ ] Invocar `@tester` para las pruebas automáticas (cuando exista framework)

## Criterios de aceptación

1. Abrir una lección como estudiante **no** cambia su nota de
   autoevaluaciones (no se dispara recálculo desde `markLessonViewed`).
2. Con 3 lecciones marcadas de 5 preguntas cada una y 12 correctas en total,
   la nota del estudiante es **4.00**, haya abierto o no las lecciones.
3. Una lección marcada que el estudiante **no respondió** cuenta 0/N; al
   responderla con 4/5, la nota sube sin acción del docente.
4. Una lección **respondida pero no marcada** no cuenta; al marcarla, entra
   con el resultado del intento ya guardado.
5. **Desmarcar** una lección baja el denominador de todo el grupo y la nota se
   recalcula en el mismo acto (sin pulsar "Recalcular").
6. Desmarcar **todas** las lecciones deja la nota en **`null`** ("Sin nota"),
   no en el último valor ni en 0.00.
7. Una lección marcada y **cerrada** (spec-039) no cuenta; la UI docente lo
   advierte; al abrirla, empieza a contar sin otra acción.
8. Marcar una lección en el **grupo A** no cambia ninguna nota del **grupo
   B** del mismo curso.
9. Un estudiante matriculado en A y B con el mismo intento puede tener notas
   distintas en cada grupo.
10. Publicar una pregunta nueva en una lección marcada y ya respondida no
    cambia la nota de quien la respondió (D6 de spec-040 preservado).
11. Un docente que no es dueño del grupo no puede marcar ni desmarcar
    (`set_lesson_taught` lo rechaza) y no ve sus marcas; un `insert` directo
    en `taught_lessons` por PostgREST se rechaza para cualquier usuario.
12. Un estudiante ve las marcas solo de los grupos donde está matriculado
    activo.
13. No se puede marcar una guía ni un slug inexistente; sí se puede desmarcar
    un slug huérfano, y la UI/API lo reporta.
14. La tarjeta del estudiante muestra solo lecciones dictadas con preguntas,
    las no respondidas como "Sin responder — 0/N" con aviso de que aún puede
    responderlas, y un estado vacío si no hay ninguna.
15. (MCP) El agente puede listar los grupos de un curso, listar las lecciones
    dictadas de un grupo y marcar/desmarcar una lección, obteniendo
    `meta.changed` y `meta.recalculated_count`.
16. (MCP) `get_student_self_assessment_summary` con `academic_course_id`
    devuelve el desglose de ese grupo; con un `course_slug` ambiguo responde
    `409` con la lista de grupos.
17. Las funciones internas (`apply_self_assessment_grade`,
    `recalculate_course_self_assessment_grades_internal`,
    `set_lesson_taught_internal`) no son ejecutables por `authenticated`.

## Riesgos y deuda derivada

- **Bajada de notas al desplegar.** Estudiantes que no abrieron lecciones ya
  dictadas verán 0/N en ellas. Es el efecto buscado, pero debe comunicarse
  antes (Fase 7).
- **Ventana de despliegue.** Entre el deploy y el marcado inicial, un envío de
  autoevaluación pone la nota de ese estudiante en `null`. Mitigación:
  marcado inmediato tras el deploy, fuera de horario de clase.
- **Olvido del docente.** Si no marca una lección dictada, no cuenta. Es
  visible (cabecera "N marcadas" en Contenido y la tarjeta del estudiante),
  pero no hay recordatorio automático (ver P1).
- **Costo del recálculo.** Cada marca recalcula el grupo entero, y abrir/cerrar
  una lección recalcula todos los grupos del curso. Con los tamaños actuales
  (decenas de estudiantes) es despreciable; si crece, reevaluar.
- **DEBT-097**: eliminar `self_assessment_breakdown(uuid, text)` tras el
  despliegue (D3).
- **DEBT-093** sigue abierta en su parte de `lesson_questions` (este spec solo
  la mitiga, D9).

## Preguntas abiertas para el usuario

- **P1 — Backfill sugerido.** ¿Conviene que la pestaña Contenido (o
  `list_taught_lessons`) **sugiera** marcar las lecciones abiertas cuya fecha
  en el cronograma del microdiseño ya pasó? El cronograma vive en
  `content/cursos/<curso>/microdiseno/` como Markdown sin formato de fecha
  estable, así que parsearlo es frágil. Propuesta: **no** en este spec;
  marcado manual vía MCP en la Fase 7.
- **P2 — Copia opcional en la lección (D11).** ¿Mostrar en la autoevaluación
  de una lección no marcada "Contará para tu nota cuando tu docente marque
  esta lección como vista en clase"?
- **P3 — Marcado en lote.** ¿Hace falta una herramienta
  `set_lessons_taught` (lista de slugs, un solo recálculo) para el marcado
  inicial, o basta con llamadas sucesivas a `set_lesson_taught` (un recálculo
  por llamada)? Propuesta: llamadas sucesivas; el volumen es bajo.
- **P4 — `class-material-prep`.** ¿Añadir a la skill un paso opcional
  "marcar como vista en clase" tras la sesión? Implica editar
  `.claude/skills/class-material-prep/SKILL.md`, fuera del alcance actual.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-060-autoevaluacion-por-lecciones-dictadas.md`
  — casos `TC-060-01` a `TC-060-14` y `TC-MCP-060-01` a `TC-MCP-060-07`.
- **Automáticas (e2e/unit):**
  `{{ubicación e2e por definir}}/e2e-060-autoevaluacion-por-lecciones-dictadas.spec.ts`
  — se crea cuando exista framework (ver `CLAUDE.md` → "Testing"). Hasta
  entonces, estos casos se verifican a mano sobre `nodo-dev` en la Fase 1,
  invocando las RPC con datos desechables:

| # | Caso | Esperado |
|---|---|---|
| A1 | Lección marcada, estudiante sin intento | fila `answered=false`, `correct_count=0`, `question_count` = conteo vivo |
| A2 | Lección respondida no marcada | no aparece en el breakdown |
| A3 | Desmarcar una de 3 lecciones | breakdown pasa de 3 a 2 filas; `student_grades.score` recalculado en la misma transacción |
| A4 | Lección marcada + `disabled_lessons` | no aparece; al borrar la fila de `disabled_lessons` y recalcular, aparece |
| A5 | 0 lecciones marcadas con nota previa 4.00 | `student_grades.score = null`; sin ítem previo, no se crea ítem |
| A6 | Marcar en grupo A | `student_grades` de las matrículas del grupo B sin cambios |
| A7 | Estudiante en A y B, lección marcada solo en A | nota en A la incluye; en B no |
| A8 | Pregunta publicada después del intento (D6) | `question_count` congelado para quien respondió; vivo para quien no |
| A9 | `set_lesson_taught` invocado por docente no dueño | error/0 cambios; `taught_lessons` intacta |
| A10 | `insert` directo en `taught_lessons` con JWT de docente dueño | rechazado por RLS |
| A11 | `has_function_privilege('authenticated', <interna>, 'execute')` | `false` para las tres |
| A12 | Marcar dos veces la misma lección | segunda llamada `changed=false`, `marked_at` intacto, sin recálculo |
| A13 | `select` en `taught_lessons` como estudiante de otro grupo | 0 filas |

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
