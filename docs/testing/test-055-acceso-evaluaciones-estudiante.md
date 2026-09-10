# test-055 — Acceso a las evaluaciones desde el detalle de matrícula del estudiante

> Pruebas manuales de `docs/specs/spec-055-acceso-evaluaciones-estudiante.md`
> (resuelve **DEBT-084**). Escritas junto con el spec, antes de la
> implementación: **hoy los casos que esperan ver la tarjeta fallan** — ese es
> el estado esperado hasta que la implementación los ponga en verde.
>
> Los casos que esperan que la tarjeta **no** aparezca (TC-055-003, 004, 006 y
> 007) pasan trivialmente hoy, porque la tarjeta no existe. Su valor está en
> ejecutarlos **después** de implementar: son los que confirman que la regla de
> visibilidad no muestra de más.

## Datos de prueba

> Recursos a crear vía API / MCP al iniciar la ronda.
> Deben eliminarse al cerrarla, salvo los fixtures permanentes marcados "n/a".

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---|---|---|---|
| Docente de desarrollo (fixture permanente, **no** crear ni borrar) | `npm run seed:teacher` | `dev@nodo.local` / `DevLocal2026!` | n/a |
| Curso "Test-054 Curso A" (fixture permanente, `course_slug: analisis-de-algoritmos`) | — | `65a0bad9-16a8-4c27-bec6-3e097f6055fc` | n/a |
| Curso "Test-054 Curso B" (fixture permanente, mismo `course_slug` que A, docente secundario) | — | `98e1d74e-8bc9-426d-9a3c-ce8b8d846c2c` | n/a |
| Curso "Test-054 Curso Vacío" (fixture permanente, **sin** `course_slug`) | — | `bdf3ca64-adbe-4c6b-915e-91e7e9c575d0` | n/a |
| Estudiante Ana Gómez (activa en A y B) | — | `ana.gomez.test054@nodo.local` / `Test054Ana!` | n/a |
| Estudiante Bruno Díaz (activo en A) | — | `bruno.diaz.test054@nodo.local` / `Test054Bruno!` | n/a |
| Estudiante Carla Ruiz (**retirada** de A) | — | `carla.ruiz.test054@nodo.local` / `Test054Carla!` | n/a |
| Grupo abierto 1 en Curso A | `create_assignment_group` + `publish_assignment_group` (`assignment-mcp`) | _por crear_ | ⬜ |
| Grupo abierto 2 en Curso A | ídem | _por crear_ | ⬜ |
| Grupo borrador en Curso A | `create_assignment_group` (sin publicar) | _por crear_ | ⬜ |
| Grupo con apertura futura en Curso A | `create_assignment_group` + `publish_assignment_group` con `opens_at` futuro | _por crear_ | ⬜ |
| Grupo abierto en Curso B | ídem, docente secundario | _por crear_ | ⬜ |
| Matrícula de un estudiante en Curso Vacío | `enroll_student` (`students-mcp`) | _por crear_ | ⬜ |
| Grupo abierto en Curso Vacío | ídem | _por crear_ | ⬜ |
| Envío de Ana a un grupo del Curso A (TC-055-005/006) | Enviado vía UI por Ana | _por crear_ | ⬜ |

> ⚠️ **Los envíos no se pueden borrar vía API:** `delete_assignment_group`
> devuelve 409 si el grupo tiene entregas. El grupo de TC-055-005/006 quedará
> en desarrollo al cierre de la ronda; registrarlo aquí con su id.

> ⚠️ **Receta para ventana cerrada con envío (TC-055-006):** `/publish` rechaza
> `closes_at` en el pasado. Publicar con cierre futuro, enviar el intento, y
> **después** mover `closes_at` al pasado con `update_assignment_group`
> (misma receta que G9 en `test-019`).

**Entorno de pruebas:** desarrollo — instancia Supabase local en `asus` vía
túnel SSH (ver CLAUDE.md → "Base de datos"). **Nunca contra producción.**

**Fecha de la ronda:** _por definir_

## Casos de prueba

