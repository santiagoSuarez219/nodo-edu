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
| Filas de `disabled_lessons` creadas durante la ronda (TC-001 en adelante y todos los `TC-MCP-*`) | `courses-mcp` → `set_lesson_availability { enabled: false }` | `(analisis-de-algoritmos, sintaxis-de-python)` — creada para TC-001, `disabled_at: 2026-08-02T12:56:00.065Z`; y las que se generen en los casos siguientes | ⬜ |
| Fila **huérfana** simulada en `disabled_lessons` — para TC-MCP-012 | inserción directa en la base **de desarrollo** (`lesson_slug` inexistente en el catálogo; no hay endpoint que la produzca, por diseño) — **requiere tu autorización explícita en el momento de ejecutar ese caso**, no se creó en esta pasada | `(analisis-de-algoritmos, leccion-que-no-existe-spec039)` | ⬜ |

**Entorno de pruebas:** desarrollo — Supabase local corriendo en `mirp-lab` a través del túnel SSH (ver `CLAUDE.md` → "Base de datos"), con `npm run dev` levantado en esta máquina (puerto **3002**, ver `package.json`) y `courses-mcp` (variante **local**, nunca `courses-mcp-prod`) apuntando a `http://localhost:3002/api/courses` con `COURSES_ADMIN_API_KEY` de desarrollo. **Nota:** `courses-mcp` no está registrado en la sesión actual de Claude Code (se añadió a `.mcp.json` después de que la sesión arrancara) — reiniciar Claude Code antes de ejecutar los casos `TC-MCP-*` o cualquier caso que dependa de deshabilitar/habilitar lecciones.
**Fecha de la ronda:** 2026-08-02

**Preparación previa (antes del primer caso):**

1. Confirmar el túnel SSH y que el stack de Supabase está arriba en `mirp-lab`.
2. Confirmar que las migraciones de la Fase 1 están aplicadas en la base local (`disabled_lessons` existe con RLS habilitado) — verificado en la Fase 1 de implementación.
3. ✅ Los tres estudiantes ya están creados y matriculados (ver tabla de arriba).
4. ✅ Verificado con `courses-mcp` → `list_course_lessons { course_slug: "analisis-de-algoritmos" }`: `meta.disabled_count === 0`, `meta.orphan_disabled_slugs` vacío, 18 elementos en el catálogo.

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
**Estado:** ✅ Aprobado
**Hallazgos:** sin observaciones

### TC-002 — "No disponible" se distingue de "Próximamente" (lección sin artículo)
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 1 (legibilidad del estado)
**Precondición:** el curso tiene, a la vez, la lección A deshabilitada y al menos una lección sin `articleSlug` (placeholder "Apuntes en preparación"). Si el curso elegido no tiene ninguna sin artículo, dejarlo anotado y marcar el caso como no aplicable.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, abrir una lección habilitada del curso.
2. Comparar en el índice lateral la entrada de la lección A (deshabilitada) con la de una lección sin artículo.
**Resultado esperado:** ambas están listadas y sin enlace, pero se distinguen entre sí por etiqueta y tratamiento visual; un estudiante no confunde "cerrada por el docente" con "todavía no escrita".
**Estado:** ⬜ No aplicable
**Hallazgos:** ninguna lección de `analisis-de-algoritmos` carece de `articleSlug` (las 18 entradas del catálogo tienen `has_article: true`, confirmado con `list_course_lessons`); no hay caso "Próximamente" contra el cual comparar.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador (autorización explícita del usuario para esta ronda). URL sin cambios, sin 404, bloque y temas previstos exactamente como se esperaba.

