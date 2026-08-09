# Backlog — Deuda técnica y pendientes

Registro de ítems que no se abordan en su spec original pero que deben
resolverse antes de salir a producción o en una iteración posterior.

---

## DEBT-058 — Warning de hidratación por `<Script id="theme-init">` en `RootLayout`

**Origen:** ronda manual de test-044 (TC-013), overlay de dev de Next.js al
abrir cualquier página en modo desarrollo
**Prioridad:** Baja — solo visible en el overlay de dev; no afecta build de
producción (verificado en verde) ni el comportamiento observado para el
usuario

Next.js muestra en el overlay de dev un `Console Error`: *"Encountered a
script tag while rendering React component. Scripts inside React components
are never executed when rendering on the client. Consider using template tag
instead."*, señalando `app/layout.tsx:48:9` — el script inline
`id="theme-init"` que `DESIGN.md` documenta para evitar el FOUC del modo
oscuro (`document.documentElement.classList.toggle('dark', ...)` antes del
bundle).

No es específico de ninguna ruta ni relacionado con spec-044 — apareció al
navegar a `/apuntes`, pero se reproduce en cualquier página del sitio en modo
`next dev`.

**Acción:** Investigar si `next/script` con `strategy="beforeInteractive"` (ya
usado, ver `app/layout.tsx:48`) sigue siendo la forma correcta de inyectar
este script en Next 16, o si el warning indica que debe moverse fuera del
árbol de componentes React (ej. inyectado directamente en el `<head>` del HTML
servido, sin pasar por el componente `Script`). Confirmar que no degrada a un
error real en algún flujo de producción antes de descartarlo como puramente
cosmético.

---

## DEBT-057 — `code_snippet`/`code_language` no se persisten para `code_write`/`coding_challenge`

**Origen:** ronda manual de test-043 (preparación de datos para TC-043-007),
al crear la pregunta Q6 (`code_write`) vía `question-bank-mcp`
**Prioridad:** Media — el campo dedicado de código queda inutilizable para
estos dos tipos, aunque el resto de la pregunta funciona

`create_question` y `update_question` aceptan `code_snippet`/`code_language`
en el payload (el MCP los envía y la respuesta HTTP no reporta error), pero al
releer la pregunta —tanto por `get_question` como por consulta directa a la
tabla `questions`— `code_snippet` queda `null`. `code_language` sí se
persiste. Reproducido dos veces: una en `create_question`, otra en
`update_question` sobre la misma pregunta, ambas sin efecto.

No se investigó la causa raíz (probablemente en `/api/questions` — validación
Zod que descarta el campo, o mapeo incompleto en el insert/update del
servicio). Queda fuera del alcance de spec-043, que no toca ese endpoint.

**Impacto:** cualquier pregunta `code_snippet`, `code_write` o
`coding_challenge` que dependa del bloque de código dedicado (no del `stem`)
no lo muestra en ninguna superficie, porque el dato nunca llegó a la base.

**Acción:** revisar `app/api/questions/route.ts` (POST) y
`app/api/questions/[questionId]/route.ts` (PATCH) — o el servicio que
componen — para confirmar por qué `code_snippet` se descarta mientras
`code_language` sí pasa. Añadir un caso de prueba automática que cubra
explícitamente la persistencia de `code_snippet` en creación y actualización.

---

> **Bloque A11Y-SORDOS (DEBT-047 … DEBT-051)** — hallazgos de la revisión de
> accesibilidad del 2026-08-05, motivada por la matrícula de estudiantes
> sordos en `programacion-cientifica` (curso presencial, Nodo como apoyo).
> Criterio común a los cinco: **el rol de Nodo es convertir lo efímero-hablado
> del salón en persistente-textual/visual**. No son ítems de WCAG genérico
> (contraste, teclado, screen reader) — esa auditoría es un trabajo distinto y
> de menor impacto para este perfil. Priorizados de mayor a menor impacto:
> DEBT-047 > DEBT-048 > DEBT-049 > DEBT-050 > DEBT-051.
>
> Cuatro acciones adicionales de esta misma revisión **no generaron ítem de
> backlog** porque no requieren código y se resuelven con operación del curso:
> publicar la lección *antes* de la clase (`courses-mcp`,
> `set_lesson_availability`); auditar las guías de laboratorio de
> `programacion-cientifica` para eliminar dependencias de la explicación oral
> ("como expliqué en clase"); dar acceso anticipado al intérprete
> (matricularlo vía `students-mcp` y abrirle las lecciones); y proyectar
> siempre el código de asistencia en pantalla en vez de dictarlo — relevante
> tras spec-041, que permite refrescarlo en mitad de la sesión.

---

## DEBT-056 — `DROP` de `questions.course_slug`/`lesson_slug`/`tags`, deprecadas por spec-042

**Origen:** spec-042 (D1), 2026-08-06.
**Prioridad:** Media — sin impacto funcional mientras existan (nadie las lee
ni las escribe desde la Fase 3 de spec-042), pero es esquema muerto que
confunde a quien lo lea sin este contexto.

D1 de spec-042 decidió deliberadamente **no** eliminar estas tres columnas en
el mismo spec: el backfill de `lesson_questions`/`keywords` alimenta el
denominador de la nota de autoevaluación (spec-040), y mientras las columnas
sigan ahí la consulta de paridad de la Fase 2 se puede volver a correr contra
producción si algo no cuadra tras el despliegue. Quedaron marcadas con
`comment on column ... is 'DEPRECADO spec-042: ...'`
(`supabase/migrations/20260806000003_deprecate_question_slug_columns.sql`).

**Acción:** tras un ciclo completo en producción sin necesidad de reejecutar
la verificación de paridad, abrir un spec de seguimiento que:
- Reejecute las tres consultas de verificación de
  `docs/testing/test-042-banco-preguntas-keywords.md` contra producción una
  última vez.
- `DROP COLUMN` de `course_slug`, `lesson_slug` y `tags` en `questions`.
- Elimine el índice `(course_slug, lesson_slug)` de
  `20260715000000_init_questions.sql` si sigue existiendo sin uso.
- Confirme que ningún código (incluido `question-bank-mcp`) sigue
  referenciando estas columnas antes del `DROP`.

---

## DEBT-055 — `list_questions`/`GET /api/questions` ignora en silencio el filtro `tag` retirado

**Origen:** Ronda manual `test-042-banco-preguntas-keywords.md`, TC-MCP-042-013,
2026-08-06.
**Prioridad:** Baja — no hay pérdida de datos ni contrato roto; es una
superficie de confusión para el agente.

spec-042 sustituyó el filtro `tag` de `GET /api/questions` (y de la
herramienta MCP `list_questions`) por `keyword`. `tag` ya no existe en
`ListQuestionsFiltersSchema` (`lib/questions/schemas.ts`), así que un agente
que siga enviándolo por costumbre no recibe ningún error: Zod descarta la
propiedad desconocida en silencio y la ruta responde con el listado
**sin filtrar** (todas las preguntas), no con las preguntas de esa etiqueta.
Un agente puede leer eso como "cero resultados para ese tag" o, peor, confiar
en que sí filtró.

Esto no incumple ningún criterio de aceptación escrito de spec-042: D2 solo
exige rechazo explícito en el **cuerpo** de `POST`/`PATCH /api/questions`
(`course_slug`/`lesson_slug`/`tags`), nunca se comprometió con los query
params de lectura. Es una mejora de robustez, no una corrección de contrato.

**Acción sugerida:** validar `ListQuestionsFiltersSchema` con `.strict()` (o
un chequeo explícito equivalente al de `findLegacyQuestionFields` para el
cuerpo) para que `GET /api/questions?tag=...` devuelva `422` en vez de
ignorar el parámetro. Aplicar el mismo criterio a `list_lesson_questions` si
en algún momento acepta filtros adicionales.

---

## DEBT-054 — Lecturas transitoriamente inconsistentes bajo llamadas MCP concurrentes por el mismo pipe stdio

**Origen:** Ronda manual `test-042-banco-preguntas-keywords.md`,
TC-MCP-042-004 y TC-MCP-042-008, 2026-08-06.
**Prioridad:** Baja — no reprodujo en llamadas aisladas; posible artefacto de
infraestructura de la ronda, no defecto de código confirmado.

Durante la ejecución de varias llamadas a `question-bank-mcp` disparadas de
forma concurrente por el mismo pipe stdio (patrón usado solo para acelerar
esta ronda de pruebas, no el uso real de un cliente MCP, que invoca
herramientas una a la vez), se observaron dos lecturas anómalas:

1. `create_keyword` para un slug nuevo (`spec042-kind-null`) devolvió un
   `409` ("ya existe") pese a que la fila se creó correctamente — confirmado
   consultando la keyword directamente después.
2. Inmediatamente después de un `update_question` que reemplazaba
   `keywords: ["python"]`, un `get_question` de la misma pregunta mostró
   `keywords: []` por un instante; una relectura momentos después mostró el
   valor correcto y estable.

Ninguno de los dos se reprodujo en una llamada aislada (sin concurrencia).
Coincide en el tiempo con dos caídas del túnel SSH hacia `mirp-lab` durante
la misma sesión de implementación (ver Fase 0/Fase 5 de
`docs/specs/spec-042-banco-preguntas-keywords.md`), así que el diagnóstico más
probable es inestabilidad de la conexión Postgres tunelizada, no una
condición de carrera real en `_createKeywordForActor`/`_updateQuestionForActor`
(que sí documentan explícitamente la carrera esperada entre dos clientes
reales creando el mismo slug — ver D3 del spec — pero ese no es el escenario
que se reprodujo aquí, no había dos clientes apuntando al mismo slug).

**Acción sugerida:** si vuelve a observarse contra producción (conexión
directa, sin túnel SSH) o bajo carga concurrente real de un agente, investigar
si `createServiceSupabaseClient()` (`lib/auth/service.ts`, cliente singleton
por proceso) tiene algún problema de aislamiento entre invocaciones
concurrentes de la misma ruta API. Mientras tanto, no bloquea el cierre de
spec-042: el estado final de los datos siempre fue el correcto.

---

## DEBT-053 — Error de hidratación recuperable en el contador "Expira en: mm:ss" de `AdminAttendancePanel` al abrir una segunda pestaña

**Origen:** Ronda manual `test-041-refrescar-codigo-asistencia.md`, TC-008,
2026-08-06 — hallazgo colateral, no bloqueante.
**Prioridad:** Baja — Next.js regenera el árbol en cliente automáticamente
("Recoverable Error"); no se observó pérdida de funcionalidad.

Al abrir una segunda pestaña con la vista docente de la lección (necesario
para TC-008, que simula el docente con el panel abierto en dos lugares a la
vez), React reportó un hydration mismatch en el `<span>` del contador "Expira
en: mm:ss" de `AdminAttendancePanel.tsx:391`:

```
+  12:53   (server)
-  12:54   (client)
```

**Causa probable:** el valor se computa a partir de `code_expires_at` y
`Date.now()` en el render, y el segundo puede diferir entre el render de
servidor (SSR de la segunda pestaña) y la primera pintada en cliente —
exactamente el patrón que React documenta como causa típica de este error
("Variable input such as `Date.now()` ... which changes each time it's
called"). No se investigó más a fondo: es preexistente (el cálculo del
countdown no lo tocó spec-041) y no bloqueó ninguna prueba.

**Fix sugerido:** no renderizar `timeRemaining` en el primer render de
servidor (devolver `null`/placeholder hasta que el `useEffect` lo calcule en
cliente), o envolver el valor inicial en `suppressHydrationWarning` si el
parpadeo de 1s es aceptable. Requiere decidir cuál, y verificar que no
reintroduce el problema que motivó calcular `timeRemaining` de forma
inmediata tras un refresco (spec-041, Decisión 8, punto 1).

---

## DEBT-052 — `openSession`/`closeSession` revalidan `/admin/courses` (ruta muerta): el panel muestra estado obsoleto al remontar tras cambiar de grupo — ✅ Resuelto (spec-041, 2026-08-06)

**Origen:** Ronda manual `test-041-refrescar-codigo-asistencia.md`, TC-011,
2026-08-06 — falló al confirmar que rotar el código de un grupo no afecta al
otro.
**Prioridad:** Media — reproducible en el flujo normal de un docente con
varios grupos; no hay pérdida de datos, pero el panel proyectado en clase
puede mostrar "sin sesión de asistencia abierta" para una sesión que sí está
abierta.

**Resuelto (2026-08-06):** al reproducir el mismo síntoma con `openSession`
durante el re-test de TC-011 (abrir sesión en ambos grupos y cambiar entre
ellos mostraba "sin sesión abierta" sin haber tocado extender/rotar), se
amplió el alcance de spec-041 para corregir también `openSession` y
`closeSession` con el mismo patrón que ya se había aplicado a
`extendSessionCode`/`rotateSessionCode`. Las cuatro acciones de
`lib/attendance/index.ts` reciben ahora `courseSlug`/`lessonSlug` y revalidan
`/${courseSlug}/${lessonSlug}` en vez de `/admin/courses`. Ver spec-041,
Decisión 11.

**Causa raíz (confirmada durante la investigación de TC-011):**
`AdminAttendancePanel` recibe su estado inicial como prop (`initialSession`)
desde `page.tsx` (`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:176`, vía
`getOpenSessionForCourse` por curso académico) — un snapshot tomado una sola
vez en el render del servidor. `TeacherAttendanceControl` monta el panel con
`key={selectedCourse.id}` (`components/courses/TeacherAttendanceControl.tsx`):
cambiar de grupo **desmonta** el panel del grupo anterior y **remonta** uno
nuevo, releyendo ese mismo snapshot congelado — porque cambiar de grupo es
puramente cliente (cookie + `useState`), sin navegación, así que el snapshot
del servidor nunca se refresca.

