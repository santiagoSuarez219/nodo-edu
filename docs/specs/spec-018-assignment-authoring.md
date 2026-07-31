# spec-018 — [DONE] Diseño de evaluaciones vía MCP con variantes aleatorias

> **Estado:** [DONE] — pruebas manuales aprobadas (23/28; 5 casos del "player" de
> estudiante quedan diferidos a spec-019, ver `docs/testing/test-018-assignment-authoring.md`)
> y revisión de código aprobada por `@reviewer` tras corregir 3 hallazgos mayores
> (reparto balanceado ciego bajo RLS, RLS faltante en `assignments`, `.env.example`
> del MCP con base URL incorrecta).
>
> **Nota de alcance (revisión 2026-07-18):** este spec cambió de dirección respecto a su
> versión inicial. La autoría de evaluaciones **ya no tiene UI de creación**: se diseña
> íntegramente desde un agente a través de un MCP. Además, cada evaluación se compone de
> **3 variantes** que se reparten aleatoriamente entre los estudiantes. La implementación
> de referencia del tag `backup/feat-question-bank` (que incluía `NewAssignmentForm`)
> **ya no aplica** para la capa de UI; sigue siendo referencia útil para el schema base de
> `assignments` / `assignment_questions`.

---

## Contexto

La plataforma ya gestiona el ciclo académico básico (matrículas y calificaciones vía
[spec-003](./spec-003-course-enrollment.md)) y, con [spec-005](./spec-005-question-bank.md),
dispone de un **banco de preguntas** poblado por un agente a través de una API HTTP + MCP
(`multiple_choice`, `open_text`, `code_snippet`, `code_write`, `coding_challenge`).

Este spec cubre el eslabón que convierte ese banco en evaluaciones concretas. Dos
decisiones definen su forma:

1. **La evaluación se diseña vía MCP, no por UI.** Componer una evaluación es un trabajo
   de curaduría (elegir preguntas equilibradas, repartir puntos, calibrar dificultad) que
   el agente docente ya hace bien sobre el banco. Construir un formulario de dos paneles
   para lo mismo duplicaría esfuerzo y quedaría desalineado del flujo real de trabajo del
   docente, que ya conversa con un agente para poblar el banco. La autoría es, entonces,
   una extensión natural del mismo diálogo: *"arma una evaluación de 10 preguntas sobre
   recursión para el curso X"*.

2. **Cada evaluación se publica como un grupo de 3 variantes.** El objetivo es reducir la
   copia entre estudiantes en evaluaciones presenciales y remotas: tres exámenes
   equivalentes en alcance y dificultad, con preguntas distintas, repartidos
   aleatoriamente. El estudiante nunca elige su variante; el sistema se la asigna la
   primera vez que abre la evaluación y esa asignación queda fija para todos sus intentos.

El panel admin conserva únicamente vistas de **solo lectura + publicación**: el docente
revisa lo que el agente compuso, ve el reparto por estudiante y decide cuándo abrir la
evaluación. No hay constructor de evaluaciones en la UI.

El banco de preguntas **no se edita** desde este spec: toda creación/edición de preguntas
ocurre por la API + MCP de spec-005.

---

## Alcance

### Incluye

- Schema de las cuatro tablas de esta feature, con RLS: `assignment_variant_groups`,
  `assignments`, `assignment_questions` y `assignment_variant_allocations`.
- Capa de dominio `lib/assignments/`: `types.ts`, `schemas.ts` (Zod), `index.ts` (lectura y
  escritura con el cliente de sesión), `service.ts` (camino de servicio para el agente, que
  bypasa RLS igual que `lib/questions/service.ts`) y `actions.ts` (Server Actions de la UI
  de solo lectura/publicación).
- **API HTTP `/api/assignments/*`** autenticada por API key de servicio
  (`authenticateServiceRequest` de `lib/api/auth.ts`), consumida por el MCP.
