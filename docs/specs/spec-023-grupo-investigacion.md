# spec-023 — [DONE] Sección pública del grupo de investigación

## Contexto

La institución tiene un grupo de investigación en Ciencia de Datos e
Inteligencia Artificial con líneas de investigación, semilleros y
oportunidades de vinculación para estudiantes. Hoy no existe ninguna página
en Nodo que comunique esta información: es contenido puramente informativo,
de lectura pública, sin relación con un curso ni con matrícula.

El diseño fue importado del proyecto de Claude Design "Landing page design
options" (archivo `Nodo Research Group.dc.html`), que define una página con
hero + leader card, tres secciones en grid (líneas de investigación,
semilleros, oportunidades de vinculación) y un banner de cierre.

Decisiones ya tomadas con el usuario (ver hilo de la sesión):

- La página reutiliza el `Navbar` global de `app/layout.tsx`. **No** se
  replica el nav propio del mockup (logo + `← Cursos` + toggle claro/oscuro
  manual): `DESIGN.md` prohíbe el toggle manual — el tema sigue siempre
  `prefers-color-scheme` — y el sitio ya tiene navegación global.
- Ruta pública top-level `/grupo-investigacion`, sin route group y sin
  `requireUser` (a diferencia de `/[courseSlug]/presentacion`, que sí exige
  sesión).
- Se agrega un link a esta página en el `Navbar` global (desktop y menú
  mobile), que hoy solo tiene logo + login/`UserMenu`.

## Alcance

### Incluye

- Módulo de datos `lib/grupo-investigacion/` (types + data + index) con el
  contenido del grupo, tomado literalmente del mockup: nombre del grupo,
  descripción, líder (con placeholders `[Nombre del líder]` donde el mockup
  los trae — son placeholders de **contenido real** a completar por el
  docente más adelante, no TODOs de código), 3 líneas de investigación, 3
  semilleros, 3 oportunidades de vinculación.
- Componentes de presentación en `components/grupo-investigacion/` para
  hero, líneas de investigación, semilleros, oportunidades y el banner CTA
  de cierre.
- Página pública `app/grupo-investigacion/page.tsx`.
- Link nuevo en `components/navbar/Navbar.tsx` (desktop + mobile) hacia
  `/grupo-investigacion`.

### No incluye

- El banner "Explorá otros semilleros de la institución": se implementa como
  elemento visual no interactivo (sin `href` ni `onClick` funcional); no
  existe todavía una página de semilleros institucionales a la que enlazar.
  Se conecta en un spec futuro.
- Cualquier dato dinámico desde Supabase (roster de investigadores, cupos de
  semilleros, etc.): todo el contenido es estático, igual criterio que
  `lib/course-presentations/data/*`.
- Edición del contenido desde un panel admin: por ahora el contenido solo se
  actualiza editando el archivo `.ts` (Fase 2 del proyecto, con Payload CMS,
  lo hará configurable).
- Cambios en `LandingFooter`, `FOOTER_LINKS`, o en la página de presentación
  de curso (`/[courseSlug]/presentacion`) y su `InstructorFooter`.
- Internacionalización o multi-idioma: contenido solo en español.

## Impacto en el sistema

**Datos**
- Nuevo `lib/grupo-investigacion/types.ts`:
  - `ResearchGroupLeader`: `name`, `initial`, `email`, `phone`.
  - `ResearchLine`: `title`, `desc`, `leader`, `researchers: string[]`,
    `projects: string[]`.
  - `ResearchSeedbed`: `name`, `leader`, `days`, `room`.
  - `EngagementOpportunity`: `tag`, `title`, `desc`.
  - `ResearchGroup` (raíz): `name`, `desc`, `leader: ResearchGroupLeader`,
    `lines: ResearchLine[]`, `seedbeds: ResearchSeedbed[]`,
    `opportunities: EngagementOpportunity[]`.
- Nuevo `lib/grupo-investigacion/data/grupo-investigacion.ts`: exporta
  `RESEARCH_GROUP: ResearchGroup` con el contenido literal del mockup (3
  líneas, 3 semilleros, 3 oportunidades).
- Nuevo `lib/grupo-investigacion/index.ts`: re-exporta tipos y
  `RESEARCH_GROUP`.

