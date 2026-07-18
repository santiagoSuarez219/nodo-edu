# spec-009 — Progreso de lección y cierre ("completar lección")

> **Estado:** `[DONE]` — Implementación completada, pruebas manuales aprobadas (TC-009-01 a TC-009-09), revisión de código ejecutada y hallazgos corregidos.

Este es el **primero de tres specs** que descomponen la "estructura interactiva
de la lección" prometida en la nota de continuidad de
`spec-006-lecciones-privadas-navbar`. Le siguen:

- **spec-010 — Asistencia por sesión con código** (dominio nuevo; roster docente).
- **spec-011 — Preguntas embebidas en MDX / autoevaluación de cierre** (frontera
  con el track de evaluaciones por definir).

El "formulario de cierre de lección" se materializa aquí como un contenedor UI
(`LessonClosure`) que en spec-009 solo alberga el botón "Completar lección";
spec-010 y spec-011 le añadirán secciones (asistencia, autoevaluación) sin
reescribirlo.

> **Nota de numeración:** se numeró `009` porque, al momento de redactar este spec, el
> track de evaluaciones ya reservaba 005–008 (`spec-005-question-bank` `[DONE]`,
> `spec-006/007/008-assignment-*` planificados) y el track de lecciones ocupó el 006
> (`spec-006-lecciones-privadas-navbar` `[DONE]`), colisionando ambos en el número 006.
> 009 fue el primer número libre en ese momento. Esa colisión se resolvió después
> renumerando el track de evaluaciones planificado a `spec-018/019/020-assignment-*`
> (ver `docs/specs/backlog.md`); esta nota se conserva como registro histórico de la
> numeración original.

---

## Contexto

`spec-006-lecciones-privadas-navbar` cerró el acceso al contenido: solo el
estudiante con matrícula activa (o el docente dueño / admin) lee las lecciones,
mediante `requireCourseAccess` en los 3 Server Components de curso. La plataforma
es **herramienta de apoyo de una clase síncrona**, por lo que la lección necesita
un *cierre* explícito: el estudiante marca cuándo terminó de estudiarla y el
sistema refleja su avance en el curso.

La infraestructura de datos **ya existe parcialmente**: la tabla `lesson_progress`
(con RLS) y las lecturas `getLessonProgress` / `getCourseProgress` están
construidas desde el inicio del proyecto, junto con `markLessonViewed`. Sin
embargo, **ninguna de esas funciones se invoca todavía** en la app: hoy no se
escribe ni `viewed_at` ni `completed_at`. Falta el eslabón de cierre: registrar
la visita al abrir la lección, **escribir `completed_at`** mediante un botón
"Completar lección" visible para el estudiante, y reflejar el progreso en la
navegación (sidebar de lecciones y hub de cursos). Este spec entrega ese cierre
y crea el contenedor UI de fin de lección sobre el que spec-010 y spec-011
añadirán asistencia y preguntas.

---

## Alcance

### Incluye

- Server Action `markLessonCompleted(courseSlug, lessonSlug)` que escribe
  `completed_at`, verificando acceso con `hasCourseAccess` antes de escribir
  (defensa en profundidad sobre la RLS).
- Server Action `markLessonUncompleted(courseSlug, lessonSlug)` (des-marcar) para
  corregir un click accidental — `completed_at = null`.
- Enganchar `markLessonViewed` al abrir una lección (registro de `viewed_at`),
  que hoy no se dispara.
- Componente contenedor de cierre `LessonClosure` (client island) al final de
  `[lessonSlug]/page.tsx`, visible **solo** para `reason === "enrolled"`. En esta
  primera entrega contiene únicamente el botón completar / estado "completada".
- Reflejo del progreso en la UI existente:
  - `LessonSidebar` / `LessonSidebarItem`: indicador (check) de lección completada.
  - `app/cuenta/cursos/[enrollmentId]/page.tsx`: contador "X de N lecciones
    completadas".
- Las lecciones **placeholder** (sin `articleSlug`/apuntes MDX) **también pueden
  marcarse como completadas** (decisión del usuario: coherente con el modelo de
  clase síncrona — el estudiante pudo asistir aunque los apuntes no estén
  publicados).

### No incluye

- Código de asistencia por sesión y roster docente → **spec-010**.
- Preguntas embebidas en MDX y formulario de autoevaluación de cierre → **spec-011**.
- Barra de progreso global del curso en la home pública de curso (más allá del
  contador simple) → futuro.
- Vista de progreso agregado del docente ("qué % del grupo completó la lección X")
  → se evaluará junto con spec-010 (roster) o como spec posterior.
