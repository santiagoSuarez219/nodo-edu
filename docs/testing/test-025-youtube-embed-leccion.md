# test-025 — Embeber videos de YouTube en lecciones MDX

> Casos manuales de UI/render para spec-025. Ejecutar en `npm run dev` con una
> lección `.mdx` de prueba que contenga los elementos descritos en cada caso:
> `<YouTubeEmbed id="...">`, `<YouTubeEmbed url="...">` en sus distintos
> formatos válidos, y variantes inválidas. Repetir los casos visuales en modo
> claro y modo oscuro salvo que se indique lo contrario.
>
> **Curso de prueba:** `estructuras-de-datos` (o el curso de bajo tráfico que
> se use como fixture).
> **Lección de control:** cualquier lección existente sin `YouTubeEmbed`, para
> verificar ausencia de regresión.
> **Video de referencia sugerido:** un video público y estable de YouTube (ej.
> uno oficial de un canal educativo), con ID conocido, para usar en los casos
> `id`/`url` válidos.

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|-----------------------|----------------|-----------|
| No aplica — este spec no crea datos vía API; los fixtures son ediciones temporales del `.mdx` de prueba (ver "Fase 4" del spec), revertidas al cerrar la ronda. | — | — | ⬜ / ✅ |

**Entorno de pruebas:** desarrollo
**Fecha de la ronda:** 2026-07-23

---

## Casos de prueba

### TC-001 — `<YouTubeEmbed id="...">` renderiza el thumbnail inicial
**Precondición:** Lección de prueba con `<YouTubeEmbed id="VIDEO_ID" />` usando
un ID válido.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Se muestra el thumbnail del video con un botón de
reproducción superpuesto, dentro de un contenedor con aspect-ratio 16:9,
bordes y radius consistentes con el resto de componentes MDX. El iframe de
YouTube **no** está presente todavía en el DOM.
**Estado:** ✅ Aprobado
**Hallazgos:** Thumbnail renderiza correctamente con botón de play superpuesto, contenedor aspect-ratio 16:9 visible, bordes y radius consistentes con otros componentes MDX.

### TC-002 — `<YouTubeEmbed url="...">` con formato `watch?v=`
**Precondición:** Lección de prueba con
`<YouTubeEmbed url="https://www.youtube.com/watch?v=VIDEO_ID" />`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Mismo resultado que TC-001: thumbnail correcto para
el video referenciado por la URL.
**Estado:** ✅ Aprobado
**Hallazgos:** URL en formato watch?v= se parsea correctamente, mismo thumbnail que TC-001, sin errores en consola.

### TC-003 — `<YouTubeEmbed url="...">` con formato `youtu.be/`
**Precondición:** Lección de prueba con
`<YouTubeEmbed url="https://youtu.be/VIDEO_ID" />`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Mismo resultado que TC-001.
**Estado:** ✅ Aprobado
**Hallazgos:** URL en formato youtu.be/ se parsea correctamente, mismo thumbnail que TC-001, sin errores en consola.

### TC-004 — `<YouTubeEmbed url="...">` con formato `youtube.com/embed/`
**Precondición:** Lección de prueba con
`<YouTubeEmbed url="https://www.youtube.com/embed/VIDEO_ID" />`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Mismo resultado que TC-001.
**Estado:** ✅ Aprobado
**Hallazgos:** URL en formato youtube.com/embed/ se parsea correctamente, mismo thumbnail que TC-001, sin errores en consola.

### TC-005 — El clic en el botón de play monta el iframe y reproduce el video
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba.
2. Hacer clic en el botón de reproducción sobre el thumbnail.
**Resultado esperado:** El thumbnail se reemplaza por un `<iframe>` de
`youtube-nocookie.com/embed/...` que carga y permite reproducir el video. No
autorreproduce antes del clic.
**Estado:** ✅ Aprobado
**Hallazgos:** Clic en el botón monta correctamente el iframe de youtube-nocookie.com, thumbnail se reemplaza, video está listo para reproducir. DOM inspección confirma cambio de <img>+<button> a <iframe>.

### TC-006 — El iframe no se monta en el DOM antes del clic (lazy-load real)
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba con las herramientas de desarrollo del
   navegador abiertas (pestaña Elements o Network).
2. Inspeccionar el DOM / las peticiones de red **antes** de hacer clic en el
   botón de play.
**Resultado esperado:** No hay ningún `<iframe>` de YouTube en el DOM ni
peticiones de red hacia `youtube.com`/`youtube-nocookie.com` (más allá de la
imagen del thumbnail) hasta que se hace clic.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado en Network tab: sin peticiones a youtube antes del clic, solo imagen del thumbnail. Después del clic: peticiones a youtube-nocookie.com aparecen correctamente. Lazy-load funciona como se esperaba.

