# spec-010 — [IN PROGRESS] Asistencia por sesión con código

> **Estado:** [IN PROGRESS] — Implementación iniciada.
> Al aprobarse e iniciar la Fase 1, este estado pasa a `[IN PROGRESS]`.
>
> **Rama:** `feat/asistencia-sesion`
> **Segundo de tres specs** que descomponen la "estructura interactiva de la
> lección" prometida en `spec-006-lecciones-privadas-navbar`. El primero,
> `spec-009-progreso-leccion`, está `[DONE]` y mergeado; creó el contenedor
> extensible `LessonClosure` justamente para que este spec le añada una sección
> sin reescribirlo. Le sigue `spec-011` (preguntas embebidas / autoevaluación)
> sobre el mismo contenedor.

---

## Contexto

La plataforma **Nodo** es herramienta de apoyo de una **clase síncrona**.
`spec-009` cerró el ciclo de autoseguimiento del estudiante (completar lección),
pero no registra la **asistencia real a la clase del día**. Este spec añade ese
eslabón:

- El **docente** abre, desde el panel de su curso, una **"sesión de asistencia"**
  con un **código efímero** (4–6 dígitos, ventana de expiración ~15 min). Ve en
  vivo cuántos estudiantes han marcado y puede cerrar la sesión manualmente.
- El **estudiante** ingresa ese código desde una **nueva sección "asistencia"**
  dentro del `LessonClosure` de cualquier lección que abra ese día. La asistencia
  se registra **al curso en esa fecha**, no a una lección concreta.

El modelo es **por fecha, independiente de la lección**: una `class_session`
pertenece al `academic_course` y tiene `session_date`. El estudiante puede marcar
desde cualquier lección del curso; la lección es solo el punto de entrada del
código.

---

## Alcance

### Incluye

- Tablas nuevas `class_sessions` y `attendance_records` con migración, índices y
  RLS por rol.
- RPC security definer `mark_attendance_by_code(p_code)` para que el estudiante
  valide el código y marque asistencia **sin leer** `class_sessions` completa
  (análogo a `find_course_by_enrollment_code`).
- RPC security definer `get_student_session_status(p_course_slug)` para exponer al
  estudiante el estado del día (¿hay sesión abierta?, ¿ya marqué?) sin ampliar el
  `select` general.
- Módulo `lib/attendance/` (`index.ts` + `types.ts`) con Server Actions:
  `openSession`, `closeSession`, `markAttendanceByCode`, `getOpenSessionForCourse`,
  `getSessionAttendanceCount`, `getStudentAttendanceForCourse`.
- Panel docente: abrir/cerrar sesión y conteo en vivo, en una nueva subruta del
  detalle de curso admin (`/admin/courses/[academicCourseId]/attendance`).
- Sección "asistencia" del estudiante dentro de `LessonClosure` (nuevo island
  `AttendanceSection`), visible **solo** para `reason === "enrolled"`.
- Paso del **estado inicial de asistencia del día** desde `[lessonSlug]/page.tsx`
  al contenedor.
- **MCP de lectura** de asistencia para un agente docente (Fase 4).

### No incluye

- Reportes agregados avanzados en la UI (histórico visual de asistencia por
  estudiante, gráficas de % de sesiones) → futuro. (El MCP sí expone un resumen
  agregado por API, pero no hay pantalla que lo muestre en este spec.)
- Exportación CSV del roster de asistencia → futuro.
- Gamificación, rachas, geolocalización.
- Corrección/edición manual de asistencia por el docente (marcar a un estudiante a
  mano, anular una marca) → futuro.
- Actualización del conteo en vivo por WebSocket/Realtime (se usa polling) → mejora
  futura.

---

## Dependencias

- **spec-002 `[DONE]`** — auth, `getCurrentUser`, `requireAnyRole`, `has_role`.
- **spec-003 `[DONE]`** — `academic_courses`, `enrollments` (`status='active'`),
  patrón RPC `find_course_by_enrollment_code`, `getAcademicCourseById`.
- **spec-005 `[DONE]`** — patrón MCP: `question-bank-mcp` cliente de `/api/questions/*`,
  `authenticateServiceRequest` (API key + service client), `lib/api/auth.ts`.
- **spec-006-lecciones-privadas-navbar `[DONE]`** — `hasCourseAccess` / `reason`
  (`enrolled`/`owner`/`admin`) que gobierna la visibilidad de la sección.
