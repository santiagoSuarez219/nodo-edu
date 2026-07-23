# spec-022 — [DONE] Diagramas Mermaid y componentes React personalizados en el pipeline MDX

## Contexto

El pipeline MDX actual (`lib/mdx/compile.ts` + `lib/mdx/components.tsx`) solo
sabe renderizar Markdown "plano": GFM, matemáticas (KaTeX) y bloques de código
resaltados con Shiki vía `rehype-pretty-code`. `mdxComponents` únicamente
mapea elementos HTML estándar (`h1`-`h4`, `p`, listas, tablas, `a`, `img`,
`pre`/`code`) — no hay ningún componente custom registrado ni lógica de
diagramación.

El docente principal, al escribir lecciones en `content/cursos/<curso>/*.mdx`,
necesita hoy dos capacidades que no tiene:

1. **Diagramas como código** (flujos, diagramas de secuencia, ER, estados)
   usando sintaxis Mermoid dentro de un bloque de código, sin depender de
   imágenes exportadas manualmente que quedan desactualizadas.
2. **Bloques de contenido semánticos** (ej. una advertencia, una nota, una
   pestaña con dos variantes de un mismo ejemplo) que hoy solo pueden
   simularse con blockquotes o HTML crudo, perdiendo consistencia visual y
   soporte de modo oscuro.

Ambas capacidades son puramente de **renderizado de contenido**: no exponen
datos ni acciones nuevas a través de la API, así que se evalúan y diseñan en
un único spec de infraestructura del pipeline MDX, no como features de
producto independientes.

## Alcance

### Incluye

