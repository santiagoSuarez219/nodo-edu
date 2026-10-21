# spec-059 — [NOT STARTED] Ponderación de notas, cortes institucionales y nota a la fecha
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

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

Respuestas posteriores del usuario (2026-10-20), incorporadas como
decisiones: modo de transición con promedio simple rotulado (D4); peso
objetivo por corte (D12); el estudiante ve la nota de cada corte, incluso
incompleta, en formato institucional (D11, D14); botón para crear de antemano
el ítem de autoevaluaciones (D15); copia institucional con 1 decimal y coma
(D14). Los nombres y apellidos separados y el orden por apellido en las
listas del docente se extrajeron a **spec-062**, que se despliega primero
(dependencia blanda, D16).

Hoy la "nota total" de un estudiante es un **promedio simple** de todas sus
notas registradas: todos los ítems pesan lo mismo y los ítems sin nota se
ignoran. Eso no responde "¿en qué nota llevo el curso?" (un quiz de 5 minutos
pesa igual que un parcial) ni sirve para la plataforma institucional, que pide
notas agrupadas en cortes de 20 %.

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

## Dependencias

### spec-062 — nombres y apellidos separados (dependencia blanda)

spec-062 agrega `profiles.first_name` / `last_name` y ordena por apellido
**todas** las listas del panel docente, incluida la planilla de notas
(`GradesTable`, `getGradesByCourse`). Se despliega **antes** que este spec.
Este spec **no** define el orden de las filas: lo consume (D16).

- Si spec-062 ya está desplegado: la planilla (ambas vistas) llega ordenada
  por apellido y con "Apellidos, Nombres".
- Si no: se conserva el orden actual de `getGradesByCourse`, y la vista "Por
  corte" ordena provisionalmente por `full_name` y lo indica ("Orden por
  nombre completo: el orden por apellido llega con spec-062").

## Alcance

### Incluye

- Peso por ítem (`grade_items.weight`, fracción de la nota final,
  `0 < w ≤ 1`, opcional) con la invariante **Σ pesos de ítems por curso ≤ 1**,
  aplicada en la server action **y** en la base.
- Cortes institucionales (`grade_groups`) con **peso objetivo declarado**
  (`target_weight`, p. ej. 0.20) e invariante **Σ pesos objetivo por curso
  ≤ 1** (validación doble). Aviso cuando la suma de los ítems de un corte no
  coincide con su objetivo.
- Dos cifras de nota a la fecha, 0–5 con **2 decimales**: **Acumulado**
  (`Σ nota × peso` en lo calificado) y **Promedio en lo evaluado**
  (`Σ nota × peso / Σ pesos con nota`).
- Nota por corte en **formato institucional** (1 decimal, coma) para docente
  y estudiante, con marca "incompleto".
- Un módulo puro de cálculo que reemplaza las cuatro copias actuales.
- Planilla docente: peso, corte y peso objetivo; resumen de ponderación;
  avisos; vista "Por corte" con "Copiar columna"; columnas Acumulado y
  Promedio.
- Botón "Crear ítem de autoevaluaciones" (idempotente).
- Vistas del estudiante (`/cuenta/cursos`, `/cuenta/notas`,
  `/cuenta/cursos/[enrollmentId]`) con ambas cifras, peso por ítem y nota por
  corte.
- Nota a la fecha con pesos también para matrículas **retiradas** (RPC
  acotado).

### No incluye

- **Nombres y apellidos, formato "Apellidos, Nombres" y orden por apellido**
  de cualquier lista: es spec-062 (D16).
- **Pesos sugeridos o migración de pesos.** Los ítems existentes quedan con
  `weight = null`; el docente los pondera a mano (D2, D4).
- **"¿Cuánto necesito en lo que falta para pasar?"** — posible spec futuro.
- **Exportación a archivo (CSV/Excel)** o integración directa con la
  plataforma institucional: la "exportación" es "Copiar columna" (D14).