- **spec-009 `[DONE]`** — contenedor `LessonClosure` y su punto de montaje en
  `[lessonSlug]/page.tsx` (se extiende, no se reescribe).
- Infra reutilizada: `public.set_updated_at()`, `public.has_role()`, patrón de
  índices/triggers de `academic_courses`/`questions`.

---

## Impacto en el sistema

### Base de datos / RLS

Migraciones nuevas en `supabase/migrations/` siguiendo la nomenclatura del proyecto:

- **`20260716000000_init_attendance.sql`** — tablas:

  `public.class_sessions`
  | Columna | Tipo | Notas |
  |---|---|---|
  | `id` | `uuid` PK `default gen_random_uuid()` | |
  | `academic_course_id` | `uuid not null` → `academic_courses(id) on delete cascade` | |
  | `session_date` | `date not null` | fecha local del curso (America/Bogota, Decisión 8) |
  | `attendance_code` | `text not null` | 4–6 dígitos |
  | `code_expires_at` | `timestamptz not null` | ventana de validez |
  | `is_open` | `boolean not null default true` | |
  | `created_at` | `timestamptz not null default now()` | |
  | `updated_at` | `timestamptz not null default now()` | trigger `set_updated_at` |

  Índices/constraints:
  - `create unique index on class_sessions (academic_course_id) where is_open;`
    → **una sola sesión abierta por curso a la vez** (Decisión 7).
  - `create unique index on class_sessions (attendance_code) where is_open;`
    → **código único entre sesiones abiertas** (Decisión 1).
  - `create index on class_sessions (academic_course_id, session_date);`
  - `create trigger set_class_sessions_updated_at before update … execute function public.set_updated_at();`

  `public.attendance_records`
  | Columna | Tipo | Notas |
  |---|---|---|
  | `id` | `uuid` PK `default gen_random_uuid()` | |
  | `session_id` | `uuid not null` → `class_sessions(id) on delete cascade` | |
  | `student_id` | `uuid not null` → `auth.users(id) on delete cascade` | |
  | `marked_at` | `timestamptz not null default now()` | |
  | | | `constraint attendance_records_unique unique (session_id, student_id)` → idempotencia (Decisión 5) |

  - `create index on attendance_records (session_id);`

- **`20260716000001_rls_attendance.sql`** — RLS (`enable row level security` en ambas):

  `class_sessions`:
  - `select`: docente dueño del curso
    (`exists (select 1 from academic_courses ac where ac.id = academic_course_id and ac.teacher_id = auth.uid())`)
    **o** `has_role(auth.uid(),'admin')`. Los estudiantes **no** leen esta tabla
    directamente (usan RPC).
  - `insert` / `update` / `delete`: mismo predicado docente-dueño-o-admin (patrón
    de `grade_items`).

  `attendance_records`:
  - `select`: propio (`student_id = auth.uid()`) **o** docente dueño del curso de la
    sesión (join `class_sessions` → `academic_courses`) **o** admin.
  - **Sin política de `insert` para estudiantes**: toda inserción pasa por el RPC
    security definer (Decisión 4), lo que reduce la superficie de fraude. La
    ausencia de insert-policy es **intencional** y se documenta en la migración.
  - `delete`: docente dueño o admin (para corregir/anular; no en UI de este spec,
    pero coherente con RLS).

- **`20260716000002_attendance_rpcs.sql`** — RPCs security definer,
  `set search_path = public`, `grant execute … to authenticated`:

  - `mark_attendance_by_code(p_code text)` → `returns table (status text, session_id uuid, marked_at timestamptz)`. Lógica:
    1. Buscar sesión abierta con `attendance_code = p_code`.
    2. Si no existe → `status='not_found'`.
    3. Si `code_expires_at < now()` o `is_open=false` → `status='expired'` / `status='closed'`.
    4. Verificar matrícula **activa** del `auth.uid()` en `class_sessions.academic_course_id`
       (join `enrollments status='active'`); si no → `status='not_enrolled'`.
    5. `insert into attendance_records (session_id, auth.uid()) on conflict (session_id, student_id) do nothing`;
       devolver `status='marked'` o `status='already_marked'` con `marked_at`.

  - `get_student_session_status(p_course_slug text)` → `returns table (session_open boolean, session_id uuid, already_marked boolean, marked_at timestamptz)`.
    Resuelve `academic_courses` por `course_slug` (maneja `course_slug` nulo →
    estado vacío), verifica matrícula activa del caller, localiza sesión abierta y
    no expirada del curso, comprueba `attendance_records` propio.

  > Ambas RPC replican el patrón de `find_course_by_enrollment_code`
  > (`20260709000000`): exponen datos puntuales al estudiante sin abrir el `select`
  > general de `class_sessions`/`academic_courses`.