- Gamificación, rachas, certificados.
- Refactor de componentes vecinos que usan paleta cruda en lugar de tokens de
  `DESIGN.md` (deuda preexistente; las piezas *nuevas* de este spec sí usan tokens).

---

## Dependencias

- **spec-002 `[DONE]`** — auth, `getCurrentUser`, roles.
- **spec-003 `[DONE]`** — `academic_courses`, `enrollments`.
- **spec-006-lecciones-privadas-navbar `[DONE]`** — `hasCourseAccess` /
  `requireCourseAccess` con resultado discriminado `reason`, gate en los 3 Server
  Components de curso.
- Infra preexistente: tabla `lesson_progress` + RLS
  (`20260623000001_init_lesson_progress.sql`, `20260623000002_rls_policies.sql`),
  módulo `lib/progress/index.ts`.

---

## Impacto en el sistema

### Base de datos / RLS

- **Sin migración nueva.** `lesson_progress` ya existe con las 4 políticas
  necesarias: `select own or admin`, `insert own`, `update own`, `delete own`.
  Escribir `completed_at` es un `upsert`/`update` sobre la fila propia, ya
  permitido por `insert own` / `update own`.
- Nota de RLS: las políticas solo verifican `auth.uid() = user_id`; **no**
  verifican matrícula activa. Un estudiante retirado podría, en teoría, escribir
  progreso. Por eso la Server Action antepone `hasCourseAccess` (Decisión 2). No
  se refuerza en RLS para no introducir migración (Opción A de
  spec-006-Decisión 3).

### Módulos `lib/`

- `lib/progress/index.ts` — **añadir**:
  - `markLessonCompleted(courseSlug, lessonSlug)`: `getCurrentUser` →
    `hasCourseAccess(courseSlug)` (guard; si `!ok`, no-op/return) → `upsert` con
    `completed_at = now()` → `revalidatePath` de la lección y de `/cuenta/cursos`.
  - `markLessonUncompleted(courseSlug, lessonSlug)`: mismo guard y revalidación,
    `completed_at = null`.
  - `getCourseProgressSummary(courseSlug)` (o derivarlo en el consumidor) →
    `{ completed: number; total: number }`.
- `lib/progress/types.ts` — sin cambios (`LessonProgress` ya modela
  `completed_at: string | null`). Posible tipo auxiliar `CourseProgressSummary`.
- `lib/enrollments/access.ts` — sin cambios; se consume `hasCourseAccess` tal cual
  (memoizado con `cache()`).

### Rutas / Server Components

- `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` — tras el gate: invocar
  `markLessonViewed` (registro de visita), resolver `hasCourseAccess` (ya
  memoizado) para conocer `reason`, y `getLessonProgress` para el estado inicial;
  montar `<LessonClosure>` al final (después de `MdxContent`, junto a
  `LessonPagination`) **solo si `reason === "enrolled"`**.
- `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx` — pasar el mapa de progreso
  del curso (`getCourseProgress`) al `LessonSidebar` para pintar los checks. (El
  layout ya hace el gate; añade una lectura.)
- `app/cuenta/cursos/[enrollmentId]/page.tsx` — mostrar contador "X de N
  completadas" usando `getCourseProgress(course_slug)` y el total de lecciones
  (`getCourseBySlug().lessons.length`).

### Componentes

- **Nuevo** `components/courses/LessonClosure.tsx` (`"use client"`) — contenedor
  del cierre. Recibe `courseSlug`, `lessonSlug`, `initialCompletedAt`. Renderiza
  el botón "Completar lección" / estado "Lección completada el …" y llama a las
  Server Actions; usa `useTransition` + `router.refresh()` para reflejar el
  cambio. Diseñado como contenedor con "secciones" para que spec-010/011 inserten
  asistencia/autoevaluación sin reescribirlo.
- `components/courses/LessonSidebar.tsx` / `LessonSidebarItem.tsx` — aceptar un
  `Set<string>` de `lesson_slug` completadas y pintar un check en los ítems
  correspondientes. Cambio aditivo de props.
- Las piezas nuevas usan **tokens semánticos de `DESIGN.md`** (`--color-success`
  para el check/estado completado, `--color-brand` para el botón), no la paleta
  cruda.

### Componentes UI

- Botón: Flowbite primero (botón + estado). Icono de check consistente con los ya
  usados en el panel admin.

---

## Evaluación MCP

**¿Aplica MCP?** No.

Justificación según los criterios de `CLAUDE.md`:

- *¿Expone datos que un agente consultaría?* El progreso es autoseguimiento del
  estudiante; el valor para un agente (p. ej. "quién completó la lección X")
  pertenece a una vista agregada del docente que este spec **no** incluye (queda
  para spec-010/posterior). Sin ese agregado, no hay dato nuevo que un agente
  docente necesite.
- *¿Permite acciones que un agente ejecutaría?* No: "completar lección" es una
  acción personal del estudiante en sesión; no tiene sentido que un agente la
  ejecute por él.
- *¿Existe un MCP relacionado que extender?* Existe `question-bank-mcp`, pero su
  dominio (preguntas) es ajeno al progreso; su extensión se evalúa en spec-011.
- *¿Hay un agente en `docs/mcps/` que se beneficie?* El agente docente del
  `question-bank-mcp` no consume progreso.

No se añade fase de MCP. Se reevaluará en spec-010, cuando exista roster/asistencia
(sí candidato a lectura por agente).

---

## Decisiones de arquitectura

### Decisión 1 — Escritura vía Server Actions, no API routes

`markLessonCompleted` / `markLessonUncompleted` son Server Actions en
`lib/progress/` (`"use server"`, patrón ya usado por `markLessonViewed`).
Coherente con `CLAUDE.md` ("preferir server actions", "no `useEffect` para
fetch"). El island cliente `LessonClosure` las invoca directamente; no se crea
endpoint HTTP. `revalidatePath` refresca sidebar y hub tras la mutación.

### Decisión 2 — La Server Action verifica acceso antes de escribir (Opción A, no RPC)

La RLS de `lesson_progress` solo comprueba `user_id = auth.uid()`, no matrícula.
Para que un estudiante retirado no acumule progreso, la acción antepone
`hasCourseAccess(courseSlug)` (memoizado con `cache()`, una consulta por request).
La frecuencia es **baja** (un click por lección), así que **no** se justifica la
"Opción B" (RPC `security definer has_course_access`) anotada en
spec-006-Decisión 3: seguimos con la Opción A (cero migración, menor blast
radius). Se deja anotado que si spec-011 introduce verificación por-pregunta de
alta frecuencia, ese será el momento de reevaluar la Opción B.

### Decisión 3 — El botón solo existe para `reason === "enrolled"`

Se usa el resultado discriminado de `hasCourseAccess` (previsto en la "Nota de
continuidad" de spec-006). Estudiante matriculado: ve y usa el botón. Owner/admin:
ven la lección para revisarla, pero **no** un botón de "completar" (no forman
parte del grupo que cursa). Esto mantiene el progreso semánticamente limpio (solo
estudiantes generan filas de progreso "de estudiante").

### Decisión 4 — `LessonClosure` como contenedor extensible

`LessonClosure` se diseña desde ya como el contenedor del "cierre de lección" con
secciones componibles, aunque en spec-009 solo albergue el botón completar.
spec-010 insertará la sección "asistencia" y spec-011 la sección "autoevaluación"
**sin reescribir** el contenedor ni el punto de montaje en `page.tsx`. Fija el
contrato de props temprano (`courseSlug`, `lessonSlug`, estado de progreso).

### Decisión 5 — Idempotencia, des-marcado y lecciones placeholder

`markLessonCompleted` hace `upsert` idempotente; `markLessonUncompleted` permite
corregir un click accidental. `viewed_at` no se pisa al completar. Las lecciones
sin `articleSlug` (placeholder "en preparación") **se pueden completar igual**
(decisión del usuario): el modelo síncrono prioriza el registro de avance del
estudiante sobre la existencia de los apuntes.

---

## Fases de implementación

### Fase 1 — Dominio de progreso (writer de completado)

- [x] Añadir `markLessonCompleted(courseSlug, lessonSlug)` a `lib/progress/index.ts`:
      `getCurrentUser` → `hasCourseAccess` (guard) → `upsert` con
      `completed_at = now()` → `revalidatePath` de la lección y `/cuenta/cursos`.
- [x] Añadir `markLessonUncompleted(courseSlug, lessonSlug)` (`completed_at = null`,
      mismo guard y revalidación).
- [x] Añadir `getCourseProgressSummary(courseSlug)` → `{ completed, total }`
      (o derivarlo en el consumidor a partir de `getCourseProgress`).

**Verificación:** las acciones escriben/borran `completed_at` solo para el usuario
con acceso; un usuario sin acceso no genera filas.

### Fase 2 — Contenedor de cierre en la lección

- [x] Crear `components/courses/LessonClosure.tsx` (`"use client"`) con botón
      "Completar lección" / estado "Completada el …", `useTransition` +
      `router.refresh()`, tokens de `DESIGN.md`.
- [x] En `[courseSlug]/[lessonSlug]/page.tsx`: invocar `markLessonViewed`; obtener
      `reason` (`hasCourseAccess`) y `getLessonProgress`; montar `<LessonClosure>`
      al final solo si `reason === "enrolled"`.

**Verificación:** el estudiante completa/des-marca y ve el cambio sin recargar
manualmente; owner/admin no ven el botón; abrir la lección registra `viewed_at`.

### Fase 3 — Reflejo del progreso en navegación

- [x] `LessonSidebar` + `LessonSidebarItem`: aceptar el set de lecciones
      completadas y pintar check; alimentarlo desde `layout.tsx` con
      `getCourseProgress`.
- [x] `app/cuenta/cursos/[enrollmentId]/page.tsx`: mostrar "X de N completadas".

**Verificación:** completar una lección actualiza el check del sidebar y el
contador del hub.

### Fase 4 — Verificación final

- [x] `npm run build` y `npm run lint` sin errores.
- [ ] Recorrer las pruebas manuales `docs/testing/test-009-progreso-leccion.md`.

> Las pruebas manuales (`test-009`) se redactan junto con este spec (test-first).
> El framework e2e está "por definir" en `CLAUDE.md`: las pruebas automáticas se
> describen aquí pero su archivo se crea cuando exista el framework.

---

## Criterios de aceptación

- Un **estudiante matriculado** ve el botón "Completar lección" al final de una
  lección y, al pulsarlo, la lección queda marcada como completada (persistida en
  `lesson_progress.completed_at`).
- El estudiante puede **des-marcar** una lección completada.
- El **check de completada** aparece en el `LessonSidebar` y el contador "X de N"
  en el hub de cursos, y se actualizan sin recarga manual.
- El **docente dueño / admin** no ve el botón "Completar lección".
- Un usuario **sin acceso** al curso no puede crear ni modificar filas de
  progreso (la Server Action lo rechaza aunque la RLS por sí sola no lo cubra).
- Una lección **placeholder** (sin artículo MDX) también puede marcarse como
  completada.
- Abrir una lección registra `viewed_at`.
- El estado se mantiene tras cerrar y reabrir la sesión.
- `npm run build` y `npm run lint` pasan sin errores.

---

## Pruebas asociadas

> Estos archivos se crean junto con el spec (enfoque test-first).

- **Manuales:** `docs/testing/test-009-progreso-leccion.md` — casos `TC-009-*`
  (completar/des-marcar como estudiante, reflejo en sidebar y hub, ausencia del
  botón para owner/admin, placeholder completable, persistencia tras re-login).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-009-progreso-leccion.spec.ts`
  — un caso por criterio de aceptación, en rojo, cuando exista framework.

---

## Riesgos y mitigaciones

- **RLS no verifica matrícula.** `lesson_progress` solo filtra por `user_id`.
  Mitigación: guard `hasCourseAccess` en la Server Action; documentar que la RLS
  no es la única defensa. Reevaluar RPC (Opción B) solo si aparece alta frecuencia.
- **`router.refresh()` vs revalidación.** Doble refresco puede parpadear.
  Mitigación: `revalidatePath` en la acción + `useTransition` en el island; evitar
  refetch redundante.
- **Contenedor extensible mal dimensionado.** Si `LessonClosure` no prevé
  secciones, spec-010/011 lo reescriben. Mitigación: fijar el contrato de props
  "por secciones" desde la Fase 2.
- **Deuda de tokens en MDX/sidebar.** Componentes vecinos usan paleta cruda.
  Mitigación: las piezas *nuevas* usan tokens de `DESIGN.md`; no refactorizar lo
  existente en este spec (registrar en `backlog.md` si procede).

---

## Continuidad hacia spec-010 y spec-011

- **spec-010 (asistencia)** insertará una sección de "código de asistencia" dentro
  del `LessonClosure` creado aquí; introducirá dominio nuevo (`class_sessions`,
  `attendance_records`) con migración y RLS propias, y es candidato a MCP de
  lectura (roster) — a evaluar con `@mcp-builder` en su redacción.
- **spec-011 (preguntas embebidas)** añadirá una sección de autoevaluación al
  mismo contenedor; su decisión central es la frontera con el track de
  evaluaciones (`spec-019-assignment-solving`): preguntas *formativas sin nota*
  (reusar el banco de spec-005 en solo lectura) vs. *calificables* (track
  assignment). Definir esa frontera antes de implementar.
