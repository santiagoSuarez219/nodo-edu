# spec-036 — [DONE] Panel admin de cursos: `course_slug` validado y ciclo de vida del curso

> Estado inicial obligatorio: `[NOT STARTED]`.
> Actualizar a `[IN PROGRESS]`, `[TESTING]` o `[DONE]` según avance.

## Contexto

Dos deudas de prioridad Media del backlog viven en los **mismos archivos** del
panel de administración de cursos, así que se resuelven en un solo spec para no
duplicar la ronda de pruebas sobre el mismo formulario:

**[[DEBT-003]] — `course_slug` sin validación ni selector.** En
`AcademicCourseForm` el campo `course_slug` es un input de texto libre
(`components/admin/AcademicCourseForm.tsx:230-236`): el docente escribe a mano el
slug del curso de contenido MDX que quiere vincular. `AcademicCourseSchema`
(`lib/academic-courses/schemas.ts:33`) lo declara
`z.string().optional().or(z.literal(""))` — sin formato, sin existencia — y no
hay FK en base de datos porque el contenido vive en `lib/courses/data/` + MDX en
disco, fuera de Postgres. Un typo crea un curso académico "huérfano": se guarda
sin ningún error y sus lecciones nunca se resuelven. El docente no se entera
hasta que un estudiante reporta que no ve nada.

**[[DEBT-004]] — sin acción de eliminar/desactivar curso.** `AcademicCourseList`
y las pestañas del curso no exponen ningún botón para dar de baja un curso. La
función `deactivateAcademicCourse` (`lib/academic-courses/index.ts:126`) y su
server action `deactivateCourseAction` (`lib/academic-courses/actions.ts:78`)
existen, pero **no están conectadas a ningún componente de la UI** (verificado:
cero consumidores en todo el repo) y, tal como están escritas, **tragan los
errores** — ver D5. Un curso creado por equivocación se queda en la lista para
siempre.

**Hallazgo adicional durante la redacción del spec — desvincular es imposible
hoy.** `updateCourseAction` (`lib/academic-courses/actions.ts:68`) hace
`course_slug: parsed.data.course_slug || undefined`. Cuando el docente vacía el
campo, el string vacío se convierte en `undefined`, el cliente de Supabase omite
la columna del `UPDATE` y **el slug anterior queda intacto, sin ningún error**.
`updateAcademicCourse` sí traduce `"" → null` (`lib/academic-courses/index.ts:86`),
pero nunca recibe `""`. Es decir: un curso mal vinculado no se puede desvincular
desde la UI, solo re-vincular a otro slug. Este spec lo corrige porque el
selector introduce justamente la opción "— Sin vincular —" y sin el arreglo esa
opción sería decorativa en edición (funcionaría solo al crear, donde
`createCourseAction` sí usa `|| null`).

## Alcance

### Incluye

- Reemplazar el input libre de `course_slug` por un **selector** poblado con los
  cursos reales del contenido (nombre + slug), con opción explícita de
  "sin vincular".
- **Validar `course_slug` en el servidor** contra la lista real de cursos de
  contenido, en `createCourseAction` y `updateCourseAction` — la validación de
  cliente no es la barrera, solo la comodidad.
- **Arreglar el desvinculado en edición** (`"" → null` en `updateCourseAction`),
  sin el cual la opción "— Sin vincular —" no tendría efecto al editar.
- Conectar la **desactivación** de curso a la UI, con diálogo de confirmación, y
  **endurecer las tres actions de ciclo de vida** para que no reporten éxito
  cuando el `UPDATE`/`DELETE` no afectó ninguna fila (ver D5 y D6).
- **Reactivar** un curso desactivado — sin esto la desactivación es un viaje de
  ida y el docente queda sin salida ante un clic equivocado.
- **Borrado definitivo solo de cursos vacíos** (sin matrículas ni evaluaciones),
  con un diálogo de confirmación más exigente que el de desactivar, que advierta
  del arrastre en cascada de sesiones de asistencia e ítems de nota (ver D1).
