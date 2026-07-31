# spec-001 — [DONE] Página de Lección con Artículo MDX y Sidebar de Navegación

> **Nota de formato:** este spec se redactó antes de adoptarse la convención
> actual de `docs/specs/` (secciones `Contexto` / `Alcance` / `Impacto en el
> sistema` / `Evaluación MCP` / `Fases de implementación` / `Criterios de
> aceptación` / `Pruebas asociadas`, ver `CLAUDE.md`). Se conserva su
> estructura original de análisis técnico (Fases A–F en vez de Fase 1–N) para
> no reescribir el registro histórico; solo se actualiza el encabezado y se
> declara su estado real.
>
> **Estado:** `[DONE]` — la página `/<courseSlug>/<lessonSlug>`, el pipeline
> MDX (`next-mdx-remote` + Shiki + KaTeX), la sidebar de navegación y la
> paginación descritos aquí están implementados y en producción. La
> funcionalidad se extendió después en **spec-009** (progreso/cierre de
> lección), **spec-010** (asistencia), **spec-011** (autoevaluación) y
> **spec-017** (rediseño del cierre y bloqueo por autoevaluación), que
> añadieron secciones al mismo contenedor sin reescribir lo que este spec
> estableció.
>
> **Evaluación MCP:** No aplica — expone únicamente contenido de lectura
> pública (artículos MDX de curso); no hay acción ni dato de interés para un
> agente que no esté ya cubierto por specs posteriores.
>
> **Pruebas:** no existe `docs/testing/test-001-*` — este spec predata el
> requisito de pruebas manuales por spec. No se retrofitea aquí para no
> fabricar un historial de pruebas que nunca se ejecutó; su cobertura de facto
> quedó validada por los specs posteriores que dependen de esta página.

## Problema

Hoy, en la página de inicio de cada curso (`/<courseSlug>`), las clases se renderizan como tarjetas estáticas (`LessonCard`) que muestran título, resumen y temas, pero **no son enlazables**: no existe una página dedicada al cuerpo de la clase. La feature actual cubre el "índice" del curso, pero no su contenido.

Se requiere ahora la **página de lección** con dos responsabilidades:

1. **Contenido**: artículo tipo blog con los apuntes de la clase, escrito por el docente principal en **Markdown/MDX**, con soporte para:
   - Headings, listas, citas, tablas, imágenes.
   - **Bloques de código con syntax highlighting** (Shiki).
   - **Fórmulas matemáticas** (KaTeX) — clave para los cursos de algoritmos y ciencia de datos.
2. **Navegación contextual**: una **sidebar fija** a la izquierda con todas las lecciones del curso, donde cada lección es **expandible** (acordeón) para ver sus temas. La lección activa queda resaltada y, en móvil, la sidebar se abre como drawer. Permite saltar entre clases sin volver a la home del curso.

Restricciones de la fase actual:

- Stack vigente: Next 16.2.4 + React 19 + Tailwind 4 + TypeScript. No hay MDX, ni Shiki, ni KaTeX, ni `contentlayer` instalados.
- Sólo el docente principal escribe contenido; el flujo es vía Git.
- El acceso al contenido es público.
- La capa de dominio (`lib/courses/`) ya existe y `Lesson` reserva el campo opcional `articleSlug`.

Restricciones a futuro (fases 2 y 3):

- En Fase 2, el cuerpo del artículo se gestionará desde **Payload CMS 3** sobre Postgres. El frontend público (rutas, sidebar, renderer) **no debe reescribirse**: sólo cambia la fuente del cuerpo.
- En Fase 3, una lección podrá tener además video, notebook ejecutable y evaluación. La página de lección de hoy debe ser el contenedor extensible para esos bloques mañana.

---

## Impacto Arquitectural

### Frontend público

