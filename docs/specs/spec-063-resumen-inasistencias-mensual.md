# spec-063 — [DONE] Resumen mensual de inasistencias en horas

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

La institución exige que el docente registre en su página oficial las
**inasistencias de cada estudiante por mes y en horas**. Hoy el docente tiene
que reconstruir ese dato a mano desde la pestaña "Asistencia" del panel del
curso (spec-054), que muestra una matriz editable estudiantes × sesiones con el
**% de asistencia** por estudiante, pero:

1. **No muestra inasistencias**, solo presencias y un porcentaje.
2. **No agrupa por mes**: un semestre son ~32 columnas de fechas sueltas y el
   docente tiene que contar a ojo cuáles caen en septiembre.
3. **No habla en horas**: la plataforma no sabe cuánto dura una sesión, así que
   la conversión clases → horas también es manual.
4. **Penaliza al matriculado tarde** (spec-054 D2, [[DEBT-079]]): si se cuenta
   sobre la planilla, un estudiante que entró en la semana 4 aparece con fallas
   de clases a las que no podía asistir, y el docente tiene que acordarse de
   descontarlas.

Este spec añade una **vista alterna de solo lectura** dentro de la misma pestaña
—"Resumen mensual"— con una fila por estudiante, una columna por mes calendario
y una columna Total, donde cada celda dice **horas y clases faltadas**
(`4 h (2)`), lista para transcribir en el orden de la lista oficial.

### Lo que ya existe y no hay que construir

| Pieza | Estado |
|---|---|
| Lectura de sesiones × matrículas activas × registros, con RLS y paginada contra `max_rows` | `getAttendanceSheet()` en `lib/attendance/index.ts` (spec-054 D1, D2, D3) |
| Orden de filas por apellido y formato "Apellidos, Nombres" | `compareStudentsBySurname()` (ya aplicado dentro de `getAttendanceSheet`) y `formatStudentListName()` en `lib/students/names.ts` (spec-062) |
| Formato de fechas `date` sin desfase de zona horaria | `lib/attendance/date-format.ts` (módulo puro, sin `"use server"`) |
| "Hoy" en `America/Bogota` | `getBogotaDateString()` en `lib/attendance/index.ts` (privada) y su duplicado en `lib/attendance/schemas.ts` |
| Formulario de configuración del curso (crear y editar) | `components/admin/AcademicCourseForm.tsx` + `AcademicCourseSchema` (`lib/academic-courses/schemas.ts`) + `createCourseAction` / `updateCourseAction` (`lib/academic-courses/actions.ts`) |
| RLS de `academic_courses` (select/update para dueño o admin) | `supabase/migrations/20260625000004_rls_academic.sql` — **no necesita policy nueva** |

### Hechos verificados que condicionan el diseño

- La tabla de matrículas se llama **`enrollments`** (no `course_enrollments`):
  `enrolled_at timestamptz not null default now()`, `status in ('active',
  'withdrawn')`, `withdrawn_at timestamptz`, único `(student_id,
  academic_course_id)` (`20260625000001_init_enrollments.sql`).
- `class_sessions.session_date` es `date` (sin hora ni zona), escrita en el día
  local de Bogotá (`getBogotaDateString()`, spec-031 D8).
- **La rematrícula no reescribe `enrolled_at`.** Las dos rutas de reactivación
  de spec-056 —`reactivateEnrollment` en `lib/enrollments/index.ts:310` y
  `enrollServiceStudent` en `lib/students/service.ts:501`— hacen
  `update({ status: 'active', withdrawn_at: null })` sobre la fila existente.
  `enrolled_at` conserva la fecha de la **primera** matrícula y `withdrawn_at`
  se borra: **el intervalo en que estuvo retirado no queda registrado en
  ningún lado**.
- `getAcademicCourseById()` (`lib/academic-courses/index.ts:42`) colapsa un
  error de consulta en `null` —el mismo patrón que [[DEBT-040]]—, así que no
  sirve para leer el dato con señalización honesta (D4).
- `lib/attendance/index.ts` lleva `"use server"`: solo puede exportar funciones
  async. Una función pura de agregación **no puede vivir ahí** (mismo motivo por
  el que spec-054 Fase 3 duplicó "hoy en Bogotá" en `schemas.ts`).

## Alcance

### Incluye

1. **Columna nueva `hours_per_session`** en `academic_courses` (migración), con
   default y validación (D2).
2. **Campo "Horas por sesión"** en el formulario del curso, al crear y al
   editar (D3).
3. **Selector de vista** "Planilla" / "Resumen mensual" en la pestaña
   Asistencia, persistido en la URL (D1).
4. **Vista "Resumen mensual"** de solo lectura: filas = estudiantes con
   matrícula activa ordenados por apellido; columnas = meses calendario con
   sesiones contables + Total; celda = horas y clases faltadas (D8, D9).
5. **Exclusión de las sesiones anteriores a la matrícula** de cada estudiante
   en el resumen (D5).
6. **Filtro por mes**: ver una sola columna de mes (D10).
7. Función pura de agregación, testeable, y su lectura de servidor (D4).

### No incluye

- **Cambiar la planilla** (la matriz editable de spec-054): ni su layout, ni su
  edición, ni su **% de asistencia** (D6).
- **Exportar a CSV/PDF** ([[DEBT-081]] sigue abierta).
- **Editar asistencia desde el resumen.** Se corrige en la planilla.
- **Estado "justificado" / "excusado"**: la asistencia sigue siendo binaria
  (spec-054 "No incluye").
- **Horas distintas por sesión** (p. ej. una sesión de 2 h y otra de 3 h en el
  mismo curso): la duración es fija por curso (D2).