- Señalizar en el listado los cursos **huérfanos** (con un `course_slug` que no
  corresponde a ningún curso de contenido), para que las filas ya creadas con un
  typo se puedan detectar y corregir.

### No incluye

- **Borrado en cascada de matrículas y evaluaciones.** Decisión explícita del
  usuario (2026-08-01): el borrado definitivo se limita a cursos vacíos. Ver D1.
- **Cambiar el efecto de `is_active` sobre el acceso de los estudiantes ya
  matriculados.** Decisión explícita del usuario (2026-08-01): hoy
  `is_active=false` bloquea matrículas nuevas
  (`lib/enrollments/index.ts` → `enrollByCode`) y oculta el grupo de la vista
  docente de lección (`resolveAcademicCoursesBySlug` filtra `is_active`), pero
  los ya matriculados conservan acceso al contenido porque `hasCourseAccess`
  (`lib/enrollments/access.ts`) mira `enrollments.status`, no `course.is_active`.
  Se mantiene tal cual: desactivar significa "cerré las inscripciones", no
  "expulsé a mi curso".
- Migraciones de base de datos: este spec **no toca el esquema**.
- Validar o migrar los `course_slug` ya guardados en producción. El spec los
  **señaliza** en el listado; corregirlos es trabajo de contenido posterior.
- Refactor de tokens semánticos en `components/admin/` — es **[[DEBT-032]]**,
  ajeno a este spec aunque toque los mismos archivos.
- Cualquier endpoint o MCP para crear/borrar cursos académicos. Ver "Ampliaciones
  detectadas, fuera de este spec".

## Impacto en el sistema

| Archivo | Cambio |
|---|---|
| `lib/academic-courses/schemas.ts` | `course_slug`: normalización de vacío; la existencia se valida en la action (ver D3) |
| `lib/academic-courses/actions.ts` | Validar slug contra la lista real; `"" → null` en update (bug de desvinculado); `deactivateCourseAction` pasa a devolver `AuthResult` y deja de redirigir; nuevas `reactivateCourseAction` y `deleteCourseAction` |
| `lib/academic-courses/index.ts` | `deactivateAcademicCourse` comprueba error y filas afectadas; nuevas `reactivateAcademicCourse`, `deleteAcademicCourse` y `getCourseDependencyCounts` |
| `components/admin/AcademicCourseForm.tsx` | Input libre → `<select>` alimentado por props (`Array<{slug, name}>`) |
| `components/admin/AcademicCourseList.tsx` | Señalizar filas con `course_slug` huérfano (recibe la lista de slugs válidos como prop) |
| `app/(admin)/admin/courses/page.tsx` | Obtener los cursos de contenido y pasarlos al listado |
| `app/(admin)/admin/courses/new/page.tsx` | Pasar los cursos de contenido disponibles al formulario |
| `app/(admin)/admin/courses/[academicCourseId]/edit/page.tsx` | Íd., más el slug actual aunque sea inválido; **monta `CourseLifecycleActions`** como zona de peligro al pie (ver D7); necesita los conteos de dependencias |
| `components/admin/CourseLifecycleActions.tsx` | **Nuevo** — client component con los diálogos de confirmación |
| `lib/courses/index.ts` | Sin cambios — se consume `getAllCourses()`, ya existente (línea 95) |

**No se tocan** `layout.tsx`, `CourseHeader.tsx` ni `CourseTabs.tsx`: el badge
Activo/Inactivo ya existe en el header (`CourseHeader.tsx:43-51`) y en el
listado (`AcademicCourseList.tsx:86-94`), así que el cambio de estado se refleja
solo con revalidar.