### Módulos `lib/`

Nuevo directorio **`lib/attendance/`** (estilo de `lib/enrollments/` y `lib/progress/`):

- **`lib/attendance/types.ts`** — `ClassSession`, `AttendanceRecord`,
  `OpenSessionSummary { session; attendanceCount }`,
  `StudentAttendanceState { sessionOpen; alreadyMarked; markedAt }`, y unión
  discriminada `MarkAttendanceResult`
  (`'marked' | 'already_marked' | 'not_found' | 'expired' | 'closed' | 'not_enrolled'`).
- **`lib/attendance/index.ts`** (`"use server"`):
  - `openSession(academicCourseId)` — Server Action docente. Genera código
    (Decisión 1), calcula `code_expires_at` (Decisión 2), `insert` en
    `class_sessions` bajo RLS (teacher dueño). Traduce la violación del índice único
    `academic_course_id where is_open` → error "ya hay una sesión abierta"; y la del
    índice `attendance_code where is_open` → reintento con nuevo código.
    `revalidatePath` de la ruta admin de asistencia.
  - `closeSession(sessionId)` — `update is_open=false` bajo RLS. `revalidatePath`.
  - `getOpenSessionForCourse(academicCourseId)` — lectura docente de la sesión
    abierta (RLS dueño) + su `attendanceCount`. Devuelve `OpenSessionSummary | null`.
  - `getSessionAttendanceCount(sessionId)` — `count` de `attendance_records` bajo
    RLS docente.
  - `markAttendanceByCode(courseSlug, code)` — Server Action estudiante: valida input
    con **Zod** (4–6 dígitos), llama `supabase.rpc('mark_attendance_by_code', { p_code })`,
    mapea `status` → `MarkAttendanceResult`, `revalidatePath` de la lección.
    Plantilla exacta: `enrollByCode` en `lib/enrollments/index.ts`.
  - `getStudentAttendanceForCourse(courseSlug)` — llama
    `supabase.rpc('get_student_session_status', { p_course_slug })`; devuelve
    `StudentAttendanceState`.

### Rutas / Server Components

- **Panel docente** — nueva subruta
  `app/(admin)/admin/courses/[academicCourseId]/attendance/page.tsx` (Server
  Component, `requireAnyRole(["teacher","admin"])`), consistente con la subruta
  hermana `/grades`. Añadir una tercera **pestaña "Asistencia"** en la barra de tabs
  de `app/(admin)/admin/courses/[academicCourseId]/page.tsx` (junto a "Estudiantes"
  y "Calificaciones"). El Server Component obtiene `getAcademicCourseById` +
  `getOpenSessionForCourse` y monta `<AdminAttendancePanel>`.
- **Lección del estudiante** — `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`:
  tras el gate y junto a `getLessonProgress`, invocar
  `getStudentAttendanceForCourse(courseSlug)` y pasar el `StudentAttendanceState`
  como prop nueva a `<LessonClosure>` **solo** cuando `reason === "enrolled"` (mismo
  guard que hoy protege el montaje). No se crea otro punto de montaje.

### Componentes

- **Nuevo `components/courses/AttendanceSection.tsx`** (`"use client"`) — island que
  vive **dentro** de `LessonClosure`. Recibe `courseSlug` + `StudentAttendanceState`.
  Estados de UI: (a) sin sesión abierta → aviso pasivo "sin sesión de asistencia
  activa"; (b) sesión abierta y no marcada → input de código (React Hook Form + Zod,
  `useTransition`, llama `markAttendanceByCode`, muestra el `MarkAttendanceResult`);
  (c) ya marcada → confirmación con `marked_at`. Tras marcar, `router.refresh()`.
