# spec-025 — [DONE] Embeber videos de YouTube en lecciones MDX
> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

El pipeline MDX de Nodo (`lib/mdx/compile.ts` + `lib/mdx/components.tsx`)
soporta hoy tres "bloques de construcción" registrados en `mdxComponents`:
`Callout`, `Tabs`/`Tab` y el manejo especial de diagramas Mermaid vía
`div[data-mermaid-source]` → `MermaidDiagram`. Los tres fueron introducidos en
**spec-022-mdx-mermaid-y-componentes-custom** (`[DONE]`), que estableció el
patrón a seguir (componente Server/Client Component propio, registrado en
`mdxComponents`, sin sanitización JSX porque el `.mdx` lo escribe solo el
docente principal vía Git) y que **excluyó explícitamente los "embeds de
video"** de su alcance, dejándolos para un spec futuro "cuando haya un caso de
uso real que los justifique".

Ese caso de uso ya existe: el docente principal quiere poder insertar videos
de YouTube (explicaciones grabadas, clases previas, referencias externas)
directamente en una lección `.mdx`, con la misma consistencia visual del resto
de componentes custom (bordes, radius, dark mode) y sin recurrir a HTML
`<iframe>` crudo — que hoy tampoco funcionaría, porque `iframe` no está
mapeado en `mdxComponents` y el compilador fallaría el build al no encontrar
el componente en scope.

Este spec cubre exclusivamente el componente de renderizado (`YouTubeEmbed`) y
su registro en el pipeline. No cambia el modelo de autoría (Fase 1, Git) ni
introduce infraestructura nueva de video (eso corresponde a Mux/Cloudflare
Stream, previsto para más adelante en la visión del proyecto, y fuera de
alcance aquí).

## Alcance

### Incluye

- Un componente `YouTubeEmbed` que el docente puede usar en cualquier
  `content/cursos/<curso>/*.mdx` como `<YouTubeEmbed id="dQw4w9WgXcQ" />` o
  `<YouTubeEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />`.
  Acepta **ambas** props porque el docente normalmente copia una URL completa
  desde el navegador (`youtube.com/watch?v=`, `youtu.be/`, o
  `youtube.com/embed/`) y exigir solo el ID añade fricción sin beneficio; si
  se pasan ambas, `id` tiene prioridad y se ignora `url`.
- Extracción y **validación** del ID de video: si `url` no corresponde a un
  dominio de YouTube reconocido o no contiene un ID de video válido
  (patrón `[A-Za-z0-9_-]{11}`), o si `id` tiene un formato inválido, el
  componente falla de forma explícita (error legible en build/request, mismo
  criterio que el estado de error ya usado por `MermaidDiagram` ante Mermaid
  inválido) — no renderiza silenciosamente un iframe roto.
- Prop opcional `title` (recomendada, usada como `title`/`aria-label`
  accesible del iframe y del botón de play); si no se provee, se usa un
  título genérico (`"Video de YouTube"`) documentado como fallback, no como
  comportamiento ideal.
- Prop opcional `start` (segundos) para iniciar el video en un punto
  específico (`start=` en la URL del embed final).
- **`autoplay` no es una prop expuesta.** El video nunca autorreproduce al
  cargar la página; solo inicia reproducción tras interacción explícita del
  usuario. Es una decisión fija de buenas prácticas (accesibilidad — WCAG 2.2
  SC 1.4.2 "Audio Control" — y performance), no un parámetro configurable
  por el docente.
- Contenedor responsive con `aspect-ratio` 16:9 (evita layout shift mientras
  carga), bordes y radius con los tokens semánticos de `DESIGN.md`
  (`border-gray-200` / `dark:border-gray-700`, radius equivalente al usado
  por `Callout`/`Tabs`/imágenes de MDX), consistente en modo claro/oscuro.
- **Patrón facade / lazy-load**: el componente renderiza inicialmente una
  miniatura del video (thumbnail de YouTube) con un botón de reproducción
  superpuesto; el `<iframe>` real de `youtube-nocookie.com/embed/...` solo se
  monta en el DOM tras el clic del usuario. Ver justificación en "Evaluación
  de alternativas".
- Accesibilidad: el botón de reproducción inicial es un `<button>` real
  (no un `<div onClick>`) con `aria-label` descriptivo derivado de `title`;
  una vez montado, el `<iframe>` lleva `title` descriptivo (WCAG 2.2 SC 4.1.2)
  y `allow="accelerometer; encrypted-media; gyroscope; picture-in-picture;
  web-share"` — sin `autoplay` en la lista de permisos.
- Registro de `YouTubeEmbed` en `mdxComponents` para que esté disponible sin
  imports explícitos por parte del docente, igual que `Callout`/`Tabs`.

### No incluye