- **Nueva ruta dinámica anidada** bajo el grupo existente `(cursos)`: `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`.
- **Layout compartido** `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx` que monta la sidebar (server-fetch de las lecciones del curso) y deja el `children` como columna principal. Esto evita re-pedir y re-renderizar la sidebar al navegar entre lecciones del mismo curso.
- **`LessonCard` deja de ser estático**: pasa a envolverse en `<Link href="/<courseSlug>/<lessonSlug>">` en la home del curso. Si la lección no tiene contenido aún, se renderiza no-interactiva con `aria-disabled` y un badge "Próximamente".
- **Nuevos componentes** en `components/courses/`:
  - `LessonSidebar.tsx` (server) — recibe `course` y `activeLessonSlug`, compone la lista.
  - `LessonSidebarItem.tsx` (client, `"use client"`) — un item con acordeón controlado y resaltado activo.
  - `LessonSidebarMobile.tsx` (client) — drawer Flowbite para `< lg`.
  - `LessonArticle.tsx` (server) — header del artículo + render del MDX.
  - `MdxContent.tsx` (server) — renderiza el cuerpo MDX con el set de plugins y componentes mapeados.
  - `LessonPagination.tsx` (server) — links prev/next entre lecciones del mismo curso.
- **Home del curso**: pequeño ajuste en `LessonCard` y/o `LessonList` para envolver en `<Link>` cuando exista artículo.

### Capa de dominio (`lib/courses/`)

- `Lesson` se extiende con un `slug` público (separado del `id` interno) para construir la URL. Hoy el `id` ya cumple el rol de slug; se formaliza renombrando o agregando un alias estable `slug` = `id` y se documenta para Fase 2.
- Nuevas funciones en `lib/courses/index.ts`:
  - `getLessonBySlug(courseSlug, lessonSlug): Promise<{ course, lesson, prev, next } | null>`.
  - `getCourseLessonSlugPairs(): Promise<{ courseSlug, lessonSlug }[]>` para `generateStaticParams`.
- Se introduce un módulo nuevo `lib/courses/content.ts` (o `lib/lessons/content.ts`) responsable de **resolver el cuerpo del artículo** dado un `(courseSlug, lessonSlug)`. En Fase 1 lee del filesystem MDX; en Fase 2 consultará Payload. Esta indirección es la frontera que protege componentes y rutas de la migración.
- La validación al import de `lib/courses/index.ts` pasa a verificar también que cada `articleSlug` (cuando esté declarado) corresponda a un archivo MDX existente — falla en build si rompe el contrato.

### Contenido

- Nuevo árbol `content/cursos/<courseSlug>/<lessonSlug>.mdx` con frontmatter mínimo (`title`, `summary`, `updatedAt`, opcional `cover`).
- Política: el **frontmatter no duplica** la metadata estructural ya existente en `lib/courses/data/*.ts`. La fuente de verdad de "qué clases tiene un curso y en qué orden" sigue siendo TypeScript. El frontmatter del MDX sólo describe el **artículo** (cuándo se publicó, posibles overrides locales, autores futuros).
- Enlace MDX ↔ dominio: el `articleSlug` (= nombre del archivo `.mdx`) en `Lesson` es la clave. Si una `Lesson` no tiene `articleSlug`, no hay artículo todavía y la página renderiza un fallback amigable.

### Admin / CMS

- Sin impacto en Fase 1.
- En Fase 2 (Payload), el `lib/courses/content.ts` muta su implementación: en lugar de leer `.mdx` del disco, consulta una colección `lessonArticles` y devuelve el cuerpo como Markdown/MDX serializado o como AST renderizable. El renderer (`MdxContent.tsx`) y la ruta no se tocan.

### Base de datos / Auth / Storage

- Sin impacto en Fase 1.
- En Fase 2: tabla `lesson_articles` con FK a `lessons`, columna `body_mdx`, `updated_at`, `cover_url`. Las imágenes embebidas en MDX migrarán a Supabase Storage.

---

## Decisiones Abiertas y Recomendación

### 1. Librería MDX: `@next/mdx` vs. `next-mdx-remote` vs. `contentlayer`