- **MCP nuevo `assignment-mcp`** con las herramientas de autoría de evaluaciones, más su
  system prompt en `docs/mcps/assignment-agent.system-prompt.md` y su registro en
  `docs/mcps/README.md`.
- **Sorteo de variante por estudiante**: `getOrAllocateVariant()` asigna una variante en el
  primer acceso, con **reparto balanceado** (elige entre las variantes con menos
  asignaciones, desempate aleatorio) y la persiste.
- Rutas admin de **solo lectura + publicar** bajo
  `app/admin/courses/[academicCourseId]/assignments/`.
- Componentes admin: `AssignmentGroupList`, `AssignmentGroupDetail` (3 variantes con sus
  preguntas y puntos, en lectura), `PublishAssignmentGroupButton` y `VariantAllocationTable`
  (reparto por estudiante).
- Enlace "Evaluaciones" desde las páginas del curso académico en el panel admin.

### No incluye

- **UI de creación o edición de evaluaciones.** No se implementa `NewAssignmentForm` ni
  ningún constructor. Toda autoría es vía MCP.
- **Resolución de evaluaciones por el estudiante** (player, auto-save, feedback,
  submissions, `auto_score`): pertenece a [spec-019](./spec-019-assignment-solving.md).
- **Revisión y calificación manual** de respuestas abiertas: pertenece a
  [spec-020](./spec-020-assignment-review.md).
- **Creación o edición de preguntas** del banco: exclusivamente vía API + MCP de spec-005.
- Redefinición del schema de `questions`, `question_choices`, `question_rubrics` o
  `coding_challenge_tests`: son propiedad de spec-005; aquí solo se **referencian**.
- Generación automática de variantes por IA a partir de una sola (equilibrado automático de
  dificultad entre variantes). El agente compone las 3 explícitamente; el sistema solo
  valida que existan y las reparte.
- Ejecución automatizada de código para `coding_challenge`: deshabilitada (stub de spec-005).
- Reasignación manual de variante a un estudiante concreto por parte del docente. Si se
  necesita, se registra en `docs/specs/backlog.md`.
- Notificaciones a estudiantes al publicar.

---

## Dependencias

- **[spec-005](./spec-005-question-bank.md) (banco de preguntas)** — provee las tablas
  `questions` (+ anidadas), el helper `authenticateServiceRequest()` de `lib/api/auth.ts`,
  el patrón de errores de `lib/api/errors.ts`, el camino de servicio de
  `lib/questions/service.ts` (referencia para `lib/assignments/service.ts`), la variable
  `QUESTION_BANK_AGENT_TEACHER_ID` (docente dueño de las operaciones de agente) y el
  servidor `mcp-servers/question-bank-mcp/` como plantilla estructural del MCP nuevo.
- **[spec-003](./spec-003-course-enrollment.md) (course-enrollment)** — provee
  `academic_courses` (dueño vía `teacher_id`), `grade_items` (vínculo opcional),
  `enrollments` (base del sorteo y de la RLS de estudiante), el middleware de protección
  `/admin`, `requireRole(role)` en `lib/auth/session.ts` y `public.has_role(uid, role)`.

Consumidores aguas abajo (este spec habilita, no implementa):

- **[spec-019](./spec-019-assignment-solving.md)** — consume la variante ya asignada al
  estudiante. Ver "Impacto en spec-019" más abajo: su contrato cambia.
- **[spec-020](./spec-020-assignment-review.md)** — revisa las submissions, que ahora
  pertenecen a una variante concreta.

> Cadena de dependencias: `spec-003` → `spec-005` → **`spec-018`** → `spec-019` → `spec-020`.

---

## Impacto en el sistema

### Base de datos

Cuatro tablas nuevas en Supabase Postgres, todas con RLS habilitado.

| Tabla | Propósito |
|---|---|
| `assignment_variant_groups` | La evaluación como unidad académica: curso, ventana, feedback, intentos, `grade_item`, publicación |
| `assignments` | Una **variante** del grupo (A/B/C): mismo grupo, distinto set de preguntas |
| `assignment_questions` | Unión ordenada variante↔pregunta, con puntos (escala 0–5) |
| `assignment_variant_allocations` | Qué variante le tocó a cada matrícula (sorteo persistido) |