- **Herramienta MCP de lectura de notas por corte** (DEBT-096, candidato).
- Cambiar la escala 0–5 o las fórmulas de normalización de
  `propagate_submission_grade` y `apply_self_assessment_grade`.
- Corregir la falla latente de `apply_self_assessment_grade` con un ítem
  manual llamado "Autoevaluaciones" (ver "Riesgos", candidata a DEBT-098).

## Impacto en el sistema

### Base de datos (Supabase)

| Objeto | Cambio | Migración propuesta |
|--------|--------|---------------------|
| `public.grade_groups` | **Tabla nueva**: `id`, `academic_course_id`, `name`, `target_weight numeric(4,3) not null` (`0 < t ≤ 1`), `order_index`, `created_at`. Únicos `(academic_course_id, name)` y `(id, academic_course_id)`. Trigger `enforce_grade_groups_target_sum` (Σ ≤ 1). | `20261021000000_init_grade_groups.sql` |
| RLS `grade_groups` | Espejo de las cuatro políticas de `grade_items` (`20260625000004_rls_academic.sql:89-150`). | `20261021000001_rls_grade_groups.sql` |
| `grade_items.weight`, `grade_items.group_id` | `weight numeric(4,3) null` con `check`; `group_id uuid null` con FK compuesta `(group_id, academic_course_id) → grade_groups(id, academic_course_id) on delete set null (group_id)`. Trigger `enforce_grade_items_weight_sum`. | `20261021000002_add_weight_and_group_to_grade_items.sql` |
| RPC `get_own_enrollment_grade_lines(uuid[])` | `security definer`, `(enrollment_id, grade_item_id, weight, score)` de las matrículas del propio `auth.uid()` (D8). | `20261021000003_get_own_enrollment_grade_lines_rpc.sql` |
| RPC `ensure_self_assessment_grade_item(uuid)` | `security invoker`: devuelve el ítem `kind='self_assessment'` del curso, creándolo si no existe (D15). | `20261021000004_ensure_self_assessment_grade_item_rpc.sql` |

Los timestamps son posteriores a los de spec-062 (`20261020000000`–`…0002`),
que se despliega antes (spec-062 D13). No cambian `student_grades`,
`apply_self_assessment_grade` (sigue reutilizando el ítem por `kind`, D15),
`propagate_submission_grade` ni `assignment_variant_groups`.

### Capa de datos (`lib/`)

| Archivo | Cambio |
|---------|--------|
| `lib/grades/compute.ts` | **Nuevo.** Módulo puro (importable desde cliente): `computeGradeSummary(...)` y `formatInstitutionalGrade(...)` (D6, D14). |
| `lib/grades/types.ts` | `GradeItem` + `weight`, `group_id`; `GradeGroup` nuevo; `GradeSummary` / `GradeGroupSummary` (D7). `total_grade` → `grade_summary` en `EnrollmentWithGrades`, `CourseGradesRow`, `CourseGradesSummary`, `WithdrawnCourseSummary`. |
| `lib/enrollments/types.ts` | `total_grade` → `grade_summary` en `EnrollmentWithStudent`; `EnrollmentWithCourse` pierde `total_grade`; nuevo `EnrollmentWithCourseAndGrades` (D9). |
| `lib/grades/index.ts` | Borra `computeTotalGrade`; lecturas con cortes; `weight`/`group_id` en create/update; CRUD de cortes; `ensureSelfAssessmentGradeItem`. `getGradesByCourse` conserva el orden de filas que defina spec-062 (D16). |
| `lib/grades/overview.ts` | Borra su copia; usa `compute.ts`; retirados vía `getEnrollmentsWithGradesByStudent`. |
| `lib/grades/schemas.ts` | `weight`, `group_id`; `GradeGroupSchema` (`name`, `target_weight`). |
| `lib/grades/actions.ts` | Validación de Σ con disponible (ítems y cortes) y traducción de los errores de trigger (D3); acciones de cortes; `ensureSelfAssessmentGradeItemAction`. |
| `lib/enrollments/index.ts` | Borra `computeTotalGrade`; separa `getEnrollmentsByStudent` / `getEnrollmentsWithGradesByStudent` (D9); `getEnrollmentById` sin nota; `getEnrollmentsByAcademicCourse` con `grade_summary`. |

