# spec-040 — [TESTING] Autoevaluación de intento único y nota acumulada del curso

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Hoy la autoevaluación de cierre de lección (spec-011, spec-017, spec-033,
spec-034) es un ejercicio **formativo e ilimitado**:

- `self_assessment_attempts` es, por diseño explícito, una bitácora
  *append-only* (`20260718000000_init_self_assessment_attempts.sql`): no hay
  `unique`, y `submitSelfAssessment`
  ([lib/self-assessment/index.ts:409](../../lib/self-assessment/index.ts#L409))
  inserta una fila nueva **sin comprobar si ya existe un intento previo**.
- `SelfAssessmentSection` expone un botón **"Reintentar"** deliberado
  ([línea 342](../../components/courses/SelfAssessmentSection.tsx#L342)) que
  limpia el formulario y permite reenviar, con la clave de respuestas ya
  revelada en pantalla.
- El intento solo se usa como *gate* booleano para desbloquear "marcar lección
  completada" (`markLessonCompleted`,
  [lib/progress/index.ts:86](../../lib/progress/index.ts#L86)): `hasAttempt`
  evalúa únicamente `length > 0`. El puntaje no se usa para nada.

El docente necesita convertir esa autoevaluación en **una nota real del curso**.
Eso rompe la premisa formativa: una evaluación que cuenta para la nota no puede
permitir reintentos con la clave a la vista, y necesita una regla de cálculo
explícita, auditable y estable en el tiempo.

La necesidad del usuario, literal:

> "las autoevaluaciones no deben permitir reintentos ya que quisiera ponerla
> como una nota de cada curso; por lo tanto es necesario llevar una
> trazabilidad de cuántas preguntas correctas ha contestado el estudiante del
> total de lecciones que haya visto hasta la fecha. Es decir, si el estudiante
> lleva 5 lecciones cada una con 5 preguntas y ha contestado correctas 20/25 se
> debe normalizar a una nota de 0-5."

Ya existe el precedente exacto de propagación normalizada a la libreta: el RPC
`propagate_submission_grade`
(`20260729000001_normalize_grade_propagation_scale.sql`), `security definer`,
que normaliza a escala 0–5 y hace `upsert` sobre `student_grades` porque la
sesión del estudiante no tiene permiso RLS para escribir en la libreta. Este
spec reutiliza ese patrón.

## Alcance

### Incluye

1. **Intento único, bloqueado en el servidor**: restricción de unicidad en
   `self_assessment_attempts`, rechazo explícito en `submitSelfAssessment`, y
   eliminación del botón "Reintentar".
2. **Deduplicación previa de los intentos ya existentes** (producción incluida),
   con archivado de las filas descartadas.
3. **Persistencia de la respuesta por pregunta** (`self_assessment_attempt_answers`),
   para que el estudiante pueda revisar permanentemente qué falló en un intento
   que ya no puede repetir, y para que la nota sea auditable.
4. **Nota acumulada del curso**: cálculo `round(correctas / preguntas * 5, 2)`
   sobre las lecciones **habilitadas y vistas**, en un RPC `security definer`.
5. **Propagación a la libreta**: ítem `grade_items` de tipo `self_assessment`
   por curso académico, resuelto y creado automáticamente, y `upsert` en
   `student_grades`.
6. **Recálculo disparado por los dos eventos que mueven la nota**: enviar un
   intento (sube el numerador) y ver una lección nueva (sube el denominador).
7. **Recálculo masivo por curso**, a cargo del docente, para el retroactivo y
   para los cambios que el estudiante no dispara (habilitar/deshabilitar
   lecciones, publicar preguntas).
8. **Trazabilidad visible** para estudiante (desglose por lección + nota) y para
   docente (columna en la libreta + desglose por estudiante).
9. **Fase MCP**: una herramienta de lectura en `students-mcp` para que el agente
   docente pueda explicar la nota de un estudiante.

### No incluye

- Cambiar la regla de desbloqueo de "marcar lección completada"
  (`requiresAttempt && !hasAttempt`) — sigue igual.
- Ponderar la nota de autoevaluaciones dentro del total del curso:
  `computeTotalGrade` ([lib/grades/index.ts:11](../../lib/grades/index.ts#L11))
  promedia todos los ítems por igual y este ítem entra como uno más. Cambiar el
  modelo de ponderación es otro spec.
- Reintentos autorizados por el docente ("habilitar un segundo intento a un
  estudiante concreto"). Ver **Riesgos y deuda derivada**.
- Temporizador, fecha límite de respuesta o bloqueo por fecha.
- Preguntas que no sean `multiple_choice` en la autoevaluación.
- Reporte agregado por curso vía MCP (solo se expone la lectura por
  estudiante; ver "Evaluación MCP").
- El estado habilitado/deshabilitado de lecciones en sí mismo — lo aporta
  spec-039 (ver "Dependencias").

## Dependencias

### spec-039 — estado habilitado/deshabilitado de lecciones (dependencia dura)

El denominador es "preguntas de las lecciones **habilitadas** que el estudiante
ya vio". El estado habilitado/deshabilitado por `(course_slug, lesson_slug)`
vive en Supabase y lo introduce **spec-039**, que se redacta en paralelo.

- **Si spec-039 está implementado y mergeado antes que este spec**: el RPC de
  cálculo incluye el filtro `and not exists (select 1 from <tabla de spec-039>
  ...)` marcado más abajo como "BLOQUE 039" en el DDL.
- **Si spec-039 NO está implementado cuando se apruebe este spec**: se
  implementa el RPC **sin** el BLOQUE 039 (toda lección vista cuenta) y se
  registra en `docs/specs/backlog.md` la deuda de añadir el filtro. El filtro es
  una cláusula aditiva de un `where`: incorporarlo después es una migración
  `create or replace function` de una línea, más un recálculo masivo por curso
  (Fase 5 ya provee la acción). **No se referencia la tabla de spec-039 antes de
  que exista**: una función que menciona una tabla inexistente falla en tiempo
  de ejecución, no de creación, y rompería el envío de autoevaluaciones en
  producción.
- El nombre real de la tabla/columna de spec-039 debe leerse de su migración al
  implementar; el DDL de este spec usa el marcador `lesson_visibility` y **debe
  ajustarse**, no copiarse a ciegas.

### spec-038 — clave de respuestas ocultable

Sin relación funcional directa, pero comparte componente
(`SelfAssessmentSection`) y toca la misma decisión de "qué se le muestra al
estudiante después de responder". Coordinar el merge para evitar conflictos en
ese archivo.

## Impacto en el sistema

### Base de datos

| Objeto | Cambio |
|---|---|
| `self_assessment_attempts` | Nueva `unique (user_id, course_slug, lesson_slug)`; deja de ser append-only multi-fila |
| `self_assessment_attempts_discarded` | **Nueva** tabla de archivo: filas eliminadas por la deduplicación |
| `self_assessment_attempt_answers` | **Nueva** tabla: respuesta por pregunta de cada intento |
| `grade_items` | Nueva columna `kind` (`'manual'` \| `'self_assessment'`) + índice único parcial por curso |
| `recalculate_self_assessment_grade(text)` | **Nuevo** RPC `security definer` (estudiante, vía `auth.uid()`) |
| `recalculate_course_self_assessment_grades(uuid)` | **Nuevo** RPC `security definer` (docente dueño / admin) |

### Backend

| Archivo | Cambio |
|---|---|
| `lib/self-assessment/types.ts` | Nuevo `reason: 'already_submitted'` en `SubmitSelfAssessmentResult`; nuevos tipos `SelfAssessmentCourseSummary`, `SelfAssessmentLessonRow`, `AttemptReview` |
| `lib/self-assessment/index.ts` | `submitSelfAssessment`: comprobar intento previo, persistir respuestas por pregunta, invocar el RPC de recálculo, mapear el error `23505` a `already_submitted`. Nuevo `getAttemptReview()` y `getSelfAssessmentCourseSummary()` |
| `lib/progress/index.ts` | `markLessonViewed`: detectar si la fila de `lesson_progress` es **nueva** y, solo entonces, invocar el RPC de recálculo |
| `lib/grades/index.ts` | `deleteGradeItem`: rechazar ítems `kind = 'self_assessment'`. `createGradeItem` sigue creando `kind = 'manual'` |
| `lib/grades/actions.ts` | Nueva Server Action `recalculateCourseSelfAssessmentGrades(academicCourseId)` |

### Frontend

| Archivo | Cambio |
|---|---|
| `components/courses/SelfAssessmentSection.tsx` | Aviso de intento único **antes** de responder; paso de confirmación explícita en el envío; **eliminar** "Reintentar"; revisión permanente del intento (por pregunta) en vez del resumen agregado |
| `components/courses/LessonClosureFlow.tsx` | Eliminar el estado `isRetrying` y `onRetryingChange` (quedan sin uso al desaparecer el reintento) |
| `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` | Cargar y pasar la revisión del intento (`getAttemptReview`) |
| `app/cuenta/cursos/[enrollmentId]/page.tsx` | Cargar `getSelfAssessmentCourseSummary(courseSlug)` |
| `components/account/EnrollmentDetail.tsx` | Nueva tarjeta "Autoevaluaciones": nota, acumulado y desglose por lección |
| Vista docente de libreta (`app/(admin)`) | Botón "Recalcular autoevaluaciones" + desglose por estudiante |

## Decisiones de diseño

### D1 — Intento único, con la restricción en la base de datos

La UI **no** es un mecanismo de control: `submitSelfAssessment` es una Server
Action invocable directamente, y hoy inserta sin comprobar nada. El bloqueo se
implementa en tres capas, de fuera hacia dentro:

1. **UI**: sin botón "Reintentar"; formulario deshabilitado si ya hay intento.
2. **Server Action**: `select` previo por `(user_id, course_slug, lesson_slug)`
   → `{ ok: false, reason: 'already_submitted' }`.
3. **Base de datos**: `unique (user_id, course_slug, lesson_slug)`. Es la única
   capa que resiste una condición de carrera (doble clic, dos pestañas, dos
   llamadas concurrentes a la Server Action): el `select` previo de la capa 2 no
   es atómico respecto del `insert`. El código captura el error `23505` de
   Postgres y lo devuelve como `already_submitted`, no como `error` genérico.

**Mensaje al estudiante** (idéntico en las tres capas):

> "Ya enviaste esta autoevaluación. Solo se permite un intento porque hace parte
> de tu nota del curso."

### D2 — Deduplicación de los intentos que ya existen

La restricción `unique` **no se puede aplicar** sobre los datos actuales sin
resolver antes los duplicados. Producción lleva meses aceptando reintentos por
diseño, así que es esperable que existan.

**Criterio propuesto: conservar el intento MÁS ANTIGUO** (`submitted_at` asc,
desempate por `id`).

- **Por qué el más antiguo y no el mejor**: los reintentos se hicieron con la
  clave de respuestas ya revelada en pantalla (`SelfAssessmentSection` muestra
  las correctas antes de ofrecer "Reintentar"). Conservar el mejor consolidaría
  como nota un puntaje obtenido copiando la respuesta correcta. El primer
  intento es el único comparable con la regla nueva de intento único.
- **Contraargumento a considerar**: bajo las reglas vigentes al momento de
  responder, reintentar era legítimo y no había nota en juego. Aplicar el
  criterio "más antiguo" cambia retroactivamente el resultado de estudiantes
  reales.
- **Por eso**: la Fase 0 **primero mide** el impacto (cuántos estudiantes,
  cuántas filas, qué diferencia de nota entre "más antiguo" y "mejor") y el
  usuario confirma el criterio **antes** de ejecutar la migración en producción.
  El criterio alternativo (`correct_count desc, submitted_at asc`) es un cambio
  de un `order by` en la migración.

**Las filas descartadas no se borran**: se copian a
`self_assessment_attempts_discarded` con `discarded_at` y el motivo. La
deduplicación es una operación irreversible sobre datos de estudiantes reales;
sin archivo no hay forma de revertir un criterio mal elegido ni de responderle a
un estudiante que reclame. La migración corre como propietario de la base, así
que la ausencia de política RLS de `delete` no la bloquea — es una **excepción
única y explícita** al carácter append-only de la tabla, documentada en el
propio archivo de migración.

### D3 — Qué ve el estudiante después de enviar (y qué se le avisa antes)

Consecuencia pedagógica del bloqueo: la autoevaluación **es irrepetible**. Eso
exige dos cosas que hoy no existen.

**Antes de enviar** — aviso visible en el encabezado de la autoevaluación desde
que se carga la lección (no solo en el momento del clic):

> "Tienes **un único intento**. Esta autoevaluación hace parte de tu nota del
> curso y no se puede repetir."

Y un **paso de confirmación explícita** al pulsar "Enviar respuestas": el botón
abre un panel de confirmación en el propio formulario (no `window.confirm`: no
es estilizable, no respeta el modo oscuro y su accesibilidad es pobre) con el
recuento de respuestas y los botones "Sí, enviar definitivamente" / "Volver a
revisar". Esto es lo que evita el envío accidental de un formulario a medio
pensar cuando ya no hay vuelta atrás.

**Después de enviar**, y de forma permanente en cada visita posterior a la
lección, el estudiante ve la **revisión completa de su intento**: cada pregunta
con lo que marcó, si acertó, y **cuáles eran las opciones correctas** — es
decir, exactamente el feedback que hoy solo sobrevive en memoria hasta la
primera recarga.

- **Por qué persistir la revisión**: spec-033 documentó que reconstruir el
  feedback tras recargar es imposible con el esquema actual, porque
  `self_assessment_attempts` guarda **solo conteos agregados**. Con la
  autoevaluación como nota, eso deja de ser una molestia y pasa a ser un
  problema de auditabilidad: el estudiante tiene derecho a ver de qué se compone
  la nota que se le asignó, y no puede volver a responder para averiguarlo. De
  ahí la tabla `self_assessment_attempt_answers`.
- **Por qué mostrar la clave**: ya se muestra hoy inmediatamente tras enviar, y
  el valor formativo (entender el error) es el propósito del ejercicio. El
  riesgo de filtración a compañeros que aún no responden **existe y aumenta**
  ahora que hay nota; se registra como deuda y se coordina con **spec-038**
  (clave de respuestas ocultable), que es el spec donde esa decisión
  corresponde.

### D4 — Regla de cálculo y cuándo se recalcula

```
denominador = Σ preguntas de cada lección HABILITADA y VISTA
numerador   = Σ correctas del intento de esa lección (0 si no hay intento)
nota        = round(numerador / denominador * 5, 2)
```

- "Vista" = existe fila en `lesson_progress` para `(user_id, course_slug,
  lesson_slug)`. La columna `viewed_at` es `not null default now()`, así que la
  existencia de la fila **es** la señal.
- Ver una lección y no responder su autoevaluación cuenta como **todas
  incorrectas** (decisión del usuario: penaliza no responder).
- Si el denominador es `0` (ninguna lección vista tiene preguntas publicadas),
  la nota es **`NULL`**, no `0`. `student_grades.score` es nullable y la libreta
  ya renderiza `null` como "sin nota"; escribir `0.00` mostraría un cero
  reprobatorio a quien simplemente todavía no tiene nada evaluable.

**Disparadores del recálculo** — son dos, y la razón por la que no basta con
uno:

| Evento | Efecto | Dónde se dispara |
|---|---|---|
| Enviar un intento | Sube numerador y denominador | `submitSelfAssessment`, tras el `insert` |
| Ver una lección nueva | Sube **solo** el denominador → **la nota baja** | `markLessonViewed`, solo si la fila es nueva |
| Habilitar/deshabilitar una lección (spec-039) | Cambia el denominador de todo el curso | Recálculo masivo del docente (Fase 5) |
| Publicar/despublicar preguntas | Cambia el denominador de las lecciones **no respondidas** | Recálculo masivo del docente (Fase 5) |

El segundo caso es el que obliga a no recalcular solo en el envío: si la nota se
congelara al enviar, un estudiante que abre la lección 6 y no la responde
seguiría mostrando la nota de las lecciones 1–5. La nota debe reflejar la
penalización desde que el denominador crece.

`markLessonViewed` hace hoy un `upsert` incondicional que **pisa `viewed_at` en
cada carga de página** ([lib/progress/index.ts:54](../../lib/progress/index.ts#L54));
recalcular ahí sin más añadiría una escritura en libreta a **cada render** de
cada lección. Por eso la Fase 3 cambia el `upsert` para distinguir inserción de
actualización (`select` previo, o `onConflict` con `ignoreDuplicates: true` más
comprobación del resultado) y solo recalcula cuando la fila **no existía**.

**Dónde vive el cálculo: en un RPC `security definer`, no en una Server Action.**
Tres razones:

1. **RLS**: la política `"student_grades: insert teacher or admin"`
   (`20260625000004_rls_academic.sql:174`) impide que la sesión del estudiante
   escriba en la libreta. Es exactamente el problema que ya resolvió
   `propagate_submission_grade` con `security definer`.
2. **Integridad del puntaje**: la función **no recibe la nota como parámetro**;
   la recalcula desde `self_assessment_attempts`, `lesson_progress` y
   `questions`. Un estudiante que invoque el RPC directamente por la API REST no
   puede propagar un puntaje arbitrario. Mismo criterio que documenta
   `propagateToGradeItem` en
   [lib/submissions/index.ts:571](../../lib/submissions/index.ts#L571).
3. **Atomicidad y una sola fuente de verdad**: la misma lógica sirve al
   estudiante (una matrícula) y al docente (curso completo); duplicarla en
   TypeScript garantiza que las dos versiones se separen.

El RPC del estudiante **no recibe `user_id`**: usa `auth.uid()`. Un parámetro de
usuario en una función `security definer` es una escalada de privilegios
esperando ocurrir.

### D5 — Resolución del `grade_item` de autoevaluaciones

**Identificación por `kind`, no por nombre.** Se añade
`grade_items.kind text not null default 'manual'` con un índice único parcial
`unique (academic_course_id) where kind = 'self_assessment'`.

- **Por qué no buscar por `name = 'Autoevaluaciones'`**: `updateGradeItem`
  ([lib/grades/index.ts:45](../../lib/grades/index.ts#L45)) ya permite al
  docente renombrar cualquier ítem. Con búsqueda por nombre, un renombre
  inocente ("Autoevaluaciones" → "Quices de lección") haría que el siguiente
  recálculo **creara un ítem duplicado** y la nota se partiera en dos columnas.
  El `kind` sobrevive al renombre, y el índice parcial hace imposible el
  duplicado a nivel de esquema.

**Resolución matrícula ↔ curso académico.** El estudiante responde en el
contexto de un `course_slug` (contenido MDX), pero la nota vive en una matrícula
(`enrollments.id`). La cadena es:

```
auth.uid() ─▶ enrollments (status='active')
                 └─▶ academic_courses (course_slug = p_course_slug)
                        └─▶ grade_items (kind='self_assessment')
                               └─▶ student_grades (upsert por enrollment_id)
```

- Un estudiante **puede tener varias matrículas activas** con el mismo
  `course_slug` (varios grupos/semestres; `hasCourseAccess` ya contempla ese
  caso para el docente, ver
  [lib/enrollments/access.ts:33](../../lib/enrollments/access.ts#L33)). El RPC
  **itera sobre todas las matrículas activas que apliquen** y escribe la misma
  nota en cada una. Es idempotente y evita el problema real de `.maybeSingle()`
  fallando con `PGRST116` ante dos filas — el mismo bug que ya se corrigió en
  `access.ts`.
- Las matrículas `withdrawn` se **omiten**: un estudiante retirado no recibe
  notas nuevas.
- `academic_courses.course_slug` es **nullable**: los cursos académicos sin slug
  no tienen contenido asociado y quedan fuera por el propio `join`.

**Si el docente no ha creado el ítem: el RPC lo crea.** Nombre inicial
`'Autoevaluaciones'`, `kind = 'self_assessment'`, `order_index = max + 1`.

- **Por qué automático**: el envío del estudiante no puede fallar porque el
  docente no haya preparado la libreta, y el ítem es determinista (uno por
  curso). `security definer` permite la creación pese a la política
  `"grade_items: insert teacher or admin"`.
- **Se crea de forma perezosa**: solo en la primera propagación con denominador
  > 0, no al desplegar. Un curso donde nadie responde autoevaluaciones no ve
  aparecer una columna vacía en su libreta.
- **`deleteGradeItem` rechaza los ítems `kind = 'self_assessment'`** con un
  mensaje explícito. Si no, el docente los borraría y el siguiente envío los
  recrearía en silencio, con el `order_index` movido: un comportamiento
  incomprensible desde la UI. El docente puede **renombrarlo**, que es la
  necesidad legítima.

### D6 — Preguntas publicadas después de responder: se congela lo respondido

`self_assessment_attempts.question_count` ya guarda cuántas preguntas tenía la
lección **en el momento del intento**. Ese valor es el que usa el denominador
para las lecciones **ya respondidas**:

```
preguntas de la lección = si hay intento  → attempts.question_count   (congelado)
                          si no hay intento → count(questions publicadas) (vivo)
```

- **Por qué congelar lo respondido**: si el docente publica una sexta pregunta
  en una lección que el estudiante ya respondió, con denominador vivo la nota
  del estudiante **empeoraría sin que él pudiera hacer nada** — ya no puede
  reintentar. Sería una penalización por un acto ajeno.
- **Por qué mantener vivo lo no respondido**: ahí el estudiante sí puede actuar;
  responderá la versión vigente de la lección, con el número de preguntas que
  tenga ese día.
- **Efecto secundario aceptado**: despublicar una pregunta no mejora la nota de
  quien ya la respondió mal. Es coherente con "lo respondido no se toca".
- **Consecuencia operativa a comunicar al docente**: publicar preguntas nuevas
  en una lección ya cursada no afecta a quien ya respondió, pero **sí** afecta a
  quien la vio y no la respondió (denominador vivo, todas incorrectas).

### D7 — Trazabilidad visible

**Estudiante** — en `/cuenta/cursos/[enrollmentId]`, tarjeta "Autoevaluaciones":

- Nota actual (0–5) y el acumulado crudo: `20/25 preguntas correctas`.
- Desglose por lección: lección · estado (`Respondida` / `Sin responder`) ·
  `correctas/total`. Las lecciones vistas y no respondidas aparecen
  explícitamente como `0/N — sin responder`, para que la penalización sea
  **visible y explicable**, no un descuento invisible.
- Nota explicativa de la regla: "Se cuentan las lecciones que ya abriste. Las
  autoevaluaciones sin responder cuentan como incorrectas."

**Docente** — la columna "Autoevaluaciones" aparece sola en la libreta existente
(`getGradesByCourse` lee todos los `grade_items` del curso), más:

- Botón **"Recalcular autoevaluaciones"** en la vista de libreta del curso.
- Desglose por estudiante equivalente al del estudiante, para poder responder
  "¿por qué tengo 3.2?" sin consultar la base de datos.

## Evaluación MCP

**¿Aplica MCP?** **Sí**, de forma acotada.

Evaluación contra los criterios de `CLAUDE.md`:

| Pregunta | Respuesta |
|---|---|
| ¿Expone datos que un agente podría consultar? | **Sí.** "¿Por qué la nota de autoevaluaciones de X es 3.2?", "¿qué lecciones abrió y no respondió?" es una consulta docente real y recurrente, hoy solo respondible entrando a la base de datos. |
| ¿Permite acciones que un agente debería ejecutar? | **No.** La nota es **derivada**: escribirla a mano la haría inconsistente con la regla y el siguiente recálculo la pisaría. Un agente no debe poder forzar ni alterar esta nota. Herramientas de **solo lectura**. |
| ¿Existe un MCP de dominio relacionado? | **Sí, `students-mcp`**: opera sobre `/api/students/*` con permisos de admin (`STUDENTS_ADMIN_API_KEY`) y su dominio es el dato académico **por estudiante** (`get_student`, `list_students`, matrículas). Es el encaje natural. `attendance-mcp` es de solo lectura pero su dominio es asistencia; crear un MCP nuevo por una sola herramienta de lectura no se justifica. |
| ¿Hay un agente que se beneficie? | **Sí**, el agente docente de `docs/mcps/students-agent.system-prompt.md`. |

**Decisión:**

- **MCP existente a modificar:** `students-mcp` — agregar
  `get_student_self_assessment_summary(student_id, course_slug)`, de **solo
  lectura**: devuelve nota, acumulado (`correctas/preguntas`) y el desglose por
  lección (respondida / sin responder, correctas/total). Sirve al caso "explicar
  la nota", que es donde el agente aporta valor.
- **MCP nuevo a crear:** ninguno.
- **System prompt afectado:** `docs/mcps/students-agent.system-prompt.md` —
  añadir la capacidad y la restricción explícita de que **la nota de
  autoevaluaciones no es editable por el agente**, ni siquiera mediante
  `upsert` de `student_grades`.
- **Fase de MCP en este spec:** Fase 7.

**Explícitamente fuera:** el reporte **agregado por curso** ("dame el ranking de
autoevaluaciones del grupo", "quiénes no han respondido la lección 5"). Es
valioso, pero requiere un endpoint y un contrato de paginación propios, y
conviene esperar a que la regla de cálculo sobreviva un semestre real antes de
congelarla en una herramienta de agente. Se registra en
`docs/specs/backlog.md`.

## DDL propuesto (diseño — **no aplicar en esta fase**)

> Los timestamps de migración asumen `20260801*`; ajustar si spec-038/spec-039
> toman esos números. **Toda migración se prueba primero con `db reset` en
> `mirp-lab`** (ver `CLAUDE.md` → "Base de datos") antes de tocar producción.

### `20260801000000_dedupe_and_unique_self_assessment_attempts.sql`

```sql
-- EXCEPCIÓN ÚNICA Y DELIBERADA al carácter append-only de
-- self_assessment_attempts (20260718000000): spec-040 convierte la
-- autoevaluación en nota de curso, y una nota exige un intento único.
-- Las filas descartadas NO se borran: se archivan.

create table public.self_assessment_attempts_discarded (
  like public.self_assessment_attempts including defaults,
  discarded_at timestamptz not null default now(),
  discarded_reason text not null default 'spec-040 dedupe: kept earliest attempt'
);

alter table public.self_assessment_attempts_discarded enable row level security;
-- Sin políticas: tabla de auditoría, accesible solo con service_role.

with ranked as (
  select id,
         row_number() over (
           partition by user_id, course_slug, lesson_slug
           -- CRITERIO CONFIRMADO EN FASE 0. Alternativa evaluada y
           -- descartada: order by correct_count desc, submitted_at asc
           order by submitted_at asc, id asc
         ) as rn
  from public.self_assessment_attempts
)
insert into public.self_assessment_attempts_discarded
  (id, user_id, course_slug, lesson_slug, submitted_at,
   question_count, answered_count, correct_count)
select a.id, a.user_id, a.course_slug, a.lesson_slug, a.submitted_at,
       a.question_count, a.answered_count, a.correct_count
from public.self_assessment_attempts a
join ranked r on r.id = a.id
where r.rn > 1;

delete from public.self_assessment_attempts a
using public.self_assessment_attempts_discarded d
where d.id = a.id;

alter table public.self_assessment_attempts
  add constraint self_assessment_attempts_one_per_lesson
  unique (user_id, course_slug, lesson_slug);

-- El índice no-único de 20260718000000 sobre las mismas columnas queda
-- redundante frente al índice único que crea la constraint.
drop index if exists public.self_assessment_attempts_user_id_course_slug_lesson_slug_idx;
```

### `20260801000001_init_self_assessment_attempt_answers.sql`

```sql
-- spec-040 D3: la nota debe ser auditable y el intento es irrepetible, así que
-- la revisión por pregunta tiene que sobrevivir a la recarga (limitación
-- documentada en spec-033).
create table public.self_assessment_attempt_answers (
  attempt_id          uuid    not null
                              references public.self_assessment_attempts(id) on delete cascade,
  question_id         uuid    not null references public.questions(id) on delete cascade,
  selected_choice_ids uuid[]  not null default '{}',
  is_correct          boolean not null,

  primary key (attempt_id, question_id)
);

create index on public.self_assessment_attempt_answers (question_id);
```

```sql
-- 20260801000002_rls_self_assessment_attempt_answers.sql
alter table public.self_assessment_attempt_answers enable row level security;

-- select: dueño del intento, docente del curso o admin.
create policy "sa_attempt_answers: select"
  on public.self_assessment_attempt_answers for select
  using (
    exists (
      select 1 from public.self_assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.self_assessment_attempts a
      join public.academic_courses ac on ac.course_slug = a.course_slug
      where a.id = attempt_id and ac.teacher_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

-- insert: solo sobre un intento propio.
create policy "sa_attempt_answers: insert own"
  on public.self_assessment_attempt_answers for insert
  with check (
    exists (
      select 1 from public.self_assessment_attempts a
      where a.id = attempt_id and a.user_id = auth.uid()
    )
  );

-- Sin update ni delete: la revisión de un intento único es inmutable.
```

### `20260801000003_add_kind_to_grade_items.sql`

```sql
alter table public.grade_items
  add column kind text not null default 'manual'
  check (kind in ('manual', 'self_assessment'));

-- spec-040 D5: como máximo un ítem de autoevaluaciones por curso académico.
-- Índice parcial (no constraint) para no restringir los ítems manuales.
create unique index grade_items_one_self_assessment_per_course
  on public.grade_items (academic_course_id)
  where kind = 'self_assessment';
```

### `20260801000004_self_assessment_grade_rpcs.sql`

```sql
-- Cálculo canónico. Devuelve una fila por lección habilitada y vista.
-- SIN security definer: es la pieza pura de cálculo, la invocan las funciones
-- de abajo, que sí son las que escriben en la libreta.
create or replace function public.self_assessment_breakdown(
  p_user_id     uuid,
  p_course_slug text
)
returns table (
  lesson_slug    text,
  question_count int,
  correct_count  int,
  answered       boolean
)
language sql
stable
set search_path = public
as $$
  select
    lp.lesson_slug,
    -- D6: congelado si ya respondió; vivo si no.
    coalesce(
      a.question_count,
      (select count(*)::int
         from questions q
        where q.course_slug = lp.course_slug
          and q.lesson_slug = lp.lesson_slug
          and q.type = 'multiple_choice'
          and q.is_published)
    ) as question_count,
    coalesce(a.correct_count, 0) as correct_count,
    (a.id is not null)           as answered
  from lesson_progress lp
  left join self_assessment_attempts a
    on  a.user_id     = lp.user_id
    and a.course_slug = lp.course_slug
    and a.lesson_slug = lp.lesson_slug
  where lp.user_id     = p_user_id
    and lp.course_slug = p_course_slug
    -- ▼▼▼ BLOQUE 039 — incluir SOLO si spec-039 ya está mergeado; ajustar
    --     el nombre real de la tabla/columna leyendo su migración.
    -- and not exists (
    --   select 1 from lesson_visibility lv
    --    where lv.course_slug = lp.course_slug
    --      and lv.lesson_slug = lp.lesson_slug
    --      and lv.is_disabled
    -- )
    -- ▲▲▲ BLOQUE 039
  ;
$$;


-- Escribe la nota de UNA matrícula. Interna: la llaman las dos RPC públicas.
create or replace function public.apply_self_assessment_grade(
  p_user_id       uuid,
  p_enrollment_id uuid,
  p_course_slug   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_academic_course_id uuid;
  v_questions int;
  v_correct   int;
  v_score     numeric;
  v_grade_item_id uuid;
begin
  select e.academic_course_id into v_academic_course_id
  from enrollments e
  where e.id = p_enrollment_id and e.student_id = p_user_id and e.status = 'active';

  if v_academic_course_id is null then
    return;
  end if;

  select coalesce(sum(b.question_count), 0), coalesce(sum(b.correct_count), 0)
    into v_questions, v_correct
  from public.self_assessment_breakdown(p_user_id, p_course_slug) b;

  -- D4: sin nada evaluable la nota es NULL, no 0 (un 0 se lee como reprobado).
  if v_questions = 0 then
    v_score := null;
  else
    v_score := round((v_correct::numeric / v_questions) * 5, 2);
  end if;

  -- Creación perezosa: no existe columna en la libreta hasta la primera
  -- propagación real.
  if v_score is null then
    return;
  end if;

  select gi.id into v_grade_item_id
  from grade_items gi
  where gi.academic_course_id = v_academic_course_id
    and gi.kind = 'self_assessment';

  if v_grade_item_id is null then
    insert into grade_items (academic_course_id, name, order_index, kind)
    values (
      v_academic_course_id,
      'Autoevaluaciones',
      coalesce((select max(order_index) + 1 from grade_items
                 where academic_course_id = v_academic_course_id), 0),
      'self_assessment'
    )
    on conflict do nothing
    returning id into v_grade_item_id;

    if v_grade_item_id is null then
      select gi.id into v_grade_item_id
      from grade_items gi
      where gi.academic_course_id = v_academic_course_id
        and gi.kind = 'self_assessment';
    end if;
  end if;

  insert into student_grades (enrollment_id, grade_item_id, score)
  values (p_enrollment_id, v_grade_item_id, v_score)
  on conflict (enrollment_id, grade_item_id)
  do update set score = excluded.score;
end;
$$;


-- Camino del ESTUDIANTE. No recibe user_id: lo toma de auth.uid(), para que no
-- sea posible escribir la nota de otro invocando el RPC por la API REST.
-- Recalcula desde las tablas; no acepta el puntaje como parámetro (mismo
-- criterio que propagate_submission_grade, 20260729000001).
create or replace function public.recalculate_self_assessment_grade(
  p_course_slug text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  r record;
begin
  if v_user_id is null then
    return;
  end if;

  -- Un estudiante puede tener varias matrículas activas con el mismo
  -- course_slug (distintos grupos); se escriben todas. Un .maybeSingle()
  -- aquí reproduciría el PGRST116 ya corregido en lib/enrollments/access.ts.
  for r in
    select e.id
    from enrollments e
    join academic_courses ac on ac.id = e.academic_course_id
    where e.student_id = v_user_id
      and e.status = 'active'
      and ac.course_slug = p_course_slug
  loop
    perform public.apply_self_assessment_grade(v_user_id, r.id, p_course_slug);
  end loop;
end;
$$;


-- Camino del DOCENTE: recálculo masivo de un curso académico.
create or replace function public.recalculate_course_self_assessment_grades(
  p_academic_course_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_slug text;
  v_count int := 0;
  r record;
begin
  select ac.course_slug into v_course_slug
  from academic_courses ac
  where ac.id = p_academic_course_id
    and (ac.teacher_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

  if v_course_slug is null then
    return 0;  -- sin permiso, o curso académico sin contenido asociado
  end if;

  for r in
    select e.id, e.student_id
    from enrollments e
    where e.academic_course_id = p_academic_course_id
      and e.status = 'active'
  loop
    perform public.apply_self_assessment_grade(r.student_id, r.id, v_course_slug);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.apply_self_assessment_grade(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.recalculate_self_assessment_grade(text) to authenticated;
grant execute on function public.recalculate_course_self_assessment_grades(uuid) to authenticated;
```

> **Nota de seguridad**: `apply_self_assessment_grade` recibe `p_user_id` y por
> eso **no se expone** a `authenticated` (`revoke`); solo la invocan las dos
> funciones públicas, que resuelven el usuario por `auth.uid()` o validan la
> propiedad del curso.

## Fases de implementación

### Fase 0 — Diagnóstico de los datos existentes (antes de cualquier migración) — ✅ Completada (2026-08-01)
- [x] Contar duplicados en **desarrollo** (`mirp-lab`) y en **producción**
      (consulta de solo lectura; no requiere migración):
      `select user_id, course_slug, lesson_slug, count(*) from
       self_assessment_attempts group by 1,2,3 having count(*) > 1;`
      — **Desarrollo: 0** (base reseteada durante spec-039, sin histórico).
      **Producción: 0** (verificado por lectura directa vía `service_role`,
      autorizada explícitamente por el usuario para esta consulta).
- [x] Medir la diferencia de nota entre el criterio "más antiguo" y el criterio
      "mejor intento" por estudiante y curso. — **No aplica: 0 grupos
      duplicados en producción**, no hay nada que comparar.
- [x] Contar cuántos estudiantes tienen lecciones **vistas y no respondidas**
      (esos reciben una nota más baja de lo que esperan en cuanto se recalcule).
      — **Producción: 1 estudiante, 13 lecciones vistas, 0 respondidas.**
      **Desarrollo: 0** (sin datos).
- [x] **Presentar los tres números al usuario y obtener confirmación del
      criterio de deduplicación y del alcance retroactivo** antes de la Fase 1.
      — Presentado; el usuario confirmó proceder. Con 0 duplicados reales, el
      criterio de D2 (conservar el intento más antiguo) no tiene efecto
      práctico en los datos actuales, pero se implementa igual en la
      migración como comportamiento correcto ante cualquier duplicado futuro
      (desarrollo, o producción antes del deploy de este spec).

### Fase 1 — Esquema: intento único, respuestas y `kind` — ✅ Completada (2026-08-02)
- [x] Migración `..._dedupe_and_unique_self_assessment_attempts.sql`
      (archivo + dedup + `unique`), con el criterio confirmado en Fase 0 —
      timestamps `20260802*` para no colisionar con los `20260801*` de
      spec-039 (rama distinta, aún no mergeada)
- [x] Migración `..._init_self_assessment_attempt_answers.sql` + su RLS (dos
      archivos: init + rls, como en el DDL del spec)
- [x] Migración `..._add_kind_to_grade_items.sql`
- [x] `rsync` de las migraciones a `mirp-lab` + `supabase db reset` allá y
      verificación de que el esquema reconstruye sin errores — reconstruido
      limpio junto con las migraciones de spec-039, ya presentes en esa
      instancia de una sesión anterior. Re-aplicados a mano los `GRANT`
      estándar de `anon`/`authenticated`/`service_role` (nota de
      mantenimiento del CLI en `CLAUDE.md`).

### Fase 2 — Esquema: RPCs de cálculo y propagación — ✅ Completada (2026-08-02)
- [x] Migración `..._self_assessment_grade_rpcs.sql` con las cuatro funciones
- [x] Decidir e implementar el BLOQUE 039 según el estado de spec-039: **se
      omite** (spec-039 vive en `feat/lecciones-habilitadas`, no mergeada a
      `development` al implementar este spec) — deuda registrada como
      **DEBT-043** en `docs/specs/backlog.md`
- [x] Verificar en `mirp-lab`: casos denominador 0, lección vista sin
      responder, dos matrículas activas del mismo `course_slug`, ítem
      inexistente — los 4 casos verificados con datos desechables vía
      `service_role` (docente + 2 estudiantes + 2 cursos académicos + 2
      preguntas), invocando los RPCs directamente y confirmando resultados;
      todo el dato de prueba se creó y se borró en la misma pasada (0 filas
      remanentes verificadas después).
- [x] **Hallazgo de seguridad detectado y corregido en el mismo paso**: el
      `GRANT ALL ON ALL FUNCTIONS` que corrige el defecto del CLI (arriba)
      había **sobrescrito** el `revoke` explícito de la migración sobre
      `apply_self_assessment_grade` — esa función recibe `p_user_id`
      directamente, así que dejarla ejecutable por `authenticated` habría
      sido una escalada de privilegios real (cualquier estudiante podría
      escribir la nota de otro). Se re-aplicó el `revoke` a mano y se
      verificó `has_function_privilege(...) = false` para `anon` y
      `authenticated`. **Nota operativa para futuras migraciones de este
      proyecto**: cualquier `GRANT ALL ON ALL FUNCTIONS` posterior a una
      migración con un `revoke` explícito debe re-verificar ese `revoke`.

### Fase 3 — Backend: bloqueo de reintentos y disparadores
- [ ] `SubmitSelfAssessmentResult`: nuevo `reason: 'already_submitted'`
- [ ] `submitSelfAssessment`: comprobar intento previo antes de calificar;
      persistir `self_assessment_attempt_answers` con el `id` del intento
      (`.insert(...).select('id').single()`); mapear el error `23505` a
      `already_submitted`; invocar `recalculate_self_assessment_grade`;
      `revalidatePath('/cuenta/cursos')`
- [ ] `markLessonViewed`: distinguir inserción de actualización y recalcular
      **solo** cuando la fila de `lesson_progress` sea nueva
- [ ] `getAttemptReview(courseSlug, lessonSlug)`: intento + respuestas por
      pregunta + opciones correctas
- [ ] `getSelfAssessmentCourseSummary(courseSlug)`: nota, acumulado y desglose
      por lección (lee `self_assessment_breakdown`)
- [ ] `deleteGradeItem`: rechazar `kind = 'self_assessment'` con mensaje claro

### Fase 4 — UI del estudiante — ✅ Completada (2026-08-02)
- [x] `SelfAssessmentSection`: aviso de intento único visible desde la carga
- [x] `SelfAssessmentSection`: paso de confirmación explícita antes del envío
- [x] `SelfAssessmentSection`: **eliminar** el botón "Reintentar" y `handleRetry`
- [x] `SelfAssessmentSection`: revisión permanente del intento por pregunta
      (respuesta marcada, acierto/fallo, opciones correctas), sustituyendo el
      resumen agregado de spec-033 — controlada por la prop `attemptReview`
      (`null` = formulario; con datos = revisión, sin formulario posible)
- [x] `LessonClosureFlow`: eliminar `isRetrying` / `onRetryingChange` — el
      componente dejó de necesitar estado de cliente y pasó a ser un server
      component
- [x] `page.tsx` de la lección: cargar y pasar `getAttemptReview`
- [x] Tarjeta "Autoevaluaciones" (nota, acumulado, desglose por lección con las
      no respondidas explícitas) — implementada como componente propio
      (`SelfAssessmentSummaryCard`) renderizado junto a `EnrollmentDetail` en
      `app/cuenta/cursos/[enrollmentId]/page.tsx`, en vez de modificar la
      interfaz de `EnrollmentDetail` (que no tenía un punto de extensión para
      secciones adicionales)
- [x] Tokens semánticos y modo claro/oscuro según `DESIGN.md` — mismos
      patrones de color que `LessonClosure`/`SelfAssessmentSection` ya usaban
      (`text-danger`, `bg-yellow-50 dark:bg-yellow-900/20`, etc.)

### Fase 5 — UI y acción del docente — ✅ Completada (2026-08-02)
- [x] Server Action `recalculateCourseSelfAssessmentGrades(academicCourseId)`
      en `lib/grades/actions.ts` — la autorización real vive en el RPC
      (devuelve `0` sin tocar nada si el llamador no es el docente dueño ni
      admin); `requireUser()` solo descarta visitantes anónimos
- [x] Botón "Recalcular autoevaluaciones" en la libreta del curso
      (`RecalculateSelfAssessmentButton`), con confirmación y reporte de
      cuántas matrículas se actualizaron
- [x] Desglose por estudiante accesible desde la libreta
      (`SelfAssessmentGradeCell`, expandible bajo demanda) — usa una función
      nueva, `getSelfAssessmentBreakdownForEnrollment`, que verifica en la
      sesión del docente que es dueño del curso académico (o admin) y luego
      lee con `service_role`, porque `self_assessment_breakdown` no es
      `security definer` y la RLS de `lesson_progress`/
      `self_assessment_attempts` no concede lectura a un docente no-admin
- [x] Texto de ayuda con la regla de cálculo y el efecto de publicar preguntas
      nuevas (D6), en el propio botón de recálculo
- [x] Además: celda de solo lectura para el ítem `kind = 'self_assessment'`
      en `GradesTable` (editarla a mano quedaría pisada por el siguiente
      recálculo) y bloqueo del botón "Eliminar" en `GradeItemsPanel` para ese
      mismo ítem, con la etiqueta "Automático" — no estaba en el checklist
      literal pero es consecuencia directa de D5 ("la nota es derivada") y del
      rechazo ya implementado en `deleteGradeItem` (Fase 3)

### Fase 6 — Aplicación retroactiva controlada
- [ ] Verificar en `mirp-lab` con datos representativos
- [ ] Aplicar migraciones en producción (**requiere confirmación explícita del
      usuario en la sesión**, `supabase db push --project-ref bgiimadnmqnoqmdbudpo`)
- [ ] **No** hacer backfill automático en la migración: el docente dispara el
      recálculo curso por curso desde la UI, para elegir cuándo aparece la nota
- [ ] Revisar las notas resultantes de un curso antes de recalcular el resto

### Fase 7 — MCP: actualizar `students-mcp` — ✅ Completada (2026-08-02)
- [x] Endpoint de lectura `GET /api/students/:id/self-assessment?course_slug=`
      (autenticado con `STUDENTS_ADMIN_API_KEY`) — el `npm run dev` de la
      sesión anterior había quedado colgado (proceso vivo, 0% CPU, sin
      responder ninguna ruta, ni siquiera `/login`); se reinició y se
      verificaron por HTTP los cuatro casos de error (`401` sin `x-api-key`,
      `404` con UUID inválido, `422` sin `course_slug`, `404` con estudiante
      inexistente) y el caso `200` con un estudiante real desechable
      (creado y borrado vía `students-mcp`/API en la misma pasada, sin
      intentos de autoevaluación): `{ score: null, correct_total: 0,
      question_total: 0, lessons: [] }` — confirma D4 (nunca `0.00` con
      denominador 0).
- [x] Herramienta `get_student_self_assessment_summary` en `students-mcp`
- [x] Actualizar la entrada de `students-mcp` en `docs/mcps/README.md`
- [x] Actualizar `docs/mcps/students-agent.system-prompt.md`: nueva capacidad +
      restricción explícita de que la nota de autoevaluaciones **no es editable**
- [x] Verificar el servidor de forma aislada
      (`./mcp-servers/run-local-mcp.sh students-mcp </dev/null`)

### Fase 8 — Pruebas
- [ ] Ejecutar `docs/testing/test-040-autoevaluacion-nota-unica.md` con el usuario
- [ ] Invocar `@tester` para las pruebas automáticas (cuando exista framework)

## Criterios de aceptación

1. Un estudiante que ya envió la autoevaluación de una lección **no puede
   enviarla de nuevo**: no hay botón de reintento, y una invocación directa de
   `submitSelfAssessment` devuelve `already_submitted` sin insertar fila.
2. Dos envíos concurrentes de la misma autoevaluación producen **una sola** fila
   en `self_assessment_attempts`; el segundo devuelve `already_submitted`.
3. Antes de enviar, el estudiante ve el aviso de intento único y debe confirmar
   explícitamente; cancelar la confirmación **no** envía nada.
4. Tras recargar la lección, el estudiante ve su intento **por pregunta**: lo que
   marcó, si acertó y cuál era la respuesta correcta.
5. Con 5 lecciones vistas de 5 preguntas cada una y 20 correctas, el ítem
   "Autoevaluaciones" de la libreta muestra **4.00**.
6. Al abrir una sexta lección de 5 preguntas sin responderla, la nota baja a
   **3.33** (`20/30 * 5`) sin ninguna acción adicional del estudiante.
7. Al responder esa sexta lección con 4 correctas, la nota sube a **4.00**
   (`24/30 * 5 = 4.00`).
8. Un estudiante sin ninguna lección vista con preguntas publicadas **no** tiene
   ítem "Autoevaluaciones" en la libreta (no aparece un 0.00).
9. Si el docente no había creado el ítem, la primera propagación lo crea con
   nombre "Autoevaluaciones"; una segunda propagación **no** crea un duplicado,
   ni siquiera si el docente lo renombró.
10. El docente no puede eliminar el ítem de autoevaluaciones: recibe un mensaje
    explicativo. Sí puede renombrarlo sin romper la propagación.
11. Publicar una pregunta nueva en una lección ya respondida **no** cambia la
    nota de quien ya la respondió; sí cambia el denominador de quien la vio y no
    la respondió.
12. Tras la migración de deduplicación, no existen dos filas de
    `self_assessment_attempts` con el mismo `(user_id, course_slug,
    lesson_slug)`, y cada fila eliminada tiene su copia en
    `self_assessment_attempts_discarded`.
13. Un estudiante no puede escribir la nota de otro invocando
    `recalculate_self_assessment_grade` por la API REST (la función no acepta
    `user_id`), ni `apply_self_assessment_grade` (sin `execute` para
    `authenticated`).
14. Un docente que no es dueño del curso obtiene `0` de
    `recalculate_course_self_assessment_grades` y no altera ninguna nota.
15. El estudiante ve en `/cuenta/cursos/[enrollmentId]` su acumulado
    (`X/Y correctas`), su nota y el desglose por lección con las **no
    respondidas señaladas explícitamente**.
16. (MCP) El agente puede invocar `get_student_self_assessment_summary` y
    obtener nota, acumulado y desglose por lección de un estudiante; no dispone
    de ninguna herramienta que modifique esa nota.

## Riesgos y deuda derivada

- **Sin vía de reparación para un intento fallido.** Con intento único y sin
  política RLS de `delete`, un estudiante que envíe por error (fallo de red a
  medio formulario, clic accidental pese a la confirmación) queda con esa nota
  para siempre y **el docente no tiene forma de habilitarle un segundo intento
  desde la UI**. Es la deuda más probable de necesitar pronto en un semestre
  real. Registrar en `docs/specs/backlog.md` como candidata a spec propio
  (acción de admin "anular intento", moviendo la fila a
  `self_assessment_attempts_discarded` y recalculando).
- **Filtración de la clave entre compañeros.** Ya ocurre hoy, pero con nota de
  por medio el incentivo cambia. Coordinar con **spec-038**.
- **Cambio retroactivo del resultado de estudiantes reales** (D2). Mitigado por
  el archivado y por el diagnóstico previo de la Fase 0, pero es una decisión
  del docente, no técnica.
- **Aparición de notas que los estudiantes no esperaban.** El primer recálculo
  hará visible una nota construida sobre meses de uso formativo. Debe
  comunicarse a los estudiantes **antes** de ejecutarlo; es la razón por la que
  el backfill es manual y curso por curso (Fase 6) y no automático.
- **Escritura en libreta en el camino de renderizado.** `markLessonViewed` corre
  en el `page.tsx` de cada lección. La corrección de la Fase 3 (recalcular solo
  al insertar) es indispensable: sin ella, cada carga de página escribiría en
  `student_grades`.
- **`markLessonUncompleted` no borra `viewed_at`**, así que "descompletar" una
  lección no la saca del denominador. Es coherente ("la vio"), pero conviene
  documentarlo en la ayuda del docente.

## Pruebas asociadas

> Estos archivos se crean junto con el spec. **Pendiente**: este spec se redactó
> con la instrucción de no tocar ningún archivo fuera de él, así que
> `docs/testing/test-040-autoevaluacion-nota-unica.md` **debe crearse antes de
> solicitar la aprobación de implementación**, con al menos los casos listados
> abajo.

- **Manuales:** `docs/testing/test-040-autoevaluacion-nota-unica.md`
  - `TC-001` — Aviso de intento único visible antes de responder
  - `TC-002` — Confirmación explícita: cancelar no envía
  - `TC-003` — Envío exitoso y desaparición del botón "Reintentar"
  - `TC-004` — Recarga de la lección: revisión por pregunta persistente
  - `TC-005` — Segundo envío bloqueado con el mensaje de intento único
  - `TC-006` — Nota 4.00 con 20/25 en la libreta y en `/cuenta/cursos`
  - `TC-007` — Ver una lección nueva baja la nota a 3.33 sin más acciones
  - `TC-008` — Responder esa lección sube la nota a 4.00
  - `TC-009` — Desglose del estudiante marca las lecciones sin responder
  - `TC-010` — Sin lecciones evaluables no aparece ítem en la libreta
  - `TC-011` — El docente no puede borrar el ítem; sí renombrarlo
  - `TC-012` — "Recalcular autoevaluaciones" actualiza todo el curso
  - `TC-013` — Publicar una pregunta nueva no altera la nota de quien respondió
  - `TC-MCP-001` — `get_student_self_assessment_summary` devuelve nota,
    acumulado y desglose
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-040-autoevaluacion-nota-unica.spec.ts`
  — un caso por criterio de aceptación, en rojo desde el inicio (cuando exista
  framework de testing; ver `CLAUDE.md` → "Testing").

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-01