- **Historial de retiros y rematrículas** (D5).
- **Cambiar `get_course_attendance_summary` de `attendance-mcp`**: lo evalúa
  `@mcp-builder` (ver "Evaluación MCP").

## Impacto en el sistema

### Base de datos

| Archivo de migración | Nuevo/Modificado | Contenido |
|---|---|---|
| `supabase/migrations/20261024000000_academic_courses_hours_per_session.sql` | **Nuevo** | `alter table academic_courses add column hours_per_session numeric(4,2) not null default 2` + `check (hours_per_session > 0 and hours_per_session <= 12)` + `comment on column` (D2). Sin backfill: el default puebla las filas existentes |

Sin cambios de RLS: las policies `select own or admin` y `update own or admin`
de `academic_courses` ya cubren leer y editar la columna nueva. Sin cambios en
`enrollments`, `class_sessions` ni `attendance_records`.

### Aplicación

| Archivo | Nuevo/Modificado | Cambio |
|---|---|---|
| `lib/academic-courses/types.ts` | Modificado | `hours_per_session: number` en `AcademicCourse` y en `AcademicCourseInput` (llega como string desde PostgREST para `numeric`; ver D2) |
| `lib/academic-courses/schemas.ts` | Modificado | Campo `hours_per_session` en `AcademicCourseSchema`: número > 0, ≤ 12, máximo 2 decimales (D3) |
| `lib/academic-courses/actions.ts` | Modificado | `createCourseAction` / `updateCourseAction` persisten el campo; `updateCourseAction` revalida también `/admin/courses/${id}/asistencia` (D3) |
| `lib/academic-courses/index.ts` | Modificado | `createAcademicCourse` / `updateAcademicCourse` aceptan el campo (pasa por el spread existente); normalizar `numeric` → `number` al leer |
| `components/admin/AcademicCourseForm.tsx` | Modificado | Input numérico "Horas por sesión" con texto de ayuda sobre el recálculo retroactivo (D3) |
| `lib/attendance/types.ts` | Modificado | `AttendanceSheetRow.enrolled_on: string` (aditivo, la planilla lo ignora); tipos nuevos del resumen (D4) |
| `lib/attendance/index.ts` | Modificado | `getAttendanceSheet` pide `enrolled_at` y expone `enrolled_on` por fila; función nueva `getAttendanceMonthlySummary(academicCourseId)` (D4) |
| `lib/attendance/monthly-summary.ts` | **Nuevo** | Módulo **puro** (sin `"use server"` ni imports de servidor): `toBogotaDate()`, `buildMonthlyAbsenceSummary()`, `formatHours()` (D4, D5, D8) |
| `lib/attendance/date-format.ts` | Modificado | `formatMonthLong("2026-09")` → "septiembre de 2026" y `formatMonthShort` → "sep 2026" (D8) |
| `app/(admin)/admin/courses/[academicCourseId]/asistencia/page.tsx` | Modificado | Lee `searchParams` (`vista`, `mes`), decide qué lectura ejecutar y qué componente pintar (D1, D10) |
| `components/admin/AttendanceViewSwitcher.tsx` | **Nuevo** | Selector "Planilla" / "Resumen mensual" como enlaces (Server Component) (D1, D12) |
| `components/admin/AttendanceMonthlySummary.tsx` | **Nuevo** | Tabla del resumen, filtro de mes, cabecera con horas por sesión y aviso de sesión en curso (Server Component) (D8–D12) |
| `components/admin/AttendanceSheet.tsx` | **Sin cambios** | La planilla no se toca (D6) |

`AcademicCoursePublic` (vista del estudiante) hereda la columna nueva por
`Omit<AcademicCourse, "enrollment_code">`; es un dato inocuo y no se pinta en
ninguna vista del estudiante.

## Evaluación MCP

> Evaluada por `@mcp-builder` (2026-10-24).

**¿Aplica MCP?** Sí — una herramienta de **lectura**; ninguna de escritura.

- **MCP existente a modificar:** `attendance-mcp` — se agrega
  `get_monthly_absence_summary`. `get_course_attendance_summary` **no cambia**.
- **MCP nuevo a crear:** ninguno (dominio idéntico; se extiende, no se duplica).
- **System prompt afectado:** `docs/mcps/attendance-agent.system-prompt.md`
  (nueva herramienta y capacidad, nota de contrato sobre cuándo usar cada resumen).
- **Fase de MCP en este spec:** Fase 5.

**1. Por qué sí.** El resumen mensual expone un dato que el docente debe
transcribir a la página oficial de la institución; un agente docente puede
entregárselo ya agrupado por estudiante y mes, o verificarlo. Es consulta pura.

**2. Por qué NO escritura.** `hours_per_session` se edita únicamente desde la
configuración del curso (Server Action con RLS y la sesión del docente, D3). Una
herramienta `set_hours_per_session` por API key de servicio no distingue qué
docente ni qué curso, y cambiaría retroactivamente todas las horas reportadas
a la institución. Mismo criterio que spec-054.

**3. Por qué herramienta nueva y no parámetro de `get_course_attendance_summary`.**
Cambia la forma de la salida (estudiante × mes) y, sobre todo, la semántica:

| | `get_course_attendance_summary` (sin cambios) | `get_monthly_absence_summary` (nueva) |
|---|---|---|
| Implementación | TypeScript en `getServiceCourseAttendanceSummary` (`lib/attendance/service.ts`), no un RPC | Misma función pura que la UI (D4) |
| Población | Quien tenga registros de asistencia (incluye retirados; omite a quien tiene 0 asistencias) | Matrículas **activas** (incluye a quien tiene 0 asistencias) |
| Sesiones que cuentan | Todas las del curso | Cerradas y con `session_date >= enrolled_on` (hora Bogotá, D5, D7) |
| Unidad | % de asistencia | Inasistencias en horas y clases, por mes |

