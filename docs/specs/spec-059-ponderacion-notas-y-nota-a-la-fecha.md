# spec-059 — [NOT STARTED] Ponderación de notas, cortes institucionales y nota a la fecha
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

> **Estructura del spec.** **Parte A** (notas: ponderación, cortes, nota a la
> fecha, copia institucional) y **Parte B** (nombres y apellidos separados en
> el perfil, que hacen posible ordenar la vista "Por corte" por apellido).
> La Parte B es independiente de la A, se puede desplegar antes y se
> recomienda extraerla a un spec propio (ver "Nota de alcance").

## Contexto

Petición del usuario (literal):

> "cada nota tiene una ponderacion (0-1) de la nota final. Todas las notas de
> un curso pueden estar por debajo de 1 (en caso de momentos evaluativos que
> no se hayan creado) pero no pueden estar por encima de este valor. Luego la
> nota total de cada estudiante que aparece en la planilla de calificaciones y
> que tambien debe aparecer a los estudiantes es la nota a la fecha del curso.
> Esto debe responder a la pregunta 'En que nota llevo el curso' y me servira
> a mi como docente para subir la nota a la plataforma institucional primero
> como 3 notas del 0.2 y luego como dos notas de 0.2 como lo exige la
> plataforma institucional."

Respuestas posteriores del usuario (2026-10-20), incorporadas como decisiones:
modo de transición con promedio simple rotulado (D4), peso objetivo por corte
(D12), el estudiante ve la nota parcial de un corte incompleto (D11), botón
para crear de antemano el ítem de autoevaluaciones (D15), copia institucional
con 1 decimal y coma (D14) y orden por apellido con nombres y apellidos
separados en el perfil (Parte B, D16–D21).

Hoy la "nota total" de un estudiante es un **promedio simple** de todas sus
notas registradas: todos los ítems pesan lo mismo y los ítems sin nota se
ignoran. Eso no responde "¿en qué nota llevo el curso?" (un quiz de 5 minutos
pesa igual que un parcial) ni sirve para la plataforma institucional, que pide
notas agrupadas en cortes de 20 %, ordenadas por apellido.

Causa exacta en el código:

- El esquema no tiene noción de peso:
  `supabase/migrations/20260625000002_init_grade_items.sql` define
  `grade_items (id, academic_course_id, name, order_index, created_at)`, y
  `20260802000003_add_kind_to_grade_items.sql` solo agrega `kind`. No hay
  agrupación por corte.
- El cálculo del total está **copiado cuatro veces**, todas con promedio
  simple:
  - `lib/grades/index.ts:11` (`computeTotalGrade`) → `getGradesByEnrollment`
    (`:139`) y `getGradesByCourse` (`:185`).
  - `lib/grades/overview.ts:11` (copia deliberada de spec-056 D2) →
    `getStudentGradesOverview` (`:105`).
  - `lib/enrollments/index.ts:11` → `getEnrollmentsByStudent` (`:167`),
    `getEnrollmentById` (`:197`) y `getEnrollmentsByAcademicCourse` (`:229`).
  - `components/admin/GradesTable.tsx:14` (`computeTotal`, cliente) — recalcula
    el total en vivo cuando el docente edita una celda.
- Las tres funciones de `lib/enrollments/index.ts` calculan el total con el
  embed `student_grades(score)`: solo ven puntajes, nunca el ítem. Con pesos,
  ese embed no basta.
- La RLS `"grade_items: select"`
  (`supabase/migrations/20260625000004_rls_academic.sql:93-108`) exige
  `e.status = 'active'` para el estudiante: un retirado **no** puede leer
  `grade_items` y, por tanto, tampoco su peso. Es la razón documentada en
  spec-056 D4 (`lib/grades/types.ts:64-67`) de que la sección "Cursos
  retirados" solo muestre el total.
- El ítem de autoevaluaciones solo existe tras la primera autoevaluación
  respondida: lo crea de forma perezosa `apply_self_assessment_grade`
  (`supabase/migrations/20260802000004_self_assessment_grade_rpcs.sql`,
  bloque "Creación perezosa"). Hasta entonces no se puede ponderar.
- El perfil solo tiene `profiles.full_name`
  (`20260623000000_init_profiles_students_roles.sql:7`), un campo libre que
  escribe el propio estudiante al registrarse (`components/auth/SignUpForm.tsx:12`,
  `lib/auth/schemas.ts:11`) y que `handle_new_user`
  (`20260729000003_fix_handle_new_user_conflict_handling.sql`) copia de
  `raw_user_meta_data->>'full_name'`. No hay forma confiable de ordenar por
  apellido.

## Alcance

### Incluye — Parte A (notas)

- Peso por ítem (`grade_items.weight`, fracción de la nota final,
  `0 < w ≤ 1`, opcional) con la invariante **Σ pesos de ítems por curso ≤ 1**,
  aplicada en la server action **y** en la base.
- Cortes institucionales (`grade_groups`) con **peso objetivo declarado**
  (`target_weight`, p. ej. 0.20) e invariante **Σ pesos objetivo por curso
  ≤ 1** (validación doble). Aviso cuando la suma de los ítems de un corte no
  coincide con su objetivo.
- Dos cifras de nota a la fecha, 0–5 con 2 decimales: **Acumulado**
  (`Σ nota × peso` en lo calificado) y **Promedio en lo evaluado**
  (`Σ nota × peso / Σ pesos con nota`).
- Nota por corte (0–5) con marca "incompleto", visible también al
  estudiante.
- Un módulo puro de cálculo que reemplaza las cuatro copias actuales.
- Planilla docente: peso, corte y peso objetivo; resumen de ponderación;
  avisos; vista "Por corte" ordenada por apellido con "Copiar columna" en
  formato institucional (1 decimal, coma); columnas Acumulado y Promedio.
- Botón "Crear ítem de autoevaluaciones" (idempotente).
- Vistas del estudiante (`/cuenta/cursos`, `/cuenta/notas`,
  `/cuenta/cursos/[enrollmentId]`) con ambas cifras, peso por ítem y nota
  por corte.
- Nota a la fecha con pesos también para matrículas **retiradas** (RPC
  acotado).

### Incluye — Parte B (nombres y apellidos)

- `profiles.first_name`, `profiles.last_name` y `profiles.name_needs_review`;
  `full_name` se mantiene como columna **derivada** por trigger (D17).
- Migración de los perfiles existentes con una **propuesta automática** de
  separación desde `full_name`, marcada "por revisar" (D18).
- Registro con campos "Nombres" y "Apellidos" separados; `handle_new_user`
  los toma de los metadatos (D19).
- `/cuenta`: el estudiante edita nombres y apellidos por separado.
- Extensión de la edición inline de spec-057 (`StudentNameCell` en
  `EnrollmentTable`) a dos campos, con insignia "Revisar" y confirmación de
  la propuesta (D20).
- `students-mcp`: `create_student`, `update_student`, `list_students` y
  `get_student` aceptan/devuelven `first_name` / `last_name` (Fase MCP).

### No incluye

- **Pesos sugeridos o migración de pesos.** Los ítems existentes quedan con
  `weight = null`; el docente los pondera a mano (D2, D4).
- **"¿Cuánto necesito en lo que falta para pasar?"** — posible spec futuro.
- **Exportación a archivo (CSV/Excel)** o integración directa con la
  plataforma institucional: la "exportación" es "Copiar columna" (D14).
- **Herramienta MCP de lectura de notas por corte** (DEBT-096, candidato).
- Cambiar la escala 0–5 o las fórmulas de normalización de
  `propagate_submission_grade` y `apply_self_assessment_grade`.
- **Ordenar o mostrar "Apellidos, Nombres" en otras vistas** (lista de
  matriculados, asistencia, revisión de entregas, navbar): siguen mostrando
  `full_name` en su orden actual. Solo la planilla de notas ordena por
  apellido (ver P2).
- Sincronizar `auth.users.user_metadata` al editar nombres (mismo criterio
  que spec-057 D6), salvo en el alta.
- Editar nombres de estudiantes retirados (spec-057 D4 se mantiene).

## Nota de alcance — recomendación de separar la Parte B

La Parte B se recomienda como **spec propio (p. ej. spec-060)**, con estos
argumentos:

1. **Dominio distinto.** Toca identidad y alta de cuentas (registro,
   `handle_new_user`, perfil, `/cuenta`, `students-mcp`), no notas. Su único
   punto de contacto con la Parte A es el criterio de orden de la vista
   "Por corte".
