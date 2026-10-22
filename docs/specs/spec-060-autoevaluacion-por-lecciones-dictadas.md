# spec-060 — [DONE] Nota de autoevaluaciones calculada sobre las lecciones dictadas por el docente

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
9. **Fase MCP**: `courses-mcp` gana herramientas por grupo para listar grupos,
   listar lecciones dictadas y marcar/desmarcar **en lote** (una o varias
   lecciones, atómico, un solo recálculo, D14); `students-mcp` ajusta
   `get_student_self_assessment_summary` al cálculo por grupo.
10. **Plan de despliegue** con el paso operativo de marcar las lecciones ya
    dictadas en cada grupo antes de que la nota se vuelva a mostrar (manual,
    desde la UI o vía `courses-mcp`; sin backfill automático, D13).
11. **Skill `class-material-prep`**: nuevo paso "marcar la lección como vista
    en clase en cada grupo", vía `courses-mcp`, con confirmación del docente
    (D16).

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
- Marcado automático o sugerido a partir del cronograma del microdiseño
  (decisión del usuario, D13).
- Avisos nuevos en la autoevaluación de la lección (`SelfAssessmentSection`)
  sobre si la lección cuenta o no para la nota (decisión del usuario, D15).
- Marcado en lote desde la UI docente: la pestaña Contenido marca lección por
  lección; el lote es una capacidad de la API/MCP (D14).

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
| `set_lessons_taught(uuid, text[], boolean)` | **Nueva** RPC `security definer` para la sesión del docente: valida dueño/admin, marca/desmarca **una o varias** lecciones y recalcula el grupo **una sola vez**, en la misma transacción (D8, D14) |
| `set_lessons_taught_internal(uuid, text[], boolean, uuid)` | **Nueva**, solo `service_role` (la usa `/api/courses/*`) |

### Backend

| Archivo | Cambio |
|---|---|
| `lib/progress/index.ts` | `markLessonViewed`: **eliminar** la llamada a `recalculate_self_assessment_grade` (se conserva el `upsert` con `ignoreDuplicates`) |
| `lib/self-assessment/index.ts` | `getSelfAssessmentCourseSummary` pasa a recibir el **`enrollmentId`** (resuelve `academic_course_id` y `course_slug` de la matrícula propia); `getSelfAssessmentBreakdownForEnrollment` llama a la nueva firma con el `academicCourseId` que ya recibe; `submitSelfAssessment` sin cambios |
| `lib/self-assessment/types.ts` | `SelfAssessmentCourseSummary` gana `taughtLessonCount` (lecciones dictadas que cuentan) para la UI del estudiante; comentario de D4 actualizado |
| `lib/courses/taught-lessons.ts` | **Nuevo** módulo: lectura del listado del grupo (catálogo × `taught_lessons` × `disabled_lessons` × conteo de `lesson_questions`) y Server Action `setLessonTaught(academicCourseId, lessonSlug, taught)` que valida el slug contra el catálogo y llama a `set_lessons_taught` con un arreglo de un elemento (la UI marca lección por lección) |
| `lib/courses/service.ts` | Funciones de servicio para `/api/courses/[courseSlug]/groups/*` (listado de grupos, listado de lecciones dictadas, escritura vía `set_lessons_taught_internal`) |
| `lib/students/service.ts` | `getServiceStudentSelfAssessmentSummary` pasa a recibir `academicCourseId`; resolución desde `course_slug` solo si es inequívoca (D10) |
| `lib/grades/overview.ts` | Llamar al resumen por matrícula, no por `course_slug` |
| `lib/grades/actions.ts` | Sin cambios de firma; la acción sigue llamando al RPC público |

### API

| Ruta | Cambio |
|---|---|
| `GET /api/courses/[courseSlug]/groups` | **Nueva** — grupos (cursos académicos) de ese `course_slug` |
| `GET /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons` | **Nueva** — catálogo de lecciones del grupo con estado dictada/abierta y preguntas |
| `PATCH /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons` | **Nueva** — marcar/desmarcar en lote `{ lesson_slugs: string[], taught: boolean }` (1–50 slugs), atómico, un recálculo (D14) |
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