Incoherencia conocida y aceptada: el resumen existente omite estudiantes con
0 asistencias, incluye retirados con registros y no excluye sesiones previas a
la matrícula. No se corrige aquí (sería un cambio de contrato silencioso para
el agente, fuera de scope); se registra en `docs/specs/backlog.md` y se declara
en el system prompt para que el agente no mezcle ambas fuentes.

**4. Requisito de implementación (obligatorio).** El cálculo vive en **una
única función pura**, `buildMonthlyAbsenceSummary` de
`lib/attendance/monthly-summary.ts` (D4), usada por la lectura de la UI y por
`getServiceMonthlyAbsenceSummary`. El service solo cambia el cliente
(`service_role`, entrada protegida por API key como el resto de
`/api/attendance/*`) y obtiene los insumos (sesiones, matrículas activas con
`enrolled_at`, registros, `hours_per_session`). Dos cálculos distintos
acabarían dando cifras distintas sobre un dato que se declara ante la
institución.

### Herramienta propuesta

`get_monthly_absence_summary` (lectura)
- **Descripción:** inasistencias por estudiante y mes calendario, en horas y en
  clases, solo matrículas activas, sin contar sesiones previas a la matrícula
  ni la sesión en curso. Úsala para reportar a la institución; para % de
  asistencia usa `get_course_attendance_summary`.
- **Input:** `course_id` (UUID, requerido); `month` (`YYYY-MM`, opcional,
  restringe a un mes).
- **Output:**
  `{ course_id, hours_per_session: number, months: ["2026-08", ...],
  students: [{ student_id, student_name, first_name, last_name,
  by_month: { "2026-08": { absent_classes, absent_hours, sessions_counted } },
  total: { absent_classes, absent_hours } }] }`, ordenado por apellido. Un mes
  sin sesiones aplicables para el estudiante tiene `sessions_counted: 0` (el
  "—" de la UI, D5), no se confunde con `absent_classes: 0`.
- **Endpoint:** `GET /api/attendance/courses/{courseId}/monthly-absences?month=`
  con `authenticateServiceRequest`, el mismo patrón que `/summary`.
- **Errores:** `courseId` o `month` mal formados → `422 validation_error`;
  curso inexistente → `404`; 401/500 como el resto de la API.
- **Least privilege:** no expone `attendance_code`, correos ni datos fuera de
  asistencia.

## Decisiones de diseño

**D1 — La vista elegida se persiste en la URL: `?vista=resumen` (y `&mes=YYYY-MM`,
D10).** Ausente o con cualquier otro valor, se pinta la planilla. La página ya
es dinámica (lee cookies de sesión), así que leer `searchParams` no cambia su
modo de render.

Razones:
- **Recargar no pierde la vista.** El caso de uso es transcribir a otra
  pestaña del navegador durante varios minutos; volver y encontrar la planilla
  en lugar del resumen es exactamente el tropiezo que se quiere evitar.
- **Enlazable y con "Atrás" del navegador funcionando**, gratis.
- **Sin JavaScript de cliente.** El selector son dos `<Link>`; la página
  (Server Component) decide qué lectura ejecutar y solo ejecuta **una**: la
  planilla no paga la lectura del resumen ni viceversa.
- **La pestaña "Asistencia" de `CourseTabs` sigue activa** sin tocarla: el
  `pathname` no cambia.

> Descartado: estado de cliente (`useState`). Se pierde al recargar y obliga a
> traer los datos de las dos vistas aunque solo se mire una.
>
> Descartado: subruta `/asistencia/resumen`. Funciona, pero parte una pestaña
> en dos páginas con dos `page.tsx` que comparten encabezado y estados de
> error, y la decisión del usuario fue "una vista alterna dentro de la
> pestaña", no una pestaña nueva.
>
> Descartado: recordar la vista en `localStorage`. Duplica la fuente de verdad
> (URL vs. almacenamiento) y produce el parpadeo planilla → resumen al hidratar.

Valores en español porque son visibles en la barra de direcciones
(`vista=resumen`, `mes=2026-09`), consistente con las rutas del panel
(`/asistencia`, `/contenido`).

**D2 — `hours_per_session numeric(4,2) not null default 2`, con `check (> 0 and
<= 12)`.**

| Aspecto | Elección | Por qué |
|---|---|---|
| Tipo | `numeric(4,2)` | Admite medias horas y fracciones institucionales (1,5 h; 2,25 h) **sin error de coma flotante** en la base. `integer` excluiría bloques de 90 min; `real`/`double` guardaría 1,5 bien pero 1,1 no. |
| Nulabilidad | `not null` | Un curso sin horas haría que el resumen tuviera un cuarto estado ("sin configurar") en cada celda. Con default, el resumen siempre puede calcular. |
| Default | `2` | La duración más común de un bloque de clase en la institución, según el usuario. Puebla todos los cursos existentes en la propia migración (`add column ... default` rellena las filas), sin backfill aparte. |
| Rango | `> 0` y `<= 12` | `0` haría que toda inasistencia valiera 0 h (un error silencioso que se transcribiría a la página oficial); 12 es un techo de cordura, no de negocio (ninguna sesión dura medio día de reloj). |

