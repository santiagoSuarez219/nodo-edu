# test-039 — Habilitar y deshabilitar lecciones vía MCP

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|----------------------|---------------|-----------|
| Docente de desarrollo sembrado (dueño del curso de pruebas) | ya existe — `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | N/A (no se elimina, es la cuenta base de desarrollo) |
| Curso del catálogo usado en la ronda | contenido versionado en git, no se crea | `analisis-de-algoritmos` | N/A |
| Lección **A** (se deshabilitará y reabrirá) | contenido existente | `analisis-de-algoritmos` / `sintaxis-de-python` | N/A |
| Lección **B** (se completará antes de cerrarla, para TC-011) | contenido existente | `analisis-de-algoritmos` / `fundamentos-control-de-versiones-y-flujo-de-trabajo` | N/A |
| Lección **C** (primera sin completar, para el redirect de TC-009) | contenido existente | `analisis-de-algoritmos` / `algoritmos-como-tecnologia` | N/A |
| Curso académico **Grupo A** (`course_slug=analisis-de-algoritmos`, docente dueño `dev@nodo.local`) | inserción directa vía `service_role` (no existe MCP/API para crear cursos académicos; autorizado explícitamente por el usuario, 2026-08-02) | `00d0f44d-5459-45bc-826d-988428ea3d69` (código `S039A000`) | ⬜ |
| Curso académico **Grupo B** (mismo `course_slug`, mismo docente dueño) — para TC-016 | inserción directa vía `service_role` (mismo motivo) | `9479dc67-6493-46b2-b612-a889d2879bfe` (código `S039B000`) | ⬜ |
| Curso académico de **otro `course_slug`** (`estructuras-de-datos`) — para TC-019. **Compartido con la ronda de spec-038** (su "Grupo A — Estructuras") | inserción directa vía `service_role` | `c2e3dd17-8128-464b-b22f-56df684597fe` (código `S038A000`) | ⬜ |
| Estudiante **E1**, matriculado activo en Grupo A | `students-mcp` → `create_student` + `enroll_student` | `064e4a19-eef6-4005-9415-4abded1dab5c` — `test-student-spec039@nodo.test` / `TestStudent039!`, enrollment `fd66546e-bc34-4506-a925-5af5d24d6e39` | ⬜ |
| Estudiante **E2**, matriculado activo en Grupo B (mismo `course_slug`) — para TC-016 | `students-mcp` → `create_student` + `enroll_student` | `0dc129f9-4ea2-475a-87de-a6eb8ea9b2d3` — `test-student2-spec039@nodo.test` / `TestStudent039!` | ⬜ |
| Estudiante **E3**, matriculado **solo** en `estructuras-de-datos` — para TC-019 | `students-mcp` → `create_student` + `enroll_student` | `85800ee2-ca21-48f5-aa96-f27b789ea552` — `test-student3-spec039@nodo.test` / `TestStudent039!` | ⬜ |
| Usuario **admin** no dueño del curso — para TC-013. **Compartido con la ronda de spec-038** | Supabase Auth `admin.createUser` + fila en `user_roles` vía `service_role` (autorizado explícitamente, 2026-08-02) | `b35310a3-03bd-4bfb-a8bb-fe8df9fb1253` — `test-admin-shared@nodo.test` / `TestAdminShared038!` | ⬜ |
| Filas de `disabled_lessons` creadas durante la ronda (TC-003 en adelante y todos los `TC-MCP-*`) | `courses-mcp` → `set_lesson_availability { enabled: false }` | `(analisis-de-algoritmos, sintaxis-de-python)`, `(analisis-de-algoritmos, fundamentos-control-de-versiones-y-flujo-de-trabajo)`, y las que se generen en los casos MCP | ⬜ |
| Fila **huérfana** simulada en `disabled_lessons` — para TC-MCP-012 | inserción directa en la base **de desarrollo** (`lesson_slug` inexistente en el catálogo; no hay endpoint que la produzca, por diseño) — **requiere tu autorización explícita en el momento de ejecutar ese caso**, no se creó en esta pasada | `(analisis-de-algoritmos, leccion-que-no-existe-spec039)` | ⬜ |

**Entorno de pruebas:** desarrollo — Supabase local corriendo en `mirp-lab` a través del túnel SSH (ver `CLAUDE.md` → "Base de datos"), con `npm run dev` levantado en esta máquina (puerto **3002**, ver `package.json`) y `courses-mcp` (variante **local**, nunca `courses-mcp-prod`) apuntando a `http://localhost:3002/api/courses` con `COURSES_ADMIN_API_KEY` de desarrollo. **Nota:** `courses-mcp` no está registrado en la sesión actual de Claude Code (se añadió a `.mcp.json` después de que la sesión arrancara) — reiniciar Claude Code antes de ejecutar los casos `TC-MCP-*` o cualquier caso que dependa de deshabilitar/habilitar lecciones.
**Fecha de la ronda:** {{fecha}}