- Soporte para bloques de código con lenguaje `mermaid` (` ```mermaid `)
  dentro de cualquier `.mdx` de lección, renderizados como diagrama (no como
  texto resaltado por Shiki).
- Un componente cliente `MermaidDiagram` que renderiza el diagrama en el
  navegador, con soporte de modo claro/oscuro y ancho responsive.
- Habilitar el uso de componentes JSX personalizados dentro del `.mdx`
  (ej. `<Callout tipo="advertencia">...</Callout>`), reutilizando el soporte
  JSX que `@mdx-js/mdx` (usado por `next-mdx-remote/rsc`) ya tiene, sin
  cambiar el compilador.
- Dos componentes custom iniciales, construidos con tokens de `DESIGN.md` y
  compatibles con Server Components (sin `"use client"` salvo que lo
  requieran):
  - `Callout` (variantes: `nota`, `advertencia`, `peligro`, `exito`) — cubre
    el caso de uso mencionado por el docente y reemplaza el patrón informal
    de blockquote-como-aviso.
  - `Tabs` / `Tab` — para mostrar variantes de un mismo ejemplo (ej. mismo
    algoritmo en dos lenguajes) sin duplicar la lección.
- Registro de ambos en `mdxComponents` para que estén disponibles en
  cualquier `.mdx` sin imports explícitos por parte del docente.
- Manejo de errores de sintaxis Mermaid: si el diagrama no parsea, se
  muestra un estado de error legible en vez de romper la página completa.
- Documentación breve de uso (sintaxis soportada) en un comentario o sección
  de referencia interna — no un CMS de ayuda para el docente.

### No incluye

- Renderizado de Mermaid a SVG en servidor/build (ej. `rehype-mermaid` con
  Playwright o mermaid-cli). Se descarta explícitamente — ver "Evaluación de
  alternativas: Mermaid server-side vs. cliente".
- Un editor visual o preview en vivo de Mermaid/JSX para el docente. Fase 1
  sigue siendo autoría por código vía Git.
- Validar o sanear el JSX embebido en `.mdx` como si viniera de un autor no
  confiable (ver "Seguridad de JSX en `.mdx`"). No aplica sandboxing.
- Un catálogo extenso de componentes custom. Solo `Callout` y `Tabs` en este
  spec; otros (ej. `CodeCompare`, embeds de video) quedan para specs futuros
  cuando haya un caso de uso real que los justifique.
- Exponer estos componentes o el catálogo de sintaxis Mermaid vía Payload CMS
  (Fase 2). Ese trabajo depende de decisiones de Payload aún no tomadas.
- Cambios en `rehype-pretty-code`/Shiki para otros lenguajes de código que no
  sean `mermaid`.

## Impacto en el sistema

- **`lib/mdx/compile.ts`** — se agrega un rehype plugin propio que intercepta
  bloques `pre > code.language-mermaid` **antes** de que `rehype-pretty-code`
  los procese, para que Shiki no intente resaltarlos como código fuente.
- **`lib/mdx/rehype-mermaid-block.ts`** (nuevo) — plugin rehype liviano
  (usa `unist-util-visit`, ya presente en el árbol de dependencias como
  transitiva) que transforma esos nodos en un elemento `<div data-mermaid-source="...">`
  con el texto del diagrama, para que `mdxComponents` lo intercepte en el
  render.
- **`lib/mdx/components.tsx`** — se agrega el manejo de
  `div[data-mermaid-source]` para delegar en `MermaidDiagram`, y se registran
  `Callout` y `Tabs`/`Tab` como entradas nuevas del mapa `mdxComponents`.
- **`components/mdx/MermaidDiagram.tsx`** (nuevo, `"use client"`) — importa
  `mermaid` dinámicamente (`next/dynamic` o `import()` diferido), inicializa
  el tema según el modo claro/oscuro activo (observando la clase `dark` en
  `<html>`, igual patrón que el toggle documentado en `DESIGN.md`), renderiza
  el SVG resultante y muestra un estado de error controlado si el parseo
  Mermaid falla.
- **`components/mdx/Callout.tsx`** (nuevo, Server Component) — bloque de
  aviso con 4 variantes, estilos con tokens semánticos (`--color-fg-warning`,
  `--color-fg-danger`, `--color-fg-success`, `--color-border-brand`, etc.) y
  contraparte dark mode según la tabla de `DESIGN.md`.
- **`components/mdx/Tabs.tsx`** (nuevo) — `Tabs` como Client Component
  (necesita estado de pestaña activa) con `Tab` como sub-componente de solo
  datos; usa Flowbite si cubre el patrón de pestañas, o un `<div role="tablist">`
  accesible propio si Flowbite no encaja limpio en Server/Client boundary.
- **`content/cursos/<curso>/*.mdx`** — sin cambios estructurales; los
  artículos existentes siguen siendo Markdown puro y compilan igual. Los
  nuevos bloques Mermaid/JSX son opt-in por lección.
- **`app/(cursos)/[courseSlug]/[lessonSlug]/page.tsx`** y
  **`components/mdx/MdxContent.tsx`** — sin cambios; siguen invocando
  `renderMdx(source)` igual que hoy, el nuevo comportamiento vive dentro del
  pipeline.
- **`package.json`** — nuevas dependencias (ver justificación abajo):
  `mermaid` (dependency) y `unist-util-visit` (dependency directa, hoy
  transitiva).
- **`DESIGN.md`** — no se modifica en este spec; los componentes nuevos deben
  ajustarse a los tokens ya definidos, no se proponen tokens nuevos.

### Evaluación de alternativas: Mermaid server-side vs. cliente

| Criterio | `rehype-mermaid` (Playwright/mermaid-cli, SSR) | `mermaid.js` en cliente (`"use client"`) |
|---|---|---|
| Compatibilidad con Server Components | Genera SVG estático en build/request — en teoría "más RSC-friendly" | Requiere una isla cliente (`"use client"`), pero MDX ya mezcla Server + Client Components hoy (`a`, `img` son Server; nada impide un Client Component puntual) |
| Costo de infraestructura | Necesita un binario de Chromium (Playwright) o `@mermaid-js/mermaid-cli` disponible en el entorno de ejecución. `page.tsx` usa `export const dynamic = "force-dynamic"`, es decir el MDX se recompila **en cada request** dentro de una función serverless de Vercel — instalar y lanzar un navegador headless en cada invocación es lento (cold start) y friccionoso con los límites de tamaño/tiempo de las funciones de Vercel | Cero costo de servidor; el render ocurre en el navegador del visitante |
| Peso de bundle | No agrega JS al cliente | `mermaid` son ~600KB (minified, sin gzip aprox. 200KB gzip) pero se carga solo cuando hay al menos un diagrama en la página, vía import dinámico — no entra al bundle inicial de lecciones sin diagramas |
| Necesidad de JS en cliente | El diagrama es visible incluso sin JS | Requiere JS habilitado para ver el diagrama (degradación: sin JS se ve el bloque de código fuente Mermaid sin renderizar) |
| Complejidad operativa | Alta: gestionar el binario del navegador en Vercel (requiere paquetes como `@sparticuz/chromium` para funciones serverless), aumenta tiempo de build/cold start | Baja: es una dependencia npm más, sin binarios nativos |
| Interactividad | Ninguna (SVG estático) | Mermaid soporta zoom/pan y temas dinámicos client-side si se necesita a futuro |

**Recomendación: renderizado client-side con `mermaid.js`.** El factor
decisivo es que este proyecto no tiene generación estática de las páginas de
lección (`force-dynamic`), así que la alternativa SSR pagaría el costo de un
navegador headless en cada request sin caché de build que lo amortice. El
público objetivo (estudiantes de ingeniería) tiene JS habilitado por
requisito general de la plataforma (login, progreso, autoevaluaciones ya
dependen de JS), así que la degradación sin JS es un riesgo aceptado y
consistente con el resto del producto.

### Seguridad de JSX en `.mdx`

Hoy `compileMDX` (de `next-mdx-remote/rsc`, que usa `@mdx-js/mdx` internamente)
ya compila el archivo como **MDX completo**, no como Markdown restringido:
técnicamente ya acepta JSX arbitrario en la fuente. Lo que falta no es
"habilitar JSX" en el compilador — es **registrar componentes** para que ese
JSX resuelva a algo (`<Callout>` sin entrada en `mdxComponents` hoy fallaría
en build/request porque `Callout` no existe en el scope).

- **Modelo de confianza:** el contenido `.mdx` lo escribe exclusivamente el
  docente principal vía commits a este repositorio (Fase 1). No hay input de
  usuario final ni de estudiantes que llegue a este pipeline. El riesgo de
  XSS/inyección vía JSX embebido es equivalente al riesgo de cualquier otro
  código que el docente principal ya puede escribir en el repo — no es una
  superficie nueva de ataque (por ejemplo, ya podría escribir un archivo
  `.ts` malicioso en `lib/` sin pasar por este spec).
- **Riesgo real a vigilar:** que el JSX libre facilite construir componentes
  con `dangerouslySetInnerHTML` o llamadas a APIs externas sin revisión desde
  el propio `.mdx`. Mitigación: los componentes expuestos en `mdxComponents`
  (`Callout`, `Tabs`, `MermaidDiagram`) son los únicos "bloques de
  construcción" documentados; cualquier JSX que referencie un componente no
  registrado falla en build, no se ejecuta output HTML arbitrario permitido
  por el sistema.
- **Fase 2 (Payload CMS):** cuando la autoría deje de ser exclusivamente vía
  Git y pase a un editor de Payload usado por docentes colaboradores, este
  supuesto de confianza deja de sostenerse — ese momento sí requerirá
  sanitización o una lista blanca más estricta de componentes permitibles.
  Se documenta como deuda arquitectural a revisar en el spec que introduzca
  Payload, no se resuelve aquí.

### Justificación de nuevas dependencias

| Dependencia | Tipo | Qué resuelve | Por qué esta y no otra |
|---|---|---|---|
| `mermaid` (`^11.16.0`) | `dependency` | Motor de parseo y renderizado de diagramas Mermaid en el navegador. | Es la librería de referencia del lenguaje Mermaid (el mismo que usan GitHub y GitLab para renderizar bloques ` ```mermaid ` en Markdown); evita reinventar un parser. Alternativa descartada: `rehype-mermaid` (server-side) — ver tabla comparativa arriba, incompatible con el modelo `force-dynamic` del proyecto sin agregar un navegador headless a la infraestructura. |
| `unist-util-visit` (`^5.1.0`) | `dependency` (pasa de transitiva a directa) | Recorrer el árbol `hast` dentro del plugin rehype propio (`rehype-mermaid-block.ts`) para ubicar los bloques `pre > code.language-mermaid`. | Ya vive en `node_modules` como dependencia transitiva de `remark-rehype`, `rehype-pretty-code` y `rehype-katex` — no agrega peso nuevo al árbol de dependencias, solo se declara explícitamente porque el proyecto pasa a importarla directamente en código propio. |

No se propone ninguna dependencia para `Callout` ni `Tabs`: se construyen
como componentes propios con Tailwind + tokens de `DESIGN.md`, evaluando
primero si Flowbite ya resuelve el patrón de pestañas (`Tabs` de Flowbite)
antes de escribir uno desde cero, según la convención "Flowbite primero" de
`CLAUDE.md`.

## Evaluación MCP

**¿Aplica MCP?** No.

Esta funcionalidad es exclusivamente de renderizado: transforma cómo se
muestra contenido `.mdx` que ya existe en el repositorio, sin exponer datos
nuevos consultables (no hay una tabla, endpoint ni recurso que un agente
necesitaría leer) ni acciones nuevas ejecutables (no hay un "crear diagrama"
o "publicar callout" que un agente docente deba invocar — el docente sigue
escribiendo el `.mdx` a mano vía Git, igual que hoy). Ningún MCP existente
(`question-bank-mcp`, `assignment-mcp`, `attendance-mcp`) cubre un dominio
relacionado con contenido de lecciones. No se crea fase de MCP en este spec.

## Fases de implementación

### Fase 1 — Plugin rehype para bloques Mermaid
- [x] Agregar `mermaid` y `unist-util-visit` a `package.json` (dependencies)
      tras confirmación del usuario.
- [x] Crear `lib/mdx/rehype-mermaid-block.ts`: plugin rehype que visita
      nodos `pre > code` con clase `language-mermaid`, extrae el texto fuente
      del diagrama y reemplaza el nodo `pre` por un `div` con atributo
      `data-mermaid-source` conteniendo el texto (evita que
      `rehype-pretty-code` lo procese como código fuente).
- [x] Editar `lib/mdx/compile.ts`: insertar el nuevo plugin en
      `rehypePlugins` **antes** de `rehypePrettyCode` en el arreglo.
- [x] Crear `components/mdx/MermaidDiagram.tsx` (`"use client"`): recibe el
      texto fuente del diagrama, importa `mermaid` dinámicamente, inicializa
      con `theme` acorde al modo claro/oscuro activo (leer clase `dark` en
      `document.documentElement` al montar y en cambios, igual patrón que el
      toggle de `DESIGN.md`), renderiza el SVG resultante dentro de un
      contenedor con `overflow-x-auto` y bordes con tokens
      (`border-gray-200 dark:border-gray-700`, `rounded-lg`). Se agregó
      `suppressErrorRendering: true` en `mermaid.initialize` — sin esa
      opción, `mermaid.js` inserta su propio widget de error flotante en el
      DOM además del estado de error propio del componente (hallazgo de la
      Fase 4).
- [x] Manejar errores de parseo Mermaid: capturar la excepción de
      `mermaid.render`, mostrar un bloque de error con el mensaje y el texto
      fuente sin procesar (para que el docente pueda depurar sin romper la
      página).
- [x] Editar `lib/mdx/components.tsx`: agregar el mapeo para el `div` con
      `data-mermaid-source` que delega en `MermaidDiagram`.

### Fase 2 — Componentes custom: `Callout`
- [x] Crear `components/mdx/Callout.tsx` (Server Component): prop `tipo`
      (`nota` | `advertencia` | `peligro` | `exito`, default `nota`),
      `children`. Estilos con tokens semánticos de `DESIGN.md`
      (`--color-fg-warning`, `--color-fg-danger`, `--color-fg-success`,
      `--color-border-brand`) y contraparte dark mode.
- [x] Registrar `Callout` en `mdxComponents` (`lib/mdx/components.tsx`) para
      que esté disponible sin import explícito en cualquier `.mdx`.
- [x] Verificado con contenido de prueba temporal (revertido tras la
      validación, ver Fase 4); no se agregó un `<Callout>` permanente a una
      lección real por no ser parte del alcance del spec.

### Fase 3 — Componentes custom: `Tabs` / `Tab`
- [x] Evaluado: Flowbite no resuelve limpiamente el patrón dentro del límite
      Server/Client de `next-mdx-remote`; se construyó `Tabs`/`Tab` propio.
- [x] Crear `components/mdx/Tabs.tsx` (`"use client"` por el estado de
      pestaña activa) y `Tab` como componente de datos (solo pasa `label` +
      `children`, sin lógica propia).
- [x] Registrar `Tabs` y `Tab` en `mdxComponents`.
- [x] Verificar accesibilidad básica (roles `tablist`/`tab`/`tabpanel`,
      navegación por teclado con flechas y foco visible) — verificado
      manualmente en navegador, ver Fase 4.

### Fase 4 — Verificación end-to-end del pipeline
- [x] Se editó temporalmente `fundamentos-control-de-versiones.mdx` (lección
      sin contenido aún) con: un diagrama Mermaid válido, uno con sintaxis
      inválida, un `Callout` de cada variante (incluida la variante por
      defecto sin prop `tipo`) y un `Tabs` con 2 `Tab`. El cambio se revirtió
      tras la validación — la lección quedó igual que antes del spec.
- [x] Verificado manualmente en `npm run dev` con navegador real: diagrama
      válido renderiza SVG, diagrama inválido muestra estado de error legible
      sin romper la página, el diagrama reacciona en vivo al cambio de
      `.dark` en `<html>` (probado alternando la clase sin recargar), sin
      errores en consola, `Tabs` navega por click y por teclado (flechas +
      foco visible), y `npm run build` + `npm run lint` pasan sin errores.
- [x] Confirmado sin regresión: se abrió `implementacion-de-pilas-en-java`
      (lección con contenido real preexistente) y renderiza idéntico a antes
      del spec (párrafos, negritas, código con Shiki).

## Criterios de aceptación

- Un bloque ` ```mermaid ` dentro de un `.mdx` de lección se renderiza como
  diagrama SVG, no como texto de código resaltado.
- Un bloque ` ```mermaid ` con sintaxis inválida muestra un estado de error
  legible en la página, sin romper el render del resto del artículo.
- El diagrama Mermaid se ve correctamente en modo claro y en modo oscuro,
  respetando el toggle de tema ya existente en la plataforma.
- El docente puede escribir `<Callout tipo="advertencia">...</Callout>` (y
  las otras 3 variantes) dentro de un `.mdx` y ver el bloque estilizado
  según tokens de `DESIGN.md`, en ambos modos de color.
- El docente puede escribir `<Tabs><Tab label="...">...</Tab>...</Tabs>`
  dentro de un `.mdx` y ver pestañas navegables por click y por teclado.
- Los artículos `.mdx` existentes (sin Mermaid ni componentes custom) se
  siguen renderizando sin cambios visuales ni funcionales.
- `npm run build` y `npm run lint` pasan sin errores tras los cambios.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-022-mdx-mermaid-y-componentes-custom.md`
  — casos `TC-001` a `TC-0NN` cubriendo: render de diagrama válido, render de
  diagrama inválido (estado de error), modo claro/oscuro del diagrama,
  cada variante de `Callout`, navegación de `Tabs` (mouse y teclado), y
  regresión de una lección existente sin estos elementos.
- **Automáticas (e2e/unit):** no aplica todavía — el framework de testing
  del proyecto está "por definir" según `CLAUDE.md` (sección "Testing"). Se
  documentan como pendientes de creación cuando exista el framework; los
  criterios de aceptación de esta sección sirven de base para esos casos
  futuros.