### MCP

| Archivo | Cambio |
|---|---|
| `mcp-servers/courses-mcp/src/tools.ts` | Tres herramientas nuevas (ver "Evaluación MCP") |
| `mcp-servers/students-mcp/src/tools.ts` | `get_student_self_assessment_summary`: nuevo input `academic_course_id` |
| `docs/mcps/courses-agent.system-prompt.md` | Nuevas capacidades y restricciones (alcance por grupo, efecto en la nota) |
| `docs/mcps/students-agent.system-prompt.md` | Regla de cálculo nueva: "lecciones dictadas del grupo", no "que abrió" |
| `docs/mcps/README.md` | Entradas de `courses-mcp` y `students-mcp` |

### Skills

| Archivo | Cambio |
|---|---|
| `.claude/skills/class-material-prep/SKILL.md` | Nuevo paso **D7 — Marcar como vista en clase** en la Parte 2 (después de la sesión, por grupo, vía `courses-mcp`, con confirmación); diagrama, tabla "qué viaja a producción", frontmatter `description` y restricciones (D16) |
| `CLAUDE.md` (tabla de skills) | **Sin cambios**: la fila de `class-material-prep` ("Producir el material de clase de **un** curso, etapa por etapa, y desplegarlo") sigue siendo exacta; no se agrega ni renombra ninguna skill |

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
| `insert` / `delete` | **nadie** vía RLS; solo las RPC `security definer` | Marcar sin recalcular dejaría la nota del grupo desactualizada. Obligar a escribir por `set_lessons_taught` garantiza que marca y recálculo ocurren en la **misma transacción**. Un `insert` directo por PostgREST con el JWT del docente simplemente se rechaza |
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
  `set_lesson_availability` **antes** de la clase (lectura previa); marcar
  como dictada es un paso **distinto y posterior** (después de la clase). Se
  documenta en el system prompt de `courses-mcp` y en la skill (D16).

### D7 — Disparadores del recálculo

| Evento | Efecto | Dónde |
|---|---|---|
| Marcar una o varias lecciones como dictadas | Sube el denominador de **todo el grupo** (y el numerador de quien ya las respondió) | `set_lessons_taught` / `set_lessons_taught_internal` → **un** recálculo del grupo al final, misma transacción |
| Desmarcar una o varias lecciones | Baja numerador y denominador del grupo | ídem |
| Enviar un intento | Sube el numerador (y el denominador si la lección ya estaba marcada) | `submitSelfAssessment` → `recalculate_self_assessment_grade` (sin cambios); recalcula cada matrícula activa del estudiante con ese `course_slug`, cada una contra su grupo |
| Abrir/cerrar una lección (spec-039) | Cambia el denominador de los grupos que la tengan marcada | Nuevo: recálculo de todos los grupos del `course_slug` (D5) |
| Publicar/despublicar/montar preguntas | Cambia el conteo vivo de las lecciones no respondidas | Recálculo masivo manual (botón de spec-040), sin cambios |
| **Ver una lección** | **Ninguno** | Se **elimina** el recálculo de `markLessonViewed` |

`markLessonViewed` conserva el `upsert` con `ignoreDuplicates: true`: sigue
siendo correcto no pisar `viewed_at` en cada render, aunque ya no haya
recálculo detrás.

Marcar es **idempotente**: marcar una lección ya marcada no cambia
`marked_at` ni dispara recálculo (queda en `unchanged_slugs`), igual que la
semántica de `meta.changed` de spec-039. Si **ninguna** lección del lote
cambió, no hay recálculo (`recalculated_count: 0`).

### D8 — RPC de escritura en dos capas (sesión del docente y servicio)

`recalculate_course_self_assessment_grades` valida
`teacher_id = auth.uid() or has_role(auth.uid(), 'admin')`. Con el cliente de
`service_role` de la API (`/api/courses/*`), `auth.uid()` es `null` y la
función **devolvería 0 sin recalcular nada**. Por eso:

```
set_lessons_taught(p_academic_course_id, p_lesson_slugs text[], p_taught)   ← authenticated
   valida dueño/admin con auth.uid()  →  set_lessons_taught_internal(..., auth.uid())

set_lessons_taught_internal(p_academic_course_id, p_lesson_slugs text[],
                            p_taught, p_actor uuid)                    ← solo service_role
   insert ... on conflict do nothing  /  delete   (todas las del arreglo)
   si cambió al menos una → UN recalculate_course_self_assessment_grades_internal(p_academic_course_id)
   devuelve (changed_slugs text[], unchanged_slugs text[], recalculated_count int)

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

`SelfAssessmentSection` (encabezado de la autoevaluación en la lección) **no
cambia**: el aviso "hace parte de tu nota del curso" sigue siendo cierto y no
se añade ningún aviso sobre si la lección ya fue marcada (D15).

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
- La UI marca **lección por lección** (sin selección múltiple); el lote es
  capacidad de la API/MCP (D14).

### D13 — Sin backfill desde el cronograma (decisión del usuario)

No se sugiere ni se automatiza el marcado a partir de
`microdiseno/cronograma-dia-a-dia.md`. El marcado es siempre una acción
explícita del docente, desde la pestaña Contenido o vía `courses-mcp`. El paso
de despliegue (Fase 7) queda como marcado manual de las lecciones ya
dictadas de cada grupo.

- **Por qué**: el cronograma es Markdown sin formato de fecha estable y a
  menudo no refleja festivos, clases suspendidas ni corrimientos; una
  sugerencia automática equivocada movería notas reales.

### D14 — Marcado en lote: `set_lessons_taught` reemplaza a la herramienta individual (decisión del usuario)

`courses-mcp` expone **una sola** herramienta de escritura,
`set_lessons_taught(course_slug, academic_course_id, lesson_slugs[], taught)`,
que cubre tanto una lección como varias. **No** se conserva una
`set_lesson_taught` individual.

- **Por qué reemplazar y no conservar las dos**: una lista de un elemento
  *es* el caso individual, con el mismo contrato y la misma respuesta. Dos
  herramientas de escritura para la misma acción duplican validación,
  pruebas y descripción en el system prompt, y obligan al agente a elegir
  entre ambas sin ganancia. Un único camino de escritura también significa una
  única RPC (`set_lessons_taught_internal`, que ya recibe un arreglo), que es
  la que usa la Server Action de la UI con un arreglo de un elemento.
- **Atómica — todo o nada**: antes de tocar Supabase, la ruta valida **todos**
  los slugs contra el catálogo del `course_slug`. Con `taught: true`, cada slug
  debe existir y ser `kind: "lesson"`. Con `taught: false`, cada slug debe
  existir como lección del catálogo **o** ser una marca huérfana del grupo
  (D9). Si alguno falla, responde `422` con `error.details.invalid_slugs[]` (`lesson_slug` +
  motivo: `not_found` / `is_guide`) y **no escribe nada**. La RPC además
  corre en una sola transacción.
- **Un solo recálculo** del grupo al final, solo si cambió al menos una
  lección.
- **Validaciones del cuerpo**: `lesson_slugs` no vacío, máximo 50 (el
  catálogo más largo tiene menos), sin duplicados (`422`: un duplicado indica
  un error del agente al armar la lista, mejor saberlo); `taught` booleano
  explícito, **sin default** (mismo criterio que `enabled` en spec-039).
- **Respuesta**: `data.lessons[]` con el estado resultante de cada slug
  pedido (misma forma que `list_taught_lessons`); `meta`:
  `{ changed_slugs[], unchanged_slugs[], recalculated_count, warnings[] }`,
  con `warnings` = `{ lesson_slug, code: "lesson_disabled" }` por cada
  lección que quedó marcada pero está cerrada.
- **Ruta**: `PATCH /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons`
  (la colección), sin segmento por lección.

### D15 — Sin aviso nuevo en la autoevaluación de la lección (decisión del usuario)

`SelfAssessmentSection` no se modifica. El estudiante consulta qué lecciones
cuentan en su tarjeta "Autoevaluaciones" (D11).

### D16 — `class-material-prep` gana el paso "marcar como vista en clase" (decisión del usuario)

Se añade a `.claude/skills/class-material-prep/SKILL.md` un paso nuevo en la
**Parte 2** (la que toca producción), **D7 — Marcar la lección como vista en
clase**, posterior a D6 "Cierre" del despliegue e invocable por sí solo (los
pasos D0–D6 no se renumeran):

- **Cuándo**: **después** de la sesión en que se dictó la lección, no al
  desplegarla ni al abrirla (D4 de la skill). En el aula invertida la lección
  se abre antes de la clase como lectura previa; si se marcara al abrir,
  contaría como 0 para quien todavía no la leyó, antes de que se dictara.
  Es invocable por sí solo ("marca como vista la clase del martes de
  estructuras-de-datos"), igual que el despliegue.
- **Por grupo**: `list_course_groups` → elegir el grupo (o grupos) donde se
  dictó → `list_taught_lessons` para confirmar slugs y estado →
  `set_lessons_taught` con `taught: true`. Un curso con varios grupos se
  marca grupo por grupo, porque pueden ir a ritmos distintos.
- **Confirmación**: ⛔ requiere confirmación explícita del docente en esa
  misma sesión, nombrando grupo, lecciones y dirección, y advirtiendo que
  **cambia de inmediato la nota de autoevaluaciones del grupo**. En
  producción con `courses-mcp-prod`.
- **Verificación**: reportar `changed_slugs`, `recalculated_count` y cualquier
  `warning: lesson_disabled` (lección marcada pero cerrada: no cuenta hasta
  abrirla).
- **Otros puntos de la skill a actualizar**: el diagrama de etapas, la tabla
  "Tres cosas viajan a producción" (añadir "Lecciones dictadas por grupo →
  `courses-mcp-prod` → `set_lessons_taught`, después de la clase"), el
  `description` del frontmatter (añadir el disparador "marca la clase como
  vista") y las Restricciones (no marcar al abrir; no marcar sin
  confirmación; no marcar en grupos que no dictaron la sesión). La bitácora
  de la semana (`docs/preparacion-semanal/semana-NN.md`) registra qué se
  marcó, en qué grupo y cuándo.
- **Tabla de skills de `CLAUDE.md`**: verificada, no cambia (ver "Impacto →
  Skills").

## Evaluación MCP

> Diseño hecho con los criterios de `.claude/agents/mcp-builder.md` (modo
> evaluación/diseño).

**¿Aplica MCP?** **Sí.**

| Pregunta | Respuesta |
|---|---|
| ¿Expone datos que un agente podría consultar? | **Sí.** "¿Qué lecciones lleva marcadas el grupo 2?", "¿cuántas cuentan para la nota?" |
| ¿Permite acciones que un agente debería ejecutar? | **Sí.** Marcar/desmarcar lecciones dictadas: el flujo `class-material-prep` operará este paso semana a semana con `courses-mcp` (D16), y el paso de despliegue de este spec exige marcar en lote las lecciones ya dictadas de cada grupo (D14) |
| ¿Existe un MCP de dominio relacionado? | **Sí, `courses-mcp`** (catálogo y disponibilidad de lecciones, `COURSES_ADMIN_API_KEY`). Se extiende; no se crea uno nuevo. Y **`students-mcp`**, cuya lectura `get_student_self_assessment_summary` cambia de regla |
| ¿Hay un agente que se beneficie? | **Sí**: `courses-agent.system-prompt.md` (nuevas capacidades) y `students-agent.system-prompt.md` (la regla que describe deja de ser cierta) |

**Decisión:** extender `courses-mcp` (3 herramientas nuevas) y ajustar
`students-mcp` (1 herramienta modificada, retrocompatible).

### Herramientas propuestas — `courses-mcp`

| Herramienta | Tipo | Input | Output |
|---|---|---|---|
| `list_course_groups` | lectura | `course_slug` (string, requerido) | `data.groups[]`: `{ academic_course_id, name, code, is_active, active_student_count }`; `404` si el curso no está en el catálogo |
| `list_taught_lessons` | lectura | `course_slug`, `academic_course_id` (uuid) — ambos requeridos | `data.lessons[]` (solo `kind: "lesson"`): `{ lesson_slug, title, order, is_taught, taught_at, is_disabled, question_count, counts_for_grade }`; `meta`: `{ taught_count, counted_count, orphan_taught_slugs[] }`. `404` si el grupo no existe o su `course_slug` no coincide |
| `set_lessons_taught` | escritura (lote, atómica) | `course_slug`, `academic_course_id`, `lesson_slugs` (array de string, 1–50, sin duplicados), `taught` (boolean, **sin default**) | `data.lessons[]` con el estado resultante; `meta`: `{ changed_slugs[], unchanged_slugs[], recalculated_count, warnings[] }`. `422` con `error.details.invalid_slugs[]` (`{ lesson_slug, reason }`, con `reason` `not_found` / `is_guide`) si algún slug no es válido — **no escribe nada**; `422` si `taught` falta o el arreglo está vacío/duplicado; `404` si el grupo no existe o no pertenece al `course_slug` (D14) |

Rutas API (todas con `COURSES_ADMIN_API_KEY`, cliente `service_role`):

- `GET /api/courses/[courseSlug]/groups`
- `GET /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons`
- `PATCH /api/courses/[courseSlug]/groups/[academicCourseId]/taught-lessons`
  con cuerpo `{ "lesson_slugs": string[], "taught": boolean }` →
  `set_lessons_taught_internal(..., p_actor = null)`

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
    grupos del curso; `set_lessons_taught` = un solo grupo.
  - Marcar no abre la lección; advertir si `meta.warning = "lesson_disabled"`.
  - Llamar a `list_course_groups` y `list_taught_lessons` antes de escribir;
    no inventar `academic_course_id`.
  - Flujo de despliegue de spec-060 (marcar en lote las lecciones ya
    dictadas de cada grupo, repasando la lista con el docente antes de la
    única llamada) y paso semanal de `class-material-prep` (marcar después
    de la clase, no al abrir).
  - El lote es todo o nada: ante un `422` con `invalid_slugs`, corregir la
    lista con el docente y reintentar; nada quedó escrito.
- `docs/mcps/students-agent.system-prompt.md`: la capacidad "incluyendo qué
  lecciones abrió y no respondió" pasa a "qué lecciones dictadas en su grupo no
  ha respondido"; instrucción de preferir `academic_course_id` y de preguntar
  ante un `409`.
- `docs/mcps/README.md`: entradas de `courses-mcp` y `students-mcp`.

### Para `@tester`

Casos `TC-MCP-060-01` a `TC-MCP-060-09` en
`docs/testing/test-060-autoevaluacion-por-lecciones-dictadas.md`.

## Fases de implementación

### Fase 0 — Diagnóstico previo (solo lectura)
- [ ] En **producción** (consulta de solo lectura, con autorización explícita
      del usuario): por grupo activo, nº de estudiantes, nota actual de
      autoevaluaciones y lecciones con `lesson_progress`, para poder comparar
      antes/después del paso de despliegue.
- [ ] Inventariar los grupos activos y sus `course_slug` (lista con la que el
      docente marcará lecciones en la Fase 7).

### Fase 1 — Esquema
- [x] Migración `..._init_taught_lessons.sql` (tabla, comentario) — timestamp
      `20261020*` o posterior; ajustar si colisiona con spec-059
- [x] Migración `..._rls_taught_lessons.sql`: RLS habilitado, solo política de
      `select` (D1)
- [x] Migración `..._self_assessment_by_taught_lessons.sql`:
      - nueva `self_assessment_breakdown(uuid, uuid)` (D2, D5)
      - `drop` de `apply_self_assessment_grade(uuid, uuid, text)` y nueva
        `apply_self_assessment_grade(uuid, uuid)` con la regla de D4
      - `recalculate_self_assessment_grade(text)` y
        `recalculate_course_self_assessment_grades(uuid)` redefinidas sobre la
        nueva `apply`
      - nuevas `recalculate_course_self_assessment_grades_internal`,
        `set_lessons_taught`, `set_lessons_taught_internal` (D8)
      - `revoke`/`grant` explícitos
      - **sin** tocar `self_assessment_breakdown(uuid, text)` (D3)
- [x] Migraciones aplicadas en `nodo-dev` (evidencia: las funciones nuevas
      responden en los casos A8–A15 y en la ronda manual). **No quedó registrado
      el `--dry-run` previo** (no se guardó su salida): sigue pendiente para
      producción, donde sí es obligatorio (Fase 7).
- [x] Privilegios de las tres funciones internas (D8), verificados por
      comportamiento el 2026-10-22: `authenticated` y `anon` reciben `42501`
      al invocar `apply_self_assessment_grade(uuid, uuid)`,
      `recalculate_course_self_assessment_grades_internal(uuid)` y
      `set_lessons_taught_internal(uuid, text[], boolean, uuid)`; `service_role`
      sí ejecuta. Nota: no se consultó `has_function_privilege` literalmente (no
      hay acceso SQL directo desde la sesión); repetirlo en producción tras el
      `db push`.
- [x] Casos SQL de "Pruebas asociadas" (ver "Evidencia de los casos SQL")

### Fase 2 — Backend
- [x] `markLessonViewed`: quitar el recálculo
- [x] `lib/courses/taught-lessons.ts`: listado del grupo + Server Action
      `setLessonTaught` (validación de catálogo, `kind: "lesson"`,
      `revalidatePath` de contenido, libreta y `/cuenta/cursos`)
- [x] `getSelfAssessmentCourseSummary(enrollmentId)` y
      `getSelfAssessmentBreakdownForEnrollment` sobre la nueva firma
- [x] `lib/grades/overview.ts` y `app/cuenta/cursos/[enrollmentId]/page.tsx`
      por matrícula
- [x] Recálculo de grupos del `course_slug` tras `setServiceLessonAvailability`
      (D5)

### Fase 3 — UI docente
- [x] Pestaña "Contenido" en `CourseTabs`
- [x] Página de contenido + `TaughtLessonsTable` (D12)
- [x] Texto de ayuda de `RecalculateSelfAssessmentButton`

### Fase 4 — UI del estudiante
- [x] `SelfAssessmentSummaryCard`: regla, "Sin responder — 0/N", enlace
      "Responder", estado vacío (D11)

### Fase 5 — API
- [x] `GET /api/courses/[courseSlug]/groups`
- [x] `GET` y `PATCH` (lote) de `taught-lessons` (D8, D9, D14)
- [x] `GET /api/students/[studentId]/self-assessment` con `academic_course_id`
      y atajo `course_slug` (D10)
- [x] Verificación por HTTP (2026-10-22, `nodo-dev`): `401` sin clave o con clave
      incorrecta, `404` grupo ajeno al curso, `422` guía / slug inexistente /
      duplicados / lista vacía / `taught` ausente en el lote sin escritura
      parcial, `409` ambigüedad. **Sin evidencia:** `500` sin variable de
      entorno (no se probó apagando `COURSES_ADMIN_API_KEY`)

### Fase 6 — MCP: actualizar `courses-mcp` y `students-mcp`
- [x] Agregar `list_course_groups`, `list_taught_lessons` y
      `set_lessons_taught` (lote) a `mcp-servers/courses-mcp/src/tools.ts`
      (`taught` y `lesson_slugs` reenviados sin default, como `enabled`)
- [x] Ajustar `get_student_self_assessment_summary` en
      `mcp-servers/students-mcp/src/tools.ts`
- [x] Actualizar `docs/mcps/README.md`
- [x] Actualizar `docs/mcps/courses-agent.system-prompt.md` y
      `docs/mcps/students-agent.system-prompt.md`
- [x] Compilar y verificar de forma aislada
      (`./mcp-servers/run-local-mcp.sh courses-mcp </dev/null`, ídem
      `students-mcp`)

### Fase 7 — Despliegue y marcado inicial (operativo)
> Entre el `db push` y el deploy, abrir una lección ya puede poner en `null` la
> nota de ese estudiante (ver "Riesgos → Ventana migración → deploy"): hacer
> los tres pasos seguidos.
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
- [ ] Por cada grupo activo: el docente marca las lecciones ya dictadas
      (manual, sin backfill, D13) — preferentemente con **una** llamada a
      `set_lessons_taught` de `courses-mcp-prod` por grupo, tras repasar la
      lista con él (un solo recálculo por grupo), o desde la pestaña
      Contenido
- [ ] Revisar las notas de un grupo contra el diagnóstico de la Fase 0 antes
      de seguir con el resto
- [ ] Tras confirmar el deploy: migración de limpieza de DEBT-097 (en otro
      ciclo)

### Fase 8 — Skill `class-material-prep` (D16)
- [x] Leer completa `.claude/skills/class-material-prep/SKILL.md` y añadir
      el paso "Marcar la lección como vista en clase" en la Parte 2, con
      parada ⛔ de confirmación, alcance por grupo y uso de `courses-mcp`
- [x] Actualizar diagrama, tabla de "qué viaja a producción",
      `description` del frontmatter y Restricciones
- [x] Confirmar que la tabla de skills de `CLAUDE.md` no requiere cambios
      (solo cambia el contenido de una skill existente)

### Fase 9 — Pruebas
- [x] Ejecutar `docs/testing/test-060-autoevaluacion-por-lecciones-dictadas.md`
      con el usuario (2026-10-22: 23/23 aprobados, casos adaptados al
      catálogo de `nodo-dev`)
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
    (`set_lessons_taught` lo rechaza) y no ve sus marcas; un `insert` directo
    en `taught_lessons` por PostgREST se rechaza para cualquier usuario.
12. Un estudiante ve las marcas solo de los grupos donde está matriculado
    activo.
13. No se puede marcar una guía ni un slug inexistente; sí se puede desmarcar
    un slug huérfano, y la UI/API lo reporta.
14. La tarjeta del estudiante muestra solo lecciones dictadas con preguntas,
    las no respondidas como "Sin responder — 0/N" con aviso de que aún puede
    responderlas, y un estado vacío si no hay ninguna.
15. (MCP) El agente puede listar los grupos de un curso, listar las lecciones
    dictadas de un grupo y marcar/desmarcar una o varias lecciones en una
    sola llamada, obteniendo `changed_slugs`, `unchanged_slugs` y
    `recalculated_count`; el lote produce **un** recálculo del grupo.
16. (MCP) Un lote con algún slug inexistente o de guía responde `422` con
    `invalid_slugs` y no marca **ninguna** lección.
17. (MCP) `get_student_self_assessment_summary` con `academic_course_id`
    devuelve el desglose de ese grupo; con un `course_slug` ambiguo responde
    `409` con la lista de grupos.
18. Las funciones internas (`apply_self_assessment_grade`,
    `recalculate_course_self_assessment_grades_internal`,
    `set_lessons_taught_internal`) no son ejecutables por `authenticated`.
19. La skill `class-material-prep` describe el paso de marcar la lección como
    vista en clase, después de la sesión, por grupo, vía `courses-mcp` y con
    confirmación del docente.

## Riesgos y deuda derivada

- **Bajada de notas al desplegar.** Estudiantes que no abrieron lecciones ya
  dictadas verán 0/N en ellas. Es el efecto buscado, pero debe comunicarse
  antes (Fase 7).
- **Ventana de despliegue.** Entre el deploy y el marcado inicial, un envío de
  autoevaluación pone la nota de ese estudiante en `null`. Mitigación:
  marcado inmediato tras el deploy, fuera de horario de clase.
- **Ventana migración → deploy.** Las migraciones se aplican en producción
  **antes** del deploy de Vercel. En ese intervalo el código viejo sigue
  llamando a `recalculate_self_assessment_grade` no solo al enviar una
  autoevaluación sino también desde `markLessonViewed`, es decir, cada vez que
  un estudiante abre una lección por primera vez. Con `taught_lessons` vacía,
  la nueva `apply_self_assessment_grade` pone esa nota en `null` (D4). La nota
  se recupera sola con el marcado inicial de la Fase 7. Mitigación: hacer el
  `db push`, el deploy y el marcado inicial seguidos y fuera de horario de
  clase.
- **Olvido del docente.** Si no marca una lección dictada, no cuenta. Es
  visible (cabecera "N marcadas" en Contenido y la tarjeta del estudiante),
  pero no hay recordatorio automático; el paso de `class-material-prep`
  (D16) es el recordatorio de facto en las rondas semanales.
- **Costo del recálculo.** Cada marca recalcula el grupo entero, y abrir/cerrar
  una lección recalcula todos los grupos del curso. Con los tamaños actuales
  (decenas de estudiantes) es despreciable; si crece, reevaluar.
- **DEBT-097**: eliminar `self_assessment_breakdown(uuid, text)` tras el
  despliegue (D3).
- **DEBT-093** sigue abierta en su parte de `lesson_questions` (este spec solo
  la mitiga, D9).

## Preguntas abiertas para el usuario

Ninguna. P1–P4 se resolvieron con el usuario el 2026-10-20 y quedaron como
D13–D16.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-060-autoevaluacion-por-lecciones-dictadas.md`
  — casos `TC-060-01` a `TC-060-14` y `TC-MCP-060-01` a `TC-MCP-060-09`.
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
| A9 | `set_lessons_taught` invocado por docente no dueño | error/0 cambios; `taught_lessons` intacta |
| A10 | `insert` directo en `taught_lessons` con JWT de docente dueño | rechazado por RLS |
| A11 | `has_function_privilege('authenticated', <interna>, 'execute')` | `false` para las tres |
| A12 | Marcar dos veces la misma lección | segunda llamada: slug en `unchanged_slugs`, `marked_at` intacto, sin recálculo |
| A14 | Lote de 3 slugs con 1 ya marcado | `changed_slugs` = 2, `unchanged_slugs` = 1, un solo recálculo (contar ejecuciones de la interna) |
| A15 | Lote con un slug que falla a mitad de la transacción (forzado) | rollback completo: ninguna fila nueva en `taught_lessons`, notas sin cambios |
| A13 | `select` en `taught_lessons` como estudiante de otro grupo | 0 filas |