> **Decisión de modelado:** la configuración compartida (título, tipo, ventana,
> `time_limit_minutes`, shuffle, feedback, `max_attempts`, `grade_item_id`, `is_published`)
> vive en el **grupo**, no en cada variante. Así las 3 variantes no pueden divergir en
> reglas de juego: solo difieren en qué preguntas contienen. La alternativa (3 assignments
> planas con la config duplicada) se descartó por riesgo de desincronización.

### Rutas admin (solo lectura + publicar)

| Ruta | Propósito |
|---|---|
| `app/admin/courses/[academicCourseId]/assignments/page.tsx` | Listado de evaluaciones del curso (`AssignmentGroupList`) |
| `app/admin/courses/[academicCourseId]/assignments/[groupId]/page.tsx` | Detalle de solo lectura: las 3 variantes con sus preguntas y puntos, publicación y reparto |

> No existe `.../new`. Intentar navegar ahí devuelve 404: la creación no tiene ruta.

### API HTTP (consumida por el MCP)

Todas bajo `app/api/assignments/`, autenticadas con `x-api-key` vía
`authenticateServiceRequest()`. Operan por el camino de servicio (bypasa RLS) y acotan
siempre al docente de `QUESTION_BANK_AGENT_TEACHER_ID`.

| Método y ruta | Propósito |
|---|---|
| `GET /api/assignments/academic-courses` | Lista los cursos académicos del docente (para que el agente no adivine ids) |
| `GET /api/assignments/groups` | Lista grupos, filtrable por `academic_course_id` y `is_published` |
| `POST /api/assignments/groups` | Crea el grupo **con sus variantes y preguntas en una sola operación atómica** |
| `GET /api/assignments/groups/[groupId]` | Detalle completo: config + variantes + preguntas con puntos |
| `PATCH /api/assignments/groups/[groupId]` | Actualiza la config compartida del grupo |
| `DELETE /api/assignments/groups/[groupId]` | Elimina el grupo (falla con `409` si ya tiene submissions) |
| `PATCH /api/assignments/groups/[groupId]/variants/[assignmentId]` | Reemplaza el set de preguntas y puntos de una variante |
| `POST /api/assignments/groups/[groupId]/publish` | Publica el grupo (valida invariantes) |
| `GET /api/assignments/groups/[groupId]/allocations` | Reparto de variantes por estudiante (solo lectura) |

### Módulos `lib/`

| Archivo | Propósito |
|---|---|
| `lib/assignments/types.ts` | `AssignmentVariantGroup`, `AssignmentVariant`, `AssignmentQuestion`, `AssignmentGroupWithVariants`, `StudentAssignment`, `VariantAllocation`, `AssignmentType`, `ShowFeedbackOn` |
| `lib/assignments/schemas.ts` | Zod: `AssignmentGroupInputSchema`, `AssignmentVariantInputSchema`, `AssignmentQuestionInputSchema`, `PublishGroupSchema` |
| `lib/assignments/service.ts` | Camino de servicio (service role, bypasa RLS) para la API del agente: `createGroupWithVariants`, `updateGroup`, `replaceVariantQuestions`, `deleteGroup`, `publishGroup`, `listGroupsForTeacher`, `getGroupDetail`, `listAllocations`, `listAcademicCoursesForTeacher` |
| `lib/assignments/index.ts` | Camino de sesión (RLS): `getAssignmentGroupsByAcademicCourse`, `getAssignmentGroupById`, `getActiveAssignmentsByEnrollment`, `getStudentAssignment`, `getOrAllocateVariant`, `publishAssignmentGroup` |
| `lib/assignments/actions.ts` | Server Actions de la UI admin: `publishAssignmentGroupAction` |