- Soporte para otras plataformas de video (Vimeo, Loom, etc.) — solo
  YouTube, que es el caso de uso reportado. Un componente genérico
  `VideoEmbed` multi-proveedor queda para un spec futuro si aparece esa
  necesidad.
- Integración con Mux o Cloudflare Stream (video propio alojado) — dominio
  completamente distinto (requiere Storage, transcoding, posiblemente control
  de acceso por matrícula). Este spec es solo para embeber contenido público
  ya alojado en YouTube.
- Analítica de reproducción (ej. eventos de "video visto" para seguimiento de
  estudiantes) — pertenece al dominio de seguimiento de estudiantes, no a
  este spec de renderizado.
- Playlists de YouTube (`list=`) o videos privados/no listados con
  restricciones de dominio — fuera de alcance; el componente asume videos
  públicos o no listados embebibles.
- Descarga o proxy del thumbnail a Storage propio — se consume directamente
  desde `i.ytimg.com` (dominio de YouTube).
- Un editor visual o helper para que el docente pegue una URL y se
  autogenere el JSX — sigue siendo autoría manual de `.mdx` vía Git (Fase 1).

### Decisión: Server o Client Component

`YouTubeEmbed` es **Client Component** (`"use client"`). Necesita estado
local (¿ya se hizo clic para cargar el iframe?) para implementar el patrón
facade — a diferencia de `Callout` (puramente presentacional, Server
Component), pero con el mismo perfil que `Tabs` y `MermaidDiagram`, que ya
son Client Components dentro del mismo pipeline MDX. La validación y
extracción del ID de la URL, al ser lógica pura sin dependencia del DOM, se
extrae a una función utilitaria separada (ver "Impacto en el sistema").

### Decisión: facade/lazy-load vs. iframe directo

Se elige **facade/lazy-load construido a medida**, sin librería externa (ver
"Justificación de nuevas dependencias"). El iframe de `youtube.com/embed/`
carga una cantidad significativa de JS/CSS/red de terceros (analítica de
Google, `www-embed-player.js`, cookies de YouTube) incluso antes de que el
usuario decida reproducir el video — costo de performance conocido y
documentado (es el motivo por el que existe `lite-youtube-embed` de Paul
Irish, adoptado por web.dev/Lighthouse como patrón recomendado). Cargar ese
peso solo tras un clic explícito evita penalizar el tiempo de carga de toda
lección que incluya un video, justo el tipo de contenido (clases grabadas,
ejemplos) que se espera usar con frecuencia en este proyecto educativo. No
hay un presupuesto de Lighthouse explícito en `CLAUDE.md`/`DESIGN.md`, pero es
buena práctica general de bajo costo de implementación que evita degradar
páginas de lección ya `force-dynamic` (no estáticas).

## Impacto en el sistema

- **`components/mdx/YouTubeEmbed.tsx`** (nuevo, `"use client"`) — componente
  principal: recibe `id?`, `url?`, `title?`, `start?`; usa
  `parseYouTubeVideoId` (ver util abajo) para resolver y validar el ID;
  mantiene estado `isPlaying` (`useState`); renderiza el thumbnail + botón de
  play mientras `isPlaying === false`, y el `<iframe>` de
  `youtube-nocookie.com/embed/<id>` una vez que pasa a `true`. Estilos con
  Tailwind y tokens de `DESIGN.md` (contenedor `aspect-video`, radius y
  borde semánticos, contraparte dark mode).
- **`lib/mdx/youtube.ts`** (nuevo) — función pura `parseYouTubeVideoId(input:
  { id?: string; url?: string }): string` (lanza/retorna error ante entrada
  inválida) que centraliza la extracción/validación de ID desde los formatos
  de URL soportados (`watch?v=`, `youtu.be/`, `youtube.com/embed/`) y desde
  un `id` pasado directo. Se separa del componente para poder testearla de
  forma aislada (unit test cuando exista framework) sin necesidad de un
  entorno DOM/React.
- **`lib/mdx/components.tsx`** — se agrega la entrada `YouTubeEmbed` al mapa
  `mdxComponents`, siguiendo el mismo patrón usado para `Callout` y `Tabs`.
- **`content/cursos/<curso>/*.mdx`** — sin cambios estructurales; el
  componente queda disponible como opt-in en cualquier lección nueva o
  editada por el docente.
- **`next.config.ts`** — si se decide usar `next/image` para el thumbnail
  (`i.ytimg.com`), requiere agregar `i.ytimg.com` a `images.remotePatterns`.
  Por defecto se usa `<img>` nativo (más simple, evita tocar configuración
  global de Next.js para una carga diferida de baja frecuencia); la decisión
  final se resuelve en la Fase 2 de implementación.
- **`DESIGN.md`** — no se modifica; el componente reutiliza tokens de radius
  y borde ya definidos, sin proponer tokens nuevos.