### Panel docente

| Archivo | Cambio |
|---------|--------|
| `app/(admin)/admin/courses/[academicCourseId]/grades/page.tsx` | Carga cortes; los pasa a panel y tabla. |
| `components/admin/GradeItemsPanel.tsx` | Peso y corte por ítem; resumen "Ponderación definida 0.60 / 1.00"; insignia "Sin ponderar"; sección "Cortes" con peso objetivo, peso de ítems y aviso de desajuste; botón "Crear ítem de autoevaluaciones" cuando no existe. |
| `components/admin/GradesTable.tsx` | Usa `compute.ts`; vistas "Por ítem" / "Por corte" (D11, D14); columnas Acumulado y Promedio; ayuda de D5. Mantiene el orden y formato de nombre de spec-062 (D16). |
| `components/admin/EnrollmentTable.tsx` | `:88`, `:157`: acumulado y promedio. |

### Vistas del estudiante

| Archivo | Cambio |
|---------|--------|
| `app/cuenta/cursos/page.tsx` | Usa `getEnrollmentsWithGradesByStudent()`. |
| `components/account/EnrolledCourseList.tsx` | `:83`: promedio como cifra principal, acumulado secundaria. |
| `components/account/CourseGradesCard.tsx` | `:37-61`: ítems por corte con peso, nota de corte en formato institucional con "incompleto", `GradeSummaryBlock`; color según D10. |
| `components/account/EnrollmentDetail.tsx` | Tarjeta "Calificaciones" (`:79-125`): igual que `CourseGradesCard`. |
| `components/account/GradesOverview.tsx` | `:72` (retirados): acumulado y promedio. |
| `components/account/GradeSummaryBlock.tsx` | **Nuevo**: dos cifras + explicación + modo "sin ponderar" + "Nota final". |

### Lo que **no** cambia

- `lib/enrollments/access.ts:63` sigue usando `getEnrollmentsByStudent()`,
  ahora **más barato** (sin embed de notas; D9).
- `app/cuenta/cursos/[enrollmentId]/evaluaciones/**` usa `getEnrollmentById`
  solo para datos del curso.
- API REST y MCPs: ninguno consume `total_grade` ni crea `grade_items`
  (verificado con `grep` en `app/api/` y `mcp-servers/*/src`).

## Decisiones de diseño

### D1 — El peso vive en el ítem, como fracción de la nota final

`grade_items.weight numeric(4,3)`, `0 < w ≤ 1`, nullable. Fracción de la
nota **final** (no del corte): `0.1` = "10 % del curso". Así lo formula el
docente y la invariante queda en una sola suma por curso. Tres decimales
permiten 12.5 % sin abrir la puerta a precisión arbitraria. La UI captura la
fracción (`0.2`) y la muestra también como porcentaje (`20 %`).

### D2 — `null` = "sin ponderar"; los ítems existentes quedan en `null`

Un ítem con `weight = null` no cuenta en la nota ponderada; el panel lo marca
"Sin ponderar" con un aviso global. La migración **no** inventa pesos para
los ítems de producción. Aplica también al ítem `kind = 'self_assessment'`,
que se pondera y edita como cualquier otro (spec-040 solo prohíbe
**borrarlo**, `lib/grades/index.ts:59-80`).