- **Editar `components/courses/LessonClosure.tsx`** — cambio **aditivo** de props
  (`attendance?: StudentAttendanceState`). Renderiza `<AttendanceSection>` como una
  sección más del contenedor, sin tocar la lógica de completar. Materializa el diseño
  "por secciones" fijado en spec-009 Decisión 4.
- **Nuevo `components/admin/AdminAttendancePanel.tsx`** (`"use client"`) — island
  docente. Recibe `academicCourseId` y la sesión abierta inicial. Botón "Abrir sesión
  de asistencia" (`openSession`) / muestra código grande + cuenta atrás de expiración;
  botón "Cerrar sesión" (`closeSession`); **conteo en vivo** de asistentes vía polling
  de `getSessionAttendanceCount` con `setInterval` (~5 s) + `useTransition`.
- Todas las piezas nuevas: **Flowbite primero**, **tokens semánticos de `DESIGN.md`**
  (`bg-brand`/`bg-brand-strong` para acciones, `text-success`/`bg-success/10` para
  asistencia confirmada, nunca paleta cruda), **JetBrains Mono**, modo claro/oscuro.

---

## Evaluación MCP

**¿Aplica MCP?** **Sí** — lectura de asistencia/roster por un agente docente.

Aplicando los criterios de `CLAUDE.md`:

- *¿Expone datos que un agente podría consultar?* Sí. `class_sessions` y
  `attendance_records` son el roster de asistencia por sesión/fecha; spec-009 ya lo
  dejó marcado como candidato ("queda para spec-010, cuando exista roster/asistencia
  — sí candidato a lectura por agente"). Un agente docente puede necesitar consultar
  quién asistió a una sesión o el histórico de un curso sin abrir el panel.
- *¿Permite acciones que un agente debería ejecutar?* **No.** Abrir/cerrar sesión y
  marcar asistencia son acciones **presenciales** (el docente proyecta el código, el
  estudiante lo ingresa en el aula). Un agente que las ejecutara remotamente abriría
  ventanas de fraude. Este spec expone **solo lectura** al MCP.
- *¿Existe un MCP relacionado que extender?* Existe `question-bank-mcp`, pero su
  dominio (banco de preguntas) es ajeno a asistencia/roster: comparten el **patrón de
  arquitectura** (cliente HTTP de `/api/*` con API key de servicio) pero no las
  entidades, permisos ni ciclo de vida. Mezclarlos forzaría un system prompt con dos
  dominios inconexos y nombres de herramientas ambiguos. **Se crea un MCP nuevo.**
- *¿Hay un agente en `docs/mcps/` que se beneficie?* No; se crea `attendance-agent`
  con su propio system prompt, siguiendo el patrón de `question-bank-agent` pero de
  **solo lectura**.

**Decisión:** crear **`attendance-mcp`** (nuevo servidor), no extender
`question-bank-mcp`.

- **MCP nuevo a crear:** `attendance-mcp` — cliente de solo lectura de una API HTTP
  nueva `/api/attendance/*`.
- **System prompt afectado:** `docs/mcps/attendance-agent.system-prompt.md` (nuevo).
- **Fase de MCP en este spec:** Fase 4 (antes de la fase de pruebas).

**Patrón de autenticación (corregido respecto al diseño inicial):** el proyecto
**no** usa un env de actor por docente. `authenticateServiceRequest` (`lib/api/auth.ts`)
valida una **API key compartida** (`x-api-key`) y las rutas usan el **service client**
(`lib/auth/service.ts`, bypass RLS), coherente con el modelo **docente-único** del MVP
(Fase 1 del proyecto). Las rutas `/api/attendance/*` seguirán ese patrón: se reutiliza
`QUESTION_BANK_API_KEY` **o** se crea `ATTENDANCE_API_KEY` (a decidir en implementación).
El scoping por-docente se pospone a la Fase 2 del proyecto (multi-docente con Payload).

**Límite de acceso explícito:** el MCP solo expone `list_sessions`,
`get_session_attendance`, `get_course_attendance_summary`. **No** existe
`open_session`, `close_session` ni `mark_attendance`. Ninguna herramienta expone el
`attendance_code` vigente (secreto operativo del aula); las rutas API lo excluyen del
`select` de respuesta (defensa en profundidad, no solo el mapeo del MCP).

---

## Decisiones de arquitectura

### Decisión 1 — Generación del código efímero (4–6 dígitos) y unicidad
Código numérico corto generado en `openSession`. La unicidad **entre sesiones
abiertas** la garantiza el **índice único parcial** `class_sessions (attendance_code) where is_open`
a nivel de BD, no la aplicación. `openSession` inserta con un código aleatorio y, ante
violación de ese índice, **reintenta** con uno nuevo. Los códigos de sesiones
**cerradas** pueden repetirse (índice parcial), lo que mantiene el espacio de códigos
pequeño y legible.

### Decisión 2 — Ventana de expiración y validación server-side
`code_expires_at = now() + intervalo` (~15 min) se fija al abrir. La expiración se
valida **siempre en el servidor**: el RPC `mark_attendance_by_code` rechaza
(`status='expired'`) si `code_expires_at < now()`, con independencia de lo que muestre
el cliente. El panel docente muestra una cuenta atrás **informativa**, no autoritativa.

### Decisión 3 — Anti-fraude básico (sin geolocalización)
Combinación de: código corto **efímero** + **expiración** server-side + **`is_open`**
(cierre manual) + **verificación de matrícula activa** dentro del RPC. Coherente con el
modelo síncrono (el código se dicta en clase) y con el "No incluye" (sin geoloc). No se
persigue prueba criptográfica de presencia; límite conocido y documentado.

### Decisión 4 — RPC security definer para el flujo del estudiante
El estudiante **no** tiene `select` sobre `class_sessions`/`academic_courses` (política
"select own or admin"). Igual que `find_course_by_enrollment_code`, se exponen **dos**
RPC security definer puntuales (`mark_attendance_by_code`, `get_student_session_status`)
que validan matrícula y devuelven solo lo necesario. **Ninguna inserción de asistencia
ocurre por RLS de tabla**: solo por el RPC validado.

### Decisión 5 — Idempotencia del registro
`attendance_records` lleva `unique (session_id, student_id)`. El RPC usa
`insert … on conflict do nothing` y distingue `status='marked'` vs
`status='already_marked'`. Marcar dos veces es inofensivo y la UI muestra la
confirmación existente.

### Decisión 6 — Visibilidad por `reason`
La sección de asistencia del estudiante se monta **solo** para `reason === "enrolled"`
(mismo criterio que el botón "Completar" de spec-009). **Owner/admin no marcan
asistencia**; el docente interactúa con la asistencia **solo** desde el panel admin.
Semántica limpia: solo estudiantes generan `attendance_records`.

### Decisión 7 — Una sola sesión abierta por curso a la vez
Índice único parcial `class_sessions (academic_course_id) where is_open`. `openSession`
traduce la violación en un error de dominio ("ya hay una sesión de asistencia abierta")
en lugar de crear una segunda. Cerrar una sesión libera el slot.

### Decisión 8 — Zona horaria de `session_date`
La asistencia se imputa al **día local del curso**: `America/Bogota` (UTC-5, sin horario
de verano — el curso es del ITM, Medellín). `session_date` se calcula server-side como
`(now() at time zone 'America/Bogota')::date` en el RPC/Server Action, no con
`current_date` a secas (que usa la zona del servidor). Se documenta en la migración para
evitar asistencias imputadas al "día equivocado".

### Decisión 9 — MCP de solo lectura, sin exponer el código
El agente docente lee sesiones y roster, nunca el `attendance_code` vigente ni acciones
de mutación. El nombre completo del estudiante **sí** se expone al agente (el docente ya
lo ve en su panel; el agente trabaja para él). Se reevaluará al pasar a multi-docente.

---

## Fases de implementación

### Fase 1 — Dominio + migración + RLS + RPC
- [ ] Crear `supabase/migrations/20260716000000_init_attendance.sql` (`class_sessions`,
      `attendance_records`, índices únicos parciales, trigger `set_updated_at`).
- [ ] Crear `supabase/migrations/20260716000001_rls_attendance.sql` (políticas por rol;
      sin insert-policy de estudiante — documentar la intención).
- [ ] Crear `supabase/migrations/20260716000002_attendance_rpcs.sql`
      (`mark_attendance_by_code`, `get_student_session_status`, zona horaria Decisión 8,
      `grant execute … to authenticated`).
- [ ] Aplicar migraciones en **local** y verificar (nunca en prod sin confirmación).
- [ ] Crear `lib/attendance/types.ts` y `lib/attendance/index.ts` con las 6 Server Actions.

**Verificación:** el estudiante matriculado marca vía RPC; un no-matriculado recibe
`not_enrolled`; código expirado → `expired`; segunda marca → `already_marked`.

### Fase 2 — Panel docente (abrir/cerrar sesión, conteo en vivo)
- [ ] Crear `components/admin/AdminAttendancePanel.tsx` (island: abrir/cerrar, código +
      expiración, polling del conteo).
- [ ] Crear `app/(admin)/admin/courses/[academicCourseId]/attendance/page.tsx` (Server
      Component, `requireAnyRole`, monta el panel con la sesión abierta inicial).
- [ ] Añadir la pestaña "Asistencia" en la barra de tabs de
      `app/(admin)/admin/courses/[academicCourseId]/page.tsx`.

**Verificación:** el docente abre una sesión (código visible), ve incrementarse el
conteo al marcar un estudiante, y puede cerrarla; no puede abrir dos a la vez.

### Fase 3 — Sección estudiante en `LessonClosure`
- [ ] Crear `components/courses/AttendanceSection.tsx` (input de código con RHF+Zod,
      estados abierta/marcada/sin-sesión).
- [ ] Editar `components/courses/LessonClosure.tsx` (prop aditiva `attendance`; render
      de la sección sin tocar el bloque de completar).
- [ ] Editar `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` (invocar
      `getStudentAttendanceForCourse`; pasar estado a `LessonClosure` solo si
      `reason === "enrolled"`).

**Verificación:** con sesión abierta, el estudiante ve el input, marca con el código
correcto y ve la confirmación con `marked_at`; con código erróneo/expirado ve el
mensaje adecuado; owner/admin no ven la sección.

### Fase 4 — MCP: crear `attendance-mcp` (solo lectura)
> Va antes de la fase de pruebas para que `@tester` valide también las herramientas.

- [ ] Crear las API routes HTTP de solo lectura (auth `authenticateServiceRequest` +
      service client, patrón `/api/questions/*`):
  - [ ] `GET /api/attendance/sessions` — listar sesiones de un curso
        (`app/api/attendance/sessions/route.ts`).
  - [ ] `GET /api/attendance/sessions/[sessionId]/records` — roster de una sesión
        (`app/api/attendance/sessions/[sessionId]/records/route.ts`).
  - [ ] `GET /api/attendance/courses/[courseId]/summary` — resumen por estudiante
        (`app/api/attendance/courses/[courseId]/summary/route.ts`).
  - [ ] Ninguna ruta devuelve `attendance_code` vigente (excluido del `select`).
  - [ ] Reutilizar `lib/attendance/` para las consultas (sin lógica duplicada en las
        route handlers).
- [ ] Crear el servidor `mcp-servers/attendance-mcp/` con la estructura de
      `mcp-servers/question-bank-mcp/` (`src/index.ts`, `src/api.ts`, `src/tools.ts`,
      `package.json`, `tsconfig.json`, `.env.example`) y las 3 herramientas
      (`list_sessions`, `get_session_attendance`, `get_course_attendance_summary`).
- [ ] Registrar `attendance-mcp` en `docs/mcps/README.md` (nueva fila) y en el
      inventario de `CLAUDE.md`.
- [ ] Crear `docs/mcps/attendance-agent.system-prompt.md` (estructura mínima de CLAUDE.md).
- [ ] Verificar manualmente las 3 herramientas (inputs válidos/ inválidos, sesión sin
      registros, curso ajeno → 403) antes de las pruebas.

### Fase 5 — Verificación final
- [ ] `npm run build` y `npm run lint` sin errores.
- [ ] Recorrer las pruebas manuales `docs/testing/test-010-asistencia-sesion.md`
      (incluye `TC-MCP-*`).
- [ ] `@tester` ejecuta las pruebas automáticas cuando exista framework.

---

## Herramientas del MCP `attendance-mcp` (Fase 4)

| Herramienta | Input | Output | Ruta API |
|---|---|---|---|
| `list_sessions` | `course_id` (uuid, req), `from_date`, `to_date`, `is_open`, `limit` (≤100), `offset` | `{ data: [{ id, session_date, is_open, code_expires_at, attendee_count, created_at }], meta }` — sin `attendance_code` | `GET /api/attendance/sessions?courseId=…` |
| `get_session_attendance` | `session_id` (uuid, req) | `{ data: { session: {…}, records: [{ student_id, student_name, marked_at }], attendee_count } }` | `GET /api/attendance/sessions/{id}/records` |
| `get_course_attendance_summary` | `course_id` (uuid, req), `from_date`, `to_date` | `{ data: { course_id, total_sessions, students: [{ student_id, student_name, sessions_attended, attendance_pct }] } }` | `GET /api/attendance/courses/{id}/summary` |

---

## Criterios de aceptación

- El **docente dueño** (o admin) puede **abrir una sesión de asistencia** desde
  `/admin/courses/[academicCourseId]/attendance`, obteniendo un código de 4–6 dígitos
  con expiración.
- El docente **no puede abrir dos sesiones simultáneas** para el mismo curso.
- El docente ve el **conteo de asistentes actualizarse** mientras la sesión está
  abierta y puede **cerrarla** manualmente.
- Un **estudiante matriculado activo** ve la **sección de asistencia** en el
  `LessonClosure` de cualquier lección del curso cuando hay sesión abierta, y al
  ingresar el código correcto queda **registrado** (`attendance_records`).
- Ingresar un código **inexistente, expirado o de sesión cerrada** produce un mensaje
  claro y **no** registra asistencia.
- Un usuario **no matriculado** (o retirado) **no puede** registrar asistencia
  (rechazado por el RPC, no solo por UI).
- **Marcar dos veces** el mismo código es **idempotente** (una sola fila; confirmación
  coherente).
- **Owner/admin** no ven la sección de marcado del estudiante; el estudiante no puede
  leer `class_sessions` directamente.
- El registro **persiste** tras cerrar y reabrir sesión del navegador.
- El **agente docente** (MCP) puede invocar `list_sessions` /
  `get_session_attendance` / `get_course_attendance_summary` y obtener el roster
  esperado, **sin** ver el `attendance_code` ni poder marcar/abrir/cerrar.
- `npm run build` y `npm run lint` pasan sin errores.

---

## Riesgos y mitigaciones

- **Suplantación de código (un estudiante lo comparte con un ausente).** Mitigación:
  código efímero + expiración corta + cierre manual + verificación de matrícula
  (Decisión 3). Límite conocido y aceptado para el MVP; geoloc fuera de scope.
- **Colisión de códigos entre cursos abiertos.** Mitigación: índice único parcial +
  reintento en `openSession` (Decisión 1).
- **Conteo "en vivo" por polling puede parpadear o cargar la BD.** Mitigación:
  intervalo prudente (~5 s), `useTransition`, solo mientras la sesión está abierta;
  Realtime como mejora futura.
- **RLS de `class_sessions` cierra el paso al estudiante.** Intencional: todo el flujo
  del estudiante va por RPC security definer (Decisión 4). El RPC **debe verificar**
  `enrollments status='active'` en cada llamada.
- **Zona horaria de `session_date`.** Mitigación: Decisión 8 (America/Bogota,
  server-side), documentada en la migración.
- **`course_slug` es nullable** en `academic_courses`: `get_student_session_status`
  maneja el caso de curso sin slug (devuelve estado vacío) sin romper.
- **MCP filtra el código de asistencia.** Mitigación: las rutas API excluyen
  `attendance_code` del `select`; el system prompt prohíbe revelarlo (Decisión 9).

---

## Continuidad hacia spec-011

`spec-011` (preguntas embebidas / autoevaluación de cierre) añadirá **otra sección** al
mismo `LessonClosure`, reutilizando el contrato "por secciones" que este spec consolida
(hoy: completar + asistencia; mañana: autoevaluación). Su decisión central sigue siendo
la **frontera con el track de evaluaciones** (`spec-005` banco / `spec-007`
assignment-solving): preguntas *formativas sin nota* vs. *calificables*. La sección de
asistencia y la de autoevaluación deben coexistir sin acoplarse; el `LessonClosure` no
debe asumir orden ni presencia fija de secciones.

---

## Pruebas asociadas

> Se crean junto con el spec (test-first).

- **Manuales:** `docs/testing/test-010-asistencia-sesion.md` — casos `TC-010-*` y
  `TC-MCP-010-*`.
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-010-asistencia-sesion.spec.ts`
  — un caso por criterio de aceptación, en rojo, cuando exista framework.
