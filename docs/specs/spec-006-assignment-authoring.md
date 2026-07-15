# spec-006 — Creación de evaluaciones por el docente

> **Estado:** Planificado — pendiente de implementación. La implementación de referencia
> existe en el tag `backup/feat-question-bank` y se portará al implementar este spec.

---

## Contexto

La plataforma ya gestiona el ciclo académico básico (matrículas y calificaciones vía
spec-003) y, con spec-005, dispone de un **banco de preguntas** poblado por un agente a
través de una API HTTP + MCP (preguntas de tipo `multiple_choice`, `open_text`,
`code_snippet`, `code_write` y `coding_challenge`).

Este spec cubre el eslabón que convierte ese banco en evaluaciones concretas: el
**docente compone asignaciones** tomando un subconjunto de preguntas del banco y las
**publica para un curso académico**, con una ventana de tiempo, configuración de feedback
e intentos. Una **asignación** es la unidad que un estudiante resolverá (spec-007) y que
el docente revisará y calificará (spec-008).

El banco **no se edita** desde esta UI: el panel de banco del constructor de asignaciones
es de **solo lectura**; alimenta la selección de preguntas leyendo el banco a través de
`getQuestionsByTeacher()` (expuesto por spec-005). Toda creación/edición de preguntas
ocurre por la API + MCP de spec-005, nunca aquí.

---

## Alcance

### Incluye

- Schema de las dos tablas que pertenecen a esta feature: `assignments` y
  `assignment_questions`, con sus políticas RLS.
- Capa de dominio `lib/assignments/`: `types.ts`, `schemas.ts` (Zod), `index.ts`
  (lectura/escritura basada en sesión) y `actions.ts` (Server Actions consumidas por la
  UI del docente).
- Rutas admin del ciclo de autoría de asignaciones:
  `app/admin/courses/[academicCourseId]/assignments/` (listado), `.../new` (constructor) y
  `.../[assignmentId]` (detalle/edición).
- Componentes de administración: `NewAssignmentForm` (constructor de dos paneles:
  izquierdo = banco filtrable de **solo lectura**; derecho = preguntas añadidas con
  `points` 0–5 y reordenamiento), `PublishAssignmentButton` y `AssignmentList`.
- Enlace "Asignaciones" desde las páginas del curso académico en el panel admin.
- Configuración de la asignación: `type` (`practice`/`quiz`/`exam`/`homework`), ventana
  `opens_at`/`closes_at`, `time_limit_minutes`, `shuffle_questions`/`shuffle_choices`,
  `show_feedback_on` (`submit`/`close`/`never`), `max_attempts`, y vínculo **opcional** a
  un `grade_item` (spec-003) para propagación futura de calificaciones.

### No incluye

- **Resolución de asignaciones por el estudiante** (player, auto-save, feedback,
  submissions, cálculo de `auto_score`): pertenece a **spec-007**.
- **Revisión y calificación manual** de respuestas abiertas por el docente: pertenece a
  **spec-008**.
- **Creación o edición de preguntas** del banco: se hace exclusivamente vía la API + MCP
  de **spec-005**. El banco aquí es de solo lectura.
- Redefinición del schema de `questions`, `question_choices`, `question_rubrics` o
  `coding_challenge_tests`: son propiedad de **spec-005**; aquí solo se **referencian**.
- Ejecución automatizada de código para `coding_challenge`: modelada en DB por spec-005,
  deshabilitada; fuera de alcance.
- Importación/exportación masiva de asignaciones, plantillas, o duplicado de asignaciones.
- Notificaciones a estudiantes al publicar una asignación.

---

## Dependencias

- **spec-005 (banco de preguntas)** — provee las tablas `questions` (+ tablas anidadas) y,
  crucialmente para este spec, el wrapper de sesión **`getQuestionsByTeacher()`** en
  `lib/questions/`, que alimenta el panel de banco de solo lectura del `NewAssignmentForm`.
  Los tipos `QuestionWithDetails` se importan desde `lib/questions/types`.
