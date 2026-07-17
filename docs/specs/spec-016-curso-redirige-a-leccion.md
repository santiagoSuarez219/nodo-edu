# spec-016 — [TESTING] Redirect de `/[courseSlug]` a la lección de reanudación

> Estado `[TESTING]`: implementación completa, pendiente de pruebas manuales e2e.

## Contexto

Tras crear la página de presentación del curso (`/[courseSlug]/presentacion`,
spec-014/015), la página intermedia `app/(cursos)/[courseSlug]/page.tsx` quedó
redundante: renderiza un header de curso, la bienvenida MDX y un sidebar-índice
que ya están cubiertos por la presentación. La acción "Ir al contenido del
curso" debe llevar directamente a la lección donde el estudiante debe
continuar, no a una pantalla intermedia.

Esta funcionalidad reutiliza el historial de progreso ya existente
(`lesson_progress`, con `completed_at` por lección) para decidir a qué lección
redirigir, mejorando la continuidad del aprendizaje.

## Alcance

### Incluye

- Convertir `/[courseSlug]` en una ruta que hace **redirect server-side** a una
  lección, sin renderizar contenido propio.
- Lógica de reanudación: redirigir a la **primera lección sin completar** según
  el orden canónico de la app; si todas están completas → **última lección**; si
  no hay progreso → **primera lección** (decisión explícita del usuario).
- Mantener la verificación de acceso (`requireCourseAccess`) ANTES del redirect.
- Nuevo helper puro `resolveResumeLessonSlug` para calcular el slug de
  reanudación (testeable de forma aislada).
- Eliminar el código huérfano que deja la desaparición de la página intermedia:
  `CourseHeader`, `CourseSidebar` y `getCourseWelcome()` + su constante
  `WELCOME_SLUG`.

### No incluye

- Cambios en la página de presentación (`/[courseSlug]/presentacion`). Su CTA
  sigue apuntando a `/[courseSlug]`, que ahora redirige (decisión: centralizar
  la lógica de reanudación en una sola ruta en lugar de duplicarla en cada
  enlace).
- Cambios en `LessonSidebar` (sidebar de la página de lección) — es distinto de
  `CourseSidebar` y se conserva.
- Cambios en `getLessonArticle` ni en `normalizeFrontmatter` (los usa la página
  de lección).
- Cambios de esquema en base de datos: no se crea ni modifica ninguna tabla; el
  progreso ya existe.
- Borrado de los archivos de contenido
  `content/cursos/<curso>/bienvenida-al-curso.mdx` (son contenido, no código;
  ver Riesgos). Si se quiere limpiarlos, se registra en `docs/specs/backlog.md`.

## Impacto en el sistema

**Rutas**
- `app/(cursos)/[courseSlug]/page.tsx`: deja de renderizar UI; pasa a resolver
  acceso + progreso y ejecutar `redirect()` a la lección de reanudación. Se
  elimina `generateMetadata` (una ruta que solo redirige no necesita metadata).
  Se conserva el comportamiento dinámico (`export const dynamic =
  "force-dynamic"`): la decisión depende de la sesión y del progreso por usuario.

**Componentes (eliminación)**
- `components/courses/CourseHeader.tsx`: sin consumidores tras el cambio →
  eliminar (verificado por grep: solo lo importa la página intermedia).
- `components/courses/CourseSidebar.tsx`: sin consumidores tras el cambio →
  eliminar. `LessonSidebar` es DISTINTO y NO se toca.

**Lógica de contenido / progreso**
- `lib/courses/content.ts`: eliminar `getCourseWelcome()` y la constante
  `WELCOME_SLUG` (solo se usan entre sí y en la página intermedia).
  `getLessonArticle`, tipos y `normalizeFrontmatter` permanecen intactos.
- `lib/courses/index.ts`: **nuevo helper** de reanudación (contrato abajo).

**Contrato del helper de reanudación**
- **Ubicación:** `lib/courses/index.ts` (dominio de ordenamiento de lecciones;
  función pura, sin fetch de progreso).
- **Firma:** `resolveResumeLessonSlug(lessons: Lesson[], completedLessonSlugs:
  Set<string>): string | null`
- **Responsabilidad:**
  1. Ordenar con **exactamente** el mismo criterio que el resto de la app:
     `[...lessons].sort((a, b) => a.order - b.order)` (sort estable de V8 →
     desempate por posición en el array, idéntico a `getLessonBySlug` y a los
     sidebars).
  2. Devolver el slug de la **primera** lección cuyo `slug` NO esté en
     `completedLessonSlugs`.
  3. Si TODAS están en el set → devolver el slug de la **última** lección.
  4. Si `lessons` está vacío → devolver `null`.
  - Nota: las lecciones placeholder sin `articleSlug` ("Pronto") se incluyen en
    el recorrido tal cual (decisión del usuario: "primera sin completar sin
    excepción"). Ver Riesgos.

**Enlaces existentes hacia `/[courseSlug]` (siguen válidos vía el nuevo redirect)**
- `app/(cursos)/[courseSlug]/presentacion/page.tsx` — CTA "Ir al curso".
- `components/courses/LessonSidebar.tsx` — título del curso.
- `components/account/EnrolledCourseList.tsx` — card "Ver contenido de {curso}".
- Decisión: dejarlos apuntando a `/[courseSlug]`; no reapuntar a la lección.

**Auth / Storage**
- Sin cambios. `requireCourseAccess(courseSlug, `/${courseSlug}`)` se sigue
  invocando ANTES de leer progreso. Owners/admins tienen acceso pero sin filas
  de progreso → caen en "primera lección" (correcto).

## Evaluación MCP

**¿Aplica MCP?** No.

- *¿Expone datos que un agente consultaría?* No: solo cambia navegación; consume
  progreso ya existente, sin endpoint ni tabla nueva.
- *¿Permite acciones que un agente ejecutaría?* No: no hay escritura nueva.
- *¿Existe un MCP relacionado a extender?* No. `question-bank-mcp` y
  `attendance-mcp` cubren dominios distintos.
- *¿Hay un agente en `docs/mcps/` que se beneficie?* No.

No se añade fase de MCP.

## Fases de implementación

### Fase 1 — Helper de reanudación
- [x] Añadir `resolveResumeLessonSlug(lessons, completedLessonSlugs)` en
      `lib/courses/index.ts` con el contrato descrito (orden canónico, primera
      sin completar, fallback a última, `null` si no hay lecciones).
- [x] Exportarla desde `lib/courses/index.ts` para consumo desde la ruta.

### Fase 2 — Convertir `/[courseSlug]` en redirect
- [x] Reescribir `app/(cursos)/[courseSlug]/page.tsx`:
  - [x] Resolver `getCourseBySlug`; si no existe → `notFound()`.
  - [x] Ejecutar `requireCourseAccess(courseSlug, `/${courseSlug}`)` ANTES de
        leer progreso.
  - [x] Leer `getCourseProgress(courseSlug)` y construir
        `completedLessonSlugs = new Set(progress.filter(p => p.completed_at !==
        null).map(p => p.lesson_slug))` (mismo criterio que el layout de lección).
  - [x] Llamar a `resolveResumeLessonSlug(course.lessons, completedLessonSlugs)`.
  - [x] Si devuelve un slug → `redirect(`/${courseSlug}/${slug}`)`.
  - [x] Si devuelve `null` (curso sin lecciones) → `notFound()` (defensivo).
  - [x] Asegurar que `redirect()`/`notFound()` se llamen fuera de cualquier
        `try/catch` (usan control-flow interno de Next).
- [x] Eliminar `generateMetadata` de esa ruta.
- [x] Conservar `export const dynamic = "force-dynamic"`.
- [x] Retirar imports que ya no se usan (`getCourseWelcome`, `CourseHeader`,
      `CourseSidebar`, `MdxContent`, `Metadata`).

### Fase 3 — Eliminar código huérfano
- [x] Eliminar `components/courses/CourseHeader.tsx`.
- [x] Eliminar `components/courses/CourseSidebar.tsx`.
- [x] Eliminar `getCourseWelcome()` y la constante `WELCOME_SLUG` en
      `lib/courses/content.ts` (dejar intactos `getLessonArticle`, tipos y
      `normalizeFrontmatter`).
- [x] Verificar con grep que no queda ningún import roto a los símbolos
      eliminados.
- [x] `npm run build` y `npm run lint` sin errores.

## Criterios de aceptación

- Al navegar a `/[courseSlug]` con acceso, el usuario es redirigido
  (server-side) a una lección del curso, sin ver header/bienvenida/sidebar
  intermedios.
- Con progreso parcial, el redirect apunta a la **primera lección sin
  completar** según el orden canónico de la app.
- Con todas las lecciones completadas, el redirect apunta a la **última
  lección**.
- Sin ningún progreso (o sin filas, p. ej. owner/admin), el redirect apunta a la
  **primera lección**.
- Un usuario **no autenticado** en `/[courseSlug]` es redirigido a
  `/login?redirectTo=...`.
- Un usuario autenticado **no matriculado** es redirigido a
  `/cuenta/cursos?sinAcceso=...`.
- Los enlaces existentes que apuntaban a `/[courseSlug]` (presentación, sidebar
  de lección, cards de "mis cursos") siguen funcionando vía el nuevo redirect.
- `CourseHeader`, `CourseSidebar` y `getCourseWelcome` ya no existen; el
  build/lint pasan limpios.

## Pruebas asociadas

> Estos archivos se crean junto con el spec.
- **Manuales:** `docs/testing/test-016-curso-redirige-a-leccion.md` — casos
  `TC-001` a `TC-007`.
- **Automáticas (e2e/unit):** no aplica por ahora — framework de testing
  automático aún "por definir" (ver CLAUDE.md → Testing). El helper
  `resolveResumeLessonSlug` es candidato natural a test unitario cuando exista
  framework.

## Riesgos y notas

- **Bucle de redirect:** el destino es una lección del mismo curso; la página de
  lección re-verifica acceso con el mismo resultado (ok) y renderiza. No hay
  ciclo. La CTA de la presentación apunta a `/[courseSlug]` por clic del
  usuario, no en cadena automática.
- **Placeholders sin `articleSlug`:** por decisión del usuario se incluyen en el
  recorrido. Si una placeholder precede a lecciones reales sin completar, el
  redirect podría llevar a una lección "Pronto" (que renderiza "Apuntes en
  preparación"). Documentado como comportamiento aceptado; si molesta en
  pruebas, es un cambio de scope a acordar.
- **`order` duplicado en la data:** resuelto usando el mismo `sort` estable de la
  app (desempate por posición en el array). No introducir una comparación
  distinta.
- **SEO/metadata:** la ruta pasa a ser un redirect dependiente de sesión;
  eliminar `generateMetadata` es correcto (no hay página que indexar).
- **Contenido huérfano:** los `.mdx` de bienvenida quedan sin consumidor. Este
  spec **no los borra** (es contenido, fuera del alcance de "código huérfano").
- **Cache:** la decisión depende de la sesión y del progreso por usuario; la
  ruta permanece dinámica (no render estático ni cacheado entre usuarios).