| Aspecto | `@next/mdx` (integración de Next) | `next-mdx-remote` (string → componente) | `contentlayer` |
|---|---|---|---|
| Modelo | Cada `.mdx` es un archivo de ruta o un módulo importable; el bundler lo compila | El cuerpo MDX se lee como string en el server y se compila en build/SSR | Build-step que tipa el contenido como datos |
| Encaja con "contenido en `/content/<curso>/<lesson>.mdx` desacoplado de rutas" | Mal: obliga a que cada MDX viva como módulo importable o como ruta `app/.../page.mdx` | Muy bien: el MDX es un dato, no un módulo. Se carga dinámicamente por slug | Bien, pero con build-step propio |
| Compatibilidad Next 16 + React 19 + Turbopack | Soportado oficialmente, pero acopla MDX al pipeline del bundler; cualquier cambio futuro a Payload requiere reescribir el flujo | Soportado y agnóstico al bundler: trabaja sobre strings, ideal para la transición a Payload (que devolverá strings/AST) | `contentlayer` v0 está estancado; `contentlayer2` es comunitario y no se ha estabilizado en Next 16 + Turbopack |
| Plugins (Shiki, remark-math, rehype-katex) | Se configuran en `next.config.ts`, atado al bundler | Se pasan como opciones a `compileMDX()` en runtime/SSR; control total | Configuración propia |
| Migración Fase 2 (Payload) | Reescritura: el MDX dejaría de ser archivo importable | Cero fricción: Payload entrega un string MDX, se le pasa al mismo `compileMDX` | Reescritura: hay que abandonar el build-step |
| Riesgo de mantenimiento | Bajo (oficial Next) | Bajo (mantenido por Hashicorp) | Medio-alto |

**Recomendación: `next-mdx-remote` (paquete `next-mdx-remote/rsc` para Server Components)**.

Razones:

- Es el único de los tres que trata el cuerpo MDX como **dato**, no como módulo. Eso es exactamente lo que será en Fase 2 cuando venga de Payload.
- Funciona en Server Components con `compileMDX({ source, options, components })`, sin "use client", y aprovecha streaming.
- Plugins remark/rehype se pasan en el call-site, no se acoplan al `next.config.ts`.
- Bundle del cliente queda limpio: el MDX se compila en server.

Plugins a instalar junto a él:

- `remark-gfm` (tablas, task lists, autolinks).
- `remark-math` + `rehype-katex` (fórmulas).
- `rehype-pretty-code` (Shiki bajo el capó, integración limpia con Tailwind y temas claro/oscuro vía dual-theme).
- `gray-matter` para el frontmatter.

Se descarta `contentlayer` por estado de mantenimiento; se descarta `@next/mdx` por acoplar el contenido al bundler.

### 2. Dónde viven los archivos MDX y cómo se descubren

**Recomendación**: archivos en `content/cursos/<courseSlug>/<lessonSlug>.mdx`, descubiertos por **registro explícito en `lib/courses/data/*.ts`** vía el campo `articleSlug` ya existente, no por filesystem walk.

Justificación:

- El registro explícito mantiene **una sola fuente de verdad** sobre qué clases existen y en qué orden (lo decide la metadata, no el filesystem).
- Permite que una clase exista sin artículo (fallback amigable) y viceversa: detectar artículos huérfanos en validación de build.
- En Fase 2 desaparece el filesystem; el `articleSlug` queda como clave estable hacia Payload.
- `content/` queda fuera de `app/` para evitar que Next interprete los `.mdx` como rutas (efecto colateral indeseable de `@next/mdx`).

Convenio:

- Si `lesson.articleSlug` está definido → debe existir `content/cursos/<courseSlug>/<lesson.articleSlug>.mdx`. La validación de import lo verifica con un `fs.existsSync` envuelto en `process.env.NODE_ENV !== 'production' || NEXT_PHASE === 'phase-production-build'` para que falle en build pero no en runtime de producción si alguien borra un archivo a mano.
- Si no existe `articleSlug` → la página de lección renderiza placeholder "Apuntes en preparación" y no aparece como link en la home.

### 3. URL: `/<courseSlug>/<lessonSlug>` vs. `/<courseSlug>/clases/<lessonSlug>` u otras

**Recomendación**: `/<courseSlug>/<lessonSlug>`, sin segmento intermedio.

Razones:

- Más corto, más memorable, igual a la convención de blogs y a lo que ya hace la home (`/<courseSlug>`).
- El grupo `(cursos)` ya aísla este sub-árbol del resto de la app, evitando colisiones con `/login`, `/admin`, `/api`.
- Riesgo de colisión `lessonSlug` vs. otra ruta dentro del curso (p. ej. futuro `/<courseSlug>/recursos`): se mitiga reservando palabras prohibidas (`recursos`, `evaluaciones`, `notebooks`) en la validación al import. Si en el futuro hace falta segmentar, se puede introducir `/clases/` con un redirect estable.

