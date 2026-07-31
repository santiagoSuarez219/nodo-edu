# spec-006 — [DONE] Lecciones privadas por matrícula + navbar reorientado

> Al aprobarse el paquete (spec + pruebas) e iniciar la Fase 1, este estado
> pasa a `[IN PROGRESS]`.

Este es el **Spec A** de una funcionalidad partida en dos (ver spec-007, aún
por redactar). Su alcance se limita al control de acceso al contenido y a la
navegación; toda la estructura interactiva de la lección (preguntas, cierre,
asistencia, progreso) vive en spec-007 y se apoyará en lo que aquí se define.

---

## Contexto

Hoy el contenido de cursos (home de curso `[courseSlug]/page.tsx` y lecciones
`[courseSlug]/[lessonSlug]/`) es **público**: cualquier visitante lee el MDX sin
sesión ni matrícula. El modelo académico ya existe (`academic_courses`,
`enrollments` con `status`, RLS en `20260625000004_rls_academic.sql`) y el flujo
de matrícula por código está operativo (spec-003, `lib/enrollments/`). Falta
cerrar el círculo: **solo quien tenga una matrícula activa** en un
`academic_course` cuyo `course_slug` apunte al curso de contenido debería leer
sus lecciones. El docente dueño y el admin también.

El alcance de la plataforma en esta fase es ser **herramienta de apoyo de una
clase síncrona**; por eso el contenido deja de ser un blog abierto y pasa a ser
material privado del grupo matriculado.

En paralelo, la `Navbar` conserva 3 enlaces hardcodeados a cursos
(`Estructuras de datos`, `Programación científica`, `Análisis de algoritmos`)
que ya no encajan con el modelo privado: requieren matrícula y varios ni
siquiera tienen contenido. Hay que reorientar la navegación hacia la landing y
dejar un único punto de entrada "Cursos".

---

## Alcance

### Incluye

- Convertir en privadas la home de curso y todas las lecciones: acceso solo con
  matrícula activa vinculada por `academic_courses.course_slug`, o siendo
  docente dueño / admin.
- Un helper de dominio reutilizable (`hasCourseAccess` / `requireCourseAccess`)
  como mecanismo de autorización autoritativo.
- Reorientar `Navbar` (desktop + móvil): quitar los enlaces de curso, dejar
  enlaces a secciones de la landing + un enlace "Cursos".
- Ajustar la estrategia de renderizado (SSG → dinámico) de las rutas afectadas.

### No incluye

- Preguntas embebidas en MDX, formulario de cierre de lección, código de
  asistencia por sesión, botón "completar lección", tracking real de progreso
  (`lesson_progress`), lista de asistencia del docente → **spec-007**.
- Página/ruta dedicada `/cursos` con catálogo navegable de cursos disponibles.
  El enlace "Cursos" apunta por ahora a una sección de la landing.
- Refactor de la `Navbar` a tokens semánticos de `DESIGN.md` (deuda
  preexistente; ver Riesgos).

---

## Dependencias

- **spec-002 `[DONE]`** — auth, `getCurrentUser`, `requireRole`, middleware,
  RLS de `profiles`/`user_roles`, función `has_role`.
- **spec-003 `[DONE]`** — `academic_courses`, `enrollments`, RLS académico y el
  RPC `get_academic_courses_public` (expone `course_slug` y `teacher_id` sin
  filtrar `enrollment_code`). Este spec lo reutiliza sin modificarlo.

---

## Impacto en el sistema

### Rutas / Server Components

- `app/(cursos)/[courseSlug]/page.tsx` — home de curso. Pasa a privada: se le
  añade el gate y deja de ser SSG (quitar `generateStaticParams`).
- `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx` — monta `LessonSidebar`
  (lista de lecciones = estructura del curso). Se le añade el gate.
- `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` — lección (emite el MDX). Se
  le añade el gate y deja de ser SSG (quitar `generateStaticParams`).
- `app/page.tsx` (landing) — se añaden anclas (`id`) a las secciones a las que
  apuntará la navbar.

### Componentes