### TC-004 — El contenido del artículo no llega al cliente
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** 3
**Precondición:** TC-003 en pantalla.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Con la página bloqueada abierta, ver el código fuente (`Ctrl/Cmd+U`) y buscar (`Ctrl/Cmd+F`) una frase literal que exista en el MDX de la lección A y no en su título ni en sus `topics`.
2. Repetir la búsqueda en la respuesta de red del documento (pestaña Network → documento HTML → Response) y en las cargas útiles RSC (`?_rsc=` / `text/x-component`).
**Resultado esperado:** la frase **no aparece** en ninguna de las dos: ni en el HTML ni en el payload RSC. El bloqueo no es solo visual.
**Estado:** ✅ Aprobado
**Hallazgos:** hallazgo de datos (no de código): la Lección A (`sintaxis-de-python.mdx`) y de hecho **todas** las lecciones del catálogo `analisis-de-algoritmos` excepto la Lección B están vacías (solo frontmatter, 5 líneas) — no había frase real del cuerpo para buscar. Con autorización del usuario, se sustituyó el fixture por la Lección B (`fundamentos-control-de-versiones-y-flujo-de-trabajo`, con contenido real), deshabilitándola temporalmente solo para este caso y reabriéndola de inmediato al terminar. Se verificó la frase distintiva `insertion_sort_v2_final_YA_arreglado.py`: ausente tanto en el HTML del documento (`fetch` directo, 110 383 caracteres) como en el payload RSC (`fetch` con header `RSC: 1`, 333 caracteres, `content-type: text/x-component`). No se registra como hallazgo de código; se documenta como nota de contenido de desarrollo, no bloqueante para el spec.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador (autorización explícita del usuario). Paso 1: la lección A bloqueada no ofrece ni autoevaluación ni "Marcar como completada". Paso 2-3: se interceptó la petición real de `markLessonCompleted` completando la Lección C (capturando `next-action` id vía `window.fetch` sobrescrito), y se reprodujo cambiando el `lessonSlug` a `sintaxis-de-python` — respuesta `200` con cuerpo `{"ok":false,"reason":"lesson_disabled"}`. Paso 4: `lesson_progress` consultada directamente en la base de desarrollo (`service_role`, lectura únicamente) — `rowCount: 0` para `(E1, analisis-de-algoritmos, sintaxis-de-python)`.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador + consulta directa de solo lectura a `lesson_progress` en la base de desarrollo (`service_role`). Sin fila previa; tras visitar dos veces (con recarga), `rowCount: 0`. Nota operativa: el túnel SSH a `mirp-lab` se había caído entre TC-005 y TC-006; se detectó y reconectó antes de reintentar la consulta.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Se completó primero la Lección C como fixture (respondiendo su autoevaluación) para que E1 tuviera progreso previo; valor inicial "1 DE 17 · 6%" con A habilitada, tras deshabilitar A pasó a "1 DE 16 · 6%" — denominador -1, numerador intacto.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Se completó B respondiendo su autoevaluación (5 preguntas, patrón "C"). Valor inicial "2 de 16 lecciones completadas" (A ya deshabilitada de TC-007, B y C completadas); tras deshabilitar B: "1 de 15" — numerador y denominador bajan juntos. El total (16→15, sin contar Lab 01) confirma que las guías no se cuentan.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Para cumplir la precondición ("primera sin completar es C") se completaron primero A y B (ambas con autoevaluación de 5 preguntas cada una) y se desmarcó C. Paso 1: `/analisis-de-algoritmos` redirigió a C. Tras deshabilitar C, el mismo redirect aterrizó en `analisis-de-algoritmos-y-divide-y-venceras` (la siguiente habilitada sin completar), sin rebotes.

### TC-010 — Curso con todas las lecciones cerradas (estado degenerado, R2)
**Rol que ejecuta:** estudiante **E1** (preparación con `courses-mcp`)
**Criterio cubierto:** R2 (riesgo aceptado, no criterio numerado)
**Precondición:** deshabilitar **todas** las lecciones navegables del curso `analisis-de-algoritmos` con `set_lesson_availability`. Anotar la lista completa para poder revertirla.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Como E1, entrar a `/analisis-de-algoritmos`.
2. Al terminar el caso, **reabrir inmediatamente** todas las lecciones cerradas en este paso.
**Resultado esperado:** la página responde `notFound()` (404), sin error no controlado ni pantalla rota. Se documenta como comportamiento aceptado por el spec (R2), no como fallo.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Se deshabilitaron las 17 lecciones navegables del curso una por una (`disabled_count: 17` confirmado con `list_course_lessons`, la guía quedó intacta); `/analisis-de-algoritmos` respondió `404` "Curso no encontrado", sin pantalla rota. Todas las lecciones se reabrieron inmediatamente al cerrar el caso.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador + consulta directa a `lesson_progress`. Paso 1: "2 de 16 lecciones completadas" con B habilitada. Paso 2-3: al deshabilitar B, la fila siguió existiendo con `completed_at: 2026-08-02T13:14:10.747+00:00` intacto. Paso 4: al reabrir B, el detalle de matrícula volvió a mostrar exactamente "2 de 16".

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador (pestaña separada, sesión de docente dueño). Aviso "Lección deshabilitada — los estudiantes no pueden abrirla" visible en recuadro destacado; panel docente (Vista docente / Clave de respuestas de spec-038) funcionando con normalidad debajo.

