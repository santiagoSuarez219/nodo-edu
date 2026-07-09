# spec-004 — [IN PROGRESS] Landing page pública (home `/`) — Dashboard de retorno

## Contexto

La home pública actual (`app/page.tsx`, ruta `/`) es un placeholder simple con un
único bloque de bienvenida. El proyecto ya tiene un diseño aprobado ("opción 1c —
Dashboard de retorno", importado desde un proyecto Claude Design) que presenta Nodo
como una plataforma de cursos con estética "de retorno": un hero que invita a
continuar, un carrusel de cursos, una explicación de cómo funciona la plataforma,
la presentación del docente principal y un footer.

Esta landing es **de marketing / presentación**: comunica la propuesta de valor de
Nodo con contenido de ejemplo estático. No implementa autenticación real, ni
progreso real de usuario, ni consultas a Supabase. Es la primera pantalla que ve un
visitante y sienta la base visual de la marca dentro de la app.

## Alcance

### Incluye
- Reemplazar `app/page.tsx` con la landing "opción 1c" completa.
- Contenido y datos **estáticos hardcoded** (los del diseño), viviendo en un módulo
  de dominio `lib/landing/` (datos + tipos), no dispersos dentro del componente de
  página.
- Componentes de presentación reutilizables bajo `components/landing/`.
- Reuso del `<Navbar>` global ya montado en `app/layout.tsx` (se descarta el nav
  propio del diseño).
- Diseño responsive mobile-first (el mockup es de 1280px).
- Accesibilidad: jerarquía de encabezados, listas semánticas, foco visible,
  contraste vía tokens semánticos.
- Metadata de página (`title` / `description`) para `/`.

### No incluye
- Auth real, sesión o lectura del usuario actual (el hero saluda con texto estático).
- Progreso real de lecciones (las barras muestran porcentajes hardcoded del diseño).
- Consumo de cursos reales desde `lib/courses/getAllCourses()` (ver "Decisión de
  datos"). La landing usa su propio set de datos de ejemplo.
- Integración con Payload CMS o Supabase.
- Resolver la discrepancia de marca "Semillero SITAIM" (Navbar) vs "nodo" (diseño)
  — se documenta como deuda, no se toca en este spec.
- Nuevos assets en `public/` (el logo del diseño no se importa; la marca del footer
  es texto "nodo").

## Impacto en el sistema

- **Frontend público / rutas:** se reemplaza `app/page.tsx` (ruta `/`). No se
  agregan rutas nuevas. Se añade `export const metadata` a la página.
- **Componentes:** nuevo directorio `components/landing/` con componentes de
  presentación (Server Components). No se modifican los componentes existentes de
  `components/courses/` ni `components/navbar/`.
- **Capa de datos:** nuevo módulo `lib/landing/` (datos estáticos + tipos). No toca
  `lib/courses/`.
- **Layout:** sin cambios. El `<body>` ya aplica `pt-16 lg:pt-0` para el Navbar
  fijo; la landing añade su propio padding-top en `lg` para no quedar bajo el navbar
  fijo en desktop (mismo patrón usado en `/cuenta`).
- **Base de datos / Auth / Storage:** sin cambios. No hay tablas, políticas RLS ni
  llamadas a Supabase.
- **MCP:** sin cambios (ver "Evaluación MCP").

### Decisión de datos (estáticos en `lib/landing/`)
El usuario definió datos estáticos del diseño. Se recomienda alojarlos en
`lib/landing/data.ts` (constantes tipadas) con sus tipos en `lib/landing/types.ts`,
en lugar de constantes locales dentro de `app/page.tsx`. Motivos:
- Mantiene el componente de página delgado y centrado en composición.
- Es coherente con el patrón del proyecto (`lib/courses/` separa datos de UI).
- Facilita la Fase 2 futura: cuando exista progreso/cursos reales, se sustituye el
  origen de datos sin reescribir los componentes de presentación (que reciben props).

No se consumen los cursos reales de `getAllCourses()` en este spec: el set de la
landing es de marketing y sus porcentajes de progreso no existen aún como dato real.

### Nota — enlaces (hrefs) de los CTA
Los botones/links del diseño ("Continuar cursando", "Retomar lección →",
"Ver catálogo completo →", cards de curso, links del footer) apuntan a destinos que
en este spec son **estáticos**. Durante la implementación se verificará contra las
rutas reales existentes (grupo `(cursos)/[courseSlug]/[lessonSlug]`). Si un destino
(p. ej. índice de catálogo `/cursos`) aún no existe como ruta, el enlace apuntará al
recurso disponible más cercano o a un `href` placeholder documentado, sin crear
rutas nuevas en este spec.

### Nota — deuda: discrepancia de marca
El Navbar global muestra "Semillero SITAIM" mientras el diseño de la landing usa la
marca "nodo" (hero/footer). No se unifica en este spec. Registrar en
`docs/specs/backlog.md` para decidir la marca canónica en un spec posterior.

## Evaluación MCP

**¿Aplica MCP?** No.

Justificación: la landing es una página de presentación con contenido estático y sin
lógica de negocio. No expone datos consultables ni acciones ejecutables que un
agente pudiera necesitar (no hay lectura de progreso real, ni escritura, ni
endpoints). No existe un MCP relacionado que extender ni un agente en `docs/mcps/`
que se beneficie. Por tanto no se añade fase de MCP.

## Fases de implementación

### Fase 1 — Capa de datos estáticos (`lib/landing/`)
- [x] Crear `lib/landing/types.ts` con los tipos de la landing:
  `LandingCourse` (id, slug/href, name, level, hours, description, progress),
  `ResumeState` (courseName, lessonName, progress, href),
  `RoadmapStep` (number, title, description),
  `Teacher` (name, role, bio, initial),
  `FooterLink` (label, href).
- [x] Crear `lib/landing/data.ts` con las constantes tipadas del diseño:
  `LANDING_COURSES` (los 5 cursos), `RESUME_STATE` (Estructuras de Datos / Árboles
  balanceados / 72%), `ROADMAP_STEPS` (01–04), `MAIN_TEACHER`, `FOOTER_LINKS`.
- [x] (Opcional) `lib/landing/index.ts` como barrel de re-exports.

### Fase 2 — Componentes de presentación reutilizables (`components/landing/`)
> Todos Server Components (sin estado interactivo). Reciben props tipadas desde
> `lib/landing`. Estilos con tokens semánticos de DESIGN.md (modo claro/oscuro),
> nunca colores crudos de la paleta.
- [x] `components/landing/ProgressBar.tsx` — track + fill reutilizable
  (usado por `ResumeCard` y `CourseCard`). Recibe `value` (0–100) y un
  `label` accesible. Track `bg-gray-200 dark:bg-gray-700`, fill `bg-blue-700
  dark:bg-blue-600`; `width` según `value`.
- [x] `components/landing/LevelBadge.tsx` — badge de nivel en mayúsculas
  (Intermedio / Avanzado). Usa badge info de DESIGN.md
  (`bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`).
- [x] `components/landing/CourseCard.tsx` — card de curso (ancho fijo ~240px):
  `LevelBadge`, nombre (heading de la card), descripción, meta ({progress}% /
  {hours}h), `ProgressBar`. Envuelto en enlace a su `href`.
- [x] `components/landing/ResumeCard.tsx` — card "Continuar": label, nombre del
  curso, `ProgressBar` 72%, meta (lección actual / porcentaje), botón
  "Retomar lección →".

### Fase 3 — Secciones de la landing (`components/landing/`)
- [x] `components/landing/Hero.tsx` — grid 2 columnas (`lg:grid-cols-[1.1fr_0.9fr]`,
  1 columna en móvil). Izquierda: greeting "Hola de nuevo 👋", **h1**
  "Seguí donde lo dejaste.", subtítulo, CTA "Continuar cursando". Derecha:
  `<ResumeCard>`.
- [x] `components/landing/CourseScroller.tsx` — sección "Tus cursos" con **h2** y
  link "Ver catálogo completo →". Scroller horizontal (`flex gap overflow-x-auto`,
  scroll-snap en móvil) que mapea `LANDING_COURSES` a `<CourseCard>` dentro de una
  lista semántica (`ul`/`li`).
- [x] `components/landing/HowItWorks.tsx` — sección "Cómo funciona" con **h2** y
  lista ordenada (`ol`) de `ROADMAP_STEPS`: dot numerado (01–04), título,
  descripción.
- [x] `components/landing/TeacherBar.tsx` — sección "Docente principal" con **h2**:
  barra horizontal con avatar (inicial "N"), nombre + rol, bio.
- [x] `components/landing/LandingFooter.tsx` — footer con marca "nodo © 2026" y
  `FOOTER_LINKS` (GitHub / Documentación / Contacto) en lista semántica.

### Fase 4 — Ensamblaje de la página, metadata y pasada responsive/a11y
- [x] Reemplazar `app/page.tsx`: componer `Hero → CourseScroller → HowItWorks →
  TeacherBar → LandingFooter` dentro del `<main>`, sin nav propio (usa el Navbar
  global). Aplicar padding-top en `lg` para el navbar fijo (patrón de `/cuenta`) y
  el padding horizontal de secciones (mobile-first: `px-6` → `lg:px-13`).
- [x] Añadir `export const metadata` en `app/page.tsx` con `title` y `description`
  propios de la home (SEO).
- [x] Verificar landmarks y jerarquía de headings: un solo **h1** (hero), **h2** por
  sección; secciones con `aria-labelledby`; `footer` con `role`/etiqueta.
- [x] Verificar responsive: colapso del hero a 1 columna en móvil (texto arriba,
  `ResumeCard` debajo) y scroller de cursos con desplazamiento horizontal táctil.
- [x] Verificar modo claro/oscuro en todas las superficies, textos y bordes usando
  únicamente tokens de la tabla de DESIGN.md.
- [x] Confirmar `hrefs` de CTA contra rutas reales existentes (ver nota de enlaces).
- [x] Registrar en `docs/specs/backlog.md` la deuda de marca "Semillero SITAIM" vs
  "nodo".
- [x] `npm run lint` y `npm run build` sin errores.

## Criterios de aceptación

- Al visitar `/`, el usuario ve la landing "1c" con las cinco secciones en orden:
  hero, "Tus cursos", "Cómo funciona", "Docente principal" y footer.
- El hero muestra el greeting, un **h1** "Seguí donde lo dejaste.", el subtítulo, el
  CTA "Continuar cursando" y, a la derecha, la card "Continuar" con barra de progreso
  al 72% y la lección "Árboles balanceados".
- La sección "Tus cursos" lista los 5 cursos del diseño en un scroller horizontal;
  cada card muestra su badge de nivel, nombre, descripción, meta ({progress}% /
  {hours}h) y barra de progreso con el ancho correspondiente a su porcentaje.
- "Cómo funciona" muestra los 4 pasos (01–04) con título y descripción en una lista
  ordenada.
- "Docente principal" muestra el avatar, nombre, rol y bio del docente.
- El footer muestra "nodo © 2026" y los tres enlaces (GitHub / Documentación /
  Contacto).
- Se reutiliza el Navbar global del layout; la página no renderiza un nav propio.
- En viewport móvil, el hero colapsa a una sola columna (texto arriba, card debajo)
  y el listado de cursos se desplaza horizontalmente; ningún contenido queda oculto
  bajo el navbar fijo.
- La página respeta el modo claro y oscuro usando solo tokens semánticos (sin
  colores crudos de la paleta).
- Existe un único `h1` en la página y cada sección usa `h2`; las colecciones (cursos,
  pasos, links del footer) usan listas semánticas.
- `npm run build` y `npm run lint` pasan sin errores.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-004-landing-home.md` — casos `TC-001`…`TC-010`
  (flujos con UI). No aplican casos `TC-MCP` (no hay fase de MCP).
- **Automáticas (e2e/unit):** framework de testing **por definir** (ver sección
  "Testing" de CLAUDE.md). Cuando exista, se crearán en
  `{{ubicación e2e por definir}}/e2e-004-landing-home.spec.ts` con un caso por
  criterio de aceptación (render de secciones, orden, colapso responsive del hero,
  scroller horizontal, jerarquía de headings, modo claro/oscuro), en rojo hasta que
  la implementación los ponga en verde.
