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

## Alcance

### Incluye

- Peso por ítem de calificación (`grade_items.weight`, fracción de la nota
  final, `0 < w ≤ 1`, opcional) con la invariante **Σ pesos por curso ≤ 1**
  aplicada en la server action **y** en la base de datos.
- Cortes institucionales (`grade_groups`): el docente crea, renombra,
  reordena y elimina cortes, y asigna cada ítem a lo sumo a un corte. El peso
  del corte se **deriva** de sus ítems.
- Dos cifras de nota a la fecha, en escala 0–5 con 2 decimales:
  - **Acumulado** ("Llevas X de 5"): `Σ(nota × peso)` sobre ítems con nota.
  - **Promedio en lo evaluado** (proyección): `Σ(nota × peso) / Σ(pesos de
    ítems con nota)`.
- Nota por corte (0–5) con indicador "incompleto".
- Un módulo puro de cálculo que reemplaza las cuatro copias actuales.
- Planilla docente: edición de peso y corte por ítem, resumen de ponderación
  ("0.60 / 1.00"), advertencia de ítems sin ponderar, vista "Por corte" lista
  para copiar a la plataforma institucional, columnas Acumulado y Promedio.
- Vistas del estudiante (`/cuenta/cursos`, `/cuenta/notas` de spec-056,
  `/cuenta/cursos/[enrollmentId]`): ambas cifras con explicación breve, peso
  de cada ítem y nota por corte.
- Nota total con pesos también para matrículas **retiradas**, vía un RPC
  acotado (D8).
- Ponderar el ítem de autoevaluaciones (`kind = 'self_assessment'`, spec-040)
  igual que cualquier otro ítem.

### No incluye

- **Pesos sugeridos o migración de pesos de cursos en curso.** Tras la
  migración, todos los ítems existentes quedan con `weight = null`; el
  docente los pondera a mano (D2, D4).
- **"¿Cuánto necesito en lo que falta para pasar?"** (nota mínima requerida
  en lo no evaluado). Se deriva trivialmente del módulo de cálculo, pero es
  una pregunta de producto distinta; queda como posible spec futuro.
- **Exportación a archivo (CSV/Excel)** o integración directa con la
  plataforma institucional. La "exportación" es la vista "Por corte" con
  copia por columna (D11).
- **Herramienta MCP de lectura de notas por corte** (ver "Evaluación MCP";
  registrada como candidato en `docs/specs/backlog.md`, DEBT-096).
- Cambiar la escala 0–5, el `CHECK` de `student_grades.score` o la fórmula
  con que se normalizan las notas de evaluaciones
  (`propagate_submission_grade`) y de autoevaluaciones
  (`apply_self_assessment_grade`).
- Pre-crear el ítem de autoevaluaciones antes de la primera propagación
  (ver "Preguntas abiertas", P4).
- Ponderación de cortes independiente de sus ítems (un "peso objetivo"
  declarado por corte; ver P3).

## Impacto en el sistema

### Base de datos (Supabase)

| Objeto | Cambio | Migración propuesta |
|--------|--------|---------------------|
| `public.grade_groups` | **Tabla nueva**: `id`, `academic_course_id`, `name`, `order_index`, `created_at`. Únicos `(academic_course_id, name)` y `(id, academic_course_id)` (este último soporta la FK compuesta). | `20261020000000_init_grade_groups.sql` |
| RLS `grade_groups` | Espejo exacto de las cuatro políticas de `grade_items` (`20260625000004_rls_academic.sql:89-150`). | `20261020000001_rls_grade_groups.sql` |
| `public.grade_items.weight` | Columna nueva `numeric(4,3) null`, `check (weight is null or (weight > 0 and weight <= 1))`. | `20261020000002_add_weight_and_group_to_grade_items.sql` |
| `public.grade_items.group_id` | Columna nueva `uuid null`, FK compuesta `(group_id, academic_course_id) → grade_groups(id, academic_course_id) on delete set null (group_id)`. Índice en `group_id`. | idem |
| Trigger `enforce_grade_items_weight_sum` | `before insert or update of weight` en `grade_items`: rechaza si la suma del curso supera 1 (D3). | idem |
| RPC `get_own_enrollment_grade_lines(uuid[])` | `security definer`, devuelve `(enrollment_id, grade_item_id, weight, score)` solo de matrículas del propio `auth.uid()`, activas o retiradas (D8). | `20261020000003_get_own_enrollment_grade_lines_rpc.sql` |

No cambian: `student_grades`, `apply_self_assessment_grade`,
`propagate_submission_grade`, `assignment_variant_groups`. El RPC de
autoevaluaciones sigue insertando el ítem con `weight` omitido (= `null`), que
el trigger deja pasar sin evaluar la suma.

### Capa de datos (`lib/`)