Alternativa descartada: `not null default 0` (un 0 se confunde con "vale nada
a propósito" y `w > 0` sirve para detectar errores de captura).

### D3 — Σ ≤ 1 validada en la server action **y** en la base (ítems y cortes)

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

### D4 — Curso sin ninguna ponderación: promedio simple rotulado "sin ponderar" (confirmada por el usuario)

Si **ningún** ítem del curso tiene peso, `computeGradeSummary` devuelve
`mode: 'unweighted'` con el promedio simple de las notas registradas (la
fórmula de hoy), y todas las vistas lo rotulan "Promedio simple (sin
ponderar)" — al estudiante con "tu docente aún no ha definido el peso de cada
nota". Con al menos un ítem ponderado el curso pasa a `mode: 'weighted'`.
Evita que el día del despliegue todos los estudiantes de producción vean "—".

### D5 — Nota `null` = "aún no calificado"; un 0 se registra explícitamente

Sin fila o con `score = null` no suma al acumulado ni al denominador del
promedio. Si el estudiante no entregó, el docente registra `0`. La planilla
lo explica junto a la tabla.

### D6 — Un único módulo puro de cálculo

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
  exacto** (numerador y denominador enteros) para redondear a 1 decimal sin
  doble redondeo (D14).
- Ítems sin corte cuentan igual en `accumulated` y `projected`.

Ejemplo de la petición: 3 ítems de `0.2` con `4.0` → `accumulated 2.40`,
`projected 4.00`.

El acumulado se calcula con notas de ítem, no con notas de corte redondeadas;
la definitiva que calcule la plataforma institucional a partir de las notas
de corte de 1 decimal puede diferir en unas centésimas. La vista "Por corte"
y la tarjeta del estudiante lo advierten.

### D7 — Contrato `GradeSummary` y reemplazo de `total_grade`

```ts
interface GradeGroupSummary {
  group_id: string;
  name: string;
  order_index: number;
  target_weight: number;          // declarado por el docente (D12)
  items_weight: number;           // Σ pesos de sus ítems (derivado)
  weight_mismatch: boolean;       // items_weight !== target_weight
  weight_graded: number;
  grade: number | null;           // 0–5, 2 decimales (uso interno y orden)
  grade_institutional: number | null; // 0–5, 1 decimal, desde el cociente exacto (D14)
  is_complete: boolean;
}

interface GradeSummary {
  mode: "weighted" | "unweighted";
  accumulated: number | null;     // "Llevas X de 5", 2 decimales
  projected: number | null;       // "Promedio en lo evaluado"; en 'unweighted', promedio simple
  weight_defined: number;         // 0–1
  weight_graded: number;          // 0–1
  unweighted_item_count: number;
  groups: GradeGroupSummary[];
}
```

`total_grade` se **reemplaza** por `grade_summary` en todos los tipos, para
que el compilador señale cada consumidor (inventario en "Impacto").

### D8 — Matrículas retiradas: RPC acotado, cálculo en TypeScript

La RLS niega `grade_items` a un retirado (`20260625000004_rls_academic.sql:105`).
`get_own_enrollment_grade_lines(p_enrollment_ids uuid[])` (`security
definer`, `stable`) devuelve una fila por ítem del curso con `(enrollment_id,
grade_item_id, weight, score)`, filtrando `e.student_id = auth.uid()`. Sin
nombres ni cortes (se mantiene spec-056 D4: el retirado ve solo su nota a la
fecha). El RPC no calcula; el cálculo sigue en `compute.ts`. Descartado:
relajar `"grade_items: select"`, que expondría también nombres y cortes y
cambia un supuesto del que depende spec-056.

### D9 — `getEnrollmentsByStudent` deja de calcular notas

Es el camino caliente de `requireCourseAccess` (`lib/enrollments/access.ts:63`)
y hoy paga un embed de `student_grades` que ese llamador no usa. Se separa en
`getEnrollmentsByStudent()` (sin notas) y
`getEnrollmentsWithGradesByStudent()` (con `grade_summary` vía D8, una sola
llamada), usada por `app/cuenta/cursos/page.tsx` y `lib/grades/overview.ts`.
`getEnrollmentById()` deja de calcular nota: su `total_grade` no tiene
consumidores.