**Componentes**
- `components/grupo-investigacion/ResearchGroupHero.tsx`: badge, `h1`,
  descripción, leader card (avatar con inicial, nombre, rol "Líder del
  grupo", email, teléfono).
- `components/grupo-investigacion/ResearchLines.tsx`: grid de cards de
  líneas de investigación (título, descripción, líder, tags de
  investigadores, lista de proyectos).
- `components/grupo-investigacion/ResearchSeedbeds.tsx`: grid de cards de
  semilleros (nombre, líder, días, aula).
- `components/grupo-investigacion/EngagementOpportunities.tsx`: grid de
  cards de oportunidades (tag, título, descripción).
- `components/grupo-investigacion/OtherSeedbedsCta.tsx`: banner de cierre no
  interactivo.
- `components/grupo-investigacion/ResearchGroupPage.tsx`: contenedor que
  recibe `group: ResearchGroup` y ensambla las secciones anteriores, tamaño
  de referencia similar a `CoursePresentation.tsx`.

**Página**
- `app/grupo-investigacion/page.tsx`: Server Component top-level,
  `generateMetadata` async (título/descripción desde `RESEARCH_GROUP`), sin
  `requireUser`. Renderiza `ResearchGroupPage` + `LandingFooter` (con
  `FOOTER_LINKS` existentes), siguiendo el mismo layout de
  `app/page.tsx`/`presentacion/page.tsx` (contenedor `2xl:max-w-7xl`, borde
  divisor antes del footer).

**Navbar**
- `components/navbar/Navbar.tsx`: agrega link "Grupo de Investigación" hacia
  `/grupo-investigacion` en la barra desktop (junto a login/`UserMenu`) y en
  el menú mobile (con `closeMenu` al navegar), sin alterar la lógica de
  sesión/roles existente.

## Evaluación MCP

**¿Aplica MCP?** No.

- *¿Expone datos que un agente consultaría?* No: contenido estático
  file-based, mismo criterio que `spec-012`/`spec-015` (presentación de
  curso). No hay API ni tabla nueva.
- *¿Permite acciones que un agente ejecutaría?* No: página de solo lectura,
  sin formularios ni escritura.
- *¿Existe un MCP relacionado a extender?* No. `question-bank-mcp`,
  `assignment-mcp` y `attendance-mcp` cubren dominios de evaluación y
  asistencia, no contenido institucional estático.
- *¿Hay un agente en `docs/mcps/` que se beneficie?* No.

No se añade fase de MCP.

## Fases de implementación

### Fase 1 — Tipos y datos (`lib/grupo-investigacion/`)
- [x] Leer `DESIGN.md` (aplica por ser cambio de UI).
- [x] Crear `lib/grupo-investigacion/types.ts` con `ResearchGroupLeader`,
      `ResearchLine`, `ResearchSeedbed`, `EngagementOpportunity` y
      `ResearchGroup`.
- [x] Crear `lib/grupo-investigacion/data/grupo-investigacion.ts` con
      `RESEARCH_GROUP`, contenido literal del mockup (placeholders de
      contenido real tipo `[Nombre del líder]` donde corresponda).
- [x] Crear `lib/grupo-investigacion/index.ts` re-exportando tipos y
      `RESEARCH_GROUP`.

### Fase 2 — Componentes de presentación (`components/grupo-investigacion/`)
- [x] Crear `ResearchGroupHero.tsx`.
- [x] Crear `ResearchLines.tsx`.
- [x] Crear `ResearchSeedbeds.tsx`.
- [x] Crear `EngagementOpportunities.tsx`.
- [x] Crear `OtherSeedbedsCta.tsx` (no interactivo).
- [x] Crear `ResearchGroupPage.tsx` ensamblando las secciones anteriores.

### Fase 3 — Página pública (`app/grupo-investigacion/page.tsx`)
- [x] Crear la página con `generateMetadata` async y sin `requireUser`.
- [x] Ensamblar `ResearchGroupPage` + `LandingFooter`/`FOOTER_LINKS`
      existentes, mismo layout que `app/page.tsx`.
- [x] Verificar que no haya `useEffect` ni fetch cliente: todo el dato viene
      de `lib/grupo-investigacion`.

### Fase 4 — Link en Navbar global
- [x] Editar `components/navbar/Navbar.tsx`: agregar link
      "Grupo de Investigación" hacia `/grupo-investigacion` en desktop y en
      el menú mobile (con `closeMenu`).
- [x] Confirmar que no se introduce ningún toggle de tema manual ni se
      rompe el layout actual del navbar.

### Fase 5 — Verificación
- [x] `npm run build` y `npm run lint` sin errores (relativos a los archivos nuevos).
- [ ] Revisión manual en modo claro y oscuro contra los tokens de
      `DESIGN.md`.
- [ ] Confirmar que el link del Navbar funciona en desktop y mobile, y que
      el `LandingFooter` reutilizado se ve idéntico al de otras páginas
      públicas.

## Criterios de aceptación

- `/grupo-investigacion` es accesible sin sesión iniciada (página pública).
- La página muestra: hero con nombre/descripción del grupo y leader card
  (nombre, rol, email, teléfono); sección "Líneas de investigación" con 3
  cards (título, descripción, líder, investigadores, proyectos); sección
  "Semilleros de investigación" con 3 cards (nombre, líder, días, aula);
  sección "Oportunidades de vinculación" con 3 cards (tag, título,
  descripción); banner de cierre no interactivo.
- La página usa el `Navbar` global del sitio (sin nav propio ni toggle
  manual de tema) y respeta el modo claro/oscuro vía `prefers-color-scheme`.
- El `Navbar` global muestra un link a "Grupo de Investigación" tanto en
  desktop como en el menú mobile, y navega correctamente a
  `/grupo-investigacion`.
- El footer de la página es el `LandingFooter` existente, sin
  modificaciones a `FOOTER_LINKS` ni al componente.
- Todo el contenido proviene de `lib/grupo-investigacion/data/grupo-investigacion.ts`
  (ningún dato hardcodeado directamente en los componentes o la página).
- `npm run build` y `npm run lint` pasan sin errores.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-023-grupo-investigacion.md` — casos
  `TC-001` a `TC-008`.
- **Automáticas (e2e/unit):** no aplica — framework de testing automático
  aún "por definir" (ver sección "Testing" de `CLAUDE.md`).
