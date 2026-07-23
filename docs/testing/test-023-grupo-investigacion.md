# test-023 — Sección pública del grupo de investigación

## Casos de prueba

### TC-001 — Acceso público sin sesión
**Precondición:** Usuario sin sesión iniciada (navegación privada o logout).
**Pasos:**
1. Navegar a `/grupo-investigacion`.
**Resultado esperado:** La página carga sin redirigir a `/login`; se ve el
contenido del grupo de investigación.
**Estado:** ⬜ Pendiente

### TC-002 — Hero y leader card
**Precondición:** Estar en `/grupo-investigacion`.
**Pasos:**
1. Revisar la parte superior de la página.
**Resultado esperado:** Se ve el badge "Grupo de Investigación", el nombre
del grupo, la descripción, y una card con el líder del grupo (nombre, rol
"Líder del grupo", email y teléfono).
**Estado:** ⬜ Pendiente

### TC-003 — Líneas de investigación
**Precondición:** Estar en `/grupo-investigacion`.
**Pasos:**
1. Ubicar la sección "Líneas de investigación".
**Resultado esperado:** Se muestran 3 cards, cada una con título,
descripción, líder de la línea, lista de investigadores (tags) y lista de
proyectos.
**Estado:** ⬜ Pendiente

### TC-004 — Semilleros de investigación
**Precondición:** Estar en `/grupo-investigacion`.
**Pasos:**
1. Ubicar la sección "Semilleros de investigación".
**Resultado esperado:** Se muestran 3 cards con nombre del semillero,
líder, días de reunión y aula.
**Estado:** ⬜ Pendiente

### TC-005 — Oportunidades de vinculación
**Precondición:** Estar en `/grupo-investigacion`.
**Pasos:**
1. Ubicar la sección "Oportunidades de vinculación".
**Resultado esperado:** Se muestran 3 cards con tag/badge, título y
descripción de cada oportunidad.
**Estado:** ⬜ Pendiente

### TC-006 — Modo claro y oscuro
**Precondición:** Estar en `/grupo-investigacion`.
**Pasos:**
1. Cambiar la preferencia de tema del sistema operativo a oscuro y recargar
   la página.
2. Cambiar la preferencia a claro y recargar.
**Resultado esperado:** Todos los textos, cards y el banner de cierre
respetan los tokens de `DESIGN.md` en ambos modos, sin contraste roto ni
fondos sin adaptar. No aparece ningún botón de toggle manual de tema.
**Estado:** ⬜ Pendiente

### TC-007 — Link en Navbar (desktop)
**Precondición:** Ventana en tamaño desktop (`lg` o superior), cualquier
página del sitio.
**Pasos:**
1. Revisar la barra de navegación superior.
2. Hacer clic en el link "Grupo de Investigación".
**Resultado esperado:** El link es visible junto al login/menú de usuario y
al hacer clic navega a `/grupo-investigacion`.
**Estado:** ⬜ Pendiente

### TC-008 — Link en Navbar (mobile)
**Precondición:** Ventana en tamaño mobile, cualquier página del sitio.
**Pasos:**
1. Abrir el menú mobile (botón hamburguesa).
2. Tocar el link "Grupo de Investigación".
**Resultado esperado:** El menú muestra el link, y al tocarlo navega a
`/grupo-investigacion` y cierra el menú mobile.
**Estado:** ⬜ Pendiente