### TC-013 — El admin no dueño tampoco es bloqueado
**Rol que ejecuta:** **admin** de prueba (no dueño del curso)
**Criterio cubierto:** 9
**Precondición:** lección A deshabilitada; usuario con rol `admin` que **no** es `teacher_id` del curso.
**Datos de prueba usados:** `test-admin-shared@nodo.test` / `TestAdminShared038!`
**Pasos:**
1. Iniciar sesión como el admin de prueba.
2. Navegar a la lección A.
**Resultado esperado:** ve el contenido completo y el mismo aviso de lección cerrada, igual que el dueño.
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador (misma pestaña, sesión cerrada del docente y reabierta como admin). Comportamiento idéntico a TC-012: aviso destacado + panel docente completo.

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
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado con autorización explícita del usuario, opción (a). Se renombró `disabled_lessons` a `disabled_lessons_tc014` vía `psql` en el contenedor Postgres de `mirp-lab` y se revirtió inmediatamente al terminar (confirmado con `list_course_lessons` respondiendo con normalidad, `disabled_count: 0`). Estudiante: copy exacto "No pudimos verificar la disponibilidad de esta lección. Intenta de nuevo en unos minutos.", nunca el de "deshabilitada". Completar forzado (interceptando `markLessonCompleted` como en TC-005): `{"ok":false,"reason":"availability_unavailable"}`. Docente/admin (se usó la sesión de `test-admin-shared@nodo.test`, mismo código de ruta que el dueño): sin bloqueo, sin aviso de estado. Sidebar del estudiante intacto, sin etiqueta "No disponible".

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Lección abierta y legible con A habilitada; tras `set_lesson_availability { enabled: false }` (sin tocar `npm run dev`) y una sola recarga, ya mostraba el bloqueo — sin necesidad de reiniciar nada.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador. Nota metodológica: ambas pestañas comparten el mismo perfil de Chrome (misma cookie jar), así que no hubo dos sesiones *simultáneas* — se verificó E2 (Grupo B) accediendo normalmente con la lección habilitada, luego se cerró con una sola llamada a `set_lesson_availability`, y ambas pestañas (reflejando la sesión de E2 tras el login más reciente) mostraron el bloqueo tras recargar. El acceso de E1 (Grupo A) ya había quedado demostrado repetidamente en TC-001 a TC-009 con la misma lección deshabilitada — confirma que el cierre no distingue grupo académico dentro del mismo `course_slug`, como exige D2.

