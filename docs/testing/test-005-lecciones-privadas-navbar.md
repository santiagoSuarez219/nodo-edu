# test-005 — Lecciones privadas por matrícula + navbar reorientado

Casos de prueba manuales del spec-005. Solo flujos con UI. Cada caso encodifica
un criterio de aceptación y arranca en estado ⬜ Pendiente.

**Precondiciones globales de datos:**

- Existe un curso de contenido MDX con slug `estructuras-de-datos` (ya presente).
- Existe un `academic_course` con `course_slug = "estructuras-de-datos"` creado
  por un docente (`teacher_id = docenteA`). Anotar su `enrollment_code`.
- Cuentas disponibles: `visitante` (sin sesión), `estudianteMatriculado`
  (matrícula activa en ese curso), `estudianteSinMatricula` (autenticado, sin
  matrícula), `estudianteRetirado` (matrícula `status = withdrawn`), `docenteA`
  (dueño del `academic_course`), `docenteB` (docente sin ese curso), `admin`.

---

## Acceso al contenido

### TC-005-01 — Visitante sin sesión es redirigido al login
**Precondición:** sesión cerrada.
**Pasos:**
1. Navegar a `/estructuras-de-datos`.
2. Navegar a `/estructuras-de-datos/introduccion`.
**Resultado esperado:** ambas rutas redirigen a `/login?redirectTo=…` con el
path original en el query param. No se muestra en ningún momento el MDX.
**Estado:** ⬜ Pendiente

### TC-005-02 — Estudiante sin matrícula es redirigido a "Mis cursos" con aviso
**Precondición:** sesión de `estudianteSinMatricula`.
**Pasos:**
1. Navegar a `/estructuras-de-datos`.
2. Navegar a `/estructuras-de-datos/introduccion`.
**Resultado esperado:** ambas redirigen a `/cuenta/cursos?sinAcceso=estructuras-de-datos`
y se muestra el banner explicativo ("No estás matriculado en este curso; ingresa
tu código de matrícula"). No se muestra el MDX.
**Estado:** ⬜ Pendiente

### TC-005-03 — Estudiante matriculado accede al contenido
**Precondición:** sesión de `estudianteMatriculado` (matrícula `active`).
**Pasos:**
1. Navegar a `/estructuras-de-datos`.
2. Abrir una lección con artículo, p. ej. `/estructuras-de-datos/introduccion`.
3. Navegar entre lecciones con la sidebar.
**Resultado esperado:** la home del curso y las lecciones cargan con normalidad
(HTTP 200), la sidebar lista las lecciones y el MDX se renderiza.
**Estado:** ⬜ Pendiente

### TC-005-04 — Estudiante retirado NO accede
**Precondición:** sesión de `estudianteRetirado` (matrícula `withdrawn`).
**Pasos:**
1. Navegar a `/estructuras-de-datos/introduccion`.
**Resultado esperado:** redirige a `/cuenta/cursos?sinAcceso=estructuras-de-datos`
(igual que un estudiante sin matrícula). No se muestra el MDX.
**Estado:** ⬜ Pendiente

### TC-005-05 — Docente dueño accede sin matrícula
**Precondición:** sesión de `docenteA` (dueño del `academic_course`), sin
matrícula como estudiante.
**Pasos:**
1. Navegar a `/estructuras-de-datos` y a una lección.
**Resultado esperado:** accede al contenido con normalidad.
**Estado:** ⬜ Pendiente

### TC-005-06 — Docente ajeno NO accede
**Precondición:** sesión de `docenteB` (no dueño de ese curso, sin matrícula).
**Pasos:**
1. Navegar a `/estructuras-de-datos/introduccion`.
**Resultado esperado:** redirige a `/cuenta/cursos?sinAcceso=estructuras-de-datos`.
No se muestra el MDX.
**Estado:** ⬜ Pendiente

### TC-005-07 — Admin accede sin matrícula
**Precondición:** sesión de `admin`.
**Pasos:**
1. Navegar a `/estructuras-de-datos` y a una lección.
**Resultado esperado:** accede al contenido con normalidad.
**Estado:** ⬜ Pendiente

### TC-005-08 — Slug de curso inexistente devuelve 404
**Precondición:** cualquier sesión con acceso (p. ej. `admin`).
**Pasos:**
1. Navegar a `/curso-que-no-existe`.
2. Navegar a `/curso-que-no-existe/leccion-x`.
**Resultado esperado:** se muestra la página 404 del grupo de cursos
(`not-found`), no un redirect ni el banner de matrícula.
**Estado:** ⬜ Pendiente

### TC-005-09 — Redirect preserva el destino tras iniciar sesión
**Precondición:** sesión cerrada.
**Pasos:**
1. Navegar a `/estructuras-de-datos/introduccion`.
2. En `/login`, iniciar sesión con `estudianteMatriculado`.
**Resultado esperado:** tras el login se regresa a
`/estructuras-de-datos/introduccion` (según `redirectTo`) y el contenido carga.
**Estado:** ⬜ Pendiente

---

## Navbar reorientada

### TC-005-10 — Navbar desktop sin enlaces de curso
**Precondición:** viewport ≥ lg. Cualquier estado de sesión.
**Pasos:**
1. Abrir la home `/`.
2. Observar la barra de navegación.
**Resultado esperado:** ya no aparecen "Estructuras de datos", "Programación
científica" ni "Análisis de algoritmos". Aparecen "Cursos" y "Docentes". El
bloque de sesión (UserMenu si hay sesión, botón "Iniciar sesión" si no) se ve
correctamente.
**Estado:** ⬜ Pendiente

### TC-005-11 — Enlaces de la navbar hacen scroll a las secciones
**Precondición:** viewport ≥ lg, en la home `/`.
**Pasos:**
1. Clic en "Cursos".
2. Clic en "Docentes".
**Resultado esperado:** la página hace scroll a la sección de cursos
(`#cursos`) y a la de docentes (`#docentes`) respectivamente; ninguna sección
queda sin destino.
**Estado:** ⬜ Pendiente

### TC-005-12 — Enlaces desde una ruta interna vuelven a la home y hacen scroll
**Precondición:** sesión de `estudianteMatriculado`, en `/cuenta`.
**Pasos:**
1. Clic en "Cursos" en la navbar.
**Resultado esperado:** navega a `/` y hace scroll a la sección de cursos.
**Estado:** ⬜ Pendiente

### TC-005-13 — Navbar móvil reorientada
**Precondición:** viewport < lg (móvil). Cualquier estado de sesión.
**Pasos:**
1. Abrir la home `/`.
2. Abrir el menú hamburguesa.
**Resultado esperado:** el menú móvil muestra "Cursos" y "Docentes" (no los
cursos antiguos); el bloque de sesión (Mi cuenta / Cerrar sesión, o "Iniciar
sesión") funciona igual que antes. Al tocar un enlace, el menú se cierra y hace
scroll a la sección.
**Estado:** ⬜ Pendiente

---

## Regresión

### TC-005-14 — Rutas de cuenta y admin siguen funcionando
**Precondición:** sesiones de `estudianteMatriculado` y `docenteA`.
**Pasos:**
1. Como estudiante: navegar a `/cuenta` y `/cuenta/cursos`.
2. Como docente: navegar a `/admin/courses`.
**Resultado esperado:** todas cargan sin regresiones; el middleware sigue
protegiendo `/admin` y `/cuenta` como antes.
**Estado:** ⬜ Pendiente