### D10 — Color verde/rojo sobre el promedio, no sobre el acumulado

`>= 3` (`CourseGradesCard.tsx:53`, `EnrollmentDetail.tsx:114`) se aplica al
promedio en lo evaluado (o al promedio simple en `unweighted`). El acumulado va
en color neutro: en la semana 3 un estudiante con todo en 5.0 lleva 1.00 de 5.
Con `weight_graded = 1` ambas cifras coinciden y se rotula "Nota final".

### D11 — Vistas de la planilla y nota de corte para el estudiante

- **Por ítem** (por defecto, editable): encabezado de dos filas (corte →
  ítems), ítems sin corte al final, columnas Acumulado y Promedio.
- **Por corte** (solo lectura): una fila por estudiante activo, en el orden
  de D16; una columna por corte con su nota en **formato institucional**
  (D14) y marca "incompleto"; Acumulado y Promedio (2 decimales, punto);
  aviso de ítems sin corte y de cortes con `weight_mismatch`.
- **Estudiante** (confirmado por el usuario): ve la nota de **cada** corte en
  el mismo formato institucional que la plataforma (`3,8`), también cuando el
  corte está incompleto, con la marca "incompleto" y el texto "faltan notas en
  este corte". Así lo que ve en Nodo coincide con lo que verá en la
  plataforma institucional. Las notas de ítem siguen con 2 decimales (son las
  que registra el docente).
- **Nota total en 2 decimales** (decisión): acumulado y promedio se muestran
  con 2 decimales y punto en todas las vistas. No se suben a la plataforma
  institucional (que calcula su definitiva desde los cortes), así que no hay
  formato que igualar, y con 1 decimal "Llevas 1.65" se volvería "1,7", una
  cifra que el estudiante no podría reconstruir desde sus notas de ítem.
- Se usa siempre la palabra "incompleto" (no "parcial") para no chocar con
  ítems llamados "Parcial 1", etc.

### D12 — Cortes: tabla propia con peso objetivo declarado (confirmada por el usuario)

`grade_groups (id, academic_course_id, name, target_weight, order_index,
created_at)`. `target_weight numeric(4,3) not null`, `0 < t ≤ 1`, obligatorio
al crear el corte ("Nota 1 — 0.20"). **Σ target_weight por curso ≤ 1** con la
validación doble de D3: los cortes son la promesa de reparto ante la
plataforma institucional y no pueden sumar más del 100 %.

La suma de los pesos de los ítems del corte (`items_weight`) se **deriva**.
Si `items_weight ≠ target_weight`, el panel y la vista "Por corte" muestran un
aviso ("Nota 1: los ítems suman 0.15 de 0.20" / "…0.25 de 0.20"). Es **aviso,
no bloqueo**: el docente arma los cortes en varios pasos a lo largo del
semestre, y bloquear lo obligaría a un orden de captura artificial. La nota
del corte no depende del objetivo (es el promedio ponderado de sus ítems, D6).

FK compuesta `(group_id, academic_course_id)` → impide cortes de otro curso
sin trigger; `on delete set null (group_id)` (Postgres ≥ 15) deja los ítems
sin corte, con pesos y notas intactos. RLS espejo de `grade_items`.

### D13 — Autorización en las actions: mismo patrón que hoy, sin fallos silenciosos

`requireUser()` + cliente de sesión, la RLS decide. Las mutaciones nuevas usan
`.select("id").maybeSingle()` para distinguir "0 filas por RLS" de un guardado
real (como `reactivateEnrollment`, `lib/enrollments/index.ts:254-268`), a
diferencia de `updateGradeItem` hoy (`lib/grades/index.ts:45-57`).