- **spec-003 (course-enrollment)** — provee las tablas `academic_courses` (dueño del
  curso vía `teacher_id`), `grade_items` (vínculo opcional) y `enrollments` (usadas por la
  RLS de `select` para dar visibilidad a estudiantes matriculados); el middleware de
  protección `/admin`, el helper `requireRole(role)` en `lib/auth/session.ts`, y la función
  `public.has_role(uid, role)` usada en las políticas RLS.

Consumidores aguas abajo (este spec habilita, no implementa):

- **spec-007 (resolución por el estudiante)** — consume `assignments`/`assignment_questions`
  y la función `getActiveAssignmentsByEnrollment()` de `lib/assignments/index.ts`.
- **spec-008 (revisión y calificación)** — revisa las submissions de las asignaciones
  creadas aquí.

> Cadena de dependencias: `spec-003` → `spec-005` → **`spec-006`** → `spec-007` → `spec-008`.

---

## Impacto en el sistema

### Base de datos

Dos tablas nuevas en Supabase Postgres, ambas con RLS habilitado.

| Tabla | Propósito |
|---|---|
| `assignments` | Asignación vinculada a un `academic_course` con ventana, feedback e intentos |
| `assignment_questions` | Unión ordenada asignación↔pregunta, con puntos (escala 0–5) |

Migración de referencia de las tablas: `supabase/migrations/20260625000006_init_assignments.sql`.

> **Nota de ubicación de RLS (verificado contra el backup):** las políticas RLS de
> `assignments` y `assignment_questions` **no** viven en la migración de creación de tablas,
> sino en `supabase/migrations/20260625000008_rls_questions.sql` (archivo combinado que
> agrupa la RLS de `questions` y de las tablas de asignaciones). Al portar, respetar ese
> orden: la migración `...006` crea las tablas; la `...008` habilita y define su RLS.

### Rutas (admin)

| Ruta | Propósito |
|---|---|
| `app/admin/courses/[academicCourseId]/assignments/page.tsx` | Listado de asignaciones del curso (`AssignmentList`) |
| `app/admin/courses/[academicCourseId]/assignments/new/page.tsx` | Constructor de asignación (`NewAssignmentForm`) |
| `app/admin/courses/[academicCourseId]/assignments/[assignmentId]/page.tsx` | Detalle/edición de una asignación + publicación |

### Módulos `lib/`

| Archivo | Propósito |
|---|---|
| `lib/assignments/types.ts` | `Assignment`, `AssignmentQuestion`, `AssignmentWithQuestions`, `AssignmentInput`, `AssignmentType`, `ShowFeedbackOn` |
| `lib/assignments/schemas.ts` | `AssignmentSchema`, `AssignmentQuestionInputSchema` (Zod) para validar el formulario |
| `lib/assignments/index.ts` | Funciones de sesión: `getAssignmentsByAcademicCourse`, `getAssignmentById`, `getActiveAssignmentsByEnrollment`, `createAssignment`, `updateAssignment`, `publishAssignment`, `linkToGradeItem` |
| `lib/assignments/actions.ts` | Server Actions: `createAssignmentAction`, `updateAssignmentAction`, `publishAssignmentAction`, `linkToGradeItemAction` |

> `getActiveAssignmentsByEnrollment()` se define en este spec (vive en `lib/assignments/`)
> pero su **consumidor** es spec-007. Se incluye aquí para mantener el dominio cohesionado.

### Componentes (`components/admin/`)

| Componente | Propósito |
|---|---|
| `NewAssignmentForm.tsx` | Constructor de dos paneles. Panel izquierdo: banco filtrable de **solo lectura** alimentado por `getQuestionsByTeacher()` (spec-005). Panel derecho: preguntas añadidas con `points` (0–5) y reordenamiento por `order_index`. Usa `AssignmentSchema` con React Hook Form + Zod |
| `PublishAssignmentButton.tsx` | Publica una asignación (`is_published = true`) |
| `AssignmentList.tsx` | Lista las asignaciones de un curso con su estado y acciones |

Enlace **"Asignaciones"** añadido a las páginas del curso académico en el panel admin.

### Infraestructura admin (evitar regresión)

Al añadir rutas bajo `app/admin/`, verificar que **no se reintroduzca** la colisión de
rutas admin / bug multi-rol que el proyecto ya resolvió (commit de referencia
`fix(auth): resolve admin route collision` en el backup). Las rutas de asignaciones viven
en **`app/admin/...`**, no en un route group `app/(admin)/...`. Respetar el middleware de
protección `/admin` y `requireRole` de spec-003 sin duplicar lógica de guard.

