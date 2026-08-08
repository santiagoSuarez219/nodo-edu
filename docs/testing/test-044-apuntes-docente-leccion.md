# test-044 — Apuntes docente en la vista de lección/guía

> **Nota de diseño (2026-08-08):** el spec cambió de un bloque embebido en la
> vista docente a una ruta dedicada (`/[courseSlug]/[lessonSlug]/apuntes`)
> con un botón en el header de la lección, tras aprobar TC-001 con el diseño
> anterior y detectar que el bloque alargaba demasiado la página con
> contenido real. Este archivo ya refleja el diseño nuevo; TC-001 se marcó de
> nuevo como Pendiente para revalidarlo.

## Datos de prueba
> Recursos creados vía API/filesystem para poder ejecutar estos casos.
> Deben eliminarse (o revertirse) al cerrar la ronda de pruebas.

| Recurso | Endpoint/medio de creación | Identificador | Eliminado |
|---|---|---|---|
| Apunte docente semilla (lección) | Ya en el repo (Fase 5 del spec) | `content/cursos/programacion-cientifica/apuntes/configuracion-del-entorno-de-trabajo-y-diagnostico.md` | N/A (contenido del spec, no se elimina) |
| Apunte docente semilla (guía) | Ya en el repo (Fase 5 del spec) | `content/cursos/estructuras-de-datos/apuntes/lab-01-listas-enlazadas.md` | N/A (contenido del spec, no se elimina) |
| Apunte con Markdown inválido (para TC-007) | Archivo temporal, creado durante la ronda | `content/cursos/programacion-cientifica/apuntes/variables-tipos-de-datos-y-operadores.md` | ⬜ |
| Usuario docente owner (rol `teacher`, sin `admin`) | Supabase Auth admin API + `user_roles` (REST, service role) | `docente-prueba-044@nodo.local` / `TestOwner2026!` — id `76f4e94a-1fd3-47eb-9538-448ae2a6611c` | ⬜ |
| `academic_course` — Programación Científica (owner arriba) | REST `academic_courses` (service role) | `1b64e0d1-6dc7-4f49-a807-d2533a8672a6` (`course_slug=programacion-cientifica`, código `TEST044PC`) | ⬜ |
| `academic_course` — Estructuras de Datos (owner arriba) | REST `academic_courses` (service role) | `1b06391b-c2b3-487c-9f86-bd6479c2675d` (`course_slug=estructuras-de-datos`, código `TEST044ED`) | ⬜ |
| Usuario admin | Ya existente, no se creó ni se elimina | `dev@nodo.local` / `DevLocal2026!` | N/A (recurso preexistente) |
| Usuario estudiante matriculado (Prog. Científica) | `students-mcp` → `create_student` | `estudiante-prueba-044@nodo.local` / `TestStudent2026!` — id `c60e6fb3-1183-42d8-a675-af8795eef62a`, enrollment `1340f0fc-0a20-4bde-a8d4-ede9f2621095` | ⬜ |

**Entorno de pruebas:** desarrollo (`mirp-lab`, app en `http://localhost:3002`)
**Fecha de la ronda:** 2026-08-08

## Casos de prueba

### TC-001 — Docente owner ve el botón y la página de apuntes en una lección
**Precondición:** existe `content/cursos/programacion-cientifica/apuntes/configuracion-del-entorno-de-trabajo-y-diagnostico.md`;
el usuario es owner de ese curso.
**Datos de prueba usados:** `docente-prueba-044@nodo.local`
**Pasos:**
1. Iniciar sesión como el docente owner.
2. Abrir `/programacion-cientifica/configuracion-del-entorno-de-trabajo-y-diagnostico`.
3. Verificar que aparece un botón "Apuntes de clase" en el header, junto al título.
4. Hacer clic en el botón.
**Resultado esperado:** el botón lleva a
`/programacion-cientifica/configuracion-del-entorno-de-trabajo-y-diagnostico/apuntes`,
que muestra el Markdown renderizado (pasos, código con resaltado, tabla de
errores frecuentes) con un encabezado "Apuntes de clase" y un enlace para
volver a la lección.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — Admin ve el mismo botón y página en un curso ajeno
**Precondición:** el usuario tiene rol `admin` pero no es owner del curso de prueba.
**Datos de prueba usados:** `dev@nodo.local`
**Pasos:**
1. Iniciar sesión como admin.
2. Abrir la misma lección del TC-001.
3. Hacer clic en "Apuntes de clase".
**Resultado esperado:** ve el botón y la página igual que el owner.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-003 — Estudiante matriculado no ve el botón ni recibe el contenido
**Precondición:** el usuario está matriculado en Programación Científica;
existe apunte para la lección.
**Datos de prueba usados:** `estudiante-prueba-044@nodo.local`
**Pasos:**
1. Iniciar sesión como estudiante matriculado.
2. Abrir la misma lección del TC-001.
3. Verificar que el header **no** muestra el botón "Apuntes de clase".
4. Inspeccionar el HTML/payload de la respuesta de la lección (ver código
   fuente o Network) buscando una frase única del contenido del apunte.