### Evidencia de los casos SQL (2026-10-22, `nodo-dev`)

Script desechable con 2 docentes, 2 estudiantes y 3 grupos propios, que se
eliminaron al terminar (0 usuarios, 0 grupos y 0 marcas restantes). Resultado:
6/6 casos más 1 control (A9b: el docente dueño sí puede marcar).

| # | Resultado |
|---|---|
| A1–A7, A12, A14 | Cubiertos por la ronda manual: A1/A2 por TC-060-04 y 06; A3 por TC-060-07; A4 por TC-060-09 y TC-MCP-060-06; A5 por TC-060-08; A6/A7 por TC-060-10 y 11; A12/A14 por TC-MCP-060-04 y 08 |
| A8 | Con intento: 4/5 (`question_count` congelado en 5); sin intento: 0/6 (conteo vivo) |
| A9 | Docente no dueño: `42501 not_allowed`; `taught_lessons` intacta. Control: el docente dueño sí marca |
| A10 | `insert` directo por PostgREST rechazado (`42501`) para docente dueño, docente no dueño y estudiante; `delete` y `update` afectan 0 filas |
| A11 | Las tres internas: `42501` para `authenticated` y `anon`; `service_role` ejecuta |
| A13 | `select` en `taught_lessons`: estudiante matriculado 1 fila, estudiante de otro grupo 0, docente dueño 1, docente no dueño 0 |
| A15 | Fallo forzado en el recálculo (ítem manual "Autoevaluaciones" preexistente, DEBT-098): `23502 grade_item_id` nulo, rollback completo; las marcas quedaron igual que antes |

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-10-21 ("Implementa el spec60")