**Fuente de verdad de los cursos de contenido:** `lib/courses/index.ts`. Ojo con
la justificación correcta, porque la intuitiva es falsa: `getCourseSlugs()`
(línea 104) y `getAllCourses()` (línea 95) **no leen de disco** — mapean el array
congelado `courses`, importado de `lib/courses/data/*` (línea 12); son `async`
únicamente para que la Fase 2 (Payload + Postgres) pueda sustituir la
implementación sin tocar consumidores (comentario en línea 9). El módulo **sí es
server-only**, pero por otra razón: importa `node:fs` (`existsSync`, línea 1) y
ejecuta una IIFE `validate()` con syscalls al cargarse (líneas 28-85). Importarlo
desde un client component rompe el bundle. Por eso los cursos disponibles viajan
al formulario (client component) como prop, nunca importando `lib/courses` desde
el cliente.

## Decisiones

### D1 — El borrado definitivo se limita a cursos vacíos
Decisión del usuario (2026-08-01). Las FK a `academic_courses` ya lo imponen en
la base. Verificado con `grep` sobre `supabase/migrations/`: estas cinco son
**todas** las referencias existentes.

| Tabla | Migración | `ON DELETE` |
|---|---|---|
| `enrollments` | `20260625000001` | **restrict** |
| `assignment_variant_groups` | `20260718000002` | **restrict** |
| `assignments` (legacy) | `20260717000000` | **restrict** |
| `class_sessions` (asistencia) | `20260716000000` | cascade |
| `grade_items` | `20260625000002` | cascade |

Es decir: **la base ya rechaza** borrar un curso con matrículas o evaluaciones
(error `23503`). Pero borrar un curso "vacío" **no es inocuo**: arrastra en
cascada sus sesiones de asistencia (`class_sessions`, y con ellas los registros
de asistencia que cuelgan de cada sesión) y sus ítems de nota (`grade_items`).
Un curso sin matrículas puede perfectamente tener sesiones de asistencia ya
creadas. Por eso el diálogo de borrado **debe advertir explícitamente** qué se
va a arrastrar, con los conteos reales (ver `getCourseDependencyCounts`), y no
limitarse a un "esta acción es irreversible" genérico.

El spec no cambia ninguna FK; la UI se limita a anticipar el "no" de la base con
un mensaje claro en vez de dejar que estalle un error de Postgres. Si en el
futuro se quiere borrado en cascada total, es un spec propio con migración y
salvaguardas.

### D2 — Los cursos huérfanos se señalizan, no se bloquean
Un `course_slug` que ya no existe puede deberse a un typo (lo que DEBT-003
quiere evitar) pero también a un curso de contenido renombrado o retirado
temporalmente. Bloquear la edición de esas filas dejaría al docente sin poder
arreglarlas. El formulario, al editar un curso con slug inválido, muestra el
valor actual como una opción marcada como inválida y seleccionada, de modo que
guardar sin tocar el campo no lo corrompa ni lo borre en silencio. Esa opción
"fantasma" también se acepta en la validación de servidor **solo si coincide con
el valor ya persistido** para ese curso; cualquier otro slug desconocido se
rechaza.

### D3 — La validación de servidor es la barrera real
El `<select>` evita el typo, pero no es una garantía: las server actions se
invocan con el payload que mande el cliente. `createCourseAction` y
`updateCourseAction` revalidan el slug contra la lista real de cursos **antes**
de persistir, y devuelven `fieldErrors.course_slug` si no pertenece. El esquema
Zod no puede hacerlo solo: `AcademicCourseSchema` se comparte con el cliente
(`AcademicCourseForm` lo usa como `zodResolver`), así que un `refine` que
consulte `lib/courses` arrastraría `node:fs` al bundle del navegador. El esquema
se queda con la validación de forma; la existencia se comprueba en la action.

### D4 — El selector muestra nombre + slug, no solo el slug
`getAllCourses()` devuelve `Course` con `name` y `slug`, así que la página puede
pasar `Array<{slug, name}>` sin coste adicional. Un docente reconoce
"Estructuras de Datos" mucho antes que `estructuras-de-datos`, y la etiqueta
`Estructuras de Datos (estructuras-de-datos)` mantiene visible el valor técnico
que se persiste — útil para diagnosticar los huérfanos ya existentes. El `value`
del `<option>` sigue siendo el slug: el contrato con la base de datos no cambia.

### D5 — Las actions de ciclo de vida devuelven `AuthResult`; la navegación la hace el cliente
Hoy `deactivateAcademicCourse` no comprueba el `error` de Supabase y
`deactivateCourseAction` devuelve `Promise<void>` y llama a `redirect()`
incondicionalmente: si el `UPDATE` falla, el docente ve una navegación exitosa y
el curso sigue activo. Como este spec conecta esa action a la UI por primera
vez, se corrige de raíz:

- Las tres funciones de `lib/academic-courses/index.ts` (desactivar, reactivar,
  borrar) comprueban `error` y devuelven qué pasó.
- Las tres server actions devuelven `AuthResult` (el mismo contrato que
  `createCourseAction`/`updateCourseAction`) y **no llaman a `redirect()`**: solo
  `revalidatePath`. Navega el client component tras recibir `ok: true`.
- Motivo técnico adicional: `redirect()` lanza una excepción `NEXT_REDIRECT`, de
  modo que no puede envolverse en un `try/catch` genérico dentro de la action
  (el catch se tragaría la redirección y la convertiría en un error). Sacar la
  navegación de la action evita por completo esa trampa.

Esto cambia la firma pública de `deactivateCourseAction`, lo cual es seguro:
**no tiene ningún consumidor hoy**.

### D6 — Con RLS, "no autorizado" se manifiesta como cero filas, no como error
`supabase/migrations/20260625000004_rls_academic.sql` define sobre
`academic_courses` políticas `select`/`insert`/`update`/`delete` de tipo
"own or admin" (`teacher_id = auth.uid() or has_role(auth.uid(),'admin')`), y
todas las funciones de `lib/academic-courses/index.ts` usan
`createServerSupabaseClient()` — cliente de sesión, con RLS activa. La
autorización, por tanto, **ya está cubierta**: un docente no puede desactivar ni
borrar el curso de otro. Este spec no añade comprobaciones de propiedad en
código.

Pero el **modo de fallo** importa para la UI: en Postgres, la cláusula `USING` de
una política de `UPDATE`/`DELETE` *filtra* filas, no lanza error. Una operación
no autorizada devuelve `error: null` y **cero filas afectadas**. Por eso las tres
funciones deben pedir `.select()` sobre la mutación y tratar "cero filas" como
fallo (`ok: false`, "No se pudo… (puede que ya no exista o no tengas permiso)").
Sin esto, un intento no autorizado se vería en la UI como un éxito.

### D7 — `CourseLifecycleActions` se monta en la pestaña de edición, como zona de peligro
Confirmada por el usuario (2026-08-01) frente a las dos alternativas evaluadas:
una pestaña "Configuración" nueva en `CourseTabs` (ampliaría el scope tocando la
navegación de spec-032) y un menú de acciones en `CourseHeader` (dejaría
"Eliminar" a un clic desde cualquier pantalla del curso, incluida la de pasar
asistencia).

La ubicación que se había asumido (`[academicCourseId]/page.tsx`) es incorrecta:
esa ruta **no es el "detalle" del curso**, es la pestaña **Estudiantes** (renderiza
`EnrollmentTable`). Desde spec-032 el curso tiene `layout.tsx` con `CourseHeader`
+ `CourseTabs` y varias rutas hermanas (`grades`, `assignments`, `contenido`,
`presentacion`, `edit`). Colgar acciones destructivas de la pestaña Estudiantes
las pondría justo encima de la tabla que más se usa a diario.

Se monta en `edit/page.tsx`, al pie del formulario, como **zona de peligro**
visualmente separada. Razones: es la pestaña de configuración del curso (donde
el docente ya va con intención de modificarlo, no de consultar), no compite con
ninguna operación cotidiana, y la página ya carga el curso completo. No se añade
una pestaña nueva a `CourseTabs`: "Editar curso" ya tiene su botón en
`CourseHeader` y añadir una pestaña "Configuración" sería un cambio de
navegación fuera del alcance acordado.

### D8 — Qué pasa después de cada acción
Confirmada por el usuario (2026-08-01).

- **Desactivar / reactivar:** el docente **se queda en `/admin/courses/{id}/edit`**.
  Basta con `revalidatePath` para que `CourseHeader` (dentro del layout) muestre
  el badge nuevo y la zona de peligro cambie de "Desactivar" a "Reactivar". Esto
  cambia deliberadamente el comportamiento actual de `deactivateCourseAction`,
  que expulsa al listado: expulsar al docente justo después de desactivar le
  impide deshacerlo de un clic, que es exactamente el caso de uso que motiva la
  reactivación.
- **Borrar definitivamente:** la ruta `/admin/courses/{id}/*` deja de existir
  (el `layout.tsx` haría `notFound()`), así que el client component navega a
  `/admin/courses` tras `ok: true`, y la action revalida `/admin/courses`. No se
  revalida la ruta del curso borrado.

## Evaluación MCP

**¿Aplica MCP?** No.

- **¿Expone datos que un agente podría necesitar consultar?** No. La lista de
  cursos de contenido ya es derivable del repositorio, que cualquier agente con
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
> un agente es la respuesta equivocada. Ver "Ampliaciones detectadas, fuera de
> este spec".

## Fases de implementación

### Fase 1 — `course_slug` como selector validado
- [x] En `new/page.tsx` y `edit/page.tsx`, obtener los cursos de contenido con
      `getAllCourses()` y pasarlos al formulario como
      `availableCourses: Array<{ slug: string; name: string }>` (D4).
      Nota: `Course` expone el nombre legible como `title`, no `name` — el spec
      original (D4) decía `name`; el mapeo `{ slug: c.slug, name: c.title }`
      corrige esa inexactitud sin cambiar el contrato del prop.
- [x] Reemplazar el input de texto por un `<select>` con opción
      "— Sin vincular —" (`value=""`) y una opción por curso, etiquetada
      `Nombre (slug)`
- [x] Si el curso editado tiene un slug que no está en la lista, añadirlo como
      opción seleccionada y marcada como inválida (D2)
- [x] **Arreglar el desvinculado en edición:** en `updateCourseAction`, sustituir
      `course_slug: parsed.data.course_slug || undefined` por una traducción
      explícita `"" → null`, para que la columna sí se incluya en el `UPDATE`
      (hoy se omite y el slug viejo sobrevive sin error)
- [x] Validar el slug en `createCourseAction` y `updateCourseAction` contra la
      lista real, devolviendo `fieldErrors.course_slug` si no pertenece;
      en update, aceptar además el valor ya persistido para ese curso (D2/D3)
- [x] Señalizar en `AcademicCourseList` las filas cuyo `course_slug` no exista
      (pasando los slugs válidos desde `courses/page.tsx`); "sin vincular"
      (`null`) **no** se marca como huérfano

### Fase 2 — Ciclo de vida del curso
- [x] `getCourseDependencyCounts(courseId)` en `lib/academic-courses/index.ts` —
      devuelve conteos de: matrículas, grupos de variantes + `assignments`
      legacy (bloquean el borrado), y sesiones de asistencia + ítems de nota
      (se arrastran en cascada, hay que advertirlos — D1)
- [x] Endurecer `deactivateAcademicCourse`: comprobar `error` y filas afectadas
      vía `.select()`; devolver el resultado en vez de `void` (D5/D6)
- [x] `reactivateAcademicCourse` (`is_active: true`) con el mismo tratamiento
- [x] `deleteAcademicCourse`: `DELETE ... .select()`; traducir el error `23503`
      de Postgres a un mensaje comprensible y tratar "cero filas" como fallo
- [x] `deactivateCourseAction` pasa a `Promise<AuthResult>` y deja de llamar a
      `redirect()`; nuevas `reactivateCourseAction` y `deleteCourseAction` con el
      mismo contrato (D5)
- [x] `CourseLifecycleActions.tsx` — client component con los diálogos de
      desactivar / reactivar / borrar; recibe `course` y los conteos de
      dependencias; deshabilita el borrado con explicación cuando hay
      dependencias bloqueantes, y advierte del arrastre en cascada cuando no
- [x] Montarlo al pie de `edit/page.tsx` como zona de peligro (D7), conectando
      `deactivateCourseAction` (hoy código muerto)
- [x] Navegación post-acción según D8: permanecer en la página al
      desactivar/reactivar (con `router.refresh()` para que `CourseHeader`
      recoja el `is_active` nuevo); ir a `/admin/courses` tras un borrado
      exitoso

### Fase 3 — Verificación
- [x] `npm run lint` sin errores nuevos (10 warnings preexistentes, ajenos a
      este spec)
- [x] `npm run build` en verde
- [x] Invocar `@reviewer` antes de la ronda manual — **APROBADO** (2026-08-01),
      con un hallazgo Mayor corregido antes de este commit:
      `getCourseDependencyCounts` degradaba silenciosamente a "0 dependencias"
      si la consulta a Postgres fallaba, lo que podía hacer que el diálogo de
      borrado dijera "sin sesiones de asistencia ni ítems de nota" cuando en
      realidad no se pudo verificar. Ahora devuelve
      `{ ok: false }` explícito y el borrado se deshabilita si no se pudieron
      calcular las dependencias. También se corrigieron dos hallazgos menores
      (texto "0 matrícula(s)" cuando el bloqueo era solo por evaluaciones, y
      `title` decorativo en un botón deshabilitado sin valor para lectores de
      pantalla, reemplazado por `aria-describedby`).
- [x] Ejecutar la ronda manual de `docs/testing/test-036-admin-curso-slug-y-ciclo-de-vida.md`
      — **12/12 casos aprobados** (2026-08-01). Un hallazgo incidental y ajeno
      al spec (error de hidratación de `<Script id="theme-init">` en
      `app/layout.tsx:48`, causante probable de un colgado transitorio en el
      primer intento de TC-036-012) se registró como **DEBT-039**, no se
      corrigió en esta sesión. Datos de prueba limpiados por completo.

> **Reutilización de patrones:** los diálogos de confirmación deben seguir el
> mismo patrón accesible ya presente en `components/student/AssignmentPlayer.tsx`
> (spec-019) y reutilizado verbatim en `components/admin/AdminAttendancePanel.tsx`
> (2026-08-01): `role="dialog"`, `aria-modal`, `aria-labelledby`/
> `aria-describedby`, cierre con `Esc`, foco al botón de confirmar y
> `overflow: hidden` en el body. Está copiado a mano porque el proyecto **no
> tiene Flowbite ni shadcn/ui instalados** pese a lo que declara CLAUDE.md →
> "Stack tecnológico" (**[[DEBT-036]]**).
>
> Que el patrón viva duplicado en vez de extraído quedó registrado como
> **[[DEBT-038]]** (2026-08-01), abierta precisamente al revisar este spec.
> Este spec **no** la resuelve: agrega deliberadamente la tercera copia
> siguiendo el patrón existente, porque inventar un cuarto diálogo distinto
> haría más difícil la extracción posterior.

## Criterios de aceptación

1. Al crear un curso, `course_slug` se elige de una lista; no es posible teclear un slug arbitrario. La lista muestra el nombre legible del curso además del slug.
2. Una server action invocada con un `course_slug` inexistente rechaza la operación con un error de campo, sin persistir nada.
3. Un curso puede quedar deliberadamente sin contenido vinculado ("— Sin vincular —") **al crearlo** y guardarse sin error.
4. Editar un curso cuyo `course_slug` ya no existe conserva el valor si no se toca, y permite corregirlo.
5. El listado distingue visualmente los cursos con un `course_slug` huérfano; los "sin vincular" no se marcan.
6. El docente puede desactivar un curso desde la UI, con confirmación previa; el curso pasa a "Inactivo" y deja de aceptar matrículas nuevas.
7. Un curso desactivado puede reactivarse.
8. Un curso **sin** matrículas ni evaluaciones puede borrarse definitivamente, con una confirmación más exigente que advierte qué se arrastra en cascada (sesiones de asistencia, ítems de nota).
9. Un curso **con** matrículas o evaluaciones no puede borrarse: la UI lo impide y explica por qué, sin mostrar un error crudo de Postgres.
10. Desactivar un curso **no** expulsa a los estudiantes ya matriculados de las lecciones (ver "No incluye").
11. Un curso **ya vinculado** puede desvincularse desde la edición: elegir "— Sin vincular —" y guardar deja `course_slug` en `null` (hoy el valor anterior sobrevive en silencio).
12. Ninguna acción de ciclo de vida reporta éxito si no modificó nada: si el `UPDATE`/`DELETE` afecta cero filas (fila inexistente o bloqueada por RLS), la UI muestra un error y no navega.

## Pruebas asociadas
> Estos archivos se crean junto con el spec (ver CLAUDE.md → "Artefactos que acompañan al spec").
- **Manuales:** `docs/testing/test-036-admin-curso-slug-y-ciclo-de-vida.md` — casos `TC-036-NNN`.
  Cobertura completa (sincronizada el 2026-08-01): TC-036-001/002 → criterio 1;
  003 → criterio 3; 004 → criterio 4; 005 → criterio 5; 006 → criterios 6 y 10;
  007 → criterio 7; 008 → criterio 8; 009 → criterio 9; 010 → criterio 2;
  **011 → criterio 11**; **012 → criterio 12**. Los doce criterios tienen caso.
- **Automáticas (e2e/unit):** pendientes de que exista framework de testing (ver
  CLAUDE.md → "Testing"). Los criterios 2, 4, 9, 11 y 12 son los mejores
  candidatos a prueba unitaria de las server actions cuando lo haya: los cinco se
  verifican sin UI y el 12 es difícil de provocar a mano sin una segunda sesión de
  docente.

## Ampliaciones detectadas, fuera de este spec
> Registradas aquí para no perderlas. **Ninguna se implementa en spec-036**;
> cada una requiere decisión del usuario y, si procede, spec propio.
> Las tres quedan fuera por decisión explícita del usuario (2026-08-01).

1. **`is_active` no corta el acceso de los ya matriculados.** Confirmado en
   `lib/enrollments/access.ts`. Es la decisión vigente (ver "No incluye"), pero
   si algún día "desactivar" debe significar "cerrar el curso", hay que tocar
   `hasCourseAccess` y evaluar el impacto sobre notas y evaluaciones en curso.
2. **No existe endpoint ni MCP para crear cursos académicos**, lo que obliga a
   SQL directo en cada ronda de pruebas que necesite un curso de precondición
   (`test-035`, `test-036`). Si se aborda, que sea acotado a creación en entorno
   de desarrollo.
3. **El patrón de diálogo de confirmación está copiado a mano en tres
   componentes** (`AssignmentPlayer`, `AdminAttendancePanel` y, tras este spec,
   `CourseLifecycleActions`). Ya **registrado como [[DEBT-038]]** (2026-08-01);
   la extracción a un `ConfirmDialog` compartido queda para esa deuda, no para
   este spec. (**[[DEBT-036]]** es otra cosa: que Flowbite/shadcn no están
   instalados, que es *por qué* el diálogo es hecho a mano.)

## Aprobación de implementación
> Claude no escribe código de implementación hasta que esta sección esté marcada.
- [x] Paquete (spec + pruebas) aprobado por el usuario
- **Fecha de aprobación:** 2026-08-01 ("Implementa el spec")