`openSession` no llama `revalidatePath` en absoluto; `closeSession` llama
`revalidatePath('/admin/courses', 'layout')` — la subruta que creó spec-010 y
que **ya no existe** desde que spec-031 movió el panel a la vista de lección
(`/${courseSlug}/${lessonSlug}`). Revalidar esa ruta muerta no tiene ningún
efecto sobre la página real donde vive el panel hoy.

**Resultado:** si el docente abre o cierra una sesión en un grupo y luego
cambia a otro grupo y vuelve, el panel remontado puede mostrar un estado que
no coincide con la base de datos (ej. "sin sesión abierta" para una sesión
que sí está abierta).

**No corregido aquí:** `spec-041` (2026-08-06) encontró y corrigió el mismo
defecto en `extendSessionCode`/`rotateSessionCode` — las dos acciones que ese
spec introdujo — pasándoles `courseSlug`/`lessonSlug` y apuntando
`revalidatePath` a la ruta real (ver `lib/attendance/index.ts`). Se decidió
explícitamente **no** extender el fix a `openSession`/`closeSession` en esa
misma sesión para no ampliar el alcance del spec más allá de lo que su propia
ronda de pruebas (`test-041`) cubre; queda registrado aquí para una
corrección posterior con el mismo patrón.

**Fix:** aplicar el mismo cambio que ya recibieron `extendSessionCode` /
`rotateSessionCode`: agregar `courseSlug`/`lessonSlug` a las firmas de
`openSession` y `closeSession`, enhebrarlos desde `AdminAttendancePanel`
(que ya los recibe como prop tras el fix de spec-041) hasta las llamadas, y
usar `revalidatePath(\`/${courseSlug}/${lessonSlug}\`)` en vez de
`/admin/courses`.

---

## DEBT-051 — Los diagramas Mermaid no tienen descripción textual

**Origen:** Revisión de accesibilidad para estudiantes sordos, 2026-08-05
(bloque A11Y-SORDOS)
**Prioridad:** Baja — mejora transversal, sin bloqueo funcional

`components/mdx/MermaidDiagram.tsx` renderiza el diagrama sin `aria-label`,
sin `title` ni ningún equivalente textual: no hay una sola ocurrencia de
`aria-`, `alt` o `caption` en el componente. Un diagrama que solo existe como
grafo no se puede repasar en prosa, no es buscable y depende de que alguien lo
explique — normalmente de viva voz en clase.

**Acción:** Prop opcional `description` (o slot MDX) que renderice un párrafo
explicando el diagrama, más un `aria-label` derivado. Convención en la skill
`lesson-authoring` para que las lecciones nuevas lo incluyan por defecto.

---

## DEBT-050 — El límite de tiempo de una evaluación es global por grupo: no admite tiempo extendido por estudiante

**Origen:** Revisión de accesibilidad para estudiantes sordos, 2026-08-05
(bloque A11Y-SORDOS)
**Prioridad:** Media — se vuelve Alta si se aplica una evaluación calificable
con temporizador a un estudiante sordo

`time_limit_minutes` vive en el grupo de evaluación (`lib/assignments/types.ts:16`,
`lib/assignments/service.ts:45`) y llega al reproductor como un único valor
(`AssignmentPlayer.tsx:15`, countdown en `AssignmentPlayer.tsx:35-65`). No hay
forma de conceder tiempo adicional a un estudiante concreto sin alargar la
evaluación para todo el grupo.

Para un usuario nativo de lengua de señas, **el español escrito es segunda
lengua**: leer el enunciado cuesta más tiempo, no menos comprensión. El tiempo
extendido es un ajuste razonable reconocido, no una ventaja.

**Acción:** Factor de tiempo extendido por matrícula (ej. `extra_time_factor`
en `enrollments`, por defecto `1.0`), aplicado al calcular el `deadline` en
`useCountdown`. Requiere migración, exposición en el panel admin y,
probablemente, en `students-mcp`. Verificar además que **ningún aviso de tiempo
dependa de audio**: hoy el único indicador es visual (`countdownUrgent`,
`AssignmentPlayer.tsx:150`) — mantenerlo así.

---

## DEBT-049 — No hay canal de avisos en texto durante la clase

**Origen:** Revisión de accesibilidad para estudiantes sordos, 2026-08-05
(bloque A11Y-SORDOS)
**Prioridad:** Media

Las instrucciones que el docente da a mitad de sesión ("pasen al ejercicio 3",
"el laboratorio se entrega el viernes") solo existen habladas. El estudiante
sordo depende de que alguien se las repita, con retraso y pérdida.

Ya existe la infraestructura donde encajaría: `TeacherLessonPanel`
(`components/courses/TeacherLessonPanel.tsx`) es el panel del docente sobre la
lección, y `AttendanceSection` ya demuestra el patrón de estado de sesión en
vivo del lado del estudiante.

**Acción:** Mensaje en vivo que el docente publica desde el panel de la lección
y los estudiantes ven en la página de la lección. Decidir el mecanismo de
propagación (Supabase Realtime vs. polling) al redactar el spec.

---

## DEBT-048 — No existe glosario técnico por curso

**Origen:** Revisión de accesibilidad para estudiantes sordos, 2026-08-05
(bloque A11Y-SORDOS)
**Prioridad:** Media-Alta — el hallazgo menos obvio y de mayor impacto
pedagógico

En LSC no hay señas estandarizadas para prácticamente ningún término del curso
(*broadcasting*, vectorización, `DataFrame`, complejidad amortizada). Sin
vocabulario acordado, cada intérprete improvisa y el término cambia de seña
entre sesiones. Hoy los términos solo viven dispersos en el cuerpo de los
`.mdx`.

**Acción:** Glosario por curso —`término → definición corta → seña acordada
(imagen o video corto) → lecciones donde aparece`— mantenido junto con el
intérprete. Beneficia a todo el grupo (repaso, búsqueda); para estos
estudiantes es habilitante. Evaluar si el contenido vive en
`content/cursos/<curso>/glosario/` (versionado, coherente con el modelo MDX
actual) o en base de datos.

---

## DEBT-047 — `YouTubeEmbed` no activa subtítulos ni admite transcripción

**Origen:** Revisión de accesibilidad para estudiantes sordos, 2026-08-05
(bloque A11Y-SORDOS)
**Prioridad:** Alta — es el hueco más directo: un video sin subtítulos es
contenido del curso que un estudiante sordo simplemente no recibe

`components/mdx/YouTubeEmbed.tsx:43` construye la URL del embed con
`autoplay=1` como único parámetro:

```ts
const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1${...}`;
```

No hay `cc_load_policy`, ni `cc_lang_pref`, ni `hl`, ni ninguna vía para
adjuntar una transcripción. El componente tampoco expone si el video tiene
subtítulos, así que el estudiante lo descubre después de abrirlo.

**Acción (tres partes):**
1. Añadir `cc_load_policy=1&cc_lang_pref=es&hl=es` a `embedSrc` para que los
   subtítulos arranquen activos.
2. Prop `transcript` (o slot MDX) que renderice la transcripción en texto bajo
   el video, colapsable. **Es la parte que más importa**: los subtítulos
   automáticos de YouTube en español destrozan el vocabulario técnico; el valor
   real está en una transcripción revisada.
3. Indicador visible "Con subtítulos revisados / Sin subtítulos" para que el
   estudiante lo sepa antes de invertir el tiempo.

Candidato natural a ser el primer spec del bloque: alcance acotado, un solo
componente, sin migración.

---

## DEBT-046 — La policy de `update` de `class_sessions` no tiene `with check`: un `update` puede reasignar la sesión a otro curso

**Origen:** Análisis de impacto de `spec-041` (refrescar el código de asistencia),
2026-08-05 — detectado al confirmar que refrescar el código no necesitaba policy
nueva
**Prioridad:** Media — no hay explotación conocida hoy; requiere migración y su
propia ronda de pruebas

`class_sessions_mutate_owner_or_admin`
(`supabase/migrations/20260716000001_rls_attendance.sql:22`) define la policy
`for update` con `using (...)` pero **sin `with check (...)`**:

```sql
create policy "class_sessions_mutate_owner_or_admin" on public.class_sessions
  for update
  using ( ...docente dueño o admin... );
  -- falta: with check ( ...mismo predicado sobre la fila resultante... )