2. **Riesgo distinto.** `handle_new_user` ya causó dos incidentes
   (`20260729000002` y `20260729000003`, spec-027): un error ahí rompe el
   registro de estudiantes. Conviene desplegarlo y probarlo aislado, no en
   el mismo paquete que una migración de notas.
3. **Despliegue independiente.** La Parte B puede salir antes (habilita el
   orden por apellido desde el día 1 de la Parte A) o después (la vista
   "Por corte" ordena provisionalmente por `full_name`, D21).
4. **Tamaño.** Con la Parte B, este spec toca ~35 archivos y 8 migraciones;
   separada, cada revisión de `@reviewer` es manejable.

Se redacta aquí, como fases separadas (B1–B4), por instrucción del usuario.
Si al aprobar se decide extraerla, basta con mover las secciones marcadas
"Parte B" y los casos `TC-059-2x` / `TC-MCP-059-xx` a `spec-060` /
`test-060`, renombrando las migraciones `…0005`–`…0007`.

## Impacto en el sistema

### Base de datos (Supabase)

| Objeto | Cambio | Migración propuesta | Parte |
|--------|--------|---------------------|-------|
| `public.grade_groups` | **Tabla nueva**: `id`, `academic_course_id`, `name`, `target_weight numeric(4,3) not null` (`0 < t ≤ 1`), `order_index`, `created_at`. Únicos `(academic_course_id, name)` y `(id, academic_course_id)`. Trigger `enforce_grade_groups_target_sum` (Σ ≤ 1). | `20261020000000_init_grade_groups.sql` | A |
| RLS `grade_groups` | Espejo de las cuatro políticas de `grade_items` (`20260625000004_rls_academic.sql:89-150`). | `20261020000001_rls_grade_groups.sql` | A |
| `grade_items.weight`, `grade_items.group_id` | `weight numeric(4,3) null` con `check`; `group_id uuid null` con FK compuesta `(group_id, academic_course_id) → grade_groups(id, academic_course_id) on delete set null (group_id)`. Trigger `enforce_grade_items_weight_sum`. | `20261020000002_add_weight_and_group_to_grade_items.sql` | A |
| RPC `get_own_enrollment_grade_lines(uuid[])` | `security definer`, `(enrollment_id, grade_item_id, weight, score)` de las matrículas del propio `auth.uid()` (D8). | `20261020000003_get_own_enrollment_grade_lines_rpc.sql` | A |
| RPC `ensure_self_assessment_grade_item(uuid)` | `security invoker`: devuelve el ítem `kind='self_assessment'` del curso, creándolo si no existe (D15). | `20261020000004_ensure_self_assessment_grade_item_rpc.sql` | A |
| `profiles.first_name`, `last_name`, `name_needs_review` | Columnas nuevas; función `propose_name_split(text)`; trigger `sync_profile_names` (deriva `full_name`); backfill de perfiles existentes; índice `(last_name, first_name)`. | `20261020000005_add_name_parts_to_profiles.sql` | B |
| `handle_new_user()` | `create or replace`: inserta `first_name`/`last_name` desde los metadatos; conserva `on conflict do nothing` por sentencia. | `20261020000006_handle_new_user_name_parts.sql` | B |
| RPC `get_student_profiles_public(uuid[])` | `drop` + `create`: devuelve además `first_name`, `last_name` (cambia el tipo de retorno). | `20261020000007_student_profiles_public_name_parts.sql` | B |

No cambian `student_grades`, `apply_self_assessment_grade` (sigue
reutilizando el ítem por `kind`, D15), `propagate_submission_grade`,
`assignment_variant_groups`, ni las políticas de `profiles`.

### Capa de datos (`lib/`)

| Archivo | Cambio | Parte |
|---------|--------|-------|
| `lib/grades/compute.ts` | **Nuevo.** Módulo puro (importable desde cliente): `computeGradeSummary(...)` y `formatInstitutionalGrade(...)` (D6, D14). | A |
| `lib/grades/types.ts` | `GradeItem` + `weight`, `group_id`; `GradeGroup` nuevo; `GradeSummary` / `GradeGroupSummary` (D7). `total_grade` → `grade_summary` en `EnrollmentWithGrades`, `CourseGradesRow`, `CourseGradesSummary`, `WithdrawnCourseSummary`. `CourseGradesRow` + `student_first_name`, `student_last_name`. | A (+B) |
| `lib/enrollments/types.ts` | `total_grade` → `grade_summary` en `EnrollmentWithStudent`; `EnrollmentWithCourse` pierde `total_grade`; nuevo `EnrollmentWithCourseAndGrades` (D9). | A |
| `lib/grades/index.ts` | Borra `computeTotalGrade`; lecturas con cortes; `weight`/`group_id` en create/update; CRUD de cortes; `ensureSelfAssessmentGradeItem`. | A |
| `lib/grades/overview.ts` | Borra su copia; usa `compute.ts`; retirados vía `getEnrollmentsWithGradesByStudent`. | A |
| `lib/grades/schemas.ts` | `weight`, `group_id`; `GradeGroupSchema` (`name`, `target_weight`). | A |
| `lib/grades/actions.ts` | Validación de Σ con disponible (ítems y cortes) y traducción de los errores de trigger (D3); acciones de cortes; `ensureSelfAssessmentGradeItemAction`. | A |
| `lib/enrollments/index.ts` | Borra `computeTotalGrade`; separa `getEnrollmentsByStudent` / `getEnrollmentsWithGradesByStudent` (D9); `getEnrollmentById` sin nota; `getEnrollmentsByAcademicCourse` con `grade_summary`; `fetchStudentProfilesPublic` devuelve también `first_name`, `last_name`. | A + B |
| `lib/students/types.ts` | `Profile`, `AdminStudentSummary`, `AdminStudentDetail`, `CreateStudentInput`, `UpdateStudentInput`: `first_name`, `last_name`, `name_needs_review`. | B |
| `lib/students/schemas.ts` | `CreateStudentSchema` / `UpdateStudentSchema`: `first_name`, `last_name` (D21b); `full_name` aceptado solo por compatibilidad. `EditStudentNameSchema` (spec-057 D8) pasa a objeto `{ first_name, last_name }`. | B |
| `lib/students/service.ts` | `:38` bootstrap con partes; `:130-131` lista ordenada por `last_name, first_name` y con filtro opcional `name_review_pending`; `:179-196` detalle con partes; `:244` alta con partes en `user_metadata`; `:324-328` update con partes y `name_needs_review = false`. | B |
| `lib/students/actions.ts` | `updateAccountAction` (`:72-105`) escribe partes; `updateStudentNameAction` (`:153-173`, spec-057) recibe `{ first_name, last_name }`. | B |
| `lib/students/index.ts` | `updateProfile` (`:37-39`) y el insert de `:73` usan partes. | B |
| `lib/auth/schemas.ts` | `SignUpSchema` (`:9-12`) y `UpdateProfileSchema` (`:45-46`): `first_name`, `last_name` en lugar de `full_name`. | B |
| `lib/auth/actions.ts` | `:79` lee partes; `:132` `options.data` con `first_name`, `last_name` y `full_name` derivado; `:159` bootstrap con partes. | B |
| `scripts/seed-dev-data.mjs` | Estudiantes sembrados con `first_name`/`last_name` (`'Estudiante Dev'` + `'Uno'`/`'Dos'`/`'Tres'`). | B |

Consumidores de `full_name` que **no cambian** (leen la columna derivada):
`components/navbar/Navbar.tsx`, `components/navbar/UserMenu.tsx`,
`lib/assignments/index.ts`, `lib/attendance/index.ts`,
`lib/attendance/service.ts`, `lib/questions/index.ts`,
`lib/submissions/index.ts`, `components/admin/EnrollmentTable.tsx` (texto),
los RPC `get_academic_courses_public` (`teacher_name`) y las políticas de
`20260715000003_profiles_visible_for_published_authors.sql`, y los scripts de
diagnóstico de `scripts/diagnostico-*`.

### Panel docente