> Descartado: **derivar la duración de `class_time_end - class_time_start`**,
> que `academic_courses` ya tiene. Es tentador porque evita un campo, pero (a)
> la institución puede contar **horas académicas** (p. ej. de 45 o 50 min) y no
> horas de reloj, y (b) la franja registrada puede incluir descansos. El
> usuario decidió un campo explícito; se descarta también usarla como
> **backfill** de los cursos existentes por la misma razón — se prefiere un 2
> visible y fácil de corregir a un 1,83 calculado que parezca exacto. **Validar
> con el usuario** (ver "Puntos a validar").

PostgREST devuelve `numeric` como **string** (`"2.00"`) para no perder
precisión. Se normaliza a `number` una sola vez, en la capa de lectura
(`lib/academic-courses/index.ts` y la lectura de D4), para que ningún
componente haga aritmética con strings.

**D3 — "Horas por sesión" se edita en el formulario del curso, al crear y al
editar; el cambio es retroactivo y el formulario lo dice.** Va en
`AcademicCourseForm` junto a "Hora de inicio" / "Hora de fin", que es donde el
docente ya piensa en la duración de la clase.

- **Input:** `type="number"`, `min="0.5"`, `max="12"`, `step="0.5"`,
  `inputMode="decimal"`, registrado con `valueAsNumber`. El `step` del
  navegador es solo una ayuda; la regla real es Zod en servidor.
- **Zod:** `z.number({ invalid_type_error: "Indica las horas por sesión" })
  .positive("Debe ser mayor que 0").max(12, "Máximo 12 horas")` más un `refine`
  de **máximo 2 decimales** (lo que cabe en `numeric(4,2)`; sin él, 1,333 se
  redondearía en silencio en la base). Se acepta cualquier valor con hasta dos
  decimales aunque no sea múltiplo de 0,5: el `step` no debe impedir registrar
  una hora académica fraccionaria que la institución use de verdad.
- **Retroactividad:** el resumen se calcula en cada request (D4), así que
  cambiar de 2 a 3 h recalcula **todos** los meses, incluidos los ya
  transcritos. Es lo correcto si el valor estaba mal; es peligroso si la
  duración cambió a mitad de semestre. El texto de ayuda del campo lo dice:
  *"Se usa para convertir las inasistencias a horas. Cambiarlo recalcula el
  resumen de todos los meses, incluidos los ya reportados."*
- `updateCourseAction` revalida además `/admin/courses/${id}/asistencia`.

> Descartado: editarlo desde la propia vista de resumen (un input en la
> cabecera). Convertiría una vista declarada de solo lectura en una superficie
> de configuración, con su estado de guardado y error. En su lugar, la
> cabecera del resumen **muestra** el valor en uso con un enlace a la
> configuración (D8).
>
> Descartado: congelar las horas por sesión (columna en `class_sessions`) para
> que el cambio no fuera retroactivo. Contradice la decisión "duración fija por
> curso" y añade un dato por sesión que nadie va a editar.

**D4 — El resumen se deriva en servidor de la misma lectura de la planilla, con
la sesión del docente; la agregación es una función pura en un módulo aparte.**

- **`getAttendanceMonthlySummary(academicCourseId)`** (nueva, en
  `lib/attendance/index.ts`) ejecuta en paralelo `getAttendanceSheet()` y una
  lectura de `academic_courses.hours_per_session` con
  `createServerSupabaseClient()`, comprobando el `error` (no reutiliza
  `getAcademicCourseById`, que lo colapsa en `null`). Si cualquiera de las dos
  falla, devuelve `{ status: 'unavailable' }`. Si el curso no existe o no es
  visible por RLS (curso ajeno), **también** `unavailable`. En la práctica ese
  caso no llega a pintarse: el layout del curso
  (`app/(admin)/admin/courses/[academicCourseId]/layout.tsx`) ya responde
  `notFound()` cuando `getAcademicCourseById` no devuelve el curso; la
  comprobación propia es defensa en profundidad para que la función no
  dependa del layout (spec-054 criterio 11).
- **Nunca `service_role`** (spec-054 D1): RLS sigue siendo quien autoriza.
- **`getAttendanceSheet` se extiende de forma aditiva**: pide `enrolled_at` en
  la consulta de `enrollments` que ya hace y expone por fila
  `enrolled_on: string` (`YYYY-MM-DD` en Bogotá, D5). La planilla lo ignora. Se
  hereda gratis la paginación contra `max_rows` y el orden total que costaron
  dos rondas de `@reviewer` en spec-054.
- **`buildMonthlyAbsenceSummary(sheet, hoursPerSession)`** vive en
  `lib/attendance/monthly-summary.ts`, **módulo puro** (sin `"use server"`, sin
  Supabase, sin `Date.now()`): recibe el resultado `ok` de la planilla y un
  número, y devuelve el resumen. Es el corazón testeable del spec (ver
  "Pruebas asociadas"). Tampoco depende de la hora actual: lo único temporal
  (la sesión en curso, D7) llega como dato (`is_open`).

> Descartado: **una lectura nueva independiente** (o un RPC SQL con `group by
> date_trunc('month', session_date)`). Duplicaría el cruce sesiones ×
> matrículas activas × registros, su paginación y su manejo de errores; dos
> implementaciones del mismo cruce acabarían divergiendo, y la planilla y el
> resumen de la **misma pestaña** mostrarían datos distintos ante el primer
> bug. El volumen (~32 sesiones × ~30 estudiantes) no justifica agregar en SQL.
>
> Descartado: agregar en el cliente a partir de la `sheet` de la planilla.
> Obligaría a cargar la matriz completa en el navegador para una vista de solo
> lectura y dejaría la lógica fuera del alcance de un test unitario de
> servidor.

Contrato del resultado (`lib/attendance/types.ts`):