### TC-055-001 — Tarjeta visible con una evaluación abierta
**Precondición:** Ana activa en Curso A; exactamente 1 grupo publicado y dentro de ventana en Curso A (grupo abierto 1). Sin intentos previos.
**Datos de prueba usados:** Ana / Curso A / grupo abierto 1
**Pasos:**
1. Iniciar sesión como Ana.
2. Ir a **Mis cursos** y abrir "Test-054 Curso A".
3. Observar la parte superior de la página, entre el título y "Información del curso".
4. Hacer clic en la tarjeta "Evaluaciones".
**Resultado esperado:** Aparece la tarjeta "Evaluaciones" **arriba** de "Información del curso", con el texto "Tienes 1 evaluación abierta" (singular) y un badge con `1`. El clic lleva a `/cuenta/cursos/<enrollmentId>/evaluaciones`, que lista ese único grupo con estado "Sin intentos".
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-002 — Plural, y coherencia exacta con el listado
**Precondición:** Curso A con grupo abierto 1, grupo abierto 2 y un grupo en borrador.
**Datos de prueba usados:** Ana / Curso A / grupos abiertos 1 y 2 / grupo borrador
**Pasos:**
1. Como Ana, abrir el detalle de "Test-054 Curso A".
2. Leer el conteo de la tarjeta.
3. Entrar al listado y contar los ítems.
**Resultado esperado:** La tarjeta dice "Tienes 2 evaluaciones abiertas" (plural). El listado muestra **exactamente** esos 2 grupos; el borrador no aparece en ninguno de los dos lugares. El número de la tarjeta y el del listado coinciden.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-003 — Sin evaluaciones abiertas, sin tarjeta
**Precondición:** Un curso donde el estudiante está activo y **no** hay grupos publicados (o solo borradores).
**Datos de prueba usados:** Bruno / Curso A **antes** de publicar los grupos, o con solo el borrador
**Pasos:**
1. Iniciar sesión como Bruno.
2. Abrir el detalle de "Test-054 Curso A".
**Resultado esperado:** La tarjeta "Evaluaciones" **no aparece**. "Información del curso", "Calificaciones" y el resumen de autoevaluaciones se ven exactamente igual que antes del cambio, sin huecos ni espacios vacíos.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-004 — Solo una evaluación con apertura futura
**Precondición:** En el curso, el único grupo publicado tiene `opens_at` en el futuro cercano (unos minutos).
**Datos de prueba usados:** Ana / Curso A / grupo con apertura futura
**Pasos:**
1. Como Ana, abrir el detalle del curso antes de `opens_at`.
2. Esperar a que pase `opens_at` y recargar.
**Resultado esperado:** Antes de `opens_at`, la tarjeta **no aparece**. Después de `opens_at`, al recargar, **aparece** con "Tienes 1 evaluación abierta". (Es el mismo comportamiento que tendrá el quiz real al abrir.)
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-005 — Evaluación enviada con la ventana todavía abierta
**Precondición:** Ana envió un intento a un grupo del Curso A que sigue dentro de ventana.
**Datos de prueba usados:** Ana / Curso A / envío de Ana
**Pasos:**
1. Como Ana, resolver y **enviar** el intento de un grupo abierto.
2. Volver al detalle del curso.
3. Entrar por la tarjeta al listado y abrir ese grupo.
**Resultado esperado:** La tarjeta **sigue visible** (el grupo sigue abierto). En el listado el grupo muestra "Calificado" o "Enviado — pendiente de revisión". Al abrirlo, lleva a la página de resultados.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-006 — Evaluación enviada con la ventana ya cerrada
**Precondición:** El grupo de TC-055-005 con `closes_at` movido al pasado; ningún otro grupo abierto en el curso.
**Datos de prueba usados:** Ana / Curso A / grupo de TC-055-005
**Pasos:**
1. Mover `closes_at` del grupo al pasado (ver receta en "Datos de prueba").
2. Como Ana, abrir el detalle del curso.
3. Abrir a mano la URL de resultados de ese grupo.
**Resultado esperado:** La tarjeta **no aparece**. La URL directa de resultados da **404**.
**⚠️ Esto último es una limitación conocida, no un fallo de este spec:** los resultados son inaccesibles tras el cierre desde antes de spec-055 (**DEBT-085**). Marcar el caso como aprobado si la tarjeta no aparece, y anotar el 404 como observación.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-007 — Matrícula retirada
**Precondición:** Carla retirada del Curso A; al menos un grupo abierto en el Curso A.
**Datos de prueba usados:** Carla / Curso A / grupo abierto 1
**Pasos:**
1. Iniciar sesión como Carla.
2. Entrar por URL directa al detalle de su matrícula en el Curso A.
3. Abrir a mano `/cuenta/cursos/<enrollmentId>/evaluaciones`.
**Resultado esperado:** El detalle muestra el estado "Retirado" y **no** muestra la tarjeta "Evaluaciones", aunque el curso tenga una evaluación abierta. La URL directa del listado da **404**.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-008 — Aislamiento entre grupos académicos con el mismo `course_slug`
**Precondición:** Ana activa en Curso A y Curso B (ambos `analisis-de-algoritmos`); grupo abierto **solo** en el Curso B; ningún grupo abierto en el Curso A.
**Datos de prueba usados:** Ana / Curso A / Curso B / grupo abierto en Curso B
**Pasos:**
1. Como Ana, abrir el detalle del Curso B.
2. Abrir el detalle del Curso A.
**Resultado esperado:** La tarjeta aparece en el detalle del **Curso B** y **no** en el del **Curso A**, aunque ambos cursos compartan `course_slug`. El listado del Curso A no muestra el grupo del Curso B.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-009 — Grupo académico sin `course_slug`
**Precondición:** Un estudiante matriculado en "Test-054 Curso Vacío" (sin `course_slug`) y un grupo abierto en ese curso.
**Datos de prueba usados:** estudiante matriculado en Curso Vacío / grupo abierto en Curso Vacío
**Pasos:**
1. Iniciar sesión con ese estudiante.
2. Abrir el detalle de "Test-054 Curso Vacío".
**Resultado esperado:** La tarjeta **aparece** con "Tienes 1 evaluación abierta", aunque la página no muestre contador de lecciones (el curso no tiene contenido asociado).
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-010 — Fallo de la consulta de evaluaciones
**Precondición:** TC-055-001 montado. **Requiere autorización explícita del usuario en la sesión de pruebas:** consiste en manipular permisos directamente en la base de desarrollo.
**Datos de prueba usados:** Ana / Curso A / grupo abierto 1
**Pasos:**
1. En la base de `asus`, revocar la lectura de la tabla solo para usuarios autenticados: `REVOKE SELECT ON assignment_variant_groups FROM authenticated;`
2. Como Ana, abrir el detalle del Curso A.
3. Entrar por la tarjeta al listado.
4. Restaurar el permiso: `GRANT SELECT ON assignment_variant_groups TO authenticated;`
5. Recargar ambas páginas.
**Resultado esperado:**
- Paso 2: la página de detalle se renderiza **completa** (información, calificaciones, autoevaluaciones) con la tarjeta en versión **genérica**: "Consulta las evaluaciones de este curso", **sin** badge de conteo. No aparece la página de error general.
- Paso 3: el listado muestra el `ErrorState` de infraestructura ("No pudimos contactar el servidor…"), **no** "No hay evaluaciones disponibles por ahora".
- Paso 5: todo vuelve a la normalidad, con el conteo correcto.
**Si no se autoriza la manipulación de la base:** validar el criterio 7 por revisión de código y dejarlo anotado en "Hallazgos".
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-011 — Teclado y lector de pantalla
**Precondición:** TC-055-001 montado.
**Datos de prueba usados:** Ana / Curso A / grupo abierto 1
**Pasos:**
1. En el detalle del curso, navegar solo con Tab hasta la tarjeta.
2. Observar el indicador de foco.
3. Presionar Enter.
4. (Opcional) Con VoiceOver activo, enfocar la tarjeta.
**Resultado esperado:** La tarjeta se alcanza con Tab, muestra un anillo de foco visible, y Enter navega al listado. El lector de pantalla la anuncia como **enlace** con el texto visible ("Evaluaciones… Tienes 1 evaluación abierta"). El chevron decorativo no se anuncia.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

### TC-055-012 — Modo claro, modo oscuro y móvil
**Precondición:** TC-055-001 montado.
**Datos de prueba usados:** Ana / Curso A / grupo abierto 1
**Pasos:**
1. Ver el detalle del curso con el sistema en modo claro.
2. Cambiar el sistema a modo oscuro (el tema sigue la preferencia del SO).
3. Reducir el ancho de la ventana a unos 375 px.
**Resultado esperado:** En ambos modos la tarjeta tiene el mismo fondo, borde y radio que "Información del curso", con texto legible y el badge con contraste correcto. En 375 px no hay desbordes horizontales y el badge no se superpone al texto. El anillo de foco se ve en ambos modos.
**Estado:** ⬜ Pendiente
**Hallazgos:** —

## Resumen de la ronda
- Aprobados: 0 — Fallidos: 0 — Pendientes: 12
- Hallazgos escalados a `docs/specs/backlog.md`: _por definir_
- Limpieza de datos de prueba: ⬜ Pendiente