### D14 — Formato institucional: 1 decimal, coma, sin doble redondeo (confirmada por el usuario)

Aplica a la **nota de corte** en la vista "Por corte", en "Copiar columna" y
en las vistas del estudiante (D11). El cálculo interno, las notas de ítem y
la nota total siguen en 2 decimales.

- `grade_institutional` se obtiene redondeando **mitad hacia arriba a 1
  decimal desde el cociente exacto** del corte (D6), nunca desde la nota ya
  redondeada a 2 decimales: `3.749…` → `3,7` (y no `3.75` → `3,8`). Ejemplos
  del usuario: `3,75 → 3,8`; `3,74 → 3,7`.
- Se formatea con coma decimal (`3,8`). `formatInstitutionalGrade` vive en
  `compute.ts` (no `Intl`, para no depender del locale del navegador).
- "Copiar columna" copia una nota por línea, en el orden de la tabla (D16);
  celda sin nota → línea vacía, para no desalinear filas al pegar. Las notas
  incompletas se copian igual (la marca es visual) y un aviso junto al botón
  indica cuántas filas están incompletas.

### D15 — Botón "Crear ítem de autoevaluaciones" (confirmada por el usuario)

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
- Si ya existe un ítem **manual** llamado "Autoevaluaciones", el RPC lanza
  `self_assessment_item_name_taken` y la action lo traduce a "Ya existe un
  ítem manual llamado 'Autoevaluaciones'; renómbralo para crear el
  automático." (ver Riesgos, DEBT-098).

### D16 — Orden de las filas: lo define spec-062 (dependencia blanda)

Este spec no ordena ni formatea nombres de estudiantes. La planilla consume el
orden y el formato que entrega `getGradesByCourse`:

- con spec-062 desplegado: por apellido y "Apellidos, Nombres" (spec-062 D6,
  D7, D8);
- sin spec-062: se conserva el orden actual en la vista "Por ítem", y la
  vista "Por corte" ordena por `full_name` con `localeCompare(…, "es")` y
  muestra el aviso de "Dependencias", porque es la que se pega fila a fila en
  la plataforma institucional.

## Evaluación MCP

**¿Aplica MCP?** No.

- `assignment-mcp` solo **referencia** un `grade_item_id` existente
  (`mcp-servers/assignment-mcp/src/tools.ts:102,204` →
  `lib/assignments/service.ts:39`); no crea ni edita ítems. Agregar `weight` y
  `group_id` no cambia ese contrato y `propagate_submission_grade` no lee
  pesos.
- No existe API REST de `grade_items` ni de notas (`app/api/` no las expone),
  así que no hay transporte que un MCP pudiera envolver sin crear primero un
  dominio de API nuevo.
- La subida a la plataforma institucional es manual sobre la vista "Por
  corte" (D11, D14); un agente no la ejecutaría.
- Ningún system prompt de `docs/mcps/` describe nota total ni ponderación.
- Los cambios de `students-mcp` y `attendance-mcp` por nombres y apellidos
  pertenecen a spec-062.

Candidato futuro registrado como **DEBT-096** en `docs/specs/backlog.md`: una
herramienta de solo lectura `get_course_grade_summary` (notas por corte,
acumulado y promedio por estudiante).

## DDL propuesto (diseño — **no aplicar en esta fase**)

> Timestamps posteriores a los de spec-062 (`20261020000000`–`…0002`).
> Verificar `select version();` (Postgres ≥ 15) en `nodo-dev` y producción
> antes de usar `on delete set null (group_id)`.

### `20261021000000_init_grade_groups.sql`

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

### `20261021000001_rls_grade_groups.sql`

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

### `20261021000002_add_weight_and_group_to_grade_items.sql`

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

### `20261021000003_get_own_enrollment_grade_lines_rpc.sql`

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

### `20261021000004_ensure_self_assessment_grade_item_rpc.sql`

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

## Fases de implementación