```

En Postgres, una policy `for update` sin `with check` valida **solo la fila
original** contra `using`; la fila **resultante** no se valida contra nada. Es
decir: un docente dueño del curso X puede ejecutar un `update` que cambie
`academic_course_id` al curso Y de **otro docente**, y la policy lo permite —
la fila que sale ya no le pertenece, pero nadie lo comprueba. Se llevaría con
ella todas sus `attendance_records` (cuelgan de `session_id`, no del curso),
contaminando el roster y el `attendance_pct` del curso ajeno.

Contrasta con `class_sessions_insert_owner_or_admin`, definida justo debajo,
que **sí** usa `with check` con el mismo predicado: la asimetría parece un
descuido de spec-010, no una decisión.

**No es explotable desde la aplicación hoy:** ninguna Server Action de
`lib/attendance/index.ts` escribe `academic_course_id` (`openSession` lo fija en
el `insert`, `closeSession` solo toca `is_open`, y las dos acciones nuevas de
spec-041 solo tocan `attendance_code` / `code_expires_at`). La vía sería un
cliente hablando directo con PostgREST con el JWT de un docente.

**No se corrigió en spec-041** a propósito: es un hallazgo preexistente ajeno a
refrescar un código, y tocar una policy exige migración —que spec-041 declara
explícitamente fuera de alcance (D3)— más verificación en `mirp-lab` y despliegue
a producción.

**Fix:** migración nueva que haga `alter policy class_sessions_mutate_owner_or_admin
... with check (<mismo predicado que using>)`. Al hacerlo, **auditar el resto de
policies `for update` del proyecto** con el mismo criterio: si esta se escribió
así, es probable que no sea la única.

---

## DEBT-045 — `self_assessment_breakdown` no filtra lecciones deshabilitadas (BLOQUE 039)

**Origen:** spec-040, Fase 2, registrado explícitamente en la implementación
(2026-08-01)
**Prioridad:** Media — depende de que spec-039 se mergee a `development`

El RPC `public.self_assessment_breakdown` (`20260802000004_self_assessment_grade_rpcs.sql`)
calcula el denominador de la nota de autoevaluaciones sobre **todas** las
lecciones de `lesson_progress`, sin excluir las que spec-039 marca como
deshabilitadas (`public.disabled_lessons`, rama `feat/lecciones-habilitadas`,
aún no mergeada a `development` cuando se implementó este spec).

Consecuencia: si un docente deshabilita una lección después de que un
estudiante la vio (pero antes de responderla), esa lección **sigue
penalizando la nota** de autoevaluaciones como "vista y no respondida",
contradiciendo la intención de spec-039 (D5: una lección deshabilitada sale
de los conteos de progreso mientras dura el cierre).

**No se corrigió en spec-040** porque referenciar en el RPC una tabla que no
existe todavía rompería en tiempo de ejecución (no de creación) y tumbaría el
envío de autoevaluaciones en producción antes de que spec-039 se despliegue.
El bloque de filtro ya está escrito y comentado en la migración
(`-- ▼▼▼ BLOQUE 039`), con el nombre de tabla como marcador a ajustar.

**Fix cuando spec-039 esté mergeado:** `create or replace function
public.self_assessment_breakdown(...)` descomentando el bloque y ajustando el
nombre real de la tabla/columna de disponibilidad (`public.disabled_lessons`,
confirmar contra la migración final de spec-039), más un recálculo masivo por
curso (`recalculate_course_self_assessment_grades`, ya provisto por la
Fase 5 de spec-040) para aplicar el filtro a las notas ya calculadas.

---

## DEBT-044 — No existe forma de renombrar un ítem de calificación (`GradeItemsPanel`)

**Origen:** spec-040, ronda de pruebas manuales, TC-013/TC-014 (2026-08-02)
**Prioridad:** Media — bloquea un flujo documentado en la propia UI

`components/admin/GradeItemsPanel.tsx` solo implementa "Añadir ítem" y
"Eliminar"; no existe ningún control (botón, ícono, edición inline) para
renombrar un ítem de calificación ya creado. Esto afecta a **todos** los
ítems, no solo a los de `kind='self_assessment'`.

El problema es más profundo que un botón faltante: la Server Action
`updateGradeItemAction` (`lib/grades/actions.ts:32`) existe, funciona sin
bloqueo para ítems automáticos (`lib/grades/index.ts:67` lo confirma
explícitamente en comentario: "Renombrarlo sigue permitido"), pero **no está
importada ni invocada desde ningún componente del proyecto** — no hay ningún
camino de invocación, ni siquiera indirecto.

El ítem `kind='self_assessment'` (spec-040, D9/D10) muestra además el
tooltip "Este ítem no se puede eliminar. Puedes renombrarlo." — una promesa
de la UI que hoy es falsa: no se puede.

**Fix:** cablear un control de renombrado (edición inline o modal) en
`GradeItemsPanel.tsx` que invoque `updateGradeItemAction`, disponible para
todo tipo de ítem.

---

## DEBT-043 — Evaluaciones (`assignment`) accesibles aunque su lección esté deshabilitada

**Origen:** spec-039 (R3), registrado explícitamente en la implementación
(2026-08-01)
**Prioridad:** Baja — requiere que un docente cierre una lección que además
tenga una evaluación publicada apuntando a su `lesson_slug`; no bloquea el uso
normal de spec-039

spec-039 introduce un estado de habilitación por lección
(`public.disabled_lessons`), pero **no toca el ciclo de vida de las
evaluaciones** (`assignment_variant_groups`, spec-018). Un `assignment`
publicado sigue siendo accesible por su propia ruta
(`/cuenta/cursos/[enrollmentId]/evaluaciones/[groupId]`) sin importar si la
lección a la que está asociada por `lesson_slug` está deshabilitada.

Consecuencia: un estudiante puede llegar a resolver la evaluación de una
lección que su docente cerró explícitamente para corregir un error o para no
adelantar contenido — justo el escenario que spec-039 existe para evitar en
el artículo y en el cierre pedagógico (autoevaluación, "marcar completada").

**No se corrigió en spec-039** a propósito: el spec delimita su alcance a la
lección y su cierre pedagógico (`docs/specs/spec-039-lecciones-habilitadas.md`
→ "No incluye" → *"Deshabilitar cursos completos, o preguntas / evaluaciones
asociadas a una lección deshabilitada. Un `assignment` sigue su propio ciclo
de vida (spec-018); este spec no lo toca."*). Resolverlo implicaría decidir
si el gate de `getDisabledLessonSlugs` debe extenderse a
`lib/assignments`/`lib/submissions`, y si la relación `assignment ↔ lección`
(hoy por `lesson_slug` de texto libre, sin FK) es lo bastante fiable para
apoyar un bloqueo automático — merece su propio spec, no un parche aquí.

**Fix sugerido (a validar por `@architect` cuando se aborde):** antes de
permitir resolver o listar una evaluación, consultar
`isLessonDisabled(courseSlug, lessonSlug)` (ya expuesta por spec-039,
`lib/courses/availability.ts`) y bloquear con un mensaje honesto, mismo
patrón D6 (fallar cerrado ante `unavailable`, mensaje distinto de
"deshabilitada").

---

## DEBT-042 — El middleware cierra la sesión de todos los usuarios ante cualquier caída de Supabase Auth — ✅ Resuelto (spec-046, 2026-08-09)

**Origen:** Detectado durante la ronda manual de `test-037-manejo-de-errores.md`
(`TC-037-004`, 2026-08-01), al recargar la página con el túnel a `mirp-lab`
cortado
**Prioridad:** ~~Alta~~ → **Resuelto**

`middleware.ts:18` hace `if (!isPublic && !user) redirect a /login` para
prácticamente cualquier ruta del sitio (el `matcher` de `middleware.ts:52-54`
cubre todo salvo estáticos). `user` viene de `updateSupabaseSession()`
(`lib/auth/middleware.ts:28-30`), que llama `supabase.auth.getUser()` **sin
ningún `try/catch`**. Cuando Supabase Auth es inalcanzable, esa llamada no
lanza (el SDK la atrapa internamente) pero **resuelve `user: null`** —
indistinguible de "no hay sesión". El middleware trata ambos casos igual:
redirige a `/login`.

Consecuencia observada en vivo: con el túnel cortado, una simple recarga de
página —de un estudiante, un docente, cualquier rol, en cualquier ruta—
expulsa a la sesión activa a `/login`. Y como el propio login también
necesita a Supabase Auth, **nadie puede volver a entrar hasta que el servicio
se restaure**. Es el mismo antipatrón que motivó **[[DEBT-037]]**
(infraestructura leída como caso de negocio) y que sistematiza
**[[DEBT-040]]**/**[[DEBT-041]]**, pero con un radio de impacto mayor que
cualquiera de esos dos: no es una función de un dominio (asistencia,
autoevaluación), es el **gate de autenticación de toda la aplicación**.

**No se corrigió en spec-037**: `middleware.ts` y `lib/auth/middleware.ts` no
estaban en su tabla de "Impacto en el sistema", y el hallazgo apareció
después de la implementación, durante la ronda de pruebas. Además de
distinguir "sin sesión" de "no se pudo verificar", el fix probablemente deba
decidir **qué hacer** ante lo segundo — dejar pasar la request de todos
modos (con el riesgo de que páginas protegidas rendericen sin verificación
real) es una opción tan delicada como bloquear a todo el sitio; ver
**Acción**.

**Resolución (2026-08-09):** `docs/specs/spec-046-gate-auth-degradado.md` —
`[IN PROGRESS]`. `lib/auth/errors.ts` clasifica el `error` real que devuelve
`supabase.auth.getUser()` (el SDK ya lo distingue internamente — el bug era
la destructuración, no la falta de `try/catch`) en `AuthCheckResult`
(`lib/auth/auth-check.ts`): `authenticated` / `anonymous` / `unavailable`. Con
`unavailable`, `lib/auth/middleware.ts` reintenta una vez (250ms, timeout 2s
por intento) y `middleware.ts` responde **503 real** con HTML inline (no
`rewrite` — verificado que en Next 16.2.4 no preserva el status) antes del
gate, exento `/api`. La Capa 2 (`lib/auth/session.ts` → `requireUser` /
`requireRole` / `requireAnyRole`) redirige a `/servicio-no-disponible` en vez
de `/login` ante `unavailable`, sin tocar las ~20 páginas consumidoras.
Verificado en vivo (túnel a `mirp-lab` cortado, cookie de sesión real): 503
con `Cache-Control: no-store`, `Retry-After: 30`; `/api` sigue devolviendo
JSON; recuperado el túnel, la misma sesión entra sin volver a iniciar sesión.

**Residuo, fuera del alcance de spec-046, tratado en [[DEBT-040]]:** la
consulta a `user_roles` de `middleware.ts:35-39` (bloque `/admin`) y de
`requireRole`/`requireAnyRole` en `lib/auth/session.ts` sigue descartando
`error` — un fallo de lectura de Postgres/RLS (con Auth sano) puede seguir
expulsando a un docente legítimo a `/`. También queda fuera
`app/layout.tsx:37-38,56`: con Auth caído, `getCurrentProfile()`/
`getCurrentRoles()` ven `null` y la navbar entera desaparece — mismo
antipatrón en versión visual, documentado con `// DEBT:` en
`lib/auth/session.ts`.

---

## DEBT-041 — `createServerSupabaseClient()` fuera del `try` en módulos no cubiertos por spec-037

**Origen:** Detectado al implementar **[[DEBT-037]]** (spec-037, 2026-08-01):
el mismo patrón que se corrigió en `lib/attendance/` existe en otros módulos
que spec-037 dejó fuera de alcance
**Prioridad:** Baja — solo se manifiesta si el propio `.env`/cliente de
Supabase falla al construirse, no ante un fallo de consulta normal

`lib/auth/server.ts` usa non-null assertions (`!`) sobre
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, así que
`createServerSupabaseClient()` puede lanzar. Cuando esa llamada vive **antes**
del `try` de la función que la usa, esa excepción se propaga cruda en vez de
convertirse en un valor de retorno. Confirmado al menos en
`lib/academic-courses/index.ts:206`.

> **Nota (2026-08-01):** al implementar la Fase 7 de spec-037 se corrigió,
> además de lo que su tabla de "Impacto en el sistema" listaba
> (`getSelfAssessmentStatus`), el mismo patrón en las otras 4 funciones de
> `lib/self-assessment/index.ts` (`getSelfAssessmentForLesson`,
> `getAnswerKeyForLesson`, `checkSelfAssessmentAnswer`,
> `submitSelfAssessment`) — el checklist de la Fase 7 las mencionaba
> explícitamente y dejarlas fuera habría sido inconsistente con lo ya marcado
> como hecho. `lib/self-assessment/` queda fuera del alcance de este ítem.

**Acción:** Barrer el resto de `lib/` con
`grep -rn "createServerSupabaseClient" --include=*.ts` y mover cada llamada
dentro del `try` de su función, siguiendo el patrón ya aplicado en
`lib/attendance/` y `lib/self-assessment/` (spec-037). No requiere cambios de
tipos ni de contrato — es una guarda adicional, no una reclasificación de
resultado.

---

## DEBT-040 — Error de Supabase descartado en la destructuración (~40 sitios)

**Origen:** Barrido de `lib/` durante la implementación de **[[DEBT-037]]**
(spec-037, 2026-08-01), al confirmar que el mismo antipatrón de
`lib/attendance/index.ts` (fallos de infraestructura indistinguibles de casos
de negocio) es sistémico
**Prioridad:** Alta — al menos dos de los sitios encontrados relajan una
regla de negocio en vez de solo confundir al usuario, el mismo tipo de riesgo
que motivó tratar el gate de autoevaluación dentro de spec-037 en vez de
aplazarlo

Patrón recurrente: `const { data } = await supabase…`, que descarta `error` al
destructurar, o un `catch` que degrada a un valor indistinguible del caso de
negocio legítimo. Confirmado en ~40 sitios de `lib/`; los de mayor impacto:

- **`lib/submissions/index.ts:77`** — un fallo al contar intentos previos se
  lee como "primer intento" y **salta la validación de `max_attempts`** en una
  evaluación calificable.
- **`lib/submissions/index.ts:204-219`** — una respuesta vacía de Supabase
  escribe `auto_score = 0` como si fuera una nota real.
- **`lib/enrollments/access.ts:21,37`** (`hasCourseAccess`) — un fallo de
  consulta devuelve `not-enrolled` y **expulsa a un docente u owner
  legítimo** de su propio curso; no hay `try/catch` alrededor, así que un
  fallo de red aquí también puede propagar una excepción cruda (relacionado
  con el escenario de `TC-007` que originó **[[DEBT-037]]**, pero en un
  archivo fuera de su alcance).
- **`lib/grades/index.ts:64`** y **`lib/questions/index.ts:251`** — guardas de
  borrado que, si no disparan por un error silencioso, permiten borrar con
  dependencias y reportan éxito.

**Acción:** Aplicar sistemáticamente el patrón que spec-037 estableció para
`lib/attendance/`: tipos discriminados que separen negocio de infraestructura
donde el llamador necesite distinguirlos, y capturar/verificar siempre
`error` antes de confiar en `data`. Priorizar `lib/submissions/index.ts` (nota
real de estudiante en juego) y `lib/enrollments/access.ts` (control de acceso)
sobre el resto.

**Residuo anotado desde [[DEBT-042]] (spec-046, 2026-08-09):** dos sitios más,
descubiertos y deliberadamente dejados fuera del alcance de spec-046 por ser
consultas a Postgres/RLS, no a Supabase Auth:

- **`middleware.ts:35-39`** (bloque `/admin`) y **`requireRole`/
  `requireAnyRole`** en `lib/auth/session.ts` — la consulta a `user_roles`
  sigue descartando `error`. Con Auth sano pero Postgres/RLS caído, un docente
  u owner legítimo puede seguir siendo expulsado a `/` en vez de ver un aviso
  de infraestructura. spec-046 redujo el escenario (si Auth también está
  caído, el 503 corta antes de llegar aquí) pero no lo cerró.
- **`app/layout.tsx:37-38,56`** — `getCurrentProfile()`/`getCurrentRoles()`
  (`lib/auth/session.ts`) devuelven `null`/`[]` tanto si no hay sesión como si
  no se pudo verificar (comentario `// DEBT:` en el propio código, apuntando
  aquí). Con Auth caído, la navbar entera desaparece — la misma mentira de
  esta deuda, en versión visual.

---

## DEBT-039 — 🔁 Duplicado de **[[DEBT-010]]** (fusionado el 2026-08-01)

Este ítem se abrió el 2026-08-01 durante la ronda manual de `test-036`
describiendo el error de consola de `<Script id="theme-init">` en
`app/layout.tsx`. **Es exactamente el mismo problema que ya registraba
[[DEBT-010]]** (2026-07-24): mismo archivo, mismo mensaje de error, misma
acción propuesta. Solo cambiaba el número de línea citado (48 vs. 47), porque
el layout se editó entremedio.

La evidencia nueva que aportaba esta entrada —la reproducción durante
TC-036-012 y la confirmación de que el error aparece en **cualquier** página
del layout raíz, no solo en el panel admin— se incorporó a **[[DEBT-010]]**,
que queda como el ítem canónico. No abrir trabajo contra este número.

---

## DEBT-038 — El diálogo de confirmación accesible está copiado literalmente en cada componente que lo necesita

**Origen:** Revisión de `spec-036` (2026-08-01), al detectar que su
`CourseLifecycleActions` sería la **tercera** copia del mismo diálogo
**Prioridad:** Media — no hay bug hoy; el riesgo es que las copias diverjan

`components/student/AssignmentPlayer.tsx:262` y
`components/admin/AdminAttendancePanel.tsx:239` contienen el mismo diálogo de
confirmación **carácter por carácter**: overlay `<button>` a pantalla completa
con `aria-label`, contenedor con `role="dialog"` + `aria-modal="true"` +
`aria-labelledby`/`aria-describedby`, tarjeta `max-w-sm`, y un `useEffect` que
cierra con `Escape` y enfoca el botón de confirmar vía `confirmButtonRef`.
Solo cambian los `id` y el texto.

El patrón en sí es **correcto** —accesibilidad razonable, sin `confirm()`
nativo, que es justo lo que arregló **[[DEBT-018]]** copiando el diálogo de
`AssignmentPlayer` al panel de asistencia—; el problema es que vive duplicado. Cualquier mejora futura (trampa de foco real, que hoy no tiene
ninguno de los dos; restaurar el foco al cerrar; `aria-live` para el error)
hay que aplicarla N veces, y basta con que se olvide una para que un flujo
quede menos accesible que los demás sin que nadie lo note.