**Resultado esperado:** no aparece el botón, y la frase única del apunte no
aparece en ninguna parte del HTML/payload RSC de la lección.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — Visitante anónimo no recibe el contenido
**Precondición:** sesión cerrada.
**Pasos:**
1. Sin iniciar sesión, intentar abrir la ruta de la lección directamente.
**Resultado esperado:** el flujo de acceso existente (login/gate) se dispara
como siempre; en ningún punto de la respuesta aparece el contenido del apunte.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-005 — Sección sin apunte no muestra botón ni error
**Precondición:** una lección publicada sin archivo en `apuntes/` para su `articleSlug`.
**Datos de prueba usados:** cualquier otra lección de `programacion-cientifica`
sin apunte semilla (ej. `variables-tipos-de-datos-y-operadores`, antes de
crear el archivo temporal de TC-007).
**Pasos:**
1. Iniciar sesión como owner.
2. Abrir esa lección.
**Resultado esperado:** la página carga con normalidad (artículo, clave de
respuestas si aplica, asistencia); el header no muestra el botón "Apuntes de
clase".
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — Funciona igual en una guía (`kind: "guide"`)
**Precondición:** existe `content/cursos/estructuras-de-datos/apuntes/lab-01-listas-enlazadas.md`.
**Datos de prueba usados:** `docente-prueba-044@nodo.local`, guía
`/estructuras-de-datos/lab-01-listas-enlazadas`
**Pasos:**
1. Iniciar sesión como owner.
2. Abrir la guía correspondiente.
3. Hacer clic en "Apuntes de clase".
**Resultado esperado:** el botón y la página de apuntes funcionan igual que
en una lección; el resto de la vista docente de la guía (solo control de
asistencia, sin clave de respuestas) no cambia.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-007 — Fallo de compilación del apunte no tumba la página
**Precondición:** crear un archivo temporal
`content/cursos/programacion-cientifica/apuntes/variables-tipos-de-datos-y-operadores.md`
con un `<placeholder>` fuera de backticks (Markdown inválido como MDX).
**Datos de prueba usados:** `docente-prueba-044@nodo.local`, lección
`/programacion-cientifica/variables-tipos-de-datos-y-operadores`
**Pasos:**
1. Iniciar sesión como owner.
2. Abrir esa lección — confirmar que el botón "Apuntes de clase" aparece
   (el archivo existe, aunque su contenido sea inválido) y que el resto de
   la lección carga con normalidad.
3. Hacer clic en el botón / navegar a `.../apuntes`.
**Resultado esperado:** la página `/apuntes` muestra el mensaje del
`ErrorBoundary` ("Los apuntes de clase no están disponibles..."); la lección
de origen nunca se vio afectada (son páginas separadas).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — Regresión: clave de respuestas y asistencia (spec-031) intactas
**Precondición:** lección con preguntas de autoevaluación publicadas.
**Pasos:**
1. Iniciar sesión como owner o admin.
2. Abrir una lección con autoevaluación; revisar clave de respuestas
   (toggles) y control de asistencia (abrir/cerrar sesión) en la "Vista
   docente" de la propia lección.
**Resultado esperado:** ambos bloques funcionan exactamente igual que antes
de este spec — `TeacherLessonPanel` no tiene ningún bloque de apuntes
embebido.
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

### TC-013 — Estudiante matriculado que adivina la URL de apuntes recibe 404
**Precondición:** estudiante matriculado en Programación Científica, con
acceso normal a la lección del TC-001.
**Datos de prueba usados:** `estudiante-prueba-044@nodo.local`
**Pasos:**
1. Iniciar sesión como el estudiante.
2. Navegar directamente a
   `/programacion-cientifica/configuracion-del-entorno-de-trabajo-y-diagnostico/apuntes`.
**Resultado esperado:** página 404 (`not-found`), no un aviso de "sin acceso"
ni redirect a `/cuenta/cursos` — el gate de esta ruta es más estricto que el
de la lección misma.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda
- Aprobados: {{n}} — Fallidos: {{n}} — Pendientes: {{n}}
- Hallazgos escalados a `docs/specs/backlog.md`: {{lista o "ninguno"}}
- Limpieza de datos de prueba: ⬜ Pendiente / ✅ Completada