| Archivo | Cambio | Parte |
|---------|--------|-------|
| `app/(admin)/admin/courses/[academicCourseId]/grades/page.tsx` | Carga cortes; los pasa a panel y tabla. | A |
| `components/admin/GradeItemsPanel.tsx` | Peso y corte por ítem; resumen "Ponderación definida 0.60 / 1.00"; insignia "Sin ponderar"; sección "Cortes" con peso objetivo, peso de ítems y aviso de desajuste; botón "Crear ítem de autoevaluaciones" cuando no existe. | A |
| `components/admin/GradesTable.tsx` | Usa `compute.ts`; filas ordenadas por apellido, nombres (D21); vistas "Por ítem" / "Por corte" (D11, D14); columnas Acumulado y Promedio; ayuda de D5. | A |
| `components/admin/EnrollmentTable.tsx` | `:88`, `:157`: acumulado y promedio. Aviso "N estudiantes con nombres por revisar". | A + B |
| `components/admin/StudentNameCell.tsx` | De un campo a dos ("Nombres", "Apellidos"); insignia "Revisar"; ✓ habilitado también para confirmar una propuesta sin cambios (D20). | B |

### Vistas del estudiante y registro

| Archivo | Cambio | Parte |
|---------|--------|-------|
| `app/cuenta/cursos/page.tsx` | Usa `getEnrollmentsWithGradesByStudent()`. | A |
| `components/account/EnrolledCourseList.tsx` | `:83`: promedio como cifra principal, acumulado secundaria. | A |
| `components/account/CourseGradesCard.tsx` | `:37-61`: ítems por corte con peso, nota de corte con "incompleto", `GradeSummaryBlock`; color según D10. | A |
| `components/account/EnrollmentDetail.tsx` | Tarjeta "Calificaciones" (`:79-125`): igual que `CourseGradesCard`. | A |
| `components/account/GradesOverview.tsx` | `:72` (retirados): acumulado y promedio. | A |
| `components/account/GradeSummaryBlock.tsx` | **Nuevo**: dos cifras + explicación + modo "sin ponderar" + "Nota final". | A |
| `components/auth/SignUpForm.tsx` | Campo `full_name` (`:12-13`) → "Nombres" y "Apellidos". | B |
| `components/account/AccountForm.tsx` | Campo `full_name` (`:59-83`) → "Nombres" y "Apellidos". | B |

### API y MCP

| Archivo | Cambio | Parte |
|---------|--------|-------|
| `app/api/students/route.ts`, `app/api/students/[studentId]/route.ts` | Sin cambios de transporte; heredan los esquemas y el servicio actualizados (`first_name`, `last_name`, filtro `name_review_pending`). | B |
| `mcp-servers/students-mcp/src/tools.ts` | `create_student` (`:47-76`), `update_student` (`:78-97`), `list_students` (`:5-33`), `get_student` (`:34-45`). | B |
| `docs/mcps/students-agent.system-prompt.md`, `docs/mcps/README.md` | Fase B4. | B |

### Lo que **no** cambia

- `lib/enrollments/access.ts:63` sigue usando `getEnrollmentsByStudent()`,
  ahora **más barato** (sin embed de notas; D9).
- `app/cuenta/cursos/[enrollmentId]/evaluaciones/**` usa `getEnrollmentById`
  solo para datos del curso.
- `assignment-mcp` (ver "Evaluación MCP").

## Decisiones de diseño

### Parte A — Notas

#### D1 — El peso vive en el ítem, como fracción de la nota final

`grade_items.weight numeric(4,3)`, `0 < w ≤ 1`, nullable. Fracción de la
nota **final** (no del corte): `0.1` = "10 % del curso". Así lo formula el
docente y la invariante queda en una sola suma por curso. Tres decimales
permiten 12.5 % sin abrir la puerta a precisión arbitraria. La UI captura la
fracción (`0.2`) y la muestra también como porcentaje (`20 %`).

#### D2 — `null` = "sin ponderar"; los ítems existentes quedan en `null`

Un ítem con `weight = null` no cuenta en la nota ponderada; el panel lo marca
"Sin ponderar" con un aviso global. La migración **no** inventa pesos para
los ítems de producción. Aplica también al ítem `kind = 'self_assessment'`,
que se pondera y edita como cualquier otro (spec-040 solo prohíbe
**borrarlo**, `lib/grades/index.ts:59-80`).

Alternativa descartada: `not null default 0` (un 0 se confunde con "vale nada
a propósito" y `w > 0` sirve para detectar errores de captura).

#### D3 — Σ ≤ 1 validada en la server action **y** en la base (ítems y cortes)

Mismo patrón para `grade_items.weight` y `grade_groups.target_weight`:

- **Server action**: suma los demás registros del curso y, si se superaría 1,
  devuelve "La suma de ponderaciones del curso superaría 1.00. Disponible:
  0.40." (o "…de pesos de cortes…") sin escribir.
- **Trigger** `before insert or update of <columna>`: la garantía real, porque
  hay escrituras fuera de la UI (REST directo con la política de update del
  docente, RPCs, dos pestañas a la vez). Toma `pg_advisory_xact_lock` por
  `academic_course_id` (claves distintas para ítems y cortes) antes de sumar;
  es `security definer` para sumar sin depender de la RLS del invocante; sale
  sin sumar si el valor es `null`; lanza `errcode '23514'` con mensaje
  `grade_items_weight_sum_exceeded` / `grade_groups_target_sum_exceeded` y el
  disponible en `detail`. La action traduce ambos al mismo texto.
- **Aritmética exacta**: `numeric` en la base y enteros en TypeScript
  (milésimas de peso, centésimas de nota). Nunca `0.1 + 0.2` en coma flotante.

Se usa lock consultivo y no `select … for update` sobre `academic_courses`
porque este último exige privilegio `UPDATE` sobre esa tabla al invocante.

#### D4 — Curso sin ninguna ponderación: promedio simple rotulado "sin ponderar" (confirmada por el usuario)

Si **ningún** ítem del curso tiene peso, `computeGradeSummary` devuelve
`mode: 'unweighted'` con el promedio simple de las notas registradas (la
fórmula de hoy), y todas las vistas lo rotulan "Promedio simple (sin
ponderar)" — al estudiante con "tu docente aún no ha definido el peso de cada
nota". Con al menos un ítem ponderado el curso pasa a `mode: 'weighted'`.
Evita que el día del despliegue todos los estudiantes de producción vean "—".

#### D5 — Nota `null` = "aún no calificado"; un 0 se registra explícitamente

Sin fila o con `score = null` no suma al acumulado ni al denominador del
promedio. Si el estudiante no entregó, el docente registra `0`. La planilla
lo explica junto a la tabla.

#### D6 — Un único módulo puro de cálculo

`lib/grades/compute.ts`, sin imports de servidor; lo usan las consultas de
`lib/` y `GradesTable` (cliente). Reemplaza las cuatro copias de "Contexto".

Fórmulas (enteros: `s` = nota en centésimas, `w` = peso en milésimas;
redondeo final **mitad hacia arriba**, igual que `round(numeric, 2)` de
Postgres):

- `weight_defined = Σ w` de ítems con peso; `weight_graded = Σ w` de ítems
  con peso **y** nota.
- `accumulated = Σ(s × w) / 1000` → centésimas. `null` si `weight_graded = 0`.
- `projected = Σ(s × w) / weight_graded` → centésimas. `null` si
  `weight_graded = 0`.
- Por corte: `items_weight = Σ w` de sus ítems; `grade = Σ(s × w) / Σ(w con
  nota)` del corte; `is_complete` solo si todos sus ítems ponderados tienen
  nota; `grade = null` si ninguno la tiene. El módulo conserva el **cociente
  exacto** (numerador y denominador enteros) para poder redondear a 1 decimal
  sin doble redondeo (D14).
- Ítems sin corte cuentan igual en `accumulated` y `projected`.

Ejemplo de la petición: 3 ítems de `0.2` con `4.0` → `accumulated 2.40`,
`projected 4.00`.

El acumulado se calcula con notas de ítem, no con notas de corte redondeadas;
la definitiva que calcule la plataforma institucional a partir de las notas
de corte de 1 decimal puede diferir en unas centésimas. La vista "Por corte"
lo advierte.

#### D7 — Contrato `GradeSummary` y reemplazo de `total_grade`

```ts
interface GradeGroupSummary {
  group_id: string;
  name: string;
  order_index: number;
  target_weight: number;          // declarado por el docente (D12)
  items_weight: number;           // Σ pesos de sus ítems (derivado)
  weight_mismatch: boolean;       // items_weight !== target_weight
  weight_graded: number;
  grade: number | null;           // 0–5, 2 decimales
  grade_institutional: number | null; // 0–5, 1 decimal, desde el cociente exacto (D14)
  is_complete: boolean;
}

interface GradeSummary {
  mode: "weighted" | "unweighted";
  accumulated: number | null;     // "Llevas X de 5"
  projected: number | null;       // "Promedio en lo evaluado"; en 'unweighted', promedio simple
  weight_defined: number;         // 0–1
  weight_graded: number;          // 0–1
  unweighted_item_count: number;
  groups: GradeGroupSummary[];
}
```

`total_grade` se **reemplaza** por `grade_summary` en todos los tipos, para
que el compilador señale cada consumidor (inventario en "Impacto").

#### D8 — Matrículas retiradas: RPC acotado, cálculo en TypeScript

La RLS niega `grade_items` a un retirado (`20260625000004_rls_academic.sql:105`).
`get_own_enrollment_grade_lines(p_enrollment_ids uuid[])` (`security
definer`, `stable`) devuelve una fila por ítem del curso con `(enrollment_id,
grade_item_id, weight, score)`, filtrando `e.student_id = auth.uid()`. Sin
nombres ni cortes (se mantiene spec-056 D4: el retirado ve solo su nota a la
fecha). El RPC no calcula; el cálculo sigue en `compute.ts`. Descartado:
relajar `"grade_items: select"`, que expondría también nombres y cortes y
cambia un supuesto del que depende spec-056.

#### D9 — `getEnrollmentsByStudent` deja de calcular notas

Es el camino caliente de `requireCourseAccess` (`lib/enrollments/access.ts:63`)
y hoy paga un embed de `student_grades` que ese llamador no usa. Se separa en
`getEnrollmentsByStudent()` (sin notas) y
`getEnrollmentsWithGradesByStudent()` (con `grade_summary` vía D8, una sola
llamada), usada por `app/cuenta/cursos/page.tsx` y `lib/grades/overview.ts`.
`getEnrollmentById()` deja de calcular nota: su `total_grade` no tiene
consumidores.

#### D10 — Color verde/rojo sobre el promedio, no sobre el acumulado

`>= 3` (`CourseGradesCard.tsx:53`, `EnrollmentDetail.tsx:114`) se aplica al
promedio en lo evaluado (o al promedio simple en `unweighted`). El acumulado va
en color neutro: en la semana 3 un estudiante con todo en 5.0 lleva 1.00 de 5.
Con `weight_graded = 1` ambas cifras coinciden y se rotula "Nota final".

#### D11 — Vistas de la planilla y nota de corte incompleta visible al estudiante

- **Por ítem** (por defecto, editable): encabezado de dos filas (corte →
  ítems), ítems sin corte al final, columnas Acumulado y Promedio.
- **Por corte** (solo lectura): una fila por estudiante activo, ordenada por
  apellido y nombres (D21); una columna por corte con su nota en **formato
  institucional** (D14) y marca "incompleto"; Acumulado y Promedio (2
  decimales, punto); aviso de ítems sin corte; aviso de cortes con
  `weight_mismatch`.
- **Estudiante** (confirmado por el usuario): ve la nota **parcial** de un
  corte incompleto, con la marca "incompleto" y el texto "faltan notas en
  este corte". Se usa siempre la palabra "incompleto" (no "parcial") para no
  chocar con ítems llamados "Parcial 1", etc.

#### D12 — Cortes: tabla propia con peso objetivo declarado (confirmada por el usuario)

`grade_groups (id, academic_course_id, name, target_weight, order_index,
created_at)`. `target_weight numeric(4,3) not null`, `0 < t ≤ 1`, obligatorio
al crear el corte ("Nota 1 — 0.20"). **Σ target_weight por curso ≤ 1** con la
validación doble de D3: los cortes son la promesa de reparto ante la
plataforma institucional y no pueden sumar más del 100 %.

La suma de los pesos de los ítems del corte (`items_weight`) se **deriva**.
Si `items_weight ≠ target_weight`, el panel y la vista "Por corte" muestran un
aviso ("Nota 1: los ítems suman 0.15 de 0.20" / "…0.25 de 0.20"). Es **aviso,
no bloqueo**: el docente arma los cortes en varios pasos (crea el corte, luego
va agregando ítems a lo largo del semestre), y bloquear lo obligaría a un
orden de captura artificial. La nota del corte no depende del objetivo (es el
promedio ponderado de sus ítems, D6); el objetivo solo sirve de control.

FK compuesta `(group_id, academic_course_id)` → impide cortes de otro curso
sin trigger; `on delete set null (group_id)` (Postgres ≥ 15) deja los ítems
sin corte, con pesos y notas intactos. RLS espejo de `grade_items`.

#### D13 — Autorización en las actions: mismo patrón que hoy, sin fallos silenciosos

`requireUser()` + cliente de sesión, la RLS decide. Las mutaciones nuevas usan
`.select("id").maybeSingle()` para distinguir "0 filas por RLS" de un guardado
real (como `reactivateEnrollment`, `lib/enrollments/index.ts:254-268`), a
diferencia de `updateGradeItem` hoy (`lib/grades/index.ts:45-57`).

#### D14 — Formato institucional: 1 decimal, coma, sin doble redondeo (confirmada por el usuario)

Solo en la vista "Por corte" y en "Copiar columna" (el cálculo interno y el
resto de vistas siguen en 2 decimales):

- `grade_institutional` se obtiene redondeando **mitad hacia arriba a 1
  decimal desde el cociente exacto** del corte (D6), nunca desde la nota ya
  redondeada a 2 decimales: `3.749…` → `3,7` (y no `3.75` → `3,8`). Ejemplos
  del usuario: `3,75 → 3,8`; `3,74 → 3,7`.
- Se formatea con coma decimal (`3,8`). `formatInstitutionalGrade` vive en
  `compute.ts` (no `Intl`, para no depender del locale del navegador).
- "Copiar columna" copia una nota por línea, en el orden de la tabla
  (apellido, nombres); celda sin nota → línea vacía, para no desalinear filas
  al pegar. Las notas incompletas se copian igual (la marca es visual) y un
  aviso junto al botón indica cuántas filas están incompletas.

#### D15 — Botón "Crear ítem de autoevaluaciones" (confirmada por el usuario)

Visible en `GradeItemsPanel` solo si el curso no tiene ítem
`kind='self_assessment'`. Llama a `ensureSelfAssessmentGradeItemAction`, que
invoca el RPC `ensure_self_assessment_grade_item(p_academic_course_id)`:

- `security invoker`: la RLS de insert de `grade_items` (docente dueño o
  admin) autoriza; un estudiante no puede crearlo.
- Idempotente: si ya existe el ítem por `kind`, lo devuelve; si no, `insert …
  on conflict do nothing` (sin destino: así cubre el índice único parcial
  `grade_items_one_self_assessment_per_course` de spec-040 D5, que PostgREST
  no puede usar como `onConflict`) y vuelve a leer por `kind`. Dos clics
  concurrentes → un solo ítem.
- Mismos valores que la creación perezosa de `apply_self_assessment_grade`
  (`name 'Autoevaluaciones'`, `order_index = max + 1`, `weight null`), de modo
  que ese RPC lo **encuentra por `kind`** y lo reutiliza sin duplicarlo. No se
  modifica `apply_self_assessment_grade`.
- Si ya existe un ítem **manual** llamado "Autoevaluaciones", el insert choca
  con `grade_items_course_name_unique`; el RPC lanza un error que la action
  traduce a "Ya existe un ítem manual llamado 'Autoevaluaciones'; renómbralo
  para crear el automático." (ver Riesgos: el mismo choque existe hoy, en
  silencio, dentro de `apply_self_assessment_grade`).

### Parte B — Nombres y apellidos

#### D16 — Partes del nombre en `profiles`, no en `students`

`first_name text not null default ''`, `last_name text not null default ''`,
`name_needs_review boolean not null default false` en `profiles`, donde ya
vive `full_name` y desde donde lo leen todos los consumidores. Aplica también
a docentes (inocuo).

#### D17 — `full_name` se mantiene como columna almacenada y derivada por trigger

Se descarta convertirla en `generated always as (…) stored`: una columna
generada **rechaza escrituras**, y hoy escriben `full_name` al menos
`handle_new_user`, `lib/students/service.ts:38/328`, `lib/students/index.ts:39/73`,
`lib/students/actions.ts:99` y `lib/auth/actions.ts`. Además, las migraciones
se aplican **antes** de desplegar el código: durante esa ventana el código
viejo seguiría escribiendo `full_name` y fallaría. Por eso:

- Trigger `sync_profile_names` (`before insert or update` en `profiles`):
  - si se escribieron `first_name`/`last_name`, recalcula
    `full_name = "first_name last_name"`;
  - si solo cambió `full_name` (escritor anterior a este spec, o un `PATCH`
    legado por API), propone la separación con `propose_name_split` y marca
    `name_needs_review = true`;
  - en un insert sin partes, igual que el caso anterior.
- Todos los escritores de este repo pasan a escribir partes (inventario en
  "Impacto"); `full_name` queda como columna de **solo lectura de hecho**,
  conservada por compatibilidad con ~20 lectores que no cambian.

#### D18 — Backfill con propuesta automática, revisable por el docente

`propose_name_split(text)` (SQL, `immutable`) es la **única** implementación
de la heurística (la usan backfill y trigger; no se duplica en TypeScript):

1. Normaliza espacios. Vacío → `('', '')`. Si contiene `@` (perfil cuyo
   nombre quedó como correo por el `coalesce` de `handle_new_user`) →
   `(texto, '')`.
2. Une partículas al token siguiente (`de`, `del`, `la`, `las`, `los`, `y`,
   `san`, `da`, `van`, `von`): "Juan de la Cruz" → `Juan`, `de la Cruz`.
3. 1 token → `(t1, '')`; 2 → `(t1, t2)`; **3 → `(t1, t2 t3)`** (un nombre y
   dos apellidos, lo más común en Colombia); 4 o más → los dos últimos son
   apellidos, el resto nombres.

El backfill aplica la propuesta a todos los perfiles con `full_name` no vacío
y marca `name_needs_review = true`: ninguna heurística acierta siempre ("Juan
Carlos Pérez" saldría como `Juan` / `Carlos Pérez`), así que todo lo
automático queda por revisar. El docente lo corrige con D20; el estudiante,
desde `/cuenta`.

#### D19 — Registro y `/cuenta` con campos separados

- `SignUpForm`: "Nombres" y "Apellidos" (ambos obligatorios, `trim`, 2–60
  caracteres cada uno). `SignUpSchema` reemplaza `full_name` por
  `first_name` + `last_name`.
- `signUp` envía en `options.data` `first_name`, `last_name` y `full_name`
  derivado (este último para que `auth.users` siga mostrando un nombre en el
  dashboard de Supabase).
- `handle_new_user` inserta `first_name`/`last_name` desde
  `raw_user_meta_data`; si faltan (altas por otros caminos), el trigger de D17
  propone la separación desde `full_name`. Se conservan los `on conflict do
  nothing` por sentencia de `20260729000003` (no se reintroduce el bloque
  `exception` que revertía a sus vecinos).
- `/cuenta` (`AccountForm`, `updateAccountAction`): dos campos; al guardar se
  pone `name_needs_review = false` (el propio estudiante confirmó su nombre).

#### D20 — Revisión de nombres: se extiende spec-057, no se crea otra UI

`StudentNameCell` (tabla Activos de `EnrollmentTable`) pasa de un `<input>` a
dos ("Nombres", "Apellidos"), conservando todo el comportamiento de spec-057
D5/D6 (click-to-edit, Enter guarda, Escape cancela, blur no guarda, sin
optimistic update, error con `role="alert"`). Cambios:

- Insignia "Revisar" junto al nombre si `name_needs_review`.
- ✓ habilitado también **sin cambios** cuando la fila está por revisar: es el
  gesto de "la propuesta es correcta" y limpia la marca.
- `updateStudentNameAction(studentId, academicCourseId, { first_name,
  last_name })` mantiene el gate `assertTeacherOwnsEnrolledStudent` (spec-057
  D3/D7) y llama a `updateServiceStudent` con `name_needs_review = false`.
- Encima de la tabla, aviso "N estudiantes con nombres por revisar" cuando
  N > 0.
- Retirados siguen sin edición (spec-057 D4).

#### D21 — Orden por apellido en la planilla; provisional por `full_name`

`GradesTable` (ambas vistas) ordena por `last_name`, luego `first_name`, con
`localeCompare(…, "es", { sensitivity: "base" })` (Álvarez antes que Bernal).
Los datos llegan por `fetchStudentProfilesPublic`, cuyo RPC
`get_student_profiles_public` se amplía con `first_name`, `last_name` (cambio
de tipo de retorno → `drop` + `create`; los llamadores actuales ignoran las
columnas extra). Si la Parte A se despliega **antes** que la B, la planilla
ordena por `full_name` y la vista "Por corte" lo indica.

#### D21b — Contrato de la API de estudiantes

`CreateStudentSchema` exige `first_name` + `last_name`, **o** `full_name`
(compatibilidad: se separa automáticamente y queda `name_needs_review`).
`UpdateStudentSchema` acepta `first_name`, `last_name` y, por compatibilidad,
`full_name` (mismo tratamiento). Respuestas de lista y detalle incluyen
`first_name`, `last_name`, `name_needs_review`; la lista se ordena por
apellido y acepta `name_review_pending=true`.

## Evaluación MCP

**¿Aplica MCP?** Sí (por la Parte B).

- **MCP existente a modificar:** `students-mcp`
  (`mcp-servers/students-mcp/src/tools.ts`). Sin tools nuevas; cambian
  esquemas y descripciones:
  - `create_student`: `first_name` y `last_name` en `properties` y
    `required` (en lugar de `full_name`).
  - `update_student`: `first_name`, `last_name` opcionales; se retira
    `full_name` del esquema del tool (la API lo sigue aceptando, D21b).
  - `list_students`: descripción indica orden por apellido; parámetro nuevo
    opcional `name_review_pending` (boolean) para listar los nombres por
    revisar.
  - `get_student`: la descripción documenta `first_name`, `last_name`,
    `name_needs_review` en la respuesta.
  - `mcp-servers/students-mcp/src/api.ts`: sin cambios de transporte (verificar
    que el query param nuevo se reenvía).
- **MCP nuevo a crear:** ninguno.
- **System prompt afectado:** `docs/mcps/students-agent.system-prompt.md`
  ("MCP(s) disponibles", "Capacidades", "Restricciones": usar siempre
  nombres y apellidos por separado; no inventar la separación — si el
  docente da un nombre completo ambiguo, preguntar).
- **Índice:** `docs/mcps/README.md` (fila de `students-mcp`).
- **Fase de MCP en este spec:** Fase B4 (antes de la Fase C de pruebas).

**Parte A — no aplica MCP:** `assignment-mcp` solo **referencia** un
`grade_item_id` existente (`mcp-servers/assignment-mcp/src/tools.ts:102,204`
→ `lib/assignments/service.ts:39`) y no crea ítems; no hay API REST de notas;
la subida a la plataforma institucional es manual sobre la vista "Por corte".
Candidato futuro registrado como **DEBT-096**.

## DDL propuesto (diseño — **no aplicar en esta fase**)

> Timestamps posteriores a `20261019000001_add_claim_code_run.sql`. Verificar
> `select version();` (Postgres ≥ 15) en `nodo-dev` y producción antes de usar
> `on delete set null (group_id)`.

### Parte A

#### `20261020000000_init_grade_groups.sql`

```sql
create table public.grade_groups (
  id                  uuid         primary key default gen_random_uuid(),
  academic_course_id  uuid         not null references public.academic_courses(id) on delete cascade,
  name                text         not null check (length(btrim(name)) > 0),
  -- spec-059 D12: peso declarado del corte ante la plataforma institucional.
  target_weight       numeric(4,3) not null check (target_weight > 0 and target_weight <= 1),
  order_index         smallint     not null default 0,
  created_at          timestamptz  not null default now(),

  constraint grade_groups_course_name_unique unique (academic_course_id, name),
  constraint grade_groups_id_course_unique unique (id, academic_course_id)
);

create index on public.grade_groups (academic_course_id, order_index);

-- spec-059 D3/D12: Σ target_weight por curso ≤ 1.
create or replace function public.enforce_grade_groups_target_sum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_others numeric;
begin
  perform pg_advisory_xact_lock(
    hashtextextended('grade_groups_target:' || new.academic_course_id::text, 0)
  );

  select coalesce(sum(gg.target_weight), 0) into v_others
  from grade_groups gg
  where gg.academic_course_id = new.academic_course_id
    and gg.id <> new.id;

  if v_others + new.target_weight > 1 then
    raise exception using
      errcode = '23514',
      message = 'grade_groups_target_sum_exceeded',
      detail  = format('available=%s', greatest(1 - v_others, 0));
  end if;

  return new;
end;
$$;

create trigger enforce_grade_groups_target_sum
  before insert or update of target_weight on public.grade_groups
  for each row execute function public.enforce_grade_groups_target_sum();
```

#### `20261020000001_rls_grade_groups.sql`

```sql
alter table public.grade_groups enable row level security;

-- Espejo de "grade_items: select" (20260625000004_rls_academic.sql:93).
create policy "grade_groups: select"
  on public.grade_groups for select
  using (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or exists (select 1 from public.enrollments e
               where e.academic_course_id = grade_groups.academic_course_id
                 and e.student_id = auth.uid()
                 and e.status = 'active')
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_groups: insert teacher or admin"
  on public.grade_groups for insert
  with check (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_groups: update teacher or admin"
  on public.grade_groups for update
  using (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "grade_groups: delete teacher or admin"
  on public.grade_groups for delete
  using (
    exists (select 1 from public.academic_courses ac
            where ac.id = academic_course_id and ac.teacher_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );
```

#### `20261020000002_add_weight_and_group_to_grade_items.sql`

```sql
-- spec-059 D1/D2: fracción de la nota FINAL; null = sin ponderar.
alter table public.grade_items
  add column weight numeric(4,3)
  check (weight is null or (weight > 0 and weight <= 1));

-- spec-059 D12: corte institucional opcional, del MISMO curso.
alter table public.grade_items add column group_id uuid;

alter table public.grade_items
  add constraint grade_items_group_fk
  foreign key (group_id, academic_course_id)
  references public.grade_groups (id, academic_course_id)
  on delete set null (group_id);

create index on public.grade_items (group_id);

-- spec-059 D3: Σ weight por curso ≤ 1.
create or replace function public.enforce_grade_items_weight_sum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_others numeric;
begin
  if new.weight is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('grade_items_weight:' || new.academic_course_id::text, 0)
  );

  select coalesce(sum(gi.weight), 0) into v_others
  from grade_items gi
  where gi.academic_course_id = new.academic_course_id
    and gi.id <> new.id
    and gi.weight is not null;

  if v_others + new.weight > 1 then
    raise exception using
      errcode = '23514',
      message = 'grade_items_weight_sum_exceeded',
      detail  = format('available=%s', greatest(1 - v_others, 0));
  end if;

  return new;
end;
$$;

create trigger enforce_grade_items_weight_sum
  before insert or update of weight on public.grade_items
  for each row execute function public.enforce_grade_items_weight_sum();
```

#### `20261020000003_get_own_enrollment_grade_lines_rpc.sql`

```sql
-- spec-059 D8: pares (peso, nota) de las matrículas PROPIAS (activas o
-- retiradas). Sin nombres de ítems ni cortes.
create or replace function public.get_own_enrollment_grade_lines(
  p_enrollment_ids uuid[]
)
returns table (
  enrollment_id uuid,
  grade_item_id uuid,
  weight        numeric,
  score         numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, gi.id, gi.weight, sg.score
  from enrollments e
  join grade_items gi
    on gi.academic_course_id = e.academic_course_id
  left join student_grades sg
    on sg.enrollment_id = e.id
   and sg.grade_item_id = gi.id
  where e.id = any(p_enrollment_ids)
    and e.student_id = auth.uid();
$$;

revoke all on function public.get_own_enrollment_grade_lines(uuid[]) from public, anon;
grant execute on function public.get_own_enrollment_grade_lines(uuid[]) to authenticated;
```

#### `20261020000004_ensure_self_assessment_grade_item_rpc.sql`

```sql
-- spec-059 D15: crea de antemano el ítem de autoevaluaciones (idempotente).
-- security INVOKER: la política de insert de grade_items autoriza.
-- Mismos valores que la creación perezosa de apply_self_assessment_grade,
-- que lo reutiliza al encontrarlo por kind.
create or replace function public.ensure_self_assessment_grade_item(
  p_academic_course_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  select gi.id into v_id
  from grade_items gi
  where gi.academic_course_id = p_academic_course_id
    and gi.kind = 'self_assessment';

  if v_id is not null then
    return v_id;
  end if;

  if exists (
    select 1 from grade_items gi
    where gi.academic_course_id = p_academic_course_id
      and gi.name = 'Autoevaluaciones'
  ) then
    raise exception using
      errcode = '23505',
      message = 'self_assessment_item_name_taken';
  end if;

  -- Sin destino de conflicto: cubre el índice único parcial de spec-040 D5.
  insert into grade_items (academic_course_id, name, order_index, kind)
  values (
    p_academic_course_id,
    'Autoevaluaciones',
    coalesce((select max(order_index) + 1 from grade_items
               where academic_course_id = p_academic_course_id), 0),
    'self_assessment'
  )
  on conflict do nothing
  returning id into v_id;

  if v_id is null then
    select gi.id into v_id
    from grade_items gi
    where gi.academic_course_id = p_academic_course_id
      and gi.kind = 'self_assessment';
  end if;

  return v_id;
end;
$$;

revoke all on function public.ensure_self_assessment_grade_item(uuid) from public, anon;
grant execute on function public.ensure_self_assessment_grade_item(uuid) to authenticated;
```

> Un invocante sin permiso de insert recibe el error de RLS del `insert`
> (`42501`); la action lo traduce a "No tienes acceso a este curso".

### Parte B

#### `20261020000005_add_name_parts_to_profiles.sql`

```sql
alter table public.profiles
  add column first_name        text    not null default '',
  add column last_name         text    not null default '',
  add column name_needs_review boolean not null default false;

create index on public.profiles (last_name, first_name);

-- spec-059 D18: única implementación de la heurística de separación.
create or replace function public.propose_name_split(p_full_name text)
returns table (first_name text, last_name text)
language plpgsql
immutable
set search_path = public
as $$
declare
  v_norm   text := btrim(regexp_replace(coalesce(p_full_name, ''), '\s+', ' ', 'g'));
  v_tokens text[] := '{}';
  v_buf    text := '';
  v_tok    text;
  n        int;
begin
  if v_norm = '' then
    return query select ''::text, ''::text;
    return;
  end if;

  if position('@' in v_norm) > 0 then
    return query select v_norm, ''::text;
    return;
  end if;

  foreach v_tok in array string_to_array(v_norm, ' ') loop
    if lower(v_tok) in ('de', 'del', 'la', 'las', 'los', 'y', 'san', 'da', 'van', 'von') then
      v_buf := v_buf || v_tok || ' ';
    else
      v_tokens := v_tokens || (v_buf || v_tok);
      v_buf := '';
    end if;
  end loop;
  if v_buf <> '' then
    v_tokens := v_tokens || btrim(v_buf);
  end if;

  n := coalesce(array_length(v_tokens, 1), 0);

  if n = 1 then
    return query select v_tokens[1], ''::text;
  elsif n = 2 then
    return query select v_tokens[1], v_tokens[2];
  elsif n = 3 then
    return query select v_tokens[1], v_tokens[2] || ' ' || v_tokens[3];
  else
    return query select array_to_string(v_tokens[1:n - 2], ' '),
                        v_tokens[n - 1] || ' ' || v_tokens[n];
  end if;
end;
$$;

-- spec-059 D17: full_name derivado; escritores legados re-proponen partes.
create or replace function public.sync_profile_names()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_first text;
  v_last  text;
  v_parts_written boolean;
begin
  if tg_op = 'INSERT' then
    v_parts_written := btrim(new.first_name) <> '' or btrim(new.last_name) <> '';
  else
    v_parts_written := new.first_name is distinct from old.first_name
                    or new.last_name  is distinct from old.last_name;
  end if;

  if not v_parts_written
     and btrim(coalesce(new.full_name, '')) <> ''
     and (tg_op = 'INSERT' or new.full_name is distinct from old.full_name) then
    select s.first_name, s.last_name into v_first, v_last
    from public.propose_name_split(new.full_name) s;
    new.first_name := v_first;
    new.last_name := v_last;
    new.name_needs_review := true;
  end if;

  new.first_name := btrim(new.first_name);
  new.last_name := btrim(new.last_name);

  if new.first_name <> '' or new.last_name <> '' then
    new.full_name := btrim(concat_ws(' ', nullif(new.first_name, ''), nullif(new.last_name, '')));
  end if;

  return new;
end;
$$;

create trigger sync_profile_names
  before insert or update on public.profiles
  for each row execute function public.sync_profile_names();

-- Backfill (D18): todo lo automático queda por revisar.
update public.profiles p
set (first_name, last_name) = (
      select s.first_name, s.last_name from public.propose_name_split(p.full_name) s
    ),
    name_needs_review = true
where btrim(p.full_name) <> ''
  and p.first_name = ''
  and p.last_name = '';
```

> El backfill dispara `sync_profile_names` (partes escritas → recalcula
> `full_name`), lo que normaliza espacios dobles del `full_name` original. Es
> intencional. El trigger `set_updated_at` de `profiles`, si existe, también
> se dispara.

#### `20261020000006_handle_new_user_name_parts.sql`

```sql
-- spec-059 D19: parte de 20260729000003 (on conflict por sentencia, sin
-- bloque exception). Solo cambia el insert en profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    -- Si faltan las partes, sync_profile_names propone la separación desde aquí.
    coalesce(new.raw_user_meta_data->>'full_name', new.email, '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict (user_id, role) do nothing;

  insert into public.students (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;
```

#### `20261020000007_student_profiles_public_name_parts.sql`

```sql
-- spec-059 D21: cambia el tipo de retorno → drop + create.
drop function if exists public.get_student_profiles_public(uuid[]);

create function public.get_student_profiles_public(p_ids uuid[])
returns table (id uuid, full_name text, first_name text, last_name text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.first_name, p.last_name
  from public.profiles p
  where p.id = any(p_ids);
$$;

grant execute on function public.get_student_profiles_public(uuid[]) to authenticated;
```

## Fases de implementación

### Parte A — Notas

#### Fase A1 — Esquema de notas
- [ ] Verificar la versión de Postgres en `nodo-dev` y producción (D12).
- [ ] Crear las migraciones `20261020000000`–`20261020000004`.
- [ ] `supabase db push --db-url "$DEV_DB_URL" --dry-run`, mostrar la salida al
      usuario y, con su visto bueno, aplicar en `nodo-dev` (**nunca** `--linked`).
- [ ] Verificar en `nodo-dev`: el trigger de ítems rechaza `0.6 + 0.5`; el de
      cortes rechaza `0.8 + 0.3`; FK compuesta rechaza un corte de otro curso;
      borrar un corte deja `group_id` en `null`; `ensure_self_assessment_grade_item`
      dos veces devuelve el mismo id; RLS y `GRANT`s de `grade_groups`.

#### Fase A2 — Módulo puro de cálculo
- [ ] `lib/grades/compute.ts`: `computeGradeSummary` (D6, D7) y
      `formatInstitutionalGrade` (D14), con aritmética entera y cociente exacto.
- [ ] Modo `unweighted` (D4); `weight_mismatch` por corte (D12).
- [ ] Sin imports de servidor (lo consume `GradesTable`).

#### Fase A3 — Capa de datos y acciones de notas
- [ ] Tipos: `weight`, `group_id`, `GradeGroup` (con `target_weight`),
      `grade_summary` en lugar de `total_grade` (D7), `EnrollmentWithCourseAndGrades` (D9).
- [ ] `lib/grades/index.ts`, `schemas.ts`, `actions.ts`: pesos, cortes,
      validación doble y traducción de errores (D3), D13,
      `ensureSelfAssessmentGradeItemAction` (D15).
- [ ] `lib/enrollments/index.ts` y `lib/grades/overview.ts`: borrar copias,
      separar lecturas (D9), RPC de retirados (D8).

#### Fase A4 — UI docente de notas
- [ ] Leer `DESIGN.md`; tokens semánticos; Flowbite primero.
- [ ] `GradeItemsPanel`: peso, corte, resumen, "Sin ponderar", sección
      "Cortes" con `target_weight` y aviso de desajuste, botón "Crear ítem de
      autoevaluaciones".
- [ ] `GradesTable`: `compute.ts`, orden por apellido (D21), vistas
      "Por ítem"/"Por corte", formato institucional y "Copiar columna" (D14),
      Acumulado/Promedio, ayuda de D5.
- [ ] `grades/page.tsx` y `EnrollmentTable` (cifras).

#### Fase A5 — UI del estudiante
- [ ] `GradeSummaryBlock` (D4, D10).
- [ ] `CourseGradesCard`, `EnrollmentDetail`: ítems por corte con peso, nota
      de corte con "incompleto" (D11).
- [ ] `EnrolledCourseList` + `app/cuenta/cursos/page.tsx`; `GradesOverview`
      (retirados).
- [ ] `npm run lint` y `npm run build` limpios (A3–A5 se cierran juntas por
      el renombre de D7).

### Parte B — Nombres y apellidos

#### Fase B1 — Esquema de nombres
- [ ] Migraciones `20261020000005`–`20261020000007`.
- [ ] **Antes de aplicar en producción**, correr `propose_name_split` en modo
      lectura sobre los perfiles reales (`select full_name, s.* from profiles,
      propose_name_split(full_name) s`) y mostrar la muestra al usuario.
- [ ] Dry-run + aplicar en `nodo-dev`; verificar backfill (perfiles sembrados
      con `name_needs_review = true`), trigger (escritura legada de
      `full_name` re-propone; escritura de partes recalcula `full_name`) y
      registro de un usuario nuevo con y sin partes en los metadatos.

#### Fase B2 — Registro, `/cuenta` y servicio de estudiantes
- [ ] `lib/auth/schemas.ts`, `lib/auth/actions.ts`, `components/auth/SignUpForm.tsx` (D19).
- [ ] `lib/students/types.ts`, `schemas.ts`, `service.ts`, `index.ts`,
      `actions.ts` (`updateAccountAction`) y `components/account/AccountForm.tsx`.
- [ ] Contrato de API (D21b); `fetchStudentProfilesPublic` con partes.
- [ ] `scripts/seed-dev-data.mjs` con partes.
- [ ] `grep -rn "full_name:" lib app components` solo debe mostrar lecturas o
      el `full_name` derivado de `options.data` (ningún escritor directo).

#### Fase B3 — UI docente de nombres
- [ ] `StudentNameCell` con dos campos, insignia "Revisar" y confirmación
      (D20); `updateStudentNameAction` con `{ first_name, last_name }`.
- [ ] Aviso "N estudiantes con nombres por revisar" en `EnrollmentTable`.

#### Fase B4 — MCP: actualizar `students-mcp`
> Según `.claude/agents/mcp-builder.md` (modo construcción/actualización).
- [ ] `mcp-servers/students-mcp/src/tools.ts`: esquemas y descripciones de
      `create_student`, `update_student`, `list_students`
      (`name_review_pending`), `get_student`; confirmar que `api.ts` reenvía
      el query param.
- [ ] `npm run build` del MCP.
- [ ] Actualizar la fila de `students-mcp` en `docs/mcps/README.md`.
- [ ] Actualizar `docs/mcps/students-agent.system-prompt.md` (capacidades y
      restricción "no inventar la separación; preguntar si es ambiguo").
- [ ] Verificar con `./mcp-servers/run-local-mcp.sh students-mcp` (con
      `npm run dev` arriba) que las cuatro tools responden con las partes.

### Fase C — Pruebas
- [ ] Ejecutar con el usuario `docs/testing/test-059-ponderacion-notas-y-nota-a-la-fecha.md`
      (`TC-059-*` y `TC-MCP-059-*`).
- [ ] Cuando exista framework, implementar los casos de "Pruebas asociadas".

### Fase D — Despliegue (solo con confirmación explícita del usuario)
- [ ] Orden recomendado: **Parte B primero** (aislada, por el riesgo de
      `handle_new_user`), luego Parte A. Si se despliegan juntas, una sola
      ventana.
- [ ] `git diff --stat origin/main..HEAD -- supabase/` debe listar solo las
      migraciones de la parte que se despliega.
- [ ] `supabase db push --linked --dry-run` (**obligatorio**), mostrar la
      salida y aplicar solo si lista exactamente esas migraciones.
- [ ] Verificar por REST que existen `grade_items.weight` y/o
      `profiles.first_name` (`42703` = no aplicada).
- [ ] Parte B: tras desplegar, registrar una cuenta de prueba y confirmar que
      el perfil queda con partes (y borrarla).
- [ ] Parte A: el docente pondera sus cursos; hasta entonces, promedio simple
      rotulado (D4).

## Criterios de aceptación

### Parte A
1. El docente asigna a cada ítem un peso entre 0 y 1 (≤ 3 decimales) o lo deja
   sin ponderar, y lo asigna a un corte o a ninguno.
2. Si un peso de ítem llevaría la suma del curso por encima de 1.00, se
   rechaza con el disponible; ídem para el peso objetivo de un corte.
3. La base rechaza ambas sumas > 1 aunque la escritura no pase por la UI.
4. El panel muestra "0.60 / 1.00" y el disponible, y advierte los ítems sin
   ponderar.
5. Tres ítems de 0.2 con 4.0 → Acumulado 2.40 y Promedio 4.00 en planilla,
   "Mis notas" y detalle de matrícula.
6. Una celda vacía no cuenta; un 0 registrado sí.
7. El docente crea (con peso objetivo), renombra, reordena y elimina cortes;
   el panel avisa cuando los ítems de un corte no suman su objetivo; eliminar
   un corte deja sus ítems sin corte con pesos y notas intactos.
8. La vista "Por corte" ordena por apellido y nombres, muestra cada nota de
   corte con 1 decimal y coma, redondeada mitad hacia arriba desde el valor
   exacto (3,75 → 3,8; 3,74 → 3,7), marca "incompleto" y permite copiar una
   columna completa (una línea por estudiante, vacía si no hay nota).
9. El estudiante ve la nota parcial de un corte incompleto con la marca.
10. El botón "Crear ítem de autoevaluaciones" crea el ítem una sola vez (dos
    clics no duplican), el ítem se puede ponderar, y la primera autoevaluación
    respondida escribe la nota en **ese** ítem.
11. Un curso sin ningún ítem ponderado muestra "Promedio simple (sin
    ponderar)" en todas las vistas.
12. Un retirado ve en "Cursos retirados" su acumulado y promedio con pesos.
13. El color verde/rojo se aplica al promedio, no al acumulado.
14. `grep -rn "computeTotal" lib components app` vacío.
15. `getEnrollmentsByStudent` no embebe `student_grades`.

### Parte B
16. Tras la migración, cada perfil tiene nombres y apellidos propuestos y
    marcados "por revisar"; `full_name` no cambia salvo normalización de
    espacios.
17. El registro pide "Nombres" y "Apellidos" por separado y el perfil queda
    con ambas partes, sin marca de revisión.
18. El docente corrige o confirma nombres y apellidos desde la lista de
    matriculados; la marca "Revisar" desaparece al guardar o confirmar.
19. El estudiante edita sus nombres y apellidos en `/cuenta`.
20. Un escritor que solo envía `full_name` (código o API legado) no rompe:
    el sistema propone las partes y marca la revisión.
21. El agente de `students-mcp` crea y actualiza estudiantes con
    `first_name`/`last_name`, los recibe en `get_student`/`list_students`
    (ordenada por apellido) y puede listar solo los nombres por revisar.

## Pruebas asociadas
> Estos archivos se crean junto con el spec.

- **Manuales:** `docs/testing/test-059-ponderacion-notas-y-nota-a-la-fecha.md`
  — `TC-059-01` a `TC-059-17` (Parte A), `TC-059-20` a `TC-059-25`
  (Parte B) y `TC-MCP-059-01` a `TC-MCP-059-04`.