| Tipo | Forma |
|---|---|
| `MonthlyAbsenceCell` | `{ kind: 'not_applicable' }` (el estudiante no estaba matriculado en ninguna sesión contable de ese periodo) \| `{ kind: 'counted'; absences: number; hours: number; applicable_sessions: number }` |
| `MonthlyAbsenceMonth` | `{ key: 'YYYY-MM'; session_count: number }` — solo meses con al menos una sesión contable |
| `MonthlyAbsenceRow` | `{ student_id; student_name; student_first_name; student_last_name; enrolled_on; months: Record<monthKey, MonthlyAbsenceCell>; total: MonthlyAbsenceCell }` |
| `MonthlyAbsenceSummaryResult` | `{ status: 'ok'; hours_per_session: number; months: MonthlyAbsenceMonth[]; rows: MonthlyAbsenceRow[]; open_session_date: string \| null }` \| `{ status: 'unavailable' }` |

`hours` = `absences × hours_per_session`, redondeado a 2 decimales **una vez**
(una sola multiplicación, nunca una suma de flotantes).

**D5 — Matrícula tardía: una sesión cuenta para un estudiante solo si
`session_date >= enrolled_on`, donde `enrolled_on` es la fecha de `enrolled_at`
en `America/Bogota`. Aplica solo al resumen.**

- **Conversión de zona horaria.** `enrolled_at` es `timestamptz`; comparar su
  parte de fecha en UTC con un `date` de Bogotá falla por un día para quien se
  matricula después de las 19:00 hora local (00:00 UTC del día siguiente).
  `toBogotaDate(iso)` usa `Intl.DateTimeFormat('en-CA', { timeZone:
  'America/Bogota' })`, el mismo criterio de `getBogotaDateString()`; vive en
  el módulo puro para poder testear el borde de las 19:00.
- **El mismo día cuenta (`>=`, no `>`).** El flujo real es "el estudiante se
  matricula con el código en la primera clase y marca asistencia ahí mismo";
  si se matricula ese día y no marca, faltó a esa clase. Coste aceptado: quien
  se matricula la noche de un día con clase por la mañana carga esa falla. Es
  raro, y la alternativa (`>`) perdonaría el caso común.