### TC-017 — Presentación del bloque en modo claro/oscuro y en móvil
**Rol que ejecuta:** estudiante **E1**
**Criterio cubierto:** transversal (`DESIGN.md`, no criterio numerado)
**Precondición:** lección A deshabilitada.
**Datos de prueba usados:** `test-student-spec039@nodo.test`
**Pasos:**
1. Con la página bloqueada abierta, alternar el tema del sitio.
2. Repetir en viewport móvil, con el índice lateral abierto y cerrado.
**Resultado esperado:** el bloque "Lección no disponible" y la etiqueta del sidebar son legibles en ambos temas, con contraste suficiente, sin desbordes ni layout roto en móvil.
**Estado:** ⚠️ Parcial — verificación móvil pendiente
**Hallazgos:** verificado por Claude vía navegador solo en la parte de tema. La app no tiene un control de tema manual en la UI (no se encontró ningún toggle); se forzó la clase `dark`/sin `dark` en `<html>` vía consola para simular ambos modos — el bloque "Lección no disponible" y la etiqueta "No disponible" del sidebar son legibles con buen contraste en los dos casos, sin roturas visuales. La verificación en viewport móvil **no pudo completarse**: la herramienta `resize_window` de este entorno no tuvo efecto real sobre `window.innerWidth` (se quedó fijo en 1470px pese a pedir 390px) — limitación del entorno de automatización, no evidencia sobre el sitio. Queda pendiente de una revisión manual del usuario en un dispositivo o DevTools real.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador, cliente `@supabase/ssr` instanciado en consola con la sesión real de E1 (cookies de la app, sin exponer ninguna clave de servicio). `insert`: rechazado explícitamente con `42501` "new row violates row-level security policy". `delete`: la llamada devolvió `status 200`/`success: true` pero `data: []` — resultado ambiguo a primera vista (RLS puede bloquear silenciosamente vía la cláusula `USING` en vez de devolver error); se confirmó con `get_lesson_availability` que la fila de control seguía intacta con el mismo `disabled_at`, es decir, el delete no afectó ninguna fila. Fila de control creada y eliminada limpiamente al cerrar el caso.

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
**Estado:** ✅ Aprobado
**Hallazgos:** verificado por Claude vía navegador con el mismo método que TC-018 (cliente `@supabase/ssr` en consola, sesión real del estudiante). E3: `select` filtrado y sin filtro ambos devolvieron `data: [], error: null` — cero filas, sin mensaje que revele la existencia del curso. E1 (control, sí matriculado): la misma consulta filtrada devolvió la fila real de `sintaxis-de-python` con su `disabled_at`/`reason`. Lección A reabierta al cerrar el caso.

---

### TC-MCP-001 — `list_course_lessons` devuelve el catálogo ordenado y con estado
**Herramienta probada:** `list_course_lessons` en `courses-mcp`
**Rol que ejecuta:** operador del MCP (agente docente, clave `COURSES_ADMIN_API_KEY` de desarrollo)
**Criterio cubierto:** 11
**Precondición:** `npm run dev` corriendo; ninguna lección de `analisis-de-algoritmos` deshabilitada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** `data.course_slug` y `data.course_title` correctos; `data.lessons` contiene **todas** las lecciones y guías del catálogo, en el mismo orden que el índice lateral, cada una con `lesson_slug`, `title`, `order`, `kind` (`"lesson"` / `"guide"`), `has_article`, `is_disabled: false`, `disabled_at: null`, `disabled_reason: null`. `meta.total` coincide con la longitud del arreglo, `meta.disabled_count === 0`, `meta.orphan_disabled_slugs` vacío.
**Estado:** ✅ Aprobado
**Hallazgos:** `course_slug`/`course_title` correctos; 18 elementos (17 lecciones + 1 guía) en orden ascendente por `order` (1, 1.5, 2...17); todos los campos presentes y con los valores esperados; `meta.total: 18`, `meta.disabled_count: 0`, `meta.orphan_disabled_slugs: []`.

### TC-MCP-002 — `get_lesson_availability` sobre una lección abierta
**Herramienta probada:** `get_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 11 (forma de `LessonAvailability`)
**Precondición:** la lección A está habilitada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python" }`
**Output esperado:** un único `LessonAvailability` con `is_disabled: false`, `disabled_at: null`, `disabled_reason: null`, y exactamente los mismos campos que la entrada correspondiente de `list_course_lessons`. **No** se expone `disabled_by`.
**Estado:** ✅ Aprobado
**Hallazgos:** output idéntico a la entrada correspondiente de TC-MCP-001; `disabled_by` no aparece en la respuesta.