`components/courses/LessonSidebarMobile.tsx:72` también usa
`role="dialog"`/`aria-modal`, pero es un **drawer** de navegación, no una
confirmación: comparte las primitivas ARIA, no la forma. Si se extrae un
componente, conviene que sea `<ConfirmDialog>` (título, descripción, acción
destructiva o no, callbacks) y no un `<Modal>` genérico que intente cubrir
también el drawer.

**Acción:** Extraer un `components/ui/ConfirmDialog.tsx` y migrar los dos
consumidores actuales (más el que agregue spec-036). Al hacerlo, aprovechar
para añadir lo que hoy falta en las tres copias: trampa de foco dentro del
diálogo y devolución del foco al elemento que lo abrió.

> **spec-036 no resuelve esta deuda**: agregará una tercera copia siguiendo el
> mismo patrón, deliberadamente, para no inventar un cuarto diálogo distinto y
> dejar la extracción más difícil. Decisión registrada en el propio spec.

---

## DEBT-037 — La app no tiene ningún error boundary: un server action que lanza deja al usuario sin mensaje útil — ✅ Resuelto (spec-037, 2026-08-01)

**Origen:** `TC-007` de `docs/testing/test-fix-attendance-panel-flicker.md`
(2026-08-01), al cortar deliberadamente la conexión con Supabase
**Prioridad:** ~~Media~~ → **Resuelto**

> **Corrección del diagnóstico (2026-08-01, al redactar spec-037).** Esta
> entrada afirmaba que `openSession` "hace `throw error` ... la excepción no la
> recoge nadie". **Es falso**: los 5 `throw` de `lib/attendance/index.ts`
> estaban todos dentro de un `try/catch` de su propia función y se convertían
> en un valor de retorno; ninguno se propagaba. El problema real era más sutil
> y en parte peor: los `catch` degradaban fallos de infraestructura a valores
> **indistinguibles de un caso legítimo de negocio** (`null` → "no hay sesión",
> `0` → "nadie ha marcado", `'not_found'` → "código incorrecto"), y el caso
> observado en `TC-007` era un fallo de **transporte del server action**
> (respuesta RSC malformada), que ningún `try/catch` del servidor podía
> atrapar — solo un `try/catch` en el propio Client Component o un error
> boundary.

`find app -name "error.tsx" -o -name "global-error.tsx"` no devolvía **ningún
archivo**: la app no definía un solo error boundary de App Router. Observado en
desarrollo con el túnel SSH a `mirp-lab` caído: el overlay de Turbopack con
*"An unexpected response was received from the server."* apuntando a
`TeacherAttendanceControl.tsx:97`.

**Resolución (2026-08-01):** implementado y probado en
`docs/specs/spec-037-manejo-de-errores.md` — `[DONE]`, en cuatro frentes:

1. **Boundaries de App Router:** `global-error.tsx` (obligatorio — un
   `error.tsx` no captura errores del root layout, que es `async`),
   `app/error.tsx`, `(admin)/error.tsx` y `[lessonSlug]/error.tsx`, más un
   `ErrorBoundary` de componente para que un fallo del panel de asistencia
   degrade solo su recuadro sin desmontar la lección proyectada en clase.
2. **Señalización honesta** en las 6 funciones de `lib/attendance/index.ts`:
   tipos discriminados (`{status: 'ok'|'unavailable'}`) que separan "no hay
   sesión"/"código inválido" (negocio) de "no pude consultar" (infra).
3. **`try/catch` cliente** sobre las 4 invocaciones de server action del
   dominio de asistencia — el frente que de verdad cierra `TC-007`.
4. **Gate de autoevaluación** (hallazgo nuevo durante el spec, ver
   **[[DEBT-040]]**): `getSelfAssessmentStatus` fallaba abierto ante un fallo
   de lectura; ahora falla cerrado.

---

## DEBT-036 — CLAUDE.md declara Flowbite y shadcn/ui, pero ninguno está instalado

**Origen:** Detectado al resolver **[[DEBT-018]]** (2026-08-01), al buscar un
componente de modal/toast del sistema de diseño para reemplazar los
`alert()`/`confirm()` nativos
**Prioridad:** Baja — no rompe nada hoy, pero desvía cada decisión de UI