| Archivo | Cambio |
|---------|--------|
| `lib/grades/compute.ts` | **Nuevo.** Módulo puro (sin imports de servidor, importable desde cliente): `computeGradeSummary(items, scores)`. Única fuente del cálculo (D6). |
| `lib/grades/types.ts` | `GradeItem` gana `weight: number \| null` y `group_id: string \| null`. Tipo nuevo `GradeGroup`. Tipo nuevo `GradeSummary` (D7). `total_grade: number \| null` se **reemplaza** por `grade_summary: GradeSummary` en `EnrollmentWithGrades`, `CourseGradesRow`, `CourseGradesSummary` y `WithdrawnCourseSummary`. |
| `lib/enrollments/types.ts` | `total_grade` se reemplaza por `grade_summary` en `EnrollmentWithStudent`. `EnrollmentWithCourse` **pierde** `total_grade`; tipo nuevo `EnrollmentWithCourseAndGrades` (D9). |
| `lib/grades/index.ts` | Borra `computeTotalGrade` (`:11`). `getGradeItemsByCourse` y `getGradesByCourse` devuelven también los cortes. `createGradeItem` / `updateGradeItem` aceptan `weight` y `group_id`. CRUD nuevo de cortes: `getGradeGroupsByCourse`, `createGradeGroup`, `updateGradeGroup`, `deleteGradeGroup`. |
| `lib/grades/overview.ts` | Borra la copia de `computeTotalGrade` (`:11`); usa `compute.ts`. Lee cortes de los cursos activos. Los retirados toman su `grade_summary` del helper nuevo de `lib/enrollments`. |
| `lib/grades/schemas.ts` | `GradeItemSchema` gana `weight` (nullable, `0 < w ≤ 1`, ≤ 3 decimales) y `group_id` (uuid nullable). Esquema nuevo `GradeGroupSchema`. |
| `lib/grades/actions.ts` | `createGradeItemAction` y `updateGradeItemAction` aceptan `weight` y `group_id`, validan la suma con mensaje del peso disponible y traducen el error del trigger (D3). Acciones nuevas `createGradeGroupAction`, `updateGradeGroupAction`, `deleteGradeGroupAction`. |
| `lib/enrollments/index.ts` | Borra `computeTotalGrade` (`:11`). `getEnrollmentsByStudent` deja de embeber `student_grades` (D9). Nuevo `getEnrollmentsWithGradesByStudent()` que usa el RPC de D8. `getEnrollmentById` deja de calcular nota (su `total_grade` no tiene consumidores). `getEnrollmentsByAcademicCourse` calcula `grade_summary` con los ítems del curso. |

### Panel docente (`app/(admin)/`, `components/admin/`)

| Archivo | Cambio |
|---------|--------|
| `app/(admin)/admin/courses/[academicCourseId]/grades/page.tsx` | Carga cortes junto con ítems y notas; los pasa a panel y tabla. |
| `components/admin/GradeItemsPanel.tsx` | Por ítem: campo de peso y selector de corte (incluido el ítem de autoevaluaciones). Resumen "Ponderación definida 0.60 / 1.00 — disponible 0.40". Insignia "Sin ponderar" por ítem con `weight = null` y aviso global. Sección "Cortes" (crear, renombrar, reordenar, eliminar) con el peso derivado de cada corte. |
| `components/admin/GradesTable.tsx` | Borra `computeTotal` (`:14`); usa `compute.ts` para el recálculo en vivo. Selector de vista "Por ítem" (editable, encabezado agrupado por corte) / "Por corte" (solo lectura, D11). Columnas "Acumulado" y "Promedio" en ambas vistas, en lugar de "Total". Texto de ayuda: celda vacía = sin calificar; 0 = no entregó (D5). |
| `components/admin/EnrollmentTable.tsx` | Líneas 88 y 157: muestra `Acumulado · Promedio` desde `grade_summary`. |

### Vistas del estudiante (`app/cuenta/`, `components/account/`)

| Archivo | Cambio |
|---------|--------|
| `app/cuenta/cursos/page.tsx` | Usa `getEnrollmentsWithGradesByStudent()` en lugar de `getEnrollmentsByStudent()`. |
| `components/account/EnrolledCourseList.tsx` | Línea 83: muestra el promedio en lo evaluado como cifra principal y el acumulado como secundaria. |
| `components/account/CourseGradesCard.tsx` | Líneas 37-61 (fila "Nota total", `:49`): ítems agrupados por corte, peso de cada ítem, nota por corte con "incompleto", bloque de nota a la fecha con las dos cifras y su explicación. El color verde/rojo pasa a aplicarse sobre el promedio (D10). |
| `components/account/EnrollmentDetail.tsx` | Tarjeta "Calificaciones" (líneas 79-125): mismo bloque que `CourseGradesCard` (se extrae un componente compartido `GradeSummaryBlock` para no duplicar la presentación). |
| `components/account/GradesOverview.tsx` | Línea 72 (retirados): muestra acumulado y promedio del `grade_summary`. |
| Componente nuevo `components/account/GradeSummaryBlock.tsx` | Presentación compartida de las dos cifras + explicación + modo "sin ponderar" (D4). |

