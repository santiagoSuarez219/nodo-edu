# spec-054 — [TESTING] Planilla de asistencia editable en el panel del curso

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

El docente puede abrir una sesión, proyectar el código y ver el conteo en vivo
desde la vista de lección (`AdminAttendancePanel`, spec-031/041). Eso cubre la
clase **en curso**. Cerrada la clase, la asistencia queda en la base de datos y
es consultable por un agente vía `attendance-mcp`, pero **no existe ninguna
superficie donde el docente la vea ni la corrija**.

Las dos carencias son distintas y ambas duelen:

1. **No hay vista de conjunto.** Preguntas como "¿quién va perdiendo por
   fallas?" o "¿cuántas clases llevamos?" no tienen respuesta en la interfaz.
2. **No hay corrección.** El flujo real del aula produce huecos legítimos:
   el estudiante sin batería que no alcanzó a marcar, la clase que el docente
   olvidó abrir en la plataforma, la sesión abierta por error un día festivo.
   Hoy esos errores son permanentes.

Este spec resuelve las dos con una única superficie: una **planilla matriz
estudiantes × sesiones**, editable, en el panel del curso.

### Antecedente descartado

Existió un `spec-052-panel-asistencia-curso` (rama `feat/panel-asistencia-curso`,
commit `446dd2d`), redactado y **nunca implementado**, que proponía una vista de
solo lectura organizada por sesión (listado + detalle). El usuario descartó ese
formato a favor de la matriz y ese documento **no se recupera al repositorio**;
su número lo ocupa hoy `spec-052-integracion-sentry`. De aquel análisis se
conservan tres decisiones que siguen siendo correctas —lectura con la sesión del
docente (D1), cruce contra matrículas activas (D2), señalización honesta de
fallos (D3)— y se descarta una (limpieza de `EnrollmentTable`, ver D14).

### Lo que ya existe y no hay que construir

| Pieza | Estado |
|---|---|
| `class_sessions`, `attendance_records` | `supabase/migrations/20260716000000_init_attendance.sql` |
| RLS de lectura para docente dueño/admin | `class_sessions_select_owner_or_admin`, `attendance_records_select_own_or_teacher_or_admin` |
| RLS de **borrado** de registros para docente dueño/admin | `attendance_records_delete_teacher_or_admin` — ya existe, comentada como "correcciones manuales futuras". **Desmarcar no necesita policy nueva.** |
| RLS de insert/update/delete de `class_sessions` para docente dueño/admin | Existen las tres. **Crear y eliminar sesiones no necesitan policy nueva.** |
| Precedente de matriz editable con guardado por celda | `components/admin/GradesTable.tsx` + `GradeInputCell.tsx` (columna sticky, `overflow-x-auto`, estado optimista, blindaje de spec-053) |
| Lectura de nombres de estudiante para el docente | `fetchStudentProfilesPublic()` en `lib/enrollments/index.ts` — **obligatoria**: el docente **no** puede leer `profiles` de sus estudiantes vía RLS |

## Alcance

### Incluye

1. **Pestaña "Asistencia"** en `/admin/courses/[academicCourseId]/asistencia`.
2. **Planilla matriz**: filas = estudiantes con matrícula **activa**, columnas =
   sesiones del curso, celdas = presente/ausente, más una columna de
   **% de asistencia** por estudiante.
3. **Marcar y desmarcar** la asistencia de un estudiante en una sesión desde la
   celda.
4. **Crear una sesión manualmente**, sin código de asistencia, con la fecha que
   el docente indique (para registrar una clase que nunca se abrió en la
   plataforma).
5. **Editar la fecha** de una sesión y **eliminar** una sesión.
6. Migraciones de esquema y RLS que habilitan lo anterior (D6, D7, D8, D12).

### No incluye

- **Un tercer estado "excusado" / "justificado".** Descartado explícitamente por
  el usuario en la sesión de diseño (2026-08-29). La asistencia sigue siendo
  **binaria**: existe registro (presente) o no existe (ausente). No se introduce
  columna de estado ni fila para el ausente.
- **Controles de sesión en vivo** (abrir, cerrar, extender o rotar el código).
  Viven en la vista de lección y ahí se quedan (D5).
- **Marcado masivo** ("todos presentes", marcar una columna entera de un golpe).
- **Exportar a CSV/PDF.**
- **Herramientas de escritura en `attendance-mcp`** (ver "Evaluación MCP").
- **Ordenar, filtrar o paginar** la planilla.
- **Cambiar la columna "Fecha matrícula"** de `EnrollmentTable.tsx` (D14).
- **Recalcular ninguna nota.** La asistencia no alimenta `student_grades`.

## Impacto en el sistema

### Base de datos

| Archivo de migración | Nuevo/Modificado | Contenido |
|---|---|---|
| `supabase/migrations/20260829000000_attendance_manual_sessions.sql` | **Nuevo** | `attendance_code` y `code_expires_at` de `class_sessions` pasan a `nullable` (D7); columna `marked_by uuid` en `attendance_records` (D8) |
| `supabase/migrations/20260829000001_rls_attendance_teacher_marking.sql` | **Nuevo** | Policy `attendance_records_insert_teacher_or_admin` (D6); `with check` en `class_sessions_mutate_owner_or_admin`, que cierra [[DEBT-046]] (D12) |

No se toca `20260716000002_attendance_rpcs.sql`: ambos RPCs siguen siendo
correctos con las columnas nullable (verificado en D7).

### Aplicación