- **`package.json`** — sin nuevas dependencias (ver justificación abajo).

### Evaluación de alternativas

| Criterio | Iframe directo (siempre montado) | Facade propio (este spec) | Librería `react-lite-youtube-embed` / `lite-youtube-embed` |
|---|---|---|---|
| Peso inicial de la página | Alto: descarga JS/CSS/cookies de YouTube en cada carga de la lección, aunque el visitante nunca reproduzca el video | Bajo: solo una imagen (thumbnail) hasta el clic | Bajo (similar al facade propio); `lite-youtube-embed` (web component) pesa ~1-3KB gzip, el wrapper React añade una capa extra |
| Control sobre estilos/tokens | Requiere registrar `iframe` crudo en `mdxComponents`, rompiendo el patrón de "solo componentes registrados" de spec-022 | Total: Tailwind + tokens de `DESIGN.md` iguales al resto de componentes MDX | Parcial: hay que sobreescribir CSS del web component/librería para alinear con `DESIGN.md` |
| Nuevas dependencias | Ninguna | Ninguna | 1-2 dependencias nuevas, a evaluar según CLAUDE.md ("verificar equivalente existente antes de instalar") |
| Consistencia con Server/Client boundary del proyecto | Se podría dejar sin lazy-load, pero pierde el beneficio principal | Client Component, mismo perfil que `Tabs`/`MermaidDiagram` ya aceptado en el pipeline | Client Component también, con lógica de terceros fuera del control directo del proyecto |
| Accesibilidad | Requiere replicar manualmente `title` en el iframe | Requiere implementar el botón de play con `aria-label` correctamente (algo más de trabajo, pero controlado) | Generalmente resuelto, pero hay que verificar que cumpla los mismos criterios WCAG 2.2 |
| Esfuerzo de implementación | Bajo | Medio (un componente + una función util, sin más superficie) | Bajo si la librería encaja, pero con curva de integración/estilos y una dependencia más que mantener |

**Recomendación: facade propio, sin librería externa.** El componente es
pequeño (thumbnail + botón + swap a iframe), el proyecto ya tiene precedente
directo de construir componentes MDX propios en vez de añadir dependencias
cuando el patrón es simple (`Callout`, `Tabs` en spec-022), y CLAUDE.md pide
justificar cualquier dependencia nueva con "qué resuelve, por qué esa
librería" antes de instalarla — para una necesidad de esta escala no se
justifica sumar una dependencia ni la superficie de mantenimiento de un
wrapper React sobre un web component de terceros.

### Justificación de nuevas dependencias

Ninguna. Se descarta `react-lite-youtube-embed` / `lite-youtube-embed` por lo
expuesto en la tabla comparativa: el patrón facade (imagen + botón + swap
condicional a iframe) es una implementación acotada de pocas líneas con
Tailwind y `useState`, sin necesidad de un binario, parser, ni lógica que
justifique no reinventarla (a diferencia de `mermaid` en spec-022, que sí es
un motor de parseo/renderizado no trivial). Mantiene el árbol de
dependencias del proyecto sin cambios, consistente con la preferencia de
CLAUDE.md por bajo footprint.

## Evaluación MCP

**¿Aplica MCP?** No.

Igual que spec-022, esta funcionalidad es exclusivamente de renderizado de
contenido: transforma cómo se muestra un video ya público de YouTube
referenciado en un `.mdx` existente. No expone datos nuevos consultables (no
hay tabla, endpoint ni recurso — el ID de YouTube vive en el propio archivo
`.mdx` del docente) ni acciones nuevas ejecutables (no hay un "publicar
video" o "listar videos de la lección" que un agente docente deba invocar; el
docente sigue escribiendo el `.mdx` a mano vía Git). Ningún MCP existente
(`question-bank-mcp`, `assignment-mcp`, `attendance-mcp`) cubre un dominio
relacionado con contenido de lecciones o video. No se crea fase de MCP en
este spec.

## Fases de implementación

### Fase 1 — Utilidad de parseo/validación de ID
- [x] Crear `lib/mdx/youtube.ts` con `parseYouTubeVideoId`, soportando los
      formatos `watch?v=`, `youtu.be/`, `youtube.com/embed/` y un `id` directo
      de 11 caracteres, con manejo explícito de entrada inválida.

### Fase 2 — Componente `YouTubeEmbed`
- [x] Crear `components/mdx/YouTubeEmbed.tsx` (`"use client"`): props
      `id?`, `url?`, `title?`, `start?`; estado `isPlaying`; render del
      thumbnail (`i.ytimg.com/vi/<id>/hqdefault.jpg`) + botón de play
      accesible mientras `isPlaying === false`; render del `<iframe>` de
      `youtube-nocookie.com/embed/<id>` (con `start`, sin `autoplay` salvo
      el que ocurre naturalmente tras el clic del usuario) cuando
      `isPlaying === true`.