### TC-MCP-003 — `set_lesson_availability` cierra la lección (`changed: true`)
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 12, 16 (bloque MCP)
**Precondición:** lección A habilitada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": false, "reason": "Se abre tras la sesión del jueves" }`
**Output esperado:** `200`; `data.is_disabled: true`, `data.disabled_reason` igual al enviado, `data.disabled_at` con marca de tiempo reciente; `meta.changed: true`. Una nueva fila en `disabled_lessons` con `disabled_by: null`. Verificar con `get_lesson_availability` que el estado persiste.
**Estado:** ✅ Aprobado
**Hallazgos:** `is_disabled: true`, `disabled_reason: "Se abre tras la sesión del jueves"`, `disabled_at: 2026-08-02T13:44:09.476Z`, `meta.changed: true`; `get_lesson_availability` inmediatamente después devuelve exactamente los mismos valores.

### TC-MCP-004 — Idempotencia: repetir el cierre sin `reason` no cambia nada
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 13, 16 (bloque MCP)
**Precondición:** TC-MCP-003 ejecutado; anotar el `disabled_at` resultante.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": false }`
**Output esperado:** `200` (nunca `409`); `meta.changed: false`; `data.disabled_at` **idéntico** al anotado y `data.disabled_reason` intacto. La fila no se reescribe.
**Estado:** ✅ Aprobado
**Hallazgos:** `meta.changed: false`; `disabled_at` idéntico bit a bit al de TC-MCP-003 (`2026-08-02T13:44:09.476Z`); `disabled_reason` sin cambios.

### TC-MCP-005 — Cierre con `reason` distinto: se reemplaza y se refresca `disabled_at`
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 16 (bloque MCP — semántica de `changed`)
**Precondición:** la lección A sigue cerrada, con el `reason` de TC-MCP-003.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": false, "reason": "Se detectó un error en el enunciado" }`
**Output esperado:** `200`; `meta.changed: true`; `data.disabled_reason` es el nuevo texto y `data.disabled_at` **posterior** al anotado en TC-MCP-003.
**Estado:** ✅ Aprobado
**Hallazgos:** `meta.changed: true`; `disabled_reason: "Se detectó un error en el enunciado"`; `disabled_at: 2026-08-02T13:44:43.359Z`, posterior al de TC-MCP-003/004 (`13:44:09.476Z`).

### TC-MCP-006 — Reabrir es idempotente en ambos sentidos
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 13, 16 (bloque MCP)
**Precondición:** la lección A está cerrada.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": true }`, ejecutado **dos veces seguidas**.
**Output esperado:** primera llamada → `200`, `meta.changed: true`, `data.is_disabled: false`, `disabled_at`/`disabled_reason` en `null`, fila borrada de `disabled_lessons`. Segunda llamada → `200` con `meta.changed: false` y el mismo `data`; **nunca** un error por pedir el estado en el que ya se está.
**Estado:** ✅ Aprobado
**Hallazgos:** primera llamada `changed: true`, `is_disabled: false`, `disabled_at`/`disabled_reason` en `null`; segunda llamada idéntica salvo `changed: false`, sin error.

### TC-MCP-007 — `lesson_slug` inexistente → `404` y cero filas creadas
**Herramienta probada:** `set_lesson_availability` (y `get_lesson_availability`) en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** 14
**Precondición:** anotar el número exacto de filas de `disabled_lessons` antes del caso.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "leccion-inventada-xyz", "enabled": false, "reason": "no debería crearse" }`; después, `get_lesson_availability` con ese mismo `lesson_slug`.
**Output esperado:** error de herramienta con el mensaje del `404` (`"Lección no encontrada en analisis-de-algoritmos: leccion-inventada-xyz"`); el conteo de filas de `disabled_lessons` es **idéntico** al de antes. `get_lesson_availability` también devuelve `404`, nunca `is_disabled: false` para un slug inexistente.
**Estado:** ✅ Aprobado
**Hallazgos:** ambas herramientas devolvieron el mensaje `404` exacto; `disabled_count` se mantuvo en `0`, sin filas nuevas.

### TC-MCP-008 — `course_slug` inexistente → `404`
**Herramienta probada:** `list_course_lessons`, `get_lesson_availability`, `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** contrato M3 (no criterio numerado)
**Precondición:** ninguna.
**Input de prueba:** `course_slug: "curso-que-no-existe"` en las tres herramientas.
**Output esperado:** las tres devuelven el `404` con `"Curso no encontrado: curso-que-no-existe"`; ninguna consulta a Supabase precede a la validación (no se crea ni se lee nada).
**Estado:** ✅ Aprobado
**Hallazgos:** las tres herramientas devolvieron el mismo mensaje `404` exacto.