CLAUDE.md → "Stack tecnológico" declara **Flowbite** ("componentes UI sobre
Tailwind; usar primero") y **shadcn/ui** ("complementarios cuando Flowbite no
cubra"), y "Convenciones de código" repite la regla ("Flowbite primero,
shadcn/ui como complemento"). **Ninguno de los dos está en `package.json`**:
las dependencias de UI son solo `tailwindcss`, `react-hook-form` y `zod`. No
hay `components/ui/` ni `components.json`.

En la práctica los componentes se escriben a mano con Tailwind, y los
primitivos se van reinventando por archivo: el diálogo modal de
`AssignmentPlayer` (spec-019) es el único patrón accesible existente, y
DEBT-018 lo copió a `AdminAttendancePanel` en vez de importarlo.

**Acción:** Decidir cuál de las dos realidades vale, y alinear la otra:
(a) instalar Flowbite/shadcn/ui y adoptarlos donde ya hay primitivos a mano, o
(b) corregir CLAUDE.md para reflejar que los componentes son propios, y extraer
los primitivos repetidos (empezando por el diálogo de confirmación, hoy
duplicado en dos archivos) a un `components/ui/` propio.

---

## DEBT-035 — Barajado de evaluaciones A/B/C: orden estable entre intentos, no congelado en el `submission`

**Origen:** Decisión D1 de spec-035 (2026-08-01), hallazgo de `@reviewer` al revisar el spec
**Prioridad:** Baja — el diseño actual está justificado y cubre el riesgo real
(copieteo entre estudiantes contiguos); esto es refinamiento futuro, no un defecto

spec-035 (`docs/specs/spec-035-evaluaciones-barajado.md`) implementó el
barajado de `shuffle_questions`/`shuffle_choices` con una semilla que
deliberadamente **no** incluye `attempt_number`: `assignment-questions:${enrollmentId}:${assignmentId}`
y `assignment-choices:${enrollmentId}:${questionId}` (`lib/submissions/index.ts`,
`getVariantQuestionDetails`). La decisión (D1 del spec) prioriza garantizar
"por construcción" que el jugador y la página de resultados coincidan, en vez
de depender de que ambas resuelvan igual cuál es el intento vigente —hoy lo
hacen por caminos distintos (`createSubmission` recupera la fila
creada/recuperada; `getSubmissionByStudent` toma el `attempt_number` más alto).

**Consecuencia asumida:** con `max_attempts > 1` y `show_feedback_on: "submit"`,
un estudiante que ya vio la retroalimentación de su primer intento puede
memorizar la posición de la opción correcta y acertar el reintento sin releer
el enunciado. La palanca correcta hoy contra esto es `show_feedback_on`
(`"close"` o `"never"`), no el barajado.

**Relacionado — flags no congelados en el intento:** los flags se leen en vivo
del grupo en cada llamada a `getVariantQuestionDetails`, no se copian al
`submission` al crearlo. Si el docente cambia `shuffle_questions`/
`shuffle_choices` **a mitad de un intento en curso**, el orden se reordena en
la siguiente recarga del estudiante y la página de resultados puede no
coincidir con lo que vio durante la resolución — la misma incoherencia que D3
de spec-035 buscaba evitar, mochila de que la configuración vive en el grupo y
no en el intento.

**Acción:** Si en la práctica se observa que estudiantes aprovechan la
posición memorizada entre intentos, incorporar `attempt_number` (o
`submission_id`) a la semilla — pero **antes** unificar cómo el jugador y la
página de resultados resuelven cuál es el intento vigente para esa variante,
o la coherencia jugador↔resultados que D3 garantiza hoy se rompe. Evaluar en
el mismo trabajo si conviene copiar los flags al `submission` al crearlo (o a
`assignment_variant_allocations`), para que un cambio de configuración del
docente a mitad de examen no reordene un intento ya en curso.

---

## DEBT-034 — `shuffle_choices` / `shuffle_questions` son flags decorativos: nada los implementa — ✅ Resuelto (spec-035, 2026-08-01)

**Origen:** Detectado al investigar **[[DEBT-029]]** (2026-07-31)
**Prioridad:** ~~Media~~ → **Resuelto** (frente 1 implementado)

`assignment_variant_groups` tiene las columnas `shuffle_questions` y
`shuffle_choices` que atraviesan el sistema (esquema, tipos, API, panel admin).
**Ningún código las leía para barajar** hasta spec-035.

**Resolución (2026-08-01):** implementado el barajado en el servidor con orden
estable por estudiante (spec-035). El helper de barajado (`seededShuffle`) se
movió de `lib/self-assessment/` a `lib/shuffle.ts` (módulo transversal).
`getVariantQuestionDetails()` ahora lee `shuffle_questions` y `shuffle_choices`
del grupo, aplica Fisher-Yates con semilla `(enrollment_id, assignment_id/question_id)`,
y devuelve las preguntas/opciones barajadas. El orden es estable entre recargas
durante el intento, y coincide exactamente entre el jugador y la página de
resultados — garantizado por construcción, no por convención entre dos páginas.
La vista del docente sigue mostrando orden canónico. Panel admin ahora advierte
con una nota que `shuffle_questions` rompe la numeración compartida en clase.

**Frente 2 (quitar los flags de la UI):** descartado. Los flags son verdaderos
ahora y funcionan correctamente.

---

## DEBT-033 — Políticas RLS legacy conviven con las del diseño de variantes en `assignments` y `assignment_questions`

**Origen:** Detectado al resolver **[[DEBT-031]]** (2026-07-31), al comparar el
esquema real de producción contra el que reconstruyen las migraciones
**Prioridad:** Baja — hoy inocuo, pero es superficie de RLS que nadie diseñó a
propósito y que puede volverse peligrosa si el modelo de datos cambia

Producción arrastra **8 políticas RLS legacy** creadas fuera de git, del diseño
original en que una fila de `assignments` era la evaluación completa y no una
variante A/B/C:

- `assignments`: `"assignments: select"`, `": insert teacher or admin"`,
  `": update teacher or admin"`, `": delete teacher or admin"`
- `assignment_questions`: las cuatro equivalentes

DEBT-031 las incorporó a las migraciones
(`20260717000000`, `20260717000001`) **para que el esquema reconstruido fuera
fiel al real**, no porque se hayan validado. Conviven con las que sí declaran
`20260718000003` y `20260718000005` (`inherits_group_select`,
`inherits_variant_select`, `teacher_manages_own_*`).

**El riesgo:** Postgres combina las políticas permisivas de un mismo comando con
`OR`, así que la política legacy **amplía** el acceso más allá de lo que
`20260718000005` pretendía acotar (su propio comentario dice que `assignments`
debe heredar la visibilidad del grupo padre). Hoy no tiene efecto práctico
porque las filas de variante tienen `academic_course_id` en `NULL` —desde que
`20260718000004` relajó ese `NOT NULL`—, así que el `EXISTS` de la política
legacy nunca da verdadero. Es decir: **la contención depende de un dato nulo,
no de la política**. Si alguna vez se vuelve a poblar `academic_course_id` en
las filas de variante, las políticas legacy se activan y exponen metadata de
variantes (`variant_label`, `description`) y el contenido de
`assignment_questions` a cualquier estudiante matriculado en el curso, saltándose
la cascada del grupo.

**Acción:** Auditar si las 8 políticas legacy siguen cumpliendo alguna función.
Si no —lo más probable, dado que todo el acceso de sesión a estas tablas es de
solo lectura y las escrituras van por `service_role` en
`lib/assignments/service.ts`— eliminarlas con una migración nueva
(`drop policy`), aplicada tanto en dev como en producción. Verificar antes que
ningún flujo de estudiante o docente dependa de ellas.

---

## DEBT-032 — Tokens crudos de Tailwind en los componentes nuevos del panel admin de curso

> Título restaurado el 2026-08-01: esta entrada había perdido su encabezado y su
> separador, quedando pegada al final de **[[DEBT-033]]** — era invisible al leer
> el índice del backlog y su número no aparecía en la numeración.

**Origen:** spec-032 (navegación admin de curso), hallazgo de `@reviewer`
**Prioridad:** Baja — impacto visual/mantenibilidad, no funcional

`components/admin/CourseHeader.tsx` y `components/admin/CourseTabs.tsx` (nuevos
en spec-032, contenido movido verbatim desde las páginas que reemplazaron) usan
clases crudas de la paleta Tailwind (`text-gray-900`, `text-blue-700`,
`bg-green-100`, `border-gray-200`) en lugar de los tokens semánticos que exige
`DESIGN.md` y CLAUDE.md → "Convenciones de código". Mismo problema que
**DEBT-015** (navbar), que documenta que el sistema de tokens actual no tiene
variante `dark:`, lo que hace inviable migrar hoy sin abordar antes esa
limitación.

**Acción:** Ampliar el alcance de DEBT-015 para cubrir también
`components/admin/`, o resolverla junto con esa deuda cuando el sistema de
tokens soporte modo oscuro.

**Relacionado:** también se detectaron anchos de contenedor inconsistentes
entre las pestañas del curso (`max-w-5xl`, `max-w-2xl`, `max-w-7xl`, sin límite)
ahora que comparten un header y tabs comunes en `layout.tsx`. Revisar si vale
la pena unificar el `max-w-*` en el layout tras la ronda de pruebas manuales
(`test-032`, TC-005).

---

## DEBT-031 — El historial de migraciones no reconstruye producción desde cero — ✅ Resuelto (2026-07-31)

**Origen:** Detectado al armar el entorno de desarrollo local en `mirp-lab`
(2026-07-31, post-spec-026) — `supabase start` con las migraciones del repo
falló
**Prioridad:** Alta — es un riesgo de recuperación ante desastres, no solo un
problema de este entorno de dev

La tabla `assignments` existe en producción (verificado por el schema
OpenAPI de PostgREST) pero **ninguna migración la crea**. La migración
`20260718000002_init_assignment_variant_groups.sql` la asume existente — su
propio comentario dice *"table may already exist from prior integration"* —
y solo le agrega columnas (`variant_group_id`, `variant_label`) vía
`ALTER TABLE`. No hay ningún commit que borre una migración anterior que la
creara: se creó fuera de git en algún momento (probablemente a mano en el
SQL Editor de Supabase), antes de que existiera esa migración.

Consecuencia: reconstruir producción desde cero solo con
`supabase/migrations/` **falla** en ese punto. Esto no bloqueó el
despliegue original (spec-026 nunca reconstruyó el esquema desde cero,
solo verificó que las 34 migraciones ya aplicadas coincidían Local==Remote),
pero sí es un riesgo real para una recuperación ante desastres futura, y ya
bloqueó armar un entorno de desarrollo espejo.

**Mitigación temporal (2026-07-31):** se agregó una migración
`20260717000000_local_only_missing_assignments_table.sql`, pero **solo en
la copia del repo que vive en `mirp-lab`** (`/home/sosagro4c/proyectos/nodo-dev-db/`),
con la estructura real de `assignments` tomada del schema de producción. No
se commiteó al repo principal — ver decisión del usuario de no tocar el
historial de migraciones de producción sin evaluarlo aparte.

**Resolución (2026-07-31, opción (a)):** se extrajo el DDL real de producción
con `supabase db dump --linked --schema public` y se commitearon dos
migraciones nuevas, ambas con timestamp anterior a `20260718000002`:

- `20260717000000_init_assignments_legacy_table.sql`
- `20260717000001_init_assignment_questions_legacy_table.sql`

Al hacerlo se descubrió que **`assignment_questions` tenía el mismo problema
que `assignments`**, no detectado cuando se redactó este ítem: también se creó
fuera de git, por lo que el `create table if not exists` de `20260718000002`
nunca se ejecutó en producción y el esquema real conserva nombres legacy
(constraint `assignment_questions_unique` en vez de `unique_question_per_variant`,
más un índice legacy `assignment_questions_assignment_id_order_index_idx`
*adicional* al que crea esa migración). Ambas tablas arrastraban además 4
políticas RLS legacy cada una (`"<tabla>: select/insert/update/delete teacher
or admin"`) que ninguna migración declaraba.

**Verificación:** `supabase db reset` desde cero en `mirp-lab` seguido de
`supabase db dump --local`, comparado línea a línea contra el dump de
producción → **conjunto de sentencias idéntico**, incluidos nombres de
constraints, índices, triggers y políticas RLS.

La migración `20260717000000_local_only_missing_assignments_table.sql` de
`mirp-lab` se eliminó: ya no hace falta, la copia de allá está sincronizada
con el repo.

Las 8 políticas RLS legacy se reprodujeron por fidelidad con el esquema real,
sin validarlas — quedaron registradas aparte como **[[DEBT-033]]**.

**Nota de mantenimiento (reconfirmada):** tras cada `supabase db reset` en
`mirp-lab` hay que reaplicar a mano los `GRANT` de `anon`/`authenticated`/
`service_role` sobre `public` (ver CLAUDE.md → "Base de datos"). Es el único
punto en que el esquema local diverge del real, y es un quirk del CLI local,
no del historial de migraciones.

---

## DEBT-030 — El ícono de la aplicación no aparece en la pestaña del navegador — ✅ Resuelto (2026-08-01)

**Origen:** Reportado por el usuario (2026-07-31), post-despliegue de spec-026
**Prioridad:** ~~Baja~~ → **Resuelto**

`public/icono.png` existe pero no está conectado: no hay `app/icon.*` ni
`app/favicon.ico` (las convenciones de App Router que Next.js detecta
automáticamente), y `app/layout.tsx` no declara `metadata.icons`. Sin ninguna
de las dos vías, el navegador no tiene de dónde tomar el favicon.

**Resolución (2026-08-01, rama `fix/favicon-icon-tab`):** se optó por la vía
(a) — se copió `public/icono.png` a `app/icon.png`, convención de App Router
que Next.js sirve automáticamente sin tocar código ni `metadata`. Verificado
con el servidor de desarrollo: `GET /icon.png` responde `200 OK`. Pendiente
la verificación visual en el navegador (el ícono a veces queda cacheado
agresivamente), fuera del alcance de este cambio por la restricción de no
abrir el navegador sin solicitud explícita.

---

## DEBT-024 — No existe ninguna vía en la plataforma para reponer la contraseña de un estudiante — ✅ Mitigado (spec-026, Fase 5)

**Origen:** Revisión de spec-026 previa al primer despliegue (2026-07-30)
**Prioridad:** Alta — con ~30 estudiantes, ocurrirá en las primeras semanas de clase

spec-027 eliminó el flujo de recuperación de contraseña por correo
(**[[DEBT-011]]**), asumiendo que el docente sería el canal de recuperación vía
`students-mcp`. **Esa suposición es falsa:** `update_student`
(`mcp-servers/students-mcp/src/tools.ts`) acepta `full_name`, `email`, `career`,
`semester` y `github_username` — **no acepta `password`**. Solo `create_student`
recibe contraseña, y `delete_student` es destructivo (borra matrículas,
asistencia y calificaciones, y devuelve `409` si hay entregas).

Resultado: hoy un estudiante que olvide su contraseña **no puede recuperarla por
ningún camino dentro de la plataforma**. La única salida es el Supabase Dashboard
/ Admin API (`auth.admin.updateUserById({ password })`), fuera de la app.

**Acción:** Para el arranque, documentar el reset manual vía Supabase Dashboard
(spec-026, Fase 5). Después, diseñar un spec que añada `reset_student_password`
a `/api/students/*` y a `students-mcp`, con las salvaguardas del dominio de
admin (`STUDENTS_ADMIN_API_KEY`). Se resuelve por completo con
**[[DEBT-001]]** + **[[DEBT-011]]** si se reconstruye la recuperación por correo.

**Resolución (2026-07-31):** el botón "Reset password" del Supabase Dashboard
**no sirve** (solo envía correo, sin SMTP no llega). La vía real, documentada y
probada (`TC-026-013`, ver `test-026`), es la **Admin API vía `curl`** con
`SUPABASE_SERVICE_ROLE_KEY` (`PUT /auth/v1/admin/users/{id}` con
`{"password": "..."}`). El spec propio de `reset_student_password` en
`students-mcp` sigue pendiente como mejora futura, no bloqueante.

---

## DEBT-026 — Mensaje de error genérico al registrarse con un correo ya existente

**Origen:** `TC-026-003` (spec-026, smoke test de producción, 2026-07-31)
**Prioridad:** Baja — el comportamiento de seguridad es correcto (no duplica
la cuenta), es solo un problema de claridad del mensaje

Al intentar registrarse con un correo que ya tiene cuenta, `/registro` muestra
"No se pudo crear la cuenta. Intenta de nuevo" — un mensaje genérico que no le
dice al usuario que el correo ya está registrado (y por lo tanto no lo guía a
usar "Iniciar sesión" en su lugar). Verificado que no duplica la cuenta ni la
matrícula: el problema es puramente de UX/mensaje.

**Acción:** En el server action de registro (`lib/auth/actions.ts`), detectar
el caso de correo duplicado (Supabase Auth normalmente lo señala en el error
de `signUp`) y devolver un mensaje específico, p. ej. "Ya existe una cuenta con
este correo. Iniciá sesión en su lugar."

---

## DEBT-029 — Preguntas de autoevaluación con la respuesta correcta siempre en la primera posición — ✅ Frente 2 resuelto (spec-034, 2026-07-31)

**Origen:** `TC-026-011` (spec-026, smoke test de producción, 2026-07-31),
reportado por el usuario
**Prioridad:** ~~Media~~ → **Baja** — reclasificado el 2026-07-31: el frente
de plataforma (el que escalaba y no dependía de la memoria de cada autor) ya
está resuelto. Lo que queda es solo contenido.

Las 3 preguntas publicadas de `estructuras-de-datos/implementacion-de-pilas-en-java`
tienen la opción correcta en `order_index = 0` (primera posición) en las
tres. Ni `lib/self-assessment/index.ts` ni
`components/courses/SelfAssessmentSection.tsx` aleatorizan el orden de las
opciones al mostrarlas: se renderizan siempre en `order_index` tal como están
guardadas (a diferencia de `assignment_variant_groups`, que sí tiene un flag
`shuffle_choices` para las evaluaciones formales A/B/C).

**Acción:** Dos frentes, no excluyentes:
1. **Contenido:** revisar las preguntas existentes en el banco y variar la
   posición de la opción correcta al autorarlas (`question-bank-mcp` →
   `update_question`/`create_question`).
2. **Plataforma:** aleatorizar el orden de despliegue de `choices` en
   `SelfAssessmentSection` (barajar en el cliente o servidor al momento de
   mostrar, sin alterar `order_index` en la base), para no depender de que
   cada autor de preguntas varíe el orden manualmente.

**Resolución (frente 2, 2026-07-31):** implementado y probado en
`spec-034-autoevaluacion-barajado-opciones.md` — `[DONE]`. El servidor
baraja las opciones con semilla **determinista `(user_id, question_id)`**:
cada estudiante ve un orden distinto pero estable entre recargas,
`router.refresh()` post-envío y "Reintentar" (un `Math.random()` por request
habría hecho saltar las opciones mientras el estudiante lee su feedback). La
clave de respuestas del docente (spec-031) sigue en orden canónico
`order_index`, sin barajar. Ronda manual `test-034` (7 casos, 3 estudiantes)
aprobada sin hallazgos nuevos; `@reviewer` verificó `seededShuffle`
empíricamente con 5000 semillas (determinismo, pureza, distribución uniforme)
antes de la ronda.

El **frente 1** (revisar y variar la posición de la correcta en las preguntas
ya publicadas) sigue abierto, pero dejó de ser crítico: tras el frente 2,
ningún estudiante puede aprobar eligiendo siempre la primera opción,
independientemente de cómo esté guardada la pregunta.

> **Corrección menor de la premisa (2026-07-31).** Este ítem contrastaba la
> autoevaluación con las evaluaciones formales A/B/C, *"que sí tiene un flag
> `shuffle_choices`"*. El flag existe, pero **ningún código lo implementa**:
> ver **[[DEBT-034]]**. El contraste no era válido — ninguno de los dos flujos
> baraja hoy.

---

## DEBT-028 — La autoevaluación de cierre no persiste su estado de "ya respondida" tras recargar la página — ✅ Alcance 1 resuelto (spec-033, 2026-07-31)

**Origen:** `TC-026-011` (spec-026, smoke test de producción, 2026-07-31)
**Prioridad:** ~~Alta~~ → **Media** — reclasificado el 2026-07-31 al redactar
spec-033 (ver "Corrección de la premisa" más abajo): no hay corrupción de
datos, es una regresión de UX en uno de los 6 flujos declarados críticos

> **Corrección de la premisa (2026-07-31).** Este ítem se redactó afirmando que
> el bug "permite reintentos silenciosos y datos inconsistentes". **Eso es
> falso.** La migración que crea la tabla la define explícitamente como
> *"una bitácora append-only de intentos completados por estudiante"*
> (Decisión D1 de spec-017), y `SelfAssessmentSection` expone un botón
> **"Reintentar"** deliberado que limpia el estado y permite reenviar. Varias
> filas por estudiante/lección son **el diseño esperado**, no un defecto: las
> dos filas citadas abajo como evidencia son exactamente lo que ese log debe
> registrar tras dos intentos. `hasAttempt` solo evalúa `length > 0`, así que
> los reintentos tampoco alteran el desbloqueo de "marcar lección completada".
> Lo que queda es un bug real pero acotado y sin impacto en los datos: tras
> recargar, el estudiante pierde el feedback y la UI no refleja que ya
> respondió.

`components/courses/SelfAssessmentSection.tsx` mantiene el estado "ya
respondida" (`hasSubmitted`, `feedbackByQuestion`) **solo en memoria del
cliente** (`useState`), inicializado siempre en `false`/`{}`. El servidor sí
sabe si ya existe un intento — `getSelfAssessmentStatus()`
(`lib/self-assessment/index.ts:239`) calcula `hasAttempt` correctamente y se
usa bien para desbloquear "marcar lección completada"
(`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx:141-143`) — pero ese
`hasAttempt` **nunca se pasa** a `SelfAssessmentSection` /
`LessonClosureFlow`. Resultado: tras cualquier recarga, el widget de
preguntas vuelve a mostrarse como si nunca se hubiera respondido, permitiendo
reenviar respuestas.

Observado en producción: el estudiante de prueba
`spec026-smoke-a@nodo-test.local` generó dos filas en
`self_assessment_attempts` para la misma lección
(`estructuras-de-datos/github-flujo-de-trabajo-con-ramas`, 14:17 y 14:18 UTC
del 2026-07-31) con distinto `correct_count` (6 y 4). Se interpretó como
evidencia del bug, pero —según la corrección de arriba— es el
comportamiento esperado del log: dos intentos, dos filas. El síntoma real es
que la UI no mostraba el intento previo tras la recarga.

**Limitación adicional para el fix completo:** la tabla
`self_assessment_attempts` (`supabase/migrations/20260718000000_init_self_assessment_attempts.sql`)
solo guarda conteos agregados (`question_count`, `answered_count`,
`correct_count`) — **no** qué opción se eligió en cada pregunta. No es
posible reconstruir el detalle por pregunta (qué elegiste, qué era correcto)
después de un reload con el esquema actual.

**Acción:** Dos alcances posibles:
1. **Fix mínimo (sin migración):** pasar el último intento (conteos agregados
   y `submitted_at`) desde `page.tsx` → `LessonClosureFlow` →
   `SelfAssessmentSection`, y si ya hay intento, mostrar un resumen ("Ya
   completaste esta autoevaluación: X/Y correctas") en vez de reiniciar el
   formulario. **Conservando el botón "Reintentar"**, que es una función
   deliberada y no debe eliminarse.
2. **Fix completo:** agregar una tabla/columna que guarde la respuesta
   seleccionada por pregunta (ej. `self_assessment_answers` con
   `attempt_id`, `question_id`, `selected_choice_ids`), migración incluida,
   para poder reconstruir el feedback exacto por pregunta tras un reload.

**Resolución (alcance 1, 2026-07-31):** implementado y probado en
`spec-033-autoevaluacion-estado-persistente.md` — `[DONE]`. El servidor ahora
expone `lastAttempt` (conteos + fecha del intento más reciente, con
`order by submitted_at desc` para evitar devolver un intento arbitrario) y
`SelfAssessmentSection` muestra un resumen en vez del formulario cuando ya
existe un intento sin feedback en memoria, conservando "Reintentar" intacto.
Ronda manual `test-033` (7 casos) aprobada sin hallazgos nuevos — el único
defecto real de esta iteración (el resumen se agregaba junto al formulario en
vez de en su lugar) lo detectó `@reviewer` en la revisión de código previa a
la ronda y se corrigió antes de que el usuario probara.

El **alcance 2** (persistir la respuesta elegida por pregunta, con migración,
para reconstruir el feedback detallado tras un reload) sigue abierto — ver
"Limitación adicional" arriba.

---

## DEBT-027 — Revisar claridad de los mensajes de validación del formulario de registro

**Origen:** `TC-026-004` (spec-026, smoke test de producción, 2026-07-31) —
pedido explícito del usuario tras aprobar el caso
**Prioridad:** Baja — la validación funciona (campos vacíos, formato de
correo inválido y contraseñas que no coinciden se bloquean correctamente,
sin pantalla en blanco); es una mejora de claridad de mensaje, no un bug
funcional

El usuario pidió mejorar los mensajes de error de campos vacíos y formato
inválido en `/registro`. El esquema de validación vive en
`lib/auth/schemas.ts` (`SignUpSchema`): ya tiene mensajes personalizados por
campo ("Ingresa un correo válido", "La contraseña debe tener al menos 8
caracteres", etc.) — falta precisar **qué mensaje concreto** resultó confuso
en la prueba (¿el de campo vacío en `full_name`/`enrollment_code`, el de
formato de correo, u otro) antes de tocar el esquema.

**Acción:** En una próxima sesión, pedir al usuario el mensaje exacto que le
pareció poco claro (o repetir la prueba con capturas) y ajustar el `message`
correspondiente en `SignUpSchema`.

---

## DEBT-023 — `TeacherAttendanceControl`: parpadeo del grupo/código equivocado antes de restaurar la selección guardada — ✅ Resuelto (2026-08-01)

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** ~~Media~~ → **Resuelto**

Con más de un grupo y una elección guardada en `localStorage`, el primer pintado del cliente monta `AdminAttendancePanel` con `courses[0]` (y su sesión, si tiene una abierta); el `useEffect` post-montaje cambia después a la selección restaurada, remontando el panel (por el `key={selectedCourse.id}`). Si el grupo por defecto (`courses[0]`) tiene una sesión abierta, el docente ve un instante el código de **otro** grupo antes de que aparezca el correcto — riesgoso si la pantalla está proyectada en clase.

**Acción:** Persistir la elección en una cookie legible desde el server component (para que el HTML inicial ya venga con el grupo correcto), o no renderizar `AdminAttendancePanel` hasta que la restauración desde `localStorage` haya corrido.

**Resolución (2026-08-01, rama `fix/attendance-panel-flicker`):** se optó por la
cookie. `lib/attendance/group-preference.ts` (nuevo) expone
`attendanceGroupCookieName(courseSlug)` y `resolveStoredAttendanceGroup()`; la
página de lección lee la cookie en el server y pasa `initialAttendanceGroupId`
por `TeacherLessonPanel` → `TeacherAttendanceControl`, que ya no usa
`localStorage` ni el `useEffect` de restauración (se fueron con él dos
`eslint-disable`, incluido el de `set-state-in-effect`). El HTML inicial trae
el grupo correcto, así que no hay remontaje ni parpadeo. La escritura sigue en
el cliente vía `document.cookie` (`path=/`, `SameSite=Lax`, 1 año) por ser una
preferencia de UI sin efecto en datos.

**Nota de migración:** la preferencia anterior guardada en `localStorage` no se
migra — cada docente con más de un grupo vuelve a elegirlo una vez y a partir
de ahí queda persistido en la cookie.

---

## DEBT-022 — `getAnswerKeyForLesson` duplica la consulta de `getSelfAssessmentForLesson`

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** Baja — riesgo de divergencia futura, no un bug actual

`lib/self-assessment/index.ts` tiene dos funciones (`getSelfAssessmentForLesson` y `getAnswerKeyForLesson`) con el mismo `select`, mismos filtros y mismo `order('created_at')`, que solo difieren en si propagan `is_correct`. El criterio de aceptación de spec-031 exige que el orden de la clave de respuestas del docente coincida exactamente con el que ve el estudiante — hoy esa garantía depende de que ambas consultas se mantengan sincronizadas manualmente.

**Acción:** Extraer un helper privado (ej. `fetchLessonQuestionRows(courseSlug, lessonSlug)`) del que ambas funciones exportadas deriven su resultado, propagando o no `is_correct` según corresponda. De paso, añadir `.order('order_index', { referencedTable: 'question_choices' })` en ambas — hoy el orden de `choices` coincide en la práctica porque es la misma consulta, pero PostgREST no lo garantiza para recursos embebidos.

---

## DEBT-021 — `TeacherAnswerKey`: no distingue "sin preguntas" de "error al cargar"

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** Baja

`getAnswerKeyForLesson` devuelve `[]` tanto si la lección no tiene preguntas publicadas como si la consulta falló (`catch` → log → `[]`). `TeacherLessonPanel` omite el bloque de clave de respuestas en ambos casos por igual (`answerKey.length > 0`), así que el docente no puede distinguir "esta lección no tiene autoevaluación" de "no se pudo cargar la clave" en medio de una clase.

**Acción:** Devolver un resultado discriminado (ej. `{ ok: true, questions } | { ok: false }`) en vez de `[]` para ambos casos, y que `TeacherLessonPanel` muestre un mensaje de error cuando `ok` sea `false`.

---

## DEBT-020 — Accesibilidad y tokens crudos en los componentes nuevos de la vista docente (spec-031)

**Origen:** `@reviewer` en la revisión de spec-031
**Prioridad:** Baja

Dos hallazgos menores en los componentes nuevos de spec-031:
1. `TeacherAnswerKey.tsx` usa tokens crudos de paleta (`bg-green-50`, `border-green-200`, `text-green-600`, `text-gray-500/900`) en vez de los semánticos de `DESIGN.md` (`--color-success`, etc.) — consistente con lo que ya hace `SelfAssessmentSection.tsx` (que el spec pedía imitar), así que no es una regresión nueva, pero propaga la deuda.
2. Los toggles "Revelar"/"Revelar todas" son `<button>` sin `aria-expanded` ni `aria-pressed`, y el resaltado de la respuesta correcta se comunica solo por color + un ícono `aria-hidden`, sin texto accesible equivalente.

**Acción:** En una iteración de UI/accesibilidad, migrar `TeacherAnswerKey.tsx` (y de paso `SelfAssessmentSection.tsx`) a tokens semánticos, añadir `aria-expanded` a los toggles y un `<span className="sr-only">` junto al ícono de respuesta correcta.

---

## DEBT-019 — `AdminAttendancePanel`: el botón "Cerrar sesión" parpadea a "Cerrando..." cada ~5s — ✅ Resuelto (2026-08-01)

**Origen:** test-031 (TC-009), reportado por el usuario durante la ronda de pruebas manuales
**Prioridad:** ~~Media~~ → **Resuelto**

`AdminAttendancePanel.tsx` usa un único `isPending` de `useTransition()` compartido entre tres operaciones: abrir sesión, cerrar sesión, y el polling del conteo de asistentes cada 5 segundos (`useEffect` con `setInterval` → `startTransition(async () => { getSessionAttendanceCount(...) })`). Como las tres comparten el mismo `isPending`, cada vez que el polling dispara su transición, el botón "Cerrar sesión" cambia brevemente a "Cerrando..." y se deshabilita, aunque nadie esté cerrando nada — un parpadeo cada ~5s mientras la sesión está abierta. Preexistente desde spec-010 (el componente original), pero mucho más visible ahora que spec-031 lo embebe en la vista de lección donde el docente lo tiene a la vista durante toda la clase.

**Acción:** Usar un `useTransition()` (o simple `useState<boolean>`) independiente para el polling de conteo, separado del que gobierna los botones de abrir/cerrar sesión, para que el polling nunca afecte su estado visual.

**Resolución (2026-08-01, rama `fix/attendance-panel-flicker`):** el polling salió
por completo de `startTransition` — no necesitaba transición ninguna, solo un
`setAttendanceCount` directo. `isPending` queda gobernando exclusivamente los
botones de abrir/cerrar sesión. Se agregó un flag `cancelled` en el cleanup del
efecto para que una respuesta en vuelo no reviva el conteo de una sesión ya
cerrada.

---

## DEBT-018 — `AdminAttendancePanel` usa `alert()`/`confirm()` nativos — ✅ Resuelto (2026-08-01)

**Origen:** spec-031 (vista docente en la página de lección)
**Prioridad:** ~~Baja~~ → **Resuelto**

`AdminAttendancePanel.tsx` (líneas 52 y 60-62) usa `alert()` para reportar
errores y `confirm()` para confirmar el cierre de sesión. Es aceptable en el
panel admin (`/admin/courses/<id>/attendance`), pero spec-031 reutiliza este
mismo componente embebido dentro de la página de lección, donde el docente
puede estar proyectando la pantalla en clase — un `alert()`/`confirm()`
nativo del navegador ahí se ve pobre. Fuera de alcance de spec-031 (que
reutiliza el componente tal cual, sin modificarlo, para no arriesgar la ruta
admin ya `[DONE]`).

**Acción:** En una iteración de UI, reemplazar `alert()`/`confirm()` por un
toast/modal propio del sistema de diseño, y verificar ambos puntos de montaje
(`/admin/courses/<id>/attendance` y la vista docente de lección).

**Resolución (2026-08-01, rama `fix/attendance-panel-flicker`):** los `alert()`
se reemplazaron por un banner inline con `role="alert"` y botón de descarte
(estado `error` local), y el `confirm()` por un diálogo modal que reutiliza
**verbatim el patrón ya existente** en `AssignmentPlayer` (spec-019):
`role="dialog"` + `aria-modal` + `aria-labelledby`/`aria-describedby`, cierre
con Escape, foco al botón de confirmar al abrir y `overflow: hidden` en el
body. No se agregó ninguna dependencia — el proyecto no tiene Flowbite ni
shadcn/ui instalados hoy, pese a lo que declara CLAUDE.md → "Stack tecnológico"
(ver **[[DEBT-036]]**).

---

## DEBT-017 — Sin puntos de entrada visibles a `/login` para visitantes anónimos

**Origen:** spec-028 (navbar por rol) — decisión explícita del usuario
**Prioridad:** Baja — decisión de producto aceptada, no un bug

Tras ocultar el navbar para visitantes sin sesión, la única forma de llegar a
`/login` es escribiendo la URL directamente o siendo redirigido por un gate de
autenticación (p. ej. `/grupo-investigacion`). El usuario decidió
explícitamente aceptar esto en el alcance de spec-028 (ver sección "No
incluye" del spec) en vez de agregar un enlace en el footer de la landing.

**Acción:** Si en el futuro se detecta que usuarios reales no encuentran cómo
iniciar sesión, agregar un enlace "Iniciar sesión" a `FOOTER_LINKS`
(`lib/landing/data.ts`) o a la landing pública.

---

## DEBT-016 — Flash de `AnnouncementBar` por lectura de `localStorage` en el primer render

**Origen:** spec-028 (navbar por rol), relacionado con **[[DEBT-010]]**
**Prioridad:** Baja — cosmético, superficie reducida por spec-028

`AnnouncementBar` decide su visibilidad inicial leyendo `localStorage` en el
primer render del cliente, lo que puede producir un parpadeo perceptible al
hidratar (el servidor no conoce la preferencia guardada). spec-028 no corrige
este mecanismo, pero sí reduce su superficie: al ocultar el header completo
para visitantes sin sesión, `AnnouncementBar` deja de montarse en las páginas
públicas (`/`, `/grupo-investigacion`, `/login`, `/registro`).

**Acción:** Abordar junto con **[[DEBT-010]]** en la iteración dedicada a
temas — evaluar leer la preferencia desde una cookie (accesible en el
servidor) en vez de `localStorage`, para eliminar el flash por completo.

---

## DEBT-015 — Navbar usa clases crudas de Tailwind en lugar de tokens semánticos (parcial)

**Origen:** spec-028 (navbar por rol)
**Prioridad:** Baja — cosmético, sin impacto funcional; heredado del código anterior

`components/navbar/Navbar.tsx`, `UserMenu.tsx` y otros componentes del navbar
usan clases crudas de Tailwind (`text-gray-700`, `bg-blue-700`, `hover:bg-gray-100`,
etc.) en lugar de tokens semánticos del sistema de diseño (`--color-*` definidos
en `DESIGN.md`). El código nuevo de spec-028 (`NavLinkList.tsx`,
`CourseScopeSelect.tsx`) aplica tokens semánticos (`text-body`, `text-fg-brand`,
`text-fg-disabled`, `bg-neutral-tertiary`, `border-border-default`, etc.) **solo
para el modo claro**: el sistema de tokens de `DESIGN.md`/`globals.css` no
define equivalentes para modo oscuro (no hay `--color-body` distinto bajo
`.dark`), así que el modo oscuro de estos dos componentes sigue usando clases
crudas con prefijo `dark:` (`dark:text-gray-300`, `dark:bg-gray-800`, etc.),
igual que el resto del navbar heredado.

**Acción:** En una iteración dedicada a UI/tokens, (1) definir tokens
semánticos con variante oscura en `globals.css`/`DESIGN.md` y (2) refactorizar
todos los estilos del navbar (heredados y nuevos) para consumirlos también en
modo oscuro. Ver también **[[DEBT-008]]** (flash de tema claro/oscuro) — se
beneficiará del mismo trabajo de tokens.

---

## DEBT-014 — `NEXT_PUBLIC_SITE_URL` sin ningún uso en el código — ✅ Resuelto documentalmente (spec-026, Fase 3)

**Origen:** Detectado por `@reviewer` en la 3ª pasada de spec-027 (ajeno a su
alcance)
**Prioridad:** Baja — configuración muerta, no rompe nada

Tras eliminar `emailRedirectTo` de `signUp` (Fase 2) y todo el flujo de
recuperación de contraseña (ampliación de scope de spec-027, `SITE_URL` salió
de `lib/auth/actions.ts`), `NEXT_PUBLIC_SITE_URL` quedó **sin ninguna
referencia** en `*.ts`/`*.tsx` (verificado por grep global). `.env.example` y
`CLAUDE.md` la siguen describiendo como *"redirects OAuth y password
recovery"* — ambos flujos inexistentes hoy.

**Acción:** Decidir si se retira de `.env.example`/`CLAUDE.md`/Vercel, o se
deja documentada como reservada para un futuro flujo de OAuth (spec-002 la
tenía prevista, nunca implementada).

**Resolución (2026-07-30):** decisión del usuario — se deja **reservada**.
Se carga en Vercel Production con la URL de producción (Fase 4) por si un
futuro flujo (OAuth, `metadataBase`) la requiere. Se corrigió la descripción
en `.env.example` y `CLAUDE.md` para no mencionar flujos inexistentes.

---

## DEBT-013 — `npm run lint` falla por `<a>` en vez de `<Link>` en AcademicCourseList — ✅ Resuelto (spec-026, Fase 0)

**Origen:** Detectado por `@reviewer` durante la revisión de spec-027 (ajeno a
su alcance)
**Prioridad:** Media — bloquea que `npm run lint` termine en verde, condición
del checklist pre-despliegue

`components/admin/AcademicCourseList.tsx:31` usa un `<a>` nativo para navegar
a `/admin/courses/new/` en vez de `<Link />` de `next/link`, lo que dispara
`@next/next/no-html-link-for-pages` (5 veces, una por regla evaluada).

**Acción:** Reemplazar el `<a>` por `<Link href="/admin/courses/new">` en ese
archivo y verificar que `npm run lint` termina sin errores.

**Resolución (2026-07-30):** reemplazado por `<Link>` de `next/link` en
`components/admin/AcademicCourseList.tsx`. `npm run lint` termina con
0 errores, 10 warnings.

---

## DEBT-012 — Expiración automática de `enrollment_code`

> Retitulado el 2026-07-31: era "Rotación/expiración". **La rotación ya
> existe** — ver "Corrección de la premisa".

**Origen:** spec-027 (registro simplificado con código de curso)
**Prioridad:** ~~Alta~~ → **Media** — reclasificado el 2026-07-31: la mitad
del problema que lo hacía Alta no existe

Desde spec-027, el `enrollment_code` de `academic_courses` ya no es solo un
dato de conveniencia para matricularse desde `/cuenta/cursos`: es el único
mecanismo que evita que cualquier persona con correo inventado se registre en
la plataforma (ver sección "Riesgos de seguridad" de spec-027). El código se
comparte en voz alta a grupos de ~30 estudiantes, por lo que es fácil que
circule más allá del grupo.

> **Corrección de la premisa (2026-07-31).** Este ítem afirmaba que *"no existe
> forma de rotar o expirar un código sin romper la validación de matrículas ya
> hechas contra ese mismo valor"*. **Las dos mitades son falsas:**
>
> 1. **La rotación ya existe y funciona.**
>    `/admin/courses/[academicCourseId]/edit` renderiza `AcademicCourseForm`,
>    que incluye un botón de generar código nuevo
>    (`setValue("enrollment_code", generateCode())`,
>    `components/admin/AcademicCourseForm.tsx:56`), y `updateCourseAction`
>    (`lib/academic-courses/actions.ts:67`) lo persiste. El docente puede rotar
>    un código filtrado hoy mismo, sin código nuevo.
> 2. **Rotar no rompe ninguna matrícula.** `enrollments` referencia
>    `academic_course_id` (FK uuid a `academic_courses`), **no** el código
>    (`20260625000001_init_enrollments.sql:4`). El `enrollment_code` solo se usa
>    para *resolver* el curso en el registro y en `/cuenta/cursos`; una vez
>    creada la fila de matrícula es independiente del valor del código.
>
> Lo que sí falta —y es todo lo que queda de este ítem— es **expiración
> automática**: un código filtrado sigue siendo válido indefinidamente hasta
> que alguien se acuerde de rotarlo a mano.

**Mitigación existente:** `lib/auth/rate-limit.ts` limita intentos de registro
por IP (40) y por código (200) en ventanas de 10 min. Su propio comentario
advierte que es "una mitigación mínima, no una defensa robusta": en Vercel
(serverless, múltiples instancias) el conteo **no es global**, y la clave por IP
depende de `x-forwarded-for`, que controla el cliente.

**Acción:** Diseñar un spec para **expiración** de `enrollment_code` (ej.
vigencia temporal configurable por el docente, o un `valid_until` en
`academic_courses` que el gate de registro verifique). La rotación manual ya
está cubierta; documentarla en la guía del docente puede ser suficiente como
paso intermedio.

---

## DEBT-011 — Reintroducir recuperación de contraseña por correo cuando haya SMTP propio [ACTUALIZADO]

**Origen:** spec-027 (registro simplificado con código de curso)
**Prioridad:** Alta — bloqueante para cualquier estudiante que olvide su contraseña

**Actualización (misma ronda manual, 2026-07-29):** este ítem nació anotando
que `/recuperar-password` seguiría "rota" sin SMTP. Durante la ronda de
pruebas el usuario decidió ir más allá: en vez de dejar la UI visible pero no
funcional, se **eliminó por completo** el flujo (`/recuperar-password`,
`/recuperar-password/confirmar`, `PasswordResetRequestForm`,
`PasswordResetConfirmForm`, `requestPasswordReset`, `updatePassword`, los
schemas asociados, y el enlace en `LoginForm`) — ver spec-027, sección
"Incluye". Mientras no haya SMTP propio, el docente es el único canal real de
recuperación de cuentas (vía `students-mcp` → `update_student` con nuevo
`email`, o recreando la cuenta).

**Acción:** Cuando exista SMTP propio (ver **[[DEBT-001]]**), diseñar un spec
nuevo para **reconstruir** el flujo de recuperación de contraseña desde cero
(la implementación anterior ya no existe en el código) — no es un simple
"reactivar", hay que rehacer las rutas, formularios y Server Actions.

---

## DEBT-010 — Error de consola "script tag while rendering" en el init de tema (Next 16)

> **Ítem canónico.** El 2026-08-01 se abrió **[[DEBT-039]]** describiendo este
> mismo problema; se fusionó aquí y aquel número quedó como puntero. Toda la
> evidencia acumulada vive en este ítem.

**Origen:** Reportado por el usuario durante la ronda de pruebas de `test-020-assignment-review.md`, ajeno al scope de spec-020
**Reconfirmado:** Ronda manual de `test-036` (TC-036-012, 2026-08-01)
**Prioridad:** Media — error de consola en toda la app; relacionado con DEBT-008

Next.js 16.2.4 (Turbopack) reporta en consola:

```
Console Error
Encountered a script tag while rendering React component. Scripts inside React
components are never executed when rendering on the client. Consider using
template tag instead.
    at script (<anonymous>:null:null)
    at RootLayout (app/layout.tsx:47:9)
```

Apunta a `<Script id="theme-init" strategy="beforeInteractive" ...>` en
`app/layout.tsx` (línea 47 al reportarse, 48 tras ediciones posteriores),
montado **dentro del `<body>`** — el mismo mecanismo de aplicación de tema
documentado en **[[DEBT-008]]** (saltos perceptibles entre modo claro/oscuro).
No se investigó la causa raíz todavía; podría deberse a un cambio de
comportamiento de `next/script` con `strategy="beforeInteractive"` fuera de
`<Head>` en Next 16, o a una interacción con Turbopack/Cache Components.

**Evidencia adicional (2026-08-01, ex-[[DEBT-039]]):** se reprodujo primero de
forma indirecta durante `TC-036-012` —la pestaña de prueba quedó colgada en el
indicador "Rendering..." de Next.js, sin peticiones ni errores propios de la
app en curso— y se confirmó después navegando directamente: el error aparece
en **cualquier** página que use el layout raíz, no solo en el panel admin. Es
decir, contamina la consola en cada carga de la app y es sospechoso del
colgado transitorio de aquel caso.

**Acción:** Investigar en la misma iteración de temas/DESIGN.md prevista para
DEBT-008 — revisar si `next/script` con `beforeInteractive` sigue siendo la
API correcta en Next 16 para este caso (el propio mensaje sugiere `<template>`
para scripts inline tempranos), o si corresponde moverlo al `<head>` explícito
de `app/layout.tsx`, o a un mecanismo que no dispare la advertencia — por
ejemplo un atributo `data-*` leído por CSS, o `suppressHydrationWarning`
combinado con otro patrón de inyección (ver skill `next-upgrade`).

---

## DEBT-009 — Redirigir al listado de envíos tras finalizar una calificación

**Origen:** spec-020 (TC-009), reportado por el usuario durante la ronda de pruebas manuales
**Prioridad:** Baja — mejora de UX, no bloquea funcionalidad

Al finalizar la calificación de un envío en `SubmissionReviewPanel`, el panel
permanece en la misma vista (con la calificación final mostrada arriba y los
campos deshabilitados). El usuario propuso que, en su lugar, redirija
automáticamente al listado de envíos (`.../review`), para no tener que
navegar manualmente de vuelta y ver el envío ya reflejado en "calificados".

**Acción:** Evaluar el cambio en `finalizeGrading`/`SubmissionReviewPanel.tsx`
(`components/admin/SubmissionReviewPanel.tsx`) para redirigir tras un
finalizado exitoso. Fuera del scope aprobado de spec-020; abordar como tarea
propia o como ajuste de scope explícitamente aprobado en una próxima sesión.

---

## DEBT-008 — Saltos perceptibles entre modo claro/oscuro en algunos casos

**Origen:** spec-019 (TC-034), detectado al probar el jugador de evaluaciones
**Prioridad:** Baja — cosmético, no bloquea funcionalidad

Durante la ronda de pruebas de `test-019-assignment-solving.md` (TC-034) se
reportó que, en algunos casos, hay un salto/parpadeo perceptible al cambiar
entre modo claro y oscuro. El mecanismo de tema (`app/layout.tsx` con un
script inline `beforeInteractive` + `components/ThemeInit.tsx` que además
escucha cambios en vivo de `prefers-color-scheme`) es compartido por **toda
la app**, no algo introducido por spec-019 — fuera de su alcance.

**Acción:** investigar el origen del salto (posible doble aplicación del
tema entre el script inline y `ThemeInit` al hidratar, o ausencia de
transición CSS) en una iteración dedicada a temas/DESIGN.md.

---

## DEBT-007 — `assignment_questions` no trae el enunciado de la pregunta en el flujo de resolución del estudiante

**Estado:** ✅ Resuelto en spec-019 (2026-07-24) — ver nota al final de este ítem.
**Origen:** spec-018 (TC-003), detectado al probar la UI admin de solo lectura
**Prioridad:** Alta — bloquea que un estudiante pueda resolver una evaluación

Al probar `TC-003` en `test-018-assignment-authoring.md` se descubrió que
`AssignmentGroupDetail.tsx` mostraba `question_id` truncado en vez del
enunciado real de la pregunta. La causa: `_getGroupByIdForActor` en
`lib/assignments/index.ts` (y su equivalente en `service.ts`,
`getGroupDetail`) seleccionaban `assignment_questions` con `select("*")`, sin
`join` a `questions` para traer `stem`/`type`. **Ya corregido** para el path
admin (`_getGroupByIdForActor` y `getGroupDetail`) durante spec-018.

Quedan sin corregir, mismo problema, en `lib/assignments/index.ts`:
- `_getActiveAssignmentsByEnrollmentForActor`
- `_getStudentAssignmentForActor`
- `_getOrAllocateVariantForActor`

Estas tres funciones alimentan el flujo de **resolución de examen del
estudiante** (spec-019, aún no implementado), fuera del alcance de spec-018.
Sin este fix, un estudiante vería IDs en vez de preguntas al intentar
resolver una evaluación.

**Acción prevista:** aplicar el mismo `select("*, question:questions(id, stem, type)")`
en las tres funciones listadas arriba.

**Resolución real (2026-07-24):** el join propuesto no alcanzaba, porque además
del `select("*")` había un problema más profundo: RLS de `questions`/
`question_choices` (`created_by = auth.uid() OR is_published`) bloquea la fila
completa cuando el estudiante no es el autor y la pregunta es un borrador del
docente (`is_published` significa "compartida en el banco", no "usada en una
evaluación" — spec-018 nunca lo exige al componer variantes). El mismo join
también habría fallado silenciosamente para el cálculo de `auto_score` en
`submitSubmission` (necesita `question_choices.is_correct`).
En vez de tocar el join de las tres funciones de `lib/assignments/index.ts`
(ni su RLS, fuera del alcance de spec-019), se resolvió con dos funciones
`security definer` acotadas por `assignment_variant_allocations`, nuevas en
spec-019 (`20260724000002_variant_question_content_rpcs.sql`):
`get_variant_question_details` (contenido para renderizar, con `is_correct`
gateado por `show_feedback_on`/estado del intento) y `get_variant_answer_key`
(clave de respuestas sin gating, uso interno en `submitSubmission`). Las tres
funciones originales de `lib/assignments/index.ts` quedan sin modificar —
spec-019 las reemplaza para su propio flujo de lectura con
`lib/submissions/getVariantQuestionDetails`.

---

## DEBT-006 — `course.lessons` mezcla dos tipos de nodo; guard de dominio en progreso

**Origen:** spec-021 (guías de laboratorio)
**Prioridad:** Baja — no bloquea, es limpieza estructural

Tres deudas quedaron documentadas en spec-021 y no se abordaron por estar
fuera de su alcance:

1. **`course.lessons` contiene nodos de dos tipos** (`kind: "lesson" | "guide"`)
   pese a llamarse `lessons`. Renombrar a `nodes` y migrar el `kind` opcional
   a una unión discriminada (`type CourseNode = Lesson | Guide`) tocaría ~10
   archivos sin beneficio funcional inmediato — se pospone a cuando llegue
   Payload CMS (Fase 2 del proyecto), momento natural para remodelar el tipo.
2. **`markLessonViewed` / `markLessonCompleted`** (`lib/progress/index.ts`) no
   rechazan slugs que no correspondan a una lección navegable; confían en que
   el llamador filtre guías antes de invocarlas. No hay FK de
   `lesson_progress` al catálogo de contenido que lo impida en base de datos.
3. **Código muerto:** `PreparationPlaceholder` y el estado "bloqueada /
   Próximamente" del sidebar (`LessonSidebarItem.tsx`) no tienen ningún caso
   real hoy — las 60+ lecciones/guías declaradas siempre tienen `articleSlug`.

**Acción:** Revisar en el spec que introduzca Payload CMS o el siguiente que
toque `lib/progress/`.

---

## RESUELTO — Colisión de numeración en spec-006 (2026-07-18)

**Origen:** `spec-006-lecciones-privadas-navbar.md` (`[DONE]`, creado 2026-07-10)
y `spec-006-assignment-authoring.md` (planificado, creado 2026-07-15) compartían
el número `006`. Este último arrastraba también a `spec-007-assignment-solving`
y `spec-008-assignment-review` en la misma cadena de dependencias.

**Resolución:** se renumeró el track de evaluaciones planificado, sin tocar el
track de lecciones (ya `[DONE]`):
- `spec-006-assignment-authoring.md` → `spec-018-assignment-authoring.md`
- `spec-007-assignment-solving.md` → `spec-019-assignment-solving.md`
- `spec-008-assignment-review.md` → `spec-020-assignment-review.md`
- Sus `test-NNN` correspondientes se renombraron igual.
- Se actualizaron las referencias cruzadas en `spec-005-question-bank.md`,
  `spec-009-progreso-leccion.md` y `spec-011-autoevaluacion-cierre.md`.

**Pendiente menor:** `spec-013-home-grilla-cursos.md` tiene una mención
ambigua ("protegido por matrícula desde spec-006/007") que no se pudo
atribuir con certeza al track de asignaciones (spec-007 nunca se implementó,
por lo que no puede proveer protección de ruta); se dejó sin tocar. Revisar
si es una errata y corregir a solo `spec-006` cuando se retome esa área.

---

## DEBT-025 — Temas opcionales de los 3 cursos sin lección asignada

> Renumerado de `DEBT-006` a `DEBT-025` el 2026-07-30: compartía número con
> "`course.lessons` mezcla dos tipos de nodo", que conserva el `DEBT-006`.

**Origen:** Reorganización de `content/cursos/` a partir del contenido real de
`courses/01-estructura-de-datos`, `courses/02-analisis-de-algoritmos` y
`courses/03-programacion-cientifica` (2026-07-18). Decisión explícita del
usuario: dejar fuera por ahora los temas sin semana asignada en el cronograma.
**Prioridad:** Baja — no bloquea producción

Cada curso tiene una sección "Temas opcionales" en su `info.md` sin semana
asignada en el cronograma, que no se creó como lección:

- **Estructuras de datos:** Tablas Hash, Grafos.
- **Análisis de algoritmos:** Grafos, Análisis amortizado, Introducción a
  NP-completitud.
- **Programación científica:** Consumo de APIs de datos abiertos,
  Introducción a scikit-learn.

**Acción:** Si se decide incorporarlos, crear su `.mdx` en
`content/cursos/<curso>/` y su entrada en `lib/courses/data/<curso>.ts` con
`order` posterior a la última lección regular del curso.

---

## DEBT-005 — MDX huérfanos en `estructuras-de-datos` sin lección asociada [RESUELTO]

**Origen:** Fix ad-hoc durante spec-016 (redirect de curso a lección) — el
usuario eliminó `bienvenida-al-curso.mdx` por no ser necesario, lo que expuso
que 4 lecciones (`pilas-y-colas`, `arboles`, `tablas-hash`, `grafos`)
referenciaban `articleSlug` sin archivo `.mdx` en disco, rompiendo el build.

**Resuelto el 2026-07-18:** la reorganización completa de `content/cursos/`
reemplazó las lecciones genéricas de los 3 cursos (incluidas las que
originaron este ítem) por la estructura real derivada de
`courses/01-estructura-de-datos`, `courses/02-analisis-de-algoritmos` y
`courses/03-programacion-cientifica`. Los `.mdx` huérfanos
(`configuracion-entorno-de-trabajo.mdx`, `java.mdx`, `poo-clases.mdx`) se
eliminaron por instrucción del usuario ("solo fueron una prueba"); toda
lección nueva tiene su `.mdx` correspondiente.

---

## DEBT-004 — Sin acción de eliminar/desactivar curso en el panel admin — ✅ Resuelto (spec-036, 2026-08-01)

**Origen:** Consulta del usuario sobre cómo eliminar un curso (2026-07-16)
**Prioridad:** ~~Media~~ → **Resuelto**

`AcademicCourseList.tsx` y el detalle de curso (`app/(admin)/admin/courses/[academicCourseId]/`)
no exponen ningún botón de eliminar ni desactivar. Ya existe
`deactivateCourseAction` en `lib/academic-courses/actions.ts` (soft delete vía
`is_active: false`), pero no está conectado a ningún componente de la UI. No
existe una acción de borrado definitivo (hard delete).

**Acción:** Diseñar spec para exponer en la UI:
1. Desactivar curso (usa `deactivateCourseAction` ya existente).
2. Evaluar si además se requiere borrado definitivo, y si debe hacerse en
   cascada (asistencia, notas, matrículas asociadas).

**Resolución (2026-08-01):** implementado y probado en
`docs/specs/spec-036-admin-curso-slug-y-ciclo-de-vida.md` — `[DONE]`. El panel
admin expone ahora el ciclo de vida completo del curso: **desactivar** (conecta
`deactivateCourseAction`, que además dejó de tragar errores y ya verifica filas
afectadas), **reactivar** —sin la cual la desactivación era un viaje de ida— y
**borrado definitivo**, cada uno con su diálogo de confirmación.

Sobre el punto 2, la decisión del usuario fue **no** hacer borrado en cascada:
el borrado definitivo se limita a **cursos vacíos** (sin matrículas ni
evaluaciones, verificado con `getCourseDependencyCounts`), con un diálogo más
exigente que el de desactivar que advierte del arrastre de sesiones de
asistencia e ítems de nota. Registrado como decisión D1 del spec.

También quedó explícito que `is_active=false` significa *"cerré las
inscripciones"*, no *"expulsé a mi curso"*: los estudiantes ya matriculados
conservan acceso al contenido, porque `hasCourseAccess`
(`lib/enrollments/access.ts`) mira `enrollments.status` y no `course.is_active`.

---

## DEBT-003 — `course_slug` de `academic_courses` sin validación ni selector — ✅ Resuelto (spec-036, 2026-08-01)

**Origen:** Revisión manual durante spec-006 (lecciones privadas)
**Prioridad:** ~~Media~~ → **Resuelto**

En `AcademicCourseForm` (`components/admin/AcademicCourseForm.tsx`), el campo
`course_slug` es un input de texto libre: el docente debe escribir a mano el
slug del curso de contenido MDX que quiere vincular. `AcademicCourseSchema`
(`lib/academic-courses/schemas.ts`) no valida su formato ni su existencia, y
no hay FK en base de datos (el contenido vive en `lib/courses/data/` + MDX en
disco, fuera de Postgres — ver spec-003, línea 136). Si el docente teclea un
slug inexistente o con un typo, el `academic_course` se crea igual, sin
ningún error, y las lecciones del curso nunca se resuelven (404 vía el gate
de spec-006).

**Acción:** Reemplazar el input libre por un selector poblado con los slugs
reales de `lib/courses/index.ts` (o al menos validar contra esa lista en el
server action antes de persistir), para evitar cursos académicos sin
contenido asociado.

**Resolución (2026-08-01):** implementado y probado en
`docs/specs/spec-036-admin-curso-slug-y-ciclo-de-vida.md` — `[DONE]`. Se
hicieron **las dos** cosas que la acción planteaba como alternativas: el input
libre pasó a ser un **selector** poblado con los cursos reales del contenido
(nombre + slug, con opción explícita "— Sin vincular —"), y además
`createCourseAction`/`updateCourseAction` **validan el slug en el servidor**
contra esa misma lista — la validación de cliente es comodidad, no barrera.

Durante la redacción del spec apareció un bug adicional que este ítem no había
detectado y que se corrigió en el mismo trabajo: **desvincular era imposible**.
`updateCourseAction` hacía `course_slug: parsed.data.course_slug || undefined`,
así que al vaciar el campo el cliente de Supabase omitía la columna del
`UPDATE` y el slug anterior quedaba intacto, sin error. Sin ese arreglo la
opción "— Sin vincular —" habría sido decorativa al editar.

Los cursos ya creados con un typo **se señalizan como huérfanos** en el
listado, para poder detectarlos y corregirlos; migrar los `course_slug` ya
guardados en producción quedó explícitamente fuera de alcance (es trabajo de
contenido).

---

## DEBT-002 — Definir marca canónica: "Semillero SITAIM" vs "nodo"

**Origen:** spec-004 (landing home)
**Prioridad:** Media — impacto visual pero no funcional

El Navbar global muestra "Semillero SITAIM" mientras la landing home (spec-004)
usa "nodo" en el hero y footer. No se unificó en spec-004 para no bloquear.

**Acción:** Decidir marca canónica y aplicarla consistentemente en:
- Navbar (`components/navbar/`)
- Landing footer (`components/landing/LandingFooter.tsx`)
- Metadata global y títulos de página
- Assets de marca (logo, favicon — si aplica)

**Nota:** Esta decisión afecta la identidad visual de toda la plataforma.

---

## DEBT-001 — Configurar SMTP propio en Supabase

**Origen:** spec-002 / test-002 (TC-011, TC-012, TC-014)
**Prioridad:** Alta — requerido antes de producción

El plan gratuito de Supabase limita a 3 emails de auth por hora. Las pruebas
TC-011 (recuperación de contraseña), TC-012 (correo no registrado) y TC-014
(reenvío de confirmación) quedaron sin ejecutar por este límite.

**Acción:** Configurar SMTP externo en Supabase → Project Settings → Auth →
SMTP Settings. Proveedor recomendado: **Resend** (plan gratuito 3.000
emails/mes, configuración simple con Supabase).

Una vez configurado, ejecutar y aprobar TC-011, TC-012 y TC-014 en
`docs/testing/test-002-student-auth-supabase.md`.

---