**Preparación previa (antes del primer caso):**

1. Confirmar el túnel SSH y que el stack de Supabase está arriba en `mirp-lab`.
2. Confirmar que las migraciones de la Fase 1 están aplicadas en la base local (`disabled_lessons` existe con RLS habilitado) — verificado en la Fase 1 de implementación.
3. ✅ Los tres estudiantes ya están creados y matriculados (ver tabla de arriba).
4. Verificar con `courses-mcp` → `list_course_lessons { course_slug: "analisis-de-algoritmos" }` que **ninguna** lección está deshabilitada al arrancar (`meta.disabled_count === 0`). Si alguna lo está, reabrirla antes de empezar. **Pendiente de ejecutar** (requiere `courses-mcp` cargado en la sesión, ver nota de arriba).

---

## Casos de prueba

### TC-001 — La lección deshabilitada sigue listada en el índice lateral, sin enlace
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 1
**Precondición:** la lección A está deshabilitada (cerrarla con `courses-mcp` → `set_lesson_availability { course_slug: "analisis-de-algoritmos", lesson_slug: "sintaxis-de-python", enabled: false, reason: "Ronda de pruebas spec-039" }`).
**Datos de prueba usados:** `test-student-spec039@nodo.test` / `TestStudent039!`
**Pasos:**
1. Iniciar sesión como E1.
2. Abrir cualquier lección **habilitada** del curso `analisis-de-algoritmos`.
3. Observar la entrada de la lección A en el índice lateral (escritorio).
4. Abrir el índice en viewport móvil y repetir la observación.
**Resultado esperado:** la lección A **sigue apareciendo** en el índice, con su número de clase y su título; lleva la etiqueta "No disponible"; **no es un enlace** (no navega al hacer clic, cursor no de enlace, `aria-disabled` presente).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — "No disponible" se distingue de "Próximamente" (lección sin artículo)
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 1 (legibilidad del estado)
**Precondición:** el curso tiene, a la vez, la lección A deshabilitada y al menos una lección sin `articleSlug` (placeholder "Apuntes en preparación"). Si el curso elegido no tiene ninguna sin artículo, dejarlo anotado y marcar el caso como no aplicable.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, abrir una lección habilitada del curso.
2. Comparar en el índice lateral la entrada de la lección A (deshabilitada) con la de una lección sin artículo.
**Resultado esperado:** ambas están listadas y sin enlace, pero se distinguen entre sí por etiqueta y tratamiento visual; un estudiante no confunde "cerrada por el docente" con "todavía no escrita".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-003 — Gate en la página: URL directa muestra "Lección no disponible", sin 404 ni redirect
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 2
**Precondición:** lección A deshabilitada.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, navegar directamente a `/analisis-de-algoritmos/sintaxis-de-python`.
2. Observar la URL de la barra de direcciones tras la carga.
3. Observar el cuerpo de la página y el sidebar.
**Resultado esperado:** la URL **no cambia** (sin redirect); no aparece la página de 404; en lugar del artículo se ve el bloque "Esta lección todavía no está disponible" + "Tu docente la abrirá cuando corresponda", con la lista de temas previstos; el título de la lección y el sidebar siguen visibles e intactos.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — El contenido del artículo no llega al cliente
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 3
**Precondición:** TC-003 en pantalla.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Con la página bloqueada abierta, ver el código fuente (`Ctrl/Cmd+U`) y buscar (`Ctrl/Cmd+F`) una frase literal que exista en el MDX de la lección A y no en su título ni en sus `topics`.
2. Repetir la búsqueda en la respuesta de red del documento (pestaña Network → documento HTML → Response) y en las cargas útiles RSC (`?_rsc=` / `text/x-component`).
**Resultado esperado:** la frase **no aparece** en ninguna de las dos: ni en el HTML ni en el payload RSC. El bloqueo no es solo visual.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-005 — No se puede marcar como completada una lección deshabilitada
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 4
**Precondición:** lección A deshabilitada; E1 **no** la tiene completada.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, abrir la lección A bloqueada: comprobar que **no** se ofrece el flujo de cierre (autoevaluación ni botón "Marcar como completada").
2. Forzar la invocación de la server action saltándose la UI: abrir una lección **habilitada** del curso, disparar allí el cierre y, con las DevTools abiertas, repetir la petición POST de la server action cambiando el `lessonSlug` al de la lección A (Network → "Copy as fetch" → editar el cuerpo → ejecutar en la consola).
3. Observar la respuesta.
4. Consultar en la base de desarrollo si existe fila de `lesson_progress` para `(E1, analisis-de-algoritmos, sintaxis-de-python)`.
**Resultado esperado:** la respuesta indica el rechazo con `reason: "lesson_disabled"` y **no** se crea ninguna fila en `lesson_progress` para esa lección. El mensaje visible (si se muestra) dice que la lección está deshabilitada.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — Visitar una lección deshabilitada no registra `viewed_at`
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 5
**Precondición:** lección A deshabilitada y **sin** fila previa en `lesson_progress` para E1 (si la hay por rondas anteriores, borrarla y anotarlo).
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, abrir `/analisis-de-algoritmos/sintaxis-de-python` y permanecer unos segundos.
2. Recargar una vez más.
3. Consultar `lesson_progress` en la base de desarrollo filtrando por E1 y esa lección.
**Resultado esperado:** no existe fila, o si existía de antes, su `viewed_at` **no** se actualizó.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-007 — La barra de progreso del sidebar excluye las deshabilitadas
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 6
**Precondición:** E1 tiene al menos una lección completada; la lección A está **habilitada** al empezar el caso.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, abrir una lección del curso y anotar el valor exacto de la barra de progreso del sidebar ("N de M").
2. Con `courses-mcp`, deshabilitar la lección A (aún **no** completada por E1).
3. Recargar la página del estudiante y volver a anotar el valor.
**Resultado esperado:** el denominador **M baja en 1**; el numerador N se mantiene; `N ≤ M` en todo momento.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — "N de M lecciones completadas" del detalle de matrícula excluye las deshabilitadas
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 6
**Precondición:** E1 tiene completada la lección **B**; la lección B está habilitada al empezar.
**Datos de prueba usados:** `test-student-spec039@nodo.test`, enrollment de E1 en Grupo A
**Pasos:**
1. Como E1, entrar a `/cuenta/cursos/fd66546e-bc34-4506-a925-5af5d24d6e39` y anotar "N de M lecciones completadas".
2. Con `courses-mcp`, deshabilitar la lección **B** (ya completada por E1).
3. Recargar la página y anotar el nuevo valor.
**Resultado esperado:** bajan **numerador y denominador** (p. ej. de 5 de 10 a 4 de 9), nunca solo uno; `N ≤ M` siempre; no aparece un conteo del tipo "8 de 7". El total tampoco incluye las guías de laboratorio (corrección de scope de la Fase 4).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-009 — `/[courseSlug]` redirige a la primera lección **habilitada** sin completar
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 7
**Precondición:** la primera lección sin completar de E1 es la lección **C**; se deshabilita **C** para el caso.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, entrar a `/analisis-de-algoritmos` y anotar a qué lección redirige (debería ser C).
2. Con `courses-mcp`, deshabilitar la lección C.
3. Volver a entrar a `/analisis-de-algoritmos`.
**Resultado esperado:** el redirect aterriza en la **siguiente lección habilitada sin completar**, saltando C; nunca en una lección cerrada, y sin rebotes ni bucles de redirección.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-010 — Curso con todas las lecciones cerradas (estado degenerado, R2)
**Rol que ejecuta:** estudiante **E1** (preparación con `courses-mcp`)
**Criterio cubierto:** R2 (riesgo aceptado, no criterio numerado)
**Precondición:** deshabilitar **todas** las lecciones navegables del curso `analisis-de-algoritmos` con `set_lesson_availability`. Anotar la lista completa para poder revertirla.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, entrar a `/analisis-de-algoritmos`.
2. Al terminar el caso, **reabrir inmediatamente** todas las lecciones cerradas en este paso.
**Resultado esperado:** la página responde `notFound()` (404), sin error no controlado ni pantalla rota. Se documenta como comportamiento aceptado por el spec (R2), no como fallo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-011 — El progreso se conserva al cerrar y reaparece al reabrir
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 8
**Precondición:** E1 tiene la lección **B** completada y B está habilitada.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, verificar en el sidebar que B aparece como completada; anotar el conteo de progreso.
2. Con `courses-mcp`, deshabilitar B. Recargar como E1: B pasa a "No disponible" y sale de ambos conteos.
3. Consultar `lesson_progress` en la base de desarrollo para `(E1, B)`.
4. Con `courses-mcp`, reabrir B (`enabled: true`). Recargar como E1.
**Resultado esperado:** en el paso 3 la fila de `lesson_progress` **sigue existiendo**, con su `completed_at` original intacto; en el paso 4 B vuelve a mostrarse como completada y el conteo regresa exactamente al valor del paso 1.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-012 — El docente dueño entra a una lección cerrada y ve el aviso
**Rol que ejecuta:** docente dueño (`dev@nodo.local`)
**Criterio cubierto:** 9
**Precondición:** lección A deshabilitada; el usuario es `teacher_id` del curso académico de `analisis-de-algoritmos`.
**Datos de prueba usados:** `dev@nodo.local` / `DevLocal2026!`
**Pasos:**
1. Iniciar sesión como el docente dueño.
2. Navegar a `/analisis-de-algoritmos/sintaxis-de-python`.
3. Observar la cabecera, el cuerpo y el sidebar.
**Resultado esperado:** ve el **artículo completo** (no el bloque de bloqueo) y, destacado, el aviso "Lección deshabilitada — los estudiantes no pueden abrirla". El resto del panel docente de la lección sigue funcionando como siempre.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-013 — El admin no dueño tampoco es bloqueado
**Rol que ejecuta:** **admin** de prueba (no dueño del curso)
**Criterio cubierto:** 9
**Precondición:** lección A deshabilitada; usuario con rol `admin` que **no** es `teacher_id` del curso.
**Datos de prueba usados:** `test-admin-spec039@nodo.test` / `TestAdmin039!`
**Pasos:**
1. Iniciar sesión como el admin de prueba.
2. Navegar a la lección A.
**Resultado esperado:** ve el contenido completo y el mismo aviso de lección cerrada, igual que el dueño.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-014 — Fallo al verificar la disponibilidad: mensaje distinto del de "deshabilitada"
**Rol que ejecuta:** estudiante **E1** (con intervención manual sobre la instancia local)
**Criterio cubierto:** 10
**Precondición:** ⚠️ **Este caso requiere intervención manual sobre la base de desarrollo en `mirp-lab`**: no hay forma de provocarlo desde la UI. Opciones, de menor a mayor invasividad — elegir una y dejar registrado cuál se usó:
- **(a) Recomendada:** renombrar temporalmente la tabla en la base local (`alter table public.disabled_lessons rename to disabled_lessons_tc014;`), de modo que la consulta falle y `getDisabledLessonSlugs` devuelva `status: "unavailable"`. Revertir con el `rename` inverso **inmediatamente** al terminar el caso.
- **(b)** Revocar temporalmente el `SELECT` de la tabla al rol usado por la app y restaurarlo al terminar.
- **(c)** Cortar el túnel SSH a `mirp-lab` — más realista, pero rompe también `requireCourseAccess` y probablemente redirija al login antes de llegar al gate; sirve solo para confirmar esa cascada, no el copy.