- **Rematrícula (spec-056).** `enrolled_at` conserva la primera matrícula y el
  intervalo de retiro no se guarda en ninguna parte (ver "Hechos
  verificados"). Consecuencia: las sesiones en las que estuvo retirado
  **cuentan como fallas** al reactivarlo. No se puede hacer mejor sin un
  historial de matrícula que no existe; es además lo que la planilla muestra
  (celdas ausentes). Se documenta en la cabecera del resumen solo si se
  vuelve un problema real; se registra en el backlog (Fase 6).
- **Registro presente en una sesión anterior a la matrícula** (posible si se
  editó la fecha de una sesión hacia atrás): la sesión no es aplicable, así que
  ni suma falla ni cambia nada. No hay "asistencia negativa".
- **Celda `not_applicable`**: si un estudiante no tiene **ninguna** sesión
  contable en un mes (se matriculó después), la celda es "—", distinta de
  "0 h" (D9). El Total es `not_applicable` solo si no tiene ninguna sesión
  contable en todo el curso.

**D6 — El % de la planilla no cambia en este spec; [[DEBT-079]] queda abierta y
se actualiza.** *Decisión explícita a validar por el usuario.*

| Opción | Veredicto |
|---|---|
| **Solo el resumen excluye sesiones previas a la matrícula; la planilla y su % quedan como están** | **Recomendada.** Respeta "Planilla (la matriz actual, sin cambios)". Es lo mínimo: un criterio nuevo en un módulo nuevo, sin tocar la superficie editable ni su ronda de pruebas ya aprobada (test-054). |
| Aplicar el mismo criterio al % de la planilla | Descartada aquí. Es coherente, pero abre preguntas de UI que nadie pidió: ¿cómo se pinta una celda "no aplica" en una matriz de casillas editables? ¿se puede marcar asistencia en ella? Además `get_course_attendance_summary` del MCP seguiría con el criterio viejo: arreglar dos de tres superficies no es más coherente que arreglar una. |

Para que la divergencia no confunda dentro de la misma pestaña:
- El resumen dice en su descripción visible: *"No se cuentan las clases
  anteriores a la fecha de matrícula de cada estudiante."*
- [[DEBT-079]] se actualiza (no se cierra): el criterio ya existe como
  función pura (`isSessionApplicable` / `toBogotaDate` de
  `monthly-summary.ts`), así que llevarlo a la planilla y al MCP queda como un
  cambio acotado para un spec futuro.

**D7 — La sesión en curso (`is_open = true`) no cuenta en el resumen, y se
avisa.** Mientras la clase transcurre, los estudiantes siguen marcando: contar
la sesión abierta mostraría como falla a quien está entrando por la puerta, y
el docente podría transcribir un número que cambia minutos después. Si hay
sesión abierta, la cabecera lo dice: *"La clase del 24 de octubre de 2026 está
en curso y no se cuenta hasta que se cierre."*

Coste aceptado: una sesión **olvidada abierta** durante días tampoco cuenta. El
aviso la hace visible —que es la señal para cerrarla desde la lección (spec-054
D5)—, en vez de sumarla en silencio.

> Descartado: contarla como el resto. Produce números que se mueven mientras
> se leen, justo en la superficie pensada para copiar a otro sistema.

**D8 — Mes = mes calendario de `session_date`, por texto; columnas = meses con
al menos una sesión contable, en orden ascendente.**

- La clave del mes es `session_date.slice(0, 7)` (`"2026-09"`), **sin pasar por
  `Date`**: `session_date` es un `date` sin zona y cualquier `new Date(...)`
  reabre el desfase que `date-format.ts` documenta. Las etiquetas se forman con
  `formatMonthLong` / `formatMonthShort` nuevas en `date-format.ts`,
  construyendo el `Date` con componentes explícitos como `parseDateOnly`.
- Un mes sin sesiones contables (vacaciones, o solo la sesión en curso) **no
  tiene columna**: una columna vacía invitaría a transcribir "0" donde no hubo
  clase.
- Cabecera de columna: "sep 2026" visible; `title` y `<span class="sr-only">`
  con "septiembre de 2026, 8 clases" (el `session_count` ayuda a verificar
  contra el registro oficial).
- **Cabecera del resumen**: "Horas por sesión: 2 h" con enlace "Cambiar" a
  `/admin/courses/[id]/edit` (D3), la frase de D6 y el aviso de D7 si aplica.
- Total = suma de fallas sobre **todas** las sesiones contables del curso; se
  calcula desde las sesiones, no sumando las celdas de mes.

**D9 — Celdas: `4 h (2)`; el 0 se atenúa; "—" significa "no aplica".**

| Caso | Visible | Estilo | Para lector de pantalla |
|---|---|---|---|
| Faltas > 0 | `4 h (2)` | `font-semibold text-gray-900 dark:text-white` | "4 horas, 2 clases faltadas" |
| Faltas = 0 | `0 h` | `text-gray-400 dark:text-gray-500` (texto deshabilitado de DESIGN.md) | "Sin inasistencias" |
| No aplica | `—` | `text-gray-400 dark:text-gray-500` | "No aplica: matriculado después de estas clases" |

- **La distinción no depende solo del color**: el 0 cambia de forma (sin
  paréntesis) y de peso, y el "—" es otro glifo (WCAG 1.4.1).
- **No se usa rojo** para las fallas: es un registro a transcribir, no una
  alarma; pintar de rojo a medio curso es un juicio que la vista no debe hacer.
- Horas con coma decimal de `es-CO` y sin ceros sobrantes: `formatHours(4.5)`
  → `"4,5 h"`, `formatHours(4)` → `"4 h"` (`Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 2 })`).
- El texto visible lleva `aria-hidden="true"` y el texto completo va en un
  `sr-only` hermano, para que el lector no lea "4 h paréntesis 2".

**D10 — Filtro por mes con enlaces (`?vista=resumen&mes=2026-09`); con un mes
elegido se ve solo esa columna, sin Total.**

- Encima de la tabla, un grupo de enlaces: "Todos los meses" + uno por mes con
  columna (un semestre son 4-5). Mismo mecanismo que D1: sin JavaScript,
  sobrevive a la recarga.
- **Con mes elegido, la tabla muestra Estudiante + ese mes, sin la columna
  Total.** El propósito declarado es transcribir un mes en el orden de la
  lista oficial; con el Total al lado, la columna equivocada está a un
  vistazo. Por defecto (sin `mes`) se ven todos los meses + Total.
- `mes` con formato inválido o de un mes sin columna → se ignora y se ven
  todos los meses, con "Todos los meses" marcado como activo. No es un error
  que merezca un estado propio: el enlace activo ya muestra qué se está viendo.

> Descartado: `<select>` con navegación en `onChange`. Necesita un Client
> Component y cambia de página al moverse con flechas por las opciones (mala
> práctica de accesibilidad). Con 4-5 meses, los enlaces se ven todos de una.

**D11 — Estados vacío y de error, distintos entre sí (spec-054 D3).**

| Situación | Qué se pinta |
|---|---|
| `status: 'unavailable'` (falla cualquiera de las dos lecturas de D4) | El mismo bloque rojo de la planilla: "No se pudo cargar el resumen". **Nunca** una tabla de ceros. |
| Sin estudiantes activos | "Este curso no tiene estudiantes con matrícula activa." |
| Con estudiantes pero sin sesiones contables (ninguna sesión, o solo la sesión en curso) | "Aún no hay clases cerradas para resumir." + el aviso de D7 si aplica |
| Con datos | La tabla |

Se comprueba en ese orden: el fallo nunca cae en un estado vacío.

**D12 — Accesibilidad y responsive.**

- **Selector de vista**: `<nav aria-label="Vista de asistencia">` con dos
  enlaces; el activo con `aria-current="page"` y estilo de botón primario/
  secundario de DESIGN.md. Mismo patrón para el filtro de mes
  (`aria-label="Filtrar por mes"`, `aria-current="true"` en el activo).
  Objetivos táctiles de al menos 24×24 px (WCAG 2.5.8).
- **Tabla**: `<caption>` ("Inasistencias por mes en horas y número de clases
  — Horas por sesión: 2 h"), `<th scope="col">` por mes y Total, `<th
  scope="row">` por estudiante con `formatStudentListName()`.
- **Foco visible** en todos los enlaces (`focus:ring-4 focus:ring-gray-200
  dark:focus:ring-gray-700`).
- **Responsive**: `overflow-x-auto` con la columna Estudiante `sticky left-0`
  (fondo opaco claro/oscuro, como la planilla). Con 4-5 meses suele caber sin
  scroll; en móvil el scroll horizontal mantiene el nombre a la vista. El
  grupo de enlaces de mes hace `flex-wrap`.
- Tokens y tabla claro/oscuro de DESIGN.md; markup Tailwind al estilo
  Flowbite (el proyecto no tiene `flowbite-react`, mismo criterio que
  spec-054 Fase 4).

**D13 — Solo lectura, sin `"use client"`.** `AttendanceViewSwitcher` y
`AttendanceMonthlySummary` son Server Components: no hay estado, ni
escrituras, ni efectos. Ningún Server Action nuevo en `lib/attendance/`; la
única escritura nueva del spec es el campo del formulario del curso (D3), que
pasa por las acciones existentes.

## Fases de implementación

### Fase 1 — Migración
- [x] `supabase/migrations/20261024000000_academic_courses_hours_per_session.sql`:
      columna `hours_per_session numeric(4,2) not null default 2`, constraint
      `academic_courses_hours_per_session_range check (hours_per_session > 0
      and hours_per_session <= 12)` y `comment on column` (D2).
- [x] Aplicar a `nodo-dev` con `--db-url` (Session pooler), **mostrando antes
      la salida de `--dry-run` al usuario** (CLAUDE.md → "Acciones
      prohibidas"). Nunca `--linked`.
- [x] Verificar por REST que la columna existe y que los cursos sembrados
      quedaron en `2`.

### Fase 2 — Configuración del curso
- [x] `hours_per_session` en `AcademicCourse` / `AcademicCourseInput`;
      normalización `numeric` → `number` al leer (D2).
- [x] Campo en `AcademicCourseSchema` con el `refine` de 2 decimales (D3).
- [x] Input en `AcademicCourseForm` con `valueAsNumber`, valor por defecto `2`
      al crear y el valor del curso al editar, y el texto de ayuda de D3.
- [x] `createCourseAction` / `updateCourseAction` lo persisten;
      `updateCourseAction` revalida también `.../asistencia`.
- [x] `npx tsc --noEmit` en verde.

### Fase 3 — Agregación pura y lectura de servidor
- [x] `lib/attendance/monthly-summary.ts` (puro): `toBogotaDate`,
      `isSessionApplicable`, `buildMonthlyAbsenceSummary`, `formatHours` (D4,
      D5, D7, D8, D9).
- [x] `formatMonthLong` / `formatMonthShort` en `date-format.ts` (D8).
- [x] Tipos del resumen en `lib/attendance/types.ts` y `enrolled_on` en
      `AttendanceSheetRow`.
- [x] `getAttendanceSheet`: pedir `enrolled_at`, exponer `enrolled_on`, sin
      cambiar nada más.
- [x] `getAttendanceMonthlySummary` con `createServerSupabaseClient()` y
      comprobación de `error` de cada consulta (D4, D11).
- [x] `npx tsc --noEmit` en verde.

### Fase 4 — Vista y selector
- [x] `page.tsx` lee `searchParams` (`vista`, `mes`) y ejecuta solo la lectura
      de la vista activa (D1, D10).
- [x] `AttendanceViewSwitcher` (D1, D12).
- [x] `AttendanceMonthlySummary`: cabecera (horas por sesión + enlace, frase
      de D6, aviso de D7), filtro de mes, tabla, estados de D11 (D8–D12).
- [x] Verificar que la planilla (`?vista` ausente) es idéntica a la actual.
- [x] `npm run lint` y `npm run build` en verde.

### Fase 5 — MCP: actualizar `attendance-mcp`
> Después de las fases de servicio/UI (reutiliza su función pura) y antes de la verificación.
- [x] Servicio: `getServiceMonthlyAbsenceSummary(courseId, { month? })` en
      `lib/attendance/service.ts`, que delega en `buildMonthlyAbsenceSummary`.
- [x] API: `app/api/attendance/courses/[courseId]/monthly-absences/route.ts`
      (GET, `authenticateServiceRequest`, validación de `courseId` y `month`).
- [x] MCP: agregar `get_monthly_absence_summary` en
      `mcp-servers/attendance-mcp/src/tools.ts` (definición + `processToolCall`)
      y recompilar `dist/`.
- [x] Registrar la herramienta en `docs/mcps/README.md` y en el inventario de
      `CLAUDE.md` (fila de `attendance-mcp`, "spec-063").
- [x] Actualizar `docs/mcps/attendance-agent.system-prompt.md`: herramienta,
      capacidad, nota de contrato (diferencias con
      `get_course_attendance_summary`, no mezclar cifras) y restricción (no
      puede modificar `hours_per_session`).
- [x] Registrar en `docs/specs/backlog.md` la deuda del resumen existente
      (omite 0 asistencias, incluye retirados, no excluye sesiones previas a
      la matrícula).
- [x] Verificar contra `npm run dev` (puerto 3002) que la herramienta responde
      según contrato y coincide cifra a cifra con la vista de la UI.

### Fase 6 — Verificación y cierre
- [x] Invocar `@reviewer` sobre el diff contra `development`.
- [x] Ronda manual de `docs/testing/test-063-resumen-inasistencias-mensual.md`
      en `nodo-dev`.
- [x] Actualizar [[DEBT-079]] en `docs/specs/backlog.md` (D6) y registrar la
      deuda de historial de rematrícula (D5).
- [ ] Aplicar la migración a producción **solo** con confirmación explícita
      del usuario, en el despliegue (`--dry-run` primero).

## Criterios de aceptación

1. La pestaña Asistencia ofrece un selector **"Planilla" / "Resumen
   mensual"**; "Planilla" es la vista por defecto y es idéntica a la actual.
2. La vista elegida **se conserva al recargar** y al usar "Atrás"/"Adelante"
   del navegador.
3. El formulario del curso permite **ver y cambiar "Horas por sesión"** al
   crear y al editar; los cursos existentes muestran `2`.
4. El formulario **rechaza** 0, negativos, más de 12 y más de dos decimales,
   con un mensaje en el campo; acepta valores como `1.5`.
5. El resumen muestra **una fila por estudiante con matrícula activa**,
   ordenadas por apellido, con el nombre en formato "Apellidos, Nombres".
6. El resumen muestra **una columna por mes calendario con sesiones
   contables**, en orden ascendente, y una columna **Total**.
7. Cada celda muestra **horas y clases faltadas** (`4 h (2)`), con horas =
   clases faltadas × horas por sesión; cambiar las horas por sesión recalcula
   el resumen.
8. Una celda **sin inasistencias** se distingue visualmente de una con
   inasistencias, y de una que **no aplica**, sin depender solo del color.
9. Las sesiones con fecha **anterior a la matrícula** de un estudiante **no
   cuentan** como falla para él; una sesión del mismo día de la matrícula sí
   cuenta. La fecha de matrícula se toma en hora de Bogotá.
10. La **sesión en curso** no cuenta en el resumen y se avisa en pantalla.
11. El docente puede **filtrar un mes** y ver solo esa columna (sin Total);
    "Todos los meses" vuelve a la vista completa; un `mes` inválido en la URL
    muestra todos los meses.
12. Un estudiante **retirado** no aparece en el resumen.
13. Un **fallo de lectura**, un curso **sin estudiantes activos** y un curso
    **sin clases cerradas** se presentan de tres formas distintas; un fallo
    nunca se muestra como una tabla de ceros.
14. Un docente **no** puede ver el resumen de un curso ajeno, ni entrando por
    URL directa.
15. El resumen es **de solo lectura**: no ofrece marcar, desmarcar ni
    gestionar sesiones.
16. El selector, el filtro y la tabla son **operables con teclado** y un
    lector de pantalla anuncia, por celda, estudiante, mes, horas y clases.
17. El **% de la planilla no cambia** (D6).
18. (MCP) El agente puede invocar `get_monthly_absence_summary` y obtener, por
    estudiante activo y mes, las mismas horas y clases que muestra el
    resumen del panel; `get_course_attendance_summary` responde igual que
    antes del spec.

## Pruebas asociadas

> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que
> acompañan al spec").

- **Manuales:** `docs/testing/test-063-resumen-inasistencias-mensual.md` —
  casos `TC-063-001` … `TC-063-015` y `TC-MCP-063-001` … `TC-MCP-063-005`.
- **Automáticas (e2e/unit):** framework aún **por definir** (CLAUDE.md →
  "Testing"); el archivo `e2e-063-resumen-inasistencias-mensual.spec.ts` se
  creará cuando exista. Casos previstos, uno por criterio, con el grueso sobre
  la función pura:

  | Caso | Sobre | Criterio |
  |---|---|---|
  | Agrupa por `session_date.slice(0,7)`; meses ascendentes; sin columna para meses sin sesiones contables | `buildMonthlyAbsenceSummary` | 6 |
  | `absences` = sesiones contables sin registro; `hours = absences × hours_per_session`; `1.5 × 3 = 4.5` exacto | `buildMonthlyAbsenceSummary` | 7 |
  | Total calculado desde sesiones, igual a la suma de meses | `buildMonthlyAbsenceSummary` | 6, 7 |
  | Sesión con `session_date < enrolled_on` no cuenta; `=` sí cuenta; mes sin sesiones aplicables → `not_applicable` | `buildMonthlyAbsenceSummary`, `isSessionApplicable` | 8, 9 |
  | `enrolled_at = 2026-09-01T00:30:00Z` → `enrolled_on = 2026-08-31` (19:30 en Bogotá) | `toBogotaDate` | 9 |
  | Sesión `is_open` excluida de meses y Total; `open_session_date` poblado | `buildMonthlyAbsenceSummary` | 10 |
  | Orden de filas por apellido preservado | `buildMonthlyAbsenceSummary` | 5 |
  | `formatHours(4)` → `"4 h"`, `formatHours(4.5)` → `"4,5 h"`, `formatHours(0)` → `"0 h"` | `formatHours` | 7, 8 |
  | `formatMonthLong("2026-09")` → `"septiembre de 2026"` en cualquier zona horaria del runner | `date-format.ts` | 6 |
  | Zod: rechaza `0`, `-1`, `12.5`, `1.333`; acepta `0.5`, `1.5`, `12` | `AcademicCourseSchema` | 4 |
  | Fallo en la consulta de horas o en la planilla → `unavailable`; curso no visible → `unavailable` | `getAttendanceMonthlySummary` (integración) | 13, 14 |
  | Matrícula `withdrawn` no aparece | `getAttendanceSheet` + agregación (integración) | 12 |
  | `?vista=resumen` y `?mes=` inválido; selector con `aria-current` | e2e | 1, 2, 11, 16 |

## Puntos a validar por el usuario antes de aprobar

1. **D6** — que el % de la planilla **no** cambie en este spec (recomendado),
   aceptando que planilla y resumen usan criterios distintos para el
   matriculado tarde, con la frase explicativa en el resumen.
2. **D2** — default `2` sin backfill, en lugar de calcular la duración de los
   cursos existentes desde `class_time_end - class_time_start`.
3. **D5** — la sesión del **mismo día** de la matrícula cuenta (`>=`), y las
   sesiones del periodo en que un estudiante rematriculado estuvo retirado
   cuentan como fallas (no hay historial para hacerlo mejor).
4. **D7** — la sesión en curso no cuenta (ni una que se haya quedado abierta
   por olvido).
5. **D10** — con un mes filtrado se oculta la columna Total.

## Aprobación de implementación

> Claude no escribe código de implementación hasta que esta sección esté marcada.

- [x] Paquete (spec + pruebas) aprobado por el usuario ("Implementa el spec 63")
- **Fecha de aprobación:** 2026-10-24
