# test-024 — Bibliografía en la presentación de curso

## Casos de prueba

### TC-001 — Sección de bibliografía visible
**Precondición:** Estar en la página de presentación de un curso (ej.
`/estructuras-de-datos`).
**Pasos:**
1. Recorrer la página hasta la sección "Bibliografía".
**Resultado esperado:** Se ve el título "Bibliografía" y una lista con al
menos una referencia (título y autor) del curso.
**Estado:** ⬜ Pendiente

### TC-002 — Link a biblioteca institucional
**Precondición:** Estar en la sección "Bibliografía" de la página de un curso.
**Pasos:**
1. Localizar el link a la biblioteca de la institución.
2. Hacer clic en el link.
**Resultado esperado:** El link apunta a `https://www.itm.edu.co/biblioteca/`
y se abre en una pestaña nueva.
**Estado:** ⬜ Pendiente

### TC-003 — Modo claro y oscuro
**Precondición:** Estar en la sección "Bibliografía" de la página de un curso.
**Pasos:**
1. Cambiar la preferencia de tema del sistema operativo a oscuro y recargar
   la página.
2. Cambiar la preferencia a claro y recargar.
**Resultado esperado:** El texto, las cards y el link respetan los tokens de
`DESIGN.md` en ambos modos, sin contraste roto.
**Estado:** ⬜ Pendiente
