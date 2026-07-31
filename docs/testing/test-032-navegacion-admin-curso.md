# test-032 — Navegación del docente: layout único de administración de curso

## Datos de prueba

> Recursos creados vía API/UI para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso académico de prueba A ("Estructuras de Datos — Prueba spec-032", código `EST-032A`, `course_slug: estructuras-de-datos`) | Inserción directa vía `SUPABASE_SERVICE_ROLE_KEY` (excepción puntual autorizada por el usuario: no existe endpoint REST para crear `academic_courses`, solo una Server Action ligada al formulario UI con sesión) | `d6efde9a-ad3a-4be7-ba1e-8bf8cb6fe123` | ✅ |
| Curso académico de prueba B ("Análisis de Algoritmos — Prueba spec-032", código `ALG-032B`, sin `course_slug`) | Misma excepción que curso A | `738c0362-2fff-4110-bd80-486f3df4b884` | ✅ |
| Estudiante matriculado en el curso A (`estudiante.spec032@nodo.local`) | `POST /api/students` con `academic_course_id` (matrícula en el mismo request) | `fe555336-cf84-44bf-9ed0-85c79532f623` | ✅ |
| 3 preguntas `multiple_choice` de prueba (una por variante) | `question-bank-mcp` → `create_question` + `publish_question` | `09d7cc66-badf-4a9f-82f1-ff67656b26a9`, `7c2e8f95-dbbf-409b-ad91-3b3a161500e6`, `1bb8d84b-cf11-4f1b-9489-fa2ccd136984` | ✅ |
| Grupo de evaluación "[Prueba spec-032] Quiz de navegación" en curso A (variantes A/B/C) — solo para ejercitar TC-007 paso 5 | `assignment-mcp` → `create_assignment_group` | `cc0ff63e-7c3e-4b7c-a5c5-97cba28f85ce` | ✅ |

**Cuenta docente:** `dev@nodo.local` (entorno de desarrollo, ver CLAUDE.md → "Base de datos")
**Entorno de pruebas:** desarrollo (Supabase local en `mirp-lab` vía túnel SSH)
**Fecha de la ronda:** 2026-07-31

> **Nota de excepción al protocolo:** no existe endpoint REST para crear
> `academic_courses` (solo Server Action `createCourseAction` ligada a sesión
> UI). El usuario autorizó explícitamente insertar los cursos A y B vía
> `SUPABASE_SERVICE_ROLE_KEY` como excepción puntual para esta ronda, en lugar
> de crearlos manualmente en `/admin/courses/new`.

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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

---

### TC-003 — Tabla de cursos sin columna "Acciones"
**Precondición:** Sesión docente con al menos dos cursos (A y B).
**Datos de prueba usados:** cursos A y B.
**Pasos:**
1. Abrir `/admin/courses`.
2. Revisar los encabezados de la tabla y el contenido de cada fila.

**Resultado esperado:** Las columnas son Nombre, Código, Horario, Código matrícula
y Estado. No existe columna "Acciones" ni botón/dropdown "Acciones" en ninguna fila.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** confirma la corrección de @reviewer sobre el *stretched link*
(antes solo la columna "Nombre" navegaba); clic en "Código" y "Estado" navega
correctamente.

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
**Estado:** ✅ Aprobado
**Hallazgos:** el ring de foco añadido en la corrección de @reviewer
(`focus-visible:ring-2`) es visible; `Enter` navega correctamente.

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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

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
**Estado:** ✅ Aprobado
**Hallazgos:** paso 5 requirió crear un grupo de evaluación de prueba (no había
ninguno en el curso); confirma la corrección de @reviewer (M4) sobre el
matching de segmento en `CourseTabs` para subrutas profundas
(`/assignments/<groupId>`).

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
**Estado:** ✅ Aprobado
**Hallazgos:** el usuario unificó el `max-w-*` de `page.tsx`, `contenido/page.tsx`
y `edit/page.tsx` a `max-w-7xl` durante la ronda (resuelve S1 del reviewer, ancho
inconsistente entre pestañas del curso).

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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

---

### TC-010 — La asistencia desde la lección sigue funcionando (regresión spec-031)
**Precondición:** TC-009 aprobado. Curso A con `course_slug` asociado a un curso
publicado con al menos una lección.
**Datos de prueba usados:** curso A (`course_slug: estructuras-de-datos`), lección
`fundamentos-control-de-versiones`, estudiante matriculado.
**Pasos:**
1. Como docente, abrir `/estructuras-de-datos/fundamentos-control-de-versiones`.
2. En el panel docente, abrir una sesión de asistencia y anotar el código generado.
3. Verificar que se muestra el conteo de asistentes.
4. Cerrar la sesión de asistencia.

**Resultado esperado:** El panel docente de la lección abre la sesión, muestra el
código y el conteo, y la cierra sin errores. Eliminar la página `/admin/.../attendance`
no afectó este flujo.
**Estado:** ✅ Aprobado
**Hallazgos:** confirma que quitar el `revalidatePath` muerto (M1 de @reviewer)
no rompió el flujo; el panel sigue actualizando su estado en cliente sin
depender de esa ruta.

---

### TC-011 — El navbar del estudiante no cambió
**Precondición:** Sesión iniciada con una cuenta de estudiante.
**Datos de prueba usados:** estudiante matriculado en el curso A.
**Pasos:**
1. Iniciar sesión como estudiante.
2. Observar el navbar en `/cuenta/cursos` y dentro de un curso matriculado.

**Resultado esperado:** El navbar del estudiante muestra "Mis cursos" y "Grupo de
Investigación", igual que antes del cambio. Ningún elemento del panel docente es visible.
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones.

---

## Resumen de la ronda

- Aprobados: 11 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno nuevo (DEBT-032 ya se
  había registrado tras la revisión de @reviewer, antes de esta ronda; ver TC-008)
- Limpieza de datos de prueba: ✅ Completada (cursos A y B, estudiante, 3
  preguntas y 1 grupo de evaluación de prueba, todos eliminados y verificados)