- [x] Aplicar contenedor `aspect-video`, bordes y radius con tokens
      semánticos de `DESIGN.md`, y contraparte dark mode.
- [x] Manejar el caso de ID/URL inválido con un estado de error legible
      (mismo criterio que `MermaidDiagram` ante Mermaid mal formado), no un
      fallo silencioso.
- [x] Definido: thumbnail con `<img>` nativo (no `next/image`), acorde a la
      opción por defecto documentada en el spec; `next.config.ts` no requirió
      cambios.

### Fase 3 — Registro en el pipeline MDX
- [x] Registrar `YouTubeEmbed` en `mdxComponents` (`lib/mdx/components.tsx`).
- [x] Verificado en `fundamentos-control-de-versiones.mdx` (temporal,
      revertido tras la validación, mismo criterio que la Fase 4 de
      spec-022) que `<YouTubeEmbed id="..." />` y
      `<YouTubeEmbed url="..." start={30} />` compilan; un `id` inválido
      también compila (el error se maneja en runtime, no rompe el build).

### Fase 4 — Verificación end-to-end
- [x] Confirmado que `npm run build` y `npm run lint` no fallan con el nuevo
      componente registrado, se use o no en contenido real (lint: 0 errores
      nuevos; los 4 errores/10 warnings existentes son preexistentes, ajenos
      a este spec).
- [x] Confirmar comportamiento de lazy-load: el iframe de YouTube no se
      monta en el DOM hasta el clic (verificable en Network/Elements del
      navegador — requiere autorización explícita del usuario para
      ejecutarse con navegador, ver "Pruebas visuales y uso del navegador"
      de CLAUDE.md). **Verificado en TC-005 y TC-006:** sin peticiones a YouTube ni iframe en DOM antes del clic; después del clic: iframe montado y peticiones de red confirmadas.
- [x] Confirmar accesibilidad básica: botón de play con `aria-label`,
      `iframe` con `title`, navegable por teclado (foco visible, activable
      con Enter/Space). **Verificado en TC-010:** navegación Tab funciona, aria-label descriptivo, Enter/Space activan el botón, iframe tiene title descriptivo.
- [x] Confirmar comportamiento en modo claro/oscuro (bordes, contenedor) y
      que no hay layout shift al cargar la lección. **Verificado en TC-011 y TC-012:** bordes/radius consistentes en ambos modos, sin layout shift al cargar.
- [x] Confirmar sin regresión: una lección existente sin `YouTubeEmbed`
      renderiza idéntico a antes del spec. **Verificado en TC-014:** lección de control sin cambios visuales ni funcionales.

## Criterios de aceptación

- El docente puede escribir `<YouTubeEmbed id="VIDEO_ID" />` o
  `<YouTubeEmbed url="https://youtube.com/watch?v=VIDEO_ID" />` en cualquier
  `.mdx` de lección y el video se renderiza correctamente.
- Si el `id` o la `url` no corresponden a un video de YouTube válido, la
  lección muestra un error legible en vez de un iframe roto o un fallo
  silencioso.
- El iframe de YouTube no se descarga ni se monta en el DOM hasta que el
  usuario hace clic en el thumbnail/botón de reproducción.
- El video nunca autorreproduce al cargar la página, bajo ninguna
  circunstancia ni prop.
- El componente respeta el aspect-ratio 16:9 sin generar layout shift al
  cargar la lección.
- El componente se ve consistente (bordes, radius) en modo claro y oscuro,
  usando los tokens semánticos definidos en `DESIGN.md`.
- El botón de reproducción inicial es accesible por teclado y tiene un
  `aria-label` descriptivo; el `iframe` final tiene `title` descriptivo.
- Los artículos `.mdx` existentes (sin `YouTubeEmbed`) se siguen renderizando
  sin cambios visuales ni funcionales.
- `npm run build` y `npm run lint` pasan sin errores con el componente
  registrado en `mdxComponents`, se use o no en contenido existente.

## Pruebas asociadas

- **Manuales:** `docs/testing/test-025-youtube-embed-leccion.md` — casos
  `TC-001` a `TC-0NN` cubriendo: render con `id`, render con `url` en sus
  distintos formatos, `id`/`url` inválidos (estado de error), lazy-load
  (iframe no montado antes del clic), sin autoplay, accesibilidad por
  teclado, modo claro/oscuro, y regresión de una lección existente sin este
  componente.
- **Automáticas (e2e/unit):** no aplica todavía — el framework de testing
  del proyecto está "por definir" según `CLAUDE.md` (sección "Testing"). Se
  documentan como pendientes de creación cuando exista el framework
  (`parseYouTubeVideoId` es la función prioritaria a cubrir por ser lógica
  pura); los criterios de aceptación de esta sección sirven de base para
  esos casos futuros.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-07-23