Nunca ejecutar ninguna de las tres contra producción.
**Datos de prueba usados:** `test-student-spec039@nodo.test`; lección A **habilitada** (para que el mensaje no pueda confundirse con el de cierre)
**Pasos:**
1. Provocar el fallo con la opción elegida.
2. Como E1, abrir la lección A y observar el bloque que sustituye al artículo.
3. Intentar marcarla como completada (o invocar la server action como en TC-005) y observar la respuesta.
4. Como **docente dueño**, abrir la misma lección.
5. Observar el sidebar en ambas sesiones.
6. Revertir el cambio en la base y confirmar que todo vuelve a la normalidad.
**Resultado esperado:**
- Estudiante: bloqueado, con el copy "No pudimos verificar la disponibilidad de esta lección. Intenta de nuevo en unos minutos." — **nunca** el copy de "lección deshabilitada".
- Completar: denegado con `reason: "availability_unavailable"`, sin escribir en `lesson_progress`.
- Docente dueño: **no** bloqueado y **sin** aviso de estado.
- Sidebar: no marca nada como "No disponible", renderiza como siempre.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-015 — El cierre es visible al instante, sin desplegar ni reiniciar
**Rol que ejecuta:** estudiante **E1** + operador de `courses-mcp`
**Criterio cubierto:** 12
**Precondición:** lección A habilitada y abierta en el navegador de E1.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, abrir la lección A y comprobar que se lee normalmente.
2. Sin tocar el servidor de desarrollo ni desplegar nada, ejecutar `set_lesson_availability { enabled: false }` sobre esa lección.
3. Recargar la página de E1 (una sola recarga, sin limpiar caché ni reiniciar `npm run dev`).
**Resultado esperado:** tras la recarga, la lección ya aparece bloqueada y marcada como "No disponible" en el sidebar.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-016 — El cierre afecta a todos los grupos del mismo `course_slug`
**Rol que ejecuta:** estudiantes **E1** (Grupo A) y **E2** (Grupo B)
**Criterio cubierto:** 15
**Precondición:** dos cursos académicos activos con el mismo `course_slug` (`analisis-de-algoritmos`), con E1 matriculado en A y E2 en B; lección A habilitada.
**Datos de prueba usados:** `test-student-spec039@nodo.test` y `test-student2-spec039@nodo.test`
**Pasos:**
1. Comprobar en dos sesiones de navegador distintas que E1 y E2 pueden abrir la lección A.
2. Ejecutar `set_lesson_availability { enabled: false }` **una sola vez**.
3. Recargar en ambas sesiones.
**Resultado esperado:** la lección queda cerrada para **ambos** estudiantes, con una sola operación; ninguno de los dos grupos conserva acceso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-017 — Presentación del bloque en modo claro/oscuro y en móvil
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** transversal (`DESIGN.md`, no criterio numerado)
**Precondición:** lección A deshabilitada.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Con la página bloqueada abierta, alternar el tema del sitio.
2. Repetir en viewport móvil, con el índice lateral abierto y cerrado.
**Resultado esperado:** el bloque "Lección no disponible" y la etiqueta del sidebar son legibles en ambos temas, con contraste suficiente, sin desbordes ni layout roto en móvil.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-018 — Un estudiante autenticado no puede escribir en `disabled_lessons` (RLS)
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** seguridad — criterio 18 del bloque "Seguridad"
**Precondición:** E1 autenticado en el navegador, con sesión activa en la app; lección A **habilitada** para poder detectar cualquier escritura indebida.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, con la app abierta, ejecutar desde la consola del navegador una escritura directa contra Supabase usando el cliente de navegador (`createBrowserClient` con `NEXT_PUBLIC_SUPABASE_URL` y la clave publicable de desarrollo) y la sesión activa:
   - `insert` de `{ course_slug: "analisis-de-algoritmos", lesson_slug: "sintaxis-de-python" }` en `disabled_lessons`.
   - `delete` sobre una fila existente de `disabled_lessons` de su propio curso (crearla antes con `courses-mcp` si hace falta).