Alternativa rechazada: `/<courseSlug>/clases/<lessonSlug>`. Es más defensiva, pero introduce un segmento sin valor semántico (todo bajo un curso son clases). Sólo tendría sentido si convivieran tipos de contenido heterogéneos al mismo nivel, lo cual no es el caso.

### 4. Sidebar: Server o Client Component

**Recomendación: ambos, separados por responsabilidad.**

- `LessonSidebar.tsx` (Server Component): recibe `course` y `activeLessonSlug` como props (los obtiene el `layout.tsx`). Renderiza la estructura, los links (`<Link>` de Next) y la marca visual de "lección actual". No tiene estado.
- `LessonSidebarItem.tsx` (`"use client"`): un item con acordeón. Estado local (`useState`) para `expanded`. Por defecto, el item de la lección activa se monta expandido; el resto colapsado. Soporta toggle por click y por teclado (Enter/Space). El componente padre permanece server.
- `LessonSidebarMobile.tsx` (`"use client"`): drawer (Flowbite `Drawer`) controlado para `< lg`. Mismo contenido que la sidebar desktop, abierto desde un botón "Índice del curso" en el top de la columna principal.

Esto sigue el patrón "server compone estructura y datos, cliente añade interactividad puntual" — más performante que poner toda la sidebar en el cliente, y compatible con streaming.

### 5. Layout compartido vs. fetch por página

**Recomendación**: `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx` que cargue **una sola vez** las lecciones del curso para alimentar la sidebar, y use el `lessonSlug` actual desde `params` (Next 16 ya pasa `params` async al layout) para marcar el activo.

Beneficio: navegar de una lección a otra del mismo curso preserva el layout (la sidebar no se re-renderiza), aprovecha la convención App Router y mantiene sólo un fetch de metadata por navegación al curso, no por lección.

Cuidado: el `layout.tsx` no debe leer el cuerpo del MDX (eso vive en la `page.tsx` de la lección activa). Sólo metadata estructural.

### 6. Manejo de "lección sin artículo"

- Si `lesson.articleSlug` no existe **o** el `.mdx` no se resuelve: la `page.tsx` renderiza el header de la lección, la lista de temas, y un bloque "Los apuntes de esta clase aún están en preparación". HTTP 200 (no 404, porque la lección **sí existe** estructuralmente).
- En la home del curso, las `LessonCard` sin `articleSlug` se renderizan no-clickables con un badge "Próximamente" para que el usuario no se choque con el placeholder.
- 404 sólo cuando `(courseSlug, lessonSlug)` no resuelve a una `Lesson` real en el dominio.

### 7. Evolución del contrato `Lesson` para Fase 2

El contrato ya tiene `articleSlug?: string`. Se ajusta así para no romperlo el día de Payload:

- Mantener `articleSlug` como **clave opaca**: en Fase 1 es el nombre del archivo MDX; en Fase 2 es el ID del documento Payload. El frontend no asume ninguna de las dos cosas.
- Toda la resolución `articleSlug → cuerpo MDX` queda dentro de `lib/courses/content.ts`. Cambia su implementación, no su firma.
- Añadir `slug: string` a `Lesson` (separado del `id` interno) si en algún momento queremos que la URL diverja del id. Hoy se inicializa con `slug = id` y se exporta sólo `slug`. Es una micro-precaución que cuesta poco y desacopla el modelo del routing.

### 8. SSG, metadata y caché

- `generateStaticParams` en `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` itera todos los pares `(courseSlug, lessonSlug)` con `articleSlug` definido. Las páginas sin artículo se generan dinámicamente o se omiten.
- `generateMetadata` por lección: título = `${lesson.title} — ${course.title}`, descripción = `lesson.summary` (con fallback a la primera frase del MDX).
- Imágenes locales del MDX viven en `content/cursos/<courseSlug>/_assets/` y se sirven con `next/image` mediante un componente custom mapeado en el provider MDX.

### 9. Accesibilidad