- **Automáticas:** `{{ubicación e2e por definir}}/e2e-059-ponderacion-notas-y-nota-a-la-fecha.spec.ts`
  — cuando exista framework. Casos, todos en rojo desde el inicio:

  **Unitarias de `compute.ts` (criterios 5, 6, 8, 11, 14):**
  - Tres ítems de 0.2 con 4.0 → 2.40 / 4.00.
  - Nota `null` excluida; nota `0` incluida.
  - Sin notas → `null` / `null`; sin pesos → `mode 'unweighted'`.
  - Ítem sin peso en curso ponderado → excluido, `unweighted_item_count`.
  - Corte incompleto → `is_complete false`, `grade` sobre lo calificado;
    corte sin notas → `null`; `weight_mismatch` en ambos sentidos.
  - Ítems sin corte cuentan en el total, no en `groups`.
  - Pesos `0.1 + 0.2` = `0.3` exacto; `0.2 / 0.3` → `0.67`; `x.xx5` → arriba.
  - `formatInstitutionalGrade`: cociente `3.75` → `"3,8"`; `3.74` → `"3,7"`;
    cociente `3.749…` → `"3,7"` (sin doble redondeo); `null` → `""`; `5` →
    `"5,0"`; `0` → `"0,0"`.

  **Base de datos (criterios 2, 3, 7, 10, 12, 16, 20):**
  - Suma de ítems y de cortes a 1.001 → `23514` con su mensaje.
  - Dos transacciones concurrentes de 0.3 sobre 0.6 → solo una confirma.
  - `apply_self_assessment_grade` con la suma ya en 1.00 → no falla.
  - `ensure_self_assessment_grade_item` ×2 → mismo id; luego
    `apply_self_assessment_grade` escribe en ese id; con un ítem manual
    "Autoevaluaciones" → `self_assessment_item_name_taken`; como estudiante →
    error de RLS.
  - FK compuesta y `on delete set null (group_id)`.
  - `get_own_enrollment_grade_lines` con matrícula ajena → 0 filas.
  - `propose_name_split`: `''`, `'ana'`, `'Ana Gómez'`, `'Santiago Suárez
    Cortés'`, `'Juan Carlos Pérez Gómez'`, `'Juan de la Cruz'`,
    `'correo@x.com'`, espacios dobles.
  - `sync_profile_names`: update de partes recalcula `full_name` y no toca
    la marca; update solo de `full_name` re-propone y marca; insert sin partes
    propone.
  - `handle_new_user` con y sin partes en los metadatos.

  **e2e (criterios 1, 4, 8, 9, 17, 18):** flujos de `TC-059-01`, `-04`,
  `-08`, `-11`, `-21`, `-22`.

## Preguntas abiertas para el usuario

- **P1 — Decimales de la nota de corte para el estudiante.** El estudiante ve
  la nota de corte con 2 decimales y punto (formato interno). Si la
  plataforma institucional le mostrará `3,8`, ¿prefieres que Nodo le muestre
  también el formato institucional en la nota de corte (manteniendo 2
  decimales en acumulado y promedio)?
- **P2 — Orden y formato de nombres en otras vistas.** Solo la planilla de
  notas ordena por apellido. ¿Quieres también ordenar por apellido (y/o
  mostrar "Apellidos, Nombres") la lista de matriculados y la planilla de
  asistencia? Es un cambio pequeño una vez exista la Parte B, pero fuera de
  este alcance.
- **P3 — Heurística de 3 palabras.** Con 3 palabras se propone 1 nombre + 2
  apellidos ("Santiago | Suárez Cortés"). ¿Coincide con la mayoría de tus
  estudiantes, o es más común 2 nombres + 1 apellido?
- **P4 — Separar la Parte B en spec-060.** Recomendado (ver "Nota de
  alcance"). ¿Lo extraemos al aprobar?

## Riesgos

- **Cambio de cifra visible en producción** al ponderar un curso (promedio
  simple → ponderado). Avisar a los estudiantes.
- **Renombre de `total_grade`** (D7): A3–A5 se cierran y despliegan juntas.
- **`on delete set null (column)`** requiere Postgres ≥ 15; si no, FK simple
  + trigger de "mismo curso".
- **`handle_new_user`** es una ruta crítica con incidentes previos (spec-027).
  Mitigación: Parte B desplegada aparte y verificada con un registro real.
- **Choque de nombre latente en `apply_self_assessment_grade`** (fuera de
  alcance, hallado al diseñar D15): si un curso tiene un ítem manual llamado
  "Autoevaluaciones" y aún no tiene el automático, el `insert … on conflict do
  nothing` de la creación perezosa no inserta (choca con
  `grade_items_course_name_unique`), la relectura por `kind` devuelve `null` y
  el insert en `student_grades` falla por `grade_item_id null`. La UI de D15
  lo previene para el botón, pero no para la ruta perezosa. Candidato a
  registrar en `docs/specs/backlog.md` (no se registra desde este paquete).
- **Ventana de despliegue de la Parte B**: entre la migración y el despliegue
  del código, el registro antiguo sigue enviando solo `full_name`; el trigger
  lo absorbe (D17), pero esas altas quedarán "por revisar".
- **Tamaño del paquete** (~35 archivos, 8 migraciones, un MCP): ver "Nota de
  alcance".

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
