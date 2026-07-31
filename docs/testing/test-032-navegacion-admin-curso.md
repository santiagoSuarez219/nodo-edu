# test-032 — Navegación del docente: layout único de administración de curso

## Datos de prueba

> Recursos creados vía API/UI para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico de prueba A | `POST /api/students` + UI `/admin/courses/new` | `{{id}}` | ⬜ |
| Curso académico de prueba B (para probar navegación entre cursos) | UI `/admin/courses/new` | `{{id}}` | ⬜ |
| Estudiante matriculado en el curso A | `POST /api/students` (`students-mcp` → `create_student` + `enroll_student`) | `{{id}}` | ⬜ |

**Cuenta docente:** `dev@nodo.local` (entorno de desarrollo, ver CLAUDE.md → "Base de datos")
**Entorno de pruebas:** desarrollo (Supabase local en `mirp-lab` vía túnel SSH)
**Fecha de la ronda:** {{fecha}}

## Casos de prueba

### TC-001 — Navbar del docente sin enlaces de curso
**Precondición:** Sesión iniciada como docente, en `/admin/courses`.
**Datos de prueba usados:** cuenta docente de desarrollo.
**Pasos:**
1. Observar la barra de navegación superior.
2. Abrir el menú móvil (ventana < 1024 px) y observar su contenido.

**Resultado esperado:** El navbar muestra únicamente "Mis cursos" y "Grupo de
Investigación". No aparecen "Calificaciones", "Asistencia" ni "Evaluaciones", ni
ningún botón de selección de curso ("Selecciona un curso" / código de curso /
"Sin cursos"). Lo mismo en el menú móvil.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-002 — El navbar no cambia al entrar a un curso
**Precondición:** TC-001 aprobado.
**Datos de prueba usados:** curso A.
**Pasos:**
1. Navegar a `/admin/courses/<id-curso-A>`.
2. Observar el navbar.
3. Navegar a la pestaña "Calificaciones" y volver a observar el navbar.

**Resultado esperado:** El navbar es idéntico al de TC-001 en ambas rutas: no
aparece ningún enlace ni selector adicional al estar dentro de un curso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-003 — Tabla de cursos sin columna "Acciones"
**Precondición:** Sesión docente con al menos dos cursos (A y B).
**Datos de prueba usados:** cursos A y B.
**Pasos:**
1. Abrir `/admin/courses`.
2. Revisar los encabezados de la tabla y el contenido de cada fila.

**Resultado esperado:** Las columnas son Nombre, Código, Horario, Código matrícula
y Estado. No existe columna "Acciones" ni botón/dropdown "Acciones" en ninguna fila.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-004 — Fila de curso clickeable (ratón)
**Precondición:** TC-003 aprobado.
**Datos de prueba usados:** curso A.
**Pasos:**
1. En `/admin/courses`, pasar el cursor sobre la fila del curso A y observar el
   cambio visual.
2. Hacer clic en una celda cualquiera de esa fila (probar sobre "Código" y sobre
   "Estado", no solo sobre el nombre).

**Resultado esperado:** La fila muestra un estado *hover* que indica que es
clickeable, y el clic —en cualquiera de sus celdas— navega a
`/admin/courses/<id-curso-A>`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-005 — Fila de curso accesible por teclado
**Precondición:** TC-004 aprobado.
**Datos de prueba usados:** cursos A y B.
**Pasos:**
1. En `/admin/courses`, pulsar `Tab` repetidamente desde el inicio de la página.
2. Observar dónde cae el foco dentro de la tabla y si el indicador de foco es visible.
3. Con el foco en la fila del curso B, pulsar `Enter`.

**Resultado esperado:** Cada fila expone exactamente un destino enfocable (no uno
por celda), con indicador de foco visible; `Enter` navega a
`/admin/courses/<id-curso-B>`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-006 — Cabecera del curso persistente en todas las pestañas
**Precondición:** Sesión docente.
**Datos de prueba usados:** curso A.
**Pasos:**
1. Abrir `/admin/courses/<id-curso-A>` y anotar lo que muestra la cabecera.
2. Recorrer, una por una, estas rutas: `/grades`, `/assignments`, `/contenido`,
   `/presentacion`, `/edit`.