### Variables de entorno

Ninguna nueva. Este spec reutiliza la configuración de Supabase y auth ya existente.

---

## Schema de base de datos

> Referencia. Corresponde a `20260625000006_init_assignments.sql` (tablas) +
> `20260625000008_rls_questions.sql` (RLS). No redefine tablas de spec-005.

### Tabla `assignments`

Vincula un subconjunto de preguntas del banco a un curso académico, con ventana y feedback.

- `id uuid primary key default gen_random_uuid()`
- `academic_course_id uuid not null references academic_courses(id) on delete restrict`
- `grade_item_id uuid references grade_items(id) on delete set null` — vínculo opcional; permite propagar el `final_score` a `student_grades` (la propagación se ejecuta en specs 007/008).
- `title text not null`
- `description text` — instrucciones (Markdown).
- `type text not null check (type in ('practice','quiz','exam','homework'))`
- `opens_at timestamptz` — null = disponible desde la publicación.
- `closes_at timestamptz` — null = sin fecha límite.
- `time_limit_minutes smallint check (time_limit_minutes is null or time_limit_minutes > 0)` — null = sin límite.
- `shuffle_questions boolean not null default false`
- `shuffle_choices boolean not null default false`
- `show_feedback_on text not null default 'submit' check (show_feedback_on in ('submit','close','never'))`
- `max_attempts smallint not null default 1 check (max_attempts >= 1)`
- `is_published boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` — mantenida por el trigger `set_updated_at`.

Índice: `(academic_course_id, is_published)`.

### Tabla `assignment_questions`

Unión ordenada entre `assignments` y `questions`.

- `id uuid primary key default gen_random_uuid()`
- `assignment_id uuid not null references assignments(id) on delete cascade` — al borrar la asignación se borran sus vínculos.
- `question_id uuid not null references questions(id) on delete restrict` — **`restrict`** intencional: borrar una pregunta usada en una asignación destruiría historial; el borrado debe fallar (esto respalda el `409` que devuelve la API de spec-005 al intentar eliminar una pregunta en uso).
- `order_index smallint not null default 0`
- `points numeric(5,2) not null check (points > 0 and points <= 5)` — escala 0–5, exclusivo en 0.

Restricción: `unique (assignment_id, question_id)` — una pregunta no se repite dentro de una asignación.
Índice: `(assignment_id, order_index)`.

### Políticas RLS (resumen)

- **`assignments`**
  - `select`: el docente **dueño del curso** (`academic_courses.teacher_id = auth.uid()`) ve todas sus asignaciones; un **estudiante matriculado activo** ve solo las **publicadas** (`is_published = true`); `admin` ve todo.
  - `insert`/`update`/`delete`: solo el docente dueño del curso o `admin`.
- **`assignment_questions`**
  - `select`: **hereda** la visibilidad de la asignación padre (docente dueño, estudiante matriculado si la asignación está publicada, o admin).
  - `insert`/`update`/`delete`: solo el docente dueño del curso de la asignación padre, o `admin`.

> El aislamiento por curso (un docente no crea/edita asignaciones de cursos ajenos) se
> garantiza en la RLS vía `academic_courses.teacher_id`; la capa de dominio opera con el
> cliente de sesión, por lo que RLS es la línea de defensa efectiva (a diferencia del
> camino de servicio de spec-005, que bypasa RLS).

---

## Fases de implementación

### Fase 1 — Schema y RLS de asignaciones
- [ ] Portar `supabase/migrations/20260625000006_init_assignments.sql` (tablas `assignments` y `assignment_questions` con constraints, índices y trigger `set_updated_at`).
- [ ] Portar el bloque de RLS de asignaciones dentro de `20260625000008_rls_questions.sql` (o su equivalente al reorganizar migraciones), respetando que se aplica **después** de crear las tablas.
- [ ] `supabase db reset` local sin conflictos; verificar RLS habilitada en ambas tablas.

