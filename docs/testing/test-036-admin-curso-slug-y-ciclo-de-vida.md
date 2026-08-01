# test-036 — Panel admin de cursos: `course_slug` validado y ciclo de vida del curso

> Casos manuales de `docs/specs/spec-036-admin-curso-slug-y-ciclo-de-vida.md`.
> Escritos junto con el spec, **antes** de la implementación: encodifican los
> criterios de aceptación. Arrancan todos en ⬜ Pendiente.

## Datos de prueba

> Recursos a crear vía API antes de ejecutar la ronda.
> Deben eliminarse al cerrar (salvo decisión explícita en contrario).

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Curso vacío (para borrado) | **SQL directo** (`POST /rest/v1/academic_courses`) — sin endpoint/MCP, ver nota | {{pendiente}} | ⬜ |
| Curso con matrículas (no borrable) | **SQL directo** + `students-mcp` → `create_student` con su `enrollment_code` | {{pendiente}} | ⬜ |
| Curso con `course_slug` huérfano | **SQL directo**, con `course_slug` inexistente (ej. `curso-que-no-existe`) | {{pendiente}} | ⬜ |
| Estudiante de prueba | `students-mcp` → `create_student` | {{pendiente}} | ⬜ |

**Entorno de pruebas:** desarrollo (instancia local en `mirp-lab` vía túnel SSH — ver CLAUDE.md → "Base de datos"). **Nunca producción.**
**Fecha de la ronda:** {{pendiente}}

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
**Resultado esperado:** Es un desplegable con los cursos de contenido reales del proyecto (estructuras de datos, análisis de algoritmos, programación científica) más una opción "— Sin vincular —". No es posible escribir texto libre.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-002 — Crear un curso vinculado a contenido real
> Criterio de aceptación 1

**Precondición:** TC-036-001 ejecutado.
**Pasos:**
1. Completar el formulario eligiendo `estructuras-de-datos` en el desplegable.
2. Guardar.
3. Entrar a una lección de ese curso como docente y verificar que el grupo aparece en el selector de asistencia de la vista docente.
**Resultado esperado:** El curso se crea y queda efectivamente vinculado: el grupo es visible desde la lección.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-003 — Crear un curso deliberadamente sin contenido vinculado
> Criterio de aceptación 3

**Pasos:**
1. Crear un curso eligiendo "— Sin vincular —".
2. Guardar.
**Resultado esperado:** Se guarda sin error. El listado no lo marca como huérfano (no tener contenido es distinto de apuntar a contenido inexistente).
**Estado:** ⬜ Pendiente
**Hallazgos:**

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
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-005 — El listado señaliza los cursos huérfanos
> Criterio de aceptación 5

**Precondición:** Existe al menos un curso con slug inexistente y uno correcto.
**Pasos:**
1. Ir a `/admin/courses`.
**Resultado esperado:** La fila del curso huérfano se distingue visualmente (marca/aviso), y las filas correctas y las "sin vincular" no.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-006 — Desactivar un curso, con confirmación
> Criterios de aceptación 6 y 10

**Precondición:** Curso activo **con al menos un estudiante matriculado**.
**Pasos:**
1. Entrar al detalle del curso y pulsar "Desactivar".
2. Verificar que aparece un diálogo de confirmación propio de la app (no `confirm()` nativo) y cancelarlo → el curso sigue activo.
3. Repetir y confirmar.
4. Verificar en `/admin/courses` que figura como "Inactivo".
5. Intentar matricularse con su `enrollment_code` desde `/cuenta/cursos` con otra cuenta → debe rechazarse.
6. **Con la cuenta del estudiante ya matriculado**, entrar a una lección del curso.
**Resultado esperado:** El curso queda inactivo y deja de aceptar matrículas nuevas (paso 5), pero el estudiante ya matriculado **conserva el acceso al contenido** (paso 6) — ver spec-036, "No incluye".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-007 — Reactivar un curso desactivado
> Criterio de aceptación 7

**Precondición:** TC-036-006 ejecutado.
**Pasos:**
1. En el detalle del curso desactivado, pulsar "Reactivar" y confirmar.
2. Verificar el estado en el listado.
3. Intentar matricularse con su `enrollment_code` desde otra cuenta.
**Resultado esperado:** El curso vuelve a "Activo" y admite matrículas de nuevo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-008 — Borrar definitivamente un curso vacío
> Criterio de aceptación 8

**Precondición:** Curso **sin** matrículas ni evaluaciones (el creado en TC-036-003 sirve).
**Pasos:**
1. En su detalle, pulsar "Eliminar definitivamente".
2. Observar el diálogo: debe ser más exigente que el de desactivar (advertencia de irreversibilidad).
3. Cancelar → el curso sigue existiendo.
4. Repetir y confirmar.
**Resultado esperado:** El curso desaparece del listado. Verificable además por API: la fila ya no existe.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-009 — No se puede borrar un curso con matrículas
> Criterio de aceptación 9

**Precondición:** Curso con al menos una matrícula.
**Pasos:**
1. Entrar a su detalle e intentar eliminarlo definitivamente.
**Resultado esperado:** La UI lo impide y explica por qué (ej. "tiene N estudiantes matriculados"). **No** aparece un error crudo de Postgres (`23503`, "violates foreign key constraint") ni el overlay de error de Next.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-036-010 — Validación de servidor: slug inexistente enviado directamente
> Criterio de aceptación 2 — la barrera real, no el desplegable

**Precondición:** Sesión de docente activa.
**Pasos:**
1. Con DevTools abierto en la página de edición de un curso, forzar el envío de un `course_slug` arbitrario (editando el `<option>` seleccionado desde el inspector, o el `value` del `<select>`).
2. Guardar.
**Resultado esperado:** La operación se rechaza con un error en el campo `course_slug` y **no se persiste nada**. Verificable por API: la fila conserva su valor anterior.
**Estado:** ⬜ Pendiente
**Hallazgos:**

> Si este caso resulta incómodo de ejecutar a mano, es el mejor candidato a
> prueba automática cuando exista framework (ver spec-036, "Pruebas asociadas"):
> invocar la server action directamente con un slug inválido.

## Resumen de la ronda
- Aprobados: 0 — Fallidos: 0 — Pendientes: 10
- Hallazgos escalados a `docs/specs/backlog.md`: {{pendiente}}
- Limpieza de datos de prueba: ⬜ Pendiente