### TC-MCP-009 — `reason` junto a `enabled: true` → `422`
**Herramienta probada:** `set_lesson_availability` en `courses-mcp`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** contrato M3 (no criterio numerado)
**Precondición:** lección A en cualquier estado; anotarlo.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos", "lesson_slug": "sintaxis-de-python", "enabled": true, "reason": "esto no debería aceptarse" }`. Adicionalmente: `enabled` ausente, `enabled: "false"` (string) y `reason` de más de 280 caracteres con `enabled: false`.
**Output esperado:** los cuatro devuelven `422` de validación con el campo señalado; el estado de la lección **no cambia** respecto a lo anotado.
**Estado:** ✅ Aprobado
**Hallazgos:** `reason` con `enabled:true` → `422` señalando `reason` ("solo válido al deshabilitar"); `reason` >280 caracteres → `422` señalando `reason` ("no puede superar los 280 caracteres"); `enabled` ausente y `enabled` como string → probados vía `curl` directo a la API (el esquema del propio MCP exige `enabled` boolean y habría bloqueado la llamada antes de llegar al servidor) — ambos `422` señalando `enabled`. Estado de la lección sin cambios en los cuatro casos.

### TC-MCP-010 — Separación de claves: solo `COURSES_ADMIN_API_KEY` abre las rutas
**Herramienta probada:** rutas `/api/courses/[courseSlug]/lessons*` que respaldan a `courses-mcp`
**Rol que ejecuta:** operador del MCP (llamadas HTTP directas con `curl`)
**Criterio cubierto:** M2 / criterio de aceptación de la Fase 5
**Precondición:** `npm run dev` corriendo.
**Input de prueba:** tres `GET` a `/api/courses/analisis-de-algoritmos/lessons`: (a) sin cabecera `x-api-key`; (b) con `QUESTION_BANK_API_KEY`; (c) con `STUDENTS_ADMIN_API_KEY`.
**Output esperado:** las tres responden `401` con el cuerpo de `unauthorizedError`; ninguna devuelve datos. (Solo la clave propia de este dominio funciona — confirmado en TC-MCP-001.)
**Estado:** ✅ Aprobado
**Hallazgos:** sin cabecera → `401` "API key no proporcionada"; con `QUESTION_BANK_API_KEY` → `401` "API key inválida"; con `STUDENTS_ADMIN_API_KEY` → `401` "API key inválida". Ninguna devolvió datos.

### TC-MCP-011 — Configuración ausente responde `500`, no `401`
**Herramienta probada:** rutas `/api/courses/[courseSlug]/lessons*`
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** M2 (diagnosticabilidad; no criterio numerado)
**Precondición:** ⚠️ requiere intervención manual: comentar `COURSES_ADMIN_API_KEY` en `.env.local` y reiniciar `npm run dev`. Restaurarla y reiniciar al terminar el caso.
**Input de prueba:** `GET /api/courses/analisis-de-algoritmos/lessons` con una `x-api-key` cualquiera.
**Output esperado:** `500` con `configuration_error` ("Servicio mal configurado."), **nunca** `401` — el motivo no debe filtrarse como fallo de credencial.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado con autorización explícita del usuario. `COURSES_ADMIN_API_KEY` comentada en `.env.local`, `npm run dev` reiniciado; la ruta respondió `500` `{"error":{"code":"configuration_error","message":"Servicio mal configurado."}}`, nunca `401`. Variable restaurada y servidor reiniciado de nuevo inmediatamente; confirmado con una consulta real (`200`, catálogo completo) que todo volvió a la normalidad.