### TC-007 — `id` inválido muestra un estado de error legible
**Precondición:** Lección de prueba con `<YouTubeEmbed id="no-es-un-id" />`
(formato inválido, no 11 caracteres del patrón esperado).
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Se muestra un bloque de error legible en el lugar del
componente. El resto del artículo renderiza con normalidad; la página no se
rompe ni muestra una pantalla de error genérica de Next.js.
**Estado:** ✅ Aprobado
**Hallazgos:** Mensaje de error legible: "No se pudo renderizar el video de Youtube". Página renderiza sin problemas alrededor del error, sin romper el layout.

### TC-008 — `url` que no es de YouTube muestra un estado de error legible
**Precondición:** Lección de prueba con
`<YouTubeEmbed url="https://vimeo.com/123456" />`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Mismo resultado que TC-007: error legible, sin
romper la página.
**Estado:** ✅ Aprobado
**Hallazgos:** URL de Vimeo se rechaza correctamente con el mismo mensaje de error legible. Sin regresión en la página.

### TC-009 — El componente nunca autorreproduce
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba y esperar unos segundos sin interactuar con el
   componente.
**Resultado esperado:** El video no comienza a reproducirse por sí solo bajo
ninguna circunstancia; sigue mostrando el thumbnail y el botón de play.
**Estado:** ✅ Aprobado
**Hallazgos:** Tras esperar 5-10 segundos sin interacción, el video permanece sin reproducirse. Thumbnail y botón de play siguen visibles. Sin autoplay en ningún momento.

### TC-010 — Accesibilidad: navegación por teclado y `aria-label`
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba.
2. Navegar con Tab hasta llegar al botón de reproducción.
3. Verificar visualmente el foco (outline visible) y, con un lector de
   pantalla o inspeccionando el DOM, el `aria-label` del botón.
4. Activar el botón con Enter o Space.
**Resultado esperado:** El botón recibe foco visible por teclado, tiene un
`aria-label` descriptivo (no genérico tipo "botón"), y se activa
correctamente con Enter/Space, montando el iframe. El `<iframe>` final tiene
un atributo `title` descriptivo.
**Estado:** ✅ Aprobado
**Hallazgos:** Navegación Tab funciona correctamente, botón recibe foco visible. aria-label es descriptivo (ej. "Reproducir video: Me at the zoo"). Enter/Space activan el botón y montan el iframe. El iframe tiene atributo title descriptivo verificado en Elements tab.

### TC-011 — Consistencia visual en modo claro y oscuro
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba en modo claro.
2. Alternar al modo oscuro con el toggle de la plataforma.
**Resultado esperado:** El contenedor, bordes y radius del componente se ven
consistentes con el resto de bloques MDX (`Callout`, `Tabs`, imágenes) en
ambos modos, sin colores rotos ni contraste insuficiente.
**Estado:** ✅ Aprobado
**Hallazgos:** Modo claro: bordes y radius visibles y consistentes. Modo oscuro: bordes y radius se ven igual de bien, colores son consistentes con otros componentes. Sin contraste insuficiente en ningún modo.

### TC-012 — Sin layout shift al cargar la lección
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba y observar el área del componente mientras
   carga la página.
**Resultado esperado:** El contenedor del componente reserva su espacio
(aspect-ratio 16:9) desde el primer render; el resto del contenido de la
lección no salta ni se reacomoda cuando el thumbnail termina de cargar.
**Estado:** ✅ Aprobado
**Hallazgos:** Contenedor reserva espacio aspect-ratio 16:9 desde el inicio. Sin layout shift observado mientras la página carga. Contenido circundante permanece en la misma posición.

### TC-013 — Ausencia de errores en consola
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba con la consola del navegador visible.
2. Hacer clic en el botón de play y reproducir brevemente el video.
**Resultado esperado:** No aparecen errores ni warnings relacionados con
`YouTubeEmbed` en la consola, antes ni después del clic.
**Estado:** ✅ Aprobado
**Hallazgos:** Consola limpia: sin errores relacionados con YouTubeEmbed. Antes y después del clic: sin warnings o errores detectados. Solo mensajes normales de terceros (YouTube).

### TC-014 — Regresión: lección existente sin `YouTubeEmbed`
**Precondición:** Ninguna (lección de control ya publicada).
**Pasos:**
1. Abrir una lección existente que no use `YouTubeEmbed`.
**Resultado esperado:** La lección renderiza idéntica a como lo hacía antes
del spec (sin cambios visuales ni funcionales).
**Estado:** ✅ Aprobado
**Hallazgos:** Otra lección del curso (sin YouTubeEmbed) renderiza con normalidad. Componentes existentes (Callout, Tabs, código) funcionan idénticos. Sin errores en consola. Sin regresión detectada.

## Resumen de la ronda
- Aprobados: 14 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada (revertir ediciones
  temporales del `.mdx` de prueba)