### Fase 1 — Esquema
- [ ] Verificar la versión de Postgres en `nodo-dev` y producción (D12).
- [ ] Crear las migraciones `20261021000000`–`20261021000004`.
- [ ] `supabase db push --db-url "$DEV_DB_URL" --dry-run`, mostrar la salida al
      usuario y, con su visto bueno, aplicar en `nodo-dev` (**nunca** `--linked`).
- [ ] Verificar en `nodo-dev`: el trigger de ítems rechaza `0.6 + 0.5`; el de
      cortes rechaza `0.8 + 0.3`; FK compuesta rechaza un corte de otro curso;
      borrar un corte deja `group_id` en `null`; `ensure_self_assessment_grade_item`
      dos veces devuelve el mismo id; RLS y `GRANT`s de `grade_groups`.

### Fase 2 — Módulo puro de cálculo
- [ ] `lib/grades/compute.ts`: `computeGradeSummary` (D6, D7) y
      `formatInstitutionalGrade` (D14), con aritmética entera y cociente exacto.
- [ ] Modo `unweighted` (D4); `weight_mismatch` por corte (D12).
- [ ] Sin imports de servidor (lo consume `GradesTable`).

### Fase 3 — Capa de datos y acciones
- [ ] Tipos: `weight`, `group_id`, `GradeGroup` (con `target_weight`),
      `grade_summary` en lugar de `total_grade` (D7), `EnrollmentWithCourseAndGrades` (D9).
- [ ] `lib/grades/index.ts`, `schemas.ts`, `actions.ts`: pesos, cortes,
      validación doble y traducción de errores (D3), D13,
      `ensureSelfAssessmentGradeItemAction` (D15).
- [ ] `lib/enrollments/index.ts` y `lib/grades/overview.ts`: borrar copias,
      separar lecturas (D9), RPC de retirados (D8).

### Fase 4 — UI docente
- [ ] Leer `DESIGN.md`; tokens semánticos; Flowbite primero.
- [ ] `GradeItemsPanel`: peso, corte, resumen, "Sin ponderar", sección
      "Cortes" con `target_weight` y aviso de desajuste, botón "Crear ítem de
      autoevaluaciones".
- [ ] `GradesTable`: `compute.ts`, vistas "Por ítem"/"Por corte", formato
      institucional y "Copiar columna" (D14), Acumulado/Promedio, ayuda de D5,
      orden según D16.
- [ ] `grades/page.tsx` y `EnrollmentTable` (cifras).

### Fase 5 — UI del estudiante
- [ ] `GradeSummaryBlock` (D4, D10, D11: 2 decimales).
- [ ] `CourseGradesCard`, `EnrollmentDetail`: ítems por corte con peso, nota
      de corte en formato institucional con "incompleto" (D11, D14).
- [ ] `EnrolledCourseList` + `app/cuenta/cursos/page.tsx`; `GradesOverview`
      (retirados).
- [ ] `npm run lint` y `npm run build` limpios (fases 3–5 se cierran juntas
      por el renombre de D7).

### Fase 6 — Pruebas
- [ ] Ejecutar con el usuario `docs/testing/test-059-ponderacion-notas-y-nota-a-la-fecha.md`.
- [ ] Cuando exista framework, implementar los casos de "Pruebas asociadas".

### Fase 7 — Despliegue (solo con confirmación explícita del usuario)
- [ ] Comprobar si spec-062 ya está en producción (determina el orden de D16).
- [ ] `git diff --stat origin/main..HEAD -- supabase/` debe listar solo las
      migraciones `20261021000000`–`…0004`.
- [ ] `supabase db push --linked --dry-run` (**obligatorio**), mostrar la
      salida y aplicar solo si lista exactamente esas cinco.
- [ ] Verificar por REST que existe `grade_items.weight` (`42703` = no aplicada).
- [ ] El docente pondera sus cursos; hasta entonces, promedio simple rotulado
      (D4).

