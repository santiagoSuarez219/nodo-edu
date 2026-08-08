# test-044 — Apuntes docente en la vista de lección/guía

## Datos de prueba
> Recursos creados vía API/filesystem para poder ejecutar estos casos.
> Deben eliminarse (o revertirse) al cerrar la ronda de pruebas.

| Recurso | Endpoint/medio de creación | Identificador | Eliminado |
|---|---|---|---|
| Apunte docente de prueba (lección) | Archivo `content/cursos/<curso>/apuntes/<articleSlug>.md` | `{{slug de la lección usada}}` | ⬜ / ✅ |
| Apunte docente de prueba (guía) | Archivo `content/cursos/<curso>/apuntes/<articleSlug>.md` | `{{slug de la guía usada}}` | ⬜ / ✅ |
| Apunte con Markdown inválido (para TC-007) | Archivo temporal con `<placeholder>` fuera de backticks | `{{slug temporal}}` | ⬜ / ✅ |
| Usuario docente owner del curso | Ya existente / MCP `students-mcp` si hace falta crear uno | `{{email}}` | ⬜ / ✅ |
| Usuario admin | Ya existente | `{{email}}` | ⬜ / ✅ |
| Usuario estudiante matriculado | Ya existente / `students-mcp` | `{{email}}` | ⬜ / ✅ |

**Entorno de pruebas:** desarrollo (`mirp-lab`, ver `CLAUDE.md` → Base de datos)
**Fecha de la ronda:** {{fecha}}

## Casos de prueba

### TC-001 — Docente owner ve el bloque de apuntes en una lección
**Precondición:** existe `content/cursos/<curso>/apuntes/<articleSlug>.md` para
una lección publicada; el usuario es owner de ese curso.
**Datos de prueba usados:** `{{email owner}}` / `{{slug lección}}`
**Pasos:**
1. Iniciar sesión como el docente owner.
2. Abrir la lección correspondiente.
**Resultado esperado:** dentro de "Vista docente" aparece un bloque "Apuntes
de clase", con el Markdown renderizado (código, tablas, listas si aplica),
abierto por defecto, como primer bloque del panel.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — Admin ve el mismo bloque en un curso ajeno
**Precondición:** el usuario tiene rol `admin` pero no es owner del curso de
prueba.
**Datos de prueba usados:** `{{email admin}}` / `{{slug lección}}`
**Pasos:**
1. Iniciar sesión como admin.
2. Abrir la misma lección del TC-001.
**Resultado esperado:** ve el bloque de apuntes igual que el owner.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-003 — Estudiante matriculado no ve el bloque ni recibe el contenido
**Precondición:** el usuario está matriculado en el curso; existe apunte para
la lección.
**Datos de prueba usados:** `{{email estudiante}}` / `{{slug lección}}`
**Pasos:**
1. Iniciar sesión como estudiante matriculado.
2. Abrir la misma lección del TC-001.
3. Inspeccionar el HTML/payload de la respuesta (ver código fuente o
   Network) buscando una frase única del contenido del apunte.
**Resultado esperado:** no aparece el bloque "Apuntes de clase" en la UI, ni
la frase única del apunte en ninguna parte del HTML/payload RSC.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — Visitante anónimo no recibe el contenido
**Precondición:** sesión cerrada.
**Pasos:**
1. Sin iniciar sesión, intentar abrir la ruta de la lección directamente.
**Resultado esperado:** el flujo de acceso existente (login/gate) se dispara
como siempre; en ningún punto de la respuesta aparece el contenido del
apunte.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-005 — Sección sin apunte no muestra bloque ni error
**Precondición:** una lección publicada sin archivo en `apuntes/` para su
`articleSlug`.
**Datos de prueba usados:** `{{slug lección sin apunte}}`
**Pasos:**
1. Iniciar sesión como owner.
2. Abrir esa lección.
**Resultado esperado:** la página carga con normalidad (artículo, clave de
respuestas si aplica, asistencia); no aparece el bloque de apuntes, sin
placeholder ni error visible.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — Funciona igual en una guía (`kind: "guide"`)
**Precondición:** existe `content/cursos/<curso>/apuntes/<articleSlug>.md`
para una guía.
**Datos de prueba usados:** `{{slug guía}}`
**Pasos:**
1. Iniciar sesión como owner.
2. Abrir la guía correspondiente.
**Resultado esperado:** aparece el bloque "Apuntes de clase" igual que en una
lección; el resto de la vista docente de la guía (solo control de asistencia,
sin clave de respuestas) no cambia.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-007 — Fallo de compilación del apunte no tumba la página
**Precondición:** archivo de apuntes con un `<placeholder>` fuera de
backticks (Markdown inválido como MDX).
**Datos de prueba usados:** `{{slug temporal}}`
**Pasos:**
1. Iniciar sesión como owner.
2. Abrir la lección/guía con el apunte inválido.
**Resultado esperado:** el bloque "Apuntes de clase" muestra el mensaje de
error del `ErrorBoundary` ("Los apuntes de clase no están disponibles..."); el
resto de la página (artículo, clave de respuestas, asistencia, paginación)
sigue funcionando con normalidad.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — Regresión: clave de respuestas y asistencia (spec-031) intactas
**Precondición:** lección con preguntas de autoevaluación publicadas y con
apunte docente.
**Pasos:**
1. Iniciar sesión como owner.
2. Abrir la lección; revisar clave de respuestas (toggles) y control de
   asistencia (abrir/cerrar sesión).
**Resultado esperado:** ambos bloques funcionan exactamente igual que antes
de este spec, ahora junto al nuevo bloque de apuntes (orden: apuntes → clave
de respuestas → asistencia).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-009 — Regresión: flujo de estudiante matriculado intacto
**Precondición:** estudiante matriculado, lección con autoevaluación.
**Pasos:**
1. Iniciar sesión como estudiante.
2. Abrir la lección y completar el flujo de cierre habitual.
**Resultado esperado:** sin cambios respecto al comportamiento anterior a
este spec.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-010 — Slug reservado `apuntes` rechazado en el catálogo
**Precondición:** ninguna (verificación de código/build).
**Pasos:**
1. Declarar temporalmente un nodo con `slug: "apuntes"` en un archivo de
   `lib/courses/data/*.ts` (en una copia local, no comitear).
2. Levantar `npm run dev` o `npm run build`.
**Resultado esperado:** el arranque falla explícitamente señalando que
`"apuntes"` es un slug reservado.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-011 — Build y lint en verde
**Pasos:**
1. Ejecutar `npx tsc --noEmit`, `npm run lint`, `npm run build`.
**Resultado esperado:** los tres comandos terminan sin errores nuevos.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-012 — Ningún módulo lee de `microdiseno/`
**Pasos:**
1. Ejecutar `grep -rn "microdiseno" app/ lib/ components/`.
**Resultado esperado:** sin resultados (o solo comentarios/documentación, no
código funcional).
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: {{n}}
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