| Archivo | Nuevo/Modificado | Cambio |
|---|---|---|
| `lib/attendance/types.ts` | Modificado | `attendance_code: string \| null` y `code_expires_at: string \| null` en `ClassSession`; `marked_by` en `AttendanceRecord`; tipos nuevos `AttendanceSheetSession`, `AttendanceSheetRow`, `AttendanceSheetResult` |
| `lib/attendance/index.ts` | Modificado | Lectura nueva `getAttendanceSheet(academicCourseId)` con `createServerSupabaseClient()` (D1, D2, D3) |
| `lib/attendance/actions.ts` | **Nuevo** | Server Actions: `markStudentAttendanceAction`, `unmarkStudentAttendanceAction`, `createManualSessionAction`, `updateSessionDateAction`, `deleteSessionAction` |
| `lib/attendance/schemas.ts` | **Nuevo** | Esquemas Zod de los inputs de las acciones (fecha ISO, uuids) |
| `lib/attendance/service.ts` | Modificado | `code_expires_at` de las interfaces internas pasa a `string \| null` (D7) — sin cambio de comportamiento |
| `app/(admin)/admin/courses/[academicCourseId]/asistencia/page.tsx` | **Nuevo** | Página de la pestaña; `requireAnyRole(["teacher","admin"])` |
| `components/admin/CourseTabs.tsx` | Modificado | Cuarta pestaña "Asistencia", mismo patrón `isActive` / `aria-current` |
| `components/admin/AttendanceSheet.tsx` | **Nuevo** | La matriz: cabeceras, columna de estudiante sticky, columna de % sticky, estado optimista (D9, D10) |
| `components/admin/AttendanceCell.tsx` | **Nuevo** | Una celda: checkbox, guardado al vuelo, estado saving/saved/error (D9) |
| `components/admin/AttendanceSessionActions.tsx` | **Nuevo** | Menú por columna: editar fecha / eliminar sesión, con el modal de confirmación (D11) |
| `components/admin/CreateManualSessionForm.tsx` | **Nuevo** | Formulario de sesión manual (React Hook Form + Zod) |
| `components/admin/AdminAttendancePanel.tsx` | Modificado | Absorber `attendance_code` / `code_expires_at` nullables sin romper el tipado (D7) |

## Evaluación MCP

**¿Aplica MCP?** Sí — pero la conclusión es **no añadir herramientas de
escritura**, y sí un ajuste de contrato de lectura.

- **MCP existente a modificar:** `attendance-mcp` — **ninguna herramienta nueva**.
- **System prompt afectado:** `docs/mcps/attendance-agent.system-prompt.md` —
  **sin cambios de capacidades**; solo la nota de contrato del punto 2.
- **Fase de MCP en este spec:** ninguna fase dedicada. El ajuste del punto 2 se
  ejecuta dentro de la Fase 2 (tipos), y su verificación dentro de la Fase 7.

**1. Por qué NO se añaden herramientas de escritura.** Este spec sí introduce
escrituras nuevas (marcar, desmarcar, crear/editar/eliminar sesión), así que la
pregunta es legítima. La respuesta es negativa por dos razones que se refuerzan:

- *El agente no tiene el dato.* Marcar a mano es un acto de **testimonio**: el
  docente afirma "esta persona estaba en el aula". Un agente no presenció la
  clase; cualquier herramienta `mark_attendance` produciría asistencia inventada
  con apariencia de registro verificado. El system prompt actual ya lo declara
  ("Nunca intentes abrir, cerrar o marcar asistencia… esas acciones solo ocurren
  en el aula presencial"), y esa restricción **sigue siendo correcta después de
  este spec**, no a pesar de él.
- *Sería la puerta trasera del diseño original.* El esquema evita
  deliberadamente que la asistencia se pueda insertar por cualquier vía que no
  valide presencia. Exponerla por HTTP con una API key de servicio —que no
  distingue qué docente la usa ni sobre qué curso— reintroduciría exactamente el
  agujero que `mark_attendance_by_code` existe para cerrar, y encima con
  privilegios de `service_role`. La escritura se queda en Server Actions
  autorizadas por RLS con la sesión del docente (D1, D6).

Lo mismo vale, con menos fuerza, para crear/eliminar sesiones: no hay caso de
uso pedido ("créame la sesión del martes" es más lento por chat que por la
planilla) y eliminar una sesión es destructivo en cascada (D11) — la peor clase
de acción para delegar a un agente sin confirmación humana en pantalla.

**2. Ajuste de contrato de lectura (obligatorio, no opcional).** Al volver
`code_expires_at` nullable (D7), la respuesta de `list_sessions` puede contener
`code_expires_at: null` para las sesiones manuales. `mcp-servers/attendance-mcp`
lo pasa tal cual al agente, así que no rompe en ejecución, pero el tipo de
`lib/attendance/service.ts` deja de ser cierto y el agente podría reportar
"expira: null". Se corrige el tipo en la Fase 2 y se verifica con `TC-MCP-054-001`.

**3. Lo que sí es candidato futuro, y por qué no aquí.** `marked_by` (D8) hace
distinguible un marcado manual de uno con código, dato que un agente podría
querer ("¿cuánta de la asistencia del semestre fue registrada a mano?"). No se
expone en `get_session_attendance` en este spec: el dato nace hoy, no hay
histórico que consultar y nadie lo ha pedido. Se registra en el backlog (Fase 7).

## Decisiones de diseño

**D1 — Toda lectura y escritura de la planilla va con la sesión del docente, no
con `service_role`.** Las funciones de `lib/attendance/service.ts` usan
`createServiceSupabaseClient()`, que **bypasea RLS**, y **ninguna recibe un actor
ni comprueba propiedad**. Hoy son seguras porque su única entrada es
`/api/attendance/*`, protegida por API key. Llamarlas desde el panel expondría la
asistencia de cualquier curso a quien alcance la ruta con un `academicCourseId`
ajeno. La planilla usa `createServerSupabaseClient()` y deja que **RLS** autorice;
las policies existentes ya expresan la regla exacta. Coincide con CLAUDE.md
("`SUPABASE_SERVICE_ROLE_KEY` bypasa RLS — nunca importar en archivos bajo `app/`
o `components/`").

> Descartado: reutilizar `service.ts` añadiendo una comprobación de propiedad en
> código. Duplica en TypeScript una regla que ya vive en la base de datos, y
> basta **una** ruta futura que olvide la comprobación para exponerlo todo.

**D2 — Las filas son las matrículas activas; la ausencia es la *falta* de
registro.** `attendance_records` solo contiene a quien asistió. La planilla cruza
las sesiones del curso con las matrículas `status = 'active'` y pinta cada celda
según exista o no el registro. No se materializa ninguna fila de ausencia.

Consecuencias, todas deliberadas:
- Un **estudiante retirado** desaparece de la planilla, aunque tenga registros de
  cuando sí asistía. Sus registros **no se borran** y siguen contando en
  `get_course_attendance_summary` del MCP. Se verifica en `TC-054-013` — es el
  borde que más fácil se implementa mal.
- Un estudiante **matriculado tarde** aparece con ausencias en sesiones anteriores
  a su matrícula, y su % sale penalizado. Es una imprecisión conocida (mismo
  criterio que ya usa el RPC del MCP); corregirla exige comparar `enrolled_at`
  con `session_date` y decidir una semántica que nadie ha pedido. Al backlog
  (Fase 7).

**D3 — Señalización honesta de fallos.** `getAttendanceSheet` devuelve el tipo
discriminado `{status: 'ok' | 'unavailable'}` que `lib/attendance/index.ts` ya usa
desde spec-037. Un curso sin sesiones, un curso sin estudiantes y un fallo de
lectura son **tres cosas distintas** y la UI las distingue: una planilla vacía es
un dato del que el docente saca conclusiones; un fallo no lo es. Se verifica el
`error` de cada consulta antes de confiar en `data` — lo contrario de lo que
documenta [[DEBT-040]].

**D4 — Escrituras por Server Action, no por API route.** Convención del proyecto
para la UI del panel. Todas devuelven `AuthResult` (`lib/auth/types.ts`), llaman a
`requireUser()` y revalidan `/admin/courses/${academicCourseId}/asistencia`. En
cliente, cada invocación se envuelve con `isServerActionTransportError()` +
`reportTransportError()` (spec-053): si el gate de Auth responde 503 sobre el POST
del Server Action, la celda muestra el mensaje honesto de
`SERVER_ACTION_TRANSPORT_ERROR_MESSAGE` en vez de romper contra el error boundary.

**D5 — La planilla no abre, cierra, extiende ni rota códigos.** Esos controles
viven en `AdminAttendancePanel`, en la vista de lección, y tener dos superficies
que lean y muevan el mismo estado por caminos distintos es justo la divergencia
que produjo [[DEBT-052]]. **Pero crear/editar/eliminar sesiones sí vive aquí**, y
la frontera no es arbitraria:

| | Vive en la lección | Vive en la planilla |
|---|---|---|
| Naturaleza | Efímero, en vivo, mientras dura la clase | Curatorial, sobre el registro histórico |
| Momento | Durante la clase | Después, corrigiendo |
| Opera sobre | La sesión abierta (`is_open = true`) | Sesiones cerradas |

Cómo se le comunica al docente: la columna de la **sesión abierta**, si la hay, se
marca con una insignia "En curso" y sus acciones de edición/borrado quedan
**deshabilitadas**, con un texto que dice dónde se gestiona ("Esta sesión está en
curso; se cierra desde la lección"). No hay un segundo botón de cerrar.

**D6 — Marcar a mano: policy de `insert` acotada, no un RPC nuevo.** El comentario
de `20260716000001_rls_attendance.sql` es explícito: *"INTENCIONALMENTE: sin
insert policy. Toda inserción de asistencia ocurre a través del RPC security
definer `mark_attendance_by_code`, que valida matrícula activa y evita fraude sin
confiar en la política de tabla."*

Ese razonamiento protege contra **el estudiante**: sin insert policy, un JWT de
estudiante hablando directo con PostgREST no puede autoinsertarse asistencia sin
código válido. **La premisa se mantiene intacta** con una policy cuyo `with check`
exija que el llamador sea el docente dueño de la sesión o admin: un JWT de
estudiante falla el predicado y sigue teniendo exactamente cero vías de insert
fuera del RPC. No se relaja nada de lo que el comentario protegía; se añade un
actor distinto, con autoridad distinta.

Se elige la policy sobre un RPC `teacher_mark_attendance` porque:
- **Simetría.** `attendance_records_delete_teacher_or_admin` ya existe con ese
  mismo predicado, y fue escrita anticipando este caso ("correcciones manuales
  futuras"). Desmarcar sería una operación de tabla y marcar un RPC: dos caminos
  para la misma corrección, con dos sitios donde equivocarse.
- **Coherencia con D1.** Un `security definer` es precisamente renunciar a que RLS
  autorice. Aquí no hace falta: no hay nada que el docente no pueda ver.
- **Lo que el RPC aportaría, la policy lo expresa igual.** La validación de
  matrícula activa cabe en el `with check`.

La policy exige tres cosas sobre la fila resultante: (a) el llamador es el docente
dueño del curso de la sesión, o admin; (b) el `student_id` tiene matrícula
**activa** en ese curso; (c) `marked_by = auth.uid()` (D8), lo que hace la
procedencia no falsificable dentro de RLS. La migración **reescribe el comentario
del bloque** para que el siguiente lector no crea que el invariante se abandonó.

Desmarcar no requiere nada nuevo: `delete` sobre `attendance_records` ya está
cubierto. La unicidad `(session_id, student_id)` hace inofensivo un doble marcado.

**D7 — `attendance_code` y `code_expires_at` pasan a `nullable`; `NULL` significa
"sesión que nunca tuvo código".** Crear una sesión manual choca con el `not null`
de ambas columnas. Alternativas:

| Opción | Veredicto |
|---|---|
| **Nullable, `NULL` = registrada a mano** | **Elegida.** El dato es honesto: esa sesión de verdad no tuvo código. Además da gratis la trazabilidad a nivel de sesión. |
| Código quemado + `code_expires_at` en el pasado | Descartada. Inventa un código que nunca existió y que el histórico presentará como real. Y hay que fabricar un valor que no colisione, para nada. |
| Tabla aparte de sesiones manuales | Descartada. Duplica el modelo y obliga a unir dos fuentes en cada lectura y en el MCP. |

Se verificó que nada se rompe:
- El índice `unique (attendance_code) where is_open` **no aplica**: la sesión
  manual nace `is_open = false` (D13), fuera del índice parcial. Y aunque
  aplicara, Postgres admite múltiples `NULL` en un índice único.
- `mark_attendance_by_code` busca `where attendance_code = p_code and is_open =
  true`; un `NULL` nunca iguala a un `p_code` no nulo (y el formato se valida
  antes, en `markAttendanceByCode`). **Una sesión manual es inalcanzable por
  código.**
- `get_student_session_status` exige `is_open = true and code_expires_at > now()`;
  con `NULL` el predicado es `NULL`, es decir falso. **Nunca se ofrece al
  estudiante.**
- En TypeScript el cambio sí se propaga: `ClassSession.attendance_code` y
  `.code_expires_at` pasan a `string | null`, y `AdminAttendancePanel.tsx`
  (líneas 143, 172, 394) debe absorberlo. En la práctica una sesión **abierta**
  siempre tiene ambos —`openSession` los escribe—, así que basta un fallback
  explícito, no un rediseño.

**D8 — Sí se distingue el marcado manual: columna `marked_by uuid`.** Evaluado y
**recomendado incluir**, pese a ser el ítem más fácil de recortar:

- **`NULL` = el propio estudiante con el código; un uuid = quién lo marcó a
  mano.** Todos los registros existentes quedan correctamente clasificados por
  construcción, sin backfill.
- **Es irrecuperable si se omite.** Un registro guardado sin procedencia no se
  puede reclasificar después; añadir la columna en seis meses deja un hueco
  permanente justo en el histórico que importa.
- **Protege la credibilidad de la planilla.** Sin ella, "presente" pasa a
  significar dos cosas distintas —"marcó con el código" y "el docente afirma que
  vino"— fundidas en una sola casilla, y ante una reclamación de nota no hay cómo
  reconstruir cuál fue.
- **Coste real: una columna nullable en una migración que de todos modos hay que
  escribir**, más un `with check` de una línea (D6).

Descartado `source text check in ('code','manual')`: guarda menos (no dice quién)
por el mismo precio. En la UI el peso es mínimo: **no** se añade columna; la celda
marcada a mano lleva un punto discreto y el `title`/`aria-label` lo dice
("Marcada manualmente por el docente"). Lo que se descarta explícitamente por
alcance es **exponerlo en el MCP** (ver Evaluación MCP, punto 3).

**D9 — Guardado por celda, al vuelo, con estado optimista; no en lote.**

- **Precedente directo:** `GradeInputCell` guarda una nota por celda al `blur` y
  la matriz de calificaciones vive de eso. Una planilla que guardara en lote sería
  la única superficie del panel con un botón "Guardar" que se puede olvidar.
- **Cada celda es una fila entera, no un campo.** Marcar = `insert`, desmarcar =
  `delete`. Un lote exigiría calcular un diff y definir qué hacer si 3 de 12
  escrituras fallan; por celda, el fallo es atómico y localizado.
- **El caso de uso es de corrección, no de captura.** La captura masiva ya la
  hace el código en el aula; aquí se arreglan casos sueltos.

Comportamiento: el checkbox se invierte **de inmediato** (optimista) y se
deshabilita mientras la acción viaja. Si la acción falla —`ok: false` o error de
transporte (D4)—, la celda **revierte al valor anterior**, se pinta el borde en
rojo y se anuncia el fallo por una región `aria-live`, como hace `GradeInputCell`.
Nunca se deja una casilla marcada en pantalla que no esté guardada en la base de
datos: ese es el fallo que arruinaría la confianza en toda la planilla.

Coste aceptado: marcar una columna entera son N peticiones. Mitigado porque el
marcado masivo está fuera de alcance.

**D10 — Ergonomía de la matriz: scroll horizontal con dos columnas fijas.** Un
semestre son ~32 sesiones; a ~2.5 rem por columna no cabe en ninguna pantalla.

- **Layout:** contenedor `overflow-x-auto` con `<table>` interna. La columna
  **Estudiante** queda fija a la izquierda (`sticky left-0`) y la de **%** fija a
  la derecha (`sticky right-0`), con las sesiones desplazándose entre ambas.
  Ambas fijas necesitan fondo opaco propio en claro y oscuro (`bg-white
  dark:bg-gray-800`, y `bg-gray-50 dark:bg-gray-700` en el `thead`), tal como ya
  hace `GradesTable`; sin eso el contenido se transparenta al desplazar.
- **Orden:** sesiones en orden cronológico **ascendente** de izquierda a derecha,
  y el contenedor **se desplaza al extremo derecho al montar**, para que la clase
  más reciente —la que se corrige— esté a la vista sin dejar de leer el semestre
  en su dirección natural.
- **Cabecera de columna:** día/mes en dos líneas (`12` / `ago`), con la fecha
  completa en el `title` y en un `<span class="sr-only">`. Ancho fijo de columna
  para que las 32 sean uniformes.
- **Accesibilidad** (obligatoria, no cosmética — es una tabla de casillas):
  - `<th scope="col">` en cada sesión y `<th scope="row">` en cada estudiante.
  - Cada checkbox lleva `aria-label` con **nombre completo y fecha completa**
    ("Asistencia de Ana Gómez el 12 de agosto de 2026"), porque un lector de
    pantalla que solo anuncie "casilla" en una rejilla de 32×N es inútil.
  - `aria-live="polite"` por celda para el resultado del guardado, y `<caption>`
    en la tabla describiendo qué es la matriz.
  - Navegación por teclado: el checkbox nativo ya da tabulación y `Space`; **no**
    se implementa navegación por flechas (fuera de alcance).
- **Móvil:** la misma tabla con scroll horizontal, sin layout alternativo. Un
  segundo diseño sería una segunda copia de la lógica de edición, y el panel
  docente es una superficie de escritorio. La columna sticky de nombre mantiene la
  orientación al desplazar, que es lo que hace usable el scroll.

**D11 — Eliminar una sesión es destructivo en cascada y la confirmación lo dice
con números.** `attendance_records.session_id` es `on delete cascade`: borrar la
sesión del 12 de agosto **borra en silencio los registros de asistencia de todos
los que sí vinieron ese día**, y eso mueve el % de todo el curso.

La confirmación es un **modal Flowbite**, no `window.confirm`, y su texto incluye
el **conteo real** de registros que se pierden, obtenido de la propia planilla que
ya está en pantalla:

> Eliminar la sesión del **12 de agosto de 2026** borrará también sus **18
> registros de asistencia**. Esta acción no se puede deshacer.

El botón destructivo usa el token de peligro (`bg-red-700 dark:bg-red-600`) y no
es el botón por defecto del modal. Se prefiere el modal sobre el `confirm()` de
`GradeItemsPanel.tsx:55` precisamente porque aquí el número es la mitad del
mensaje y un `confirm()` nativo no permite jerarquizarlo.

**D12 — Se cierra [[DEBT-046]] en la migración de RLS de este spec.**
`class_sessions_mutate_owner_or_admin` es `for update` con `using (...)` y **sin
`with check`**: la fila *resultante* no se valida contra nada, así que un docente
puede reasignar una sesión —con todos sus `attendance_records`— al curso de otro
docente. El backlog lo dejó pendiente porque "ninguna Server Action escribe
`academic_course_id`" y tocarlo exigía una migración fuera del alcance de spec-041.

Ese argumento ya no aplica: **este spec introduce la primera escritura de UI que
hace `update` sobre `class_sessions` por algo distinto del código** (editar la
fecha), y trae dos migraciones propias con su ronda de pruebas. Añadir
`with check (<mismo predicado que using>)` es un `alter policy` de tres líneas en
un archivo que de todas formas se escribe. Enviar el editor de fechas sobre una
policy que no valida la fila resultante sería introducir la funcionalidad y dejar
el agujero abierto en el mismo commit.

Se cierra **solo la parte de `class_sessions`**. La segunda mitad de [[DEBT-046]]
—auditar el resto de policies `for update` del proyecto con el mismo criterio—
**queda abierta** y se anota como tal en el backlog (Fase 7).

**D13 — La sesión manual nace cerrada, y solo se puede crear una por fecha vía
UI.** `unique (academic_course_id) where is_open` permite una sola sesión abierta
por curso: crear una manual con `is_open = true` colisionaría con la clase en
curso (error `23505`) o dejaría al curso con una sesión "abierta" fantasma que
`get_student_session_status` podría ofrecer a los estudiantes. Se inserta siempre
`is_open = false`, con `attendance_code = null` y `code_expires_at = null` (D7).

El esquema **no** impide dos sesiones el mismo día —hay cursos con dos bloques
diarios, y `20260716000000` solo crea un índice **no único** sobre
`(academic_course_id, session_date)`—, así que no se añade restricción. En su
lugar, el formulario **avisa** ("ya existe una sesión registrada el 12 de agosto")
y pide confirmación, sin bloquear. La fecha se valida con Zod: formato `YYYY-MM-DD`
y **no futura**, tomando "hoy" en `America/Bogota` con el mismo criterio de
`getBogotaDateString()` que ya usa `openSession`.

**D14 — Se descarta la limpieza de `EnrollmentTable` que proponía el spec
antiguo.** Aquel documento incluía quitar la columna "Fecha matrícula" de
`components/admin/EnrollmentTable.tsx` (líneas 62 y 127, sigue ahí). No entra
aquí: no tiene relación con la planilla, el usuario no lo pidió en esta sesión, y
CLAUDE.md prohíbe modificar archivos fuera del alcance. Al backlog (Fase 7).

**D15 — Sin paginación ni ordenación.** ~32 columnas y ~30 filas caben en una
tabla con scroll. Añadirlas después es barato; añadirlas ahora es alcance que
nadie pidió.

## Fases de implementación

### Fase 1 — Migraciones de esquema y RLS ✅ Completada (2026-08-29)
- [x] `supabase/migrations/20260829000000_attendance_manual_sessions.sql`:
      `alter table class_sessions alter column attendance_code drop not null` e
      ídem para `code_expires_at`, con comentario de la semántica `NULL` (D7).
- [x] En la misma migración: `alter table attendance_records add column marked_by
      uuid references auth.users(id) on delete set null`, comentada como
      "NULL = marcado por el estudiante con el código" (D8).
- [x] `supabase/migrations/20260829000001_rls_attendance_teacher_marking.sql`:
      policy `attendance_records_insert_teacher_or_admin` con el `with check` de
      tres condiciones de D6, y **reescribir el comentario** del bloque
      "INTENCIONALMENTE: sin insert policy" para que refleje el estado nuevo.
- [x] En la misma migración: `alter policy class_sessions_mutate_owner_or_admin
      ... with check (<mismo predicado que using>)` — cierra [[DEBT-046]] (D12).
- [x] Sincronizar ambas migraciones a `mirp-lab` (`rsync`) y aplicar con
      `supabase db reset` allá; **no** tocar producción (CLAUDE.md → "Base de datos").
      Reaplicados los `GRANT`s estándar tras el reset (nota de mantenimiento del
      CLI en CLAUDE.md) y re-sembrado `dev@nodo.local` con `npm run seed:teacher`.
- [x] Verificado a mano contra la base local, con un escenario de dos docentes /
      un estudiante / dos cursos simulando JWTs (`set local role authenticated` +
      `request.jwt.claims` dentro de una transacción explícita, con `rollback`):
      un JWT de estudiante **no puede** autoinsertarse asistencia (rechazado); un
      docente **no dueño** de la sesión tampoco puede marcarla (rechazado); el
      docente **dueño** sí puede marcar manualmente a su estudiante activo, con
      `marked_by` poblado correctamente; y el docente dueño **no puede** reasignar
      la sesión al curso de otro docente (rechazado — DEBT-046 cerrado en
      `class_sessions`). Datos de la verificación limpiados al terminar.

### Fase 2 — Tipos y capa de lectura ✅ Completada (2026-08-29)
- [x] `lib/attendance/types.ts`: `attendance_code` y `code_expires_at` a
      `string | null`; `marked_by: string | null` en `AttendanceRecord`; tipos
      `AttendanceSheetSession`, `AttendanceSheetRow` y el discriminado
      `AttendanceSheetResult = {status:'ok'; …} | {status:'unavailable'}`.
- [x] Propagado el nullable a `lib/attendance/service.ts` (interfaz
      `SessionWithAttendance.code_expires_at`) y a
      `components/admin/AdminAttendancePanel.tsx` (`computeTimeRemaining` acepta
      `string | null` y trata `null` como "expirado" — inalcanzable en la
      práctica porque este panel solo opera sobre sesiones que
      openSession/extendSessionCode/rotateSessionCode acaban de escribir, y esas
      tres siempre generan código) (D7, Evaluación MCP punto 2).
- [x] `getAttendanceSheet(academicCourseId)` en `lib/attendance/index.ts`:
      sesiones del curso ascendentes por `session_date`; matrículas `active`;
      registros de esas sesiones; nombres vía `fetchStudentProfilesPublic()`
      (el docente **no** lee `profiles` por RLS).
- [x] Con `createServerSupabaseClient()` y verificando el `error` de **cada**
      consulta antes de confiar en `data` (D1, D3).
- [x] Cálculo del % por estudiante: `asistidas / total_sesiones`, redondeado a
      entero; `null` (se pinta "—") si el curso no tiene sesiones.
- [x] `npx tsc --noEmit` en verde tras los cambios.

### Fase 3 — Server Actions ✅ Completada (2026-08-29)
- [x] `lib/attendance/schemas.ts`: Zod para uuid de sesión/estudiante/curso y para
      la fecha (`YYYY-MM-DD`, no futura en `America/Bogota`) (D13). El cálculo de
      "hoy" en Bogotá se duplica ahí (no se importa de `index.ts`, que lleva
      `"use server"` y solo puede exportar funciones async).
- [x] `lib/attendance/actions.ts` con `"use server"`, `requireUser()` y retorno
      `AuthResult` en las cinco acciones (D4).
- [x] `markStudentAttendanceAction`: `insert` con `marked_by: user.id`; tratar
      `23505` como éxito idempotente (ya estaba marcado), no como error (D6, D8).
- [x] `unmarkStudentAttendanceAction`: `delete` por `(session_id, student_id)`.
- [x] `createManualSessionAction`: `insert` con `is_open:false`,
      `attendance_code:null`, `code_expires_at:null` (D7, D13).
- [x] `updateSessionDateAction` y `deleteSessionAction`: además de `is_open =
      false` en el `where`, usan `.select().single()` para distinguir "cero filas
      afectadas" (sesión en curso, ajena, o inexistente) de un fallo real — sin
      esto, un `update`/`delete` que RLS filtra en silencio devolvía `{ok: true}`
      sin haber cambiado nada.
- [x] Todas revalidan `/admin/courses/${academicCourseId}/asistencia`.
- [x] `npx tsc --noEmit` y `npx eslint` en verde sobre los archivos nuevos y
      modificados.

### Fase 4 — Pestaña y planilla en modo lectura ✅ Completada (2026-08-29)
- [x] Cuarta pestaña "Asistencia" en `CourseTabs.tsx`, mismo patrón `isActive` /
      `aria-current` que las tres existentes.
- [x] `.../asistencia/page.tsx` con `requireAnyRole(["teacher","admin"])` y
      `metadata.title`, igual que `grades/page.tsx`.
- [x] `AttendanceSheet.tsx`: matriz con columna de estudiante sticky a la
      izquierda, % sticky a la derecha, cabeceras `scope`, `<caption>` y el
      autoscroll al extremo derecho al montar (D10).
- [x] Insignia "En curso" en la columna de la sesión abierta, con el texto que
      indica que se cierra desde la lección (D5).
- [x] Tres estados vacíos **distintos entre sí y del fallo**: sin sesiones, sin
      estudiantes activos, y `status: 'unavailable'` (D3).
- [x] Tokens semánticos y tabla claro/oscuro de `DESIGN.md`; sin librería de
      componentes nueva — el proyecto no tiene `flowbite-react` instalado, así
      que "Flowbite primero" se sigue con markup Tailwind al estilo Flowbite
      (mismo criterio que `GradesTable`/`CourseLifecycleActions`).
- [x] `npm run lint` (0 errores) y `npm run build` en verde, incluida la ruta
      nueva `/admin/courses/[academicCourseId]/asistencia`.

### Fase 5 — Edición de celda ✅ Completada (2026-08-29, junto con la Fase 4)
> `AttendanceCell` y el guardado optimista se escribieron a la vez que la
> matriz de la Fase 4, al ser interdependientes; se documentan aquí por
> separado siguiendo el checklist del spec.
- [x] `AttendanceCell.tsx`: checkbox con `aria-label` de nombre + fecha completa,
      inversión optimista, `disabled` mientras viaja, **reversión** y borde rojo
      ante fallo, y `aria-live` con el resultado (D9, D10). El estado optimista y
      la reversión viven en `AttendanceSheet` (el padre), no en la celda: es quien
      necesita el valor actual para recalcular el % en vivo.
- [x] Blindaje de transporte: `isServerActionTransportError()` +
      `reportTransportError()`, re-lanzando si no lo es (D4, patrón de
      `GradeInputCell`), en `AttendanceSheet.handleToggle`.
- [x] Marca discreta de procedencia manual con `title`/`aria-label` (D8): punto
      azul sobre la casilla marcada a mano.
- [x] La celda de una sesión **en curso** también es editable (corregir en vivo es
      legítimo); lo que se bloquea de la sesión abierta es borrarla o moverle la
      fecha, no marcar (D5) — `AttendanceCell` no consulta `is_open`.

### Fase 6 — Gestión de sesiones ✅ Completada (2026-08-29, junto con la Fase 4)
- [x] `CreateManualSessionForm.tsx` con React Hook Form + Zod: selector de fecha,
      aviso no bloqueante si ya existe una sesión ese día (D13) — segundo clic
      ("Crear de todas formas") en vez de bloquear el envío.
- [x] `AttendanceSessionActions.tsx`: editar fecha y eliminar, deshabilitados en la
      sesión abierta con el motivo visible (D5) — mismo patrón de diálogo
      accesible (`role="dialog"`, Escape, foco inicial) que
      `CourseLifecycleActions`.
- [x] Modal de confirmación de borrado con el **conteo real** de registros
      que se pierden (calculado por el padre a partir de la planilla en pantalla)
      y botón destructivo no-primario (D11).
- [x] Tras crear, editar o borrar, la planilla refleja el cambio vía
      `router.refresh()` en el cliente + `revalidatePath()` en la Server Action.

### Fase 7 — Verificación y cierre (pendiente la ronda manual del usuario)
- [x] `npm run lint` y `npm run build` en verde.
- [x] Invocado `@reviewer` sobre el diff contra `development` (2026-08-29),
      **dos rondas**. 1ª ronda: **CAMBIOS REQUERIDOS**. Hallazgos resueltos en
      esta misma fase:
  - 🔴 **Truncamiento silencioso de `attendance_records`** (`max_rows = 1000`
    en `supabase/config.toml`): `getAttendanceSheet` no paginaba, así que un
    curso con suficientes sesiones/estudiantes podía perder registros sin
    error y pintar presentes como ausentes. Corregido con un bucle de
    `.range()` que pagina hasta recibir una página más corta que el tamaño
    pedido.
  - 🟠 **Conteo del modal de borrado excluía a estudiantes retirados**: el
    `on delete cascade` se lleva también sus registros, que D2 excluye de las
    filas pero no del conteo real. Se añadió `AttendanceSheetSession.attendee_count`
    (calculado sobre *todos* los registros de la sesión, sin restringir a
    matrícula activa) y `AttendanceSessionActions` ahora lo usa en vez de
    contar solo sobre las filas visibles.
  - 🟠 **Autoscroll se repetía en cada guardado**: la dependencia `[sheet]` del
    `useEffect` cambiaba de identidad en cada `revalidatePath`. Corregido a
    `[]` (una sola vez, al montar), como pide D10.
  - 🟠 **System prompt del MCP no reflejaba `code_expires_at: null`**: se añadió
    la nota de contrato en `docs/mcps/attendance-agent.system-prompt.md`.
  - 🟡 Menores corregidos: `.eq("academic_course_id", …)` explícito en
    `updateSessionDateAction`/`deleteSessionAction` (cierra el criterio 12 en
    servidor, no solo en UI); casts `as string` que mentían sobre el nullable
    en `service.ts`; `id` de diálogo con `useId()` en vez de fijo
    (`AttendanceSessionActions` se instancia una vez por columna); plural
    natural en el texto del modal de borrado; iconos SVG en vez de emoji;
    mensaje de fallo ahora también visible (no solo `sr-only`) vía un banner
    en `AttendanceSheet`; búsquedas `O(n²)`/`O(n³)` (`records.find`,
    `rows.find`) reemplazadas por `Map` — esta última introdujo y corrigió en
    el acto una violación de las Reglas de los Hooks (`useMemo` después de un
    `return` condicional).
  - 🔵 Aceptado como deuda documentada, no corregido: `unmarkStudentAttendanceAction`
    se deja sin `.select().single()` a propósito (razonado en un comentario:
    desmarcar dos veces es idempotente y legítimo, a diferencia de
    editar/eliminar una sesión); `markStudentAttendanceAction`/
    `unmarkStudentAttendanceAction` no validan `academicCourseId` contra el
    curso real de la sesión (a diferencia de editar/eliminar sesión) — razonado
    en un comentario: RLS ya exige que el docente sea dueño del curso *real* de
    la sesión y que el estudiante esté matriculado activo ahí, así que el peor
    caso es un desajuste de caché (`revalidatePath` a la ruta equivocada), no
    una escritura no autorizada.

  2ª ronda (tras las correcciones anteriores): **APROBADO** para pasar a
  pruebas manuales, con un 🟠 real que se corrigió antes de cerrar esta fase:
  - 🟠 **La paginación no tenía un orden total**: solo se ordenaba por
    `session_id` (no único por sí solo), lo que con `OFFSET` y una inserción
    concurrente (un estudiante marcando mientras el docente mira la planilla)
    podía saltarse una fila entre dos páginas — el mismo síntoma del hallazgo
    original. Corregido con un segundo `.order('student_id')`, que junto con
    `session_id` sí es la clave única de la tabla. También se corrigió el
    comentario, que afirmaba (incorrectamente) que la paginación no dependía
    de `max_rows` del servidor, y se bajó `PAGE_SIZE` de 1000 a 500 como
    margen de seguridad.
  - 🟡 Menores de la 2ª ronda, corregidos: `AttendanceSheetRow.attendancePct`
    era código muerto (la UI siempre recalcula el % para incorporar el estado
    optimista) — eliminado del tipo y de `getAttendanceSheet`; la nota del
    system prompt del MCP solo mencionaba `list_sessions`, ahora también cubre
    `get_session_attendance`; comentario `// DEBT:` añadido en
    `AttendanceSheet.tsx` apuntando a [[DEBT-075]] (antes solo estaba en el
    checklist de este spec, sin registrar en el backlog — CLAUDE.md lo exige).
- [ ] Ronda manual completa de `docs/testing/test-054-planilla-asistencia.md`
      contra el entorno de desarrollo (`mirp-lab`) — **pendiente, la ejecuta el
      usuario**; Claude prepara los datos y acompaña si se pide (ver CLAUDE.md
      → "Pruebas manuales asistidas por Claude").
- [x] Actualizado [[DEBT-046]] en `docs/specs/backlog.md`: cerrada la mitad de
      `class_sessions` (2026-08-29); **sigue abierta** la auditoría del resto
      de policies `for update` del proyecto (D12).
- [x] Registrado en `docs/specs/backlog.md`: [[DEBT-070]] (quitar "Fecha
      matrícula" de `EnrollmentTable.tsx`, D14), [[DEBT-071]] (% penaliza al
      estudiante matriculado tarde, D2), [[DEBT-072]] (exponer `marked_by` en
      `get_session_attendance` del MCP), [[DEBT-073]] (exportar la planilla a
      CSV), [[DEBT-074]] (marcado masivo por columna), [[DEBT-075]]
      (reconciliación de `overrides` locales en `AttendanceSheet` ante cambios
      de otra pestaña/sesión, con su `// DEBT:` en el código).
- [ ] Aplicar las migraciones a producción **solo** con confirmación explícita del
      usuario, en el despliegue (CLAUDE.md → "Despliegue").

## Criterios de aceptación

1. El panel del curso tiene una cuarta pestaña **"Asistencia"** que lleva a
   `/admin/courses/[academicCourseId]/asistencia`.
2. La planilla muestra una **fila por estudiante con matrícula activa** y una
   **columna por sesión**, en orden cronológico ascendente, con la más reciente
   visible al cargar.
3. Cada celda indica presente/ausente, y existe una columna de **% de asistencia**
   por estudiante, visible sin desplazamiento horizontal.
4. El docente puede **marcar** a un estudiante en una sesión y el cambio persiste
   tras recargar.
5. El docente puede **desmarcar** y el cambio persiste tras recargar.
6. Si una escritura de celda falla, la casilla **vuelve a su valor anterior** y se
   informa del fallo; nunca queda en pantalla un estado no guardado.
7. El docente puede **crear una sesión manual** indicando la fecha, sin código; la
   sesión aparece como columna nueva, está **cerrada** y **no es alcanzable con
   ningún código de asistencia** por parte de un estudiante.
8. El docente puede **editar la fecha** de una sesión y la columna se reordena.
9. El docente puede **eliminar** una sesión previa confirmación que declara el
   **número de registros de asistencia** que se perderán; tras confirmar,
   desaparecen la columna y esos registros.
10. La sesión **en curso** se distingue visiblemente y **no ofrece** editar fecha
    ni eliminar; la planilla **no ofrece** abrir, cerrar, extender ni rotar código.
11. Un docente **no** puede ver ni modificar la asistencia de un curso ajeno, ni
    entrando por URL directa con un `academicCourseId` ajeno.
12. Una sesión que pertenece a otro curso **no** es editable ni borrable desde la
    planilla de este curso.
13. Un curso sin sesiones, un curso sin estudiantes activos y un **fallo de
    lectura** se presentan de tres formas distintas; un fallo nunca se muestra
    como "nadie asistió".
14. Un estudiante **retirado** no aparece como fila, y sus registros previos **no
    se borran**.
15. La tabla es navegable con teclado y cada casilla anuncia **nombre del
    estudiante y fecha completa** a un lector de pantalla.
16. El marcado manual queda **distinguible** del marcado con código en el registro
    guardado (`marked_by`).

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-054-planilla-asistencia.md` — casos
  `TC-054-001` … `TC-054-016` y `TC-MCP-054-001`.
- **Automáticas (e2e/unit):** framework aún **por definir** (CLAUDE.md →
  "Testing"). Cuando exista, los casos de mayor valor son unitarios sobre
  `getAttendanceSheet`: el cruce sesiones × matrículas activas, el borde del
  estudiante retirado (D2) y el cálculo del %; más uno de integración que afirme
  que una sesión manual (`attendance_code IS NULL`) no es alcanzable por
  `mark_attendance_by_code`.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-29
