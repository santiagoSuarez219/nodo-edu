# test-036 — Panel admin de cursos: `course_slug` validado y ciclo de vida del curso

> Casos manuales de `docs/specs/spec-036-admin-curso-slug-y-ciclo-de-vida.md`.
> Escritos junto con el spec, **antes** de la implementación: encodifican los
> criterios de aceptación. Arrancan todos en ⬜ Pendiente.

## Datos de prueba

> Recursos a crear vía API antes de ejecutar la ronda.
> Deben eliminarse al cerrar (salvo decisión explícita en contrario).

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso A — activo, para TC-036-006/007/009 | **SQL directo** (sin endpoint/MCP, ver nota); `course_slug` corregido a `estructuras-de-datos` durante TC-036-006 (montaje original lo dejó sin vincular, y el paso 7 necesita una lección real) | `415a605f-2e08-487e-a034-425bdc22df5e` (código `T036AAAA`), lección de prueba `/estructuras-de-datos/fundamentos-control-de-versiones` | ✅ |
| Curso B — vacío + 1 sesión de asistencia, para TC-036-008 | **SQL directo** | `10dbe101-b883-45fc-bc4b-d332f9b7e89c` (código `T036BBBB`) | ✅ **se borró como parte del propio TC-036-008** |
| Curso C — `course_slug` huérfano (`curso-que-no-existe`), para TC-036-004/005 | **SQL directo** | `afa8c207-0bcb-408c-a10f-3ab245ca7b7c` (código `T036CCCC`) | ✅ |
| Curso D — vacío, borrable, para TC-036-012 (primer intento) | **SQL directo** | `83202e3f-fdf9-4a09-b83c-eb3903717198` (código `T036DDDD`) | ✅ **se borró en el primer intento de TC-036-012**, que terminó en 404 tras recarga por el bug ajeno de `app/layout.tsx` (DEBT-039) |
| Sesión de asistencia (cerrada) en Curso B | **SQL directo** (`class_sessions`, sin endpoint/MCP de escritura — `attendance-mcp` es solo lectura) | `9dc5f92a-4f52-4aac-9b81-b98f002cecb5` | ✅ **cascada al borrar Curso B** |
| Test036 Estudiante Uno — matriculado en Curso A al crearse | `students-mcp` → `create_student` (`academic_course_id`) | `f2bebf90-45ac-4811-b05f-807aab4ef21a` (`test036.estudiante1@nodo.local` / `Test036Pass1`), matrícula `3cc6de98-845c-4d28-ad54-31dde50ce378` | ✅ (`students-mcp` → `delete_student`, arrastró la matrícula) |
| Test036 Estudiante Dos — sin matricular al crearse; se matriculó en Curso A durante TC-036-007 | `students-mcp` → `create_student` | `00f8dadd-c661-4de0-856c-16c063016528` (`test036.estudiante2@nodo.local` / `Test036Pass2`) | ✅ (`students-mcp` → `delete_student`, arrastró la matrícula) |
| Curso E — `course_slug` huérfano, para TC-036-005 | **SQL directo** — agregado porque TC-036-004 corrigió el slug del Curso C, dejando la ronda sin ningún huérfano vigente | `4b37d2a4-c97e-4345-948e-217030b8fd6b` (código `T036EEEE`) | ✅ |
| "Curso de prueba" (`ED20262`) — creado por el usuario en TC-036-002, vinculado a `estructuras-de-datos`, para TC-036-011 | **UI** (`createCourseAction`, es justo lo que TC-036-002 probaba) | `a81f37cd-fddd-4933-8401-4dcb993ebd90` | ✅ |
| "Curso de prueba sin vincular" — creado por el usuario en TC-036-003 | **UI** (`createCourseAction`) | `12c0f0f2-323f-48d2-906e-fbd911866a42` (código `EDSDASDF`) | ✅ |
| Curso F — vacío, borrable, primer reintento de TC-036-012 | **SQL directo** — **nunca llegó a usarse**: desapareció de la base entre su creación y su primer acceso sin que ninguna acción de la app lo tocara (anomalía sin explicar, ver "Resumen de la ronda") | `d5e1200a-793d-43ed-8bcf-5e892b7cb855` (código `T036FFFF`) | — (ya no existía; nada que limpiar) |
| Curso G — vacío, borrable, segundo reintento de TC-036-012, verificado por Claude en el navegador (autorización puntual del usuario) | **SQL directo** | `28915b10-cea7-414f-a30b-d26de55bde5e` (código `T036GGGG`) | ✅ **se borró como parte del propio TC-036-012** |

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab` vía túnel SSH — ver CLAUDE.md → "Base de datos"). **Nunca producción.**
**Fecha de la ronda:** 2026-08-01
**Docente de prueba:** `dev@nodo.local` (roles `teacher` + `admin` ya sembrados — ver CLAUDE.md → "Base de datos")

> **Nota sobre la creación de cursos académicos:** no existe endpoint ni
> herramienta MCP para crearlos (`createCourseAction` es un Server Action atado a
> sesión), así que las precondiciones se insertan vía SQL directo contra la
> instancia local, con confirmación explícita del usuario — la misma excepción
> documentada en `test-035` y en la ronda de `fix/attendance-panel-flicker`.
> **Alternativa preferible para esta ronda concreta:** varios casos (TC-036-001 a
> 004) crean cursos *a través del formulario*, que es justo lo que se está
> probando; conviene crear por SQL solo lo que los casos no cubren.

## Casos de prueba

### TC-036-001 — `course_slug` se elige de una lista, no se teclea
> Criterio de aceptación 1

**Precondición:** Sesión iniciada como docente.
**Pasos:**
1. Ir a `/admin/courses/new`.
2. Localizar el campo de curso de contenido.
**Resultado esperado:** Es un desplegable con los cursos de contenido reales del proyecto (estructuras de datos, análisis de algoritmos, programación científica) más una opción "— Sin vincular —". Cada opción muestra el **nombre legible** del curso además del slug (ej. `Estructuras de Datos (estructuras-de-datos)`), no el slug a secas. No es posible escribir texto libre.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-002 — Crear un curso vinculado a contenido real
> Criterio de aceptación 1

**Precondición:** TC-036-001 ejecutado.
**Pasos:**
1. Completar el formulario eligiendo `estructuras-de-datos` en el desplegable.
2. Guardar.
3. Entrar a una lección de ese curso como docente y verificar que el grupo aparece en el selector de asistencia de la vista docente.
**Resultado esperado:** El curso se crea y queda efectivamente vinculado: el grupo es visible desde la lección.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-003 — Crear un curso deliberadamente sin contenido vinculado
> Criterio de aceptación 3 — **solo la creación**. Desvincular un curso que *ya*
> estaba vinculado es el caso TC-036-011 (criterio 11), que ejercita una ruta de
> código distinta (`updateCourseAction`).

**Pasos:**
1. Crear un curso eligiendo "— Sin vincular —".
2. Guardar.
**Resultado esperado:** Se guarda sin error. El listado no lo marca como huérfano (no tener contenido es distinto de apuntar a contenido inexistente).
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-004 — Editar un curso con `course_slug` huérfano
> Criterio de aceptación 4

**Precondición:** Curso creado por SQL con `course_slug = "curso-que-no-existe"`.
**Pasos:**
1. Abrir su formulario de edición.
2. Observar qué muestra el desplegable.
3. Cambiar **solo el nombre** del curso (sin tocar el slug) y guardar.
4. Volver a abrir la edición.
5. Ahora sí, corregir el slug a uno real y guardar.
**Resultado esperado:** En el paso 2 el desplegable muestra el valor actual marcado como inválido y seleccionado. En el paso 4 el slug sigue siendo el mismo (guardar sin tocarlo no lo borró ni lo cambió en silencio). En el paso 5 la corrección se persiste.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-005 — El listado señaliza los cursos huérfanos
> Criterio de aceptación 5

**Precondición:** Existe al menos un curso con slug inexistente y uno correcto.
**Pasos:**
1. Ir a `/admin/courses`.
**Resultado esperado:** La fila del curso huérfano se distingue visualmente (marca/aviso), y las filas correctas y las "sin vincular" no.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-006 — Desactivar un curso, con confirmación
> Criterios de aceptación 6 y 10

**Precondición:** Curso activo **con al menos un estudiante matriculado**.
**Pasos:**
1. Ir a `/admin/courses/{id}/edit` y localizar la **zona de peligro** al pie del formulario (ver spec-036, D7).
2. Pulsar "Desactivar": verificar que aparece un diálogo de confirmación propio de la app (no `confirm()` nativo) y cancelarlo → el curso sigue activo.
3. Repetir y confirmar.
4. **Sin navegar a ningún sitio**, observar la propia página.
5. Verificar en `/admin/courses` que figura como "Inactivo".
6. Intentar matricularse con su `enrollment_code` desde `/cuenta/cursos` con otra cuenta → debe rechazarse.
7. **Con la cuenta del estudiante ya matriculado**, entrar a una lección del curso.
**Resultado esperado:** En el paso 4 el docente **permanece en `/admin/courses/{id}/edit`** (no se le expulsa al listado): el badge del `CourseHeader` pasa a "Inactivo" y el botón de la zona de peligro muta a "Reactivar" (ver spec-036, D8). El curso deja de aceptar matrículas nuevas (paso 6), pero el estudiante ya matriculado **conserva el acceso al contenido** (paso 7) — ver spec-036, "No incluye".
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones. Nota de montaje: el Curso A no tenía `course_slug` vinculado originalmente; se corrigió a `estructuras-de-datos` durante la ejecución para poder verificar el paso 7 (ver "Datos de prueba").

### TC-036-007 — Reactivar un curso desactivado
> Criterio de aceptación 7

**Precondición:** TC-036-006 ejecutado. El docente sigue en `/admin/courses/{id}/edit`, la misma página donde desactivó.
**Pasos:**
1. Sin cambiar de página, pulsar "Reactivar" en la zona de peligro y confirmar.
2. Observar la propia página.
3. Verificar el estado en el listado.
4. Intentar matricularse con su `enrollment_code` desde otra cuenta.
**Resultado esperado:** El curso vuelve a "Activo" y admite matrículas de nuevo. Deshacer la desactivación cuesta **un solo clic desde donde quedó** el docente: badge de vuelta a "Activo" y botón de vuelta a "Desactivar", sin navegación.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-008 — Borrar definitivamente un curso vacío
> Criterio de aceptación 8

**Precondición:** Curso **sin** matrículas ni evaluaciones (el creado en TC-036-003 sirve), pero **con al menos una sesión de asistencia** creada — sin ella la advertencia de cascada no es observable. Anotar de antemano cuántas sesiones e ítems de nota tiene, para contrastarlos con el diálogo.
**Pasos:**
1. Ir a `/admin/courses/{id}/edit` y pulsar "Eliminar definitivamente" en la zona de peligro.
2. Observar el diálogo: debe ser más exigente que el de desactivar (advertencia de irreversibilidad) **y enumerar lo que se arrastra en cascada** con conteos reales (N sesiones de asistencia y sus registros, N ítems de nota).
3. Cancelar → el curso sigue existiendo, y su sesión de asistencia también.
4. Repetir y confirmar.
**Resultado esperado:** En el paso 2 los conteos del diálogo coinciden con lo anotado en la precondición — "vacío" significa sin matrículas ni evaluaciones, **no** sin datos (ver spec-036, D1). Tras confirmar, el docente llega a `/admin/courses` y el curso ya no está en el listado. Verificable además por API: no existen ni la fila del curso ni sus `class_sessions`.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-009 — No se puede borrar un curso con matrículas
> Criterio de aceptación 9

**Precondición:** Curso con al menos una matrícula.
**Pasos:**
1. Ir a `/admin/courses/{id}/edit` y observar la zona de peligro.
2. Intentar pulsar "Eliminar definitivamente".
**Resultado esperado:** El botón aparece **deshabilitado**, acompañado de la explicación de por qué (ej. "tiene N estudiantes matriculados"). La UI lo impide **antes** de intentarlo, no al pulsarlo: no debe abrirse el diálogo, no debe llegarse a la action, y por tanto **no** aparece un error crudo de Postgres (`23503`, "violates foreign key constraint") ni el overlay de error de Next.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-036-010 — Validación de servidor: slug inexistente enviado directamente
> Criterio de aceptación 2 — la barrera real, no el desplegable

**Precondición:** Sesión de docente activa.
**Pasos:**
1. Con DevTools abierto en la página de edición de un curso, forzar el envío de un `course_slug` arbitrario (editando el `<option>` seleccionado desde el inspector, o el `value` del `<select>`).
2. Guardar.
**Resultado esperado:** La operación se rechaza con un error en el campo `course_slug` y **no se persiste nada**. Verificable por API: la fila conserva su valor anterior.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

> Si este caso resulta incómodo de ejecutar a mano, es el mejor candidato a
> prueba automática cuando exista framework (ver spec-036, "Pruebas asociadas"):
> invocar la server action directamente con un slug inválido.

### TC-036-011 — Desvincular un curso que ya estaba vinculado
> Criterio de aceptación 11 — cubre el bug documentado en spec-036, "Contexto":
> hoy `updateCourseAction` convierte el string vacío en `undefined`, Supabase lo
> omite del `UPDATE` y **el slug anterior sobrevive sin error**. Este caso debe
> fallar contra el código actual.

**Precondición:** Curso con `course_slug = "estructuras-de-datos"` (el creado en TC-036-002 sirve).
**Pasos:**
1. Abrir `/admin/courses/{id}/edit`.
2. Cambiar el desplegable de contenido a "— Sin vincular —".
3. Guardar y observar si aparece algún error.
4. Volver a abrir la edición del mismo curso.
5. Verificar por API el valor de la columna: `GET /rest/v1/academic_courses?id=eq.{id}&select=course_slug`.
**Resultado esperado:** Se guarda sin error (paso 3), el desplegable muestra "— Sin vincular —" al reabrir (paso 4) y la columna vale **`null`**, no el slug anterior (paso 5). El paso 5 es el que cuenta: sin él, un formulario que reabre con el valor cacheado podría aparentar éxito.
**Estado:** ✅ Aprobado
**Hallazgos:** Verificado además por API (`course_slug` = `null`, no el valor anterior). El bug que este caso ejercitaba está corregido.

### TC-036-012 — Una acción de ciclo de vida que no afecta filas no reporta éxito
> Criterio de aceptación 12 — modo de fallo de RLS (ver spec-036, D6): un
> `UPDATE`/`DELETE` no autorizado o sobre una fila inexistente **no devuelve
> error**, simplemente afecta cero filas.

**Precondición:** Un curso vacío, borrable. Dos pestañas del navegador abiertas.
**Pasos:**
1. En la pestaña A, abrir `/admin/courses/{id}/edit` y dejarla quieta.
2. En la pestaña B, borrar definitivamente ese mismo curso.
3. Volver a la pestaña A (sin recargar) y pulsar "Desactivar", confirmando el diálogo.
**Resultado esperado:** La pestaña A muestra un **mensaje de error** ("El curso ya no existe" o equivalente) y **no navega** ni finge éxito. No aparece el overlay de error de Next ni una pantalla en blanco.
**Estado:** ✅ Aprobado
**Hallazgos:** Primer intento (Curso D) se quedó colgado en la burbuja "Rendering..." de Next.js sin peticiones ni errores de consola visibles — coincidió con un warning de hidratación **ajeno a este spec** en `app/layout.tsx:48` (`<Script id="theme-init">`, ver hallazgo escalado al backlog). Se reintentó limpio con un curso nuevo (Curso G) y Claude ejecutó el repro directamente en el navegador (autorización puntual del usuario): la Server Action respondió `200`, la pestaña A permaneció en `/edit` sin navegar y mostró el banner "No se pudo desactivar el curso (puede que ya no exista o no tengas permiso)." — comportamiento correcto, criterio 12 confirmado. El colgado del primer intento se atribuye al bug de layout, no a la lógica de ciclo de vida.

> Caso incómodo de ejecutar a mano y fácil de dar por bueno por accidente: es el
> **candidato preferente a prueba automática** cuando exista framework — invocar
> la action con un `courseId` inexistente y afirmar `ok: false`.

## Resumen de la ronda
- Aprobados: 12 — Fallidos: 0 — Pendientes: 0
- Hallazgos escalados a `docs/specs/backlog.md`: **DEBT-039** — error de
  hidratación de `<Script id="theme-init">` en `app/layout.tsx:48` (ajeno a
  este spec, detectado incidentalmente en TC-036-012).
- Anomalía sin escalar (no reproducible con certeza): el primer "Curso F"
  creado para el reintento de TC-036-012 desapareció de la base entre su
  creación y su primer uso, sin que ninguna acción de la app lo tocara. Se
  recreó como "Curso G" sin volver a ocurrir. Si se repite en una ronda
  futura, documentarlo como deuda propia.
- Limpieza de datos de prueba: ✅ Completada (2026-08-01) — 5 cursos borrados vía SQL directo, 2 estudiantes borrados vía `students-mcp` (arrastraron sus matrículas). Se conservó `[TEST-035] Estructuras de datos` (`TEST-035`), ajeno a esta ronda, por decisión previa documentada en `test-035`.