## Criterios de aceptación

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
8. La vista "Por corte" muestra cada nota de corte con 1 decimal y coma,
   redondeada mitad hacia arriba desde el valor exacto (3,75 → 3,8;
   3,74 → 3,7), marca "incompleto" y permite copiar una columna completa (una
   línea por estudiante, vacía si no hay nota), en el orden de D16.
9. El estudiante ve la nota de cada corte en ese mismo formato, también si
   está incompleto (con la marca); su acumulado y promedio siguen con 2
   decimales.
10. El botón "Crear ítem de autoevaluaciones" crea el ítem una sola vez (dos
    clics no duplican), el ítem se puede ponderar, y la primera autoevaluación
    respondida escribe la nota en **ese** ítem.
11. Un curso sin ningún ítem ponderado muestra "Promedio simple (sin
    ponderar)" en todas las vistas.
12. Un retirado ve en "Cursos retirados" su acumulado y promedio con pesos.
13. El color verde/rojo se aplica al promedio, no al acumulado.
14. `grep -rn "computeTotal" lib components app` vacío.
15. `getEnrollmentsByStudent` no embebe `student_grades`.

## Pruebas asociadas
> Estos archivos se crean junto con el spec.

- **Manuales:** `docs/testing/test-059-ponderacion-notas-y-nota-a-la-fecha.md`
  — `TC-059-01` a `TC-059-17` (solo flujos con UI; no aplica `TC-MCP`).
- **Automáticas:** `{{ubicación e2e por definir}}/e2e-059-ponderacion-notas-y-nota-a-la-fecha.spec.ts`
  — cuando exista framework. Casos, todos en rojo desde el inicio:

  **Unitarias de `compute.ts` (criterios 5, 6, 8, 9, 11, 14):**
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

  **Base de datos (criterios 2, 3, 7, 10, 12):**
  - Suma de ítems y de cortes a 1.001 → `23514` con su mensaje.
  - Dos transacciones concurrentes de 0.3 sobre 0.6 → solo una confirma.
  - `apply_self_assessment_grade` con la suma ya en 1.00 → no falla.
  - `ensure_self_assessment_grade_item` ×2 → mismo id; luego
    `apply_self_assessment_grade` escribe en ese id; con un ítem manual
    "Autoevaluaciones" → `self_assessment_item_name_taken`; como estudiante →
    error de RLS.
  - FK compuesta y `on delete set null (group_id)`.
  - `get_own_enrollment_grade_lines` con matrícula ajena → 0 filas.

  **e2e (criterios 1, 4, 8, 9):** flujos de `TC-059-01`, `-04`, `-08`, `-11`.

## Riesgos

- **Cambio de cifra visible en producción** al ponderar un curso (promedio
  simple → ponderado). Avisar a los estudiantes.
- **Renombre de `total_grade`** (D7): fases 3–5 se cierran y despliegan juntas.
- **`on delete set null (column)`** requiere Postgres ≥ 15; si no, FK simple
  + trigger de "mismo curso".
- **Orden de despliegue con spec-062** (D16): si este spec sale primero, la
  vista "Por corte" ordena por nombre completo y no coincidirá fila a fila con
  la plataforma institucional hasta que salga spec-062.
- **Falla latente en `apply_self_assessment_grade` — candidata a DEBT-098**
  (fuera de alcance, hallada al diseñar D15; la registra el coordinador en
  `docs/specs/backlog.md`): si un curso tiene un ítem manual llamado
  "Autoevaluaciones" y aún no tiene el automático, el `insert … on conflict do
  nothing` de la creación perezosa no inserta (choca con
  `grade_items_course_name_unique`), la relectura por `kind` devuelve `null` y
  el insert en `student_grades` falla por `grade_item_id null`. El botón de
  D15 lo detecta con un mensaje claro, pero la ruta perezosa sigue expuesta.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