3. En cada una, comparar la cabecera con la del paso 1.

**Resultado esperado:** En las seis rutas se muestra la misma cabecera: breadcrumb
"Mis cursos", nombre del curso, badge Activo/Inactivo, código, horario y código de
matrícula, más los botones "Contenido", "Presentación" y "Editar curso". No
aparece ningún botón "Volver" en Evaluaciones.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-007 — Tabs: tres pestañas y marcado del activo
**Precondición:** TC-006 aprobado.
**Datos de prueba usados:** curso A.
**Pasos:**
1. En `/admin/courses/<id-curso-A>`, observar la barra de tabs.
2. Hacer clic en "Calificaciones" y observar cuál queda marcado como activo.
3. Hacer clic en "Evaluaciones" y observar lo mismo.
4. Volver a "Estudiantes".
5. Entrar al detalle de una evaluación (`/assignments/<groupId>`) y observar los tabs.

**Resultado esperado:** Siempre hay exactamente tres tabs —Estudiantes,
Calificaciones, Evaluaciones—, ninguno vacío o sin etiqueta. El tab activo
corresponde a la ruta actual en cada paso; dentro del detalle de una evaluación,
"Evaluaciones" sigue marcado como activo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-008 — Botones Contenido / Presentación / Editar curso
**Precondición:** TC-006 aprobado.
**Datos de prueba usados:** curso A.
**Pasos:**
1. Desde `/admin/courses/<id-curso-A>`, pulsar "Contenido" y verificar la URL y la página.
2. Volver y pulsar "Presentación"; verificar URL y contenido.
3. Volver y pulsar "Editar curso"; verificar que carga el formulario del curso A.

**Resultado esperado:** Los tres botones llevan respectivamente a `/contenido`,
`/presentacion` y `/edit` del curso A, y en las tres la cabecera y los tabs se
conservan.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-009 — La ruta de asistencia del panel ya no existe
**Precondición:** Sesión docente.
**Datos de prueba usados:** curso A.
**Pasos:**
1. Escribir directamente en el navegador `/admin/courses/<id-curso-A>/attendance`.
2. Recorrer las pestañas del curso y el navbar buscando cualquier enlace a "Asistencia".

**Resultado esperado:** La URL devuelve la página 404 de la aplicación. No existe
ningún enlace a "Asistencia" en el navbar, la cabecera, los tabs ni ninguna
pestaña del curso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-010 — La asistencia desde la lección sigue funcionando (regresión spec-031)
**Precondición:** TC-009 aprobado. Curso A con `course_slug` asociado a un curso
publicado con al menos una lección.
**Datos de prueba usados:** curso A, estudiante matriculado.
**Pasos:**
1. Como docente, abrir una lección del curso (`/<courseSlug>/<lessonSlug>`).
2. En el panel docente, abrir una sesión de asistencia y anotar el código generado.
3. Verificar que se muestra el conteo de asistentes.
4. Cerrar la sesión de asistencia.

**Resultado esperado:** El panel docente de la lección abre la sesión, muestra el
código y el conteo, y la cierra sin errores. Eliminar la página `/admin/.../attendance`
no afectó este flujo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-011 — El navbar del estudiante no cambió
**Precondición:** Sesión iniciada con una cuenta de estudiante.
**Datos de prueba usados:** estudiante matriculado en el curso A.
**Pasos:**
1. Iniciar sesión como estudiante.
2. Observar el navbar en `/cuenta/cursos` y dentro de un curso matriculado.

**Resultado esperado:** El navbar del estudiante muestra "Mis cursos" y "Grupo de
Investigación", igual que antes del cambio. Ningún elemento del panel docente es visible.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Resumen de la ronda

- Aprobados: 0 — Fallidos: 0 — Pendientes: 11
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente
