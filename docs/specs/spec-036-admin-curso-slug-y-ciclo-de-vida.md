# spec-036 — [NOT STARTED] Panel admin de cursos: `course_slug` validado y ciclo de vida del curso

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Dos deudas de prioridad Media del backlog viven en los **mismos archivos** del
panel de administración de cursos, así que se resuelven en un solo spec para no
duplicar la ronda de pruebas sobre el mismo formulario:

**[[DEBT-003]] — `course_slug` sin validación ni selector.** En
`AcademicCourseForm` el campo `course_slug` es un input de texto libre: el
docente escribe a mano el slug del curso de contenido MDX que quiere vincular.
`AcademicCourseSchema` (`lib/academic-courses/schemas.ts:33`) lo declara
`z.string().optional().or(z.literal(""))` — sin formato, sin existencia — y no
hay FK en base de datos porque el contenido vive en `lib/courses/data/` + MDX en
disco, fuera de Postgres. Un typo crea un curso académico "huérfano": se guarda
sin ningún error y sus lecciones nunca se resuelven. El docente no se entera
hasta que un estudiante reporta que no ve nada.

**[[DEBT-004]] — sin acción de eliminar/desactivar curso.** `AcademicCourseList`
y el detalle de curso no exponen ningún botón para dar de baja un curso. La
función `deactivateAcademicCourse` (`lib/academic-courses/index.ts:126`) y su
server action `deactivateCourseAction` (`lib/academic-courses/actions.ts:78`)
**ya existen y funcionan**, pero no están conectadas a ningún componente de la
UI: es código muerto desde que se escribió. Un curso creado por equivocación se
queda en la lista para siempre.

## Alcance

### Incluye

- Reemplazar el input libre de `course_slug` por un **selector** poblado con los
  slugs reales del contenido, con opción explícita de "sin vincular".
- **Validar `course_slug` en el servidor** contra la lista real de cursos de
  contenido, en `createCourseAction` y `updateCourseAction` — la validación de
  cliente no es la barrera, solo la comodidad.
- Conectar la **desactivación** de curso a la UI (usa `deactivateCourseAction`,
  ya existente), con diálogo de confirmación.
- **Reactivar** un curso desactivado — sin esto la desactivación es un viaje de
  ida y el docente queda sin salida ante un clic equivocado.
- **Borrado definitivo solo de cursos vacíos** (sin matrículas ni evaluaciones),
  con un diálogo de confirmación más exigente que el de desactivar.
- Señalizar en el listado los cursos **huérfanos** (con un `course_slug` que no
  corresponde a ningún curso de contenido), para que las filas ya creadas con un
  typo se puedan detectar y corregir.

### No incluye

- **Borrado en cascada** (arrastrar matrículas, asistencia, notas y
  evaluaciones). Decisión explícita del usuario (2026-08-01): el borrado
  definitivo se limita a cursos vacíos. Ver "Decisiones".
- **Cambiar el efecto de `is_active` sobre el acceso de los estudiantes ya
  matriculados.** Decisión explícita del usuario (2026-08-01): hoy
  `is_active=false` bloquea matrículas nuevas
  (`lib/enrollments/index.ts:102`) y oculta el grupo de la vista docente de
  lección (`resolveAcademicCoursesBySlug` filtra `is_active`), pero los ya
  matriculados conservan acceso al contenido porque `hasCourseAccess`
  (`lib/enrollments/access.ts:49-56`) mira `enrollments.status`, no
  `course.is_active`. Se mantiene tal cual: desactivar significa "cerré las
  inscripciones", no "expulsé a mi curso".
- Migraciones de base de datos: este spec **no toca el esquema**.
- Validar o migrar los `course_slug` ya guardados en producción. El spec los
  **señaliza** en el listado; corregirlos es trabajo de contenido posterior.
- Refactor de tokens semánticos en `components/admin/` — es **[[DEBT-032]]**,
  ajeno a este spec aunque toque los mismos archivos.

## Impacto en el sistema

| Archivo | Cambio |
|---|---|
| `lib/academic-courses/schemas.ts` | `course_slug` deja de ser texto libre: validación de pertenencia a la lista real |
| `lib/academic-courses/actions.ts` | Validar slug en servidor; nuevas actions de reactivar y borrar |
| `lib/academic-courses/index.ts` | Nuevas funciones: reactivar, borrar, y contar dependencias del curso |
| `components/admin/AcademicCourseForm.tsx` | Input libre → `<select>` alimentado por props |
| `components/admin/AcademicCourseList.tsx` | Señalizar cursos huérfanos |
| `app/(admin)/admin/courses/new/page.tsx` | Pasar los slugs disponibles al formulario |
| `app/(admin)/admin/courses/[academicCourseId]/edit/page.tsx` | Íd., más el slug actual aunque sea inválido |
| `app/(admin)/admin/courses/[academicCourseId]/page.tsx` | Zona de acciones de ciclo de vida (desactivar / reactivar / borrar) |
| `components/admin/CourseLifecycleActions.tsx` | **Nuevo** — client component con los diálogos de confirmación |
| `lib/courses/index.ts` | Sin cambios — se consume `getCourseSlugs()`, ya existente (línea 104) |

**Fuente de verdad de los slugs:** `getCourseSlugs()` (`lib/courses/index.ts:104`)
ya devuelve los slugs reales del contenido. Es `async` y lee de disco, así que
**solo puede invocarse desde server components**: los slugs viajan al formulario
(client component) como prop, nunca importando `lib/courses` desde el cliente.

## Decisiones

### D1 — El borrado definitivo se limita a cursos vacíos
Decisión del usuario (2026-08-01). Las FK a `academic_courses` ya lo imponen en
la base, verificado en las migraciones:

| Tabla | Migración | `ON DELETE` |
|---|---|---|
| `enrollments` | `20260625000001` | **restrict** |
| `assignment_variant_groups` | `20260718000002` | **restrict** |
| `assignments` (legacy) | `20260717000000` | **restrict** |
| `class_sessions` | `20260716000000` | cascade |
| `grade_items` | `20260625000002` | cascade |

Es decir: **la base ya rechaza** borrar un curso con matrículas o evaluaciones
(error `23503`), y arrastra sola la asistencia y los ítems de nota. El spec no
cambia ninguna FK; la UI se limita a anticipar ese "no" con un mensaje claro en
vez de dejar que estalle un error de Postgres. Si en el futuro se quiere
borrado en cascada total, es un spec propio con migración y salvaguardas.

### D2 — Los cursos huérfanos se señalizan, no se bloquean
Un `course_slug` que ya no existe puede deberse a un typo (lo que DEBT-003
quiere evitar) pero también a un curso de contenido renombrado o retirado
temporalmente. Bloquear la edición de esas filas dejaría al docente sin poder
arreglarlas. El formulario, al editar un curso con slug inválido, muestra el
valor actual como una opción marcada como inválida y seleccionada, de modo que
guardar sin tocar el campo no lo corrompa ni lo borre en silencio.

### D3 — La validación de servidor es la barrera real
El `<select>` evita el typo, pero no es una garantía: las server actions se
invocan con el payload que mande el cliente. `createCourseAction` y
`updateCourseAction` revalidan el slug contra `getCourseSlugs()` **antes** de
persistir, y devuelven `fieldErrors.course_slug` si no pertenece. El esquema Zod
no puede hacerlo solo, porque la lista es asíncrona y depende del disco.

## Evaluación MCP

**¿Aplica MCP?** No.

- **¿Expone datos que un agente podría necesitar consultar?** No. La lista de
  slugs de contenido ya es derivable del repositorio, que cualquier agente con
  acceso al código puede leer directamente.
- **¿Permite acciones que un agente debería poder ejecutar?** No, y
  deliberadamente: desactivar o borrar un curso académico es una acción
  destructiva sobre el semestre en curso de ~30 estudiantes. Debe requerir un
  humano frente a un diálogo de confirmación, no una herramienta invocable por
  un agente.
- **¿Existe un MCP de dominio relacionado?** `students-mcp` administra
  estudiantes y matrículas, no cursos académicos. `attendance-mcp` es de solo
  lectura. Ninguno cubre el ciclo de vida del curso ni debería.
- **¿Algún system prompt de `docs/mcps/` se ve afectado?** No. Ninguno menciona
  la creación o baja de cursos académicos.

> Nota relacionada: `test-035` y esta misma sesión documentaron que **no existe
> ningún endpoint ni MCP para crear cursos académicos**, lo que obliga a
> insertarlos con SQL directo para montar precondiciones de prueba. Es una
> molestia real de testing, pero exponer el ciclo de vida completo de un curso a
> un agente es la respuesta equivocada; si se aborda, que sea un spec propio y
> con alcance acotado a la creación en entorno de desarrollo.

## Fases de implementación

### Fase 1 — `course_slug` como selector validado
- [ ] Pasar `availableSlugs` desde `new/page.tsx` y `edit/page.tsx` al formulario, obtenidos con `getCourseSlugs()`
- [ ] Reemplazar el input de texto por un `<select>` con opción "— Sin vincular —" y una opción por slug disponible
- [ ] Si el curso editado tiene un slug que no está en la lista, añadirlo como opción seleccionada y marcada como inválida
- [ ] Validar el slug en `createCourseAction` y `updateCourseAction` contra `getCourseSlugs()`, devolviendo `fieldErrors.course_slug` si no pertenece
- [ ] Señalizar en `AcademicCourseList` las filas cuyo `course_slug` no exista

### Fase 2 — Ciclo de vida del curso
- [ ] `getCourseDependencyCounts(courseId)` en `lib/academic-courses/index.ts` — cuenta matrículas y evaluaciones para decidir si el borrado es posible
- [ ] `reactivateAcademicCourse` + `reactivateCourseAction`
- [ ] `deleteAcademicCourse` + `deleteCourseAction`, que traduce el error `23503` de Postgres a un mensaje comprensible en vez de propagarlo
- [ ] `CourseLifecycleActions.tsx` — client component con los diálogos de desactivar / reactivar / borrar
- [ ] Montarlo en el detalle del curso, conectando `deactivateCourseAction` (hoy código muerto)

### Fase 3 — Verificación
- [ ] `npm run lint` sin errores nuevos
- [ ] `npm run build` en verde
- [ ] Invocar `@reviewer` antes de la ronda manual
- [ ] Ejecutar la ronda manual de `docs/testing/test-036-admin-curso-slug-y-ciclo-de-vida.md`

> **Reutilización de patrones:** los diálogos de confirmación deben seguir el
> mismo patrón accesible que `AssignmentPlayer` y `AdminAttendancePanel`
> (`role="dialog"`, `aria-modal`, cierre con `Esc`, foco al confirmar). Que ese
> patrón esté copiado en tres archivos en vez de extraído es **[[DEBT-036]]**;
> este spec **no** lo resuelve, solo evita empeorarlo inventando un cuarto
> patrón distinto.

## Criterios de aceptación

1. Al crear un curso, `course_slug` se elige de una lista; no es posible teclear un slug arbitrario.
2. Una server action invocada con un `course_slug` inexistente rechaza la operación con un error de campo, sin persistir nada.
3. Un curso puede quedar deliberadamente sin contenido vinculado ("— Sin vincular —") y guardarse sin error.
4. Editar un curso cuyo `course_slug` ya no existe conserva el valor si no se toca, y permite corregirlo.
5. El listado distingue visualmente los cursos con un `course_slug` huérfano.
6. El docente puede desactivar un curso desde la UI, con confirmación previa; el curso pasa a "Inactivo" y deja de aceptar matrículas nuevas.
7. Un curso desactivado puede reactivarse.
8. Un curso **sin** matrículas ni evaluaciones puede borrarse definitivamente, con una confirmación más exigente.
9. Un curso **con** matrículas o evaluaciones no puede borrarse: la UI lo impide y explica por qué, sin mostrar un error crudo de Postgres.
10. Desactivar un curso **no** expulsa a los estudiantes ya matriculados de las lecciones (ver "No incluye").

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-036-admin-curso-slug-y-ciclo-de-vida.md` — casos `TC-036-NNN`.
- **Automáticas (e2e/unit):** pendientes de que exista framework de testing (ver CLAUDE.md → "Testing"). Los criterios 2, 4 y 9 son los mejores candidatos a prueba unitaria de las server actions cuando lo haya.

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [ ] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** {{pendiente}}
