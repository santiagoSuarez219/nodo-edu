# test-013 — Home privada como grilla de cursos + limpieza de navbar

> Casos manuales de UI para spec-013. Ejecutar en desktop (≥1280px) y en
> móvil (≤480px), en modo claro y modo oscuro salvo que el caso indique otra
> cosa.

## Casos de prueba

### TC-001 — Visitante anónimo en `/` es redirigido a login
**Precondición:** Sin sesión activa (cerrar sesión o navegación privada).
**Pasos:**
1. Navegar directamente a `/`.
**Resultado esperado:** Redirección automática a `/login?redirectTo=%2F`
(comportamiento ya existente del middleware, no debe romperse).
**Estado:** ⬜ Pendiente

### TC-002 — Usuario con sesión ve la grilla de cursos en `/`
**Precondición:** Sesión activa (estudiante o docente).
**Pasos:**
1. Navegar a `/`.
**Resultado esperado:** Se muestra una grilla con una card por cada curso del
catálogo (hoy: Estructuras de datos, Programación científica, Análisis de
algoritmos). No aparece hero, carrusel ni sección de docente de la landing
anterior. El footer se muestra al final de la página, sin cambios visuales
respecto al que ya existía.
**Estado:** ⬜ Pendiente

### TC-003 — Contenido de cada card
**Precondición:** Estar en `/` con sesión activa.
**Pasos:**
1. Revisar cada card de la grilla.
**Resultado esperado:** Cada card muestra al menos título, resumen (`summary`)
y nivel (`level`) del curso, consistentes con los datos de
`lib/courses/data/*.ts`.
**Estado:** ⬜ Pendiente

### TC-004 — Click en una card navega al curso
**Precondición:** Estar en `/` con sesión activa y matrícula activa en al
menos un curso.
**Pasos:**
1. Hacer clic en la card de un curso en el que el usuario está matriculado.
**Resultado esperado:** Navega a `/[courseSlug]` y muestra el contenido del
curso normalmente.
**Estado:** ⬜ Pendiente

### TC-005 — Click en una card sin matrícula redirige al gate existente
**Precondición:** Estar en `/` con sesión activa, sin matrícula en un curso
del catálogo.
**Pasos:**
1. Hacer clic en la card de un curso en el que el usuario NO está matriculado.
**Resultado esperado:** Redirección a `/cuenta/cursos?sinAcceso={slug}`,
mostrando el aviso de falta de matrícula (comportamiento ya existente de
spec-006, no debe romperse).
**Estado:** ⬜ Pendiente

### TC-006 — Navbar solo muestra logo + dropdown de usuario
**Precondición:** Sesión activa, en cualquier página del sitio.
**Pasos:**
1. Observar el navbar en desktop.
2. Abrir el menú mobile (≤480px).
**Resultado esperado:** No hay ningún enlace de nivel superior aparte del
logo; a la derecha solo aparece el dropdown de usuario (avatar + nombre). En
mobile, el menú desplegable no incluye un ítem "Mis cursos" fuera del bloque
de perfil/"Mi cuenta"/"Cerrar sesión".
**Estado:** ⬜ Pendiente

### TC-007 — Logo del navbar enlaza a `/`
**Precondición:** Sesión activa, en cualquier página distinta de `/`.
**Pasos:**
1. Hacer clic en el logo del navbar.
**Resultado esperado:** Navega a `/` y muestra la grilla de cursos.
**Estado:** ⬜ Pendiente

### TC-008 — Dropdown de usuario conserva "Mis cursos", "Mi cuenta" y "Cerrar sesión"
**Precondición:** Sesión activa.
**Pasos:**
1. Abrir el dropdown de usuario.
**Resultado esperado:** Se listan "Mis cursos" (lleva a `/cuenta/cursos` para
estudiante o `/admin/courses` para docente/admin), "Mi cuenta" (`/cuenta`) y
"Cerrar sesión", sin cambios respecto al comportamiento previo.
**Estado:** ⬜ Pendiente