2. Anotar el error devuelto en cada caso.
3. Consultar la tabla en la base de desarrollo para confirmar que nada cambió.
**Resultado esperado:** ambas operaciones son rechazadas por RLS (error de política, `42501` o equivalente); no se crea ni se borra ninguna fila, ni siquiera en el curso donde el estudiante sí está matriculado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-019 — Un estudiante no lee las filas de un curso donde no está matriculado (RLS)
**Rol que ejecuta:** estudiante **E3** (matriculado solo en `estructuras-de-datos`)
**Criterio cubierto:** seguridad — criterio 19 del bloque "Seguridad"
**Precondición:** existe al menos una fila de `disabled_lessons` para `analisis-de-algoritmos` (dejar la lección A cerrada); E3 **no** está matriculado en ese curso.
**Datos de prueba usados:** `test-student3-spec039@nodo.test` / `TestStudent039!`
**Pasos:**
1. Iniciar sesión como E3.
2. Desde la consola del navegador, con el cliente de Supabase y su sesión, hacer `select` sobre `disabled_lessons` filtrando por `course_slug = "analisis-de-algoritmos"`.
3. Repetir el `select` sin filtro.
4. Como control, hacer el mismo `select` como E1 (sí matriculado en ese curso).
**Resultado esperado:** E3 recibe **cero filas** de `analisis-de-algoritmos` (ni error informativo que revele su contenido); E1 sí ve las filas de su curso. La lectura está limitada a los cursos con acceso.
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