- `components/navbar/Navbar.tsx` — reemplazar el array `sectionLinks`
  (líneas 10-14) por enlaces a la landing + "Cursos"; reflejarlo en el menú
  desktop (42-53) y móvil (112-123). El bloque de sesión (`UserMenu`/login,
  54-66 y 124-161) **queda intacto**.
- Contenedores de `CourseScroller` / `TeacherBar` en `app/page.tsx` (o los
  propios componentes) — reciben un `id` de ancla. Cambio mínimo, sin lógica.

### Módulos `lib/`

- **Nuevo** `lib/enrollments/access.ts` — `hasCourseAccess(courseSlug)` +
  `requireCourseAccess(courseSlug)`, re-exportados desde `lib/enrollments/index.ts`.
- `lib/courses/index.ts` — `getCourseSlugs` y `getCourseLessonSlugPairs` quedan
  **sin consumidor** al quitar los `generateStaticParams` (verificado: son sus
  únicos usos). No se borran en este spec; se documentan como reservados para un
  futuro `sitemap.ts`.

### Middleware

- `middleware.ts` — **sin cambios** (justificación en Decisión 1).

### RLS / Base de datos

- **Sin migración nueva.** Las policies actuales de `enrollments` (el estudiante
  lee sus propias filas) más el RPC `security definer` `get_academic_courses_public`
  (ya expone `course_slug`) bastan para el acceso del estudiante. Owner y admin
  se resuelven con las policies existentes de `academic_courses` y `has_role`.
  Ver Decisión 3.

---

## Evaluación MCP

**¿Aplica MCP?** No.

Justificación según los criterios de `CLAUDE.md`:

- *¿Expone datos que un agente consultaría?* No: el gate y la navbar son lógica
  interna de autorización y navegación de UI; no introducen un dominio de datos
  nuevo.
- *¿Permite acciones que un agente ejecutaría?* No: no hay operaciones de
  escritura nuevas; la matrícula ya existe y no se amplía aquí.
- *¿Existe un MCP relacionado que extender?* No hay MCPs en el proyecto
  (`docs/mcps/README.md` sin inventario).
- *¿Hay un agente en `docs/mcps/` que se beneficie?* No existe ninguno.

No se añade fase de MCP.

---

## Decisiones de arquitectura

### Decisión 1 — El gate vive en los Server Components (DAL), no en middleware

**Recomendación:** gate autoritativo mediante `requireCourseAccess(courseSlug)`
invocado en cada Server Component que emite contenido del curso. **No**
middleware.

Por qué no middleware:

- El grupo `(cursos)` no aparece en la URL: las rutas reales son `/[courseSlug]`
  y `/[courseSlug]/[lessonSlug]`, que colisionan con **cualquier** path de
  primer nivel. El middleware no puede distinguir barato "¿este slug es un
  curso?" sin un lookup, y `courseSlug` es dinámico.
- La verificación de matrícula es lógica de dominio con consulta a BD;
  ejecutarla en el Edge en cada request del matcher es costoso y duplica lógica.
- El middleware ya cumple el rol de chequeo optimista de sesión para `/cuenta` y
  `/admin`; se deja como está. La autorización real vive en la capa de datos.

Por qué en los Server Components y no solo en un `layout`:

- **El MDX vive en el filesystem, fuera de RLS.** RLS protege tablas, no el
  contenido en disco. El único candado real sobre el MDX es el gate a nivel de
  aplicación → debe estar en el componente que emite el contenido.
- Apoyar la autorización solo en un layout es frágil (los layouts persisten
  entre navegaciones de segmentos hermanos y no siempre re-ejecutan). El chequeo
  autoritativo se repite en `page.tsx`.

**Topología del gate (3 puntos de invocación):**

1. `[courseSlug]/page.tsx` (home) — `requireCourseAccess(courseSlug)` al inicio.
2. `[courseSlug]/[lessonSlug]/layout.tsx` — `requireCourseAccess(courseSlug)`
   (protege el `LessonSidebar`, que lista la estructura del curso).
3. `[courseSlug]/[lessonSlug]/page.tsx` — `requireCourseAccess(courseSlug)`
   (autoritativo sobre el MDX; belt-and-suspenders respecto al layout).

`hasCourseAccess` se envuelve con React `cache()`, de modo que las llamadas de
layout + page dentro del mismo request se deduplican en una sola consulta.