- Sidebar: estructura `<nav aria-label="Lecciones del curso">` con `<ol>` ordenada. Cada item expandible es `<button aria-expanded>` que controla un `<ul id="...">` vía `aria-controls`. Lección activa lleva `aria-current="page"`.
- En móvil, el drawer cumple foco-trap, cierre con `Esc` y restauración de foco al botón disparador (Flowbite ya provee esto, se valida).
- Headings del artículo: `h1` reservado para el header de lección; el MDX comienza desde `h2`. Se documenta convención al docente.
- Bloques KaTeX: `aria-label` con la fórmula en texto plano cuando sea factible (rehype-katex emite `<annotation encoding="application/x-tex">`, accesible para lectores que lo soporten).

---

## Propuesta de Solución

### Modelo de dominio actualizado (resumen conceptual)

- `Lesson` añade `slug: string` (alias estable de `id` para URLs). `articleSlug` se mantiene como clave opaca al cuerpo del artículo.
- Nueva función pura `getLessonBySlug(courseSlug, lessonSlug)` devuelve `{ course, lesson, prev, next }` para alimentar la página y la paginación.
- Nuevo módulo `lib/courses/content.ts` con `getLessonArticle(courseSlug, articleSlug): Promise<{ frontmatter, mdxSource } | null>`. En Fase 1 implementa `fs.readFile`; en Fase 2 consulta Payload.

### Estructura de carpetas final

```
app/
  (cursos)/
    [courseSlug]/
      page.tsx                     # ya existe (home del curso)
      not-found.tsx                # ya existe
      [lessonSlug]/
        layout.tsx                 # NUEVO: monta sidebar + columna principal
        page.tsx                   # NUEVO: render del artículo
        not-found.tsx              # NUEVO: 404 específico de lección
content/
  cursos/
    estructuras-de-datos/
      <lessonSlug>.mdx
      _assets/
    programacion-cientifica/
    analisis-de-algoritmos/
lib/
  courses/
    types.ts                       # editado: + slug en Lesson
    data/<curso>.ts                # editado: + articleSlug donde aplique
    index.ts                       # editado: + getLessonBySlug, + getCourseLessonSlugPairs
    content.ts                     # NUEVO: resolución MDX
  mdx/
    compile.ts                     # NUEVO: wrapper sobre compileMDX con plugins
    components.tsx                 # NUEVO: mapping de componentes (img → next/image, code, etc.)
components/
  courses/
    LessonCard.tsx                 # editado: ahora es Link condicional
    LessonSidebar.tsx              # NUEVO (server)
    LessonSidebarItem.tsx          # NUEVO (client, acordeón)
    LessonSidebarMobile.tsx        # NUEVO (client, drawer)
    LessonArticle.tsx              # NUEVO (server, header + cuerpo)
    LessonPagination.tsx           # NUEVO (prev/next)
  mdx/
    MdxContent.tsx                 # NUEVO (server, llama a compile y renderiza)
    CodeBlock.tsx                  # NUEVO (estilo wrapper sobre rehype-pretty-code output)
```

### Render de la página de lección

`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx` (Server Component):

1. Resuelve `params` (`courseSlug`, `lessonSlug`).
2. Llama `getLessonBySlug(courseSlug, lessonSlug)`. Si no existe, `notFound()`.
3. Llama `getLessonArticle(courseSlug, lesson.articleSlug)`.
4. Si hay artículo: renderiza `LessonArticle` (header con título, summary, badges) seguido de `MdxContent` con el `mdxSource`.
5. Si no hay artículo: renderiza `LessonArticle` + bloque "Apuntes en preparación".
6. Al final, `LessonPagination` con `prev`/`next`.

`app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx`:

1. Resuelve `params`.
2. Llama `getCourseBySlug(courseSlug)`. Si null, `notFound()`.
3. Estructura `<div class="lg:grid lg:grid-cols-[280px_1fr]">`:
   - Columna izquierda: `<aside>` con `LessonSidebar` (oculto en `< lg`).
   - Columna derecha: header móvil con botón que abre `LessonSidebarMobile`, seguido de `{children}`.

### Estilos