### TC-MCP-001 — `list_course_lessons` devuelve el catálogo ordenado y con estado
**Herramienta probada:** `list_course_lessons` en `courses-mcp`
**Rol que ejecuta:** operador del MCP (agente docente, clave `COURSES_ADMIN_API_KEY` de desarrollo)
**Criterio cubierto:** 11
**Precondición:** `npm run dev` corriendo; ninguna lección de `analisis-de-algoritmos` deshabilitada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** `data.course_slug` y `data.course_title` correctos; `data.lessons` contiene **todas** las lecciones y guías del catálogo, en el mismo orden que el índice lateral, cada una con `lesson_slug`, `title`, `order`, `kind` (`"lesson"` / `"guide"`), `has_article`, `is_disabled: false`, `disabled_at: null`, `disabled_reason: null`. `meta.total` coincide con la longitud del arreglo, `meta.disabled_count === 0`, `meta.orphan_disabled_slugs` vacío.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-002 — `get_lesson_availability` sobre una lección abierta
**Herramienta probada:** `get_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 11 (forma de `LessonAvailability`)
**Precondición:** la lección A está habilitada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python" }`
**Output esperado:** un único `LessonAvailability` con `is_disabled: false`, `disabled_at: null`, `disabled_reason: null`, y exactamente los mismos campos que la entrada correspondiente de `list_course_lessons`. **No** se expone `disabled_by`.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-003 — `set_lesson_availability` cierra la lección (`changed: true`)
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 12, 16 (bloque MCP)
**Precondición:** lección A habilitada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": false, "reason": "Se abre tras la sesión del jueves" }`
**Output esperado:** `200`; `data.is_disabled: true`, `data.disabled_reason` igual al enviado, `data.disabled_at` con marca de tiempo reciente; `meta.changed: true`. Una nueva fila en `disabled_lessons` con `disabled_by: null`. Verificar con `get_lesson_availability` que el estado persiste.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-004 — Idempotencia: repetir el cierre sin `reason` no cambia nada
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 13, 16 (bloque MCP)
**Precondición:** TC-MCP-003 ejecutado; anotar el `disabled_at` resultante.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": false }`
**Output esperado:** `200` (nunca `409`); `meta.changed: false`; `data.disabled_at` **idéntico** al anotado y `data.disabled_reason` intacto. La fila no se reescribe.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-005 — Cierre con `reason` distinto: se reemplaza y se refresca `disabled_at`
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 16 (bloque MCP — semántica de `changed`)
**Precondición:** la lección A sigue cerrada, con el `reason` de TC-MCP-003.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": false, "reason": "Se detectó un error en el enunciado" }`
**Output esperado:** `200`; `meta.changed: true`; `data.disabled_reason` es el nuevo texto y `data.disabled_at` **posterior** al anotado en TC-MCP-003.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-006 — Reabrir es idempotente en ambos sentidos
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 13, 16 (bloque MCP)
**Precondición:** la lección A está cerrada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": true }`, ejecutado **dos veces seguidas**.
**Output esperado:** primera llamada → `200`, `meta.changed: true`, `data.is_disabled: false`, `disabled_at`/`disabled_reason` en `null`, fila borrada de `disabled_lessons`. Segunda llamada → `200` con `meta.changed: false` y el mismo `data`; **nunca** un error por pedir el estado en el que ya se está.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-007 — `lesson_slug` inexistente → `404` y cero filas creadas
**Herramienta probada:** `set_lesson_availability` (y `get_lesson_availability`) en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 14
**Precondición:** anotar el número exacto de filas de `disabled_lessons` antes del caso.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "leccion-inventada-xyz", "enabled": false, "reason": "no debería crearse" }`; después, `get_lesson_availability` con ese mismo `lesson_slug`.
**Output esperado:** error de herramienta con el mensaje del `404` (`"Lección no encontrada en analisis-de-algoritmos: leccion-inventada-xyz"`); el conteo de filas de `disabled_lessons` es **idéntico** al de antes. `get_lesson_availability` también devuelve `404`, nunca `is_disabled: false` para un slug inexistente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-008 — `course_slug` inexistente → `404`
**Herramienta probada:** `list_course_lessons`, `get_lesson_availability`, `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** contrato M3 (no criterio numerado)
**Precondición:** ninguna.
**Input de prueba:** `course_slug: "curso-que-no-existe"` en las tres herramientas.
**Output esperado:** las tres devuelven el `404` con `"Curso no encontrado: curso-que-no-existe"`; ninguna consulta a Supabase precede a la validación (no se crea ni se lee nada).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-009 — `reason` junto a `enabled: true` → `422`
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** contrato M3 (no criterio numerado)
**Precondición:** lección A en cualquier estado; anotarlo.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": true, "reason": "esto no debería aceptarse" }`. Adicionalmente: `enabled` ausente, `enabled: "false"` (string) y `reason` de más de 280 caracteres con `enabled: false`.
**Output esperado:** los cuatro devuelven `422` de validación con el campo señalado; el estado de la lección **no cambia** respecto a lo anotado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-010 — Separación de claves: solo `COURSES_ADMIN_API_KEY` abre las rutas
**Herramienta probada:** rutas `/api/courses/[courseSlug]/lessons*` que respaldan a `courses-mcp`
**Rol que ejecuta:** operador del MCP (llamadas HTTP directas con `curl`)
**Criterio cubierto:** M2 / criterio de aceptación de la Fase 5
**Precondición:** `npm run dev` corriendo.
**Input de prueba:** tres `GET` a `/api/courses/analisis-de-algoritmos/lessons`: (a) sin cabecera `x-api-key`; (b) con `QUESTION_BANK_API_KEY`; (c) con `STUDENTS_ADMIN_API_KEY`.
**Output esperado:** las tres responden `401` con el cuerpo de `unauthorizedError`; ninguna devuelve datos. (Solo la clave propia de este dominio funciona — confirmado en TC-MCP-001.)
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-011 — Configuración ausente responde `500`, no `401`
**Herramienta probada:** rutas `/api/courses/[courseSlug]/lessons*`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** M2 (diagnosticabilidad; no criterio numerado)
**Precondición:** ⚠️ requiere intervención manual: comentar `COURSES_ADMIN_API_KEY` en `.env.local` y reiniciar `npm run dev`. Restaurarla y reiniciar al terminar el caso.
**Input de prueba:** `GET /api/courses/analisis-de-algoritmos/lessons` con una `x-api-key` cualquiera.
**Output esperado:** `500` con `configuration_error` ("Servicio mal configurado."), **nunca** `401` — el motivo no debe filtrarse como fallo de credencial.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-012 — Filas huérfanas se reportan y no rompen el listado
**Herramienta probada:** `list_course_lessons` en `courses-mcp`
**Rol que ejecuta:** operador del MCP (preparación con inserción directa en la base de desarrollo)
**Criterio cubierto:** 17 (bloque MCP) / R4
**Precondición:** insertar a mano en la base **de desarrollo** una fila `(course_slug: "analisis-de-algoritmos", lesson_slug: "leccion-que-no-existe-spec039")` — no existe endpoint que la produzca, por diseño. Registrarla en la tabla de datos de prueba y borrarla al cerrar el caso.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** la llamada responde `200` sin errores; `data.lessons` conserva el catálogo completo y correcto (la fila huérfana **no** aparece como lección); `meta.orphan_disabled_slugs` contiene `"leccion-que-no-existe-spec039"`; la fila **no** se borra automáticamente. Verificar además que la UI del estudiante no se ve afectada.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-MCP-013 — El servidor `courses-mcp` arranca con el wrapper local
**Herramienta probada:** servidor `courses-mcp` (arranque, no una herramienta concreta)
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** Fase 5.5 (no criterio numerado)
**Precondición:** `.env.local` con `COURSES_ADMIN_API_KEY` definida; `mcp-servers/courses-mcp` compilado.
**Input de prueba:** `./mcp-servers/run-local-mcp.sh courses-mcp </dev/null`
**Output esperado:** el servidor imprime su línea de inicio y termina sin errores de variables faltantes; en particular no reclama `API_BASE_URL` ni `API_KEY` (el wrapper los mapea desde `COURSES_API_BASE_URL` / `COURSES_ADMIN_API_KEY`).
**Estado:** ⬜ Pendiente
**Hallazgos:**

---

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: 32 (19 UI + 13 MCP)
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}} — recordatorio: R3 (evaluaciones apuntando a una lección cerrada) debe registrarse en el backlog al implementar, según el spec.
- Limpieza de datos de prueba: ⬜ Pendiente
  - [ ] Todas las filas de `disabled_lessons` creadas en la ronda, borradas con `set_lesson_availability { enabled: true }` (verificar `meta.disabled_count === 0` con `list_course_lessons`).
  - [ ] Fila huérfana de TC-MCP-012 borrada a mano y confirmada con `list_course_lessons` (`meta.orphan_disabled_slugs` vacío).
  - [ ] Cambios manuales de TC-014 (renombrado/permisos de la tabla) y de TC-MCP-011 (`.env.local`) revertidos, con `npm run dev` reiniciado.
  - [ ] Estudiantes E1, E2 y E3 eliminados con `students-mcp` → `delete_student` (matrículas en cascada) y verificado el `404` posterior.
  - [ ] Admin de prueba eliminado (Auth + `user_roles`).
  - [ ] Cursos académicos Grupo B y el de `estructuras-de-datos` eliminados; Grupo A conservado si es el curso real de desarrollo (anotarlo).