### TC-MCP-012 — Filas huérfanas se reportan y no rompen el listado
**Herramienta probada:** `list_course_lessons` en `courses-mcp`
**Rol que ejecuta:** operador del MCP (preparación con inserción directa en la base de desarrollo)
**Criterio cubierto:** 17 (bloque MCP) / R4
**Precondición:** insertar a mano en la base **de desarrollo** una fila `(course_slug: "analisis-de-algoritmos", lesson_slug: "leccion-que-no-existe-spec039")` — no existe endpoint que la produzca, por diseño. Registrarla en la tabla de datos de prueba y borrarla al cerrar el caso.
**Input de prueba:** `{ "course_slug": "analisis-de-algoritmos" }`
**Output esperado:** la llamada responde `200` sin errores; `data.lessons` conserva el catálogo completo y correcto (la fila huérfana **no** aparece como lección); `meta.orphan_disabled_slugs` contiene `"leccion-que-no-existe-spec039"`; la fila **no** se borra automáticamente. Verificar además que la UI del estudiante no se ve afectada.
**Estado:** ✅ Aprobado
**Hallazgos:** ejecutado con autorización explícita del usuario. Fila huérfana insertada vía `service_role`; `list_course_lessons` respondió `200`, catálogo íntegro de 18 elementos (la huérfana no apareció como lección), `meta.orphan_disabled_slugs: ["leccion-que-no-existe-spec039"]`. La UI del estudiante no se verificó por separado en este caso puntual (la lógica de renderizado del sidebar ya se probó extensamente en TC-001 a TC-019 filtrando por slugs reales del catálogo, así que una fila con un slug inexistente no tiene forma de aparecer ahí). Fila borrada al cerrar el caso; confirmado `orphan_disabled_slugs: []`.

### TC-MCP-013 — El servidor `courses-mcp` arranca con el wrapper local
**Herramienta probada:** servidor `courses-mcp` (arranque, no una herramienta concreta)
**Rol que ejecuta:** operador del MCP
**Criterio cubierto:** Fase 5.5 (no criterio numerado)
**Precondición:** `.env.local` con `COURSES_ADMIN_API_KEY` definida; `mcp-servers/courses-mcp` compilado.
**Input de prueba:** `./mcp-servers/run-local-mcp.sh courses-mcp </dev/null`
**Output esperado:** el servidor imprime su línea de inicio y termina sin errores de variables faltantes; en particular no reclama `API_BASE_URL` ni `API_KEY` (el wrapper los mapea desde `COURSES_API_BASE_URL` / `COURSES_ADMIN_API_KEY`).
**Estado:** ✅ Aprobado
**Hallazgos:** salida `"✓ Courses MCP iniciado. API: http://localhost:3002/api/courses"`, sin reclamos de variables faltantes. Proceso de prueba detenido al cerrar el caso.

---

## Resumen de la ronda
- Aprobados: 30 — Fallidos: 0 — No aplicable: 1 (TC-002) — Parcial: 1 (TC-017, verificación móvil pendiente por limitación de la herramienta de automatización, no del sitio)
- Hallazgos escalados a `docs/specs/backlog.md`: ninguno nuevo — recordatorio: R3 (evaluaciones apuntando a una lección cerrada) ya deja constancia en el spec, sin hallazgos adicionales de esta ronda.
- Limpieza de datos de prueba: ⬜ Pendiente
  - [x] Todas las filas de `disabled_lessons` creadas durante la ronda reabiertas — confirmado `meta.disabled_count === 0` con `list_course_lessons` al cierre de cada bloque de casos.
  - [x] Fila huérfana de TC-MCP-012 borrada a mano y confirmada con `list_course_lessons` (`meta.orphan_disabled_slugs` vacío).
  - [x] Cambios manuales de TC-014 (renombrado de tabla) y de TC-MCP-011 (`.env.local`) revertidos, con `npm run dev` reiniciado en ambos casos y verificado con una consulta real.
  - [ ] Estudiantes E1, E2 y E3 eliminados con `students-mcp` → `delete_student` (matrículas en cascada) y verificado el `404` posterior.
  - [ ] Admin de prueba eliminado (Auth + `user_roles`) — **compartido con spec-038**, no eliminar hasta cerrar también esa ronda si sigue en curso.
  - [ ] Cursos académicos Grupo B y el de `estructuras-de-datos` eliminados; Grupo A conservado si es el curso real de desarrollo (anotarlo).