- Tokens semánticos exclusivamente, según tabla claro/oscuro de `CLAUDE.md`.
- Sidebar fondo `bg-gray-50 dark:bg-gray-800`, hover items `hover:bg-gray-100 dark:hover:bg-gray-700`, item activo `bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`.
- Tipografía del artículo: `prose` no se usa (Tailwind 4 sin `@tailwindcss/typography` por ahora). Se definen estilos por componente MDX mapeado para mantener control y JetBrains Mono coherente.
- Tema dual de Shiki: `github-light` + `github-dark`, alternados por la clase `.dark` (rehype-pretty-code lo soporta nativamente).

---

## Plan de Implementación por Fases

### Fase A — Capa de dominio y descubrimiento de contenido

**Objetivo**: extender el dominio para soportar lecciones direccionables, sin tocar UI.

1. Editar `lib/courses/types.ts`: añadir `slug: string` a `Lesson` y documentar que `articleSlug` es clave opaca al cuerpo del artículo.
2. Editar cada `lib/courses/data/<curso>.ts`: poblar `slug` (= `id` por ahora) en cada lección y añadir `articleSlug` sólo donde el primer artículo MDX exista.
3. Editar `lib/courses/index.ts`: añadir `getLessonBySlug(courseSlug, lessonSlug)` (devolviendo `{ course, lesson, prev, next }`) y `getCourseLessonSlugPairs()`. Extender la validación al import para detectar:
   - Slugs de lección duplicados dentro de un curso.
   - `articleSlug` que apunte a un archivo MDX inexistente (sólo en build).
   - `lessonSlug` que coincida con palabras reservadas (`recursos`, `evaluaciones`, `notebooks`).
4. Crear `lib/courses/content.ts` con `getLessonArticle(courseSlug, articleSlug)`. Implementación Fase 1: `fs.readFile` desde `content/cursos/...` + `gray-matter` para extraer frontmatter. Devolver `{ frontmatter, rawSource }`.

**Archivos creados**: `lib/courses/content.ts`.
**Archivos editados**: `lib/courses/types.ts`, `lib/courses/index.ts`, los tres `lib/courses/data/*.ts`.

### Fase B — Pipeline MDX

**Objetivo**: dejar funcional el render de un `.mdx` arbitrario en un Server Component aislado, antes de montar rutas.

1. Instalar dependencias: `next-mdx-remote`, `gray-matter`, `remark-gfm`, `remark-math`, `rehype-katex`, `rehype-pretty-code`, `shiki`, `katex`. Añadir `katex/dist/katex.min.css` como import global (en `app/layout.tsx`) o lazy en `MdxContent`.
2. Crear `lib/mdx/compile.ts`: wrapper sobre `compileMDX` de `next-mdx-remote/rsc` con la configuración de plugins, tema dual de Shiki y opciones (`parseFrontmatter: false` ya que `gray-matter` lo extrae antes).
3. Crear `lib/mdx/components.tsx`: mapping de componentes (`img → next/image` con loader, `a → Link` interno cuando aplique, `pre`/`code` con estilos del sistema, contenedor para `.math.math-display` de KaTeX).
4. Crear `components/mdx/MdxContent.tsx`: Server Component que recibe `source: string`, llama a `compileMDX` y devuelve el árbol React.
5. Crear `components/mdx/CodeBlock.tsx` con los estilos del sistema para los bloques producidos por `rehype-pretty-code` (variables CSS para tema dual).
6. Crear un MDX de ejemplo en `content/cursos/estructuras-de-datos/<lesson>.mdx` con headings, lista, tabla, bloque de código, fórmula KaTeX e imagen, para validar el pipeline manualmente desde una ruta temporal de prueba (luego se borra).

**Archivos creados**: `lib/mdx/compile.ts`, `lib/mdx/components.tsx`, `components/mdx/MdxContent.tsx`, `components/mdx/CodeBlock.tsx`, primer MDX de ejemplo.
**Archivos editados**: `package.json`, `app/layout.tsx` (import del CSS de KaTeX si se decide global).

### Fase C — Sidebar y layout compartido

**Objetivo**: interfaz de navegación entre lecciones, lista para que la consuma cualquier `page.tsx`.