### Fase 2 — Capa de dominio `lib/assignments/`
- [ ] `types.ts`: `Assignment`, `AssignmentQuestion`, `AssignmentWithQuestions` (incluye `total_points`), `AssignmentInput`, más `AssignmentType` y `ShowFeedbackOn`.
- [ ] `schemas.ts`: `AssignmentSchema` y `AssignmentQuestionInputSchema` (Zod), con validación de `points` 0.01–5, `max_attempts ≥ 1`, `time_limit_minutes ≥ 1`, y `questions` no vacío.
- [ ] `index.ts`: `getAssignmentsByAcademicCourse`, `getAssignmentById`, `getActiveAssignmentsByEnrollment`, `createAssignment`, `updateAssignment`, `publishAssignment`, `linkToGradeItem` (todas con el cliente Supabase de sesión de `lib/auth/`).
- [ ] `actions.ts`: `createAssignmentAction`, `updateAssignmentAction`, `publishAssignmentAction`, `linkToGradeItemAction` (Server Actions que validan con `AssignmentSchema` y llaman al dominio).

### Fase 3 — UI de autoría (rutas y componentes admin)
- [ ] Rutas `app/admin/courses/[academicCourseId]/assignments/{,new,[assignmentId]}/page.tsx`, protegidas por el guard `/admin` + `requireRole` (sin reintroducir la colisión de rutas admin).
- [ ] `NewAssignmentForm`: panel izquierdo = banco filtrable de **solo lectura** alimentado por `getQuestionsByTeacher()` (spec-005); panel derecho = preguntas añadidas con `points` (0–5) y reordenamiento; formulario con React Hook Form + Zod (`AssignmentSchema`).
- [ ] `AssignmentList` en la ruta de listado y `PublishAssignmentButton` en el detalle.
- [ ] Enlace "Asignaciones" desde las páginas del curso académico.
- [ ] Tokens semánticos de `DESIGN.md`, modo claro/oscuro y tipografía JetBrains Mono; Flowbite primero, shadcn/ui como complemento.

### Fase 4 — Pruebas
- [ ] Generar y ejecutar los casos manuales de `docs/testing/test-006-assignment-authoring.md` (flujos con UI).
- [ ] `npm run lint` y `tsc --noEmit` sin errores nuevos.

---

## Criterios de aceptación

- El docente dueño de un curso puede **crear una asignación** para su curso, seleccionando
  preguntas del banco desde el panel de solo lectura del `NewAssignmentForm`.
- Puede asignar `points` (0–5) por pregunta y **reordenarlas**; una pregunta no puede
  repetirse dentro de la misma asignación.
- Puede configurar `type`, ventana (`opens_at`/`closes_at`), `time_limit_minutes`,
  `shuffle_questions`/`shuffle_choices`, `show_feedback_on`, `max_attempts` y, opcionalmente,
  vincular un `grade_item`.
- Puede **publicar** una asignación (`is_published = true`) con `PublishAssignmentButton`;
  las no publicadas no son visibles para los estudiantes.
- El listado (`AssignmentList`) muestra las asignaciones del curso con su estado.
- **Aislamiento:** un docente no puede crear, editar ni listar asignaciones de cursos que
  no le pertenecen (garantizado por RLS vía `academic_courses.teacher_id`).
- El panel de banco del constructor es de **solo lectura**: no crea ni edita preguntas; solo
  las lee vía `getQuestionsByTeacher()`.
- **Calidad:** lint y typecheck sin errores nuevos; modo claro/oscuro consistente con
  `DESIGN.md`; tipografía JetBrains Mono; sin valores crudos de paleta.

---

## Pruebas asociadas

- **Manuales (UI):** `docs/testing/test-006-assignment-authoring.md` — casos `TC-*` de los
  flujos de autoría: creación del borrador, selección de preguntas del banco (solo lectura),
  asignación/reordenamiento de puntos, configuración de ventana/feedback/intentos, vínculo a
  `grade_item`, publicación, listado y aislamiento por curso (un docente no ve/gestiona
  asignaciones ajenas). El archivo de test lo crea el orquestador.
- **Automáticas (e2e/unit) — fuera de ciclo:** se automatizan cuando el proyecto adopte un
  framework de testing (hoy "por definir" en `CLAUDE.md`); su ausencia no bloquea el `[DONE]`.
