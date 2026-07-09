# test-004 — Landing page pública (home `/`)

> Casos manuales de UI para spec-004. Ejecutar en desktop (≥1280px) y en móvil
> (≤480px), en modo claro y modo oscuro salvo que el caso indique otra cosa.

## Casos de prueba

### TC-001 — Render de las secciones en orden
**Precondición:** App corriendo (`npm run dev`), sesión no requerida.
**Pasos:**
1. Navegar a `/`.
2. Recorrer la página de arriba a abajo.
**Resultado esperado:** Aparecen, en este orden: hero, sección "Tus cursos",
sección "Cómo funciona", sección "Docente principal" y footer. No hay un nav propio
de la landing; el Navbar visible es el global del layout.
**Estado:** ⬜ Pendiente

### TC-002 — Hero: contenido y card "Continuar"
**Precondición:** Estar en `/`.
**Pasos:**
1. Observar la columna izquierda del hero.
2. Observar la columna derecha (card "Continuar").
**Resultado esperado:** Izquierda: greeting "Hola de nuevo 👋", título principal
"Seguí donde lo dejaste.", subtítulo y botón "Continuar cursando". Derecha: card con
label "Continuar", "Estructuras de Datos", barra al 72%, meta con "Árboles
balanceados" / "72%" y botón "Retomar lección →".
**Estado:** ⬜ Pendiente

### TC-003 — "Tus cursos": tarjetas y datos
**Precondición:** Estar en `/`.
**Pasos:**
1. Ubicar la sección "Tus cursos".
2. Revisar cada card del listado.
**Resultado esperado:** Se muestran 5 cursos (Estructuras de Datos, Análisis de
Algoritmos, Programación Científica, Deep Learning, Machine Learning). Cada card
muestra badge de nivel en mayúsculas, nombre, descripción, meta ({progress}% /
{hours}h) y barra de progreso cuyo ancho corresponde a su porcentaje (p. ej.
Estructuras de Datos ~72%, Programación Científica 0%). Existe el link "Ver catálogo
completo →".
**Estado:** ⬜ Pendiente

### TC-004 — Scroller horizontal de cursos (desktop y móvil)
**Precondición:** Estar en `/`.
**Pasos:**
1. En desktop, si las cards exceden el ancho, desplazar horizontalmente el listado.
2. Repetir en viewport móvil (≤480px) con gesto/scroll horizontal.
**Resultado esperado:** El listado de cursos se desplaza en horizontal sin romper el
layout ni provocar scroll horizontal de toda la página. En móvil las cards conservan
su ancho y se navegan deslizando.
**Estado:** ⬜ Pendiente

### TC-005 — "Cómo funciona": pasos 01–04
**Precondición:** Estar en `/`.
**Pasos:**
1. Ubicar la sección "Cómo funciona".
**Resultado esperado:** Se muestran 4 pasos numerados 01, 02, 03, 04, cada uno con
título y descripción, en el orden del diseño.
**Estado:** ⬜ Pendiente

### TC-006 — "Docente principal"
**Precondición:** Estar en `/`.
**Pasos:**
1. Ubicar la sección "Docente principal".
**Resultado esperado:** Barra con avatar (inicial), nombre del docente, rol "Docente
Principal" y bio.
**Estado:** ⬜ Pendiente

### TC-007 — Footer
**Precondición:** Estar en `/`.
**Pasos:**
1. Desplazarse al final de la página.
**Resultado esperado:** Footer con "nodo © 2026" y los enlaces GitHub, Documentación
y Contacto.
**Estado:** ⬜ Pendiente

### TC-008 — Colapso responsive del hero
**Precondición:** Estar en `/`.
**Pasos:**
1. Reducir el viewport a móvil (≤480px).
2. Observar el hero.
**Resultado esperado:** El hero pasa a una sola columna: el bloque de texto/CTA
arriba y la card "Continuar" debajo. Nada queda oculto bajo el Navbar fijo (hay
separación superior suficiente en desktop y móvil).
**Estado:** ⬜ Pendiente

### TC-009 — Modo claro / oscuro
**Precondición:** Estar en `/`.
**Pasos:**
1. Alternar el tema con el toggle del Navbar global.
2. Recorrer todas las secciones en cada modo.
**Resultado esperado:** Fondos, textos, bordes, badges y barras de progreso se
adaptan correctamente a claro y oscuro, con contraste legible y sin colores fuera de
la tabla de DESIGN.md. No hay destello de tema incorrecto al cargar.
**Estado:** ⬜ Pendiente

### TC-010 — Enlaces y foco de teclado
**Precondición:** Estar en `/`.
**Pasos:**
1. Navegar con la tecla Tab por los elementos interactivos (CTA del hero, botón
   "Retomar lección", link "Ver catálogo", cards de curso, links del footer).
2. Activar algún enlace con Enter.
**Resultado esperado:** Todos los elementos interactivos son alcanzables por teclado
con foco visible; los enlaces navegan a un destino válido (o al placeholder
documentado) sin errores en consola.
**Estado:** ⬜ Pendiente
