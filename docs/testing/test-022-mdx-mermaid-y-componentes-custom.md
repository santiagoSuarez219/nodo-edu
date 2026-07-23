# test-022 — Diagramas Mermaid y componentes React personalizados en el pipeline MDX

> Casos manuales de UI/render para spec-022. Ejecutar en `npm run dev` con una
> lección `.mdx` de prueba que contenga los elementos descritos en cada caso
> (ver Fase 4 del spec: diagrama válido, diagrama inválido, un `Callout` por
> variante, y un `Tabs` con 2+ `Tab`). Repetir los casos visuales en modo claro
> y modo oscuro salvo que se indique lo contrario.
>
> **Curso de prueba:** `estructuras-de-datos` (o el curso de bajo tráfico que
> se use como fixture).
> **Lección de control:** cualquier lección existente sin Mermaid ni
> componentes custom, para verificar ausencia de regresión.

---

## Casos de prueba

### TC-001 — Un bloque ```mermaid``` válido se renderiza como diagrama
**Precondición:** Lección de prueba con un bloque ` ```mermaid ` de sintaxis
válida (ej. un flowchart simple).
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** El bloque se muestra como un diagrama SVG renderizado,
no como texto de código resaltado por Shiki.
**Estado:** ✅ Aprobado

### TC-002 — Un bloque ```mermaid``` inválido muestra un estado de error controlado
**Precondición:** Lección de prueba con un bloque ` ```mermaid ` de sintaxis
inválida.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Se muestra un bloque de error legible (mensaje +
texto fuente sin procesar) en el lugar del diagrama. El resto del artículo
renderiza con normalidad; la página no se rompe ni muestra una pantalla de
error genérica de Next.js.
**Estado:** ✅ Aprobado

### TC-003 — El diagrama Mermaid respeta el modo claro/oscuro
**Precondición:** Lección de prueba con al menos un diagrama válido.
**Pasos:**
1. Abrir la lección con el tema en modo claro.
2. Alternar al modo oscuro con el toggle de la plataforma.
**Resultado esperado:** El diagrama ajusta sus colores al tema activo sin
recargar la página; no queda con fondo o texto ilegible en ninguno de los dos
modos.
**Estado:** ✅ Aprobado

### TC-004 — Ausencia de errores en consola al renderizar Mermaid
**Precondición:** La misma de TC-001.
**Pasos:**
1. Abrir la lección de prueba con la consola del navegador visible.
**Resultado esperado:** No aparecen errores ni warnings relacionados con
`mermaid` en la consola.
**Estado:** ✅ Aprobado

### TC-005 — `Callout` variante `nota`
**Precondición:** Lección de prueba con `<Callout tipo="nota">...</Callout>`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** El bloque se muestra estilizado según los tokens
semánticos definidos en `DESIGN.md` para la variante `nota`, legible en modo
claro y oscuro.
**Estado:** ✅ Aprobado

### TC-006 — `Callout` variante `advertencia`
**Precondición:** Lección de prueba con `<Callout tipo="advertencia">...</Callout>`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Estilo distintivo de advertencia (color de warning),
legible en ambos modos.
**Estado:** ✅ Aprobado

### TC-007 — `Callout` variante `peligro`
**Precondición:** Lección de prueba con `<Callout tipo="peligro">...</Callout>`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Estilo distintivo de peligro (color danger), legible
en ambos modos.
**Estado:** ✅ Aprobado

### TC-008 — `Callout` variante `exito`
**Precondición:** Lección de prueba con `<Callout tipo="exito">...</Callout>`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Estilo distintivo de éxito (color success), legible
en ambos modos.
**Estado:** ✅ Aprobado

### TC-009 — `Callout` sin prop `tipo` usa el valor por defecto
**Precondición:** Lección de prueba con `<Callout>...</Callout>` sin prop `tipo`.
**Pasos:**
1. Abrir la lección de prueba.
**Resultado esperado:** Se renderiza con la variante por defecto (`nota`) sin
error de compilación ni de render.
**Estado:** ✅ Aprobado

### TC-010 — `Tabs`/`Tab` — navegación por click
**Precondición:** Lección de prueba con `<Tabs>` y al menos 2 `<Tab label="...">`.
**Pasos:**
1. Abrir la lección de prueba.
2. Hacer clic en la segunda pestaña.
**Resultado esperado:** El contenido visible cambia al de la pestaña
seleccionada; la primera pestaña deja de mostrarse. El estado visual de "activa"
se refleja claramente en la pestaña clickeada.
**Estado:** ✅ Aprobado

### TC-011 — `Tabs`/`Tab` — navegación por teclado
**Precondición:** La misma de TC-010.
**Pasos:**
1. Enfocar la primera pestaña con `Tab` del teclado.
2. Navegar entre pestañas con las flechas de teclado (o `Tab`, según el patrón
   de accesibilidad implementado).
3. Activar una pestaña con `Enter`/`Espacio`.
**Resultado esperado:** El foco es visible en todo momento; la navegación por
teclado permite alternar y activar pestañas sin usar el mouse. Los roles
`tablist`/`tab`/`tabpanel` están presentes (verificable con el inspector de
accesibilidad del navegador).
**Estado:** ✅ Aprobado

### TC-012 — Regresión: lección existente sin elementos nuevos
**Precondición:** Abrir la "lección de control" (sin Mermaid ni componentes
custom).
**Pasos:**
1. Abrir la lección de control.
2. Comparar visualmente con su estado antes de este spec (capturas previas o
   memoria del revisor).
**Resultado esperado:** El render es idéntico al comportamiento previo: sin
cambios visuales ni funcionales en títulos, párrafos, listas, tablas, código,
imágenes o KaTeX.
**Estado:** ✅ Aprobado

### TC-013 — `npm run build` y `npm run lint` pasan sin errores
**Precondición:** Todos los cambios de la Fase 1-3 implementados.
**Pasos:**
1. Ejecutar `npm run lint`.
2. Ejecutar `npm run build`.
**Resultado esperado:** Ambos comandos terminan sin errores (warnings
preexistentes no relacionados con este spec quedan fuera de alcance).
**Estado:** ✅ Aprobado

**Notas de ejecución:** `npm run build` compiló sin errores. `npm run lint`
reportó 4 errores, todos en `components/admin/AcademicCourseList.tsx`
(`@next/next/no-html-link-for-pages`, uso de `<a>` en vez de `<Link />`).
Se confirmó con `git stash` que esos errores ya existían en la base antes de
los cambios de spec-022 y no están relacionados con Mermaid ni con los
componentes custom (`Callout`, `Tabs`) — quedan fuera de alcance de este spec.