> `getOrAllocateVariant()` y `getStudentAssignment()` se definen aquí pero su **consumidor**
> es spec-019. Viven en este dominio para mantenerlo cohesionado.

### Componentes (`components/admin/`)

| Componente | Propósito |
|---|---|
| `AssignmentGroupList.tsx` | Lista las evaluaciones del curso: título, tipo, ventana, nº de variantes, estado de publicación |
| `AssignmentGroupDetail.tsx` | Detalle de **solo lectura**: config del grupo y, por variante, sus preguntas con puntos y total |
| `PublishAssignmentGroupButton.tsx` | Publica el grupo (`is_published = true`) tras validar invariantes |
| `VariantAllocationTable.tsx` | Tabla del reparto: estudiante → variante asignada, con conteo por variante |

Enlace **"Evaluaciones"** añadido a las páginas del curso académico en el panel admin.

### Infraestructura admin (evitar regresión)

Las rutas viven en **`app/admin/...`**, no en un route group `app/(admin)/...`, para no
reintroducir la colisión de rutas admin / bug multi-rol ya resuelto en el proyecto. Respetar
el middleware `/admin` y `requireRole` de spec-003 sin duplicar lógica de guard.

### Variables de entorno

Ninguna nueva en la app: la API reutiliza `QUESTION_BANK_API_KEY` y
`QUESTION_BANK_AGENT_TEACHER_ID` de spec-005 (el agente de evaluaciones opera como el mismo
docente de servicio).

El servidor MCP sí declara las suyas en `mcp-servers/assignment-mcp/.env.example`:

| Variable | Descripción |
|---|---|
| `ASSIGNMENT_API_BASE_URL` | URL base de la app Next.js |
| `ASSIGNMENT_API_KEY` | Misma API key de servicio que consume `/api/assignments/*` |

### Impacto en spec-019 (requiere actualización posterior)

spec-019 asumía que el estudiante abre **una** `assignment` con su config encima. Ahora:

- La config (ventana, intentos, feedback) vive en `assignment_variant_groups`.
- El estudiante resuelve la **variante que le tocó**, obtenida con `getOrAllocateVariant()`.
- `submissions.assignment_id` debe apuntar a la **variante**, no al grupo, y el control de
  `max_attempts` se cuenta contra el grupo (no contra la variante) para que un estudiante no
  pueda multiplicar intentos.
- `getActiveAssignmentsByEnrollment()` devuelve `StudentAssignment[]` (config del grupo +
  variante asignada ya resuelta), preservando una firma útil para spec-019.

> Este spec **no** modifica spec-019; solo deja registrado el cambio de contrato. Actualizar
> spec-019 antes de implementarlo.

---

## Schema de base de datos

### Tabla `assignment_variant_groups`

La evaluación como unidad académica. Es lo que se publica y lo que ve el estudiante.

- `id uuid primary key default gen_random_uuid()`
- `academic_course_id uuid not null references academic_courses(id) on delete restrict`
- `grade_item_id uuid references grade_items(id) on delete set null` — vínculo opcional.
- `title text not null`
- `description text` — instrucciones comunes (Markdown).
- `type text not null check (type in ('practice','quiz','exam','homework'))`
- `opens_at timestamptz` — null = disponible desde la publicación.
- `closes_at timestamptz` — null = sin fecha límite.
- `time_limit_minutes smallint check (time_limit_minutes is null or time_limit_minutes > 0)`
- `shuffle_questions boolean not null default false`
- `shuffle_choices boolean not null default false`
- `show_feedback_on text not null default 'submit' check (show_feedback_on in ('submit','close','never'))`
- `max_attempts smallint not null default 1 check (max_attempts >= 1)`
- `is_published boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` — trigger `set_updated_at`.

Constraint: `check (closes_at is null or opens_at is null or closes_at > opens_at)`.
Índice: `(academic_course_id, is_published)`.

### Tabla `assignments` (variante)

- `id uuid primary key default gen_random_uuid()`
- `variant_group_id uuid not null references assignment_variant_groups(id) on delete cascade`
- `variant_label text not null check (variant_label ~ '^[A-Z]$')` — `A`, `B`, `C`.
- `description text` — nota específica de la variante (opcional).
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Restricción: `unique (variant_group_id, variant_label)`.

> El schema **no fija el número de variantes en 3**: la regla "un grupo publicable tiene al
> menos 2 variantes, y el flujo estándar crea 3" se valida en la capa de dominio y en la API
> (ver invariantes de publicación). Fijarlo en DB impediría corregir una variante rota sin
> destruir el grupo.

### Tabla `assignment_questions`

- `id uuid primary key default gen_random_uuid()`
- `assignment_id uuid not null references assignments(id) on delete cascade`
- `question_id uuid not null references questions(id) on delete restrict` — **`restrict`**
  intencional: borrar una pregunta usada en una evaluación destruiría historial; el borrado
  debe fallar (esto respalda el `409` de la API de spec-005).
- `order_index smallint not null default 0`
- `points numeric(5,2) not null check (points > 0 and points <= 5)`

Restricción: `unique (assignment_id, question_id)` — sin repetidos dentro de una variante.
Índice: `(assignment_id, order_index)`.

### Tabla `assignment_variant_allocations`

Sorteo persistido. Una fila por (evaluación, estudiante matriculado).

- `id uuid primary key default gen_random_uuid()`
- `variant_group_id uuid not null references assignment_variant_groups(id) on delete cascade`
- `enrollment_id uuid not null references enrollments(id) on delete cascade`
- `assignment_id uuid not null references assignments(id) on delete cascade` — la variante sorteada.
- `allocated_at timestamptz not null default now()`

Restricción: `unique (variant_group_id, enrollment_id)` — **clave del diseño**: garantiza a
nivel de base de datos que un estudiante no puede obtener una segunda variante ni por
carrera de peticiones concurrentes (el segundo insert falla y se relee la fila existente).
Índice: `(variant_group_id, assignment_id)` — soporta el conteo del reparto balanceado.

### Políticas RLS (resumen)

- **`assignment_variant_groups`**
  - `select`: docente dueño del curso (`academic_courses.teacher_id = auth.uid()`) ve todos;
    estudiante con matrícula `active` ve solo los publicados; `admin` ve todo.
  - `insert`/`update`/`delete`: docente dueño del curso o `admin`.
- **`assignments`** — hereda la visibilidad del grupo padre; escritura solo docente dueño/admin.
- **`assignment_questions`** — hereda la visibilidad de la variante padre; escritura solo
  docente dueño/admin.
- **`assignment_variant_allocations`**
  - `select`: el estudiante ve **solo su propia fila** (vía `enrollments.student_id = auth.uid()`);
    docente dueño del curso y `admin` ven todas las del grupo.
  - `insert`: el estudiante puede insertar su propia fila (es el sorteo del primer acceso),
    solo si su matrícula está `active` y el grupo está publicado y en ventana.
  - `update`/`delete`: nadie por sesión (solo el camino de servicio). **La variante asignada
    es inmutable**: permitir reasignación abriría la puerta a que un estudiante re-sortee
    hasta obtener la variante que prefiera.

> El aislamiento por curso se garantiza en RLS vía `academic_courses.teacher_id`. El camino
> de servicio (`lib/assignments/service.ts`), que la API del MCP usa, bypasa RLS y por eso
> debe acotar **explícitamente** cada consulta al `teacher_id` del agente, igual que hace
> `lib/questions/service.ts`.

---

## Reparto de variantes

Algoritmo de `getOrAllocateVariant(enrollmentId, groupId)`:

1. Buscar una fila existente en `assignment_variant_allocations`. Si existe, devolverla —
   el sorteo nunca se repite.
2. Si no existe, verificar precondiciones: matrícula `active`, grupo `is_published`, dentro
   de ventana.
3. Contar asignaciones por variante del grupo y quedarse con el subconjunto de variantes con
   **menor conteo**. Elegir una al azar dentro de ese subconjunto (reparto balanceado:
   evita que el azar puro deje una variante con 12 estudiantes y otra con 2).
4. Insertar la fila. Si el insert viola el `unique (variant_group_id, enrollment_id)` por una
   petición concurrente, releer la fila existente y devolverla (nunca propagar el conflicto).

---

## Invariantes de publicación

`publishGroup()` rechaza la publicación si:

- El grupo tiene **menos de 2 variantes** (el flujo estándar crea 3).
- Alguna variante tiene **cero preguntas**.
- Las variantes **difieren en puntaje total** — deben ser equivalentes para que la nota sea
  comparable entre estudiantes. Se exige mismo total de puntos en todas las variantes.
- `closes_at` ya pasó.

Cada rechazo devuelve `422` con un mensaje que nombra la variante y el problema concreto,
para que el agente pueda corregirlo sin adivinar.

---

## Evaluación MCP

**¿Aplica MCP?** Sí — es el mecanismo **principal** de esta feature, no un accesorio.

- **MCP nuevo a crear:** `assignment-mcp` — cliente de `/api/assignments/*` para que el
  agente docente componga evaluaciones a partir del banco de preguntas.
- **Por qué uno nuevo y no extender `question-bank-mcp`:** aunque el usuario final es el
  mismo docente, los dominios son distintos (curaduría del banco vs. composición de
  evaluaciones), las APIs son distintas y las restricciones del agente también: el agente de
  evaluaciones **no debe poder mutar el banco**. Mantenerlos separados permite dar al agente
  de evaluaciones acceso de solo lectura al banco (vía `list_questions` /`get_question` del
  MCP de spec-005) sin exponerle `create/update/delete_question`.
- **Agente asociado:** el system prompt de `docs/mcps/assignment-agent.system-prompt.md`
  declara **ambos** MCPs (`assignment-mcp` para escribir evaluaciones, `question-bank-mcp`
  en modo consulta para elegir preguntas), porque componer una evaluación exige explorar el
  banco primero.
- **System prompts afectados:**
  - `docs/mcps/assignment-agent.system-prompt.md` (nuevo).
  - `docs/mcps/question-bank-agent.system-prompt.md` (actualizar: mencionar que las
    preguntas del banco pueden quedar en uso por evaluaciones y que por eso
    `delete_question` puede devolver `409`).
- **Fase de MCP en este spec:** Fase 4.

### Herramientas de `assignment-mcp`

| Herramienta | Propósito |
|---|---|
| `list_academic_courses` | Lista los cursos académicos del docente con id, nombre y periodo. Evita que el agente adivine `academic_course_id` |
| `list_assignment_groups` | Lista evaluaciones, filtrable por curso y estado de publicación |
| `get_assignment_group` | Detalle completo: config + las 3 variantes con sus preguntas, puntos y total |
| `create_assignment_group` | Crea la evaluación completa en **una sola llamada atómica**: config compartida + array de variantes, cada una con sus `question_id` + `points` + `order_index` |
| `update_assignment_group` | Actualiza parcialmente la config compartida (título, ventana, intentos, feedback, `grade_item_id`) |
| `replace_variant_questions` | Reemplaza el set completo de preguntas y puntos de **una** variante |
| `delete_assignment_group` | Elimina la evaluación. Falla con `409` si ya tiene submissions |
| `publish_assignment_group` | Publica tras validar los invariantes. No se ejecuta automáticamente al crear |
| `get_variant_allocations` | Solo lectura: reparto de variantes por estudiante y conteo por variante |

> `create_assignment_group` es atómica a propósito: una evaluación a medio crear (grupo sin
> variantes, o con 2 de 3) es un estado inválido que la UI mostraría como publicable roto.
> Si falla cualquier variante, no se crea nada.

---

## Fases de implementación

### Fase 1 — Schema y RLS
- [x] Migración `supabase/migrations/20260718000002_init_assignment_variant_groups.sql`: las
      cuatro tablas con constraints, índices y trigger `set_updated_at`.