### Rutas y accesos que **no** cambian

- `lib/enrollments/access.ts:63` sigue llamando a `getEnrollmentsByStudent()`,
  que ahora es **más barato** (sin embed de notas). Es el camino caliente de
  cada página de lección (`requireCourseAccess`), por eso no recibe el RPC
  nuevo (D9).
- `app/cuenta/cursos/[enrollmentId]/evaluaciones/**` usa `getEnrollmentById`
  solo para datos del curso; perder el `total_grade` (que nunca lee) no la
  afecta.
- API REST y MCPs: ninguno consume `total_grade` ni `grade_items` para
  crearlos (verificado con `grep` en `app/api/` y `mcp-servers/*/src`).

## Decisiones de diseño

### D1 — El peso vive en el ítem, como fracción de la nota final

`grade_items.weight numeric(4,3)`, `0 < w ≤ 1`, nullable. Es una fracción de
la nota **final** (no del corte): `0.1` significa "10 % del curso". Se elige
así porque es exactamente como el docente lo formula ("cada nota tiene una
ponderación (0-1) de la nota final") y porque hace que la invariante sea una
sola suma por curso, sin jerarquías. Tres decimales permiten 12.5 % (`0.125`)
sin abrir la puerta a errores de tecleo de precisión arbitraria.

La UI captura la fracción (`0.2`) y la muestra también como porcentaje
(`20 %`) para evitar ambigüedad.

### D2 — `null` = "sin ponderar"; los ítems existentes quedan en `null`

Un ítem con `weight = null` no cuenta en la nota ponderada, y el panel docente
lo marca con la insignia "Sin ponderar" y un aviso global ("Hay N ítems sin
ponderar: no cuentan en la nota a la fecha"). La migración **no** asigna
pesos a los ítems ya existentes en producción: cualquier valor sería
inventado (no hay forma de saber si "Quiz 1" vale 5 % o 20 %). Esto incluye el
ítem `kind = 'self_assessment'`, que se pondera y edita como cualquier otro
(spec-040 solo prohíbe **borrarlo**, `lib/grades/index.ts:59-80`).

Alternativa descartada: `weight not null default 0`. Un 0 "explícito" se
confunde con "este ítem no vale nada a propósito" y además la invariante
`w > 0` sirve para detectar errores de captura.

### D3 — Σ pesos ≤ 1: validada en la server action **y** en la base

- **Server action** (`createGradeItemAction` / `updateGradeItemAction`): lee
  la suma de los demás ítems del curso y, si la nueva suma superaría 1,
  devuelve "La suma de ponderaciones del curso superaría 1.00. Disponible:
  0.40." sin escribir. Es el mensaje que verá el docente en el 99 % de los
  casos.
- **Trigger** `enforce_grade_items_weight_sum` (`before insert or update of
  weight`): es la garantía real. Hace falta porque hay escrituras que no pasan
  por la UI: el docente puede escribir `grade_items` directo por la API REST
  de Supabase (la política `"grade_items: update teacher or admin"` lo
  permite), el RPC `apply_self_assessment_grade` inserta ítems, y dos
  pestañas abiertas pueden pasar la validación de la action a la vez.
  - Toma un `pg_advisory_xact_lock` por `academic_course_id` antes de sumar,
    para serializar escrituras concurrentes del mismo curso (sin lock, dos
    transacciones que suben `0.3` sobre un `0.6` existente pasarían las dos).
    Se usa lock consultivo y no `select … for update` sobre
    `academic_courses` porque este último exige privilegio `UPDATE` en esa
    tabla para el invocante.
  - Es `security definer` para que la suma vea **todos** los ítems del curso
    sin depender de la RLS del invocante.
  - Si `new.weight is null` retorna sin sumar (caso del RPC de
    autoevaluaciones).
  - Lanza `errcode '23514'` con mensaje `grade_items_weight_sum_exceeded` y
    `detail` con el disponible; la action lo traduce al mismo texto que su
    validación previa.
- **Aritmética exacta.** Se usa `numeric` en la base y, en TypeScript,
  enteros (milésimas de peso, centésimas de nota) — nunca `0.1 + 0.2` en
  coma flotante. La comparación es `suma_milésimas ≤ 1000`.

### D4 — Curso sin ninguna ponderación: promedio simple como modo de transición

Si **ningún** ítem del curso tiene peso, el módulo de cálculo devuelve
`mode: 'unweighted'` con el promedio simple de las notas registradas (la
fórmula de hoy) y la UI lo rotula "Promedio simple — tu docente aún no ha
definido el peso de cada nota". En cuanto exista al menos un ítem ponderado,
el curso pasa a `mode: 'weighted'` y los ítems sin peso dejan de contar (con
el aviso de D2).

Por qué: la migración deja todos los ítems en `null` (D2) en mitad del
semestre 2026-2. Sin este modo, todos los estudiantes de producción verían
"—" como nota total el día del despliegue hasta que el docente pondere cada
curso. Con él, el despliegue no cambia nada visible para un curso hasta que
el docente decide ponderarlo. Ver P1 (el usuario puede preferir que no exista
este modo).

### D5 — Nota `null` = "aún no calificado"; un 0 se registra explícitamente

Un ítem sin nota (sin fila en `student_grades` o con `score = null`) no suma
al acumulado ni al denominador del promedio. Si el estudiante no entregó, el
docente registra `0`. La planilla lo explica junto a la tabla ("Celda vacía:
sin calificar todavía, no cuenta. Si el estudiante no entregó, registra 0.").
Es la única semántica que hace que el promedio responda "¿cómo voy en lo que
ya se evaluó?" sin castigar ítems futuros.

### D6 — Un único módulo puro de cálculo

`lib/grades/compute.ts` exporta `computeGradeSummary(items, scores)` donde
`items` es la lista de ítems del curso (`id`, `weight`, `group_id`) más sus
cortes, y `scores` un mapa `grade_item_id → score | null`. No importa nada de
servidor, así que lo usan por igual las consultas de `lib/` y
`GradesTable` (cliente, recálculo en vivo). Reemplaza las cuatro copias
listadas en "Contexto". spec-056 D2 dejó la duplicación a propósito para no
ampliar su scope; este spec es el que cambia la fórmula, así que es el
momento de unificarla.

Fórmulas (todo en enteros: `s` = nota en centésimas, `w` = peso en
milésimas; redondeo final **mitad hacia arriba** a 2 decimales, igual que
`round(numeric, 2)` de Postgres que usan los RPCs de propagación):

- `weight_defined = Σ w` de ítems con peso.
- `weight_graded = Σ w` de ítems con peso **y** nota.
- `accumulated = Σ(s × w) / 1000` → centésimas → 0–5. `null` si
  `weight_graded = 0`.
- `projected = Σ(s × w) / weight_graded` → centésimas → 0–5. `null` si
  `weight_graded = 0`.
- Por corte: `group.weight = Σ w` de sus ítems; `group.grade = Σ(s × w) /
  Σ(w con nota)` dentro del corte; `group.is_complete = true` solo si todos
  sus ítems ponderados tienen nota; `group.grade = null` si ninguno la tiene.
  Ítems sin peso dentro de un corte no cuentan (aviso de D2).
- Ítems sin corte cuentan igual en `accumulated` y `projected`.

Ejemplo de la petición: 3 ítems de `0.2` con `4.0` → `accumulated = 2.40`,
`projected = 4.00`, `weight_graded = 0.60`.

Nota: el acumulado se calcula con las notas de ítem, no con las notas de
corte redondeadas. La plataforma institucional calculará su definitiva con
las notas de corte que se le suban; puede diferir en ±0.01 por redondeo. Se
documenta en la vista "Por corte".

### D7 — Contrato `GradeSummary` y reemplazo de `total_grade`

```ts
interface GradeGroupSummary {
  group_id: string;
  name: string;
  order_index: number;
  weight: number;          // Σ pesos de sus ítems (derivado, no almacenado)
  weight_graded: number;
  grade: number | null;    // 0–5
  is_complete: boolean;
}

interface GradeSummary {
  mode: "weighted" | "unweighted";
  accumulated: number | null;   // "Llevas X de 5"
  projected: number | null;     // "Promedio en lo evaluado"; en 'unweighted', promedio simple
  weight_defined: number;       // 0–1
  weight_graded: number;        // 0–1
  unweighted_item_count: number;
  groups: GradeGroupSummary[];
}
```

`total_grade: number | null` se **reemplaza** (no se conserva al lado) por
`grade_summary: GradeSummary` en todos los tipos. Cambiar el nombre es
deliberado: el compilador señala cada consumidor (inventario completo en
"Impacto en el sistema") y ninguno queda mostrando el promedio simple por
olvido.

### D8 — Matrículas retiradas: RPC acotado, cálculo en TypeScript

Con pesos, el total de un retirado necesita `grade_items.weight`, que la RLS
le niega (`e.status = 'active'`, `20260625000004_rls_academic.sql:105`). Se
crea `get_own_enrollment_grade_lines(p_enrollment_ids uuid[])`:
`security definer`, `stable`, devuelve una fila por **ítem del curso** (left
join a `student_grades`) con `(enrollment_id, grade_item_id, weight, score)`,
filtrando `e.student_id = auth.uid()`. No devuelve nombres de ítems ni
cortes (se mantiene el criterio de spec-056 D4: el retirado ve solo su nota
a la fecha, sin desglose). El RPC **no calcula**: el cálculo sigue en
`compute.ts` (D6), para no duplicar la fórmula en SQL.

Alternativa descartada: relajar `"grade_items: select"` para incluir
matrículas retiradas. Cambia una política que hoy sostiene otros supuestos
(spec-056 D4 se apoya en ella) y expondría también nombres y cortes; el RPC
expone lo mínimo.

`grant execute … to authenticated`; `revoke … from public, anon`.

### D9 — `getEnrollmentsByStudent` deja de calcular notas

`getEnrollmentsByStudent()` es el camino caliente del control de acceso a
cada lección (`lib/enrollments/access.ts:63`) y hoy ya paga un embed de
`student_grades` que ese llamador no usa. Si además llamara al RPC de D8,
cada visita a una lección sumaría una ida y vuelta. Se separa:

- `getEnrollmentsByStudent()` → solo matrículas + curso público (sin notas).
- `getEnrollmentsWithGradesByStudent()` → lo anterior + `grade_summary` vía
  el RPC de D8, en **una** llamada para todas las matrículas. Lo usan
  `app/cuenta/cursos/page.tsx` y `lib/grades/overview.ts` (para retirados).
- `getEnrollmentById()` deja de calcular nota: su `total_grade` no tiene
  consumidores (verificado: las páginas de `evaluaciones/` solo leen el curso;
  `EnrollmentDetail` usa `getGradesByEnrollment`).

### D10 — Color verde/rojo sobre el promedio, no sobre el acumulado

La regla `>= 3` (`CourseGradesCard.tsx:53`, `EnrollmentDetail.tsx:114`) se
aplica al **promedio en lo evaluado** (o al promedio simple en modo
`unweighted`). El acumulado se pinta en color neutro: en la semana 3 un
estudiante con todo en 5.0 lleva 1.00 de 5, y pintarlo de rojo comunicaría
"vas perdiendo" cuando va perfecto. Cuando `weight_graded = 1` (curso
completamente evaluado) ambas cifras coinciden y la UI rotula la cifra como
"Nota final".

### D11 — Vista "Por corte" para la plataforma institucional

La planilla gana un selector de vista:

- **Por ítem** (por defecto, editable): encabezado de dos filas (corte →
  ítems del corte), ítems sin corte al final, columnas Acumulado y Promedio.
- **Por corte** (solo lectura): una fila por estudiante activo, ordenada por
  nombre; una columna por corte con su nota 0–5 (2 decimales) y una marca
  "incompleto" cuando corresponda; columnas Acumulado y Promedio. Cada
  encabezado de corte tiene un botón "Copiar columna" que copia las notas al
  portapapeles, una por línea, en el orden de la tabla, para pegarlas en la
  plataforma institucional. Ítems sin corte se listan en un aviso ("N ítems
  sin corte: cuentan en el total pero no en ninguna nota institucional").

Es lo que hace operativo el flujo del docente: el primer momento sube
"Nota 1", "Nota 2", "Nota 3" (3 × 0.2) y el segundo "Nota 4", "Nota 5"
(2 × 0.2). El separador decimal, el número de decimales y el orden de los
estudiantes dependen de la plataforma institucional (P2).

### D12 — Cortes: tabla propia, peso derivado, borrado no destructivo

`grade_groups (id, academic_course_id, name, order_index, created_at)` y
`grade_items.group_id` nullable. El peso del corte **no se almacena**: es
`Σ weight` de sus ítems, así no hay dos fuentes de verdad que puedan
divergir. La FK compuesta `(group_id, academic_course_id)` impide asignar un
ítem a un corte de **otro** curso sin necesidad de trigger, y
`on delete set null (group_id)` (Postgres ≥ 15) hace que borrar un corte deje
sus ítems "sin corte" conservando pesos y notas. El borrado de corte pide
confirmación en la UI.

RLS: espejo de `grade_items` — select para docente dueño, estudiantes
**activos** y admin; insert/update/delete para docente dueño y admin.

### D13 — Autorización en las actions: mismo patrón que hoy

Las actions de cortes siguen el patrón existente de `lib/grades/actions.ts`
(`requireUser()` + cliente de sesión, la RLS decide). A diferencia de
`updateGradeItem` (que hoy devuelve `null` en silencio si la RLS deniega,
`lib/grades/index.ts:45-57`), las mutaciones nuevas usan
`.select("id").maybeSingle()` para distinguir "0 filas" de un guardado real,
como `reactivateEnrollment` (`lib/enrollments/index.ts:254-268`).

## Evaluación MCP

**¿Aplica MCP?** No.

- `assignment-mcp` solo **referencia** un `grade_item_id` existente al crear
  o actualizar un grupo de evaluación
  (`mcp-servers/assignment-mcp/src/tools.ts:102,204` →
  `lib/assignments/service.ts:39`); no crea ni edita ítems de calificación.
  Agregar `weight` y `group_id` a `grade_items` no cambia ese contrato: el
  agente sigue pasando el UUID y la propagación de notas
  (`propagate_submission_grade`) no lee pesos.
- No existe API REST de `grade_items` ni de notas (`app/api/` no las
  expone), así que no hay transporte que un MCP pudiera envolver sin crear
  primero un dominio de API nuevo.
- La necesidad del docente ("subir las notas a la plataforma institucional")
  se cubre con la vista "Por corte" de la planilla (D11), que es una tarea
  manual en una UI externa; un agente no la ejecutaría.
- Ningún system prompt de `docs/mcps/` describe nota total ni ponderación.

Candidato futuro (registrado como **DEBT-096** en `docs/specs/backlog.md`):
una herramienta de solo lectura `get_course_grade_summary` (notas por corte,
acumulado y promedio por estudiante) si algún agente docente necesita
consultar el estado de notas de un curso.

## DDL propuesto (diseño — **no aplicar en esta fase**)

> Guía para la Fase 1. Nombres con timestamp posterior a
> `20261019000001_add_claim_code_run.sql`. Verificar la versión de Postgres
> de `nodo-dev` y producción (`select version();`) antes de usar
> `on delete set null (group_id)`, que requiere Postgres ≥ 15.

### `20261020000000_init_grade_groups.sql`

```sql
create table public.grade_groups (
  id                  uuid        primary key default gen_random_uuid(),
  academic_course_id  uuid        not null references public.academic_courses(id) on delete cascade,
  name                text        not null check (length(btrim(name)) > 0),
  order_index         smallint    not null default 0,
  created_at          timestamptz not null default now(),

  constraint grade_groups_course_name_unique unique (academic_course_id, name),
  -- Soporta la FK compuesta de grade_items (spec-059 D12).
  constraint grade_groups_id_course_unique unique (id, academic_course_id)
);

create index on public.grade_groups (academic_course_id, order_index);
```

### `20261020000001_rls_grade_groups.sql`

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

### `20261020000002_add_weight_and_group_to_grade_items.sql`

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

### `20261020000003_get_own_enrollment_grade_lines_rpc.sql`

```sql
-- spec-059 D8: el estudiante (activo o retirado) obtiene los pares
-- (peso, nota) de SUS matrículas para calcular la nota a la fecha en
-- TypeScript. No expone nombres de ítems ni cortes.
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

## Fases de implementación

### Fase 1 — Esquema
- [ ] Verificar la versión de Postgres en `nodo-dev` y producción (D12).
- [ ] Crear las cuatro migraciones del "DDL propuesto".
- [ ] `supabase db push --db-url "$DEV_DB_URL" --dry-run`, mostrar la salida
      al usuario y, con su visto bueno, aplicar en `nodo-dev` (**nunca**
      `--linked`).
- [ ] Verificar en `nodo-dev`: `weight` y `group_id` existen; `grade_groups`
      tiene RLS y `GRANT`s; el trigger rechaza `0.6 + 0.5`; asignar un ítem a
      un corte de otro curso falla por FK; borrar un corte deja `group_id`
      en `null` sin tocar `academic_course_id`.
- [ ] Regenerar/ajustar tipos de Supabase si el proyecto los versiona.

### Fase 2 — Módulo puro de cálculo
- [ ] Crear `lib/grades/compute.ts` con `computeGradeSummary` (D6) y los tipos
      `GradeSummary` / `GradeGroupSummary` (D7) en `lib/grades/types.ts`.
- [ ] Aritmética entera (milésimas × centésimas) y redondeo mitad hacia
      arriba; modo `unweighted` (D4).
- [ ] Confirmar que el módulo no importa nada de servidor (lo consume
      `GradesTable`, cliente).

### Fase 3 — Capa de datos y acciones
- [ ] `lib/grades/types.ts` y `lib/enrollments/types.ts`: `weight`,
      `group_id`, `GradeGroup`, reemplazo de `total_grade` por
      `grade_summary` (D7), `EnrollmentWithCourseAndGrades` (D9).
- [ ] `lib/grades/index.ts`: borrar `computeTotalGrade`; ítems y cortes en las
      lecturas; `weight`/`group_id` en create/update; CRUD de cortes (D13).
- [ ] `lib/grades/schemas.ts`: `weight`, `group_id`, `GradeGroupSchema`.
- [ ] `lib/grades/actions.ts`: validación de suma con disponible (D3),
      traducción del error `grade_items_weight_sum_exceeded`, acciones de
      cortes con `revalidatePath` de la planilla.
- [ ] `lib/enrollments/index.ts`: borrar `computeTotalGrade`; separar
      `getEnrollmentsByStudent` / `getEnrollmentsWithGradesByStudent` (D9);
      `getEnrollmentById` sin nota; `getEnrollmentsByAcademicCourse` con
      `grade_summary`.
- [ ] `lib/grades/overview.ts`: borrar la copia; cortes en cursos activos;
      retirados vía `getEnrollmentsWithGradesByStudent` (D8).
- [ ] `npm run lint` y `npm run build` sin errores (el renombre de D7 debe
      hacer fallar el build hasta que la Fase 4 y 5 actualicen cada
      consumidor; se cierran juntas).

### Fase 4 — UI docente
- [ ] Leer `DESIGN.md`. Tokens semánticos y tabla claro/oscuro; Flowbite
      primero (inputs numéricos, `select`, badges, tabs/segmented control).
- [ ] `GradeItemsPanel`: peso y corte por ítem (incluido el de
      autoevaluaciones), resumen de ponderación, insignia "Sin ponderar",
      aviso global, sección "Cortes" con peso derivado.
- [ ] `GradesTable`: recálculo con `compute.ts`; vista "Por ítem" con
      encabezado agrupado; vista "Por corte" con "Copiar columna" e
      "incompleto" (D11); columnas Acumulado y Promedio; texto de ayuda de D5.
- [ ] `grades/page.tsx`: cargar y pasar cortes.
- [ ] `EnrollmentTable`: acumulado y promedio.

### Fase 5 — UI del estudiante
- [ ] Componente `GradeSummaryBlock` (dos cifras + explicación + modo
      `unweighted` + "Nota final" cuando `weight_graded = 1`, color según D10).
- [ ] `CourseGradesCard` y `EnrollmentDetail`: ítems agrupados por corte con
      su peso, nota por corte con "incompleto", `GradeSummaryBlock`.
- [ ] `EnrolledCourseList` y `app/cuenta/cursos/page.tsx`: promedio como cifra
      principal, acumulado secundaria.
- [ ] `GradesOverview` (retirados): acumulado y promedio.

### Fase 6 — Pruebas
- [ ] Ejecutar con el usuario los casos de
      `docs/testing/test-059-ponderacion-notas-y-nota-a-la-fecha.md`.
- [ ] Cuando exista framework de testing, implementar los casos automáticos
      descritos en "Pruebas asociadas" (en particular, los del módulo puro).

### Fase 7 — Despliegue (solo con confirmación explícita del usuario)
- [ ] `git diff --stat origin/main..HEAD -- supabase/` debe listar solo las
      cuatro migraciones de este spec.
- [ ] `supabase db push --linked --dry-run` (**obligatorio**), mostrar la
      salida al usuario y aplicar solo si lista exactamente esas cuatro.
- [ ] Verificar en producción por REST que `grade_items.weight` existe (un
      `42703` significa que no se aplicó).
- [ ] Tras el despliegue, el docente pondera sus cursos en curso; hasta
      entonces, cada curso sigue en promedio simple (D4).

## Criterios de aceptación

1. El docente puede asignar a cada ítem de calificación un peso entre 0 y 1
   (hasta 3 decimales) o dejarlo sin ponderar, y asignarlo a un corte o a
   ninguno.
2. Si un peso nuevo o editado haría que la suma del curso supere 1.00, la
   acción se rechaza con un mensaje que indica el peso disponible, y el ítem
   no cambia.
3. La base rechaza una suma > 1 aunque la escritura no pase por la UI (REST
   directo o dos escrituras concurrentes).
4. El panel muestra la ponderación definida ("0.60 / 1.00") y el disponible, y
   advierte los ítems sin ponderar.
5. Para un estudiante con notas 4.0 en tres ítems de 0.2 (y el resto sin
   nota), la planilla, "Mis notas" y el detalle de matrícula muestran
   Acumulado 2.40 y Promedio en lo evaluado 4.00.
6. Una celda vacía no cuenta en ninguna de las dos cifras; un 0 registrado sí.
7. El docente puede crear, renombrar, reordenar y eliminar cortes; el peso de
   un corte es la suma de los pesos de sus ítems; eliminar un corte deja sus
   ítems sin corte con pesos y notas intactos.
8. La vista "Por corte" muestra, por estudiante, la nota 0–5 de cada corte,
   marca "incompleto" si algún ítem ponderado del corte no tiene nota, y
   permite copiar una columna completa.
9. El ítem de autoevaluaciones se puede ponderar y asignar a un corte como
   cualquier otro, y sigue sin poder eliminarse.
10. En un curso sin ningún ítem ponderado, todas las vistas muestran el
    promedio simple rotulado como tal (sin regresión respecto a hoy).
11. Un estudiante retirado ve en "Cursos retirados" su acumulado y su promedio
    calculados con pesos, sin desglose de ítems.
12. El color verde/rojo se aplica al promedio en lo evaluado, no al acumulado.
13. No queda ninguna implementación de la nota total fuera de
    `lib/grades/compute.ts` (`grep -rn "computeTotal" lib components app`
    vacío).
14. Las páginas de lección no hacen consultas de notas para el control de
    acceso (`getEnrollmentsByStudent` sin embed de `student_grades`).

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").

- **Manuales:** `docs/testing/test-059-ponderacion-notas-y-nota-a-la-fecha.md`
  — casos `TC-059-01` a `TC-059-14` (solo flujos con UI; no aplica
  `TC-MCP`).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-059-ponderacion-notas-y-nota-a-la-fecha.spec.ts`
  — se crea cuando exista framework de testing (CLAUDE.md, "Testing").
  Casos a cubrir, todos en rojo desde el inicio:

  **Unitarias de `computeGradeSummary` (criterios 5, 6, 10, 13):**
  - Tres ítems de 0.2 con 4.0 → `accumulated 2.40`, `projected 4.00`,
    `weight_graded 0.6`.
  - Ítem ponderado con nota `null` → no cambia `accumulated` ni el
    denominador de `projected`.
  - Ítem ponderado con nota `0` → baja `projected`.
  - Ningún ítem con nota → `accumulated null`, `projected null`.
  - Ningún ítem ponderado → `mode 'unweighted'`, `projected` = promedio
    simple, `accumulated null`.
  - Ítem sin peso en un curso ponderado → excluido; `unweighted_item_count`
    correcto.
  - Corte con un ítem sin nota → `is_complete false`, `grade` sobre lo
    calificado; corte sin notas → `grade null`.
  - Ítems sin corte → cuentan en `accumulated`/`projected`, no en `groups`.
  - Precisión: `0.1 + 0.2` como pesos suma exactamente `0.3`; redondeo
    mitad hacia arriba (p. ej. `0.2 / 0.3 = 0.6667 → 0.67`; caso borde
    `x.xx5`).
  - Cálculo de "disponible" para la validación: `1 - Σ` exacto.

  **Integración / base (criterios 2, 3, 7, 11):**
  - Insertar/actualizar un ítem que lleva la suma a 1.001 → `23514`
    `grade_items_weight_sum_exceeded`.
  - Dos transacciones concurrentes de `0.3` sobre `0.6` → solo una confirma.
  - `apply_self_assessment_grade` crea el ítem de autoevaluaciones con la
    suma del curso ya en 1.00 → no falla (peso `null`).
  - Asignar `group_id` de un corte de otro curso → error de FK.
  - Borrar un corte → ítems con `group_id null`, `weight` y notas intactas.
  - `get_own_enrollment_grade_lines` con el `enrollment_id` de **otro**
    estudiante → 0 filas; con el propio retirado → filas con pesos.
  - RLS de `grade_groups`: estudiante activo lee, retirado no, docente ajeno
    no escribe.

  **e2e (criterios 1, 4, 8, 12):** flujos de `TC-059-01`, `-04`, `-06`,
  `-09`.

## Preguntas abiertas para el usuario

> No bloquean la redacción; conviene resolverlas al aprobar el spec.

- **P1 — Modo de transición (D4).** ¿Aceptas que un curso sin ninguna
  ponderación siga mostrando el promedio simple (rotulado), o prefieres que
  muestre "—" hasta que se pondere?
- **P2 — Formato para la plataforma institucional (D11).** ¿Cuántos decimales
  acepta (1 o 2)? ¿Separador decimal coma o punto? ¿En qué orden lista a los
  estudiantes (apellido, nombre, documento)? Hoy el perfil solo tiene
  `full_name`; si la plataforma ordena por apellido, "Copiar columna" puede no
  coincidir fila a fila.
- **P3 — Peso objetivo por corte.** Hoy el peso del corte es derivado (D12).
  ¿Te sirve declarar "Nota 1 = 0.20" y que la UI avise si sus ítems suman
  otra cosa (p. ej. 0.15)? Añadiría `grade_groups.target_weight`.
- **P4 — Ítem de autoevaluaciones desde el día 1.** El RPC de spec-040 crea
  ese ítem solo con la primera autoevaluación respondida, así que no se puede
  ponderar antes. ¿Quieres un botón "Reservar ítem de autoevaluaciones" en el
  panel (fuera de este alcance hoy)?
- **P5 — Visibilidad del corte incompleto al estudiante.** ¿El estudiante debe
  ver la nota de un corte aún incompleto (con la marca) o solo cuando está
  completo?

## Riesgos

- **Cambio de cifra visible en producción.** En cuanto el docente pondera un
  curso, la nota de cada estudiante cambia de promedio simple a ponderada.
  Avisar a los estudiantes al ponderar.
- **Renombre de `total_grade` (D7).** Rompe el build hasta tocar todos los
  consumidores; las fases 3–5 se cierran juntas, no se despliegan por
  separado.
- **`on delete set null (column)`** depende de Postgres ≥ 15 (verificar en
  Fase 1). Si no estuviera disponible: FK simple a `grade_groups(id)` +
  trigger de "mismo curso".

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{fecha}}