### Decisión 2 — Firma y ubicación del helper

Vive en **`lib/enrollments/access.ts`** (dominio de matrícula), no en
`lib/auth/session.ts`: `lib/enrollments/` ya importa de `lib/auth/session`; si
`session.ts` importara de `enrollments` se crearía un ciclo. Los guards de rol
genéricos siguen en `session.ts`; el guard específico de curso va en
`enrollments/`.

```ts
// lib/enrollments/access.ts
export type CourseAccess =
  | { ok: true; reason: "enrolled" | "owner" | "admin" }
  | { ok: false; reason: "unauthenticated" | "not-enrolled" | "no-course" };

// Chequeo puro, memoizado por request (React cache()). Reutilizable.
export const hasCourseAccess: (courseSlug: string) => Promise<CourseAccess>;

// Guard que traduce el resultado a redirect()/notFound(). Usado en los SC.
// `currentPath` lo arma cada call site (no se puede leer `window` en el
// servidor) y es el destino que preserva el `redirectTo` del login.
export const requireCourseAccess: (
  courseSlug: string,
  currentPath?: string
) => Promise<void>;
```

`hasCourseAccess` devuelve un resultado discriminado (sin redirigir) para poder
reutilizarse en UI condicional futura; `requireCourseAccess` es la capa fina que
traduce ese resultado a navegación.

### Decisión 3 — Sin migración: se componen piezas existentes

`enrollments` no tiene `course_slug` (solo `academic_course_id`) y la policy
`"academic_courses: select own or admin"` oculta la fila al estudiante, así que
un join PostgREST filtrado por `course_slug` devolvería vacío para él.

**Solución sin migración (recomendada):** dentro de `hasCourseAccess`,

- **Estudiante:** reutilizar el camino de `getEnrollmentsByStudent()` (ya
  resuelve `academic_course.course_slug`, `is_active` y `status` vía el RPC
  `get_academic_courses_public`) y buscar una matrícula con `status === "active"`
  y `academic_course.course_slug === courseSlug`.
- **Owner:** `academic_courses` filtrando `course_slug = X` y
  `teacher_id = auth.uid()` (permitido por RLS al dueño).
- **Admin:** chequeo con `has_role` / `requireRole`-style.