1. Crear `components/courses/LessonSidebar.tsx` (server): recibe `course: Course` y `activeLessonSlug: string`. Renderiza `<nav>` con `<ol>` de items. Cada item llama a `LessonSidebarItem`.
2. Crear `components/courses/LessonSidebarItem.tsx` (`"use client"`): props `lesson`, `courseSlug`, `isActive`, `defaultExpanded`. Estado local de expansión, botón con `aria-expanded`/`aria-controls`, link al artículo con `aria-current="page"` cuando activo. Lecciones sin `articleSlug` se renderizan no-link con estilo deshabilitado.
3. Crear `components/courses/LessonSidebarMobile.tsx` (`"use client"`): drawer Flowbite con el mismo `LessonSidebar` adentro. Estado de apertura local.
4. Crear `app/(cursos)/[courseSlug]/[lessonSlug]/layout.tsx`: Server Component que llama `getCourseBySlug`, dispara `notFound()` si null, monta el grid `[280px_1fr]` para `lg:` con la sidebar y el botón "Índice del curso" para móvil. Lee `lessonSlug` de `params` y se lo pasa a la sidebar.
5. Validar accesibilidad (foco, teclado, ARIA) y modo claro/oscuro contra la tabla de `CLAUDE.md`.

**Archivos creados**: 3 componentes en `components/courses/` + `layout.tsx`.
**Archivos editados**: ninguno.

### Fase D — Página de lección y enlace desde la home del curso

**Objetivo**: las `LessonCard` se vuelven clickables y la URL `/<courseSlug>/<lessonSlug>` renderiza el artículo.

1. Crear `app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`: Server Component que llama `getLessonBySlug` y `getLessonArticle`, compone `LessonArticle` + `MdxContent` (o fallback "en preparación") + `LessonPagination`.
2. Implementar `generateStaticParams` con `getCourseLessonSlugPairs` (sólo lecciones con `articleSlug`).
3. Implementar `generateMetadata` con título, descripción y `openGraph` mínimo por lección.
4. Crear `app/(cursos)/[courseSlug]/[lessonSlug]/not-found.tsx`: 404 estilizado, link a la home del curso.
5. Crear `components/courses/LessonArticle.tsx` (server): header (clase Nº, título, summary, fecha si la hay) usando los tokens del sistema.
6. Crear `components/courses/LessonPagination.tsx` (server): bloque "Anterior / Siguiente" con `prev`/`next` provistos por `getLessonBySlug`.
7. Editar `components/courses/LessonCard.tsx`: si `lesson.articleSlug` existe → envolver el contenido en `<Link href="/<courseSlug>/<lessonSlug>">`; si no → mantener no-interactivo + badge "Próximamente".
8. Editar `components/courses/LessonList.tsx` si hace falta para pasar `courseSlug` a cada `LessonCard`.

**Archivos creados**: `page.tsx` y `not-found.tsx` de lección, `LessonArticle.tsx`, `LessonPagination.tsx`.
**Archivos editados**: `LessonCard.tsx`, `LessonList.tsx`.

### Fase E — Contenido inicial real

**Objetivo**: poblar al menos un curso completo con artículos reales para validar el flujo end-to-end y dejar al docente con un punto de partida claro.

1. Redactar 2 a 4 artículos MDX reales en `content/cursos/estructuras-de-datos/`. Validar cobertura: heading h2/h3, listas, tablas, bloque de código, fórmula KaTeX, imagen.
2. Marcar el resto de las clases sin `articleSlug` para que aparezcan como "Próximamente".
3. Documentar en un `content/README.md` corto (sólo si el docente lo pide) la convención de frontmatter y cómo añadir un nuevo artículo. Si no, dejar la convención sólo en `lib/courses/types.ts` y en este spec.

**Archivos creados**: archivos `.mdx` de contenido.
**Archivos editados**: `lib/courses/data/estructuras-de-datos.ts` (`articleSlug` en lecciones con artículo).

### Fase F — Pulido, accesibilidad y validación

**Objetivo**: paridad visual, accesibilidad y robustez.