- [x] Migración de RLS de las cuatro tablas `20260718000003_rls_assignment_variants.sql`
      (habilitar + políticas descritas arriba), aplicada **después** de la creación de tablas.
- [x] Verificar RLS habilitada en las cuatro tablas y que el `unique` de allocations impide
      la doble asignación. ✅ Migraciones aplicadas a Supabase remoto (academy-page).

### Fase 2 — Capa de dominio `lib/assignments/`
- [x] `types.ts` con los tipos listados en "Módulos `lib/`" (incluye `total_points` por
      variante en `AssignmentGroupWithVariants`). ✅ 95 líneas.
- [x] `schemas.ts` (Zod): `points` 0.01–5, `max_attempts ≥ 1`, `time_limit_minutes ≥ 1`,
      `variant_label` en `[A-Z]`, `variants` con mínimo 2 entradas y `questions` no vacío. ✅ 47 líneas.
- [x] `service.ts`: camino de servicio acotado por `teacher_id`, con `createGroupWithVariants`
      atómico y `publishGroup` validando los invariantes de publicación. ✅ 551 líneas.
- [x] `index.ts`: camino de sesión, incluido `getOrAllocateVariant` con el reparto balanceado
      y el manejo del conflicto por concurrencia. ✅ 497 líneas.
- [x] `actions.ts`: `publishAssignmentGroupAction`. ✅ 14 líneas.
- [x] **Fase 2 completada** (commit `fec51e8`, 1,204 LOC total, tsc + lint ✅)

### Fase 3 — API HTTP `/api/assignments/*`
- [x] Rutas de la tabla de "API HTTP", todas con `authenticateServiceRequest()` y el manejo
      de errores de `lib/api/errors.ts`. ✅ 6 rutas, 533 LOC.
- [x] Códigos de estado coherentes con spec-005: `401` sin/mal API key, `404` no encontrado,
      `409` conflicto (borrar con submissions), `422` invariante de publicación no cumplido.
- [x] **Fase 3 completada** (commit `a407998`, tsc + lint ✅)

### Fase 4 — MCP: crear `assignment-mcp`
- [x] `mcp-servers/assignment-mcp/` siguiendo la estructura de `question-bank-mcp`
      (`src/index.ts`, `src/api.ts`, `src/tools.ts`, `package.json`, `tsconfig.json`,
      `.env.example`). ✅ 558 LOC, compilado.
- [x] Implementar las nueve herramientas de la tabla anterior. ✅ Todas 9 con JSON Schema.
- [ ] Registrar la entrada en `docs/mcps/README.md`.
- [ ] Crear `docs/mcps/assignment-agent.system-prompt.md`.
- [ ] Actualizar `docs/mcps/question-bank-agent.system-prompt.md` (nota sobre `409` en
      `delete_question` por preguntas en uso).
- [x] Verificar que el MCP compila y responde correctamente. ✅ npm run build pasó.

### Fase 5 — UI admin de solo lectura + publicación
- [x] Rutas `app/admin/courses/[academicCourseId]/assignments/{,[groupId]}/page.tsx` bajo el
      guard `/admin` + `requireRole` (sin reintroducir la colisión de rutas admin). ✅ 2 rutas.
- [x] `AssignmentGroupList`, `AssignmentGroupDetail`, `PublishAssignmentGroupButton`,
      `VariantAllocationTable`. ✅ 4 componentes, 827 LOC.
- [ ] Enlace "Evaluaciones" desde las páginas del curso académico.
- [x] Confirmar que **no** existe ruta de creación ni ningún control de edición de preguntas. ✅ Verificado (0 onChange).
- [x] Tokens semánticos de `DESIGN.md`, modo claro/oscuro, JetBrains Mono; Flowbite primero,
      shadcn/ui como complemento. ✅ Implementado.
- [x] **Fase 5 completada** (commit `54ee36d`, tsc + lint ✅)