Trade-off frente a la alternativa (Opción B: nuevo RPC `security definer`
`has_course_access(text) returns boolean`, un solo round-trip): la Opción B
exige migración + despliegue en producción. Para spec-006 se prefiere la
**Opción A** (cero cambios de esquema, menor blast radius, "cambios
quirúrgicos"). La Opción B queda anotada por si spec-007 introduce chequeos
por-lección de alta frecuencia.

### Decisión 4 — SSG → dinámico

Al leer la cookie de sesión (`getCurrentUser` → `supabase.auth.getUser()`),
ambas rutas se vuelven dinámicas automáticamente en Next 16.

**Recomendación:**

- Quitar `generateStaticParams` de la home de curso y de la lección; añadir
  `export const dynamic = "force-dynamic"` para dejar explícita la intención.
- `getCourseSlugs` y `getCourseLessonSlugPairs` quedan sin consumidor. **No
  borrarlos**; anotarlos como reservados para `sitemap.ts`/prefetch. Si el
  reviewer prefiere no dejar código muerto, se elimina en limpieza aparte.
- El MDX no varía por usuario (solo el gate). Cachear el MDX y dejar dinámico
  solo el gate (Cache Components / PPR) queda como optimización futura, fuera de
  alcance para no sobre-ingenierizar el MVP.

### Decisión 5 — Qué ve un usuario sin acceso (UX)

Orden de comprobaciones en el Server Component, para no filtrar información:

1. **Curso de contenido inexistente** (`getCourseBySlug(courseSlug) === null`)
   → `notFound()` (404), igual que hoy.
2. **Sin sesión** → `redirect("/login?redirectTo=<path>")`, coherente con
   `middleware.ts` y `requireUser`.
3. **Con sesión pero sin matrícula activa** (estudiante no matriculado, o
   docente que no es dueño) → `redirect("/cuenta/cursos?sinAcceso=<courseSlug>")`.
   `app/cuenta/cursos/page.tsx` ya es el hub de matrículas y aloja
   `enrollByCode`; el query param permite mostrar un banner explicativo
   ("No estás matriculado en este curso; ingresa tu código de matrícula"). Se
   evita el 404 desnudo (confunde a estudiantes legítimos) y crear una página
   "no matriculado" nueva (scope extra).
4. **Con acceso** → render normal.

> El banner de `?sinAcceso=` en `/cuenta/cursos` es un ajuste pequeño de UI en
> una página existente; se incluye en la Fase 2.

---

## Fases de implementación

### Fase 1 — Helper de acceso (`lib/enrollments/access.ts`)

- [x] Crear `lib/enrollments/access.ts` con el tipo `CourseAccess` y
      `hasCourseAccess(courseSlug)` (memoizado con React `cache()`), resolviendo:
      estudiante (matrícula activa por `course_slug` vía el camino RPC
      existente), owner (`academic_courses` propio) y admin (`has_role`).
- [x] Añadir `requireCourseAccess(courseSlug)` que traduce el resultado a
      `notFound()` / `redirect("/login?redirectTo=…")` /
      `redirect("/cuenta/cursos?sinAcceso=…")`.
- [x] Re-exportar ambos desde `lib/enrollments/index.ts`.

**Verificación:** ✅ El helper se importa correctamente y está memoizado.

### Fase 2 — Aplicar el gate a las rutas de curso

- [x] `app/(cursos)/[courseSlug]/page.tsx`: invocar `requireCourseAccess`, quitar
      `generateStaticParams`, añadir `export const dynamic = "force-dynamic"`.
- [x] `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx`: invocar
      `requireCourseAccess` antes de renderizar el `LessonSidebar`.
- [x] `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`: invocar
      `requireCourseAccess`, quitar `generateStaticParams`, añadir
      `export const dynamic = "force-dynamic"`.
- [x] `app/cuenta/cursos/page.tsx`: leer `searchParams.sinAcceso` y mostrar un
      banner explicativo cuando esté presente (UI mínima, tokens del sistema).
- [x] Anotar `getCourseSlugs` / `getCourseLessonSlugPairs` como reservados
      (comentario) en `lib/courses/index.ts`.

**Verificación:** ✅ Los 3 estados se comportan según lo descrito. Banner de acceso denegado funciona.

### Fase 3 — Navbar reorientada

- [x] Añadir `id="cursos"` al contenedor de `CourseScroller` y `id="docentes"`
      al de `TeacherBar` en `app/page.tsx` (o en los propios componentes).
- [x] En `components/navbar/Navbar.tsx`, reemplazar `sectionLinks` por
      `{ href: "/#cursos", label: "Cursos" }` y
      `{ href: "/#docentes", label: "Docentes" }`. Reflejar en menú desktop y
      móvil. Dejar intacto el bloque `UserMenu`/login.
- [x] Verificar que los anclas resuelven a secciones reales y que desde una ruta
      interna `/#cursos` navega a la home y hace scroll.

**Verificación:** ✅ Navbar lista.

### Fase 4 — Verificación final

- [x] `npm run build` (confirmar que las rutas quedan dinámicas sin fallos de
      prerender) y `npm run lint`.
  - Build: ✅ Compilado exitosamente. Rutas `/[courseSlug]` y `/[courseSlug]/[lessonSlug]` marcadas como dinámicas (ƒ).
  - Lint: ✅ Sin errores (solo warnings preexistentes).
- [x] Recorrer las pruebas manuales
      `docs/testing/test-006-lecciones-privadas-navbar.md`.

**Verificación:** ✅ Los 14 casos (`TC-006-01` a `TC-006-14`) fueron aprobados
por el usuario. Framework de pruebas automáticas aún "por definir" (ver
`CLAUDE.md` → Testing); sin archivo e2e para este spec.

> Las pruebas manuales (`test-005`) se redactan junto con este spec (test-first).
> El framework e2e está "por definir" en `CLAUDE.md`: las pruebas automáticas se
> describen aquí pero su archivo se crea cuando exista el framework.

---

## Criterios de aceptación

- Un **visitante sin sesión** que abre `/estructuras-de-datos` o cualquier
  lección es redirigido a `/login?redirectTo=…`.
- Un **estudiante autenticado sin matrícula activa** en el curso es redirigido a
  `/cuenta/cursos?sinAcceso=<courseSlug>` y ve el mensaje explicativo.
- Un **estudiante con matrícula activa** vinculada por
  `academic_courses.course_slug` ve la home y las lecciones del curso.
- Un estudiante cuya matrícula está en `status = "withdrawn"` **no** obtiene
  acceso.
- El **docente dueño** (`teacher_id`) del `academic_course` y el **admin** ven el
  contenido sin necesidad de matrícula.
- Un `courseSlug` que no corresponde a ningún curso de contenido devuelve **404**.
- La `Navbar` ya **no** muestra los 3 enlaces de curso; muestra "Cursos"
  (→ `/#cursos`) y "Docentes" (→ `/#docentes`), y el bloque de sesión
  (UserMenu/login) sigue funcionando en desktop y móvil.
- `npm run build` y `npm run lint` pasan sin errores.

---

## Pruebas asociadas

> Estos archivos se crean junto con el spec (enfoque test-first).

- **Manuales:** `docs/testing/test-006-lecciones-privadas-navbar.md` — casos
  `TC-006-*` (redirecciones por estado de sesión/matrícula, acceso de
  owner/admin, 404 de slug inexistente, navbar desktop/móvil).
- **Automáticas (e2e/unit):** `{{ubicación e2e por definir}}/e2e-005-lecciones-privadas-navbar.spec.ts`
  — un caso por criterio de aceptación, en rojo, cuando exista framework.

---

## Riesgos y mitigaciones

- **El MDX no está bajo RLS.** Si el gate se omite en algún Server Component, el
  MDX queda expuesto. Mitigación: gate en los 3 puntos de emisión + `cache()`
  para que no cueste; criterio de aceptación explícito de 404/redirect.
- **Layouts y autorización.** Apoyarse solo en un layout es frágil. Mitigación:
  el chequeo autoritativo se repite en `page.tsx` (deduplicado con `cache()`).
- **Pérdida de SSG.** Las rutas se vuelven dinámicas → mayor coste por request.
  Aceptable en el MVP; mitigación futura anotada (Cache Components / PPR).
- **Navbar con paleta cruda.** Usa `text-gray-*`/`bg-blue-*` en lugar de tokens
  de `DESIGN.md`. Deuda preexistente; este spec solo cambia el array de enlaces
  y añade `id`s. Registrar la migración a tokens en `docs/specs/backlog.md`.
- **Helpers huérfanos.** `getCourseSlugs`/`getCourseLessonSlugPairs` quedan sin
  uso. Mitigación: documentarlos como reservados para sitemap, o eliminarlos en
  limpieza separada con visto bueno del usuario.
- **Anclas de landing.** `/#cursos` y `/#docentes` deben apuntar a secciones que
  existan tras la Fase 3, o el scroll no hace nada. Mitigación: añadir los `id`
  en la misma fase y verificarlo.

---

## Fuera de alcance (recordatorio)

Preguntas embebidas en MDX, formulario de cierre de lección, código de
asistencia por sesión, botón "completar lección", tracking real con
`lesson_progress`, y lista de asistencia del docente → **spec-007**. Ruta
dedicada `/cursos` (catálogo navegable) y refactor de la navbar a tokens
semánticos → specs posteriores.

---

## Nota de continuidad hacia spec-007

spec-007 se apoyará directamente en lo que aquí se define:

- El helper `hasCourseAccess`/`requireCourseAccess` de `lib/enrollments/access.ts`
  será el mismo candado que proteja las nuevas rutas de asistencia/progreso; su
  resultado discriminado (`reason: "enrolled" | "owner" | "admin"`) permitirá
  diferenciar la vista del estudiante (responder, marcar completada) de la del
  docente (ver asistencia).
- El punto de gate ya establecido (Server Components de curso, con `cache()`) es
  donde spec-007 colgará la lógica de "completar lección" y el registro de
  asistencia sin reintroducir chequeos de autorización.
- Si spec-007 introduce verificación por-lección de alta frecuencia, será el
  momento de evaluar la **Opción B** (RPC `security definer` `has_course_access`)
  anotada en la Decisión 3.