1. Revisar todos los componentes nuevos contra la tabla claro/oscuro de `CLAUDE.md`. Reemplazar valores crudos por tokens.
2. Validar foco, teclado y ARIA en sidebar (desktop y móvil): tab order razonable, `Esc` cierra el drawer, `aria-current="page"` en lección activa.
3. Validar responsive: `< lg` muestra botón "Índice"; `>= lg` sidebar fija. La sidebar respeta el `pt-16 lg:pt-20` del layout raíz.
4. Validar SSG: `next build` genera todas las páginas con `articleSlug` y reporta error claro si un MDX está roto o no existe.
5. Lint + typecheck (`npm run lint`, `tsc --noEmit`). Smoke test manual de navegación: home → curso → lección → siguiente → mobile drawer.

**Archivos creados**: ninguno.
**Archivos editados**: los componentes que necesiten ajuste.

---

## Criterios de Aceptación

- Cada `LessonCard` con `articleSlug` es un link funcional a `/<courseSlug>/<lessonSlug>`. Las que no tienen `articleSlug` se muestran como "Próximamente" no clickable.
- La página de lección renderiza el artículo MDX con bloques de código resaltados (Shiki), fórmulas KaTeX, tablas e imágenes.
- La sidebar lista todas las lecciones del curso, marca la activa con `aria-current="page"`, y permite expandir/colapsar cada lección para ver sus temas. La lección activa arranca expandida.
- En `< lg`, la sidebar se accede vía drawer abierto desde la columna principal, con foco-trap y cierre por `Esc`.
- Navegar entre lecciones del mismo curso preserva el layout (sidebar no parpadea).
- Una URL válida `(courseSlug, lessonSlug)` devuelve 200 (con artículo o con placeholder). Una URL con `lessonSlug` inexistente devuelve el `not-found.tsx` de lección.
- `next build` genera estáticamente todas las lecciones con artículo. Romper un MDX o un `articleSlug` falla el build con mensaje claro.
- El frontend público nunca importa `lib/courses/data/*` ni `content/...` directamente: sólo `lib/courses/index.ts` y `lib/courses/content.ts`.
- Modo claro y oscuro consistentes con la tabla de `CLAUDE.md`. Sin colores crudos.
- Lint y typecheck pasan sin warnings nuevos.

## Riesgos y Mitigaciones

- **Riesgo**: KaTeX y rehype-pretty-code aumentan el bundle. **Mitigación**: ambos se ejecutan en server (compileMDX en RSC); el cliente sólo recibe el HTML resultante y el CSS de KaTeX (~25 KB gzip). El CSS se carga sólo en rutas de lección (import dentro de `MdxContent.tsx`, no global).
- **Riesgo**: el día de Payload el cuerpo MDX deja de venir del filesystem y el pipeline se rompe. **Mitigación**: `lib/courses/content.ts` es la frontera; el resto de la app no toca filesystem. Se cambia su implementación, no su firma.
- **Riesgo**: `lessonSlug` colisiona con futuros segmentos hermanos del curso (`/<courseSlug>/recursos`). **Mitigación**: lista de palabras reservadas validada al import en `lib/courses/index.ts`.
- **Riesgo**: el docente edita un MDX y olvida actualizar `articleSlug` en `data/*.ts`. **Mitigación**: la validación al import detecta artículos huérfanos (existe el archivo, nadie lo referencia) y `articleSlug` rotos (referencia sin archivo), fallando en build.
- **Riesgo**: la sidebar en móvil con muchas lecciones causa scroll incómodo dentro del drawer. **Mitigación**: drawer con `overflow-y-auto` y altura `100vh`; lección activa con `scrollIntoView({ block: 'center' })` al abrirse.
- **Riesgo**: `next-mdx-remote/rsc` tiene un cambio breaking en una futura versión. **Mitigación**: el wrapper `lib/mdx/compile.ts` aísla la API; si cambia, se actualiza un único punto.

## Fuera de Alcance

- Búsqueda dentro del artículo o entre lecciones.
- Tabla de contenidos (TOC) auto-generada a partir de los headings del MDX. Anotado como follow-up natural; no es bloqueante para esta fase.
- Comentarios, "me gusta" o métricas de lectura.
- Video, notebooks ejecutables, evaluaciones (Fase 3).
- Migración a Payload (Fase 2): este spec sólo deja la frontera lista (`lib/courses/content.ts`).
- Internacionalización: contenido sólo en español.
- Autenticación, roles y RLS: el contenido sigue siendo público.
- Listado de cursos en la home pública.