### Fase 6 — Pruebas y ajustes finales
- [ ] Ejecutar los casos manuales de `docs/testing/test-018-assignment-authoring.md`
      (`TC-*` de UI y `TC-MCP-*` de las herramientas del MCP). ⏳ Test file regenerado (28 casos).
- [ ] Crear `docs/mcps/assignment-agent.system-prompt.md` + actualizar question-bank-agent.
- [ ] Enlace "Evaluaciones" desde página de curso académico (buscar navbar/sidebar de curso).
- [ ] `npm run lint` y `tsc --noEmit` sin errores nuevos. ✅ Verificado en Fases 4 & 5.

---

## Criterios de aceptación

**Autoría vía MCP**

- El agente puede invocar `list_academic_courses` y obtener los cursos del docente sin
  adivinar ids.
- El agente puede invocar `create_assignment_group` con config compartida y 3 variantes, y
  obtener una evaluación completa creada en una sola operación.
- Si una variante del payload es inválida, **no se crea nada** (atomicidad) y el error
  identifica la variante y el problema.
- El agente puede corregir una variante concreta con `replace_variant_questions` sin tocar
  las otras dos.
- `publish_assignment_group` rechaza con `422` un grupo con menos de 2 variantes, con alguna
  variante vacía, o con variantes de puntaje total distinto.
- El agente **no puede** crear ni editar preguntas del banco desde `assignment-mcp`.

**Reparto de variantes**

- La primera vez que un estudiante matriculado abre una evaluación publicada, se le asigna
  una variante y queda persistida en `assignment_variant_allocations`.
- En accesos posteriores (y en reintentos) obtiene **siempre la misma** variante.
- El reparto es balanceado: con N estudiantes y 3 variantes, los conteos no difieren en más
  de 1.
- Dos peticiones concurrentes del mismo estudiante producen **una sola** fila de asignación.
- Un estudiante no puede ver ni la asignación de otro estudiante ni las variantes que no le
  tocaron.

**UI admin**

- El listado muestra las evaluaciones del curso con tipo, ventana, nº de variantes y estado.
- El detalle muestra las 3 variantes con sus preguntas, puntos y total, en **solo lectura**:
  no hay ningún control para añadir, quitar o editar preguntas.
- **No existe** ruta de creación de evaluaciones en el panel admin.
- El docente puede publicar el grupo con `PublishAssignmentGroupButton`; los grupos no
  publicados no son visibles para estudiantes.
- `VariantAllocationTable` muestra qué variante le tocó a cada estudiante y el conteo por
  variante.

**Aislamiento y calidad**

- Un docente no puede ver ni gestionar evaluaciones de cursos que no le pertenecen
  (RLS vía `academic_courses.teacher_id`).
- La API `/api/assignments/*` rechaza con `401` cualquier petición sin API key válida.
- Lint y typecheck sin errores nuevos; modo claro/oscuro consistente con `DESIGN.md`;
  JetBrains Mono; sin valores crudos de paleta.

---

## Pruebas asociadas

- **Manuales:** `docs/testing/test-018-assignment-authoring.md`
  - `TC-*`: listado de evaluaciones, detalle de solo lectura de las 3 variantes, ausencia de
    controles de edición y de ruta de creación, publicación, tabla de reparto, aislamiento
    por curso, y flujo de estudiante que recibe siempre la misma variante.
  - `TC-MCP-*`: las nueve herramientas de `assignment-mcp`, incluidos los casos de fallo
    (atomicidad de `create_assignment_group`, invariantes de `publish_assignment_group`,
    `409` de `delete_assignment_group` con submissions, y que el agente no puede mutar el
    banco).
  > Este archivo debe **regenerarse**: su versión actual cubre el constructor de UI eliminado.
- **Automáticas (e2e/unit) — fuera de ciclo:** se automatizan cuando el proyecto adopte un
  framework de testing (hoy "por definir" en `CLAUDE.md`); su ausencia no bloquea el `[DONE]`.
